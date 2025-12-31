/**
 * NeuroLint Shared Core
 * 
 * Unified interface for CLI, VS Code, and Web App platforms.
 * Provides rule engine, configuration management, and analytics.
 * 
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

const ruleEngine = require('./rule-engine');
const configManager = require('./config-manager');
const analytics = require('./analytics');
const path = require('path');

/**
 * Smart Layer Selector for analyzing and recommending layers
 * This provides the intelligent analysis that rule analysis expects
 */
class SmartLayerSelector {
  static analyzeAndRecommend(code, filePath) {
    const issues = [];
    const ext = path.extname(filePath || '');
    
    try {
      // Use AST-based analysis for more accurate detection
      const ASTTransformer = require('../ast-transformer');
      const transformer = new ASTTransformer();
      const astIssues = transformer.analyzeCode(code, { filename: filePath });
      
      // Convert AST issues to layer recommendations
      astIssues.forEach(issue => {
        issues.push({
          layer: issue.layer,
          reason: issue.message,
          confidence: 0.9,
          location: issue.location
        });
      });
    } catch (error) {
      // Fallback to regex-based detection if AST parsing fails
      issues.push(...this.fallbackAnalysis(code, filePath));
    }

    return {
      detectedIssues: issues,
      recommendedLayers: [...new Set(issues.map(i => i.layer))].sort(),
      reasons: issues.map(i => i.reason),
      confidence: issues.reduce((acc, i) => acc + i.confidence, 0) / issues.length || 0
    };
  }

  static fallbackAnalysis(code, filePath) {
    const issues = [];
    const ext = path.extname(filePath || '');
    
    // Layer 1: Configuration issues
    if (code.includes('tsconfig.json') || code.includes('next.config.js')) {
      issues.push({
        layer: 1,
        reason: 'Configuration file detected',
        confidence: 0.8,
        location: { line: 1, column: 1 }
      });
    }
    
    // Layer 2: HTML entities
    if (code.includes('&quot;') || code.includes('&amp;') || code.includes('&lt;') || code.includes('&gt;')) {
      issues.push({
        layer: 2,
        reason: 'HTML entities detected',
        confidence: 0.9,
        location: { line: 1, column: 1 }
      });
    }
    
    // Layer 3: React component issues
    if (ext === '.tsx' || ext === '.jsx' || code.includes('React') || code.includes('useState')) {
      if (code.includes('.map(') && !code.includes('key=')) {
        issues.push({
          layer: 3,
          reason: 'Missing key props in React lists',
          confidence: 0.9,
          location: { line: 1, column: 1 }
        });
      }
    }
    
    // Layer 4: SSR safety
    if (code.includes('window.') || code.includes('document.') || code.includes('localStorage')) {
      issues.push({
        layer: 4,
        reason: 'Client-side APIs detected',
        confidence: 0.8,
        location: { line: 1, column: 1 }
      });
    }
    
    // Layer 5: Next.js App Router
    if (code.includes('use client') || code.includes('use server')) {
      issues.push({
        layer: 5,
        reason: 'App Router directives detected',
        confidence: 0.7,
        location: { line: 1, column: 1 }
      });
    }
    
    // Layer 6: Testing and accessibility
    if (code.includes('test') || code.includes('spec') || code.includes('aria-')) {
      issues.push({
        layer: 6,
        reason: 'Testing or accessibility patterns detected',
        confidence: 0.6,
        location: { line: 1, column: 1 }
      });
    }
    
    return issues;
  }
}

/**
 * Main NeuroLint Core class
 */
class NeuroLintCore {
  constructor() {
    this.ruleEngine = ruleEngine;
    this.configManager = configManager;
    this.analytics = analytics;
    
    this.initialized = false;
  }

  /**
   * Initialize the core with configuration
   */
  async initialize(options = {}) {
    try {
      // Load configuration
      await this.configManager.loadConfig(options.configPath);
      
      // Initialize analytics
      await this.analytics.loadAnalytics();
      
      this.initialized = true;
      
      // Track initialization
      this.analytics.trackCommand('initialize', {
        platform: options.platform || 'cli',
        success: true
      });
      
      return true;
    } catch (error) {
      // Track error without console.log
      this.analytics.trackCommand('initialize', {
        platform: options.platform || 'cli',
        success: false,
        error: error.message
      });
      return false;
    }
  }

  /**
   * Analyze code and return issues
   */
  async analyze(code, options = {}) {
    if (!this.initialized) {
      await this.initialize(options);
    }

    const startTime = Date.now();
    
    try {
      // Get platform-specific configuration
      const platformConfig = this.configManager.getPlatformConfig(options.platform || 'cli');
      
      // Merge options with configuration
      const analysisOptions = {
        ...platformConfig,
        ...options,
        layers: options.layers || this.configManager.getEnabledLayers()
      };

      // Use SmartLayerSelector for intelligent analysis
      const smartAnalysis = SmartLayerSelector.analyzeAndRecommend(code, options.filename);
      
      // Perform rule engine analysis
      const ruleResult = await this.ruleEngine.analyze(code, analysisOptions);
      
      // Convert SmartLayerSelector issues to proper format
      const smartIssues = smartAnalysis.detectedIssues.map(issue => ({
        type: `layer-${issue.layer}-issue`,
        severity: 'medium',
        description: issue.reason,
        fixedByLayer: issue.layer,
        line: issue.location?.line,
        column: issue.location?.column,
        ruleId: `smart-layer-${issue.layer}`
      }));

      // Combine results with SmartLayerSelector recommendations
      const result = {
        ...ruleResult,
        // Merge issues from both rule engine and SmartLayerSelector
        issues: [...(ruleResult.issues || []), ...smartIssues],
        summary: {
          ...ruleResult.summary,
          recommendedLayers: smartAnalysis.recommendedLayers,
          confidence: smartAnalysis.confidence,
          reasoning: smartAnalysis.reasons
        },
        detectedIssues: smartAnalysis.detectedIssues,
        // Add properties that SmartLayerSelector provides
        hasModernConfig: smartAnalysis.detectedIssues.some(issue => issue.layer === 1),
        hasHtmlEntities: smartAnalysis.detectedIssues.some(issue => issue.layer === 2),
        hasAppRouter: smartAnalysis.detectedIssues.some(issue => issue.layer === 5)
      };
      
      // Track analytics
      this.analytics.trackAnalysis({
        files: [options.filename || 'unknown'],
        issues: result.issues,
        executionTime: Date.now() - startTime,
        layers: analysisOptions.layers,
        platform: options.platform || 'cli'
      });

      // Calculate quality metrics
      if (result.issues.length > 0) {
        this.analytics.calculateQualityScore(result.issues, 1);
        this.analytics.calculateModernizationProgress(result.summary.issuesByLayer);
        this.analytics.calculateTechnicalDebt(result.summary.issuesByLayer);
      }

      return result;
    } catch (error) {
      // Track error
      this.analytics.trackAnalysis({
        files: [options.filename || 'unknown'],
        issues: [],
        executionTime: Date.now() - startTime,
        layers: options.layers || [],
        platform: options.platform || 'cli'
      });

      throw error;
    }
  }

  /**
   * Get configuration
   */
  getConfig(key = null) {
    if (key) {
      return this.configManager.get(key);
    }
    return this.configManager.config;
  }

  /**
   * Set configuration
   */
  setConfig(key, value) {
    this.configManager.set(key, value);
  }

  /**
   * Save configuration
   */
  async saveConfig(config = null, configPath = null) {
    return await this.configManager.saveConfig(config, configPath);
  }

  /**
   * Get analytics report
   */
  getAnalyticsReport(options = {}) {
    return this.analytics.generateReport(options);
  }

  /**
   * Save analytics data
   */
  async saveAnalytics() {
    return await this.analytics.saveAnalytics();
  }

  /**
   * Export analytics
   */
  exportAnalytics(format = 'json') {
    return this.analytics.exportAnalytics(format);
  }

  /**
   * Get rule engine
   */
  getRuleEngine() {
    return this.ruleEngine;
  }

  /**
   * Get configuration manager
   */
  getConfigManager() {
    return this.configManager;
  }

  /**
   * Get analytics
   */
  getAnalytics() {
    return this.analytics;
  }

  /**
   * Validate configuration
   */
  validateConfig(config = null) {
    return this.configManager.validateConfig(config);
  }

  /**
   * Get platform-specific configuration
   */
  getPlatformConfig(platform) {
    return this.configManager.getPlatformConfig(platform);
  }

  /**
   * Create default configuration
   */
  createDefaultConfig() {
    return this.configManager.createDefaultConfig();
  }

  /**
   * Export configuration
   */
  exportConfig() {
    return this.configManager.exportConfig();
  }

  /**
   * Import configuration
   */
  async importConfig(configData) {
    return await this.configManager.importConfig(configData);
  }

  /**
   * Add custom rule
   */
  addRule(name, rule) {
    this.ruleEngine.addRule(name, rule);
  }

  /**
   * Get all rules
   */
  getRules() {
    return Array.from(this.ruleEngine.rules.entries()).map(([name, rule]) => ({
      name,
      description: rule.description,
      layer: rule.layer
    }));
  }

  /**
   * Check if layer is enabled
   */
  isLayerEnabled(layerId) {
    return this.configManager.isLayerEnabled(layerId);
  }

  /**
   * Get enabled layers
   */
  getEnabledLayers() {
    return this.configManager.getEnabledLayers();
  }

  /**
   * Get include patterns
   */
  getIncludePatterns() {
    return this.configManager.getIncludePatterns();
  }

  /**
   * Get exclude patterns
   */
  getExcludePatterns() {
    return this.configManager.getExcludePatterns();
  }

  /**
   * Get team preferences
   */
  getTeamPrefs() {
    return this.configManager.getTeamPrefs();
  }

  /**
   * Track user activity
   */
  trackUser(userId, action) {
    this.analytics.trackUser(userId, action);
  }

  /**
   * Track command usage
   */
  trackCommand(command, options = {}) {
    this.analytics.trackCommand(command, options);
  }

  /**
   * Apply fixes to code using the 8-layer transformation system
   * Delegates to fix-master.js executeLayers for proper orchestration with:
   * - Layer dependency ordering
   * - Rollback capabilities (for CLI platform)
   * - Unified error handling
   * - Validation between layers
   * 
   * For VS Code: Uses dryRun=true since VS Code manages its own undo/redo stack
   * For CLI: Supports full backup/rollback via fix-master BackupManager
   */
  async applyFixes(code, issues, options = {}) {
    if (!this.initialized) {
      await this.initialize(options);
    }

    const startTime = Date.now();
    
    try {
      const {
        layers = [1, 2, 3, 4, 5, 6, 7, 8],
        filename = 'unknown',
        verbose = false,
        platform = 'cli',
        strictTs = false,
        apiRoutes = false,
        ecommerce = false,
        nextjs155 = false,
        noDeps = false
      } = options;

      // For VS Code platform, always use dryRun=true since VS Code manages undo/redo
      // For CLI platform, use the provided dryRun option for full backup support
      const dryRun = platform === 'vscode' ? true : (options.dryRun || false);

      // Track fix attempt
      this.analytics.trackCommand('applyFixes', {
        platform,
        layers,
        issueCount: issues?.length || 0
      });

      // Delegate to fix-master.js executeLayers for proper orchestration
      // This ensures same layer ordering, dependency resolution, and validation as CLI
      const fixMaster = require('../fix-master');
      
      const result = await fixMaster.executeLayers(code, layers, {
        dryRun,
        verbose,
        filePath: filename,
        strictTs,
        apiRoutes,
        ecommerce,
        nextjs155,
        noDeps
      });

      // Convert fix-master result format to shared-core format
      const appliedFixes = [];
      let totalChanges = 0;
      
      if (result.results && Array.isArray(result.results)) {
        for (const layerResult of result.results) {
          // Count changes from successful layers
          const changes = layerResult.changes || layerResult.changeCount || 0;
          if (layerResult.success && changes > 0) {
            totalChanges += typeof changes === 'number' ? changes : changes.length || 0;
            
            if (Array.isArray(layerResult.changes)) {
              appliedFixes.push(...layerResult.changes.map(change => ({
                ...change,
                layer: layerResult.layer
              })));
            } else {
              appliedFixes.push({
                layer: layerResult.layer,
                description: `Layer ${layerResult.layer} applied ${changes} fix(es)`,
                location: { line: 1, column: 1 }
              });
            }
          }
        }
      }

      // Derive success from fix-master's result (successfulLayers > 0)
      const success = result.success === true || (result.successfulLayers && result.successfulLayers > 0);

      // Track successful fix
      this.analytics.trackCommand('applyFixes', {
        platform,
        success,
        fixCount: totalChanges,
        executionTime: Date.now() - startTime
      });

      // Collect errors from failed layers
      const errors = result.results?.filter(r => !r.success && r.error).map(r => ({
        layer: r.layer,
        error: r.error
      }));

      return {
        success,
        code: result.finalCode || code,
        originalCode: code,
        appliedFixes,
        totalFixes: totalChanges,
        successfulLayers: result.successfulLayers || 0,
        errors: errors && errors.length > 0 ? errors : undefined,
        metadata: {
          platform,
          layers: layers.sort((a, b) => a - b),
          executionTime: Date.now() - startTime,
          dryRun
        }
      };

    } catch (error) {
      // Track error
      this.analytics.trackCommand('applyFixes', {
        platform: options.platform || 'cli',
        success: false,
        error: error.message,
        executionTime: Date.now() - startTime
      });

      return {
        success: false,
        code,
        originalCode: code,
        appliedFixes: [],
        error: error.message
      };
    }
  }

  /**
   * Shutdown and cleanup
   */
  async shutdown() {
    try {
      // Save analytics data
      await this.analytics.saveAnalytics();
      
      // Track shutdown
      this.analytics.trackCommand('shutdown', {
        platform: 'cli',
        success: true
      });
      
      this.initialized = false;
      return true;
    } catch (error) {
      // Track error without console.log
      this.analytics.trackCommand('shutdown', {
        platform: 'cli',
        success: false,
        error: error.message
      });
      return false;
    }
  }
}

// Create and export singleton instance
const neurolintCore = new NeuroLintCore();

// Export individual modules for direct access
module.exports = {
  // Main core instance
  core: neurolintCore,
  
  // Individual modules
  ruleEngine,
  configManager,
  analytics,
  
  // Smart Layer Selector
  SmartLayerSelector,
  
  // Convenience methods
  analyze: (code, options) => neurolintCore.analyze(code, options),
  applyFixes: (code, issues, options) => neurolintCore.applyFixes(code, issues, options),
  analyzeAndRecommend: (code, filePath) => SmartLayerSelector.analyzeAndRecommend(code, filePath),
  getConfig: (key) => neurolintCore.getConfig(key),
  setConfig: (key, value) => neurolintCore.setConfig(key, value),
  getAnalyticsReport: (options) => neurolintCore.getAnalyticsReport(options),
  trackCommand: (command, options) => neurolintCore.trackCommand(command, options),
  trackUser: (userId, action) => neurolintCore.trackUser(userId, action),
  
  // Version info (dynamically read from package.json)
  get version() {
    try {
      const pkg = require('../package.json');
      return pkg.version;
    } catch {
      return '1.4.0';
    }
  },
  description: 'NeuroLint Shared Core - Unified code modernization engine'
}; 