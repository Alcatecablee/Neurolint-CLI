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
 * Layer 8: Security Forensics - JSON Reporter
 * 
 * Generates machine-readable JSON reports for automation and CI/CD integration.
 */

'use strict';

const { LAYER_8_VERSION } = require('../constants');
const SeverityCalculator = require('../utils/severity-calculator');

class JSONReporter {
  constructor(options = {}) {
    this.includeContext = options.includeContext !== false;
    this.includeMeta = options.includeMeta !== false;
    this.prettyPrint = options.prettyPrint !== false;
  }
  
  generateReport(scanResult, options = {}) {
    const severity = SeverityCalculator.calculateOverallSeverity(scanResult.findings || []);
    const timestamp = new Date().toISOString();
    
    const report = {
      $schema: 'https://neurolint.dev/schemas/security-report-v1.json',
      version: LAYER_8_VERSION,
      scanId: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp,
      
      status: this.determineStatus(severity),
      
      summary: {
        overallSeverity: severity.level,
        severityScore: severity.score,
        findingsTotal: scanResult.findings?.length || 0,
        findingsBySeverity: severity.breakdown,
        filesScanned: scanResult.stats?.filesScanned || 0,
        filesSkipped: scanResult.stats?.filesSkipped || 0,
        executionTimeMs: scanResult.stats?.totalExecutionTime || 0
      },
      
      findings: this.formatFindings(scanResult.findings || []),
      
      recommendations: this.generateRecommendations(scanResult.findings || []),
      
      metadata: this.includeMeta ? {
        scanMode: options.mode || 'standard',
        targetPath: options.targetPath || '.',
        neurolintVersion: LAYER_8_VERSION,
        platform: process.platform,
        nodeVersion: process.version
      } : undefined
    };
    
    if (this.prettyPrint) {
      return JSON.stringify(report, null, 2);
    }
    
    return JSON.stringify(report);
  }
  
  determineStatus(severity) {
    if (severity.breakdown.critical > 0) return 'critical';
    if (severity.breakdown.high > 0) return 'compromised';
    if (severity.breakdown.medium > 0) return 'warnings';
    if (severity.breakdown.low > 0) return 'minor_issues';
    return 'clean';
  }
  
  formatFindings(findings) {
    return findings.map((finding, index) => {
      const formatted = {
        index: index + 1,
        id: finding.id,
        signatureId: finding.signatureId,
        name: finding.signatureName,
        severity: finding.severity,
        category: finding.category,
        
        location: {
          file: finding.file,
          line: finding.line,
          column: finding.column
        },
        
        details: {
          matchedText: finding.matchedText,
          description: finding.description,
          remediation: finding.remediation,
          references: finding.references || []
        },
        
        confidence: finding.confidence,
        timestamp: finding.timestamp
      };
      
      if (this.includeContext && finding.context) {
        formatted.context = finding.context.map(ctx => ({
          line: ctx.lineNumber,
          content: ctx.content,
          isMatch: ctx.isMatch
        }));
      }
      
      return formatted;
    });
  }
  
  generateRecommendations(findings) {
    const recommendations = [];
    const seenRemediation = new Set();
    
    const sortedFindings = [...findings].sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });
    
    for (const finding of sortedFindings) {
      if (finding.remediation && !seenRemediation.has(finding.remediation)) {
        seenRemediation.add(finding.remediation);
        recommendations.push({
          priority: recommendations.length + 1,
          severity: finding.severity,
          action: finding.remediation,
          affectedFiles: findings
            .filter(f => f.remediation === finding.remediation)
            .map(f => f.file)
            .filter((f, i, arr) => arr.indexOf(f) === i)
        });
      }
    }
    
    return recommendations;
  }
  
  writeToFile(scanResult, filePath, options = {}) {
    const fs = require('fs');
    const report = this.generateReport(scanResult, options);
    fs.writeFileSync(filePath, report, 'utf8');
    return filePath;
  }
}

module.exports = JSONReporter;
