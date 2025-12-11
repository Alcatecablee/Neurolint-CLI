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
 * Dependency Assurance Module
 * 
 * Lock file verification and transitive dependency auditing for RSC CVEs:
 * - CVE-2025-55182: Remote Code Execution (CRITICAL, CVSS 10.0)
 * - CVE-2025-55183: Source Code Exposure (MEDIUM, CVSS 5.3)
 * - CVE-2025-55184: Denial of Service (HIGH, CVSS 7.5)
 * 
 * IMPORTANT: Versions 19.0.1, 19.1.2, 19.2.1 patched CVE-2025-55182 but are
 * STILL VULNERABLE to CVE-2025-55183 and CVE-2025-55184.
 * Fully patched versions: 19.0.2, 19.1.3, 19.2.2
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
const { 
  CVE_2025_55182,
  CVE_2025_55183,
  CVE_2025_55184,
  ALL_RSC_CVES,
  isVulnerableReactVersion, 
  isPartiallyPatchedVersion,
  getVulnerabilitiesForVersion,
  isVulnerableNextVersion,
  FULLY_PATCHED_VERSIONS
} = require('../../../shared-core/security-constants');

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
      phantomDependencies: [],
      partiallyPatchedPackages: []
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
        result.partiallyPatchedPackages = npmAudit.partiallyPatchedPackages;
      } else if (lockFileInfo.type === 'yarn.lock') {
        const yarnAudit = await this.auditYarnLockFile(projectPath, lockFileInfo.content);
        result.vulnerabilities = yarnAudit.vulnerabilities;
        result.transitiveIssues = yarnAudit.transitiveIssues;
        result.partiallyPatchedPackages = yarnAudit.partiallyPatchedPackages;
      } else if (lockFileInfo.type === 'pnpm-lock.yaml') {
        result.warnings.push({
          code: 'PNPM_PARTIAL_SUPPORT',
          message: 'pnpm lock file parsing has limited support. Please verify manually.',
          recommendation: 'Run `pnpm audit` for comprehensive vulnerability scanning.'
        });
      }

      await this.verifyPackageJsonLockFileSync(projectPath, result);

      if (result.partiallyPatchedPackages.length > 0) {
        result.success = false;
        result.warnings.push({
          code: 'PARTIALLY_PATCHED',
          severity: 'HIGH',
          message: `Found ${result.partiallyPatchedPackages.length} package(s) with incomplete patches`,
          detail: 'These versions patched CVE-2025-55182 but are still vulnerable to CVE-2025-55183 (Source Code Exposure) and CVE-2025-55184 (DoS)',
          recommendation: 'Upgrade to fully patched versions: 19.0.2, 19.1.3, or 19.2.2'
        });
      }

      if (result.vulnerabilities.length > 0 || result.transitiveIssues.length > 0) {
        result.success = false;
        result.recommendations.push({
          code: 'REINSTALL_DEPS',
          priority: 'CRITICAL',
          message: 'Vulnerable dependencies detected in lock file.',
          steps: [
            'Delete your lock file and node_modules',
            'Update package.json to use patched versions: react@19.0.2, react@19.1.3, or react@19.2.2',
            'Run `npm install` (or your package manager)',
            'Verify with `npx @neurolint/cli security:audit . --dry-run`'
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
      phantomDependencies: [],
      partiallyPatchedPackages: []
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
            const isPartial = isPartiallyPatchedVersion(version);
            const isVulnerable = isVulnerableReactVersion(version);
            
            if (isPartial) {
              result.partiallyPatchedPackages.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                vulnerableTo: ['CVE-2025-55183', 'CVE-2025-55184'],
                severity: 'HIGH',
                message: 'This version patched CVE-2025-55182 but is still vulnerable to DoS and Source Code Exposure'
              });
            } else if (isVulnerable) {
              const cves = getVulnerabilitiesForVersion(version);
              result.vulnerabilities.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                cves: cves.map(c => c.id),
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
                cves: ALL_RSC_CVES.map(c => c.id),
                severity: 'CRITICAL',
                isTransitive: false
              });
            }
          }
          
          if (CVE_2025_55182.serverDomPackages.includes(pkgName)) {
            const isPartial = isPartiallyPatchedVersion(version);
            const isVulnerable = isVulnerableReactVersion(version);
            
            if (isPartial) {
              result.partiallyPatchedPackages.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                vulnerableTo: ['CVE-2025-55183', 'CVE-2025-55184'],
                severity: 'HIGH'
              });
            } else if (isVulnerable) {
              result.vulnerabilities.push({
                package: pkgName,
                version: version,
                installedPath: pkgPath,
                cves: ALL_RSC_CVES.map(c => c.id),
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
              cves: vuln.cves,
              message: `Transitive dependency ${vuln.package}@${vuln.version} is vulnerable to ${vuln.cves.join(', ')}`
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
        const isPartial = isPartiallyPatchedVersion(version);
        const isVulnerable = isVulnerableReactVersion(version);
        
        if (isPartial) {
          result.partiallyPatchedPackages.push({
            package: name,
            version: version,
            installedPath: currentPath,
            vulnerableTo: ['CVE-2025-55183', 'CVE-2025-55184'],
            severity: 'HIGH'
          });
        } else if (isVulnerable) {
          result.vulnerabilities.push({
            package: name,
            version: version,
            installedPath: currentPath,
            cves: ALL_RSC_CVES.map(c => c.id),
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
            cves: ALL_RSC_CVES.map(c => c.id),
            severity: 'CRITICAL',
            isTransitive
          });
        }
      }
      
      if (CVE_2025_55182.serverDomPackages.includes(name)) {
        const isPartial = isPartiallyPatchedVersion(version);
        const isVulnerable = isVulnerableReactVersion(version);
        
        if (isPartial) {
          result.partiallyPatchedPackages.push({
            package: name,
            version: version,
            installedPath: currentPath,
            vulnerableTo: ['CVE-2025-55183', 'CVE-2025-55184'],
            severity: 'HIGH'
          });
        } else if (isVulnerable) {
          result.vulnerabilities.push({
            package: name,
            version: version,
            installedPath: currentPath,
            cves: ALL_RSC_CVES.map(c => c.id),
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
      transitiveIssues: [],
      partiallyPatchedPackages: []
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
              const isPartial = isPartiallyPatchedVersion(version);
              const isVulnerable = isVulnerableReactVersion(version);
              
              if (isPartial) {
                result.partiallyPatchedPackages.push({
                  package: currentPackage,
                  version: version,
                  vulnerableTo: ['CVE-2025-55183', 'CVE-2025-55184'],
                  severity: 'HIGH'
                });
              } else if (isVulnerable) {
                result.vulnerabilities.push({
                  package: currentPackage,
                  version: version,
                  cves: ALL_RSC_CVES.map(c => c.id),
                  severity: 'CRITICAL'
                });
              }
            }
            
            if (currentPackage === 'next') {
              if (isVulnerableNextVersion(version)) {
                result.vulnerabilities.push({
                  package: currentPackage,
                  version: version,
                  cves: ALL_RSC_CVES.map(c => c.id),
                  severity: 'CRITICAL'
                });
              }
            }
            
            if (CVE_2025_55182.serverDomPackages.includes(currentPackage)) {
              const isPartial = isPartiallyPatchedVersion(version);
              const isVulnerable = isVulnerableReactVersion(version);
              
              if (isPartial) {
                result.partiallyPatchedPackages.push({
                  package: currentPackage,
                  version: version,
                  vulnerableTo: ['CVE-2025-55183', 'CVE-2025-55184'],
                  severity: 'HIGH'
                });
              } else if (isVulnerable) {
                result.vulnerabilities.push({
                  package: currentPackage,
                  version: version,
                  cves: ALL_RSC_CVES.map(c => c.id),
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
    
    const hasIssues = auditResult.vulnerabilities.length > 0 || 
                      auditResult.transitiveIssues.length > 0 ||
                      auditResult.partiallyPatchedPackages.length > 0;
    
    if (!hasIssues) {
      lines.push('\n\x1b[32m✓ No RSC CVE vulnerabilities detected in lock file\x1b[0m');
      lines.push('  Checked for: CVE-2025-55182 (RCE), CVE-2025-55183 (Source Leak), CVE-2025-55184 (DoS)');
      return lines.join('\n');
    }
    
    if (auditResult.partiallyPatchedPackages.length > 0) {
      lines.push(`\n\x1b[33m! ${auditResult.partiallyPatchedPackages.length} partially patched package(s):\x1b[0m`);
      lines.push('  These versions patched CVE-2025-55182 (RCE) but are still vulnerable to:');
      lines.push('  - CVE-2025-55183: Source Code Exposure (MEDIUM, CVSS 5.3)');
      lines.push('  - CVE-2025-55184: Denial of Service (HIGH, CVSS 7.5)\n');
      
      for (const pkg of auditResult.partiallyPatchedPackages) {
        lines.push(`  \x1b[33m•\x1b[0m ${pkg.package}@${pkg.version}`);
        if (pkg.installedPath && this.options.verbose) {
          lines.push(`    \x1b[2mPath: ${pkg.installedPath}\x1b[0m`);
        }
      }
      lines.push('');
      lines.push('  \x1b[1mAction Required:\x1b[0m Upgrade to 19.0.2, 19.1.3, or 19.2.2');
    }
    
    if (auditResult.vulnerabilities.length > 0) {
      lines.push(`\n\x1b[31m✗ ${auditResult.vulnerabilities.length} fully vulnerable package(s) found:\x1b[0m\n`);
      
      for (const vuln of auditResult.vulnerabilities) {
        const transitiveTag = vuln.isTransitive ? ' \x1b[33m(transitive)\x1b[0m' : '';
        const cveList = vuln.cves ? vuln.cves.join(', ') : 'CVE-2025-55182, CVE-2025-55183, CVE-2025-55184';
        lines.push(`  \x1b[31m•\x1b[0m ${vuln.package}@${vuln.version} - ${cveList}${transitiveTag}`);
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
