/**
 * Layer 8: Security Forensics - CLI Reporter
 * 
 * Terminal output for security scan results following NeuroLint layer styling.
 * Uses [INFO], [SUCCESS], [WARNING], [ERROR] prefixes consistent with other layers.
 */

'use strict';

const path = require('path');
const { SEVERITY_LEVELS, SEVERITY_WEIGHTS, IOC_CATEGORIES } = require('../constants');
const SeverityCalculator = require('../utils/severity-calculator');

class CLIReporter {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.useColors = options.colors !== false;
    this.showContext = options.showContext !== false;
    this.maxContextLines = options.maxContextLines || 3;
    this.groupByFile = options.groupByFile !== false;
  }
  
  colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
  };
  
  c(color, text) {
    if (!this.useColors) return text;
    return `${this.colors[color] || ''}${text}${this.colors.reset}`;
  }
  
  generateReport(scanResult, options = {}) {
    const lines = [];
    
    lines.push(this.generateHeader());
    lines.push('');
    
    lines.push(this.generateSummary(scanResult));
    lines.push('');
    
    if (scanResult.findings && scanResult.findings.length > 0) {
      if (this.groupByFile) {
        lines.push(this.generateFindingsByFile(scanResult.findings));
      } else {
        lines.push(this.generateFindingsBySeverity(scanResult.findings));
      }
    } else {
      lines.push(this.generateCleanReport());
    }
    
    lines.push('');
    lines.push(this.generateFooter(scanResult));
    
    return lines.join('\n');
  }
  
  generateHeader() {
    return `[INFO] NeuroLint Security Forensics - Layer 8
[INFO] Post-Exploitation Detection & Incident Response`;
  }
  
  generateSummary(scanResult) {
    const severity = SeverityCalculator.calculateOverallSeverity(scanResult.findings || []);
    const stats = scanResult.stats || {};
    
    const statusText = this.getStatusText(severity.level);
    const executionTime = stats.totalExecutionTime 
      ? `${(stats.totalExecutionTime / 1000).toFixed(2)}s`
      : 'N/A';
    
    const lines = [
      '[INFO] SCAN SUMMARY',
      `[INFO] Status: ${statusText}`,
      `[INFO] Files: ${stats.filesScanned || 0} scanned, ${stats.filesSkipped || 0} skipped`,
      `[INFO] Duration: ${executionTime}`,
      `[INFO] Findings: ${scanResult.findings?.length || 0} total`,
      `[INFO] Breakdown: Critical=${severity.breakdown.critical}, High=${severity.breakdown.high}, Medium=${severity.breakdown.medium}, Low=${severity.breakdown.low}`
    ];
    
    return lines.join('\n');
  }
  
  getStatusText(level) {
    const statusMap = {
      critical: this.c('red', 'CRITICAL'),
      high: this.c('yellow', 'COMPROMISED'),
      medium: this.c('blue', 'WARNINGS'),
      low: this.c('cyan', 'MINOR ISSUES'),
      info: this.c('dim', 'INFO'),
      clean: this.c('green', 'CLEAN')
    };
    
    return statusMap[level] || statusMap.clean;
  }
  
  generateFindingsByFile(findings) {
    const fileGroups = {};
    
    for (const finding of findings) {
      const file = finding.file || 'Unknown';
      if (!fileGroups[file]) {
        fileGroups[file] = [];
      }
      fileGroups[file].push(finding);
    }
    
    const lines = [];
    lines.push('[INFO] FINDINGS BY FILE');
    lines.push('');
    
    for (const [file, fileFindings] of Object.entries(fileGroups)) {
      const sortedFindings = fileFindings.sort((a, b) => {
        return (SEVERITY_WEIGHTS[b.severity] || 0) - (SEVERITY_WEIGHTS[a.severity] || 0);
      });
      
      const relativePath = file.length > 60 ? '...' + file.slice(-57) : file;
      lines.push(`[INFO] File: ${relativePath}`);
      
      for (const finding of sortedFindings) {
        lines.push(this.formatFinding(finding));
      }
      
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  generateFindingsBySeverity(findings) {
    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
    const severityGroups = {};
    
    for (const severity of severityOrder) {
      severityGroups[severity] = findings.filter(f => f.severity === severity);
    }
    
    const lines = [];
    lines.push('[INFO] FINDINGS BY SEVERITY');
    lines.push('');
    
    for (const severity of severityOrder) {
      const group = severityGroups[severity];
      if (group.length === 0) continue;
      
      const severityLabel = this.getSeverityLabel(severity);
      lines.push(`${severityLabel} (${group.length})`);
      
      for (const finding of group) {
        lines.push(this.formatFinding(finding));
      }
      
      lines.push('');
    }
    
    return lines.join('\n');
  }
  
  getSeverityLabel(severity) {
    const labels = {
      critical: '[ERROR] CRITICAL',
      high: '[WARNING] HIGH',
      medium: '[INFO] MEDIUM',
      low: '[INFO] LOW',
      info: '[INFO] INFO'
    };
    
    return labels[severity] || labels.info;
  }
  
  formatFinding(finding) {
    const lines = [];
    const indent = '  ';
    
    const severityPrefix = {
      critical: '[ERROR]',
      high: '[WARNING]',
      medium: '[INFO]',
      low: '[INFO]',
      info: '[INFO]'
    };
    
    const prefix = severityPrefix[finding.severity] || '[INFO]';
    
    lines.push(`${indent}${prefix} ${finding.signatureName || finding.signatureId}`);
    lines.push(`${indent}  ID: ${finding.signatureId}`);
    lines.push(`${indent}  Location: Line ${finding.line}, Col ${finding.column}`);
    
    if (finding.matchedText && finding.matchedText !== '[Behavioral Pattern]') {
      const truncated = finding.matchedText.length > 80 
        ? finding.matchedText.substring(0, 77) + '...'
        : finding.matchedText;
      lines.push(`${indent}  Match: ${truncated}`);
    }
    
    if (finding.description) {
      lines.push(`${indent}  Desc: ${finding.description}`);
    }
    
    if (finding.remediation) {
      lines.push(`${indent}  Fix: ${finding.remediation}`);
    }
    
    if (finding.confidence) {
      const confidence = Math.round(finding.confidence * 100);
      lines.push(`${indent}  Confidence: ${confidence}%`);
    }
    
    if (this.showContext && finding.context && finding.context.length > 0) {
      lines.push(`${indent}  Context:`);
      for (const ctx of finding.context.slice(0, this.maxContextLines)) {
        const lineNum = ctx.lineNumber.toString().padStart(4);
        const prefix = ctx.isMatch ? '>' : ' ';
        const content = ctx.content.substring(0, 70);
        lines.push(`${indent}    ${prefix} ${lineNum} | ${content}`);
      }
    }
    
    return lines.join('\n');
  }
  
  generateCleanReport() {
    return `[SUCCESS] No indicators of compromise detected!
[INFO] Your codebase appears clean based on the current scan.
[INFO] For deeper analysis, try: neurolint security:scan-compromise . --mode deep`;
  }
  
  generateFooter(scanResult) {
    const timestamp = new Date().toISOString();
    const findings = scanResult.findings || [];
    
    let actionMessage = '';
    
    if (findings.some(f => f.severity === 'critical')) {
      actionMessage = '[ERROR] IMMEDIATE ACTION REQUIRED: Critical security issues detected!';
    } else if (findings.some(f => f.severity === 'high')) {
      actionMessage = '[WARNING] Review high-severity findings and remediate promptly.';
    } else if (findings.length > 0) {
      actionMessage = '[INFO] Review findings and address as appropriate.';
    } else {
      actionMessage = '[SUCCESS] Scan completed successfully.';
    }
    
    return `${actionMessage}
[INFO] Scan completed at: ${timestamp}
[INFO] For JSON output: neurolint security:scan-compromise . --json
[INFO] For full report: neurolint security:incident-response . --output ./report`;
  }
  
  printReport(scanResult, options = {}) {
    const report = this.generateReport(scanResult, options);
    console.log(report);
    return report;
  }
}

module.exports = CLIReporter;
