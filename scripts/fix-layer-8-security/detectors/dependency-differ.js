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
 * Layer 8: Security Forensics - Dependency Differ
 * 
 * Analyzes package.json and lock files to detect suspicious dependency changes,
 * potential typosquatting, and supply chain attacks.
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { SEVERITY_LEVELS, IOC_CATEGORIES } = require('../constants');

class DependencyDiffer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.checkTyposquatting = options.checkTyposquatting !== false;
    this.checkIntegrity = options.checkIntegrity !== false;
    this.knownMalicious = this.loadKnownMaliciousPackages();
    this.popularPackages = this.loadPopularPackages();
  }
  
  loadKnownMaliciousPackages() {
    return new Set([
      'event-stream',
      'flatmap-stream', 
      'electron-native-notify',
      'eslint-scope',
      'ua-parser-js',
      'coa',
      'rc',
      'colors',
      'faker',
      'node-ipc',
      'peacenotwar',
      'primereact',
      '@pika/pack',
      'okhsa',
      'klow',
      'klown',
      'crossenv',
      'cross-env.js',
      'crossenv.js',
      'mongose',
      'moogose',
      'lodahs',
      'lodasg',
      'babelcli',
      'bable-cli',
      'd3.js',
      'fabric-js',
      'ffmpeg.js',
      'gruntcli',
      'http-proxy.js',
      'jquery.js',
      'mariadb',
      'mssql.js',
      'mssql-node',
      'mysqljs',
      'node-fabric',
      'node-opencv',
      'node-opensl',
      'node-openssl',
      'node-tkinter',
      'nodecaffe',
      'nodefabric',
      'nodeffmpeg',
      'nodemailer-js',
      'noderequest',
      'nodesass',
      'nodesqlite',
      'opencv.js',
      'openssl.js',
      'proxy.js',
      'shadowsock',
      'smb',
      'sqlite.js',
      'sqliter',
      'sqlserver',
      'tkinter'
    ]);
  }
  
  loadPopularPackages() {
    return new Set([
      'express', 'react', 'lodash', 'axios', 'moment', 'commander', 
      'debug', 'chalk', 'request', 'async', 'bluebird', 'underscore',
      'uuid', 'body-parser', 'mkdirp', 'glob', 'minimist', 'yargs',
      'winston', 'dotenv', 'mongoose', 'socket.io', 'redis', 'pg',
      'mysql', 'sequelize', 'passport', 'jsonwebtoken', 'bcrypt',
      'cors', 'helmet', 'morgan', 'multer', 'nodemailer', 'puppeteer',
      'cheerio', 'rxjs', 'typescript', 'webpack', 'babel', 'eslint',
      'jest', 'mocha', 'chai', 'sinon', 'supertest', 'prettier',
      'next', 'vue', 'angular', 'svelte', 'nuxt', 'gatsby', 'remix',
      'tailwindcss', 'bootstrap', 'material-ui', 'antd', 'styled-components',
      'graphql', 'apollo', 'prisma', 'typeorm', 'knex', 'objection'
    ]);
  }
  
  analyze(targetPath, options = {}) {
    const findings = [];
    
    const packageJsonPath = path.join(targetPath, 'package.json');
    const lockFiles = [
      { name: 'package-lock.json', type: 'npm' },
      { name: 'yarn.lock', type: 'yarn' },
      { name: 'pnpm-lock.yaml', type: 'pnpm' },
      { name: 'bun.lockb', type: 'bun' }
    ];
    
    if (!fs.existsSync(packageJsonPath)) {
      return findings;
    }
    
    let packageJson;
    try {
      packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
      findings.push(this.createFinding({
        signatureId: 'NEUROLINT-DEP-001',
        signatureName: 'Corrupted package.json',
        severity: SEVERITY_LEVELS.HIGH,
        category: IOC_CATEGORIES.SUPPLY_CHAIN,
        description: `Failed to parse package.json: ${error.message}`,
        file: packageJsonPath,
        remediation: 'Restore package.json from version control'
      }));
      return findings;
    }
    
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
      ...packageJson.optionalDependencies,
      ...packageJson.peerDependencies
    };
    
    findings.push(...this.checkForMaliciousPackages(allDeps, packageJsonPath));
    
    if (this.checkTyposquatting) {
      findings.push(...this.detectTyposquatting(allDeps, packageJsonPath));
    }
    
    findings.push(...this.checkSuspiciousVersions(allDeps, packageJsonPath));
    
    findings.push(...this.checkScriptInjection(packageJson, packageJsonPath));
    
    findings.push(...this.checkSuspiciousRepositories(packageJson, packageJsonPath));
    
    for (const lockFile of lockFiles) {
      const lockPath = path.join(targetPath, lockFile.name);
      if (fs.existsSync(lockPath)) {
        if (this.checkIntegrity) {
          findings.push(...this.checkLockfileIntegrity(lockPath, lockFile.type));
        }
        findings.push(...this.analyzeLockfile(lockPath, lockFile.type));
      }
    }
    
    if (options.baseline) {
      findings.push(...this.compareWithBaseline(allDeps, options.baseline, packageJsonPath));
    }
    
    return findings;
  }
  
  checkForMaliciousPackages(deps, filePath) {
    const findings = [];
    
    for (const [name, version] of Object.entries(deps || {})) {
      if (this.knownMalicious.has(name)) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-DEP-002',
          signatureName: 'Known Malicious Package',
          severity: SEVERITY_LEVELS.CRITICAL,
          category: IOC_CATEGORIES.SUPPLY_CHAIN,
          description: `Package "${name}" is known to be malicious or compromised`,
          file: filePath,
          matchedText: `"${name}": "${version}"`,
          remediation: `Remove ${name} immediately and audit your codebase`,
          references: ['npm advisory', 'MITRE T1195.002']
        }));
      }
    }
    
    return findings;
  }
  
  detectTyposquatting(deps, filePath) {
    const findings = [];
    
    for (const [name, version] of Object.entries(deps || {})) {
      for (const popular of this.popularPackages) {
        if (name === popular) continue;
        
        const distance = this.levenshteinDistance(name, popular);
        const similarity = 1 - (distance / Math.max(name.length, popular.length));
        
        if (distance <= 2 && distance > 0 && similarity > 0.7) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-003',
            signatureName: 'Potential Typosquatting',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Package "${name}" is suspiciously similar to popular package "${popular}"`,
            file: filePath,
            matchedText: `"${name}": "${version}"`,
            remediation: `Verify you intended to install "${name}" and not "${popular}"`,
            confidence: similarity
          }));
        }
      }
      
      const typosquatPatterns = [
        { pattern: /-js$/, suggestion: 'without -js suffix' },
        { pattern: /^node-/, suggestion: 'without node- prefix' },
        { pattern: /\.js$/, suggestion: 'without .js suffix' },
        { pattern: /-node$/, suggestion: 'without -node suffix' }
      ];
      
      for (const { pattern, suggestion } of typosquatPatterns) {
        if (pattern.test(name)) {
          const normalizedName = name.replace(pattern, '');
          if (this.popularPackages.has(normalizedName)) {
            findings.push(this.createFinding({
              signatureId: 'NEUROLINT-DEP-004',
              signatureName: 'Suspicious Package Name Pattern',
              severity: SEVERITY_LEVELS.MEDIUM,
              category: IOC_CATEGORIES.SUPPLY_CHAIN,
              description: `Package "${name}" may be typosquatting "${normalizedName}" (${suggestion})`,
              file: filePath,
              matchedText: `"${name}": "${version}"`,
              remediation: `Verify this is the intended package`
            }));
          }
        }
      }
    }
    
    return findings;
  }
  
  checkSuspiciousVersions(deps, filePath) {
    const findings = [];
    
    for (const [name, version] of Object.entries(deps || {})) {
      if (version.includes('git') || version.includes('github') || version.includes('://')) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-DEP-005',
          signatureName: 'Git/URL Dependency',
          severity: SEVERITY_LEVELS.MEDIUM,
          category: IOC_CATEGORIES.SUPPLY_CHAIN,
          description: `Package "${name}" is installed from git/URL instead of registry`,
          file: filePath,
          matchedText: `"${name}": "${version}"`,
          remediation: 'Prefer installing packages from npm registry for better security'
        }));
        
        if (version.includes('://') && !version.includes('github.com') && !version.includes('gitlab.com')) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-006',
            signatureName: 'Suspicious URL Dependency',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Package "${name}" is installed from untrusted URL`,
            file: filePath,
            matchedText: `"${name}": "${version}"`,
            remediation: 'Use npm registry or trusted git hosts only'
          }));
        }
      }
      
      if (version.includes('file:') || version.includes('link:')) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-DEP-007',
          signatureName: 'Local File Dependency',
          severity: SEVERITY_LEVELS.LOW,
          category: IOC_CATEGORIES.SUPPLY_CHAIN,
          description: `Package "${name}" is linked locally`,
          file: filePath,
          matchedText: `"${name}": "${version}"`,
          remediation: 'Ensure local dependencies are intentional'
        }));
      }
      
      if (/^[0-9]+\.[0-9]+\.[0-9]+-[a-z]+\.[0-9]+$/i.test(version)) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-DEP-008',
          signatureName: 'Pre-release Version',
          severity: SEVERITY_LEVELS.LOW,
          category: IOC_CATEGORIES.SUPPLY_CHAIN,
          description: `Package "${name}" uses pre-release version`,
          file: filePath,
          matchedText: `"${name}": "${version}"`,
          remediation: 'Consider using stable versions in production'
        }));
      }
    }
    
    return findings;
  }
  
  checkScriptInjection(packageJson, filePath) {
    const findings = [];
    const scripts = packageJson.scripts || {};
    
    const dangerousPatterns = [
      { pattern: /curl\s+.*\|\s*(?:ba)?sh/i, name: 'Remote Script Execution' },
      { pattern: /wget\s+.*\|\s*(?:ba)?sh/i, name: 'Remote Script Execution' },
      { pattern: /eval\s*\(/i, name: 'Eval in Script' },
      { pattern: /\bnode\s+-e\s+['"].*(?:http|https|fetch)/i, name: 'Inline Network Request' },
      { pattern: /base64\s+(?:-d|--decode)/i, name: 'Base64 Decode' },
      { pattern: /\\x[0-9a-f]{2}/gi, name: 'Hex Escape Sequence' },
      { pattern: /rm\s+-rf\s+[\/~]/i, name: 'Destructive Command' },
      { pattern: />\s*\/dev\/tcp\//i, name: 'Network Redirect' }
    ];
    
    for (const [scriptName, command] of Object.entries(scripts)) {
      for (const { pattern, name } of dangerousPatterns) {
        if (pattern.test(command)) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-009',
            signatureName: `Dangerous Script: ${name}`,
            severity: SEVERITY_LEVELS.CRITICAL,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Script "${scriptName}" contains dangerous pattern: ${name}`,
            file: filePath,
            matchedText: command.substring(0, 200),
            remediation: `Review and remove malicious code from "${scriptName}" script`
          }));
        }
      }
      
      const hookScripts = ['preinstall', 'install', 'postinstall', 'preuninstall', 'postuninstall'];
      if (hookScripts.includes(scriptName)) {
        if (command.includes('node ') || command.includes('npx ') || command.includes('sh ')) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-010',
            signatureName: 'Lifecycle Script Hook',
            severity: SEVERITY_LEVELS.MEDIUM,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Lifecycle hook "${scriptName}" executes code during install`,
            file: filePath,
            matchedText: command.substring(0, 200),
            remediation: 'Review lifecycle scripts for malicious behavior'
          }));
        }
      }
    }
    
    return findings;
  }
  
  checkSuspiciousRepositories(packageJson, filePath) {
    const findings = [];
    
    if (packageJson.repository) {
      const repo = typeof packageJson.repository === 'string' 
        ? packageJson.repository 
        : packageJson.repository.url;
      
      if (repo && !repo.includes('github.com') && 
          !repo.includes('gitlab.com') && 
          !repo.includes('bitbucket.org')) {
        findings.push(this.createFinding({
          signatureId: 'NEUROLINT-DEP-011',
          signatureName: 'Non-standard Repository',
          severity: SEVERITY_LEVELS.LOW,
          category: IOC_CATEGORIES.SUPPLY_CHAIN,
          description: 'Package uses non-standard repository hosting',
          file: filePath,
          matchedText: repo,
          remediation: 'Verify the repository is legitimate'
        }));
      }
    }
    
    return findings;
  }
  
  checkLockfileIntegrity(lockPath, lockType) {
    const findings = [];
    
    try {
      const content = fs.readFileSync(lockPath, 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');
      
      if (lockType === 'npm') {
        const lockJson = JSON.parse(content);
        
        const checkPackage = (name, pkg, parentPath = '') => {
          const fullPath = parentPath ? `${parentPath}/${name}` : name;
          
          if (pkg.resolved && !pkg.resolved.includes('registry.npmjs.org') &&
              !pkg.resolved.includes('registry.npm.taobao.org') &&
              !pkg.resolved.includes('registry.npmmirror.com')) {
            findings.push(this.createFinding({
              signatureId: 'NEUROLINT-DEP-012',
              signatureName: 'Non-standard Registry',
              severity: SEVERITY_LEVELS.MEDIUM,
              category: IOC_CATEGORIES.SUPPLY_CHAIN,
              description: `Package "${fullPath}" resolved from non-standard registry`,
              file: lockPath,
              matchedText: pkg.resolved,
              remediation: 'Verify the package source is trusted'
            }));
          }
          
          if (pkg.dependencies) {
            for (const [depName, depPkg] of Object.entries(pkg.dependencies)) {
              checkPackage(depName, depPkg, fullPath);
            }
          }
        };
        
        if (lockJson.packages) {
          for (const [pkgPath, pkg] of Object.entries(lockJson.packages)) {
            if (pkgPath && pkg) {
              checkPackage(pkgPath, pkg);
            }
          }
        }
      }
      
    } catch (error) {
      findings.push(this.createFinding({
        signatureId: 'NEUROLINT-DEP-013',
        signatureName: 'Corrupted Lockfile',
        severity: SEVERITY_LEVELS.HIGH,
        category: IOC_CATEGORIES.SUPPLY_CHAIN,
        description: `Failed to parse lockfile: ${error.message}`,
        file: lockPath,
        remediation: 'Regenerate lockfile with npm/yarn/pnpm install'
      }));
    }
    
    return findings;
  }
  
  analyzeLockfile(lockPath, lockType) {
    const findings = [];
    
    try {
      const content = fs.readFileSync(lockPath, 'utf8');
      
      if (lockType === 'npm') {
        const lockJson = JSON.parse(content);
        
        if (lockJson.packages) {
          for (const [pkgPath, pkg] of Object.entries(lockJson.packages)) {
            if (pkg.hasInstallScript) {
              const pkgName = pkgPath.replace('node_modules/', '');
              findings.push(this.createFinding({
                signatureId: 'NEUROLINT-DEP-014',
                signatureName: 'Package with Install Script',
                severity: SEVERITY_LEVELS.LOW,
                category: IOC_CATEGORIES.SUPPLY_CHAIN,
                description: `Package "${pkgName}" has install scripts`,
                file: lockPath,
                remediation: 'Review install scripts for security issues'
              }));
            }
          }
        }
      }
    } catch (error) {
    }
    
    return findings;
  }
  
  compareWithBaseline(currentDeps, baselinePath, filePath) {
    const findings = [];
    
    try {
      const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
      const baselineDeps = {
        ...baseline.dependencies,
        ...baseline.devDependencies
      };
      
      for (const [name, version] of Object.entries(currentDeps)) {
        if (!(name in baselineDeps)) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-015',
            signatureName: 'New Dependency Added',
            severity: SEVERITY_LEVELS.MEDIUM,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `New dependency "${name}@${version}" not in baseline`,
            file: filePath,
            matchedText: `"${name}": "${version}"`,
            remediation: 'Verify this dependency was intentionally added'
          }));
        } else if (baselineDeps[name] !== version) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-016',
            signatureName: 'Dependency Version Changed',
            severity: SEVERITY_LEVELS.LOW,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Dependency "${name}" changed from ${baselineDeps[name]} to ${version}`,
            file: filePath,
            matchedText: `"${name}": "${version}"`,
            remediation: 'Verify this version change was intentional'
          }));
        }
      }
      
      for (const name of Object.keys(baselineDeps)) {
        if (!(name in currentDeps)) {
          findings.push(this.createFinding({
            signatureId: 'NEUROLINT-DEP-017',
            signatureName: 'Dependency Removed',
            severity: SEVERITY_LEVELS.LOW,
            category: IOC_CATEGORIES.SUPPLY_CHAIN,
            description: `Dependency "${name}" was removed from baseline`,
            file: filePath,
            remediation: 'Verify this dependency removal was intentional'
          }));
        }
      }
      
    } catch (error) {
      if (this.verbose) {
        console.error(`[Layer 8] Failed to load baseline: ${error.message}`);
      }
    }
    
    return findings;
  }
  
  levenshteinDistance(str1, str2) {
    const m = str1.length;
    const n = str2.length;
    
    if (m === 0) return n;
    if (n === 0) return m;
    
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,
          dp[i][j - 1] + 1,
          dp[i - 1][j - 1] + cost
        );
      }
    }
    
    return dp[m][n];
  }
  
  createFinding(data) {
    return {
      id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      line: 1,
      column: 1,
      confidence: data.confidence || 0.8,
      timestamp: new Date().toISOString()
    };
  }
  
  generateReport(findings) {
    return {
      summary: {
        total: findings.length,
        critical: findings.filter(f => f.severity === SEVERITY_LEVELS.CRITICAL).length,
        high: findings.filter(f => f.severity === SEVERITY_LEVELS.HIGH).length,
        medium: findings.filter(f => f.severity === SEVERITY_LEVELS.MEDIUM).length,
        low: findings.filter(f => f.severity === SEVERITY_LEVELS.LOW).length
      },
      findings: findings,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = DependencyDiffer;
