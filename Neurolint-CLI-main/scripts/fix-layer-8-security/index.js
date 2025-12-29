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
 * Layer 8: Security Forensics
 * 
 * Post-exploitation detection, compromise scanning, and incident response.
 * 
 * CORE PRINCIPLES (following NeuroLint architecture):
 * 
 * 1. READ-ONLY BY DEFAULT: Layer 8 is primarily a detection layer.
 *    It analyzes code but does NOT modify it unless explicitly in quarantine mode.
 * 
 * 2. NEVER BREAK CODE: Even in quarantine mode, we follow the AST → Regex → Revert
 *    pattern. If validation fails, we revert to the original state.
 * 
 * 3. LAYER CONTRACT: Implements the standard NeuroLint layer interface:
 *    - analyze(code, options) - Detect issues (primary function)
 *    - transform(code, options) - Quarantine/neutralize (optional, requires explicit flag)
 * 
 * 4. INTEGRATION WITH LAYER 7: Emits securityFindings[] that Layer 7 (Adaptive)
 *    can consume for pattern learning. Layer 8 owns detection, Layer 7 observes.
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');

const DetectorOrchestrator = require('./detectors');
const { CLIReporter, JSONReporter } = require('./reporters');
const SeverityCalculator = require('./utils/severity-calculator');
const HashUtils = require('./utils/hash-utils');
const ErrorAggregator = require('./utils/error-aggregator');
const { 
  LAYER_8_VERSION, 
  DETECTION_MODES, 
  MODE_CONFIGURATIONS,
  EXCLUDED_PATHS_DEFAULT,
  SEVERITY_LEVELS
} = require('./constants');

const LAYER_INFO = {
  id: 8,
  name: 'security-forensics',
  version: LAYER_8_VERSION,
  description: 'Post-exploitation detection and incident response',
  supportsAST: true,
  isReadOnly: true
};

class Layer8SecurityForensics {
  constructor(options = {}) {
    this.options = {
      mode: options.mode || DETECTION_MODES.STANDARD,
      verbose: options.verbose || false,
      dryRun: options.dryRun !== false,
      quarantine: options.quarantine || false,
      failOn: options.failOn || 'critical',
      exclude: options.exclude || EXCLUDED_PATHS_DEFAULT,
      include: options.include || ['**/*.{js,jsx,ts,tsx,json,mjs,cjs}'],
      ...options
    };
    
    this.errorAggregator = new ErrorAggregator({ verbose: this.options.verbose });
    
    this.detector = new DetectorOrchestrator({
      mode: this.options.mode,
      verbose: this.options.verbose,
      customSignatures: this.options.customSignatures
    });
    
    this.cliReporter = new CLIReporter({
      verbose: this.options.verbose,
      colors: this.options.colors,
      showContext: this.options.showContext
    });
    
    this.jsonReporter = new JSONReporter({
      includeContext: this.options.includeContext,
      prettyPrint: this.options.prettyPrint
    });
  }
  
  async analyze(code, options = {}) {
    const filePath = options.filename || options.filePath || 'unknown';
    const startTime = Date.now();
    
    try {
      const result = await this.detector.scanFile(code, filePath, options);
      
      const severity = SeverityCalculator.calculateOverallSeverity(result.findings);
      
      return {
        layer: LAYER_INFO.id,
        layerName: LAYER_INFO.name,
        success: true,
        issues: result.findings.map(f => ({
          type: f.signatureId,
          message: f.description,
          severity: f.severity,
          location: { line: f.line, column: f.column },
          fix: f.remediation
        })),
        securityFindings: result.findings,
        summary: {
          overallSeverity: severity.level,
          findingsCount: result.findings.length,
          breakdown: severity.breakdown,
          shouldFail: SeverityCalculator.shouldFailBuild(severity, this.options.failOn)
        },
        executionTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        layer: LAYER_INFO.id,
        layerName: LAYER_INFO.name,
        success: false,
        issues: [],
        securityFindings: [],
        error: error.message,
        executionTime: Date.now() - startTime
      };
    }
  }
  
  async transform(code, options = {}) {
    if (!this.options.quarantine) {
      // Even in read-only mode, perform analysis to emit securityFindings for Layer 7
      const analysis = await this.analyze(code, options);
      return {
        success: true,
        code: code,
        originalCode: code,
        changeCount: 0,
        securityFindings: analysis.securityFindings || [],
        message: 'Layer 8 is read-only. Enable quarantine mode for code modification.',
        executionTime: 0
      };
    }
    
    const originalCode = code;
    const startTime = Date.now();
    
    try {
      const analysis = await this.analyze(code, options);
      
      if (analysis.securityFindings.length === 0) {
        return {
          success: true,
          code: originalCode,
          originalCode,
          changeCount: 0,
          securityFindings: [],
          message: 'No security issues to quarantine',
          executionTime: Date.now() - startTime
        };
      }
      
      let modifiedCode = code;
      let changeCount = 0;
      
      for (const finding of analysis.securityFindings) {
        if (finding.severity === SEVERITY_LEVELS.CRITICAL) {
          const result = this.neutralizeThreat(modifiedCode, finding);
          if (result.changed) {
            modifiedCode = result.code;
            changeCount++;
          }
        }
      }
      
      const validation = this.validateTransformation(originalCode, modifiedCode);
      
      if (validation.shouldRevert) {
        return {
          success: false,
          code: originalCode,
          originalCode,
          changeCount: 0,
          securityFindings: analysis.securityFindings || [],
          revertReason: validation.reason,
          message: 'Transformation reverted to preserve code integrity',
          executionTime: Date.now() - startTime
        };
      }
      
      return {
        success: true,
        code: modifiedCode,
        originalCode,
        changeCount,
        securityFindings: analysis.securityFindings || [],
        message: `Neutralized ${changeCount} critical threats`,
        executionTime: Date.now() - startTime
      };
      
    } catch (error) {
      return {
        success: false,
        code: originalCode,
        originalCode,
        changeCount: 0,
        securityFindings: [],
        error: error.message,
        message: 'Transformation failed, original code preserved',
        executionTime: Date.now() - startTime
      };
    }
  }
  
  neutralizeThreat(code, finding) {
    const lines = code.split('\n');
    const lineIndex = finding.line - 1;
    
    if (lineIndex < 0 || lineIndex >= lines.length) {
      return { changed: false, code };
    }
    
    const originalLine = lines[lineIndex];
    const commentPrefix = '/* NEUROLINT-QUARANTINE: ';
    const commentSuffix = ` [${finding.signatureId}] */`;
    
    if (originalLine.includes('NEUROLINT-QUARANTINE')) {
      return { changed: false, code };
    }
    
    lines[lineIndex] = commentPrefix + originalLine + commentSuffix;
    
    return {
      changed: true,
      code: lines.join('\n')
    };
  }
  
  validateTransformation(before, after) {
    if (before === after) {
      return { shouldRevert: false, reason: 'No changes made' };
    }
    
    try {
      const parser = require('@babel/parser');
      parser.parse(after, {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        allowImportExportEverywhere: true,
        strictMode: false
      });
      return { shouldRevert: false };
    } catch (error) {
      return { 
        shouldRevert: true, 
        reason: `Syntax error after transformation: ${error.message}` 
      };
    }
  }
  
  async scanCompromise(targetPath, options = {}) {
    const startTime = Date.now();
    const files = await this.getFiles(targetPath, options);
    
    if (options.verbose) {
      console.log(`Scanning ${files.length} files for indicators of compromise...`);
    }
    
    const fileContents = await Promise.all(
      files.map(async (filePath) => {
        try {
          const code = await fs.readFile(filePath, 'utf8');
          return { code, filePath };
        } catch (error) {
          return null;
        }
      })
    );
    
    const validFiles = fileContents.filter(f => f !== null);
    
    const result = await this.detector.scanMultipleFiles(validFiles, {
      concurrency: options.concurrency || 10,
      onProgress: options.onProgress
    });
    
    result.targetPath = targetPath;
    result.scanType = 'compromise-scan';
    result.mode = this.options.mode;
    
    return result;
  }
  
  async createBaseline(targetPath, options = {}) {
    const outputPath = options.output || path.join(targetPath, '.neurolint', 'security-baseline.json');
    
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    const hashes = await HashUtils.hashDirectory(targetPath, {
      exclude: this.options.exclude,
      onProgress: options.onProgress
    });
    
    const baseline = {
      version: LAYER_8_VERSION,
      created: new Date().toISOString(),
      projectRoot: path.resolve(targetPath),
      fileCount: Object.keys(hashes).length,
      files: hashes,
      config: {
        excludePatterns: this.options.exclude
      }
    };
    
    await fs.writeFile(outputPath, JSON.stringify(baseline, null, 2), 'utf8');
    
    return {
      success: true,
      baselinePath: outputPath,
      fileCount: baseline.fileCount,
      created: baseline.created
    };
  }
  
  async compareBaseline(targetPath, baselinePath, options = {}) {
    const baselineContent = await fs.readFile(baselinePath, 'utf8');
    const baseline = JSON.parse(baselineContent);
    
    const currentHashes = await HashUtils.hashDirectory(targetPath, {
      exclude: this.options.exclude,
      onProgress: options.onProgress
    });
    
    const comparison = HashUtils.compareHashes(baseline.files, currentHashes);
    
    return {
      success: true,
      baselineDate: baseline.created,
      comparison,
      summary: {
        added: comparison.added.length,
        removed: comparison.removed.length,
        modified: comparison.modified.length,
        unchanged: comparison.unchanged.length,
        hasChanges: comparison.hasChanges
      }
    };
  }
  
  async getFiles(targetPath, options = {}) {
    const files = [];
    const include = options.include || this.options.include;
    const exclude = options.exclude || this.options.exclude;
    const self = this;
    
    async function walkDir(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(targetPath, fullPath).replace(/\\/g, '/');
          
          const shouldExclude = exclude.some(pattern => {
            // Normalize pattern for cross-platform compatibility
            const normalizedPattern = pattern.replace(/\\/g, '/');
            
            if (normalizedPattern.includes('**')) {
              // Extract the core directory/file name from patterns like **/.neurolint/**
              // This handles patterns like **/.neurolint/**, **/node_modules/**, etc.
              const coreMatch = normalizedPattern.match(/\*\*\/([^/*]+)/);
              if (coreMatch) {
                const coreName = coreMatch[1];
                // Check if the path contains this directory/file name as a path segment
                // This works for both root-level and nested paths on all platforms
                const pathParts = relativePath.split('/');
                if (pathParts.some(part => part === coreName)) {
                  return true;
                }
              }
              
              // Fallback: convert glob to regex for complex patterns
              const simplePattern = normalizedPattern
                .replace(/\./g, '\\.')  // Escape dots
                .replace(/\*\*/g, '.*')
                .replace(/\*/g, '[^/]*');
              // Test with optional leading content for root-level matches
              return new RegExp(simplePattern).test(relativePath) || 
                     new RegExp('^' + simplePattern.replace(/^\.\*\//, '')).test(relativePath);
            }
            // Simple pattern: just check if path includes the pattern
            const cleanPattern = normalizedPattern.replace(/\*\*/g, '').replace(/\*/g, '').replace(/\//g, '');
            return relativePath.includes(cleanPattern);
          });
          
          if (shouldExclude) continue;
          
          if (entry.isDirectory()) {
            await walkDir(fullPath);
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.json', '.mjs', '.cjs'];
            
            if (validExtensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        if (self.errorAggregator) {
          self.errorAggregator.addError(error, { 
            phase: 'file-discovery', 
            directory: dir 
          });
        }
      }
    }
    
    await walkDir(targetPath);
    return files;
  }
  
  async incidentResponse(targetPath, options = {}) {
    const startTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      targetPath: path.resolve(targetPath),
      mode: options.mode || 'full',
      phases: {},
      summary: {},
      recommendations: []
    };
    
    const onProgress = options.onProgress || (() => {});
    
    try {
      onProgress({ phase: 'code-scan', status: 'starting', message: 'Scanning for indicators of compromise...' });
      const scanResult = await this.scanCompromise(targetPath, {
        verbose: options.verbose,
        onProgress: (p) => onProgress({ phase: 'code-scan', ...p })
      });
      results.phases.codeScan = {
        success: true,
        findings: scanResult.findings || [],
        stats: scanResult.stats
      };
      onProgress({ phase: 'code-scan', status: 'complete', findings: scanResult.findings?.length || 0 });
      
      if (options.includeTimeline !== false) {
        onProgress({ phase: 'timeline', status: 'starting', message: 'Reconstructing git timeline...' });
        try {
          const { TimelineReconstructor } = require('./forensics');
          const timelineReconstructor = new TimelineReconstructor({
            verbose: options.verbose,
            lookbackDays: options.lookbackDays || 30,
            maxCommits: options.maxCommits || 100
          });
          
          const timelineResult = timelineReconstructor.reconstructTimeline(targetPath, {
            includeAll: options.includeAllCommits,
            detectForcesPush: true
          });
          
          results.phases.timeline = {
            success: timelineResult.success,
            timeline: timelineResult.timeline || [],
            findings: timelineResult.findings || [],
            stats: timelineResult.stats
          };
          onProgress({ phase: 'timeline', status: 'complete', findings: timelineResult.findings?.length || 0 });
        } catch (error) {
          results.phases.timeline = {
            success: false,
            error: error.message,
            findings: []
          };
          onProgress({ phase: 'timeline', status: 'error', error: error.message });
        }
      }
      
      if (options.includeDependencies !== false) {
        onProgress({ phase: 'dependencies', status: 'starting', message: 'Analyzing dependencies...' });
        try {
          const DependencyDiffer = require('./detectors/dependency-differ');
          const dependencyDiffer = new DependencyDiffer({
            verbose: options.verbose,
            checkTyposquatting: true,
            checkIntegrity: true
          });
          
          const depFindings = dependencyDiffer.analyze(targetPath, {
            baseline: options.dependencyBaseline
          });
          
          results.phases.dependencies = {
            success: true,
            findings: depFindings || []
          };
          onProgress({ phase: 'dependencies', status: 'complete', findings: depFindings?.length || 0 });
        } catch (error) {
          results.phases.dependencies = {
            success: false,
            error: error.message,
            findings: []
          };
          onProgress({ phase: 'dependencies', status: 'error', error: error.message });
        }
      }
      
      if (options.includeBehavioral !== false) {
        onProgress({ phase: 'behavioral', status: 'starting', message: 'Running behavioral analysis...' });
        try {
          const BehavioralAnalyzer = require('./detectors/behavioral-analyzer');
          const behavioralAnalyzer = new BehavioralAnalyzer({
            verbose: options.verbose,
            includeContext: true
          });
          
          const files = await this.getFiles(targetPath, options);
          const behavioralFindings = [];
          const skippedFiles = [];
          let analyzedCount = 0;
          
          for (const filePath of files) {
            try {
              const fsSync = require('fs');
              const code = fsSync.readFileSync(filePath, 'utf8');
              const fileFindings = behavioralAnalyzer.analyze(code, filePath, options);
              behavioralFindings.push(...fileFindings);
              analyzedCount++;
            } catch (e) {
              skippedFiles.push({ file: filePath, error: e.message });
            }
          }
          
          const hasPartialCoverage = skippedFiles.length > 0 && files.length > 0;
          const coveragePercent = files.length > 0 ? Math.round((analyzedCount / files.length) * 100) : 100;
          
          const minCoverageThreshold = 50;
          const phaseSucceeded = coveragePercent >= minCoverageThreshold || files.length === 0;
          
          results.phases.behavioral = {
            success: phaseSucceeded,
            error: !phaseSucceeded ? `Insufficient coverage: only ${coveragePercent}% of files could be analyzed` : undefined,
            findings: behavioralFindings,
            stats: {
              filesAnalyzed: analyzedCount,
              filesSkipped: skippedFiles.length,
              coveragePercent
            },
            partialCoverage: hasPartialCoverage,
            skippedFiles: skippedFiles.length > 0 ? skippedFiles.slice(0, 10) : undefined
          };
          onProgress({ phase: 'behavioral', status: phaseSucceeded ? 'complete' : 'partial', findings: behavioralFindings.length });
        } catch (error) {
          results.phases.behavioral = {
            success: false,
            error: error.message,
            findings: []
          };
          onProgress({ phase: 'behavioral', status: 'error', error: error.message });
        }
      }
      
      const allFindings = [
        ...(results.phases.codeScan?.findings || []),
        ...(results.phases.timeline?.findings || []),
        ...(results.phases.dependencies?.findings || []),
        ...(results.phases.behavioral?.findings || [])
      ];
      
      const severityCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
      for (const finding of allFindings) {
        const sev = finding.severity?.toLowerCase() || 'info';
        if (severityCounts.hasOwnProperty(sev)) {
          severityCounts[sev]++;
        }
      }
      
      let riskLevel = 'clean';
      if (severityCounts.critical > 0) riskLevel = 'critical';
      else if (severityCounts.high > 0) riskLevel = 'high';
      else if (severityCounts.medium > 0) riskLevel = 'medium';
      else if (severityCounts.low > 0) riskLevel = 'low';
      
      const phasesCompleted = Object.keys(results.phases).filter(p => results.phases[p].success).length;
      const phasesTotal = Object.keys(results.phases).length;
      const phasesFailed = phasesTotal - phasesCompleted;
      
      const failedPhaseNames = Object.keys(results.phases)
        .filter(p => !results.phases[p].success)
        .map(p => p);
      
      let overallSuccess = true;
      let incompleteReason = null;
      
      if (phasesFailed > 0) {
        overallSuccess = false;
        incompleteReason = `Phase(s) failed: ${failedPhaseNames.join(', ')}`;
      }
      
      if (phasesFailed > 0 && riskLevel === 'clean') {
        riskLevel = 'incomplete';
      }
      
      results.success = overallSuccess;
      results.summary = {
        totalFindings: allFindings.length,
        severityCounts,
        riskLevel,
        executionTimeMs: Date.now() - startTime,
        phasesCompleted,
        phasesTotal,
        phasesFailed,
        incompleteReason
      };
      
      results.recommendations = this.generateIncidentRecommendations(results);
      results.allFindings = allFindings;
      
      return results;
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        timestamp: results.timestamp,
        targetPath: results.targetPath,
        phases: results.phases,
        summary: {
          totalFindings: 0,
          riskLevel: 'unknown',
          executionTimeMs: Date.now() - startTime
        },
        recommendations: []
      };
    }
  }
  
  generateIncidentRecommendations(results) {
    const recommendations = [];
    const phases = results.phases;
    
    if (phases.codeScan?.findings?.length > 0) {
      const criticalCount = phases.codeScan.findings.filter(f => f.severity === 'critical').length;
      if (criticalCount > 0) {
        recommendations.push({
          priority: 'immediate',
          action: 'Isolate and investigate critical findings',
          details: `${criticalCount} critical security issues detected in code. Immediate investigation required.`,
          phase: 'code-scan'
        });
      }
    }
    
    if (phases.timeline?.findings?.length > 0) {
      recommendations.push({
        priority: 'high',
        action: 'Review suspicious commits',
        details: `${phases.timeline.findings.length} suspicious changes detected in git history. Verify all commits are legitimate.`,
        phase: 'timeline'
      });
    }
    
    if (phases.dependencies?.findings?.length > 0) {
      const malicious = phases.dependencies.findings.filter(f => 
        f.signatureName?.includes('Malicious') || f.signatureName?.includes('Typosquatting')
      ).length;
      if (malicious > 0) {
        recommendations.push({
          priority: 'immediate',
          action: 'Remove malicious or suspicious dependencies',
          details: `${malicious} potentially malicious packages detected. Remove immediately and audit usage.`,
          phase: 'dependencies'
        });
      }
    }
    
    if (phases.behavioral?.findings?.length > 0) {
      const dangerousPatterns = phases.behavioral.findings.filter(f => 
        f.severity === 'critical' || f.severity === 'high'
      ).length;
      if (dangerousPatterns > 0) {
        recommendations.push({
          priority: 'high',
          action: 'Review dangerous code patterns',
          details: `${dangerousPatterns} dangerous behavioral patterns detected. Review for potential backdoors.`,
          phase: 'behavioral'
        });
      }
    }
    
    for (const [phaseName, phaseData] of Object.entries(phases)) {
      if (!phaseData.success && phaseData.error) {
        recommendations.push({
          priority: 'medium',
          action: `Address ${phaseName} phase failure`,
          details: `The ${phaseName} phase failed: ${phaseData.error}. Results may be incomplete.`,
          phase: phaseName
        });
      } else if (phaseData.partialCoverage && phaseData.stats) {
        recommendations.push({
          priority: 'low',
          action: `Review ${phaseName} partial coverage`,
          details: `The ${phaseName} phase analyzed ${phaseData.stats.coveragePercent}% of files (${phaseData.stats.filesSkipped} skipped). Some files could not be analyzed.`,
          phase: phaseName
        });
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'info',
        action: 'Continue monitoring',
        details: 'No immediate threats detected. Continue regular security monitoring.',
        phase: 'general'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { immediate: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    });
  }
  
  printIncidentReport(results, options = {}) {
    const colors = {
      reset: '\x1b[0m',
      bold: '\x1b[1m',
      dim: '\x1b[2m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      magenta: '\x1b[35m',
      cyan: '\x1b[36m'
    };
    
    const riskColors = {
      critical: colors.red,
      high: colors.red,
      medium: colors.yellow,
      low: colors.blue,
      clean: colors.green,
      unknown: colors.dim
    };
    
    console.log(`\n${colors.bold}${colors.cyan}=== INCIDENT RESPONSE REPORT ===${colors.reset}\n`);
    console.log(`${colors.dim}Target: ${results.targetPath}${colors.reset}`);
    console.log(`${colors.dim}Timestamp: ${results.timestamp}${colors.reset}`);
    console.log(`${colors.dim}Execution time: ${results.summary.executionTimeMs}ms${colors.reset}\n`);
    
    const riskColor = riskColors[results.summary.riskLevel] || colors.dim;
    console.log(`${colors.bold}Risk Level: ${riskColor}${results.summary.riskLevel.toUpperCase()}${colors.reset}\n`);
    
    console.log(`${colors.bold}Findings Summary:${colors.reset}`);
    console.log(`  Critical: ${colors.red}${results.summary.severityCounts.critical}${colors.reset}`);
    console.log(`  High: ${colors.red}${results.summary.severityCounts.high}${colors.reset}`);
    console.log(`  Medium: ${colors.yellow}${results.summary.severityCounts.medium}${colors.reset}`);
    console.log(`  Low: ${colors.blue}${results.summary.severityCounts.low}${colors.reset}`);
    console.log(`  Total: ${colors.bold}${results.summary.totalFindings}${colors.reset}\n`);
    
    console.log(`${colors.bold}Phases Completed:${colors.reset} ${results.summary.phasesCompleted}/${results.summary.phasesTotal}\n`);
    
    for (const [phaseName, phaseData] of Object.entries(results.phases)) {
      const status = phaseData.success ? `${colors.green}[COMPLETE]${colors.reset}` : `${colors.red}[FAILED]${colors.reset}`;
      const findingsCount = phaseData.findings?.length || 0;
      console.log(`  ${status} ${phaseName}: ${findingsCount} findings`);
      if (phaseData.error) {
        console.log(`    ${colors.dim}Error: ${phaseData.error}${colors.reset}`);
      }
    }
    
    if (results.recommendations.length > 0) {
      console.log(`\n${colors.bold}${colors.yellow}Recommendations:${colors.reset}\n`);
      for (const rec of results.recommendations) {
        const priorityColor = rec.priority === 'immediate' ? colors.red :
                             rec.priority === 'high' ? colors.yellow :
                             colors.dim;
        console.log(`  ${priorityColor}[${rec.priority.toUpperCase()}]${colors.reset} ${rec.action}`);
        console.log(`    ${colors.dim}${rec.details}${colors.reset}\n`);
      }
    }
    
    if (options.verbose && results.allFindings?.length > 0) {
      console.log(`\n${colors.bold}Detailed Findings:${colors.reset}\n`);
      for (const finding of results.allFindings.slice(0, 20)) {
        const sevColor = finding.severity === 'critical' || finding.severity === 'high' ? colors.red :
                        finding.severity === 'medium' ? colors.yellow : colors.dim;
        console.log(`  ${sevColor}[${finding.severity?.toUpperCase() || 'INFO'}]${colors.reset} ${finding.signatureName || finding.signatureId}`);
        if (finding.file) {
          console.log(`    ${colors.dim}File: ${finding.file}:${finding.line || 1}${colors.reset}`);
        }
        if (finding.description) {
          console.log(`    ${finding.description}`);
        }
        console.log('');
      }
      
      if (results.allFindings.length > 20) {
        console.log(`  ${colors.dim}... and ${results.allFindings.length - 20} more findings${colors.reset}\n`);
      }
    }
    
    console.log(`${colors.dim}─${'─'.repeat(59)}${colors.reset}\n`);
  }
  
  generateIncidentJSONReport(results, options = {}) {
    return JSON.stringify(results, null, options.prettyPrint !== false ? 2 : 0);
  }
  
  generateCLIReport(scanResult, options = {}) {
    return this.cliReporter.generateReport(scanResult, options);
  }
  
  generateJSONReport(scanResult, options = {}) {
    return this.jsonReporter.generateReport(scanResult, options);
  }
  
  printReport(scanResult, options = {}) {
    return this.cliReporter.printReport(scanResult, options);
  }
  
  static getLayerInfo() {
    return LAYER_INFO;
  }
}

module.exports = Layer8SecurityForensics;
module.exports.LAYER_INFO = LAYER_INFO;
module.exports.DETECTION_MODES = DETECTION_MODES;
module.exports.SEVERITY_LEVELS = SEVERITY_LEVELS;
