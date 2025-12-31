/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */

/**
 * Pattern Classifier - Classifies and scores patterns from AST diffs
 */
class PatternClassifier {
  constructor() {
    this.patternCategories = {
      'import': { weight: 0.85, priority: 'high' },
      'export': { weight: 0.80, priority: 'high' },
      'jsx-component': { weight: 0.90, priority: 'high' },
      'jsx-attribute': { weight: 0.85, priority: 'medium' },
      'jsx-key': { weight: 0.95, priority: 'critical' },
      'accessibility': { weight: 0.90, priority: 'high' },
      'react19': { weight: 0.85, priority: 'high' },
      'function': { weight: 0.70, priority: 'medium' },
      'expression': { weight: 0.65, priority: 'low' },
      'config': { weight: 0.80, priority: 'high' },
      'security': { weight: 0.95, priority: 'critical' },
      'generic': { weight: 0.60, priority: 'low' }
    };
  }

  /**
   * Classify a pattern and determine its category
   * @param {object} diff - AST diff object
   * @param {number} layerId - Layer ID
   * @returns {string} Category name
   */
  classifyPattern(diff, layerId) {
    // Layer-based classification
    if (layerId === 1) return 'config';
    if (layerId === 3) {
      if (diff.nodeType && diff.nodeType.includes('JSX')) {
        if (this.isKeyPropAddition(diff)) return 'jsx-key';
        if (this.isAttributeAddition(diff)) return 'jsx-attribute';
        return 'jsx-component';
      }
    }
    if (layerId === 8) return 'security';

    // Type-based classification
    if (diff.nodeType === 'ImportDeclaration') return 'import';
    if (diff.nodeType && diff.nodeType.includes('Export')) return 'export';
    if (diff.nodeType && diff.nodeType.includes('JSX')) return 'jsx-component';
    if (diff.nodeType && diff.nodeType.includes('Function')) return 'function';
    if (diff.nodeType && diff.nodeType.includes('Expression')) return 'expression';

    // Content-based classification
    const code = diff.code || diff.after || '';
    if (code.includes('aria-') || code.includes('alt=')) return 'accessibility';
    if (code.includes('forwardRef') || code.includes('ref=')) return 'react19';

    return 'generic';
  }

  /**
   * Check if diff is a key prop addition
   * @param {object} diff - Diff object
   * @returns {boolean}
   */
  isKeyPropAddition(diff) {
    const code = diff.after || diff.code || '';
    return code.includes('key={') && code.includes('.map(');
  }

  /**
   * Check if diff is an attribute addition
   * @param {object} diff - Diff object
   * @returns {boolean}
   */
  isAttributeAddition(diff) {
    if (diff.type !== 'modification') return false;
    const before = diff.before || '';
    const after = diff.after || '';
    // Check if after has more attributes than before
    const beforeAttrs = (before.match(/\w+=/g) || []).length;
    const afterAttrs = (after.match(/\w+=/g) || []).length;
    return afterAttrs > beforeAttrs;
  }

  /**
   * Generate regex pattern from AST transformation
   * @param {object} diff - Diff object
   * @returns {RegExp|null} Generated regex pattern
   */
  generateRegexPattern(diff) {
    try {
      if (diff.type === 'addition' && diff.code) {
        // For additions, create a pattern to detect absence
        const escaped = this.escapeRegex(diff.code);
        return new RegExp(escaped, 'g');
      }

      if (diff.type === 'modification' && diff.before && diff.after) {
        // For modifications, match the before pattern
        const escaped = this.escapeRegex(diff.before);
        return new RegExp(escaped, 'g');
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Generate replacement string or function from transformation
   * @param {object} diff - Diff object
   * @returns {string|Function} Replacement
   */
  generateReplacement(diff) {
    if (diff.type === 'modification' && diff.after) {
      return diff.after;
    }
    if (diff.type === 'addition' && diff.code) {
      return diff.code;
    }
    return '';
  }

  /**
   * Calculate pattern confidence based on complexity and context
   * @param {object} pattern - Pattern object
   * @param {object} diff - Original diff
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(pattern, diff) {
    let confidence = 0.70; // Base confidence

    // Adjust based on category
    const category = this.classifyPattern(diff, pattern.layer || 0);
    const categoryInfo = this.patternCategories[category] || this.patternCategories['generic'];
    confidence = categoryInfo.weight;

    // Boost confidence for specific cases
    if (diff.type === 'addition') {
      confidence += 0.05; // Additions are more deterministic
    }

    // Reduce confidence for complex transformations
    const complexity = this.calculateComplexity(diff);
    if (complexity > 5) {
      confidence -= 0.10;
    }

    // Ensure confidence is in valid range
    return Math.max(0.5, Math.min(1.0, confidence));
  }

  /**
   * Calculate complexity of a transformation
   * @param {object} diff - Diff object
   * @returns {number} Complexity score
   */
  calculateComplexity(diff) {
    let complexity = 0;

    const code = diff.code || diff.after || diff.before || '';
    
    // Count nested structures
    complexity += (code.match(/\{/g) || []).length;
    complexity += (code.match(/\[/g) || []).length;
    complexity += (code.match(/\(/g) || []).length;

    // Count JSX nesting
    complexity += (code.match(/</g) || []).length * 0.5;

    return Math.floor(complexity);
  }

  /**
   * Escape special regex characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Validate pattern quality
   * @param {object} pattern - Pattern to validate
   * @returns {boolean} Is pattern valid
   */
  validatePattern(pattern) {
    // Must have description
    if (!pattern.description || pattern.description.length < 5) return false;

    // Must have pattern or code
    if (!pattern.pattern && !pattern.code) return false;

    // Must have reasonable confidence
    if (pattern.confidence < 0.5 || pattern.confidence > 1.0) return false;

    // Must have category
    if (!pattern.category) return false;

    return true;
  }
}

module.exports = PatternClassifier;
