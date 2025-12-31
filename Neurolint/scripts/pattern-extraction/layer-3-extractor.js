/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const ASTDiffEngine = require('./ast-diff-engine');
const PatternClassifier = require('./pattern-classifier');

/**
 * Layer 3 Extractor - Extract patterns from React component transformations
 * Handles JSX conversions, attribute additions, React 19 migrations
 */
class Layer3Extractor {
  constructor() {
    this.astEngine = new ASTDiffEngine();
    this.classifier = new PatternClassifier();
  }

  /**
   * Main extraction method
   * @param {string} before - Original code
   * @param {string} after - Modified code
   * @returns {Array} Extracted patterns
   */
  async extractPatterns(before, after) {
    const patterns = [];

    try {
      // Try AST-based extraction first
      const astPatterns = this.extractASTPatterns(before, after);
      patterns.push(...astPatterns);

      // Add regex-based patterns for specific transformations
      const regexPatterns = this.extractRegexPatterns(before, after);
      patterns.push(...regexPatterns);

      // Deduplicate and validate
      const uniquePatterns = this.deduplicatePatterns(patterns);
      return uniquePatterns.filter(p => this.classifier.validatePattern(p));
    } catch (error) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] Layer3Extractor error: ${error.message}\n`);
      }
      return [];
    }
  }

  /**
   * Extract patterns using AST analysis
   * @param {string} before - Original code
   * @param {string} after - Modified code
   * @returns {Array} Patterns
   */
  extractASTPatterns(before, after) {
    const patterns = [];

    try {
      const beforeAST = this.astEngine.parse(before);
      const afterAST = this.astEngine.parse(after);
      const diffs = this.astEngine.diff(beforeAST, afterAST);

      // Process JSX-related changes
      diffs.forEach(diff => {
        if (diff.nodeType && diff.nodeType.includes('JSX')) {
          const pattern = this.createJSXPattern(diff);
          if (pattern) patterns.push(pattern);
        }

        // Process import changes
        if (diff.nodeType === 'ImportDeclaration') {
          const pattern = this.createImportPattern(diff);
          if (pattern) patterns.push(pattern);
        }
      });

    } catch (error) {
      // AST parsing failed, will use regex fallback
    }

    return patterns;
  }

  /**
   * Extract patterns using regex analysis (fallback)
   * @param {string} before - Original code
   * @param {string} after - Modified code
   * @returns {Array} Patterns
   */
  extractRegexPatterns(before, after) {
    const patterns = [];

    // HTML button -> Button component
    if (before.includes('<button') && after.includes('<Button')) {
      patterns.push({
        description: 'Convert HTML button to Button component',
        pattern: /<button(\s+[^>]*)>/gi,
        replacement: '<Button$1>',
        confidence: 0.90,
        frequency: 1,
        layer: 3,
        category: 'component-conversion',
        requiredImport: {
          module: '@/components/ui/button',
          specifier: 'Button'
        }
      });

      patterns.push({
        description: 'Convert closing button tag',
        pattern: /<\/button>/gi,
        replacement: '</Button>',
        confidence: 0.90,
        frequency: 1,
        layer: 3,
        category: 'component-conversion'
      });
    }

    // HTML input -> Input component
    if (before.includes('<input') && after.includes('<Input')) {
      patterns.push({
        description: 'Convert HTML input to Input component',
        pattern: /<input(\s+[^>]*)\/>/gi,
        replacement: '<Input$1 />',
        confidence: 0.90,
        frequency: 1,
        layer: 3,
        category: 'component-conversion',
        requiredImport: {
          module: '@/components/ui/input',
          specifier: 'Input'
        }
      });
    }

    // Key prop in .map()
    if (!before.includes('key={') && after.includes('key={')) {
      // Detect if index parameter was added
      const beforeHasIndex = /\.map\(\([^,)]+,\s*\w+\)/.test(before);
      const afterHasIndex = /\.map\(\([^,)]+,\s*\w+\)/.test(after);
      const indexAdded = !beforeHasIndex && afterHasIndex;

      if (indexAdded) {
        // Pattern for adding index parameter and key prop
        patterns.push({
          description: 'Add key prop with index in .map()',
          pattern: /\.map\((\w+)\s*=>\s*<(\w+)(?![^>]*\bkey=)([^>]*)>/g,
          replacement: '.map(($1, index) => <$2 key={index}$3>',
          confidence: 0.95,
          frequency: 1,
          layer: 3,
          category: 'jsx-key-prop'
        });
      } else {
        // Pattern for just adding key prop (index already exists)
        patterns.push({
          description: 'Add key prop in .map()',
          pattern: /\.map\((\w+),\s*(\w+)\)\s*=>\s*<(\w+)(?![^>]*\bkey=)([^>]*)>/g,
          replacement: '.map(($1, $2) => <$3 key={$2}$4>',
          confidence: 0.95,
          frequency: 1,
          layer: 3,
          category: 'jsx-key-prop'
        });
      }
    }

    // aria-label addition
    if (!before.includes('aria-label') && after.includes('aria-label')) {
      patterns.push({
        description: 'Add aria-label to interactive elements',
        pattern: /<(Button|button|a)(?![^>]*aria-label)([^>]*)>([^<]*)<\/(Button|button|a)>/gi,
        replacement: (match, tag, attrs, inner, closeTag) => {
          const label = inner.trim() || tag;
          return `<${tag} aria-label="${label}"${attrs}>${inner}</${closeTag}>`;
        },
        confidence: 0.85,
        frequency: 1,
        layer: 3,
        category: 'accessibility'
      });
    }

    // Alt text addition
    if (!before.includes('alt=') && after.includes('alt=')) {
      patterns.push({
        description: 'Add alt attribute to images',
        pattern: /<img(?![^>]*\balt=)([^>]*)>/gi,
        replacement: '<img alt="Image"$1>',
        confidence: 0.90,
        frequency: 1,
        layer: 3,
        category: 'accessibility'
      });
    }

    // forwardRef conversion (React 19)
    if (before.includes('forwardRef') && !after.includes('forwardRef')) {
      patterns.push({
        description: 'Convert forwardRef to direct ref prop (React 19)',
        pattern: /const\s+(\w+)\s*=\s*forwardRef\s*\(\s*\((\w+),\s*(\w+)\)\s*=>\s*\{([\s\S]*?)\}\s*\)/g,
        replacement: 'const $1 = ({ $3, ...$2 }) => {$4}',
        confidence: 0.90,
        frequency: 1,
        layer: 3,
        category: 'react19-forwardRef'
      });

      // Also handle the closing paren
      patterns.push({
        description: 'Remove forwardRef from imports',
        pattern: /,?\s*forwardRef\s*,?/g,
        replacement: '',
        confidence: 0.85,
        frequency: 1,
        layer: 3,
        category: 'react19-import'
      });
    }

    // String refs conversion
    if ((before.includes('ref="') || before.includes("ref='")) && 
        !after.includes('ref="') && !after.includes("ref='")) {
      patterns.push({
        description: 'Convert string refs to callback refs',
        pattern: /ref=(["'])(\w+)\1/g,
        replacement: 'ref={$2Ref}',
        confidence: 0.85,
        frequency: 1,
        layer: 3,
        category: 'react19-refs'
      });
    }

    // Variant prop addition to Button
    if (before.includes('<Button>') && after.includes('variant=')) {
      patterns.push({
        description: 'Add variant prop to Button',
        pattern: /<Button(?![^>]*\bvariant=)([^>]*)>/g,
        replacement: '<Button variant="default"$1>',
        confidence: 0.80,
        frequency: 1,
        layer: 3,
        category: 'component-props'
      });
    }

    // Type prop addition to Input
    if (before.includes('<Input') && after.includes('type=') && !before.includes('type=')) {
      patterns.push({
        description: 'Add type prop to Input',
        pattern: /<Input(?![^>]*\btype=)([^>]*)\/>/g,
        replacement: '<Input type="text"$1 />',
        confidence: 0.80,
        frequency: 1,
        layer: 3,
        category: 'component-props'
      });
    }

    return patterns;
  }

  /**
   * Create pattern from JSX diff
   * @param {object} diff - JSX diff object
   * @returns {object|null} Pattern
   */
  createJSXPattern(diff) {
    if (diff.type === 'modification') {
      return {
        description: `JSX transformation: ${diff.nodeType}`,
        pattern: this.createPatternFromCode(diff.before),
        replacement: diff.after,
        confidence: 0.75,
        frequency: 1,
        layer: 3,
        category: 'jsx-modification'
      };
    }

    if (diff.type === 'addition') {
      return {
        description: `Add JSX element: ${diff.nodeType}`,
        code: diff.code,
        confidence: 0.70,
        frequency: 1,
        layer: 3,
        category: 'jsx-addition'
      };
    }

    return null;
  }

  /**
   * Create pattern from import diff
   * @param {object} diff - Import diff object
   * @returns {object|null} Pattern
   */
  createImportPattern(diff) {
    if (diff.type === 'addition') {
      const match = diff.code.match(/from\s+['"]([^'"]+)['"]/)
      if (!match) return null;

      return {
        description: `Add import from ${match[1]}`,
        pattern: /^/,
        replacement: `${diff.code}\n`,
        confidence: 0.75,
        frequency: 1,
        layer: 3,
        category: 'import-addition',
        requiredImport: {
          module: match[1],
          code: diff.code
        }
      };
    }

    return null;
  }

  /**
   * Create regex pattern from code snippet
   * @param {string} code - Code to convert to pattern
   * @returns {RegExp} Regex pattern
   */
  createPatternFromCode(code) {
    // Escape special regex characters but keep structure
    let pattern = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Replace specific values with wildcards
    pattern = pattern.replace(/"[^"]+"/g, '"[^"]*"');
    pattern = pattern.replace(/\d+/g, '\\d+');
    
    return new RegExp(pattern, 'g');
  }

  /**
   * Deduplicate similar patterns
   * @param {Array} patterns - Array of patterns
   * @returns {Array} Deduplicated patterns
   */
  deduplicatePatterns(patterns) {
    const seen = new Map();
    const unique = [];

    patterns.forEach(pattern => {
      const key = `${pattern.description}:${pattern.category}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        unique.push(pattern);
      }
    });

    return unique;
  }
}

module.exports = Layer3Extractor;
