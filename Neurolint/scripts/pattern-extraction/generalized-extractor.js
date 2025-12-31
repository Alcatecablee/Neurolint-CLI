/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const ASTDiffEngine = require('./ast-diff-engine');
const PatternClassifier = require('./pattern-classifier');

/**
 * Generalized Extractor - Extract patterns from any code transformation
 * Handles arbitrary transformations using AST analysis
 */
class GeneralizedExtractor {
  constructor() {
    this.astEngine = new ASTDiffEngine();
    this.classifier = new PatternClassifier();
  }

  /**
   * Extract generic patterns from any transformation
   * @param {string} beforeCode - Original code
   * @param {string} afterCode - Modified code
   * @param {number} layerId - Layer ID
   * @returns {Array} Extracted patterns
   */
  async extractGenericPatterns(beforeCode, afterCode, layerId) {
    const patterns = [];

    try {
      // Parse and diff
      const beforeAST = this.astEngine.parse(beforeCode);
      const afterAST = this.astEngine.parse(afterCode);
      const diffs = this.astEngine.diff(beforeAST, afterAST);

      // Classify and extract patterns
      const classified = this.astEngine.classifyDifferences(diffs);

      // Process each category
      Object.keys(classified).forEach(category => {
        classified[category].forEach(diff => {
          const pattern = this.createGenericPattern(diff, layerId);
          if (pattern && this.validatePattern(pattern)) {
            patterns.push(pattern);
          }
        });
      });

      // Consolidate similar patterns
      return this.consolidatePatterns(patterns);
    } catch (error) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] GeneralizedExtractor error: ${error.message}\n`);
      }
      return [];
    }
  }

  /**
   * Create a generic pattern from a diff
   * @param {object} diff - Diff object
   * @param {number} layerId - Layer ID
   * @returns {object|null} Pattern object
   */
  createGenericPattern(diff, layerId) {
    if (!diff || !diff.type) return null;

    const transformationType = this.detectTransformationType(diff);
    const category = this.classifier.classifyPattern(diff, layerId);

    if (diff.type === 'addition') {
      return {
        description: `Add ${diff.nodeType || 'code'}`,
        type: 'addition',
        code: diff.code,
        transformationType,
        confidence: this.calculateConfidence(diff, transformationType),
        frequency: 1,
        layer: layerId,
        category: category
      };
    }

    if (diff.type === 'modification' && diff.before && diff.after) {
      const pattern = this.generatePatternFromModification(diff);
      if (!pattern) return null;

      return {
        description: `Transform ${diff.nodeType || 'code'}`,
        type: 'modification',
        pattern: pattern.pattern,
        replacement: pattern.replacement,
        transformationType,
        confidence: this.calculateConfidence(diff, transformationType),
        frequency: 1,
        layer: layerId,
        category: category,
        before: diff.before,
        after: diff.after
      };
    }

    if (diff.type === 'removal') {
      return {
        description: `Remove ${diff.nodeType || 'code'}`,
        type: 'removal',
        pattern: this.escapeForRegex(diff.code),
        replacement: '',
        transformationType,
        confidence: this.calculateConfidence(diff, transformationType),
        frequency: 1,
        layer: layerId,
        category: category
      };
    }

    return null;
  }

  /**
   * Detect transformation type
   * @param {object} diff - Diff object
   * @returns {string} Transformation type
   */
  detectTransformationType(diff) {
    if (!diff) return 'unknown';

    const code = diff.code || diff.after || diff.before || '';

    // Check for wrapping patterns
    if (diff.type === 'modification' && 
        diff.before && diff.after &&
        diff.after.includes(diff.before)) {
      return 'code-wrapping';
    }

    // Check for argument addition
    if (code.includes('(') && code.includes(')')) {
      if (diff.type === 'modification') {
        const beforeArgs = (diff.before.match(/,/g) || []).length;
        const afterArgs = (diff.after.match(/,/g) || []).length;
        if (afterArgs > beforeArgs) {
          return 'argument-addition';
        }
      }
    }

    // Check for property addition
    if (code.includes('{') && code.includes('}')) {
      if (diff.type === 'modification') {
        return 'property-addition';
      }
    }

    // Check for conditional wrapping
    if (diff.after && (diff.after.includes('?') && diff.after.includes(':'))) {
      return 'conditional-wrapping';
    }

    // Check for expression replacement
    if (diff.type === 'modification') {
      return 'expression-replacement';
    }

    // Default based on diff type
    if (diff.type === 'addition') return 'code-addition';
    if (diff.type === 'removal') return 'code-removal';

    return 'generic-transformation';
  }

  /**
   * Generate regex pattern from modification
   * @param {object} diff - Modification diff
   * @returns {object|null} Pattern and replacement
   */
  generatePatternFromModification(diff) {
    try {
      const before = diff.before || '';
      const after = diff.after || '';

      // For simple replacements, create exact match pattern
      if (before.length < 100 && after.length < 100) {
        return {
          pattern: new RegExp(this.escapeForRegex(before), 'g'),
          replacement: after
        };
      }

      // For complex transformations, try to identify the pattern
      const commonPrefix = this.findCommonPrefix(before, after);
      const commonSuffix = this.findCommonSuffix(before, after);

      if (commonPrefix || commonSuffix) {
        // Create pattern that matches the structure
        let pattern = this.escapeForRegex(before);
        return {
          pattern: new RegExp(pattern, 'g'),
          replacement: after
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find common prefix between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {string} Common prefix
   */
  findCommonPrefix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && str1[i] === str2[i]) {
      i++;
    }
    return str1.substring(0, i);
  }

  /**
   * Find common suffix between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {string} Common suffix
   */
  findCommonSuffix(str1, str2) {
    let i = 0;
    while (i < str1.length && i < str2.length && 
           str1[str1.length - 1 - i] === str2[str2.length - 1 - i]) {
      i++;
    }
    return str1.substring(str1.length - i);
  }

  /**
   * Calculate confidence score for pattern
   * @param {object} diff - Diff object
   * @param {string} transformationType - Type of transformation
   * @returns {number} Confidence score
   */
  calculateConfidence(diff, transformationType) {
    let confidence = 0.65; // Base confidence for generic patterns

    // Boost confidence for specific transformation types
    const typeBoosts = {
      'code-addition': 0.10,
      'code-removal': 0.10,
      'argument-addition': 0.05,
      'property-addition': 0.05,
      'expression-replacement': 0.00,
      'code-wrapping': 0.05
    };

    confidence += typeBoosts[transformationType] || 0;

    // Reduce confidence for complex code
    const complexity = this.calculateComplexity(diff);
    if (complexity > 5) {
      confidence -= 0.10;
    }
    if (complexity > 10) {
      confidence -= 0.05;
    }

    // Boost confidence for small, focused changes
    const codeLength = (diff.code || diff.after || '').length;
    if (codeLength < 50) {
      confidence += 0.05;
    }

    // Ensure confidence is in valid range
    return Math.max(0.50, Math.min(0.90, confidence));
  }

  /**
   * Calculate complexity of transformation
   * @param {object} diff - Diff object
   * @returns {number} Complexity score
   */
  calculateComplexity(diff) {
    const code = diff.code || diff.after || diff.before || '';
    
    let complexity = 0;
    complexity += (code.match(/\{/g) || []).length;
    complexity += (code.match(/\[/g) || []).length;
    complexity += (code.match(/\(/g) || []).length;
    complexity += (code.match(/</g) || []).length * 0.5;
    
    return Math.floor(complexity);
  }

  /**
   * Validate pattern quality
   * @param {object} pattern - Pattern to validate
   * @returns {boolean} Is valid
   */
  validatePattern(pattern) {
    // Use classifier validation
    if (!this.classifier.validatePattern(pattern)) {
      return false;
    }

    // Additional validation for generic patterns
    if (pattern.type === 'modification') {
      // Must have pattern and replacement
      if (!pattern.pattern || !pattern.replacement) {
        return false;
      }

      // Pattern should not be too broad
      const patternStr = pattern.pattern.toString();
      if (patternStr.length < 5) {
        return false;
      }
    }

    return true;
  }

  /**
   * Consolidate similar patterns
   * @param {Array} patterns - Array of patterns
   * @returns {Array} Consolidated patterns
   */
  consolidatePatterns(patterns) {
    const consolidated = new Map();

    patterns.forEach(pattern => {
      // Create key based on transformation type and category
      const key = `${pattern.transformationType}:${pattern.category}:${pattern.description}`;

      if (consolidated.has(key)) {
        // Merge with existing pattern
        const existing = consolidated.get(key);
        existing.frequency += 1;
        existing.confidence = Math.min(0.95, existing.confidence + 0.02);
      } else {
        consolidated.set(key, { ...pattern });
      }
    });

    return Array.from(consolidated.values());
  }

  /**
   * Escape string for use in regex
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeForRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = GeneralizedExtractor;
