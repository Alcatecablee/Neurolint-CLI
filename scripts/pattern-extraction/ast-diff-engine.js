/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

/**
 * AST Diff Engine - Core component for AST-based pattern extraction
 * Parses code into AST, compares ASTs, and identifies transformations
 */
class ASTDiffEngine {
  constructor() {
    this.parserOptions = {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'objectRestSpread',
        'asyncGenerators',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator'
      ],
      allowImportExportEverywhere: true,
      strictMode: false
    };
  }

  /**
   * Parse code into AST
   * @param {string} code - Source code to parse
   * @param {object} options - Parser options override
   * @returns {object} AST object
   */
  parse(code, options = {}) {
    try {
      return parser.parse(code, { ...this.parserOptions, ...options });
    } catch (error) {
      // If parsing fails, try without TypeScript
      try {
        const simpleOptions = {
          sourceType: 'module',
          plugins: ['jsx'],
          allowImportExportEverywhere: true
        };
        return parser.parse(code, { ...simpleOptions, ...options });
      } catch (fallbackError) {
        throw new Error(`Failed to parse code: ${error.message}`);
      }
    }
  }

  /**
   * Compare two ASTs and find differences
   * @param {object} beforeAST - Original AST
   * @param {object} afterAST - Modified AST
   * @returns {Array} Array of differences
   */
  diff(beforeAST, afterAST) {
    const differences = [];

    try {
      // Extract nodes from both ASTs
      const beforeNodes = this.extractNodes(beforeAST);
      const afterNodes = this.extractNodes(afterAST);

      // Find additions
      const additions = this.findAdditions(beforeNodes, afterNodes);
      differences.push(...additions);

      // Find removals
      const removals = this.findRemovals(beforeNodes, afterNodes);
      differences.push(...removals);

      // Find modifications
      const modifications = this.findModifications(beforeNodes, afterNodes);
      differences.push(...modifications);

      return differences;
    } catch (error) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] AST diff error: ${error.message}\n`);
      }
      return [];
    }
  }

  /**
   * Extract all nodes from AST with metadata
   * @param {object} ast - AST to extract from
   * @returns {Array} Array of node objects with metadata
   */
  extractNodes(ast) {
    const nodes = [];
    const self = this;

    traverse(ast, {
      enter(path) {
        nodes.push({
          type: path.node.type,
          path: path,
          node: path.node,
          code: self.nodeToCode(path.node),
          key: self.generateNodeKey(path.node),
          location: path.node.loc
        });
      }
    });

    return nodes;
  }

  /**
   * Convert AST node back to code
   * @param {object} node - AST node
   * @returns {string} Generated code
   */
  nodeToCode(node) {
    try {
      return generate(node, { compact: true }).code;
    } catch (error) {
      return '';
    }
  }

  /**
   * Generate unique key for node identification
   * @param {object} node - AST node
   * @returns {string} Unique key
   */
  generateNodeKey(node) {
    if (t.isImportDeclaration(node)) {
      return `import:${node.source?.value}`;
    }
    if (t.isExportNamedDeclaration(node) || t.isExportDefaultDeclaration(node)) {
      return `export:${this.nodeToCode(node).substring(0, 50)}`;
    }
    if (t.isFunctionDeclaration(node) || t.isVariableDeclaration(node)) {
      return `decl:${this.nodeToCode(node).substring(0, 50)}`;
    }
    if (t.isJSXElement(node)) {
      const name = node.openingElement?.name?.name || 'Element';
      return `jsx:${name}`;
    }
    return `${node.type}:${this.nodeToCode(node).substring(0, 30)}`;
  }

  /**
   * Find added nodes
   * @param {Array} beforeNodes - Original nodes
   * @param {Array} afterNodes - Modified nodes
   * @returns {Array} Added nodes
   */
  findAdditions(beforeNodes, afterNodes) {
    const additions = [];
    const beforeKeys = new Set(beforeNodes.map(n => n.key));

    afterNodes.forEach(afterNode => {
      if (!beforeKeys.has(afterNode.key)) {
        additions.push({
          type: 'addition',
          nodeType: afterNode.type,
          code: afterNode.code,
          node: afterNode.node,
          location: afterNode.location
        });
      }
    });

    return additions;
  }

  /**
   * Find removed nodes
   * @param {Array} beforeNodes - Original nodes
   * @param {Array} afterNodes - Modified nodes
   * @returns {Array} Removed nodes
   */
  findRemovals(beforeNodes, afterNodes) {
    const removals = [];
    const afterKeys = new Set(afterNodes.map(n => n.key));

    beforeNodes.forEach(beforeNode => {
      if (!afterKeys.has(beforeNode.key)) {
        removals.push({
          type: 'removal',
          nodeType: beforeNode.type,
          code: beforeNode.code,
          node: beforeNode.node,
          location: beforeNode.location
        });
      }
    });

    return removals;
  }

  /**
   * Find modified nodes
   * @param {Array} beforeNodes - Original nodes
   * @param {Array} afterNodes - Modified nodes
   * @returns {Array} Modified nodes
   */
  findModifications(beforeNodes, afterNodes) {
    const modifications = [];
    const beforeMap = new Map(beforeNodes.map(n => [n.key, n]));

    afterNodes.forEach(afterNode => {
      const beforeNode = beforeMap.get(afterNode.key);
      if (beforeNode && beforeNode.code !== afterNode.code) {
        modifications.push({
          type: 'modification',
          nodeType: afterNode.type,
          before: beforeNode.code,
          after: afterNode.code,
          beforeNode: beforeNode.node,
          afterNode: afterNode.node,
          location: afterNode.location
        });
      }
    });

    return modifications;
  }

  /**
   * Classify differences into transformation types
   * @param {Array} diffs - Array of differences
   * @returns {object} Classified transformations
   */
  classifyDifferences(diffs) {
    const classified = {
      imports: [],
      exports: [],
      jsxChanges: [],
      functionChanges: [],
      expressionChanges: [],
      other: []
    };

    diffs.forEach(diff => {
      if (diff.nodeType === 'ImportDeclaration') {
        classified.imports.push(diff);
      } else if (diff.nodeType.includes('Export')) {
        classified.exports.push(diff);
      } else if (diff.nodeType.includes('JSX')) {
        classified.jsxChanges.push(diff);
      } else if (diff.nodeType.includes('Function')) {
        classified.functionChanges.push(diff);
      } else if (diff.nodeType.includes('Expression')) {
        classified.expressionChanges.push(diff);
      } else {
        classified.other.push(diff);
      }
    });

    return classified;
  }

  /**
   * Extract transformation patterns from differences
   * @param {Array} diffs - Array of differences
   * @returns {Array} Extracted patterns
   */
  extractTransformationPatterns(diffs) {
    const patterns = [];

    try {
      const classified = this.classifyDifferences(diffs);

      // Process import additions
      classified.imports.forEach(diff => {
        if (diff.type === 'addition') {
          const pattern = this.createImportPattern(diff);
          if (pattern) patterns.push(pattern);
        }
      });

      // Process JSX changes
      classified.jsxChanges.forEach(diff => {
        const pattern = this.createJSXPattern(diff);
        if (pattern) patterns.push(pattern);
      });

      // Process function changes
      classified.functionChanges.forEach(diff => {
        const pattern = this.createFunctionPattern(diff);
        if (pattern) patterns.push(pattern);
      });

      return patterns;
    } catch (error) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] Pattern extraction error: ${error.message}\n`);
      }
      return [];
    }
  }

  /**
   * Create pattern from import change
   * @param {object} diff - Import difference
   * @returns {object} Pattern object
   */
  createImportPattern(diff) {
    // Extract import source from code
    const match = diff.code.match(/from\s+['"]([^'"]+)['"]/)
    if (!match) return null;

    return {
      description: `Import from ${match[1]}`,
      type: 'import-addition',
      code: diff.code,
      confidence: 0.75,
      category: 'import'
    };
  }

  /**
   * Create pattern from JSX change
   * @param {object} diff - JSX difference
   * @returns {object} Pattern object
   */
  createJSXPattern(diff) {
    if (diff.type === 'modification') {
      return {
        description: `JSX modification: ${diff.nodeType}`,
        type: 'jsx-modification',
        before: diff.before,
        after: diff.after,
        confidence: 0.70,
        category: 'jsx'
      };
    }
    return null;
  }

  /**
   * Create pattern from function change
   * @param {object} diff - Function difference
   * @returns {object} Pattern object
   */
  createFunctionPattern(diff) {
    if (diff.type === 'modification') {
      return {
        description: `Function modification`,
        type: 'function-modification',
        before: diff.before,
        after: diff.after,
        confidence: 0.65,
        category: 'function'
      };
    }
    return null;
  }
}

module.exports = ASTDiffEngine;
