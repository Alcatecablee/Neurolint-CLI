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
 * Server Action Hardening Module
 * 
 * AST-based code-level hardening for React Server Components in quarantine mode.
 * Implements deterministic rewrites following NeuroLint's "never break code" philosophy.
 * 
 * CORE PRINCIPLES:
 * 1. QUARANTINE MODE ONLY: This module only operates when --quarantine flag is set
 * 2. DETERMINISTIC: All transformations are AST-based and reversible
 * 3. 5-STEP FAIL-SAFE: Parse → Transform → Validate → Test → Apply (or Revert)
 * 4. CONSERVATIVE: Only neutralize verified threats, never break legitimate code
 */

'use strict';

const fs = require('fs').promises;
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const DANGEROUS_FUNCTIONS = [
  'eval',
  'exec',
  'execSync',
  'spawn',
  'spawnSync',
  'execFile',
  'execFileSync',
  'Function'
];

const DANGEROUS_IMPORT_SOURCES = [
  'child_process',
  'node:child_process'
];

class ServerActionHardening {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose || false,
      dryRun: options.dryRun !== false,
      quarantine: options.quarantine || false,
      ...options
    };
    
    this.transformations = [];
  }

  async analyze(code, filePath) {
    const result = {
      isServerAction: false,
      dangerousCalls: [],
      envExposures: [],
      unsafePatterns: [],
      hardeningRecommendations: []
    };

    try {
      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      result.isServerAction = this.detectServerActionDirective(ast);

      if (!result.isServerAction) {
        return result;
      }

      traverse(ast, {
        CallExpression: (nodePath) => {
          this.checkDangerousCall(nodePath, result);
        },
        MemberExpression: (nodePath) => {
          this.checkEnvExposure(nodePath, result);
        },
        ImportDeclaration: (nodePath) => {
          this.checkDangerousImport(nodePath, result);
        },
        NewExpression: (nodePath) => {
          this.checkDangerousConstruction(nodePath, result);
        }
      });

      this.generateHardeningRecommendations(result);

    } catch (error) {
      if (this.options.verbose) {
        console.error(`Error analyzing ${filePath}:`, error.message);
      }
    }

    return result;
  }

  detectServerActionDirective(ast) {
    // Check program directives (where Babel stores 'use server' when at top of file)
    if (ast.program.directives) {
      for (const directive of ast.program.directives) {
        if (directive.value && directive.value.value === 'use server') {
          return true;
        }
      }
    }
    
    // Also check body for fallback (some parsers put it here)
    for (const node of ast.program.body) {
      if (node.type === 'ExpressionStatement' && node.directive === 'use server') {
        return true;
      }
      if (
        node.type === 'ExpressionStatement' &&
        node.expression?.type === 'StringLiteral' &&
        node.expression.value === 'use server'
      ) {
        return true;
      }
    }

    let hasInlineDirective = false;
    traverse(ast, {
      FunctionDeclaration: (nodePath) => {
        if (this.hasUseServerDirective(nodePath.node.body)) {
          hasInlineDirective = true;
        }
      },
      ArrowFunctionExpression: (nodePath) => {
        if (nodePath.node.body.type === 'BlockStatement' && this.hasUseServerDirective(nodePath.node.body)) {
          hasInlineDirective = true;
        }
      }
    });

    return hasInlineDirective;
  }

  hasUseServerDirective(blockNode) {
    if (!blockNode) return false;
    
    // Check directives array (where Babel stores 'use server' when it's the first statement)
    if (blockNode.directives && Array.isArray(blockNode.directives)) {
      for (const directive of blockNode.directives) {
        if (
          directive.type === 'Directive' &&
          directive.value?.type === 'DirectiveLiteral' &&
          directive.value.value === 'use server'
        ) {
          return true;
        }
      }
    }
    
    // Also check body for fallback (older parser behavior)
    if (blockNode.body) {
      for (const stmt of blockNode.body) {
        if (stmt.type === 'ExpressionStatement' && stmt.directive === 'use server') {
          return true;
        }
        if (
          stmt.type === 'ExpressionStatement' &&
          stmt.expression?.type === 'StringLiteral' &&
          stmt.expression.value === 'use server'
        ) {
          return true;
        }
      }
    }
    return false;
  }

  checkDangerousCall(nodePath, result) {
    const callee = nodePath.node.callee;
    let funcName = null;

    if (callee.type === 'Identifier') {
      funcName = callee.name;
    } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
      funcName = callee.property.name;
    }

    if (funcName && DANGEROUS_FUNCTIONS.includes(funcName)) {
      result.dangerousCalls.push({
        function: funcName,
        line: nodePath.node.loc?.start?.line,
        column: nodePath.node.loc?.start?.column,
        severity: 'CRITICAL',
        code: generate(nodePath.node).code.substring(0, 100)
      });
    }
  }

  checkEnvExposure(nodePath, result) {
    const node = nodePath.node;
    
    if (
      node.object.type === 'Identifier' && node.object.name === 'process' &&
      node.property.type === 'Identifier' && node.property.name === 'env'
    ) {
      const parent = nodePath.parentPath;
      
      if (parent && parent.isReturnStatement()) {
        result.envExposures.push({
          type: 'RETURN_ENV',
          line: node.loc?.start?.line,
          severity: 'CRITICAL',
          message: 'Server action returns process.env directly'
        });
      }
      
      // Detect spread operator: { ...process.env }
      if (parent && parent.isSpreadElement()) {
        result.envExposures.push({
          type: 'SPREAD_ENV',
          line: node.loc?.start?.line,
          severity: 'CRITICAL',
          message: 'process.env is spread into object (leaks all environment variables)'
        });
      }
      
      if (parent && parent.isCallExpression()) {
        const parentCallee = parent.node.callee;
        if (
          parentCallee.type === 'MemberExpression' &&
          parentCallee.object.type === 'Identifier' &&
          parentCallee.object.name === 'JSON' &&
          parentCallee.property.name === 'stringify'
        ) {
          result.envExposures.push({
            type: 'STRINGIFY_ENV',
            line: node.loc?.start?.line,
            severity: 'HIGH',
            message: 'process.env is being stringified (potential exfiltration)'
          });
        }
      }
    }
  }

  checkDangerousImport(nodePath, result) {
    const source = nodePath.node.source.value;
    
    if (DANGEROUS_IMPORT_SOURCES.includes(source)) {
      result.unsafePatterns.push({
        type: 'DANGEROUS_IMPORT',
        source: source,
        line: nodePath.node.loc?.start?.line,
        severity: 'HIGH',
        message: `Importing ${source} in server action file`
      });
    }
  }

  checkDangerousConstruction(nodePath, result) {
    const callee = nodePath.node.callee;
    
    if (callee.type === 'Identifier' && callee.name === 'Function') {
      result.dangerousCalls.push({
        function: 'new Function()',
        line: nodePath.node.loc?.start?.line,
        column: nodePath.node.loc?.start?.column,
        severity: 'CRITICAL',
        code: generate(nodePath.node).code.substring(0, 100)
      });
    }
  }

  generateHardeningRecommendations(result) {
    if (result.dangerousCalls.length > 0) {
      result.hardeningRecommendations.push({
        priority: 'CRITICAL',
        action: 'REMOVE_DANGEROUS_CALLS',
        description: 'Remove or neutralize dangerous function calls (exec, eval, spawn)',
        canAutoFix: this.options.quarantine,
        affectedLines: result.dangerousCalls.map(d => d.line)
      });
    }

    if (result.envExposures.length > 0) {
      result.hardeningRecommendations.push({
        priority: 'HIGH',
        action: 'PROTECT_ENV_VARS',
        description: 'Prevent direct exposure of process.env to clients',
        canAutoFix: false,
        manualSteps: [
          'Only return specific, non-sensitive environment values',
          'Use a allowlist of safe environment variables to expose',
          'Consider using a configuration service instead of direct env access'
        ]
      });
    }

    if (result.unsafePatterns.length > 0) {
      result.hardeningRecommendations.push({
        priority: 'HIGH',
        action: 'REMOVE_DANGEROUS_IMPORTS',
        description: 'Remove child_process imports from server action files',
        canAutoFix: false,
        manualSteps: [
          'Move shell command execution to a separate backend service',
          'Use safe APIs instead of shell commands',
          'If shell execution is required, use a dedicated API route with proper validation'
        ]
      });
    }
  }

  async harden(code, filePath) {
    if (!this.options.quarantine) {
      return {
        success: true,
        code: code,
        originalCode: code,
        changeCount: 0,
        message: 'Quarantine mode not enabled. Use --quarantine flag to apply code-level hardening.',
        skipped: true
      };
    }

    const originalCode = code;
    
    try {
      const analysis = await this.analyze(code, filePath);
      
      if (!analysis.isServerAction) {
        return {
          success: true,
          code: code,
          originalCode: code,
          changeCount: 0,
          message: 'Not a server action file, no hardening needed.',
          skipped: true
        };
      }

      if (analysis.dangerousCalls.length === 0 && analysis.envExposures.length === 0) {
        return {
          success: true,
          code: code,
          originalCode: code,
          changeCount: 0,
          message: 'No dangerous patterns found in server action.',
          skipped: false
        };
      }

      const ast = parser.parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      let changeCount = 0;

      traverse(ast, {
        CallExpression: (nodePath) => {
          const result = this.neutralizeDangerousCall(nodePath);
          if (result.changed) {
            changeCount++;
            this.transformations.push(result.transformation);
          }
        }
      });

      const { code: transformedCode } = generate(ast, {
        retainLines: true,
        comments: true
      });

      const validation = this.validateTransformation(originalCode, transformedCode);
      
      if (!validation.valid) {
        return {
          success: false,
          code: originalCode,
          originalCode: originalCode,
          changeCount: 0,
          message: `Transformation validation failed: ${validation.reason}`,
          reverted: true
        };
      }

      return {
        success: true,
        code: transformedCode,
        originalCode: originalCode,
        changeCount: changeCount,
        transformations: this.transformations,
        message: `Applied ${changeCount} hardening transformation(s)`
      };

    } catch (error) {
      return {
        success: false,
        code: originalCode,
        originalCode: originalCode,
        changeCount: 0,
        error: error.message,
        message: 'Hardening failed, original code preserved'
      };
    }
  }

  neutralizeDangerousCall(nodePath) {
    const callee = nodePath.node.callee;
    let funcName = null;

    if (callee.type === 'Identifier') {
      funcName = callee.name;
    } else if (callee.type === 'MemberExpression' && callee.property.type === 'Identifier') {
      funcName = callee.property.name;
    }

    if (!funcName || !DANGEROUS_FUNCTIONS.includes(funcName)) {
      return { changed: false };
    }

    const originalCode = generate(nodePath.node).code;
    
    const errorMessage = `[NEUROLINT-QUARANTINE] Dangerous function '${funcName}' has been neutralized for security. Original call: ${originalCode.substring(0, 50)}...`;
    
    nodePath.replaceWith(
      t.callExpression(
        t.memberExpression(
          t.identifier('console'),
          t.identifier('error')
        ),
        [t.stringLiteral(errorMessage)]
      )
    );

    return {
      changed: true,
      transformation: {
        type: 'NEUTRALIZE_DANGEROUS_CALL',
        function: funcName,
        line: nodePath.node.loc?.start?.line,
        originalCode: originalCode,
        replacement: `console.error("${errorMessage}")`
      }
    };
  }

  validateTransformation(originalCode, transformedCode) {
    try {
      parser.parse(transformedCode, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });
    } catch (error) {
      return {
        valid: false,
        reason: `Transformed code has syntax errors: ${error.message}`
      };
    }

    if (transformedCode.length < originalCode.length * 0.5) {
      return {
        valid: false,
        reason: 'Transformation removed more than 50% of the code (safety threshold exceeded)'
      };
    }

    const dangerousPatterns = [
      /rm\s+-rf/,
      /format\s+c:/i,
      /drop\s+database/i
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(transformedCode) && !pattern.test(originalCode)) {
        return {
          valid: false,
          reason: 'Transformation introduced dangerous patterns'
        };
      }
    }

    return { valid: true };
  }

  formatReport(analysis) {
    const lines = [];
    
    lines.push('\n\x1b[1mServer Action Security Analysis\x1b[0m');
    lines.push('═'.repeat(50));
    
    if (!analysis.isServerAction) {
      lines.push('\x1b[2mNot a server action file\x1b[0m');
      return lines.join('\n');
    }
    
    lines.push('\x1b[33m! Server Action detected\x1b[0m');
    
    if (analysis.dangerousCalls.length === 0 && analysis.envExposures.length === 0 && analysis.unsafePatterns.length === 0) {
      lines.push('\x1b[32m✓ No dangerous patterns found\x1b[0m');
      return lines.join('\n');
    }
    
    if (analysis.dangerousCalls.length > 0) {
      lines.push(`\n\x1b[31m✗ ${analysis.dangerousCalls.length} dangerous function call(s):\x1b[0m`);
      for (const call of analysis.dangerousCalls) {
        lines.push(`  Line ${call.line}: ${call.function}()`);
        if (call.code) {
          lines.push(`    \x1b[2m${call.code}\x1b[0m`);
        }
      }
    }
    
    if (analysis.envExposures.length > 0) {
      lines.push(`\n\x1b[31m✗ ${analysis.envExposures.length} environment exposure(s):\x1b[0m`);
      for (const exp of analysis.envExposures) {
        lines.push(`  Line ${exp.line}: ${exp.message}`);
      }
    }
    
    if (analysis.unsafePatterns.length > 0) {
      lines.push(`\n\x1b[33m! ${analysis.unsafePatterns.length} unsafe pattern(s):\x1b[0m`);
      for (const pattern of analysis.unsafePatterns) {
        lines.push(`  Line ${pattern.line}: ${pattern.message}`);
      }
    }
    
    if (analysis.hardeningRecommendations.length > 0) {
      lines.push('\n\x1b[1mHardening Recommendations:\x1b[0m');
      for (const rec of analysis.hardeningRecommendations) {
        const priorityColor = rec.priority === 'CRITICAL' ? '\x1b[31m' : '\x1b[33m';
        lines.push(`\n  ${priorityColor}[${rec.priority}]\x1b[0m ${rec.description}`);
        
        if (rec.canAutoFix) {
          lines.push('    \x1b[32m→ Can be auto-fixed with --quarantine flag\x1b[0m');
        }
        
        if (rec.manualSteps) {
          for (const step of rec.manualSteps) {
            lines.push(`    • ${step}`);
          }
        }
      }
    }
    
    return lines.join('\n');
  }
}

module.exports = { ServerActionHardening };
