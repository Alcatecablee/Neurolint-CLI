/**
 * Layer 8: Security Forensics - Detector Orchestrator
 * 
 * Coordinates all detection engines and aggregates findings.
 * Implements the NeuroLint pattern of AST-first with regex fallback,
 * but adapted for security scanning (read-only, never modifies code).
 */

'use strict';

const SignatureAnalyzer = require('./signature-analyzer');
const { DETECTION_MODES, MODE_CONFIGURATIONS, SEVERITY_LEVELS } = require('../constants');

class DetectorOrchestrator {
  constructor(options = {}) {
    this.mode = options.mode || DETECTION_MODES.STANDARD;
    this.verbose = options.verbose || false;
    this.config = MODE_CONFIGURATIONS[this.mode];
    
    this.signatureAnalyzer = new SignatureAnalyzer({
      verbose: this.verbose,
      customSignatures: options.customSignatures || [],
      contextLines: options.contextLines || 3
    });
    
    this.stats = {
      filesScanned: 0,
      filesSkipped: 0,
      totalFindings: 0,
      scanStartTime: null,
      scanEndTime: null
    };
  }
  
  async scanFile(code, filePath, options = {}) {
    const startTime = Date.now();
    const allFindings = [];
    const detectorResults = {};
    
    if (code.length > this.config.maxFileSize) {
      return {
        findings: [],
        scanned: false,
        reason: `File exceeds size limit (${Math.round(code.length / 1024 / 1024)}MB > ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB)`,
        executionTime: Date.now() - startTime
      };
    }
    
    if (this.config.enabledDetectors.includes('signature')) {
      const signatureResult = this.signatureAnalyzer.analyze(code, filePath, options);
      detectorResults.signature = signatureResult;
      
      if (signatureResult.findings) {
        allFindings.push(...signatureResult.findings);
      }
    }
    
    if (this.config.enabledDetectors.includes('behavioral')) {
      const behavioralResult = this.analyzeBehavioral(code, filePath);
      detectorResults.behavioral = behavioralResult;
      
      if (behavioralResult.findings) {
        allFindings.push(...behavioralResult.findings);
      }
    }
    
    const deduplicatedFindings = this.deduplicateFindings(allFindings);
    
    this.stats.filesScanned++;
    this.stats.totalFindings += deduplicatedFindings.length;
    
    return {
      findings: deduplicatedFindings,
      scanned: true,
      detectorResults,
      executionTime: Date.now() - startTime,
      filePath
    };
  }
  
  analyzeBehavioral(code, filePath) {
    const findings = [];
    const startTime = Date.now();
    
    const behavioralPatterns = [
      {
        id: 'BEHAV-001',
        name: 'Excessive Obfuscation Score',
        check: (code) => {
          const unicodeEscapes = (code.match(/\\u[0-9a-fA-F]{4}/g) || []).length;
          const hexEscapes = (code.match(/\\x[0-9a-fA-F]{2}/g) || []).length;
          const totalEscapes = unicodeEscapes + hexEscapes;
          const codeLength = code.length;
          const ratio = totalEscapes / (codeLength / 100);
          
          return ratio > 5;
        },
        severity: SEVERITY_LEVELS.MEDIUM,
        description: 'Code has unusually high obfuscation ratio',
        remediation: 'Review and deobfuscate the code to understand its purpose'
      },
      {
        id: 'BEHAV-002',
        name: 'Multiple Dangerous Imports',
        check: (code) => {
          const dangerousModules = ['child_process', 'net', 'dgram', 'cluster', 'vm'];
          let count = 0;
          
          for (const mod of dangerousModules) {
            if (code.includes(`require('${mod}')`) || code.includes(`require("${mod}")`)) {
              count++;
            }
            if (code.includes(`from '${mod}'`) || code.includes(`from "${mod}"`)) {
              count++;
            }
          }
          
          return count >= 2;
        },
        severity: SEVERITY_LEVELS.HIGH,
        description: 'Multiple dangerous Node.js modules imported together',
        remediation: 'Verify all dangerous module imports are necessary'
      },
      {
        id: 'BEHAV-003',
        name: 'Suspicious Variable Names',
        check: (code) => {
          const suspiciousNames = [
            /\b(?:backdoor|payload|exploit|shell|hack|malware|trojan|keylog|rootkit)\b/gi
          ];
          
          for (const pattern of suspiciousNames) {
            if (pattern.test(code)) {
              return true;
            }
          }
          return false;
        },
        severity: SEVERITY_LEVELS.MEDIUM,
        description: 'Suspicious variable or function names detected',
        remediation: 'Review code for malicious intent'
      },
      {
        id: 'BEHAV-004',
        name: 'Environment Credential Access',
        check: (code) => {
          const credentialPatterns = [
            /process\.env\.(PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL|AUTH)/gi,
            /process\.env\[['"](?:PASSWORD|SECRET|KEY|TOKEN|CREDENTIAL|AUTH)/gi
          ];
          
          let hasCredentialAccess = false;
          let hasNetworkCall = false;
          
          for (const pattern of credentialPatterns) {
            if (pattern.test(code)) {
              hasCredentialAccess = true;
              break;
            }
          }
          
          if (/(?:fetch|axios|http|https|request)\s*\(/i.test(code)) {
            hasNetworkCall = true;
          }
          
          return hasCredentialAccess && hasNetworkCall;
        },
        severity: SEVERITY_LEVELS.CRITICAL,
        description: 'Credential access combined with network calls - potential exfiltration',
        remediation: 'Review credential handling and network request destinations'
      },
      {
        id: 'BEHAV-005',
        name: 'Dynamic Code Generation',
        check: (code) => {
          const dynamicPatterns = [
            /eval\s*\(/g,
            /new\s+Function\s*\(/g,
            /setTimeout\s*\(\s*['"]/g,
            /setInterval\s*\(\s*['"]/g
          ];
          
          let count = 0;
          for (const pattern of dynamicPatterns) {
            const matches = code.match(pattern);
            if (matches) {
              count += matches.length;
            }
          }
          
          return count >= 2;
        },
        severity: SEVERITY_LEVELS.HIGH,
        description: 'Multiple dynamic code generation patterns detected',
        remediation: 'Replace dynamic code with static implementations'
      }
    ];
    
    for (const pattern of behavioralPatterns) {
      try {
        if (pattern.check(code)) {
          findings.push({
            id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            signatureId: pattern.id,
            signatureName: pattern.name,
            severity: pattern.severity,
            category: 'behavioral',
            file: filePath,
            line: 1,
            column: 1,
            matchedText: '[Behavioral Pattern]',
            description: pattern.description,
            remediation: pattern.remediation,
            confidence: 0.75,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        if (this.verbose) {
          console.error(`Behavioral check ${pattern.id} failed:`, error.message);
        }
      }
    }
    
    return {
      findings,
      scanned: true,
      executionTime: Date.now() - startTime
    };
  }
  
  deduplicateFindings(findings) {
    const seen = new Map();
    const deduplicated = [];
    
    for (const finding of findings) {
      const key = `${finding.signatureId}:${finding.file}:${finding.line}`;
      
      if (!seen.has(key)) {
        seen.set(key, true);
        deduplicated.push(finding);
      }
    }
    
    return deduplicated;
  }
  
  async scanMultipleFiles(files, options = {}) {
    this.stats.scanStartTime = Date.now();
    
    const allFindings = [];
    const fileResults = [];
    
    const concurrency = options.concurrency || 10;
    
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      
      const batchResults = await Promise.all(
        batch.map(async ({ code, filePath }) => {
          try {
            return await this.scanFile(code, filePath, options);
          } catch (error) {
            this.stats.filesSkipped++;
            return {
              findings: [],
              scanned: false,
              error: error.message,
              filePath
            };
          }
        })
      );
      
      for (const result of batchResults) {
        fileResults.push(result);
        if (result.findings) {
          allFindings.push(...result.findings);
        }
      }
      
      if (options.onProgress) {
        options.onProgress({
          processed: Math.min(i + concurrency, files.length),
          total: files.length,
          currentFindings: allFindings.length
        });
      }
    }
    
    this.stats.scanEndTime = Date.now();
    
    return {
      findings: allFindings,
      fileResults,
      stats: {
        ...this.stats,
        totalExecutionTime: this.stats.scanEndTime - this.stats.scanStartTime
      }
    };
  }
  
  getStats() {
    return { ...this.stats };
  }
  
  resetStats() {
    this.stats = {
      filesScanned: 0,
      filesSkipped: 0,
      totalFindings: 0,
      scanStartTime: null,
      scanEndTime: null
    };
  }
}

module.exports = DetectorOrchestrator;
