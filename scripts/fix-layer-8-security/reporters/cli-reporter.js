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
const { COLORS, SYMBOLS, isColorSupported } = require('../../../shared-core/cli-output');

const HINTS = {
  critical: 'Isolate affected systems immediately and review access logs.',
  high: 'Prioritize remediation and audit recent code changes.',
  medium: 'Schedule review in your next security sprint.',
  low: 'Consider addressing during regular maintenance.',
  malicious_code: 'Check git history for unauthorized commits.',
  data_exfiltration: 'Review network logs and API access patterns.',
  backdoor: 'Rotate all credentials and API keys immediately.',
  suspicious_dependency: 'Audit package.json and lock files for tampering.'
};

class CLIReporter {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.useColors = options.colors !== false && isColorSupported();
    this.showContext = options.showContext !== false;
    this.maxContextLines = options.maxContextLines || 3;
    this.groupByFile = options.groupByFile !== false;
    this.showHints = options.showHints !== false;
  }
  
  c(color, text) {
    if (!this.useColors) return text;
    const colorCode = COLORS[color];
    if (!colorCode) return text;
    return `${colorCode}${text}${COLORS.reset}`;
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
    return `${SYMBOLS.info} NeuroLint Security Forensics - Layer 8
${SYMBOLS.info} Post-Exploitation Detection & Incident Response`;
  }
  
  generateSummary(scanResult) {
    const severity = SeverityCalculator.calculateOverallSeverity(scanResult.findings || []);
    const stats = scanResult.stats || {};
    
    const statusText = this.getStatusText(severity.level);
    const executionTime = stats.totalExecutionTime 
      ? `${(stats.totalExecutionTime / 1000).toFixed(2)}s`
      : 'N/A';
    
    const lines = [
      `${SYMBOLS.info} SCAN SUMMARY`,
      `${SYMBOLS.info} Status: ${statusText}`,
      `${SYMBOLS.info} Files: ${stats.filesScanned || 0} scanned, ${stats.filesSkipped || 0} skipped`,
      `${SYMBOLS.info} Duration: ${executionTime}`,
      `${SYMBOLS.info} Findings: ${scanResult.findings?.length || 0} total`,
      `${SYMBOLS.info} Breakdown: Critical=${severity.breakdown.critical}, High=${severity.breakdown.high}, Medium=${severity.breakdown.medium}, Low=${severity.breakdown.low}`
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
    lines.push(`${SYMBOLS.info} FINDINGS BY FILE`);
    lines.push('');
    
    for (const [file, fileFindings] of Object.entries(fileGroups)) {
      const sortedFindings = fileFindings.sort((a, b) => {
        return (SEVERITY_WEIGHTS[b.severity] || 0) - (SEVERITY_WEIGHTS[a.severity] || 0);
      });
      
      const relativePath = file.length > 60 ? '...' + file.slice(-57) : file;
      lines.push(`${SYMBOLS.info} File: ${relativePath}`);
      
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
    lines.push(`${SYMBOLS.info} FINDINGS BY SEVERITY`);
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
      critical: `${SYMBOLS.error} CRITICAL`,
      high: `${SYMBOLS.warning} HIGH`,
      medium: `${SYMBOLS.info} MEDIUM`,
      low: `${SYMBOLS.info} LOW`,
      info: `${SYMBOLS.info} INFO`
    };
    
    return labels[severity] || labels.info;
  }
  
  formatFinding(finding) {
    const lines = [];
    const indent = '  ';
    
    const severityPrefix = {
      critical: SYMBOLS.error,
      high: SYMBOLS.warning,
      medium: SYMBOLS.info,
      low: SYMBOLS.info,
      info: SYMBOLS.info
    };
    
    const prefix = severityPrefix[finding.severity] || SYMBOLS.info;
    
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
    
    if (this.showHints && finding.severity) {
      const hint = this.getHintForFinding(finding);
      if (hint) {
        lines.push(`${indent}  Hint: ${hint}`);
      }
    }
    
    if (this.showContext && finding.context && finding.context.length > 0) {
      lines.push(`${indent}  Context:`);
      for (const ctx of finding.context.slice(0, this.maxContextLines)) {
        const lineNum = ctx.lineNumber.toString().padStart(4);
        const marker = ctx.isMatch ? '>' : ' ';
        const content = ctx.content.substring(0, 70);
        lines.push(`${indent}    ${marker} ${lineNum} | ${content}`);
      }
    }
    
    return lines.join('\n');
  }
  
  getHintForFinding(finding) {
    if (finding.category && HINTS[finding.category]) {
      return HINTS[finding.category];
    }
    return HINTS[finding.severity] || null;
  }
  
  generateCleanReport() {
    return `${SYMBOLS.success} No indicators of compromise detected!
${SYMBOLS.info} Your codebase appears clean based on the current scan.
${SYMBOLS.info} For deeper analysis, try: neurolint security:scan-compromise . --mode deep`;
  }
  
  generateFooter(scanResult) {
    const timestamp = new Date().toISOString();
    const findings = scanResult.findings || [];
    
    let actionMessage = '';
    
    if (findings.some(f => f.severity === 'critical')) {
      actionMessage = `${SYMBOLS.error} IMMEDIATE ACTION REQUIRED: Critical security issues detected!`;
    } else if (findings.some(f => f.severity === 'high')) {
      actionMessage = `${SYMBOLS.warning} Review high-severity findings and remediate promptly.`;
    } else if (findings.length > 0) {
      actionMessage = `${SYMBOLS.info} Review findings and address as appropriate.`;
    } else {
      actionMessage = `${SYMBOLS.success} Scan completed successfully.`;
    }
    
    return `${actionMessage}
${SYMBOLS.info} Scan completed at: ${timestamp}
${SYMBOLS.info} For JSON output: neurolint security:scan-compromise . --json
${SYMBOLS.info} For full report: neurolint security:incident-response . --output ./report`;
  }
  
  printReport(scanResult, options = {}) {
    const report = this.generateReport(scanResult, options);
    const findings = scanResult.findings || [];
    
    if (findings.some(f => f.severity === 'critical' || f.severity === 'high')) {
      process.stderr.write(report + '\n');
    } else {
      process.stdout.write(report + '\n');
    }
    return report;
  }
}

module.exports = CLIReporter;
