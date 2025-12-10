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
 * Layer 8: Security Forensics - SARIF Reporter
 * 
 * Generates SARIF 2.1.0 format reports for GitHub Security tab integration.
 * Schema: https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 */

'use strict';

const path = require('path');
const { LAYER_8_VERSION, SEVERITY_LEVELS, IOC_CATEGORIES } = require('../constants');
const SeverityCalculator = require('../utils/severity-calculator');

class SARIFReporter {
  constructor(options = {}) {
    this.includeContext = options.includeContext !== false;
    this.prettyPrint = options.prettyPrint !== false;
    this.toolName = options.toolName || 'NeuroLint Layer 8 Security Forensics';
    this.toolVersion = options.toolVersion || LAYER_8_VERSION;
    this.informationUri = options.informationUri || 'https://github.com/neurolint/neurolint';
  }
  
  generateReport(scanResult, options = {}) {
    const findings = scanResult.findings || [];
    const rules = this.generateRules(findings);
    const results = this.generateResults(findings, options);
    
    const sarifReport = {
      $schema: 'https://raw.githubusercontent.com/oasis-tcs/sarif-spec/master/Schemata/sarif-schema-2.1.0.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: this.toolName,
              version: this.toolVersion,
              informationUri: this.informationUri,
              rules: rules,
              properties: {
                layer: 8,
                category: 'Security Forensics',
                capabilities: [
                  'post-exploitation-detection',
                  'ioc-scanning',
                  'behavioral-analysis',
                  'supply-chain-verification'
                ]
              }
            }
          },
          invocations: [
            {
              executionSuccessful: true,
              startTimeUtc: scanResult.stats?.startTime || new Date().toISOString(),
              endTimeUtc: scanResult.stats?.endTime || new Date().toISOString(),
              workingDirectory: {
                uri: this.toFileUri(options.targetPath || process.cwd())
              },
              properties: {
                filesScanned: scanResult.stats?.filesScanned || 0,
                filesSkipped: scanResult.stats?.filesSkipped || 0,
                executionTimeMs: scanResult.stats?.totalExecutionTime || 0,
                scanMode: options.mode || 'standard'
              }
            }
          ],
          results: results,
          automationDetails: {
            id: `neurolint-security-scan/${Date.now()}`,
            guid: this.generateGuid(),
            correlationGuid: options.correlationId || this.generateGuid()
          },
          properties: {
            severity: SeverityCalculator.calculateOverallSeverity(findings)
          }
        }
      ]
    };
    
    if (this.prettyPrint) {
      return JSON.stringify(sarifReport, null, 2);
    }
    
    return JSON.stringify(sarifReport);
  }
  
  generateRules(findings) {
    const rulesMap = new Map();
    
    for (const finding of findings) {
      if (!rulesMap.has(finding.signatureId)) {
        rulesMap.set(finding.signatureId, {
          id: finding.signatureId,
          name: this.sanitizeRuleName(finding.signatureName || finding.signatureId),
          shortDescription: {
            text: finding.signatureName || finding.signatureId
          },
          fullDescription: {
            text: finding.description || `Security issue detected: ${finding.signatureName}`
          },
          helpUri: this.getHelpUri(finding),
          help: {
            text: this.generateHelpText(finding),
            markdown: this.generateHelpMarkdown(finding)
          },
          defaultConfiguration: {
            level: this.mapSeverityToLevel(finding.severity),
            enabled: true
          },
          properties: {
            category: finding.category || 'security',
            severity: finding.severity,
            securitySeverity: this.getSecuritySeverityScore(finding.severity),
            precision: this.getPrecision(finding),
            tags: this.generateTags(finding)
          }
        });
      }
    }
    
    return Array.from(rulesMap.values());
  }
  
  generateResults(findings, options = {}) {
    return findings.map((finding, index) => {
      const result = {
        ruleId: finding.signatureId,
        ruleIndex: this.getRuleIndex(finding.signatureId, findings),
        level: this.mapSeverityToLevel(finding.severity),
        message: {
          text: this.formatMessage(finding),
          markdown: this.formatMessageMarkdown(finding)
        },
        locations: [
          {
            physicalLocation: {
              artifactLocation: {
                uri: this.toRelativeUri(finding.file, options.targetPath),
                uriBaseId: '%SRCROOT%'
              },
              region: {
                startLine: finding.line || 1,
                startColumn: finding.column || 1,
                endLine: finding.endLine || finding.line || 1,
                endColumn: finding.endColumn || (finding.column || 1) + (finding.matchedText?.length || 1),
                snippet: finding.matchedText ? {
                  text: finding.matchedText.substring(0, 500)
                } : undefined
              },
              contextRegion: this.includeContext && finding.context ? {
                startLine: Math.max(1, (finding.line || 1) - 3),
                endLine: (finding.line || 1) + 3,
                snippet: {
                  text: finding.context.map(c => c.content).join('\n')
                }
              } : undefined
            }
          }
        ],
        fingerprints: {
          primaryLocationLineHash: this.generateFingerprint(finding)
        },
        partialFingerprints: {
          'primaryLocationLineHash/v1': this.generatePartialFingerprint(finding)
        },
        properties: {
          findingId: finding.id || `finding-${index + 1}`,
          confidence: finding.confidence || 0.8,
          category: finding.category,
          references: finding.references || [],
          remediation: finding.remediation,
          timestamp: finding.timestamp || new Date().toISOString()
        }
      };
      
      if (finding.fixes) {
        result.fixes = this.generateFixes(finding);
      }
      
      if (finding.relatedLocations && finding.relatedLocations.length > 0) {
        result.relatedLocations = finding.relatedLocations.map((loc, idx) => ({
          id: idx,
          physicalLocation: {
            artifactLocation: {
              uri: this.toRelativeUri(loc.file, options.targetPath),
              uriBaseId: '%SRCROOT%'
            },
            region: {
              startLine: loc.line || 1,
              startColumn: loc.column || 1
            }
          },
          message: {
            text: loc.message || 'Related location'
          }
        }));
      }
      
      return result;
    });
  }
  
  generateFixes(finding) {
    if (!finding.fixes || finding.fixes.length === 0) return undefined;
    
    return finding.fixes.map((fix, index) => ({
      description: {
        text: fix.description || `Fix ${index + 1}`
      },
      artifactChanges: [
        {
          artifactLocation: {
            uri: this.toRelativeUri(finding.file),
            uriBaseId: '%SRCROOT%'
          },
          replacements: fix.replacements || []
        }
      ]
    }));
  }
  
  mapSeverityToLevel(severity) {
    const levelMap = {
      critical: 'error',
      high: 'error',
      medium: 'warning',
      low: 'note',
      info: 'note'
    };
    
    return levelMap[severity] || 'warning';
  }
  
  getSecuritySeverityScore(severity) {
    const scoreMap = {
      critical: '9.0',
      high: '7.0',
      medium: '4.0',
      low: '2.0',
      info: '0.0'
    };
    
    return scoreMap[severity] || '4.0';
  }
  
  getPrecision(finding) {
    if (finding.confidence >= 0.9) return 'very-high';
    if (finding.confidence >= 0.75) return 'high';
    if (finding.confidence >= 0.5) return 'medium';
    return 'low';
  }
  
  generateTags(finding) {
    const tags = ['security'];
    
    if (finding.category) {
      tags.push(finding.category);
    }
    
    if (finding.references) {
      for (const ref of finding.references) {
        if (ref.startsWith('CVE-')) {
          tags.push(ref);
        }
        if (ref.startsWith('MITRE')) {
          tags.push('mitre-attack');
        }
        if (ref.includes('OWASP')) {
          tags.push('owasp');
        }
      }
    }
    
    const severityTag = `severity/${finding.severity}`;
    tags.push(severityTag);
    
    return tags;
  }
  
  getHelpUri(finding) {
    if (finding.references && finding.references.length > 0) {
      const cve = finding.references.find(r => r.startsWith('CVE-'));
      if (cve) {
        return `https://nvd.nist.gov/vuln/detail/${cve}`;
      }
    }
    
    return `https://neurolint.dev/docs/security/${finding.signatureId}`;
  }
  
  generateHelpText(finding) {
    let helpText = finding.description || '';
    
    if (finding.remediation) {
      helpText += `\n\nRemediation: ${finding.remediation}`;
    }
    
    if (finding.references && finding.references.length > 0) {
      helpText += '\n\nReferences:';
      for (const ref of finding.references) {
        helpText += `\n- ${ref}`;
      }
    }
    
    return helpText;
  }
  
  generateHelpMarkdown(finding) {
    let markdown = `## ${finding.signatureName || finding.signatureId}\n\n`;
    markdown += `${finding.description || 'Security issue detected.'}\n\n`;
    
    if (finding.remediation) {
      markdown += `### Remediation\n\n${finding.remediation}\n\n`;
    }
    
    if (finding.references && finding.references.length > 0) {
      markdown += '### References\n\n';
      for (const ref of finding.references) {
        if (ref.startsWith('CVE-')) {
          markdown += `- [${ref}](https://nvd.nist.gov/vuln/detail/${ref})\n`;
        } else if (ref.startsWith('MITRE')) {
          const technique = ref.replace('MITRE ', '');
          markdown += `- [${ref}](https://attack.mitre.org/techniques/${technique}/)\n`;
        } else {
          markdown += `- ${ref}\n`;
        }
      }
    }
    
    return markdown;
  }
  
  formatMessage(finding) {
    let message = finding.signatureName || finding.signatureId;
    
    if (finding.description) {
      message += `: ${finding.description}`;
    }
    
    if (finding.matchedText && finding.matchedText !== '[Behavioral Pattern]') {
      const truncated = finding.matchedText.length > 100 
        ? finding.matchedText.substring(0, 97) + '...'
        : finding.matchedText;
      message += ` (matched: "${truncated}")`;
    }
    
    return message;
  }
  
  formatMessageMarkdown(finding) {
    let markdown = `**${finding.signatureName || finding.signatureId}**`;
    
    if (finding.description) {
      markdown += `\n\n${finding.description}`;
    }
    
    if (finding.matchedText && finding.matchedText !== '[Behavioral Pattern]') {
      const truncated = finding.matchedText.length > 100 
        ? finding.matchedText.substring(0, 97) + '...'
        : finding.matchedText;
      markdown += `\n\n\`\`\`\n${truncated}\n\`\`\``;
    }
    
    if (finding.remediation) {
      markdown += `\n\n**Fix:** ${finding.remediation}`;
    }
    
    return markdown;
  }
  
  sanitizeRuleName(name) {
    return name
      .replace(/[^a-zA-Z0-9\s\-_]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 100);
  }
  
  toFileUri(filePath) {
    if (!filePath) return 'file:///';
    
    const normalized = filePath.replace(/\\/g, '/');
    
    if (normalized.startsWith('/')) {
      return `file://${normalized}`;
    }
    
    return `file:///${normalized}`;
  }
  
  toRelativeUri(filePath, basePath) {
    if (!filePath) return '';
    
    let normalized = filePath.replace(/\\/g, '/');
    
    if (basePath) {
      const normalizedBase = basePath.replace(/\\/g, '/');
      if (normalized.startsWith(normalizedBase)) {
        normalized = normalized.substring(normalizedBase.length);
        if (normalized.startsWith('/')) {
          normalized = normalized.substring(1);
        }
      }
    }
    
    return normalized;
  }
  
  getRuleIndex(signatureId, findings) {
    const uniqueIds = [...new Set(findings.map(f => f.signatureId))];
    return uniqueIds.indexOf(signatureId);
  }
  
  generateGuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  generateFingerprint(finding) {
    const crypto = require('crypto');
    const data = `${finding.signatureId}:${finding.file}:${finding.line}:${finding.column}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
  }
  
  generatePartialFingerprint(finding) {
    const crypto = require('crypto');
    const data = `${finding.signatureId}:${finding.file}`;
    return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
  }
  
  writeToFile(scanResult, filePath, options = {}) {
    const fs = require('fs');
    const report = this.generateReport(scanResult, options);
    fs.writeFileSync(filePath, report, 'utf8');
    return filePath;
  }
  
  generateForGitHub(scanResult, options = {}) {
    return this.generateReport(scanResult, {
      ...options,
      prettyPrint: false
    });
  }
  
  validateSchema(report) {
    try {
      const parsed = typeof report === 'string' ? JSON.parse(report) : report;
      
      const required = ['$schema', 'version', 'runs'];
      for (const field of required) {
        if (!(field in parsed)) {
          return { valid: false, error: `Missing required field: ${field}` };
        }
      }
      
      if (parsed.version !== '2.1.0') {
        return { valid: false, error: `Invalid SARIF version: ${parsed.version}` };
      }
      
      if (!Array.isArray(parsed.runs) || parsed.runs.length === 0) {
        return { valid: false, error: 'runs must be a non-empty array' };
      }
      
      const run = parsed.runs[0];
      if (!run.tool || !run.tool.driver) {
        return { valid: false, error: 'Missing tool.driver in run' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }
}

module.exports = SARIFReporter;
