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
 * Layer 8: Security Forensics - Timeline Reconstructor
 * 
 * Analyzes git history to reconstruct when suspicious files were modified,
 * identify potential attack timelines, and correlate changes across the codebase.
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 */

'use strict';

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { SEVERITY_LEVELS, IOC_CATEGORIES } = require('../constants');

class TimelineReconstructor {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.maxCommits = options.maxCommits || 500;
    this.lookbackDays = options.lookbackDays || 90;
    this.suspiciousPatterns = this.loadSuspiciousPatterns();
  }
  
  loadSuspiciousPatterns() {
    return [
      { pattern: /eval\s*\(/gi, name: 'eval() call', severity: SEVERITY_LEVELS.CRITICAL },
      { pattern: /new\s+Function\s*\(/gi, name: 'Function constructor', severity: SEVERITY_LEVELS.HIGH },
      { pattern: /child_process/gi, name: 'child_process import', severity: SEVERITY_LEVELS.HIGH },
      { pattern: /exec\s*\(/gi, name: 'exec() call', severity: SEVERITY_LEVELS.CRITICAL },
      { pattern: /spawn\s*\(/gi, name: 'spawn() call', severity: SEVERITY_LEVELS.HIGH },
      { pattern: /atob\s*\(/gi, name: 'atob() decoding', severity: SEVERITY_LEVELS.MEDIUM },
      { pattern: /Buffer\.from\s*\([^)]+,\s*['"]base64['"]/gi, name: 'Base64 Buffer', severity: SEVERITY_LEVELS.MEDIUM },
      { pattern: /['"]use server['"]/g, name: 'Server action directive', severity: SEVERITY_LEVELS.MEDIUM },
      { pattern: /process\.env/gi, name: 'Environment access', severity: SEVERITY_LEVELS.LOW },
      { pattern: /crypto\.(createCipher|createDecipher)/gi, name: 'Crypto operations', severity: SEVERITY_LEVELS.LOW },
      { pattern: /webhook\.site|pastebin\.com|requestbin/gi, name: 'Suspicious domain', severity: SEVERITY_LEVELS.HIGH },
      { pattern: /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/gi, name: 'IP address URL', severity: SEVERITY_LEVELS.HIGH }
    ];
  }
  
  isGitRepository(targetPath) {
    try {
      execSync('git rev-parse --is-inside-work-tree', {
        cwd: targetPath,
        stdio: 'pipe'
      });
      return true;
    } catch {
      return false;
    }
  }
  
  reconstructTimeline(targetPath, options = {}) {
    if (!this.isGitRepository(targetPath)) {
      return {
        success: false,
        error: 'Not a git repository',
        timeline: [],
        findings: []
      };
    }
    
    const timeline = [];
    const findings = [];
    
    try {
      const commits = this.getRecentCommits(targetPath);
      
      for (const commit of commits) {
        const commitDetails = this.analyzeCommit(targetPath, commit);
        
        if (commitDetails.suspiciousChanges.length > 0 || 
            commitDetails.newFiles.length > 0 ||
            options.includeAll) {
          timeline.push(commitDetails);
        }
        
        findings.push(...commitDetails.findings);
      }
      
      const sensitiveFiles = this.checkSensitiveFiles(targetPath);
      findings.push(...sensitiveFiles);
      
      const unusualAuthors = this.detectUnusualAuthors(commits);
      findings.push(...unusualAuthors);
      
      const suspiciousTiming = this.detectSuspiciousTiming(commits);
      findings.push(...suspiciousTiming);
      
      if (options.detectForcesPush) {
        const forcePushes = this.detectForcePushes(targetPath);
        findings.push(...forcePushes);
      }
      
    } catch (error) {
      if (this.verbose) {
        console.error(`[Layer 8] Timeline reconstruction error: ${error.message}`);
      }
      return {
        success: false,
        error: error.message,
        timeline: [],
        findings: []
      };
    }
    
    return {
      success: true,
      timeline: timeline.sort((a, b) => new Date(b.date) - new Date(a.date)),
      findings,
      stats: {
        totalCommits: timeline.length,
        totalFindings: findings.length,
        dateRange: {
          start: timeline.length > 0 ? timeline[timeline.length - 1].date : null,
          end: timeline.length > 0 ? timeline[0].date : null
        }
      }
    };
  }
  
  getRecentCommits(targetPath) {
    const since = new Date();
    since.setDate(since.getDate() - this.lookbackDays);
    const sinceStr = since.toISOString().split('T')[0];
    
    try {
      const output = execSync(
        `git log --since="${sinceStr}" --format="%H|%an|%ae|%ad|%s" --date=iso -n ${this.maxCommits}`,
        { cwd: targetPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      
      return output.trim().split('\n')
        .filter(line => line.length > 0)
        .map(line => {
          const [hash, author, email, date, ...subject] = line.split('|');
          return {
            hash,
            author,
            email,
            date,
            subject: subject.join('|')
          };
        });
    } catch (error) {
      return [];
    }
  }
  
  analyzeCommit(targetPath, commit) {
    const result = {
      hash: commit.hash,
      shortHash: commit.hash.substring(0, 8),
      author: commit.author,
      email: commit.email,
      date: commit.date,
      subject: commit.subject,
      newFiles: [],
      modifiedFiles: [],
      deletedFiles: [],
      suspiciousChanges: [],
      findings: []
    };
    
    try {
      const diffStat = execSync(
        `git show --stat --format="" ${commit.hash}`,
        { cwd: targetPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      
      const filesChanged = diffStat.trim().split('\n')
        .filter(line => line.includes('|'))
        .map(line => {
          const match = line.match(/^\s*([^|]+)\s*\|/);
          return match ? match[1].trim() : null;
        })
        .filter(f => f);
      
      const nameStatus = execSync(
        `git show --name-status --format="" ${commit.hash}`,
        { cwd: targetPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      
      nameStatus.trim().split('\n').forEach(line => {
        const [status, ...fileParts] = line.split('\t');
        const file = fileParts.join('\t');
        
        if (status === 'A') result.newFiles.push(file);
        else if (status === 'M') result.modifiedFiles.push(file);
        else if (status === 'D') result.deletedFiles.push(file);
      });
      
      for (const file of [...result.newFiles, ...result.modifiedFiles]) {
        const suspicious = this.checkFileSuspicious(targetPath, commit.hash, file);
        if (suspicious.length > 0) {
          result.suspiciousChanges.push({
            file,
            patterns: suspicious
          });
          
          for (const pattern of suspicious) {
            result.findings.push(this.createFinding({
              signatureId: 'NEUROLINT-TL-001',
              signatureName: `Suspicious Pattern: ${pattern.name}`,
              severity: pattern.severity,
              category: IOC_CATEGORIES.PERSISTENCE,
              description: `Pattern "${pattern.name}" introduced in commit ${result.shortHash}`,
              file,
              remediation: `Review commit ${result.shortHash} and verify this change was intentional`,
              references: ['git-forensics'],
              metadata: {
                commitHash: commit.hash,
                author: commit.author,
                date: commit.date
              }
            }));
          }
        }
      }
      
      const sensitiveExtensions = ['.env', '.pem', '.key', '.p12', '.pfx'];
      for (const file of result.newFiles) {
        const ext = path.extname(file).toLowerCase();
        const basename = path.basename(file).toLowerCase();
        
        if (sensitiveExtensions.includes(ext) || 
            basename.includes('secret') ||
            basename.includes('password') ||
            basename.includes('credential')) {
          result.findings.push(this.createFinding({
            signatureId: 'NEUROLINT-TL-002',
            signatureName: 'Sensitive File Added',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.DATA_EXFILTRATION,
            description: `Potentially sensitive file "${file}" was added in commit ${result.shortHash}`,
            file,
            remediation: 'Verify this file should be in version control',
            metadata: {
              commitHash: commit.hash,
              author: commit.author,
              date: commit.date
            }
          }));
        }
      }
      
      const configFiles = ['next.config.js', 'next.config.mjs', 'webpack.config.js', 
                          '.babelrc', 'babel.config.js', 'package.json'];
      for (const file of result.modifiedFiles) {
        const basename = path.basename(file);
        if (configFiles.includes(basename)) {
          result.findings.push(this.createFinding({
            signatureId: 'NEUROLINT-TL-003',
            signatureName: 'Build Configuration Modified',
            severity: SEVERITY_LEVELS.MEDIUM,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Build configuration "${file}" was modified in commit ${result.shortHash}`,
            file,
            remediation: 'Review changes to build configuration files',
            metadata: {
              commitHash: commit.hash,
              author: commit.author,
              date: commit.date
            }
          }));
        }
      }
      
    } catch (error) {
      if (this.verbose) {
        console.error(`[Layer 8] Error analyzing commit ${commit.hash}: ${error.message}`);
      }
    }
    
    return result;
  }
  
  checkFileSuspicious(targetPath, commitHash, file) {
    const matches = [];
    
    try {
      const diff = execSync(
        `git show ${commitHash} -- "${file}"`,
        { cwd: targetPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'], maxBuffer: 10 * 1024 * 1024 }
      );
      
      const addedLines = diff.split('\n')
        .filter(line => line.startsWith('+') && !line.startsWith('+++'))
        .map(line => line.substring(1));
      
      const content = addedLines.join('\n');
      
      for (const { pattern, name, severity } of this.suspiciousPatterns) {
        if (pattern.test(content)) {
          matches.push({ name, severity });
          pattern.lastIndex = 0;
        }
      }
      
    } catch (error) {
    }
    
    return matches;
  }
  
  checkSensitiveFiles(targetPath) {
    const findings = [];
    const sensitivePatterns = [
      { pattern: /\.env(?:\.local|\.production|\.development)?$/i, name: 'Environment file' },
      { pattern: /id_rsa|id_ed25519|id_ecdsa/i, name: 'SSH key' },
      { pattern: /\.pem$|\.key$|\.p12$|\.pfx$/i, name: 'Certificate/Key file' },
      { pattern: /credentials|secrets|passwords/i, name: 'Credentials file' },
      { pattern: /\.npmrc$|\.yarnrc$/i, name: 'Package manager config' }
    ];
    
    try {
      const trackedFiles = execSync(
        'git ls-files',
        { cwd: targetPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      ).trim().split('\n');
      
      for (const file of trackedFiles) {
        for (const { pattern, name } of sensitivePatterns) {
          if (pattern.test(file)) {
            findings.push(this.createFinding({
              signatureId: 'NEUROLINT-TL-004',
              signatureName: `${name} in Repository`,
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.DATA_EXFILTRATION,
              description: `Sensitive file "${file}" (${name}) is tracked in git`,
              file,
              remediation: 'Remove sensitive files from git history using git-filter-branch or BFG'
            }));
            break;
          }
        }
      }
    } catch (error) {
    }
    
    return findings;
  }
  
  detectUnusualAuthors(commits) {
    const findings = [];
    const authorCounts = {};
    
    for (const commit of commits) {
      const key = `${commit.author} <${commit.email}>`;
      authorCounts[key] = (authorCounts[key] || 0) + 1;
    }
    
    const totalCommits = commits.length;
    
    for (const [author, count] of Object.entries(authorCounts)) {
      const percentage = (count / totalCommits) * 100;
      
      if (count === 1 && totalCommits > 10) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-TL-005',
          signatureName: 'Single-commit Author',
          severity: SEVERITY_LEVELS.LOW,
          category: IOC_CATEGORIES.PERSISTENCE,
          description: `Author "${author}" has only 1 commit in the analyzed period`,
          remediation: 'Verify this author is a legitimate contributor',
          metadata: { author, commitCount: count }
        }));
      }
      
      const emailMatch = author.match(/<([^>]+)>/);
      if (emailMatch) {
        const email = emailMatch[1];
        const suspiciousDomains = ['temp-mail', 'guerrilla', 'mailinator', '10minute'];
        for (const domain of suspiciousDomains) {
          if (email.includes(domain)) {
            findings.push(this.createFinding({
              signatureId: 'NEUROLINT-TL-006',
              signatureName: 'Temporary Email Author',
              severity: SEVERITY_LEVELS.MEDIUM,
              category: IOC_CATEGORIES.PERSISTENCE,
              description: `Author "${author}" uses a temporary email service`,
              remediation: 'Investigate commits from this author'
            }));
          }
        }
      }
    }
    
    return findings;
  }
  
  detectSuspiciousTiming(commits) {
    const findings = [];
    
    const hourCounts = {};
    const weekendCommits = [];
    
    for (const commit of commits) {
      const date = new Date(commit.date);
      const hour = date.getHours();
      const dayOfWeek = date.getDay();
      
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
      
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        weekendCommits.push(commit);
      }
      
      if (hour >= 2 && hour <= 5) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-TL-007',
          signatureName: 'Late Night Commit',
          severity: SEVERITY_LEVELS.LOW,
          category: IOC_CATEGORIES.PERSISTENCE,
          description: `Commit ${commit.hash.substring(0, 8)} made at unusual hour (${hour}:00)`,
          remediation: 'Review commits made at unusual hours',
          metadata: {
            commitHash: commit.hash,
            author: commit.author,
            hour
          }
        }));
      }
    }
    
    const sortedCommits = [...commits].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    for (let i = 1; i < sortedCommits.length; i++) {
      const prev = new Date(sortedCommits[i - 1].date);
      const curr = new Date(sortedCommits[i].date);
      const diffMinutes = (curr - prev) / (1000 * 60);
      
      if (diffMinutes > 0 && diffMinutes < 1) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-TL-008',
          signatureName: 'Rapid-fire Commits',
          severity: SEVERITY_LEVELS.LOW,
          category: IOC_CATEGORIES.PERSISTENCE,
          description: `Commits ${sortedCommits[i-1].hash.substring(0, 8)} and ${sortedCommits[i].hash.substring(0, 8)} were made within 1 minute`,
          remediation: 'Review rapid commit sequences for automation or scripted changes'
        }));
      }
    }
    
    return findings;
  }
  
  detectForcePushes(targetPath) {
    const findings = [];
    
    try {
      const reflog = execSync(
        'git reflog --format="%H|%gs|%gd|%ci" -n 100',
        { cwd: targetPath, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
      );
      
      const lines = reflog.trim().split('\n').filter(l => l);
      
      for (const line of lines) {
        if (line.includes('forced-update') || line.includes('reset:')) {
          const [hash, action, ref, date] = line.split('|');
          
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-TL-009',
            signatureName: 'Force Push or Reset Detected',
            severity: SEVERITY_LEVELS.MEDIUM,
            category: IOC_CATEGORIES.PERSISTENCE,
            description: `History modification detected: ${action}`,
            remediation: 'Investigate why history was modified',
            metadata: {
              hash,
              action,
              ref,
              date
            }
          }));
        }
      }
    } catch (error) {
    }
    
    return findings;
  }
  
  createFinding(data) {
    return {
      id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      line: 1,
      column: 1,
      confidence: data.confidence || 0.75,
      timestamp: new Date().toISOString(),
      ...data
    };
  }
  
  generateReport(result) {
    const report = {
      success: result.success,
      generatedAt: new Date().toISOString(),
      stats: result.stats,
      timeline: result.timeline.map(commit => ({
        hash: commit.shortHash,
        author: commit.author,
        date: commit.date,
        subject: commit.subject,
        filesChanged: {
          added: commit.newFiles.length,
          modified: commit.modifiedFiles.length,
          deleted: commit.deletedFiles.length
        },
        suspiciousChanges: commit.suspiciousChanges.length
      })),
      findings: result.findings,
      riskAssessment: this.assessRisk(result)
    };
    
    return report;
  }
  
  assessRisk(result) {
    let score = 0;
    
    for (const finding of result.findings) {
      switch (finding.severity) {
        case SEVERITY_LEVELS.CRITICAL: score += 100; break;
        case SEVERITY_LEVELS.HIGH: score += 50; break;
        case SEVERITY_LEVELS.MEDIUM: score += 20; break;
        case SEVERITY_LEVELS.LOW: score += 5; break;
      }
    }
    
    let level;
    if (score >= 200) level = 'critical';
    else if (score >= 100) level = 'high';
    else if (score >= 50) level = 'medium';
    else if (score > 0) level = 'low';
    else level = 'clean';
    
    return {
      score,
      level,
      summary: this.generateRiskSummary(level, result.findings.length)
    };
  }
  
  generateRiskSummary(level, findingsCount) {
    const summaries = {
      critical: `CRITICAL: ${findingsCount} security-relevant changes detected in git history that require immediate investigation.`,
      high: `HIGH RISK: ${findingsCount} suspicious changes found in git history. Review recommended.`,
      medium: `MEDIUM RISK: ${findingsCount} potentially concerning changes detected. Monitor and review.`,
      low: `LOW RISK: ${findingsCount} minor observations in git history. No immediate action required.`,
      clean: 'No suspicious changes detected in git history within the analyzed period.'
    };
    
    return summaries[level] || summaries.clean;
  }
}

module.exports = TimelineReconstructor;
