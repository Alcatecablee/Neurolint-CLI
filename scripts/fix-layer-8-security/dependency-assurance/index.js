/**
 * Dependency Assurance Module
 * 
 * Lock file verification and transitive dependency auditing for CVE-2025-55182.
 * Ensures that patching package.json actually results in secure installed dependencies.
 * 
 * CORE PRINCIPLES:
 * 1. Verify lock files match package.json versions
 * 2. Audit transitive dependencies for vulnerable versions
 * 3. Detect phantom dependencies that could reintroduce vulnerabilities
 * 4. Provide actionable guidance when issues are found
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const { CVE_2025_55182, isVulnerableReactVersion, isVulnerableNextVersion } = require('../../../shared-core/security-constants');

const LOCK_FILE_TYPES = {
  NPM: 'package-lock.json',
  YARN: 'yarn.lock',
  PNPM: 'pnpm-lock.yaml',
  BUN: 'bun.lockb'
};

class DependencyAssuranceModule {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      projectPath: options.projectPath || process.cwd(),
      ...options
    };
  }

  async audit(projectPath = this.options.projectPath) {
    const result = {
      success: true,
      lockFileType: null,
      lockFileExists: false,
      vulnerabilities: [],
      warnings: [],
      recommendations: [],
      transitiveIssues: [],
      phantomDependencies: []
    };

    try {
      const lockFileInfo = await this.detectLockFile(projectPath);
      result.lockFileType = lockFileInfo.type;
      result.lockFileExists = lockFileInfo.exists;

      if (!lockFileInfo.exists) {
        result.warnings.push({
          code: 'NO_LOCK_FILE',
          message: 'No lock file found. Dependencies are not pinned to exact versions.',
          recommendation: 'Run `npm install` or your package manager to generate a lock file.'
        });
        return result;
      }

      if (lockFileInfo.type === 'package-lock.json') {
        const npmAudit = await this.auditNpmLockFile(projectPath, lockFileInfo.content);
        result.vulnerabilities = npmAudit.vulnerabilities;
        result.transitiveIssues = npmAudit.transitiveIssues;
        result.phantomDependencies = npmAudit.phantomDependencies;
      } else if (lockFileInfo.type === 'yarn.lock') {
        const yarnAudit = await this.auditYarnLockFile(projectPath, lockFileInfo.content);
        result.vulnerabilities = yarnAudit.vulnerabilities;
        result.transitiveIssues = yarnAudit.transitiveIssues;
      } else if (lockFileInfo.type === 'pnpm-lock.yaml') {
        result.warnings.push({
          code: 'PNPM_PARTIAL_SUPPORT',
          message: 'pnpm lock file parsing has limited support. Please verify manually.',
          recommendation: 'Run `pnpm audit` for comprehensive vulnerability scanning.'
        });
      }

      await this.verifyPackageJsonLockFileSync(projectPath, result);

      if (result.vulnerabilities.length > 0 || result.transitiveIssues.length > 0) {
        result.success = false;
        result.recommendations.push({
          code: 'REINSTALL_DEPS',
          priority: 'HIGH',
          message: 'Vulnerable dependencies detected in lock file.',
          steps: [
            'Delete your lock file and node_modules',
            'Run `npm install` (or your package manager)',
            'Verify with `npx @neurolint/cli security:cve-2025-55182 . --dry-run`'
          ]
        });
      }

      return result;

    } catch (error) {
      result.success = false;
      result.error = error.message;
      return result;
    }
  }

  async detectLockFile(projectPath) {
    const result = { type: null, exists: false, content: null };

    for (const [type, filename] of Object.entries(LOCK_FILE_TYPES)) {
      const lockPath = path.join(projectPath, filename);
      try {
        const content = await fs.readFile(lockPath, 'utf8');
        result.type = filename;
        result.exists = true;
        result.content = content;
        return result;
      } catch (e) {
      }
    }

    return result;
  }

  async auditNpmLockFile(projectPath, lockContent) {
    const result = {
      vulnerabilities: [],
      transitiveIssues: [],
      phantomDependencies: []
    };

    try {
      const lockData = JSON.parse(lockContent);
      const lockVersion = lockData.lockfileVersion || 1;
      
      if (lockVersion >= 2 && lockData.packages) {
        for (const [pkgPath, pkgData] of Object.entries(lockData.packages)) {
          if (pkgPath === '') continue;
          
          const pkgName = pkgPath.replace(/^node_modules\//, '').split('node_modules/').pop();
          const version = pkgData.version;
          
          if (!version) continue;
          
          if (pkgName === 'react' || pkgName === 'react-dom') {
            if (isVulnerableReactVersion(version)) {
              result.vulnerabilities.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                cve: CVE_2025_55182.id,
                severity: 'CRITICAL',
                isTransitive: pkgPath.includes('node_modules/') && pkgPath.split('node_modules/').length > 2
              });
            }
          }
          
          if (pkgName === 'next') {
            if (isVulnerableNextVersion(version)) {
              result.vulnerabilities.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                cve: CVE_2025_55182.id,
                severity: 'CRITICAL',
                isTransitive: false
              });
            }
          }
          
          if (CVE_2025_55182.serverDomPackages.includes(pkgName)) {
            if (isVulnerableReactVersion(version)) {
              result.vulnerabilities.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                cve: CVE_2025_55182.id,
                severity: 'CRITICAL',
                isTransitive: pkgPath.includes('node_modules/') && pkgPath.split('node_modules/').length > 2
              });
            }
          }
        }
        
        for (const vuln of result.vulnerabilities) {
          if (vuln.isTransitive) {
            result.transitiveIssues.push({
              package: vuln.package,
              version: vuln.version,
              path: vuln.installedPath,
              message: `Transitive dependency ${vuln.package}@${vuln.version} is vulnerable to ${vuln.cve}`
            });
          }
        }
      } else if (lockData.dependencies) {
        this.auditLockV1Dependencies(lockData.dependencies, result, '');
      }

    } catch (error) {
      if (this.options.verbose) {
        console.error('Error parsing package-lock.json:', error.message);
      }
    }

    return result;
  }

  auditLockV1Dependencies(deps, result, parentPath) {
    for (const [name, data] of Object.entries(deps)) {
      const version = data.version;
      const currentPath = parentPath ? `${parentPath}/node_modules/${name}` : `node_modules/${name}`;
      const isTransitive = parentPath !== '';
      
      if (name === 'react' || name === 'react-dom') {
        if (isVulnerableReactVersion(version)) {
          result.vulnerabilities.push({
            package: name,
            version: version,
            installedPath: currentPath,
            cve: CVE_2025_55182.id,
            severity: 'CRITICAL',
            isTransitive
          });
        }
      }
      
      if (name === 'next') {
        if (isVulnerableNextVersion(version)) {
          result.vulnerabilities.push({
            package: name,
            version: version,
            installedPath: currentPath,
            cve: CVE_2025_55182.id,
            severity: 'CRITICAL',
            isTransitive
          });
        }
      }
      
      if (CVE_2025_55182.serverDomPackages.includes(name)) {
        if (isVulnerableReactVersion(version)) {
          result.vulnerabilities.push({
            package: name,
            version: version,
            installedPath: currentPath,
            cve: CVE_2025_55182.id,
            severity: 'CRITICAL',
            isTransitive
          });
        }
      }
      
      if (data.dependencies) {
        this.auditLockV1Dependencies(data.dependencies, result, currentPath);
      }
    }
  }

  async auditYarnLockFile(projectPath, lockContent) {
    const result = {
      vulnerabilities: [],
      transitiveIssues: []
    };

    try {
      const lines = lockContent.split('\n');
      let currentPackage = null;
      let inPackage = false;

      for (const line of lines) {
        if (line.match(/^[a-zA-Z@][^:]+:$/)) {
          const match = line.match(/^"?(@?[^@"]+)@/);
          if (match) {
            currentPackage = match[1];
            inPackage = true;
          }
        } else if (inPackage && line.match(/^\s+version\s+"?([^"]+)"?/)) {
          const versionMatch = line.match(/version\s+"?([^"]+)"?/);
          if (versionMatch && currentPackage) {
            const version = versionMatch[1];
            
            if (currentPackage === 'react' || currentPackage === 'react-dom') {
              if (isVulnerableReactVersion(version)) {
                result.vulnerabilities.push({
                  package: currentPackage,
                  version: version,
                  cve: CVE_2025_55182.id,
                  severity: 'CRITICAL'
                });
              }
            }
            
            if (currentPackage === 'next') {
              if (isVulnerableNextVersion(version)) {
                result.vulnerabilities.push({
                  package: currentPackage,
                  version: version,
                  cve: CVE_2025_55182.id,
                  severity: 'CRITICAL'
                });
              }
            }
            
            if (CVE_2025_55182.serverDomPackages.includes(currentPackage)) {
              if (isVulnerableReactVersion(version)) {
                result.vulnerabilities.push({
                  package: currentPackage,
                  version: version,
                  cve: CVE_2025_55182.id,
                  severity: 'CRITICAL'
                });
              }
            }
          }
          inPackage = false;
          currentPackage = null;
        }
      }

    } catch (error) {
      if (this.options.verbose) {
        console.error('Error parsing yarn.lock:', error.message);
      }
    }

    return result;
  }

  async verifyPackageJsonLockFileSync(projectPath, result) {
    try {
      const packageJsonPath = path.join(projectPath, 'package.json');
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      
      const declaredDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };
      
      for (const vuln of result.vulnerabilities) {
        const declaredVersion = declaredDeps[vuln.package];
        
        if (declaredVersion) {
          const cleanDeclared = declaredVersion.replace(/[\^~>=<]/g, '');
          
          if (cleanDeclared !== vuln.version && !vuln.isTransitive) {
            result.warnings.push({
              code: 'LOCK_DESYNC',
              package: vuln.package,
              message: `Lock file has ${vuln.package}@${vuln.version} but package.json declares ${declaredVersion}`,
              recommendation: 'Run `npm install` to sync lock file with package.json'
            });
          }
        }
      }

    } catch (error) {
    }
  }

  formatReport(auditResult) {
    const lines = [];
    
    lines.push('\n\x1b[1mDependency Assurance Report\x1b[0m');
    lines.push('═'.repeat(50));
    
    if (auditResult.lockFileExists) {
      lines.push(`\x1b[32m✓\x1b[0m Lock file: ${auditResult.lockFileType}`);
    } else {
      lines.push(`\x1b[33m!\x1b[0m No lock file found`);
    }
    
    if (auditResult.vulnerabilities.length === 0 && auditResult.transitiveIssues.length === 0) {
      lines.push('\n\x1b[32m✓ No CVE-2025-55182 vulnerabilities detected in lock file\x1b[0m');
      return lines.join('\n');
    }
    
    if (auditResult.vulnerabilities.length > 0) {
      lines.push(`\n\x1b[31m✗ ${auditResult.vulnerabilities.length} vulnerable package(s) found:\x1b[0m\n`);
      
      for (const vuln of auditResult.vulnerabilities) {
        const transitiveTag = vuln.isTransitive ? ' \x1b[33m(transitive)\x1b[0m' : '';
        lines.push(`  \x1b[31m•\x1b[0m ${vuln.package}@${vuln.version} - ${vuln.cve}${transitiveTag}`);
        if (vuln.installedPath && this.options.verbose) {
          lines.push(`    \x1b[2mPath: ${vuln.installedPath}\x1b[0m`);
        }
      }
    }
    
    if (auditResult.warnings.length > 0) {
      lines.push('\n\x1b[33mWarnings:\x1b[0m');
      for (const warning of auditResult.warnings) {
        lines.push(`  ! ${warning.message}`);
        if (warning.recommendation) {
          lines.push(`    → ${warning.recommendation}`);
        }
      }
    }
    
    if (auditResult.recommendations.length > 0) {
      lines.push('\n\x1b[1mRecommended Actions:\x1b[0m');
      for (const rec of auditResult.recommendations) {
        lines.push(`\n  ${rec.message}`);
        if (rec.steps) {
          for (let i = 0; i < rec.steps.length; i++) {
            lines.push(`    ${i + 1}. ${rec.steps[i]}`);
          }
        }
      }
    }
    
    return lines.join('\n');
  }
}

module.exports = { DependencyAssuranceModule };
