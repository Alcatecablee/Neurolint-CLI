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
    const existing = this.rules.find(r => r.pattern.toString() === rule.pattern.toString());
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

    // Learn from previous layer results
    if (Array.isArray(previousResults)) {
      for (const result of previousResults.filter(r => r && r.success && (r.changes > 0 || r.changeCount > 0))) {
        const patterns = extractPatterns(result.originalCode || code, result.code || code, result.layerId || result.layer);
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

function extractPatterns(before, after, layerId) {
  const patterns = [];
  if (!before || !after || before === after) return patterns;
  
  try {
    // Target small changed snippets for learning
    const beforeSnip = before.slice(0, 2000);
    const afterSnip = after.slice(0, 2000);
    
    if (beforeSnip !== afterSnip) {
      // Learn Layer 5 pattern: adding 'use client' directive
      if (layerId === 5 && afterSnip.includes("'use client'") && !beforeSnip.includes("'use client'")) {
        // Only add pattern for files with React hooks (useState, useEffect, etc.)
        // This ensures we only apply 'use client' to files that actually need it
        const hasReactHooks = /use(State|Effect|Context|Reducer|Callback|Memo|Ref|LayoutEffect|ImperativeHandle|DebugValue)\s*\(/.test(afterSnip);
        
        if (hasReactHooks) {
          patterns.push({
            description: 'Add use client directive for React components with hooks',
            pattern: /^(import\s+.*?from\s+['"]react['"];?\s*\n)/m,
            replacement: "'use client';\n$1",
            confidence: 0.9,
            frequency: 1,
            layer: layerId
          });
        }
        
        // Pattern for files importing client-side hooks from react
        const hasClientImports = /import\s*\{[^}]*(useState|useEffect|useContext|useReducer)[^}]*\}\s*from\s+['"]react['"]/.test(afterSnip);
        if (hasClientImports) {
          patterns.push({
            description: 'Add use client directive for files importing React hooks',
            pattern: /^(import\s*\{[^}]*(useState|useEffect|useContext|useReducer)[^}]*\}\s*from\s+['"]react['"];?\s*\n)/m,
            replacement: "'use client';\n$1",
            confidence: 0.85,
            frequency: 1,
            layer: layerId
          });
        }
        
        // NOTE: Removed the overly broad /^/ pattern that would match ANY file
        // and add 'use client' indiscriminately. This was a bug that could corrupt
        // server components and non-React files.
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
            layer: layerId
          });
        }
        
        if (afterSnip.includes('React.memo') && !beforeSnip.includes('React.memo')) {
          patterns.push({
            description: 'Memoize React components',
            pattern: /^(function\s+(\w+)\([^)]*\)\s*\{[\s\S]*?\n)(export\s+default\s+\2;?)$/m,
            replacement: 'const Memoized = React.memo($2);\n$1$3',
            confidence: 0.8,
            frequency: 1,
            layer: layerId
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
          layer: layerId || 0
        });
      }
    }
  } catch (error) {
    // Log extraction errors in debug mode for troubleshooting
    if (process.env.NEUROLINT_DEBUG === 'true') {
      process.stderr.write(`[DEBUG] extractPatterns error: ${error.message}\n`);
    }
  }
  
  return patterns;
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

module.exports = { transform, RuleStore, extractPatterns, extractSecurityPatterns };