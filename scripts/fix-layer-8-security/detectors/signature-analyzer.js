/**
 * Layer 8: Security Forensics - Signature Analyzer
 * 
 * Performs pattern-based detection of known IoC signatures.
 * Uses regex patterns with optional AST validation for reduced false positives.
 * 
 * IMPORTANT: This is a READ-ONLY detector. It does not modify code.
 * Following NeuroLint's principle: "Never break code"
 */

'use strict';

const path = require('path');
const { IOC_SIGNATURES, SEVERITY_LEVELS, FILE_TYPE_ASSOCIATIONS } = require('../constants');

class SignatureAnalyzer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.signatures = IOC_SIGNATURES.signatures;
    this.customSignatures = options.customSignatures || [];
    this.excludePatterns = options.excludePatterns || [];
    this.contextLines = options.contextLines || 3;
    
    if (this.customSignatures.length > 0) {
      this.signatures = [...this.signatures, ...this.customSignatures];
    }
  }
  
  analyze(code, filePath, options = {}) {
    const findings = [];
    const fileExt = path.extname(filePath).toLowerCase();
    const fileName = path.basename(filePath);
    const startTime = Date.now();
    
    if (this.shouldSkipFile(filePath, fileName)) {
      return {
        findings: [],
        scanned: false,
        reason: 'File excluded from scanning',
        executionTime: Date.now() - startTime
      };
    }
    
    const lines = code.split('\n');
    
    for (const signature of this.signatures) {
      if (signature.fileTypes && !signature.fileTypes.some(ft => filePath.endsWith(ft))) {
        continue;
      }
      
      const matches = this.findMatches(code, signature, lines);
      
      for (const match of matches) {
        if (this.isLikelyFalsePositive(match, code, filePath, signature)) {
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
    }
    
    return {
      findings,
      scanned: true,
      signatureCount: this.signatures.length,
      executionTime: Date.now() - startTime
    };
  }
  
  findMatches(code, signature, lines) {
    const matches = [];
    
    if (signature.type === 'regex' && signature.pattern) {
      const regex = new RegExp(signature.pattern.source, signature.pattern.flags);
      let match;
      
      const globalRegex = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
      
      while ((match = globalRegex.exec(code)) !== null) {
        const beforeMatch = code.substring(0, match.index);
        const lineNumber = (beforeMatch.match(/\n/g) || []).length + 1;
        const lastNewline = beforeMatch.lastIndexOf('\n');
        const column = match.index - lastNewline;
        
        matches.push({
          text: match[0],
          index: match.index,
          line: lineNumber,
          column: column,
          fullMatch: match
        });
        
        if (matches.length >= 100) {
          break;
        }
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
      if (pattern.test(filePath)) {
        return true;
      }
    }
    
    return false;
  }
  
  isLikelyFalsePositive(match, code, filePath, signature) {
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
        if (pattern.test(filePath)) {
          return true;
        }
      }
    }
    
    const commentPatterns = [
      new RegExp(`^\\s*//.*${escapeRegex(match.text)}`),
      new RegExp(`^\\s*/\\*.*${escapeRegex(match.text)}`),
      new RegExp(`${escapeRegex(match.text)}.*\\*/\\s*$`)
    ];
    
    const lines = code.split('\n');
    const matchLine = lines[match.line - 1] || '';
    
    for (const pattern of commentPatterns) {
      if (pattern.test(matchLine)) {
        return true;
      }
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
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = SignatureAnalyzer;
