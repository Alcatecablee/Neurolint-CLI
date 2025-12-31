#!/usr/bin/env node

/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */



/**
 * Layer 7: Adaptive Pattern Learning
 * Learns from previous layer transformations and applies patterns
 */

const fs = require('fs').promises;
const path = require('path');
const BackupManager = require('../backup-manager');

// Import new pattern extractors
const Layer1Extractor = require('./pattern-extraction/layer-1-extractor');
const Layer3Extractor = require('./pattern-extraction/layer-3-extractor');
const GeneralizedExtractor = require('./pattern-extraction/generalized-extractor');

/**
 * Cross-Session Learning Manager (Issue #4)
 * Loads transformation history and extracts patterns from previous sessions
 */
class CrossSessionLearningManager {
  constructor() {
    this.logPath = path.join(process.cwd(), '.neurolint', 'transformation-log.json');
    this.lastLoadTime = 0;
    this.checkInterval = 60000; // Check every 60 seconds
  }

  async loadCrossSessionPatterns(ruleStore) {
    try {
      const log = await this._loadLog();
      if (!log || !log.entries || log.entries.length === 0) return [];

      const learnedPatterns = [];
      const now = Date.now();

      // Only process entries we haven't processed before
      const newEntries = log.entries.filter(e => e.timestamp > this.lastLoadTime);
      
      if (newEntries.length === 0) return [];

      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stdout.write(`[DEBUG] Loading ${newEntries.length} cross-session transformations\n`);
      }

      for (const entry of newEntries) {
        try {
          // Extract patterns from historical transformation
          const patterns = await extractPatterns(
            entry.beforeCode,
            entry.afterCode,
            entry.layerId
          );

          for (const pattern of patterns) {
            await ruleStore.addRule(pattern);
            learnedPatterns.push({
              pattern: pattern.description,
              layerId: entry.layerId,
              file: entry.filePath
            });
          }
        } catch (error) {
          // Skip failed entries
          if (process.env.NEUROLINT_DEBUG === 'true') {
            process.stderr.write(`[DEBUG] Failed to extract pattern from log entry: ${error.message}\n`);
          }
        }
      }

      this.lastLoadTime = now;

      if (process.env.NEUROLINT_DEBUG === 'true' && learnedPatterns.length > 0) {
        process.stdout.write(`[DEBUG] Learned ${learnedPatterns.length} patterns from cross-session history\n`);
      }

      return learnedPatterns;
    } catch (error) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] Cross-session learning failed: ${error.message}\n`);
      }
      return [];
    }
  }

  async _loadLog() {
    try {
      const data = await fs.readFile(this.logPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return { version: '1.0', entries: [] };
    }
  }

  async clearHistory() {
    try {
      await fs.writeFile(this.logPath, JSON.stringify({ version: '1.0', entries: [] }, null, 2));
      this.lastLoadTime = 0;
    } catch (error) {
      // Ignore errors
    }
  }
}

const crossSessionManager = new CrossSessionLearningManager();

/**
 * Rule Store for managing learned patterns
 */
class RuleStore {
  constructor() {
    this.rules = [];
    this.storagePath = path.join(process.cwd(), '.neurolint', 'learned-rules.json');
  }

  // Ensure rules is always an array
  get rules() {
    return this._rules || [];
  }

  set rules(value) {
    this._rules = Array.isArray(value) ? value : [];
  }

  async load() {
    try {
      const data = await fs.readFile(this.storagePath, 'utf8');
      this.rules = JSON.parse(data, (key, value) => {
        if (key === 'pattern' && typeof value === 'string' && value.startsWith('/')) {
          const [, pattern, flags] = value.match(/^\/(.*)\/([a-z]*)$/) || [];
          return new RegExp(pattern, flags || '');
        }
        return value;
      });
    } catch (error) {
      this.rules = [];
    }
  }

  async save() {
    try {
      const dir = path.dirname(this.storagePath);
      await fs.mkdir(dir, { recursive: true });
      const serialized = JSON.stringify(this.rules, (key, value) => {
        if (key === 'pattern' && value instanceof RegExp) return value.toString();
        return value;
      }, 2);
      await fs.writeFile(this.storagePath, serialized);
    } catch (error) {
      throw new Error(`Failed to save learned rules: ${error.message}`);
    }
  }

  async addRule(rule) {
    // Validate rule before adding
    if (!rule || !rule.pattern || !rule.description) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] Invalid rule skipped: ${JSON.stringify(rule)}\n`);
      }
      return;
    }

    const existing = this.rules.find(r => {
      try {
        return r.pattern && r.pattern.toString() === rule.pattern.toString();
      } catch (e) {
        return false;
      }
    });

    if (existing) {
      existing.frequency++;
      existing.confidence = Math.min(1, existing.confidence + 0.05);
    } else {
      this.rules.push(rule);
    }
    await this.save();
  }

  async applyRules(code) {
    let transformedCode = code;
    const appliedRules = [];
    const minConfidence = 0.7;

    // Ensure rules is an array and filter safely
    const applicableRules = Array.isArray(this.rules) 
      ? this.rules.filter(r => r && r.confidence >= minConfidence)
      : [];

    for (const rule of applicableRules) {
      try {
        if (rule.pattern instanceof RegExp) {
          if (typeof rule.replacement === 'string' && rule.pattern.test(transformedCode)) {
            transformedCode = transformedCode.replace(rule.pattern, rule.replacement);
            appliedRules.push(rule.description);
          } else if (typeof rule.replacement === 'function' && rule.pattern.test(transformedCode)) {
            transformedCode = transformedCode.replace(rule.pattern, rule.replacement);
            appliedRules.push(rule.description);
          }
        }
      } catch (error) {
        // Log rule application errors in verbose/debug mode
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stderr.write(`[DEBUG] Rule application failed for "${rule.description}": ${error.message}\n`);
        }
      }
    }

    return { transformedCode, appliedRules };
  }

  async deleteRule(id) {
    if (id >= 0 && id < this.rules.length) {
      this.rules.splice(id, 1);
      await this.save();
      return true;
    }
    return false;
  }

  async resetRules() {
    this.rules = [];
    await this.save();
  }

  async editRule(id, updates) {
    if (id >= 0 && id < this.rules.length) {
      Object.assign(this.rules[id], updates);
      await this.save();
      return true;
    }
    return false;
  }

  async exportRules(filePath) {
    const data = JSON.stringify(this.rules, (key, value) => {
      if (key === 'pattern' && value instanceof RegExp) return value.toString();
      return value;
    }, 2);
    await fs.writeFile(filePath, data);
  }

  async importRules(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    this.rules = JSON.parse(data, (key, value) => {
      if (key === 'pattern' && typeof value === 'string' && value.startsWith('/')) {
        const [, pattern, flags] = value.match(/^\/(.*)\/([a-z]*)$/) || [];
        return new RegExp(pattern, flags || '');
      }
      return value;
    });
    await this.save();
  }
}

async function isRegularFile(filePath) {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

/**
 * Transform code using adaptive pattern learning
 */
async function transform(code, options = {}) {
  const { dryRun = false, verbose = false, filePath = process.cwd(), previousResults = [] } = options;
  const results = [];
  let changeCount = 0;
  let updatedCode = code;
  const changes = [];

  try {
    const existsAsFile = await isRegularFile(filePath);
    if (existsAsFile && !dryRun) {
      try {
        const backupManager = new BackupManager({
          backupDir: '.neurolint-backups',
          maxBackups: 10
        });
        
        const backupResult = await backupManager.createBackup(filePath, 'layer-7-adaptive');
        
        if (backupResult.success) {
          results.push({ type: 'backup', file: filePath, success: true, backupPath: backupResult.backupPath });
          if (verbose) process.stdout.write(`Created centralized backup: ${path.basename(backupResult.backupPath)}\n`);
        } else {
          if (verbose) process.stderr.write(`Warning: Could not create backup: ${backupResult.error}\n`);
        }
      } catch (error) {
        if (verbose) process.stderr.write(`Warning: Backup creation failed: ${error.message}\n`);
      }
    }

    if (!code.trim()) {
      results.push({ type: 'empty', file: filePath, success: false, error: 'Empty input provided' });
      return {
        success: false,
        code,
        originalCode: code,
        changeCount: 0,
        results,
        changes
      };
    }

    const ruleStore = new RuleStore();
    await ruleStore.load();

    // ISSUE #4: Load patterns from cross-session transformation history
    const crossSessionPatterns = await crossSessionManager.loadCrossSessionPatterns(ruleStore);
    if (crossSessionPatterns.length > 0) {
      results.push({
        type: 'cross-session-learn',
        file: filePath,
        success: true,
        details: `Loaded ${crossSessionPatterns.length} patterns from transformation history`
      });
      changes.push({
        type: 'cross-session-learn',
        description: `Loaded ${crossSessionPatterns.length} patterns from previous sessions`,
        location: null
      });
    }

    // Learn from previous layer results
    if (Array.isArray(previousResults)) {
      for (const result of previousResults.filter(r => r && r.success && (r.changes > 0 || r.changeCount > 0))) {
        const patterns = await extractPatterns(result.originalCode || code, result.code || code, result.layerId || result.layer);
        for (const pattern of patterns) {
          await ruleStore.addRule(pattern);
          results.push({
            type: 'learn',
            file: filePath,
            success: true,
            details: `Learned pattern: ${pattern.description} from Layer ${result.layerId || result.layer}`
          });
          changes.push({ type: 'learn', description: pattern.description, location: null });
        }
      }

      // Learn from Layer 8 security findings (Layer 8 → Layer 7 integration)
      for (const result of previousResults.filter(r => r && Array.isArray(r.securityFindings) && r.securityFindings.length > 0)) {
        const securityPatterns = extractSecurityPatterns(result.securityFindings);
        for (const pattern of securityPatterns) {
          await ruleStore.addRule(pattern);
          results.push({
            type: 'learn-security',
            file: filePath,
            success: true,
            details: `Learned security pattern: ${pattern.description} from Layer 8`
          });
          changes.push({ type: 'learn-security', description: pattern.description, location: null });
        }
      }
    }

    // Apply learned rules
    const applyResult = await ruleStore.applyRules(updatedCode);
    updatedCode = applyResult.transformedCode;
    changeCount += applyResult.appliedRules.length;
    applyResult.appliedRules.forEach(rule => {
      results.push({
        type: 'apply',
        file: filePath,
        success: true,
        changes: 1,
        details: `Applied learned rule: ${rule}`
      });
      changes.push({ type: 'apply', description: rule, location: null });
    });

    // Add general adaptive suggestions for any file
    // NOTE: Suggestions are tracked separately and do NOT increment changeCount
    // to avoid inflating metrics with non-transformative suggestions
    const suggestions = [];
    
    if (updatedCode.includes('console.') && !updatedCode.includes('// [NeuroLint]')) {
      suggestions.push({ 
        type: 'AdaptiveSuggestion', 
        description: 'Console statements detected - consider removing for production', 
        location: null 
      });
    }

    if (updatedCode.includes('style={{') && updatedCode.includes('}}')) {
      suggestions.push({ 
        type: 'AdaptiveSuggestion', 
        description: 'Inline styles detected - consider using CSS classes for better performance', 
        location: null 
      });
    }
    
    // Add suggestions to changes array but don't count them as actual changes
    changes.push(...suggestions);

    updatedCode = updatedCode.replace(/\r\n/g, '\n');

    if (dryRun) {
      if (verbose && changeCount > 0) {
        process.stdout.write(`[SUCCESS] Layer 7 identified ${changeCount} adaptive pattern applications (dry-run)\n`);
      }
      return {
        success: true,
        code: updatedCode,
        originalCode: code,
        changeCount,
        results,
        changes
      };
    }

    if (changeCount > 0 && existsAsFile) {
      await fs.writeFile(filePath, updatedCode);
      results.push({ type: 'write', file: filePath, success: true, changes: changeCount });
    }

    if (verbose && changeCount > 0) {
      process.stdout.write(`[SUCCESS] Layer 7 applied ${changeCount} adaptive patterns to ${path.basename(filePath)}\n`);
    }

    return {
      success: true,
      code: updatedCode,
      originalCode: code,
      changeCount,
      results,
      changes
    };
  } catch (error) {
    if (verbose) process.stderr.write(`[ERROR] Layer 7 failed: ${error.message}\n`);
    return {
      success: false,
      code,
      originalCode: code,
      changeCount: 0,
      error: error.message,
      results,
      changes
    };
  }
}

/**
 * Enhanced extractPatterns with AST-based pattern extraction
 * Supports all layers with generalized learning capability
 */
async function extractPatterns(before, after, layerId) {
  const patterns = [];
  if (!before || !after || before === after) return patterns;
  
  try {
    // Determine file type for appropriate extractor
    const fileType = detectFileType(before, after);
    
    // NEW: Use specialized extractors for Layer 1 and Layer 3
    if (layerId === 1 && (fileType === 'config' || fileType === 'json')) {
      // Layer 1: Config file patterns
      try {
        const layer1Extractor = new Layer1Extractor();
        const configPatterns = await layer1Extractor.extractPatterns(before, after);
        patterns.push(...configPatterns);
        
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stdout.write(`[DEBUG] Layer 1 extracted ${configPatterns.length} config patterns\n`);
        }
      } catch (error) {
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stderr.write(`[DEBUG] Layer 1 extractor failed: ${error.message}\n`);
        }
      }
    }
    
    if (layerId === 3 && (fileType === 'jsx' || fileType === 'tsx' || fileType === 'js')) {
      // Layer 3: Component transformation patterns
      try {
        const layer3Extractor = new Layer3Extractor();
        const componentPatterns = await layer3Extractor.extractPatterns(before, after);
        patterns.push(...componentPatterns);
        
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stdout.write(`[DEBUG] Layer 3 extracted ${componentPatterns.length} component patterns\n`);
        }
      } catch (error) {
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stderr.write(`[DEBUG] Layer 3 extractor failed: ${error.message}\n`);
        }
      }
    }
    
    // NEW: Use generalized extractor for other layers or as fallback
    if ((fileType === 'js' || fileType === 'jsx' || fileType === 'ts' || fileType === 'tsx') &&
        patterns.length === 0) {
      try {
        const generalizedExtractor = new GeneralizedExtractor();
        const genericPatterns = await generalizedExtractor.extractGenericPatterns(before, after, layerId);
        patterns.push(...genericPatterns);
        
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stdout.write(`[DEBUG] Generalized extractor found ${genericPatterns.length} patterns\n`);
        }
      } catch (error) {
        if (process.env.NEUROLINT_DEBUG === 'true') {
          process.stderr.write(`[DEBUG] Generalized extractor failed: ${error.message}\n`);
        }
      }
    }
    
    // FALLBACK: Legacy hardcoded patterns (backward compatibility)
    const legacyPatterns = extractLegacyPatterns(before, after, layerId);
    patterns.push(...legacyPatterns);
    
    // Deduplicate patterns
    return deduplicatePatterns(patterns);
    
  } catch (error) {
    if (process.env.NEUROLINT_DEBUG === 'true') {
      process.stderr.write(`[DEBUG] extractPatterns error: ${error.message}\n`);
    }
    // Fallback to legacy extraction
    return extractLegacyPatterns(before, after, layerId);
  }
}

/**
 * Detect file type from content
 * @param {string} before - Original content
 * @param {string} after - Modified content
 * @returns {string} File type
 */
function detectFileType(before, after) {
  const content = before + after;
  
  // Config files
  if (content.includes('compilerOptions') || content.includes('"strict"')) {
    return 'config';
  }
  if (content.includes('module.exports') && content.includes('next')) {
    return 'config';
  }
  if (content.includes('"scripts"') || content.includes('"dependencies"')) {
    return 'json';
  }
  
  // JSX/TSX
  if (content.includes('<') && content.includes('>') && content.includes('React')) {
    if (content.includes('interface') || content.includes(': React.')) {
      return 'tsx';
    }
    return 'jsx';
  }
  
  // TypeScript
  if (content.includes('interface') || content.includes('type ') || content.includes(': string')) {
    return 'ts';
  }
  
  // Default to JavaScript
  return 'js';
}

/**
 * Legacy pattern extraction (backward compatibility)
 * Preserves existing hardcoded patterns
 */
function extractLegacyPatterns(before, after, layerId) {
  const patterns = [];
  
  try {
    // Target small changed snippets for learning
    const beforeSnip = before.slice(0, 2000);
    const afterSnip = after.slice(0, 2000);
    
    if (beforeSnip !== afterSnip) {
      // Learn Layer 5 pattern: adding 'use client' directive
      if (layerId === 5 && afterSnip.includes("'use client'") && !beforeSnip.includes("'use client'")) {
        // Only add pattern for files with React hooks (useState, useEffect, etc.)
        const hasReactHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref|LayoutEffect|ImperativeHandle|DebugValue)\s*\(/.test(afterSnip);
        
        if (hasReactHooks) {
          patterns.push({
            description: 'Add use client directive for React components with hooks',
            pattern: /^(import\s+.*?from\s+['"]react['"];?\s*\n)/m,
            replacement: "'use client';\n$1",
            confidence: 0.9,
            frequency: 1,
            layer: layerId,
            category: 'legacy-layer5'
          });
        }
        
        const hasClientImports = /import\s*\{[^}]*(useState|useEffect|useContext|useReducer)[^}]*\}\s*from\s+['"]react['"]/.test(afterSnip);
        if (hasClientImports) {
          patterns.push({
            description: 'Add use client directive for files importing React hooks',
            pattern: /^(import\s*\{[^}]*(useState|useEffect|useContext|useReducer)[^}]*\}\s*from\s+['"]react['"];?\s*\n)/m,
            replacement: "'use client';\n$1",
            confidence: 0.85,
            frequency: 1,
            layer: layerId,
            category: 'legacy-layer5'
          });
        }
      }
      
      // Learn Layer 6 pattern: adding error boundaries or memoization
      if (layerId === 6) {
        if (afterSnip.includes('ErrorBoundary') && !beforeSnip.includes('ErrorBoundary')) {
          patterns.push({
            description: 'Wrap components with ErrorBoundary',
            pattern: /^(function\s+\w+\([^)]*\)\s*\{[\s\S]*?return\s*<)([^>]+)(>[\s\S]*?<\/\2>[\s\S]*?\})/m,
            replacement: '$1ErrorBoundary>$2$3</ErrorBoundary>',
            confidence: 0.8,
            frequency: 1,
            layer: layerId,
            category: 'legacy-layer6'
          });
        }
        
        if (afterSnip.includes('React.memo') && !beforeSnip.includes('React.memo')) {
          patterns.push({
            description: 'Memoize React components',
            pattern: /^(function\s+(\w+)\([^)]*\)\s*\{[\s\S]*?\n)(export\s+default\s+\2;?)$/m,
            replacement: 'const Memoized = React.memo($2);\n$1$3',
            confidence: 0.8,
            frequency: 1,
            layer: layerId,
            category: 'legacy-layer6'
          });
        }
      }
      
      // Generic console removal rule
      if (afterSnip.includes('// [NeuroLint] Removed console') && beforeSnip.includes('console.')) {
        patterns.push({
          description: 'Remove console statements',
          pattern: /console\.(log|info|warn|error|debug)\([^\)]*\);?/g,
          replacement: (m) => `// [NeuroLint] Removed ${m.replace(/\(.*/, '')}: ...`,
          confidence: 0.8,
          frequency: 1,
          layer: layerId || 0,
          category: 'legacy-console'
        });
      }
      
      // Layer 4: typeof window checks (hydration guards)
      if (layerId === 4) {
        if (afterSnip.includes('typeof window') && !beforeSnip.includes('typeof window')) {
          patterns.push({
            description: 'Add typeof window check for hydration safety',
            pattern: /if\s*\(/,
            replacement: 'if (typeof window !== "undefined" && ',
            confidence: 0.75,
            frequency: 1,
            layer: layerId,
            category: 'legacy-layer4'
          });
        }
      }
    }
  } catch (error) {
    if (process.env.NEUROLINT_DEBUG === 'true') {
      process.stderr.write(`[DEBUG] extractLegacyPatterns error: ${error.message}\n`);
    }
  }
  
  return patterns;
}

/**
 * Deduplicate patterns based on description and category
 * @param {Array} patterns - Array of patterns
 * @returns {Array} Deduplicated patterns
 */
function deduplicatePatterns(patterns) {
  const seen = new Map();
  const unique = [];
  
  patterns.forEach(pattern => {
    const key = `${pattern.description}:${pattern.category || 'unknown'}`;
    
    if (!seen.has(key)) {
      seen.set(key, true);
      unique.push(pattern);
    } else {
      // Pattern already exists, increase its frequency
      const existing = unique.find(p => 
        p.description === pattern.description && 
        p.category === pattern.category
      );
      if (existing) {
        existing.frequency = (existing.frequency || 1) + 1;
        existing.confidence = Math.min(0.95, (existing.confidence || 0.7) + 0.02);
      }
    }
  });
  
  return unique;
}

/**
 * Extract security patterns from Layer 8 security findings
 * This enables Layer 7 to learn from Layer 8's security analysis
 * @param {Array} securityFindings - Array of security findings from Layer 8
 * @returns {Array} - Array of learnable patterns
 */
function extractSecurityPatterns(securityFindings) {
  const patterns = [];
  
  if (!Array.isArray(securityFindings) || securityFindings.length === 0) {
    return patterns;
  }
  
  try {
    for (const finding of securityFindings) {
      // Only learn from high-severity findings to avoid noise
      const severity = (finding.severity || '').toLowerCase();
      if (severity !== 'critical' && severity !== 'high') {
        continue;
      }
      
      // Create pattern based on finding type
      const signatureId = finding.signatureId || finding.type || 'unknown';
      const description = finding.description || finding.message || signatureId;
      
      // Generate regex pattern from the finding context if available
      let patternRegex = null;
      let replacement = null;
      
      // Handle common security patterns
      if (signatureId.includes('eval') || description.toLowerCase().includes('eval')) {
        patternRegex = /\beval\s*\([^)]+\)/g;
        replacement = '/* SECURITY: eval() removed by NeuroLint */';
      } else if (signatureId.includes('innerHTML') || description.toLowerCase().includes('innerhtml')) {
        patternRegex = /\.innerHTML\s*=\s*[^;]+/g;
        replacement = '.textContent = /* SECURITY: innerHTML replaced */';
      } else if (signatureId.includes('dangerouslySetInnerHTML') || description.toLowerCase().includes('dangerouslysetinnerhtml')) {
        patternRegex = /dangerouslySetInnerHTML\s*=\s*\{\s*\{[^}]+\}\s*\}/g;
        replacement = '/* SECURITY: dangerouslySetInnerHTML removed */';
      } else if (signatureId.includes('hardcoded') || description.toLowerCase().includes('hardcoded')) {
        // Detect hardcoded secrets/credentials
        patternRegex = /(password|secret|key|token|apikey|api_key)\s*[:=]\s*['"][^'"]+['"]/gi;
        replacement = '$1: process.env.$1 /* SECURITY: moved to env var */';
      } else if (signatureId.includes('exec') || description.toLowerCase().includes('command injection')) {
        patternRegex = /child_process\.(exec|execSync)\s*\([^)]+\)/g;
        replacement = '/* SECURITY: exec removed - use spawn with validated input */';
      } else if (signatureId.includes('sql') || description.toLowerCase().includes('sql injection')) {
        // SQL injection prevention hint
        patternRegex = /`[^`]*\$\{[^}]+\}[^`]*`/g;
        replacement = '/* SECURITY: Use parameterized queries instead of template literals */';
      }
      
      // Only add if we have a valid pattern
      if (patternRegex) {
        patterns.push({
          description: `Security: ${description}`,
          pattern: patternRegex,
          replacement: replacement,
          confidence: 0.95,
          frequency: 1,
          layer: 8,
          securityRelated: true,
          severity: severity,
          signatureId: signatureId
        });
      }
      
      // Also create a more generic pattern using the finding's context if available
      if (finding.context || finding.match) {
        const contextPattern = escapeRegex(finding.match || finding.context);
        if (contextPattern && contextPattern.length > 5 && contextPattern.length < 200) {
          patterns.push({
            description: `Security context: ${description}`,
            pattern: new RegExp(contextPattern, 'g'),
            replacement: `/* SECURITY FLAGGED: ${signatureId} */`,
            confidence: 0.85,
            frequency: 1,
            layer: 8,
            securityRelated: true,
            severity: severity
          });
        }
      }
    }
  } catch (error) {
    // Log security pattern extraction errors in debug mode
    if (process.env.NEUROLINT_DEBUG === 'true') {
      process.stderr.write(`[DEBUG] extractSecurityPatterns error: ${error.message}\n`);
    }
  }
  
  return patterns;
}

/**
 * Escape special regex characters in a string
 * @param {string} str - String to escape
 * @returns {string} - Escaped string safe for use in RegExp
 */
function escapeRegex(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { 
  transform, 
  RuleStore, 
  extractPatterns, 
  extractSecurityPatterns,
  CrossSessionLearningManager,
  crossSessionManager
};