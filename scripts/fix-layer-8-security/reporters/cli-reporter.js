/**
 * Layer 8: Security Forensics - CLI Reporter
 * 
 * Comprehensive terminal output for security scan results.
 * Provides detailed, actionable information with proper formatting.
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
    const header = `
${this.c('cyan', '╔══════════════════════════════════════════════════════════════════╗')}
${this.c('cyan', '║')}  ${this.c('bright', 'NeuroLint Security Forensics')} - Layer 8                          ${this.c('cyan', '║')}
${this.c('cyan', '║')}  ${this.c('dim', 'Post-Exploitation Detection & Incident Response')}                 ${this.c('cyan', '║')}
${this.c('cyan', '╚══════════════════════════════════════════════════════════════════╝')}`;
    
    return header;
  }
  
  generateSummary(scanResult) {
    const severity = SeverityCalculator.calculateOverallSeverity(scanResult.findings || []);
    const stats = scanResult.stats || {};
    
    const statusBadge = this.getStatusBadge(severity.level);
    const executionTime = stats.totalExecutionTime 
      ? `${(stats.totalExecutionTime / 1000).toFixed(2)}s`
      : 'N/A';
    
    const summary = `
${this.c('bright', '┌─ SCAN SUMMARY ─────────────────────────────────────────────────┐')}
│                                                                  │
│  ${this.c('bright', 'Status:')}     ${statusBadge}                                          
│  ${this.c('bright', 'Files:')}      ${stats.filesScanned || 0} scanned, ${stats.filesSkipped || 0} skipped
│  ${this.c('bright', 'Duration:')}   ${executionTime}
│  ${this.c('bright', 'Findings:')}   ${scanResult.findings?.length || 0} total
│                                                                  │
│  ${this.c('red', '● Critical:')} ${severity.breakdown.critical.toString().padStart(3)}    ${this.c('yellow', '● High:')} ${severity.breakdown.high.toString().padStart(3)}
│  ${this.c('blue', '● Medium:')}   ${severity.breakdown.medium.toString().padStart(3)}    ${this.c('cyan', '● Low:')}  ${severity.breakdown.low.toString().padStart(3)}
│                                                                  │
${this.c('bright', '└──────────────────────────────────────────────────────────────────┘')}`;
    
    return summary;
  }
  
  getStatusBadge(level) {
    const badges = {
      critical: this.c('bgRed', ' CRITICAL '),
      high: this.c('bgYellow', ' COMPROMISED '),
      medium: this.c('bgBlue', ' WARNINGS '),
      low: this.c('bgCyan', ' MINOR ISSUES '),
      info: this.c('dim', ' INFO '),
      clean: this.c('bgGreen', ' CLEAN ')
    };
    
    return badges[level] || badges.clean;
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
    lines.push(this.c('bright', '┌─ FINDINGS BY FILE ────────────────────────────────────────────┐'));
    lines.push('');
    
    for (const [file, fileFindings] of Object.entries(fileGroups)) {
      const sortedFindings = fileFindings.sort((a, b) => {
        return (SEVERITY_WEIGHTS[b.severity] || 0) - (SEVERITY_WEIGHTS[a.severity] || 0);
      });
      
      const relativePath = file.length > 60 ? '...' + file.slice(-57) : file;
      lines.push(`  ${this.c('cyan', '📄')} ${this.c('bright', relativePath)}`);
      lines.push('');
      
      for (const finding of sortedFindings) {
        lines.push(this.formatFinding(finding));
        lines.push('');
      }
      
      lines.push(this.c('dim', '  ─────────────────────────────────────────────────────────────'));
      lines.push('');
    }
    
    lines.push(this.c('bright', '└──────────────────────────────────────────────────────────────────┘'));
    
    return lines.join('\n');
  }
  
  generateFindingsBySeverity(findings) {
    const severityOrder = ['critical', 'high', 'medium', 'low', 'info'];
    const severityGroups = {};
    
    for (const severity of severityOrder) {
      severityGroups[severity] = findings.filter(f => f.severity === severity);
    }
    
    const lines = [];
    lines.push(this.c('bright', '┌─ FINDINGS BY SEVERITY ─────────────────────────────────────────┐'));
    lines.push('');
    
    for (const severity of severityOrder) {
      const group = severityGroups[severity];
      if (group.length === 0) continue;
      
      const severityLabel = this.getSeverityLabel(severity);
      lines.push(`  ${severityLabel} (${group.length})`);
      lines.push('');
      
      for (const finding of group) {
        lines.push(this.formatFinding(finding));
        lines.push('');
      }
    }
    
    lines.push(this.c('bright', '└──────────────────────────────────────────────────────────────────┘'));
    
    return lines.join('\n');
  }
  
  getSeverityLabel(severity) {
    const labels = {
      critical: this.c('red', '🔴 CRITICAL'),
      high: this.c('yellow', '🟠 HIGH'),
      medium: this.c('blue', '🟡 MEDIUM'),
      low: this.c('cyan', '🟢 LOW'),
      info: this.c('dim', 'ℹ️  INFO')
    };
    
    return labels[severity] || labels.info;
  }
  
  formatFinding(finding) {
    const lines = [];
    const indent = '    ';
    
    const severityIcon = {
      critical: '🚨',
      high: '⚠️ ',
      medium: '📋',
      low: '📝',
      info: 'ℹ️ '
    };
    
    lines.push(`${indent}${severityIcon[finding.severity] || '•'} ${this.c('bright', finding.signatureName || finding.signatureId)}`);
    lines.push(`${indent}   ${this.c('dim', 'ID:')} ${finding.signatureId}`);
    lines.push(`${indent}   ${this.c('dim', 'Location:')} Line ${finding.line}, Col ${finding.column}`);
    
    if (finding.matchedText && finding.matchedText !== '[Behavioral Pattern]') {
      const truncated = finding.matchedText.length > 80 
        ? finding.matchedText.substring(0, 77) + '...'
        : finding.matchedText;
      lines.push(`${indent}   ${this.c('dim', 'Match:')} ${this.c('yellow', truncated)}`);
    }
    
    if (finding.description) {
      lines.push(`${indent}   ${this.c('dim', 'Desc:')} ${finding.description}`);
    }
    
    if (finding.remediation) {
      lines.push(`${indent}   ${this.c('green', '→ Fix:')} ${finding.remediation}`);
    }
    
    if (finding.confidence) {
      const confidence = Math.round(finding.confidence * 100);
      const confColor = confidence >= 80 ? 'green' : confidence >= 50 ? 'yellow' : 'red';
      lines.push(`${indent}   ${this.c('dim', 'Confidence:')} ${this.c(confColor, confidence + '%')}`);
    }
    
    if (this.showContext && finding.context && finding.context.length > 0) {
      lines.push(`${indent}   ${this.c('dim', 'Context:')}`);
      for (const ctx of finding.context.slice(0, this.maxContextLines)) {
        const lineNum = ctx.lineNumber.toString().padStart(4);
        const prefix = ctx.isMatch ? this.c('red', '→') : ' ';
        const content = ctx.content.substring(0, 70);
        lines.push(`${indent}     ${prefix} ${this.c('dim', lineNum + ' |')} ${content}`);
      }
    }
    
    return lines.join('\n');
  }
  
  generateCleanReport() {
    return `
  ${this.c('green', '✓')} ${this.c('bright', 'No indicators of compromise detected!')}
  
  ${this.c('dim', 'Your codebase appears clean based on the current scan.')}
  ${this.c('dim', 'For deeper analysis, try:')}
  ${this.c('dim', '  neurolint security:scan-compromise . --mode deep')}
`;
  }
  
  generateFooter(scanResult) {
    const timestamp = new Date().toISOString();
    const findings = scanResult.findings || [];
    
    let actionMessage = '';
    
    if (findings.some(f => f.severity === 'critical')) {
      actionMessage = this.c('red', '⚠️  IMMEDIATE ACTION REQUIRED: Critical security issues detected!');
    } else if (findings.some(f => f.severity === 'high')) {
      actionMessage = this.c('yellow', '⚡ Review high-severity findings and remediate promptly.');
    } else if (findings.length > 0) {
      actionMessage = this.c('blue', '📋 Review findings and address as appropriate.');
    } else {
      actionMessage = this.c('green', '✓ Scan completed successfully.');
    }
    
    return `
${this.c('dim', '─────────────────────────────────────────────────────────────────')}
${actionMessage}

${this.c('dim', 'Scan completed at:')} ${timestamp}
${this.c('dim', 'For JSON output:')} neurolint security:scan-compromise . --json
${this.c('dim', 'For full report:')} neurolint security:incident-response . --output ./report
${this.c('dim', '─────────────────────────────────────────────────────────────────')}`;
  }
  
  printReport(scanResult, options = {}) {
    const report = this.generateReport(scanResult, options);
    console.log(report);
    return report;
  }
}

module.exports = CLIReporter;
