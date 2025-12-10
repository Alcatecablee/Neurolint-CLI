/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


'use strict';

const path = require('path');
const { IOC_SIGNATURES, SEVERITY_LEVELS, FILE_TYPE_ASSOCIATIONS } = require('../constants');
const { SafeRegex, executeWithTimeout, REGEX_TIMEOUT_MS } = require('../utils/safe-regex');
const ErrorAggregator = require('../utils/error-aggregator');

class SignatureAnalyzer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.signatures = IOC_SIGNATURES.signatures;
    this.customSignatures = options.customSignatures || [];
    this.excludePatterns = options.excludePatterns || [];
    this.contextLines = options.contextLines || 3;
    this.errorAggregator = new ErrorAggregator({ verbose: this.verbose });
    
    if (this.customSignatures.length > 0) {
      this.signatures = [...this.signatures, ...this.customSignatures];
    }
  }
  
  analyze(code, filePath, options = {}) {
    const findings = [];
    const fileExt = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const startTime = Date.now();
    const normalizedPath = this.normalizePath(filePath);
    
    if (this.shouldSkipFile(normalizedPath, fileName)) {
      return {
        findings: [],
        scanned: false,
        reason: 'File excluded from scanning',
        executionTime: Date.now() - startTime
      };
    }
    
    const lines = code.split('\n');
    
    for (const signature of this.signatures) {
      try {
        if (signature.fileTypes && !signature.fileTypes.some(ft => filePath.endsWith(ft))) {
          continue;
        }
        
        if (signature.pathPattern) {
          const pathPatternMatches = signature.pathPattern.test(normalizedPath);
          if (signature.id === 'NEUROLINT-IOC-024') {
            if (!pathPatternMatches) {
              continue;
            }
          } else {
            if (!pathPatternMatches) {
              continue;
            }
          }
        }
        
        const matches = this.findMatches(code, signature, lines);
        
        for (const match of matches) {
          if (this.isLikelyFalsePositive(match, code, normalizedPath, signature)) {
            if (this.verbose) {
              console.log(`  [SKIP] False positive: ${signature.id} in ${filePath}`);
            }
            continue;
          }
          
          findings.push({
            id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            signatureId: signature.id,
            signatureName: signature.name,
            severity: signature.severity,
            category: signature.category,
            file: filePath,
            line: match.line,
            column: match.column,
            matchedText: match.text.substring(0, 200),
            context: this.getContext(lines, match.line, this.contextLines),
            description: signature.description,
            remediation: signature.remediation,
            references: signature.references || [],
            confidence: this.calculateConfidence(match, signature, code),
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        this.errorAggregator.addError(error, { 
          phase: 'signature-analysis',
          signatureId: signature.id,
          file: filePath 
        });
      }
    }
    
    return {
      findings,
      scanned: true,
      signatureCount: this.signatures.length,
      executionTime: Date.now() - startTime,
      errors: this.errorAggregator.hasErrors() ? this.errorAggregator.getSummary() : null
    };
  }
  
  normalizePath(filePath) {
    return filePath.replace(/\\/g, '/');
  }
  
  findMatches(code, signature, lines) {
    const matches = [];
    
    if (signature.type === 'regex' && signature.pattern) {
      try {
        const result = executeWithTimeout(signature.pattern, code, REGEX_TIMEOUT_MS * 5);
        
        if (result.timedOut) {
          this.errorAggregator.addWarning(
            `Regex timeout for ${signature.id}`,
            { pattern: signature.pattern.source?.substring(0, 50) }
          );
          return matches;
        }
        
        if (result.truncated) {
          this.errorAggregator.addWarning(
            `Input truncated for ${signature.id} (${result.originalLength} bytes)`,
            { file: 'unknown' }
          );
        }
        
        for (const match of result.matches) {
          const beforeMatch = code.substring(0, match.index);
          const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
          const lastNewline = beforeMatch.lastIndexOf('\n');
          const column = match.index - lastNewline;
          
          matches.push({
            text: match.text,
            index: match.index,
            line: lineNumber,
            column: column,
            fullMatch: match
          });
          
          if (matches.length >= 100) {
            break;
          }
        }
      } catch (error) {
        this.errorAggregator.addError(error, {
          phase: 'regex-execution',
          signatureId: signature.id
        });
      }
    }
    
    return matches;
  }
  
  getContext(lines, lineNumber, contextSize) {
    const startLine = Math.max(0, lineNumber - contextSize - 1);
    const endLine = Math.min(lines.length, lineNumber + contextSize);
    
    const contextLines = [];
    for (let i = startLine; i < endLine; i++) {
      contextLines.push({
        lineNumber: i + 1,
        content: lines[i],
        isMatch: i + 1 === lineNumber
      });
    }
    
    return contextLines;
  }
  
  calculateConfidence(match, signature, code) {
    let confidence = 0.8;
    
    if (signature.severity === SEVERITY_LEVELS.CRITICAL) {
      confidence += 0.1;
    }
    
    if (signature.contextRequired) {
      confidence -= 0.2;
    }
    
    const suspiciousContextPatterns = [
      /function\s+\w*(?:backdoor|hack|exploit|shell|payload)/i,
      /\/\/\s*(?:todo|fixme|hack)/i,
      /require\s*\(\s*['"](?:net|child_process|fs)['"]\s*\)/
    ];
    
    for (const pattern of suspiciousContextPatterns) {
      if (pattern.test(code)) {
        confidence += 0.05;
      }
    }
    
    return Math.min(0.99, Math.max(0.1, confidence));
  }
  
  shouldSkipFile(filePath, fileName) {
    const normalizedPath = this.normalizePath(filePath);
    
    const skipPatterns = [
      /\.test\.(js|ts|jsx|tsx)$/,
      /\.spec\.(js|ts|jsx|tsx)$/,
      /__tests__/,
      /\.stories\.(js|ts|jsx|tsx)$/,
      /\.d\.ts$/,
      /\.min\.(js|css)$/,
      /node_modules/,
      /\.git/,
      /dist\//,
      /build\//,
      /coverage\//
    ];
    
    for (const pattern of skipPatterns) {
      if (pattern.test(normalizedPath)) {
        return true;
      }
    }
    
    return false;
  }
  
  isLikelyFalsePositive(match, code, filePath, signature) {
    const normalizedPath = this.normalizePath(filePath);
    
    if (signature.id === 'NEUROLINT-IOC-011') {
      const matchText = match.text.replace(/['"]/g, '');
      
      if (matchText.length < 500) {
        return true;
      }
      
      if (matchText.includes('.') || matchText.includes('/') || matchText.includes('-')) {
        return true;
      }
      
      const contextPatterns = [
        /(?:jwt|token|key|secret|auth|session)/i,
        /data:image\//i,
        /sourceMappingURL/i
      ];
      
      const lines = code.split('\n');
      const matchLine = lines[match.line - 1] || '';
      
      for (const pattern of contextPatterns) {
        if (pattern.test(matchLine)) {
          return true;
        }
      }
    }
    
    if (signature.id === 'NEUROLINT-IOC-007') {
      const base64Pattern = /^[A-Za-z0-9+/=]+$/;
      const matchText = match.text.replace(/['"]/g, '');
      
      if (matchText.includes('.') || matchText.includes('/')) {
        return true;
      }
      
      if (/^[A-Za-z0-9+/]+={0,2}$/.test(matchText)) {
        try {
          const decoded = Buffer.from(matchText, 'base64').toString('utf8');
          if (/[\x00-\x08\x0e-\x1f]/.test(decoded)) {
            return true;
          }
        } catch (e) {
          return true;
        }
      }
    }
    
    if (signature.id === 'NEUROLINT-IOC-005') {
      const legitPatterns = [
        /scripts?\//i,
        /cli\.(js|ts)/i,
        /build\.(js|ts)/i,
        /tools?\//i
      ];
      
      for (const pattern of legitPatterns) {
        if (pattern.test(normalizedPath)) {
          return true;
        }
      }
    }
    
    try {
      const commentPatterns = [
        new RegExp(`^\\s*//.*${escapeRegex(match.text.substring(0, 20))}`),
        new RegExp(`^\\s*/\\*.*${escapeRegex(match.text.substring(0, 20))}`),
        new RegExp(`${escapeRegex(match.text.substring(0, 20))}.*\\*/\\s*$`)
      ];
      
      const lines = code.split('\n');
      const matchLine = lines[match.line - 1] || '';
      
      for (const pattern of commentPatterns) {
        if (pattern.test(matchLine)) {
          return true;
        }
      }
    } catch (e) {
    }
    
    return false;
  }
  
  getSignatureById(id) {
    return this.signatures.find(s => s.id === id);
  }
  
  getSignaturesByCategory(category) {
    return this.signatures.filter(s => s.category === category);
  }
  
  getSignaturesBySeverity(severity) {
    return this.signatures.filter(s => s.severity === severity);
  }
  
  getErrors() {
    return this.errorAggregator.toJSON();
  }
  
  clearErrors() {
    this.errorAggregator.clear();
  }
  
  reset() {
    this.errorAggregator.clear();
  }
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = SignatureAnalyzer;
