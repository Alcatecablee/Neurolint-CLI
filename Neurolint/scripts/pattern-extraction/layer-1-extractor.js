/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */

const PatternClassifier = require('./pattern-classifier');

/**
 * Layer 1 Extractor - Extract patterns from config file transformations
 * Handles tsconfig.json, next.config.js, package.json changes
 */
class Layer1Extractor {
  constructor() {
    this.classifier = new PatternClassifier();
  }

  /**
   * Main extraction method
   * @param {string} before - Original code/config
   * @param {string} after - Modified code/config
   * @returns {Array} Extracted patterns
   */
  async extractPatterns(before, after) {
    const patterns = [];

    try {
      // Detect config file type
      const fileType = this.detectConfigType(before, after);

      if (fileType === 'tsconfig') {
        patterns.push(...this.extractTSConfigPatterns(before, after));
      } else if (fileType === 'nextconfig') {
        patterns.push(...this.extractNextConfigPatterns(before, after));
      } else if (fileType === 'packagejson') {
        patterns.push(...this.extractPackageJsonPatterns(before, after));
      }

      return patterns.filter(p => this.classifier.validatePattern(p));
    } catch (error) {
      if (process.env.NEUROLINT_DEBUG === 'true') {
        process.stderr.write(`[DEBUG] Layer1Extractor error: ${error.message}\n`);
      }
      return [];
    }
  }

  /**
   * Detect config file type
   * @param {string} before - Original content
   * @param {string} after - Modified content
   * @returns {string} File type
   */
  detectConfigType(before, after) {
    const content = before + after;
    
    if (content.includes('compilerOptions') || content.includes('tsconfig')) {
      return 'tsconfig';
    }
    if (content.includes('next.config') || content.includes('module.exports')) {
      return 'nextconfig';
    }
    if (content.includes('"scripts"') || content.includes('"dependencies"')) {
      return 'packagejson';
    }
    
    return 'unknown';
  }

  /**
   * Extract patterns from tsconfig.json changes
   * @param {string} before - Original tsconfig
   * @param {string} after - Modified tsconfig
   * @returns {Array} Patterns
   */
  extractTSConfigPatterns(before, after) {
    const patterns = [];

    try {
      const beforeObj = this.safeJsonParse(before);
      const afterObj = this.safeJsonParse(after);

      if (!beforeObj || !afterObj) return patterns;

      const beforeOptions = beforeObj.compilerOptions || {};
      const afterOptions = afterObj.compilerOptions || {};

      // Check for strict mode enablement
      if (beforeOptions.strict !== true && afterOptions.strict === true) {
        patterns.push({
          description: 'Enable TypeScript strict mode',
          pattern: /"strict"\s*:\s*false/g,
          replacement: '"strict": true',
          confidence: 0.95,
          frequency: 1,
          layer: 1,
          category: 'tsconfig-strict'
        });
      }

      // Check for noImplicitAny
      if (!beforeOptions.noImplicitAny && afterOptions.noImplicitAny) {
        patterns.push({
          description: 'Enable noImplicitAny in TypeScript',
          pattern: /"noImplicitAny"\s*:\s*false/g,
          replacement: '"noImplicitAny": true',
          confidence: 0.90,
          frequency: 1,
          layer: 1,
          category: 'tsconfig-strict'
        });
      }

      // Check for strictNullChecks
      if (!beforeOptions.strictNullChecks && afterOptions.strictNullChecks) {
        patterns.push({
          description: 'Enable strictNullChecks in TypeScript',
          pattern: /"strictNullChecks"\s*:\s*false/g,
          replacement: '"strictNullChecks": true',
          confidence: 0.90,
          frequency: 1,
          layer: 1,
          category: 'tsconfig-strict'
        });
      }

      // Check for JSX transform update
      if (beforeOptions.jsx !== 'react-jsx' && afterOptions.jsx === 'react-jsx') {
        patterns.push({
          description: 'Update JSX transform to react-jsx',
          pattern: /"jsx"\s*:\s*"[^"]*"/g,
          replacement: '"jsx": "react-jsx"',
          confidence: 0.85,
          frequency: 1,
          layer: 1,
          category: 'tsconfig-jsx'
        });
      }

      // Check for target update
      if (beforeOptions.target !== afterOptions.target && afterOptions.target) {
        patterns.push({
          description: `Update TypeScript target to ${afterOptions.target}`,
          pattern: new RegExp(`"target"\\s*:\\s*"${beforeOptions.target}"`, 'g'),
          replacement: `"target": "${afterOptions.target}"`,
          confidence: 0.85,
          frequency: 1,
          layer: 1,
          category: 'tsconfig-target'
        });
      }

      // Check for module update
      if (beforeOptions.module !== afterOptions.module && afterOptions.module) {
        patterns.push({
          description: `Update TypeScript module to ${afterOptions.module}`,
          pattern: new RegExp(`"module"\\s*:\\s*"${beforeOptions.module}"`, 'g'),
          replacement: `"module": "${afterOptions.module}"`,
          confidence: 0.85,
          frequency: 1,
          layer: 1,
          category: 'tsconfig-module'
        });
      }

    } catch (error) {
      // Silent fail, return collected patterns
    }

    return patterns;
  }

  /**
   * Extract patterns from next.config.js changes
   * @param {string} before - Original config
   * @param {string} after - Modified config
   * @returns {Array} Patterns
   */
  extractNextConfigPatterns(before, after) {
    const patterns = [];

    try {
      // Turbopack configuration addition
      if (!before.includes('experimental.turbo') && after.includes('experimental.turbo')) {
        patterns.push({
          description: 'Add Turbopack configuration to Next.js config',
          pattern: /experimental\s*:\s*\{/,
          replacement: (match) => {
            return `experimental: {\n    turbo: {\n      rules: {}\n    },`;
          },
          confidence: 0.85,
          frequency: 1,
          layer: 1,
          category: 'nextjs-turbopack'
        });
      }

      // Image optimization configuration
      if (!before.includes('images.remotePatterns') && after.includes('images.remotePatterns')) {
        patterns.push({
          description: 'Add image remote patterns to Next.js config',
          pattern: /module\.exports\s*=\s*\{/,
          replacement: (match) => {
            return `module.exports = {\n  images: {\n    remotePatterns: [{ protocol: 'https', hostname: '**' }]\n  },`;
          },
          confidence: 0.80,
          frequency: 1,
          layer: 1,
          category: 'nextjs-images'
        });
      }

      // Deprecated flag removal patterns
      const deprecatedFlags = [
        'experimental.esmExternals',
        'experimental.outputFileTracingRoot'
      ];

      deprecatedFlags.forEach(flag => {
        const flagName = flag.split('.')[1];
        if (before.includes(flag) && !after.includes(flag)) {
          patterns.push({
            description: `Remove deprecated ${flag} from Next.js config`,
            pattern: new RegExp(`\\s*${flag.replace(/\./g, '\\.')}\\s*:\\s*[^,}\\n]+,?`, 'g'),
            replacement: '',
            confidence: 0.90,
            frequency: 1,
            layer: 1,
            category: 'nextjs-deprecated'
          });
        }
      });

    } catch (error) {
      // Silent fail
    }

    return patterns;
  }

  /**
   * Extract patterns from package.json changes
   * @param {string} before - Original package.json
   * @param {string} after - Modified package.json
   * @returns {Array} Patterns
   */
  extractPackageJsonPatterns(before, after) {
    const patterns = [];

    try {
      const beforeObj = this.safeJsonParse(before);
      const afterObj = this.safeJsonParse(after);

      if (!beforeObj || !afterObj) return patterns;

      const beforeScripts = beforeObj.scripts || {};
      const afterScripts = afterObj.scripts || {};

      // Check for new scripts
      Object.keys(afterScripts).forEach(scriptName => {
        if (!beforeScripts[scriptName]) {
          patterns.push({
            description: `Add ${scriptName} script to package.json`,
            pattern: /"scripts"\s*:\s*\{/,
            replacement: (match) => {
              return `"scripts": {\n    "${scriptName}": "${afterScripts[scriptName]}",`;
            },
            confidence: 0.80,
            frequency: 1,
            layer: 1,
            category: 'package-scripts'
          });
        }
      });

      // Check for dependency updates
      const beforeDeps = { ...beforeObj.dependencies, ...beforeObj.devDependencies };
      const afterDeps = { ...afterObj.dependencies, ...afterObj.devDependencies };

      Object.keys(afterDeps).forEach(dep => {
        if (beforeDeps[dep] !== afterDeps[dep]) {
          const isNew = !beforeDeps[dep];
          patterns.push({
            description: isNew ? `Add ${dep} dependency` : `Update ${dep} to ${afterDeps[dep]}`,
            pattern: isNew 
              ? /"dependencies"\s*:\s*\{/
              : new RegExp(`"${dep}"\\s*:\\s*"${this.escapeRegex(beforeDeps[dep])}"`, 'g'),
            replacement: isNew
              ? (match) => `"dependencies": {\n    "${dep}": "${afterDeps[dep]}",`
              : `"${dep}": "${afterDeps[dep]}"`,
            confidence: 0.75,
            frequency: 1,
            layer: 1,
            category: isNew ? 'package-add-dep' : 'package-update-dep'
          });
        }
      });

    } catch (error) {
      // Silent fail
    }

    return patterns;
  }

  /**
   * Safely parse JSON with error handling
   * @param {string} jsonStr - JSON string
   * @returns {object|null} Parsed object or null
   */
  safeJsonParse(jsonStr) {
    try {
      // Remove comments (for JSON5-like configs)
      const cleaned = jsonStr.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      return JSON.parse(cleaned);
    } catch (error) {
      return null;
    }
  }

  /**
   * Escape regex special characters
   * @param {string} str - String to escape
   * @returns {string} Escaped string
   */
  escapeRegex(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

module.exports = Layer1Extractor;
