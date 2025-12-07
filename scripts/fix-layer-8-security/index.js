/**
 * Layer 8: Security Forensics
 * 
 * Post-exploitation detection, compromise scanning, and incident response.
 * 
 * CORE PRINCIPLES (following NeuroLint architecture):
 * 
 * 1. READ-ONLY BY DEFAULT: Layer 8 is primarily a detection layer.
 *    It analyzes code but does NOT modify it unless explicitly in quarantine mode.
 * 
 * 2. NEVER BREAK CODE: Even in quarantine mode, we follow the AST → Regex → Revert
 *    pattern. If validation fails, we revert to the original state.
 * 
 * 3. LAYER CONTRACT: Implements the standard NeuroLint layer interface:
 *    - analyze(code, options) - Detect issues (primary function)
 *    - transform(code, options) - Quarantine/neutralize (optional, requires explicit flag)
 * 
 * 4. INTEGRATION WITH LAYER 7: Emits securityFindings[] that Layer 7 (Adaptive)
 *    can consume for pattern learning. Layer 8 owns detection, Layer 7 observes.
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');

const DetectorOrchestrator = require('./detectors');
const { CLIReporter, JSONReporter } = require('./reporters');
const SeverityCalculator = require('./utils/severity-calculator');
const HashUtils = require('./utils/hash-utils');
const { 
  LAYER_8_VERSION, 
  DETECTION_MODES, 
  MODE_CONFIGURATIONS,
  EXCLUDED_PATHS_DEFAULT,
  SEVERITY_LEVELS
} = require('./constants');

const LAYER_INFO = {
  id: 8,
  name: 'security-forensics',
  version: LAYER_8_VERSION,
  description: 'Post-exploitation detection and incident response',
  supportsAST: true,
  isReadOnly: true
};

class Layer8SecurityForensics {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || DETECTION_MODES.STANDARD,
      verbose: options.verbose || false,
      dryRun: options.dryRun !== false,
      quarantine: options.quarantine || false,
      failOn: options.failOn || 'critical',
      exclude: options.exclude || EXCLUDED_PATHS_DEFAULT,
      include: options.include || ['**/*.{js,jsx,ts,tsx,json,mjs,cjs}'],
      ...options
    };
    
    this.detector = new DetectorOrchestrator({
      mode: this.options.mode,
      verbose: this.options.verbose,
      customSignatures: this.options.customSignatures
    });
    
    this.cliReporter = new CLIReporter({
      verbose: this.options.verbose,
      colors: this.options.colors,
      showContext: this.options.showContext
    });
    
    this.jsonReporter = new JSONReporter({
      includeContext: this.options.includeContext,
      prettyPrint: this.options.prettyPrint
    });
  }
  
  async analyze(code, options = {}) {
    const filePath = options.filename || options.filePath || 'unknown';
    const startTime = Date.now();
    
    try {
      const result = await this.detector.scanFile(code, filePath, options);
      
      const severity = SeverityCalculator.calculateOverallSeverity(result.findings);
      
      return {
        layer: LAYER_INFO.id,
        layerName: LAYER_INFO.name,
        success: true,
        issues: result.findings.map(f => ({
          type: f.signatureId,
          message: f.description,
          severity: f.severity,
          location: { line: f.line, column: f.column },
          fix: f.remediation
        })),
        securityFindings: result.findings,
        summary: {
          overallSeverity: severity.level,
          findingsCount: result.findings.length,
          breakdown: severity.breakdown,
          shouldFail: SeverityCalculator.shouldFailBuild(severity, this.options.failOn)
        },
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        layer: LAYER_INFO.id,
        layerName: LAYER_INFO.name,
        success: false,
        issues: [],
        securityFindings: [],
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }
  
  async transform(code, options = {}) {
    if (!this.options.quarantine) {
      return {
        success: true,
        code: code,
        originalCode: code,
        changeCount: 0,
        message: 'Layer 8 is read-only. Enable quarantine mode for code modification.',
        executionTime: 0
      };
    }
    
    const originalCode = code;
    const startTime = Date.now();
    
    try {
      const analysis = await this.analyze(code, options);
      
      if (analysis.securityFindings.length === 0) {
        return {
          success: true,
          code: originalCode,
          originalCode,
          changeCount: 0,
          message: 'No security issues to quarantine',
          executionTime: Date.now() - startTime
        };
      }
      
      let modifiedCode = code;
      let changeCount = 0;
      
      for (const finding of analysis.securityFindings) {
        if (finding.severity === SEVERITY_LEVELS.CRITICAL) {
          const result = this.neutralizeThreat(modifiedCode, finding);
          if (result.changed) {
            modifiedCode = result.code;
            changeCount++;
          }
        }
      }
      
      const validation = this.validateTransformation(originalCode, modifiedCode);
      
      if (validation.shouldRevert) {
        return {
          success: false,
          code: originalCode,
          originalCode,
          changeCount: 0,
          revertReason: validation.reason,
          message: 'Transformation reverted to preserve code integrity',
          executionTime: Date.now() - startTime
        };
      }
      
      return {
        success: true,
        code: modifiedCode,
        originalCode,
        changeCount,
        findings: analysis.securityFindings,
        message: `Neutralized ${changeCount} critical threats`,
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        code: originalCode,
        originalCode,
        changeCount: 0,
        error: error.message,
        message: 'Transformation failed, original code preserved',
        executionTime: Date.now() - startTime
      };
    }
  }
  
  neutralizeThreat(code, finding) {
    const lines = code.split('\n');
    const lineIndex = finding.line - 1;
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return { changed: false, code };
    }
    
    const originalLine = lines[lineIndex];
    const commentPrefix = '/* NEUROLINT-QUARANTINE: ';
    const commentSuffix = ` [${finding.signatureId}] */`;
    
    if (originalLine.includes('NEUROLINT-QUARANTINE')) {
      return { changed: false, code };
    }
    
    lines[lineIndex] = commentPrefix + originalLine + commentSuffix;
    
    return {
      changed: true,
      code: lines.join('\n')
    };
  }
  
  validateTransformation(before, after) {
    if (before === after) {
      return { shouldRevert: false, reason: 'No changes made' };
    }
    
    try {
      const parser = require('@babel/parser');
      parser.parse(after, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        strictMode: false
      });
      return { shouldRevert: false };
    } catch (error) {
      return { 
        shouldRevert: true, 
        reason: `Syntax error after transformation: ${error.message}` 
      };
    }
  }
  
  async scanCompromise(targetPath, options = {}) {
    const startTime = Date.now();
    const files = await this.getFiles(targetPath, options);
    
    if (options.verbose) {
      console.log(`Scanning ${files.length} files for indicators of compromise...`);
    }
    
    const fileContents = await Promise.all(
      files.map(async (filePath) => {
        try {
          const code = await fs.readFile(filePath, 'utf8');
          return { code, filePath };
        } catch (error) {
          return null;
        }
      })
    );
    
    const validFiles = fileContents.filter(f => f !== null);
    
    const result = await this.detector.scanMultipleFiles(validFiles, {
      concurrency: options.concurrency || 10,
      onProgress: options.onProgress
    });
    
    result.targetPath = targetPath;
    result.scanType = 'compromise-scan';
    result.mode = this.options.mode;
    
    return result;
  }
  
  async createBaseline(targetPath, options = {}) {
    const outputPath = options.output || path.join(targetPath, '.neurolint', 'security-baseline.json');
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    const hashes = await HashUtils.hashDirectory(targetPath, {
      exclude: this.options.exclude
    });
    
    const baseline = {
      version: LAYER_8_VERSION,
      created: new Date().toISOString(),
      projectRoot: path.resolve(targetPath),
      fileCount: Object.keys(hashes).length,
      files: hashes,
      config: {
        excludePatterns: this.options.exclude
      }
    };
    
    await fs.writeFile(outputPath, JSON.stringify(baseline, null, 2), 'utf8');
    
    return {
      success: true,
      baselinePath: outputPath,
      fileCount: baseline.fileCount,
      created: baseline.created
    };
  }
  
  async compareBaseline(targetPath, baselinePath, options = {}) {
    const baselineContent = await fs.readFile(baselinePath, 'utf8');
    const baseline = JSON.parse(baselineContent);
    
    const currentHashes = await HashUtils.hashDirectory(targetPath, {
      exclude: this.options.exclude
    });
    
    const comparison = HashUtils.compareHashes(baseline.files, currentHashes);
    
    return {
      success: true,
      baselineDate: baseline.created,
      comparison,
      summary: {
        added: comparison.added.length,
        removed: comparison.removed.length,
        modified: comparison.modified.length,
        unchanged: comparison.unchanged.length,
        hasChanges: comparison.hasChanges
      }
    };
  }
  
  async getFiles(targetPath, options = {}) {
    const files = [];
    const include = options.include || this.options.include;
    const exclude = options.exclude || this.options.exclude;
    
    async function walkDir(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(targetPath, fullPath);
          
          const shouldExclude = exclude.some(pattern => {
            if (pattern.includes('**')) {
              const simplePattern = pattern
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*');
              return new RegExp(simplePattern).test(relativePath);
            }
            return relativePath.includes(pattern.replace(/\*\*/g, '').replace(/\*/g, ''));
          });
          
          if (shouldExclude) continue;
          
          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs', '.cjs'];
            
            if (validExtensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
      }
    }
    
    await walkDir(targetPath);
    return files;
  }
  
  generateCLIReport(scanResult, options = {}) {
    return this.cliReporter.generateReport(scanResult, options);
  }
  
  generateJSONReport(scanResult, options = {}) {
    return this.jsonReporter.generateReport(scanResult, options);
  }
  
  printReport(scanResult, options = {}) {
    return this.cliReporter.printReport(scanResult, options);
  }
  
  static getLayerInfo() {
    return LAYER_INFO;
  }
}

module.exports = Layer8SecurityForensics;
module.exports.LAYER_INFO = LAYER_INFO;
module.exports.DETECTION_MODES = DETECTION_MODES;
module.exports.SEVERITY_LEVELS = SEVERITY_LEVELS;
