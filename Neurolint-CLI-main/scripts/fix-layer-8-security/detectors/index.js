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


'use strict';

const SignatureAnalyzer = require('./signature-analyzer');
const BehavioralAnalyzer = require('./behavioral-analyzer');
const { DETECTION_MODES, MODE_CONFIGURATIONS, SEVERITY_LEVELS } = require('../constants');
const ErrorAggregator = require('../utils/error-aggregator');

const DEFAULT_MEMORY_LIMIT_MB = 512;
const DEFAULT_FILE_TIMEOUT_MS = 5000;

class DetectorOrchestrator {
  constructor(options = {}) {
    this.mode = options.mode || DETECTION_MODES.STANDARD;
    this.verbose = options.verbose || false;
    this.config = MODE_CONFIGURATIONS[this.mode];
    this.memoryLimitMB = options.memoryLimitMB || DEFAULT_MEMORY_LIMIT_MB;
    this.fileTimeoutMs = options.fileTimeoutMs || DEFAULT_FILE_TIMEOUT_MS;
    this.errorAggregator = new ErrorAggregator({ verbose: this.verbose });
    
    this.signatureAnalyzer = new SignatureAnalyzer({
      verbose: this.verbose,
      customSignatures: options.customSignatures || [],
      contextLines: options.contextLines || 3
    });
    
    this.behavioralAnalyzer = new BehavioralAnalyzer({
      verbose: this.verbose,
      includeContext: true,
      maxDepth: options.maxAstDepth || 10
    });
    
    this.stats = {
      filesScanned: 0,
      filesSkipped: 0,
      totalFindings: 0,
      scanStartTime: null,
      scanEndTime: null,
      errorCount: 0,
      memoryPeakMB: 0
    };
  }
  
  async scanFile(code, filePath, options = {}) {
    const startTime = Date.now();
    const allFindings = [];
    const detectorResults = {};
    
    if (code.length > this.config.maxFileSize) {
      this.stats.filesSkipped++;
      return {
        findings: [],
        scanned: false,
        reason: `File exceeds size limit (${Math.round(code.length / 1024 / 1024)}MB > ${Math.round(this.config.maxFileSize / 1024 / 1024)}MB)`,
        executionTime: Date.now() - startTime
      };
    }
    
    this.checkMemoryUsage();
    
    if (this.config.enabledDetectors.includes('signature')) {
      try {
        const signatureResult = this.signatureAnalyzer.analyze(code, filePath, options);
        detectorResults.signature = signatureResult;
        
        if (signatureResult.findings) {
          allFindings.push(...signatureResult.findings);
        }
        
        if (signatureResult.errors) {
          this.stats.errorCount += signatureResult.errors.totalErrors || 0;
        }
      } catch (error) {
        this.errorAggregator.addError(error, { 
          phase: 'signature-scan', 
          file: filePath 
        });
        this.stats.errorCount++;
      }
    }
    
    if (this.config.enabledDetectors.includes('behavioral')) {
      try {
        const behavioralFindings = this.behavioralAnalyzer.analyze(code, filePath, options);
        
        detectorResults.behavioral = {
          findings: behavioralFindings,
          scanned: true,
          executionTime: Date.now() - startTime
        };
        
        if (behavioralFindings && behavioralFindings.length > 0) {
          allFindings.push(...behavioralFindings);
        }
        
        const behavioralErrors = this.behavioralAnalyzer.getErrors();
        if (behavioralErrors.errors && behavioralErrors.errors.length > 0) {
          this.stats.errorCount += behavioralErrors.errors.length;
        }
      } catch (error) {
        this.errorAggregator.addError(error, { 
          phase: 'behavioral-scan', 
          file: filePath 
        });
        this.stats.errorCount++;
      }
    }
    
    const deduplicatedFindings = this.deduplicateFindings(allFindings);
    
    this.stats.filesScanned++;
    this.stats.totalFindings += deduplicatedFindings.length;
    
    return {
      findings: deduplicatedFindings,
      scanned: true,
      detectorResults,
      executionTime: Date.now() - startTime,
      filePath
    };
  }
  
  checkMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const used = process.memoryUsage();
      const heapUsedMB = Math.round(used.heapUsed / 1024 / 1024);
      
      if (heapUsedMB > this.stats.memoryPeakMB) {
        this.stats.memoryPeakMB = heapUsedMB;
      }
      
      if (heapUsedMB > this.memoryLimitMB * 0.9) {
        this.errorAggregator.addWarning(
          `Memory usage at ${heapUsedMB}MB (limit: ${this.memoryLimitMB}MB)`,
          { phase: 'memory-check' }
        );
        
        if (global.gc) {
          global.gc();
        }
      }
    }
  }
  
  deduplicateFindings(findings) {
    const seen = new Map();
    const deduplicated = [];
    
    for (const finding of findings) {
      const key = `${finding.signatureId}:${finding.file}:${finding.line}`;
      
      if (!seen.has(key)) {
        seen.set(key, true);
        deduplicated.push(finding);
      }
    }
    
    return deduplicated;
  }
  
  async scanMultipleFiles(files, options = {}) {
    this.stats.scanStartTime = Date.now();
    
    this.behavioralAnalyzer.resetForNewScan();
    this.signatureAnalyzer.reset();
    this.errorAggregator.clear();
    
    const allFindings = [];
    const fileResults = [];
    
    const concurrency = Math.min(options.concurrency || 10, 20);
    const rateLimitDelay = options.rateLimitDelay || 0;
    
    for (let i = 0; i < files.length; i += concurrency) {
      const batch = files.slice(i, i + concurrency);
      
      this.checkMemoryUsage();
      
      if (this.stats.memoryPeakMB > this.memoryLimitMB) {
        this.errorAggregator.addWarning(
          'Memory limit exceeded, reducing concurrency',
          { phase: 'batch-scan', currentBatch: i }
        );
        await this.delay(100);
      }
      
      const batchResults = await Promise.all(
        batch.map(async ({ code, filePath }) => {
          try {
            const timeoutPromise = this.createTimeout(this.fileTimeoutMs, filePath);
            const scanPromise = this.scanFile(code, filePath, options);
            
            return await Promise.race([scanPromise, timeoutPromise]);
          } catch (error) {
            this.stats.filesSkipped++;
            this.stats.errorCount++;
            this.errorAggregator.addError(error, { 
              phase: 'file-scan', 
              file: filePath 
            });
            return {
              findings: [],
              scanned: false,
              error: error.message,
              filePath
            };
          }
        })
      );
      
      for (const result of batchResults) {
        fileResults.push(result);
        if (result.findings) {
          allFindings.push(...result.findings);
        }
      }
      
      if (options.onProgress) {
        options.onProgress({
          processed: Math.min(i + concurrency, files.length),
          total: files.length,
          currentFindings: allFindings.length,
          errorCount: this.stats.errorCount,
          memoryUsageMB: this.stats.memoryPeakMB
        });
      }
      
      if (rateLimitDelay > 0) {
        await this.delay(rateLimitDelay);
      }
    }
    
    this.stats.scanEndTime = Date.now();
    
    return {
      findings: allFindings,
      fileResults,
      stats: {
        ...this.stats,
        totalExecutionTime: this.stats.scanEndTime - this.stats.scanStartTime
      },
      errors: this.errorAggregator.hasErrors() ? this.errorAggregator.toJSON() : null
    };
  }
  
  createTimeout(ms, filePath) {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Scan timeout for ${filePath} after ${ms}ms`));
      }, ms);
    });
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  getStats() {
    return { ...this.stats };
  }
  
  getErrors() {
    return this.errorAggregator.toJSON();
  }
  
  resetStats() {
    this.stats = {
      filesScanned: 0,
      filesSkipped: 0,
      totalFindings: 0,
      scanStartTime: null,
      scanEndTime: null,
      errorCount: 0,
      memoryPeakMB: 0
    };
    this.errorAggregator.clear();
    this.signatureAnalyzer.clearErrors();
    this.behavioralAnalyzer.clearErrors();
  }
}

module.exports = DetectorOrchestrator;
