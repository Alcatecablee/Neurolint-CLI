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
 * Layer 8: Security Forensics - HTML Reporter
 * 
 * Generates standalone HTML reports with executive summary, findings,
 * timeline, and remediation checklist. Uses embedded CSS for portability.
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { LAYER_8_VERSION, SEVERITY_LEVELS, IOC_CATEGORIES } = require('../constants');
const SeverityCalculator = require('../utils/severity-calculator');

class HTMLReporter {
  constructor(options = {}) {
    this.includeContext = options.includeContext !== false;
    this.includeTimeline = options.includeTimeline !== false;
    this.includeRemediation = options.includeRemediation !== false;
    this.companyName = options.companyName || 'Security Team';
    this.reportTitle = options.reportTitle || 'Security Forensics Report';
  }
  
  generateReport(scanResult, options = {}) {
    const severity = SeverityCalculator.calculateOverallSeverity(scanResult.findings || []);
    const timestamp = new Date().toISOString();
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(this.reportTitle)} - ${timestamp.split('T')[0]}</title>
  <style>
${this.generateCSS()}
  </style>
</head>
<body>
  <div class="container">
    ${this.generateHeader(scanResult, severity, timestamp)}
    ${this.generateExecutiveSummary(scanResult, severity)}
    ${this.generateSeverityBreakdown(severity)}
    ${this.generateFindingsSection(scanResult.findings || [])}
    ${this.includeTimeline ? this.generateTimelineSection(scanResult) : ''}
    ${this.includeRemediation ? this.generateRemediationChecklist(scanResult.findings || []) : ''}
    ${this.generateFooter(timestamp)}
  </div>
  <script>
${this.generateJS()}
  </script>
</body>
</html>`;
  }
  
  generateCSS() {
    return `
    :root {
      --color-critical: #dc2626;
      --color-high: #ea580c;
      --color-medium: #ca8a04;
      --color-low: #2563eb;
      --color-info: #6b7280;
      --color-clean: #16a34a;
      --color-bg: #f9fafb;
      --color-card: #ffffff;
      --color-border: #e5e7eb;
      --color-text: #1f2937;
      --color-text-secondary: #6b7280;
      --font-mono: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: var(--color-bg);
      color: var(--color-text);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 2rem;
      border-radius: 12px;
      margin-bottom: 2rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    header h1 {
      font-size: 1.875rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
    }
    
    header .subtitle {
      opacity: 0.8;
      font-size: 0.875rem;
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      font-size: 0.875rem;
      margin-top: 1rem;
    }
    
    .status-critical { background: var(--color-critical); }
    .status-high { background: var(--color-high); }
    .status-medium { background: var(--color-medium); }
    .status-low { background: var(--color-low); }
    .status-clean { background: var(--color-clean); }
    
    .card {
      background: var(--color-card);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      border: 1px solid var(--color-border);
    }
    
    .card h2 {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .card h2::before {
      content: '';
      width: 4px;
      height: 1.25rem;
      background: #3b82f6;
      border-radius: 2px;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }
    
    .stat-item {
      text-align: center;
      padding: 1rem;
      background: var(--color-bg);
      border-radius: 8px;
    }
    
    .stat-value {
      font-size: 2rem;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--color-text-secondary);
      letter-spacing: 0.05em;
    }
    
    .severity-bar {
      display: flex;
      height: 12px;
      border-radius: 6px;
      overflow: hidden;
      margin: 1rem 0;
    }
    
    .severity-segment {
      transition: width 0.3s ease;
    }
    
    .severity-legend {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-top: 0.5rem;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    
    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .finding {
      border: 1px solid var(--color-border);
      border-radius: 8px;
      margin-bottom: 1rem;
      overflow: hidden;
    }
    
    .finding-header {
      padding: 1rem;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--color-bg);
      transition: background 0.2s;
    }
    
    .finding-header:hover {
      background: #f3f4f6;
    }
    
    .finding-title {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .severity-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
    
    .severity-critical .severity-indicator { background: var(--color-critical); }
    .severity-high .severity-indicator { background: var(--color-high); }
    .severity-medium .severity-indicator { background: var(--color-medium); }
    .severity-low .severity-indicator { background: var(--color-low); }
    .severity-info .severity-indicator { background: var(--color-info); }
    
    .finding-body {
      padding: 1rem;
      display: none;
      border-top: 1px solid var(--color-border);
    }
    
    .finding.open .finding-body {
      display: block;
    }
    
    .finding-meta {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    
    .meta-item {
      font-size: 0.875rem;
    }
    
    .meta-label {
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    
    .code-block {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1rem;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.875rem;
      overflow-x: auto;
      margin: 1rem 0;
    }
    
    .code-line {
      display: flex;
    }
    
    .line-number {
      color: #64748b;
      min-width: 3rem;
      text-align: right;
      padding-right: 1rem;
      user-select: none;
    }
    
    .line-content {
      flex: 1;
    }
    
    .line-highlight {
      background: rgba(239, 68, 68, 0.2);
      margin: 0 -1rem;
      padding: 0 1rem;
    }
    
    .remediation-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: var(--color-bg);
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    
    .checkbox {
      width: 20px;
      height: 20px;
      border: 2px solid var(--color-border);
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .checkbox.checked {
      background: var(--color-clean);
      border-color: var(--color-clean);
      color: white;
    }
    
    .timeline {
      position: relative;
      padding-left: 2rem;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--color-border);
    }
    
    .timeline-item {
      position: relative;
      padding-bottom: 1.5rem;
    }
    
    .timeline-dot {
      position: absolute;
      left: -2rem;
      top: 0.25rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--color-card);
      border: 2px solid #3b82f6;
    }
    
    .timeline-content {
      background: var(--color-bg);
      padding: 1rem;
      border-radius: 8px;
    }
    
    .timeline-time {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
    }
    
    footer {
      text-align: center;
      padding: 2rem;
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
    
    .expand-icon {
      transition: transform 0.2s;
    }
    
    .finding.open .expand-icon {
      transform: rotate(180deg);
    }
    
    @media print {
      .container {
        max-width: none;
        padding: 0;
      }
      
      .finding-body {
        display: block !important;
      }
      
      .card {
        break-inside: avoid;
      }
    }
    
    @media (max-width: 640px) {
      .container {
        padding: 1rem;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }`;
  }
  
  generateJS() {
    return `
    document.querySelectorAll('.finding-header').forEach(header => {
      header.addEventListener('click', () => {
        header.parentElement.classList.toggle('open');
      });
    });
    
    document.querySelectorAll('.checkbox').forEach(checkbox => {
      checkbox.addEventListener('click', () => {
        checkbox.classList.toggle('checked');
        if (checkbox.classList.contains('checked')) {
          checkbox.innerHTML = '✓';
        } else {
          checkbox.innerHTML = '';
        }
      });
    });`;
  }
  
  generateHeader(scanResult, severity, timestamp) {
    const statusClass = severity.breakdown.critical > 0 ? 'critical' :
                       severity.breakdown.high > 0 ? 'high' :
                       severity.breakdown.medium > 0 ? 'medium' :
                       severity.breakdown.low > 0 ? 'low' : 'clean';
    
    const statusText = {
      critical: 'CRITICAL - Immediate Action Required',
      high: 'HIGH RISK - Review Promptly',
      medium: 'MEDIUM RISK - Issues Detected',
      low: 'LOW RISK - Minor Issues',
      clean: 'CLEAN - No Issues Detected'
    }[statusClass];
    
    return `
    <header>
      <h1>${this.escapeHtml(this.reportTitle)}</h1>
      <p class="subtitle">Generated by NeuroLint Layer 8 Security Forensics v${LAYER_8_VERSION}</p>
      <p class="subtitle">${this.escapeHtml(this.companyName)} | ${new Date(timestamp).toLocaleString()}</p>
      <span class="status-badge status-${statusClass}">
        <span>${statusText}</span>
      </span>
    </header>`;
  }
  
  generateExecutiveSummary(scanResult, severity) {
    const stats = scanResult.stats || {};
    
    return `
    <div class="card">
      <h2>Executive Summary</h2>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">${scanResult.findings?.length || 0}</div>
          <div class="stat-label">Total Findings</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: var(--color-critical)">${severity.breakdown.critical}</div>
          <div class="stat-label">Critical</div>
        </div>
        <div class="stat-item">
          <div class="stat-value" style="color: var(--color-high)">${severity.breakdown.high}</div>
          <div class="stat-label">High</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${stats.filesScanned || 0}</div>
          <div class="stat-label">Files Scanned</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${this.formatDuration(stats.totalExecutionTime)}</div>
          <div class="stat-label">Scan Duration</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">${severity.score}</div>
          <div class="stat-label">Risk Score</div>
        </div>
      </div>
    </div>`;
  }
  
  generateSeverityBreakdown(severity) {
    const total = severity.findingsCount || 1;
    const criticalPct = (severity.breakdown.critical / total * 100).toFixed(1);
    const highPct = (severity.breakdown.high / total * 100).toFixed(1);
    const mediumPct = (severity.breakdown.medium / total * 100).toFixed(1);
    const lowPct = (severity.breakdown.low / total * 100).toFixed(1);
    const infoPct = (severity.breakdown.info / total * 100).toFixed(1);
    
    return `
    <div class="card">
      <h2>Severity Distribution</h2>
      <div class="severity-bar">
        <div class="severity-segment" style="width: ${criticalPct}%; background: var(--color-critical)"></div>
        <div class="severity-segment" style="width: ${highPct}%; background: var(--color-high)"></div>
        <div class="severity-segment" style="width: ${mediumPct}%; background: var(--color-medium)"></div>
        <div class="severity-segment" style="width: ${lowPct}%; background: var(--color-low)"></div>
        <div class="severity-segment" style="width: ${infoPct}%; background: var(--color-info)"></div>
      </div>
      <div class="severity-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: var(--color-critical)"></span>
          <span>Critical (${severity.breakdown.critical})</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: var(--color-high)"></span>
          <span>High (${severity.breakdown.high})</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: var(--color-medium)"></span>
          <span>Medium (${severity.breakdown.medium})</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: var(--color-low)"></span>
          <span>Low (${severity.breakdown.low})</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: var(--color-info)"></span>
          <span>Info (${severity.breakdown.info})</span>
        </div>
      </div>
    </div>`;
  }
  
  generateFindingsSection(findings) {
    if (findings.length === 0) {
      return `
      <div class="card">
        <h2>Findings</h2>
        <p style="color: var(--color-clean); text-align: center; padding: 2rem;">
          No security issues detected. Your codebase appears clean.
        </p>
      </div>`;
    }
    
    const sortedFindings = [...findings].sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (order[a.severity] || 4) - (order[b.severity] || 4);
    });
    
    return `
    <div class="card">
      <h2>Findings (${findings.length})</h2>
      ${sortedFindings.map((finding, index) => this.generateFindingItem(finding, index)).join('')}
    </div>`;
  }
  
  generateFindingItem(finding, index) {
    const contextHtml = this.includeContext && finding.context 
      ? this.generateCodeBlock(finding.context, finding.line)
      : '';
    
    return `
      <div class="finding severity-${finding.severity}">
        <div class="finding-header">
          <div class="finding-title">
            <span class="severity-indicator"></span>
            <span><strong>#${index + 1}</strong> ${this.escapeHtml(finding.signatureName || finding.signatureId)}</span>
          </div>
          <span class="expand-icon">▼</span>
        </div>
        <div class="finding-body">
          <div class="finding-meta">
            <div class="meta-item">
              <span class="meta-label">Severity:</span>
              <span style="color: var(--color-${finding.severity}); font-weight: 600">${finding.severity.toUpperCase()}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Category:</span>
              <span>${this.escapeHtml(finding.category || 'security')}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">File:</span>
              <span style="font-family: var(--font-mono); font-size: 0.875rem">${this.escapeHtml(finding.file || 'Unknown')}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Location:</span>
              <span>Line ${finding.line || 1}, Column ${finding.column || 1}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Signature ID:</span>
              <span style="font-family: var(--font-mono)">${this.escapeHtml(finding.signatureId)}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Confidence:</span>
              <span>${Math.round((finding.confidence || 0.8) * 100)}%</span>
            </div>
          </div>
          
          <p><strong>Description:</strong> ${this.escapeHtml(finding.description || 'No description available')}</p>
          
          ${finding.matchedText ? `<p><strong>Matched Pattern:</strong> <code>${this.escapeHtml(finding.matchedText.substring(0, 200))}</code></p>` : ''}
          
          ${contextHtml}
          
          ${finding.remediation ? `<p><strong>Remediation:</strong> ${this.escapeHtml(finding.remediation)}</p>` : ''}
          
          ${finding.references && finding.references.length > 0 ? `
            <p><strong>References:</strong></p>
            <ul>
              ${finding.references.map(ref => `<li>${this.escapeHtml(ref)}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>`;
  }
  
  generateCodeBlock(context, highlightLine) {
    if (!context || context.length === 0) return '';
    
    const lines = context.map(ctx => {
      const isHighlight = ctx.isMatch || ctx.lineNumber === highlightLine;
      return `
        <div class="code-line ${isHighlight ? 'line-highlight' : ''}">
          <span class="line-number">${ctx.lineNumber}</span>
          <span class="line-content">${this.escapeHtml(ctx.content)}</span>
        </div>`;
    }).join('');
    
    return `<div class="code-block">${lines}</div>`;
  }
  
  generateTimelineSection(scanResult) {
    const findings = scanResult.findings || [];
    const sortedByTime = [...findings]
      .filter(f => f.timestamp)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    if (sortedByTime.length === 0) {
      return '';
    }
    
    return `
    <div class="card">
      <h2>Detection Timeline</h2>
      <div class="timeline">
        ${sortedByTime.slice(0, 20).map(finding => `
          <div class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <div class="timeline-time">${new Date(finding.timestamp).toLocaleString()}</div>
              <strong>${this.escapeHtml(finding.signatureName || finding.signatureId)}</strong>
              <p style="font-size: 0.875rem; color: var(--color-text-secondary)">
                ${this.escapeHtml(finding.file || 'Unknown file')}
              </p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;
  }
  
  generateRemediationChecklist(findings) {
    const remediations = new Map();
    
    for (const finding of findings) {
      if (finding.remediation) {
        const key = finding.remediation;
        if (!remediations.has(key)) {
          remediations.set(key, {
            action: finding.remediation,
            severity: finding.severity,
            count: 1,
            files: [finding.file]
          });
        } else {
          const existing = remediations.get(key);
          existing.count++;
          if (!existing.files.includes(finding.file)) {
            existing.files.push(finding.file);
          }
        }
      }
    }
    
    const sortedRemediations = [...remediations.values()].sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (order[a.severity] || 4) - (order[b.severity] || 4);
    });
    
    if (sortedRemediations.length === 0) {
      return '';
    }
    
    return `
    <div class="card">
      <h2>Remediation Checklist</h2>
      <p style="margin-bottom: 1rem; color: var(--color-text-secondary)">
        Click checkboxes to track your remediation progress.
      </p>
      ${sortedRemediations.map((item, index) => `
        <div class="remediation-item">
          <div class="checkbox"></div>
          <div>
            <strong>${index + 1}. ${this.escapeHtml(item.action)}</strong>
            <p style="font-size: 0.875rem; color: var(--color-text-secondary)">
              Affects ${item.count} finding(s) in ${item.files.length} file(s)
              <span style="color: var(--color-${item.severity})">(${item.severity.toUpperCase()})</span>
            </p>
          </div>
        </div>
      `).join('')}
    </div>`;
  }
  
  generateFooter(timestamp) {
    return `
    <footer>
      <p>Generated by NeuroLint Layer 8 Security Forensics v${LAYER_8_VERSION}</p>
      <p>Report generated at ${new Date(timestamp).toLocaleString()}</p>
      <p style="margin-top: 0.5rem">
        For more information, visit <a href="https://neurolint.dev" style="color: #3b82f6">neurolint.dev</a>
      </p>
    </footer>`;
  }
  
  formatDuration(ms) {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  }
  
  escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  
  writeToFile(scanResult, filePath, options = {}) {
    const report = this.generateReport(scanResult, options);
    fs.writeFileSync(filePath, report, 'utf8');
    return filePath;
  }
}

module.exports = HTMLReporter;
