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
 * Layer 8: Security Forensics - Behavioral Analyzer
 * 
 * AST-based detection engine for identifying suspicious code patterns
 * beyond simple regex matching. Uses @babel/parser for deep code analysis.
 * 
 * IMPORTANT: Layer 8 is READ-ONLY by default. It detects but does not transform
 * unless explicitly requested (quarantine mode). This follows the NeuroLint
 * principle of "never break code".
 */

'use strict';

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const path = require('path');
const { SEVERITY_LEVELS, IOC_CATEGORIES } = require('../constants');

const ErrorAggregator = require('../utils/error-aggregator');

class BehavioralAnalyzer {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.maxDepth = options.maxDepth || 10;
    this.includeContext = options.includeContext !== false;
    this.findings = [];
    this.currentFile = null;
    this.currentCode = null;
    this.errorAggregator = new ErrorAggregator({ verbose: this.verbose });
  }
  
  analyze(code, filePath, options = {}) {
    this.findings = [];
    this.currentFile = filePath;
    this.currentCode = code;
    this.lastFileErrors = [];
    
    let ast;
    try {
      ast = this.parseCode(code, filePath);
    } catch (error) {
      const errorEntry = { 
        phase: 'parse', 
        file: filePath,
        message: error.message
      };
      this.lastFileErrors.push(errorEntry);
      this.errorAggregator.addError(error, errorEntry);
      if (this.verbose) {
        console.error(`[Layer 8] Parse error in ${filePath}: ${error.message}`);
      }
      const result = [...this.findings];
      this.cleanup();
      return result;
    }
    
    if (!ast) {
      this.cleanup();
      return this.findings;
    }
    
    try {
      this.analyzeAST(ast, options);
    } catch (error) {
      const errorEntry = { 
        phase: 'ast-analysis', 
        file: filePath,
        message: error.message
      };
      this.lastFileErrors.push(errorEntry);
      this.errorAggregator.addError(error, errorEntry);
    }
    
    const result = [...this.findings];
    this.cleanup();
    return result;
  }
  
  cleanup() {
    this.currentCode = null;
    this.currentFile = null;
  }
  
  getLastFileErrors() {
    return this.lastFileErrors || [];
  }
  
  resetForNewScan() {
    this.findings = [];
    this.currentCode = null;
    this.currentFile = null;
    this.lastFileErrors = [];
    this.errorAggregator.clear();
  }
  
  parseCode(code, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    
    // Skip JSON files - they can't be parsed with Babel's JavaScript parser
    // JSON files are handled separately by the signature analyzer for regex patterns
    if (ext === '.json') {
      return null;
    }
    
    const isTypeScript = ['.ts', '.tsx'].includes(ext);
    const isJSX = ['.jsx', '.tsx'].includes(ext);
    
    const plugins = [
      'decorators-legacy',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'dynamicImport',
      'nullishCoalescingOperator',
      'optionalChaining',
      'optionalCatchBinding',
      'objectRestSpread',
      'asyncGenerators',
      'functionBind',
      'importMeta',
      'topLevelAwait',
      'bigInt',
      'logicalAssignment',
      'numericSeparator'
    ];
    
    if (isTypeScript) {
      plugins.push('typescript');
    }
    
    if (isJSX) {
      plugins.push('jsx');
    }
    
    try {
      return parser.parse(code, {
        sourceType: 'module',
        plugins,
        allowImportExportEverywhere: true,
        allowAwaitOutsideFunction: true,
        allowReturnOutsideFunction: true,
        allowSuperOutsideMethod: true,
        errorRecovery: true
      });
    } catch (error) {
      return parser.parse(code, {
        sourceType: 'script',
        plugins,
        errorRecovery: true
      });
    }
  }
  
  analyzeAST(ast, options = {}) {
    const self = this;
    
    traverse(ast, {
      CallExpression(nodePath) {
        self.checkDangerousCalls(nodePath);
        self.checkDynamicImports(nodePath);
        self.checkProcessEnvExposure(nodePath);
        self.checkNetworkRequests(nodePath);
        self.checkChildProcess(nodePath);
        self.checkCryptoMining(nodePath);
        self.checkReact19Patterns(nodePath);
        self.checkCVE202555184Patterns(nodePath);
        self.checkCVE202555183Patterns(nodePath);
      },
      
      WhileStatement(nodePath) {
        self.checkCVE202555184Patterns(nodePath);
      },
      
      ForStatement(nodePath) {
        self.checkCVE202555184Patterns(nodePath);
      },
      
      DoWhileStatement(nodePath) {
        self.checkCVE202555184Patterns(nodePath);
      },
      
      NewExpression(nodePath) {
        self.checkFunctionConstructor(nodePath);
        self.checkWebSocket(nodePath);
      },
      
      MemberExpression(nodePath) {
        self.checkPrototypePollution(nodePath);
        self.checkGlobalAccess(nodePath);
      },
      
      AssignmentExpression(nodePath) {
        self.checkDangerousAssignments(nodePath);
        self.checkPrototypeModification(nodePath);
      },
      
      Identifier(nodePath) {
        self.checkDangerousIdentifiers(nodePath);
      },
      
      StringLiteral(nodePath) {
        self.checkSuspiciousStrings(nodePath);
        self.checkEncodedPayloads(nodePath);
      },
      
      TemplateLiteral(nodePath) {
        self.checkTemplateInjection(nodePath);
      },
      
      ExportDefaultDeclaration(nodePath) {
        self.checkServerActionPatterns(nodePath);
      },
      
      ExpressionStatement(nodePath) {
        self.checkUseServerDirective(nodePath);
      },
      
      VariableDeclarator(nodePath) {
        self.checkObfuscatedVariables(nodePath);
      }
    });
  }
  
  checkDangerousCalls(nodePath) {
    const { node } = nodePath;
    const callee = node.callee;
    
    if (t.isIdentifier(callee)) {
      if (callee.name === 'eval') {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-001',
          signatureName: 'Direct eval() Call',
          severity: SEVERITY_LEVELS.CRITICAL,
          category: IOC_CATEGORIES.CODE_INJECTION,
          description: 'Direct use of eval() detected - can execute arbitrary code',
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          remediation: 'Remove eval() and use safe alternatives like JSON.parse()'
        });
      }
      
      if (callee.name === 'setTimeout' || callee.name === 'setInterval') {
        if (node.arguments.length > 0 && t.isStringLiteral(node.arguments[0])) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-002',
            signatureName: 'Timer with String Argument',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.CODE_INJECTION,
            description: `${callee.name}() with string argument - implicit eval`,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Use function reference instead of string'
          });
        }
      }
    }
    
    if (t.isMemberExpression(callee)) {
      const obj = callee.object;
      const prop = callee.property;
      
      if (t.isIdentifier(obj, { name: 'document' }) && 
          t.isIdentifier(prop, { name: 'write' })) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-003',
          signatureName: 'document.write() Usage',
          severity: SEVERITY_LEVELS.MEDIUM,
          category: IOC_CATEGORIES.CODE_INJECTION,
          description: 'document.write() can be used for XSS attacks',
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          remediation: 'Use DOM manipulation methods instead'
        });
      }
    }
  }
  
  checkDynamicImports(nodePath) {
    const { node } = nodePath;
    
    if (t.isImport(node.callee)) {
      const arg = node.arguments[0];
      
      if (arg && !t.isStringLiteral(arg) && !t.isTemplateLiteral(arg)) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-004',
          signatureName: 'Dynamic Import with Variable',
          severity: SEVERITY_LEVELS.MEDIUM,
          category: IOC_CATEGORIES.CODE_INJECTION,
          description: 'Dynamic import with non-literal path - potential code injection',
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          remediation: 'Use static import paths when possible'
        });
      }
    }
  }
  
  checkFunctionConstructor(nodePath) {
    const { node } = nodePath;
    
    if (t.isIdentifier(node.callee, { name: 'Function' })) {
      this.addFinding({
        signatureId: 'NEUROLINT-BEHAV-005',
        signatureName: 'Function Constructor',
        severity: SEVERITY_LEVELS.HIGH,
        category: IOC_CATEGORIES.CODE_INJECTION,
        description: 'new Function() can execute arbitrary code',
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        remediation: 'Replace with static function definitions'
      });
    }
  }
  
  checkProcessEnvExposure(nodePath) {
    const { node } = nodePath;
    
    if (t.isMemberExpression(node.callee)) {
      const calleeCode = this.getNodeCode(node.callee);
      
      if (calleeCode.includes('Response.json') || 
          calleeCode.includes('res.json') ||
          calleeCode.includes('res.send')) {
        
        const argCode = node.arguments.map(a => this.getNodeCode(a)).join('');
        
        if (argCode.includes('process.env')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-006',
            signatureName: 'Environment Variable Exposure',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.DATA_EXFILTRATION,
            description: 'Environment variables being exposed via HTTP response',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Never expose environment variables in responses'
          });
        }
      }
    }
  }
  
  checkNetworkRequests(nodePath) {
    const { node } = nodePath;
    const callee = node.callee;
    
    if (t.isIdentifier(callee, { name: 'fetch' }) ||
        (t.isMemberExpression(callee) && 
         t.isIdentifier(callee.property, { name: 'request' }))) {
      
      const arg = node.arguments[0];
      
      if (arg) {
        const argCode = this.getNodeCode(arg);
        
        if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(argCode)) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-007',
            signatureName: 'Network Request to IP Address',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.NETWORK,
            description: 'Network request to raw IP address - potential C2 communication',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Use domain names instead of IP addresses'
          });
        }
        
        if (argCode.includes('pastebin.com') ||
            argCode.includes('raw.githubusercontent.com') ||
            argCode.includes('iplogger') ||
            argCode.includes('webhook.site')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-008',
            signatureName: 'Request to Suspicious Domain',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.NETWORK,
            description: 'Network request to known exfiltration/payload hosting domain',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Verify the legitimacy of this external request'
          });
        }
      }
    }
  }
  
  checkChildProcess(nodePath) {
    const { node } = nodePath;
    const callee = node.callee;
    
    if (t.isMemberExpression(callee)) {
      const propName = t.isIdentifier(callee.property) ? callee.property.name : null;
      
      if (['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'fork'].includes(propName)) {
        const arg = node.arguments[0];
        const argCode = arg ? this.getNodeCode(arg) : '';
        
        if (argCode.includes('sh') || argCode.includes('bash') || 
            argCode.includes('cmd') || argCode.includes('powershell') ||
            argCode.includes('curl') || argCode.includes('wget')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-009',
            signatureName: 'Shell Command Execution',
            severity: SEVERITY_LEVELS.CRITICAL,
            category: IOC_CATEGORIES.BACKDOOR,
            description: `${propName}() executing shell command`,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Avoid shell command execution in application code'
          });
        }
      }
    }
  }
  
  checkCryptoMining(nodePath) {
    const { node } = nodePath;
    const callee = node.callee;
    
    const calleeCode = this.getNodeCode(callee);
    
    if (calleeCode.includes('CoinHive') || 
        calleeCode.includes('coinhive') ||
        calleeCode.includes('minero') ||
        calleeCode.includes('cryptonight') ||
        calleeCode.includes('wasm-miner')) {
      this.addFinding({
        signatureId: 'NEUROLINT-BEHAV-010',
        signatureName: 'Crypto Mining Activity',
        severity: SEVERITY_LEVELS.CRITICAL,
        category: IOC_CATEGORIES.CRYPTO_MINING,
        description: 'Potential cryptocurrency mining code detected',
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        remediation: 'Remove cryptocurrency mining code immediately'
      });
    }
  }
  
  checkWebSocket(nodePath) {
    const { node } = nodePath;
    
    if (t.isIdentifier(node.callee, { name: 'WebSocket' })) {
      const arg = node.arguments[0];
      
      if (arg) {
        const argCode = this.getNodeCode(arg);
        
        if (/wss?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(argCode)) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-011',
            signatureName: 'WebSocket to IP Address',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.NETWORK,
            description: 'WebSocket connection to raw IP address - potential C2 channel',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Use domain names for WebSocket connections'
          });
        }
      }
    }
  }
  
  checkPrototypePollution(nodePath) {
    const { node } = nodePath;
    
    if (t.isIdentifier(node.property, { name: '__proto__' }) ||
        t.isStringLiteral(node.property, { value: '__proto__' })) {
      this.addFinding({
        signatureId: 'NEUROLINT-BEHAV-012',
        signatureName: 'Prototype Access (__proto__)',
        severity: SEVERITY_LEVELS.HIGH,
        category: IOC_CATEGORIES.CODE_INJECTION,
        description: 'Direct __proto__ access - potential prototype pollution',
        line: node.loc?.start.line,
        column: node.loc?.start.column,
        remediation: 'Avoid direct prototype manipulation'
      });
    }
  }
  
  checkPrototypeModification(nodePath) {
    const { node } = nodePath;
    const left = node.left;
    
    if (t.isMemberExpression(left)) {
      const leftCode = this.getNodeCode(left);
      
      if (leftCode.includes('.prototype.') || 
          leftCode.includes('.__proto__') ||
          leftCode.includes('[\'prototype\']') ||
          leftCode.includes('["prototype"]')) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-013',
          signatureName: 'Prototype Modification',
          severity: SEVERITY_LEVELS.HIGH,
          category: IOC_CATEGORIES.CODE_INJECTION,
          description: 'Prototype chain being modified - potential prototype pollution attack',
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          remediation: 'Avoid modifying prototype chain'
        });
      }
    }
  }
  
  checkGlobalAccess(nodePath) {
    const { node } = nodePath;
    
    if (t.isIdentifier(node.object, { name: 'global' }) ||
        t.isIdentifier(node.object, { name: 'globalThis' }) ||
        t.isIdentifier(node.object, { name: 'window' })) {
      
      const propName = t.isIdentifier(node.property) ? node.property.name : null;
      
      if (['eval', 'Function', 'constructor'].includes(propName)) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-014',
          signatureName: 'Global Object Code Execution',
          severity: SEVERITY_LEVELS.HIGH,
          category: IOC_CATEGORIES.CODE_INJECTION,
          description: `Accessing ${propName} via global object - evasion technique`,
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          remediation: 'Remove global object access for code execution'
        });
      }
    }
  }
  
  checkDangerousAssignments(nodePath) {
    const { node } = nodePath;
    const left = node.left;
    
    if (t.isMemberExpression(left)) {
      const leftCode = this.getNodeCode(left);
      
      if (leftCode.includes('innerHTML') || leftCode.includes('outerHTML')) {
        const rightCode = this.getNodeCode(node.right);
        
        if (rightCode.includes('<script') || 
            rightCode.includes('onerror') ||
            rightCode.includes('onload')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-015',
            signatureName: 'XSS via innerHTML',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.CODE_INJECTION,
            description: 'Script or event handler injection via innerHTML',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Sanitize HTML content before assignment'
          });
        }
      }
    }
  }
  
  checkDangerousIdentifiers(nodePath) {
    const { node } = nodePath;
    
    const suspiciousNames = [
      'exfiltrate', 'backdoor', 'payload', 'shellcode',
      'keylogger', 'stealer', 'crypter', 'dropper'
    ];
    
    const lowerName = node.name.toLowerCase();
    
    for (const suspicious of suspiciousNames) {
      if (lowerName.includes(suspicious)) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-016',
          signatureName: 'Suspicious Variable Name',
          severity: SEVERITY_LEVELS.MEDIUM,
          category: IOC_CATEGORIES.BACKDOOR,
          description: `Variable name contains suspicious term: ${suspicious}`,
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          remediation: 'Investigate the purpose of this variable',
          matchedText: node.name
        });
        break;
      }
    }
  }
  
  checkSuspiciousStrings(nodePath) {
    const { node } = nodePath;
    const value = node.value;
    
    const suspiciousPatterns = [
      { pattern: /\/bin\/(?:sh|bash|zsh)/, name: 'Unix Shell Path' },
      { pattern: /cmd\.exe|powershell\.exe/, name: 'Windows Shell' },
      { pattern: /\\x[0-9a-f]{2}/gi, name: 'Hex Escape', minMatches: 5 },
      { pattern: /\\u[0-9a-f]{4}/gi, name: 'Unicode Escape', minMatches: 5 }
    ];
    
    for (const { pattern, name, minMatches } of suspiciousPatterns) {
      const matches = value.match(pattern);
      if (matches && (!minMatches || matches.length >= minMatches)) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-017',
          signatureName: `Suspicious String: ${name}`,
          severity: SEVERITY_LEVELS.MEDIUM,
          category: IOC_CATEGORIES.OBFUSCATION,
          description: `String contains ${name} pattern`,
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          matchedText: value.substring(0, 100)
        });
        break;
      }
    }
  }
  
  checkEncodedPayloads(nodePath) {
    const { node } = nodePath;
    const value = node.value;
    
    if (value.length > 500 && /^[A-Za-z0-9+/=]+$/.test(value)) {
      try {
        const decoded = Buffer.from(value, 'base64').toString();
        
        if (decoded.includes('eval') || 
            decoded.includes('Function') ||
            decoded.includes('exec') ||
            decoded.includes('<script')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-018',
            signatureName: 'Encoded Malicious Payload',
            severity: SEVERITY_LEVELS.CRITICAL,
            category: IOC_CATEGORIES.OBFUSCATION,
            description: 'Base64 string decodes to potentially malicious code',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Investigate the encoded payload immediately'
          });
        }
      } catch (e) {
      }
    }
  }
  
  checkTemplateInjection(nodePath) {
    const { node } = nodePath;
    
    for (const expr of node.expressions) {
      const exprCode = this.getNodeCode(expr);
      
      if (exprCode.includes('process.env') ||
          exprCode.includes('req.') ||
          exprCode.includes('request.')) {
        
        const quasis = node.quasis.map(q => q.value.raw).join('');
        
        if (quasis.includes('SELECT') || 
            quasis.includes('INSERT') ||
            quasis.includes('UPDATE') ||
            quasis.includes('DELETE')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-019',
            signatureName: 'SQL Injection via Template',
            severity: SEVERITY_LEVELS.CRITICAL,
            category: IOC_CATEGORIES.CODE_INJECTION,
            description: 'SQL query with user input via template literal',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Use parameterized queries instead'
          });
        }
      }
    }
  }
  
  checkServerActionPatterns(nodePath) {
    const { node } = nodePath;
    
    const parent = nodePath.parent;
    if (parent && parent.type === 'Program') {
      const body = parent.body;
      
      const hasUseServer = body.some(n => 
        n.type === 'ExpressionStatement' &&
        n.expression.type === 'StringLiteral' &&
        n.expression.value === 'use server'
      );
      
      if (hasUseServer && node.declaration) {
        const funcBody = this.getNodeCode(node.declaration);
        
        if (funcBody.includes('exec(') || 
            funcBody.includes('spawn(') ||
            funcBody.includes('eval(')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-020',
            signatureName: 'Dangerous Server Action',
            severity: SEVERITY_LEVELS.CRITICAL,
            category: IOC_CATEGORIES.RSC_SPECIFIC,
            description: 'Server action contains dangerous code execution patterns',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Remove code execution from server actions',
            references: ['CVE-2025-55182']
          });
        }
      }
    }
  }
  
  checkUseServerDirective(nodePath) {
    const { node } = nodePath;
    
    if (t.isStringLiteral(node.expression) && 
        node.expression.value === 'use server') {
      
      const unexpectedPaths = [
        'components/', 'lib/', 'utils/', 'hooks/', 
        'public/', 'static/', 'assets/'
      ];
      
      for (const unexpectedPath of unexpectedPaths) {
        if (this.currentFile.includes(unexpectedPath)) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-021',
            signatureName: 'use server in Unexpected Location',
            severity: SEVERITY_LEVELS.MEDIUM,
            category: IOC_CATEGORIES.RSC_SPECIFIC,
            description: `Server action directive found in ${unexpectedPath}`,
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Server actions should be in app/ or actions/ directories',
            references: ['CVE-2025-55182']
          });
          break;
        }
      }
    }
  }
  
  checkObfuscatedVariables(nodePath) {
    const { node } = nodePath;
    const id = node.id;
    
    if (t.isIdentifier(id)) {
      const name = id.name;
      
      if (/^_0x[a-f0-9]+$/i.test(name) || /^_[a-z]{1,2}\d{4,}$/i.test(name)) {
        this.addFinding({
          signatureId: 'NEUROLINT-BEHAV-022',
          signatureName: 'Obfuscated Variable Name',
          severity: SEVERITY_LEVELS.MEDIUM,
          category: IOC_CATEGORIES.OBFUSCATION,
          description: 'Variable name suggests code obfuscation',
          line: node.loc?.start.line,
          column: node.loc?.start.column,
          matchedText: name,
          remediation: 'Deobfuscate code for security review'
        });
      }
    }
  }
  
  checkReact19Patterns(nodePath) {
    const { node } = nodePath;
    const callee = node.callee;
    
    if (t.isIdentifier(callee)) {
      if (callee.name === 'use') {
        const arg = node.arguments[0];
        if (arg && t.isCallExpression(arg)) {
          const innerCallee = arg.callee;
          
          if (t.isIdentifier(innerCallee) && innerCallee.name === 'fetch') {
            const fetchArgs = arg.arguments;
            if (fetchArgs.length > 0) {
              const urlArg = fetchArgs[0];
              
              if (t.isTemplateLiteral(urlArg) && urlArg.expressions.length > 0) {
                const hasTaintedExpr = urlArg.expressions.some(expr => {
                  const isTaintedSource = (node) => {
                    if (t.isCallExpression(node)) {
                      const nodeCallee = node.callee;
                      if (t.isMemberExpression(nodeCallee)) {
                        const obj = nodeCallee.object;
                        const prop = nodeCallee.property;
                        if (t.isIdentifier(obj) && t.isIdentifier(prop)) {
                          const objName = obj.name;
                          const propName = prop.name;
                          if ((objName === 'searchParams' || objName === 'formData') && propName === 'get') {
                            return true;
                          }
                        }
                      }
                      if (t.isIdentifier(nodeCallee) && nodeCallee.name === 'cookies') {
                        return true;
                      }
                    }
                    return false;
                  };
                  
                  const getRootObject = (memberExpr) => {
                    let current = memberExpr;
                    while (t.isMemberExpression(current.object)) {
                      current = current.object;
                    }
                    return current.object;
                  };
                  
                  const hasUserInputProperty = (memberExpr) => {
                    const props = [];
                    let current = memberExpr;
                    while (t.isMemberExpression(current)) {
                      if (t.isIdentifier(current.property)) {
                        props.push(current.property.name);
                      }
                      current = current.object;
                    }
                    return props.some(p => p === 'query' || p === 'body' || p === 'params');
                  };
                  
                  if (isTaintedSource(expr)) {
                    return true;
                  }
                  
                  if (t.isMemberExpression(expr)) {
                    const root = getRootObject(expr);
                    if (t.isIdentifier(root)) {
                      const rootName = root.name;
                      if ((rootName === 'req' || rootName === 'request' || rootName === 'context') && 
                          hasUserInputProperty(expr)) {
                        return true;
                      }
                    }
                  }
                  
                  return false;
                });
                
                if (hasTaintedExpr) {
                  this.addFinding({
                    signatureId: 'NEUROLINT-BEHAV-023',
                    signatureName: 'React 19 use() with User Input',
                    severity: SEVERITY_LEVELS.HIGH,
                    category: IOC_CATEGORIES.RSC_SPECIFIC,
                    description: 'React 19 use() hook with user-controlled URL in fetch',
                    line: node.loc?.start.line,
                    column: node.loc?.start.column,
                    remediation: 'Validate and sanitize inputs before constructing fetch URLs',
                    references: ['React 19 Security', 'CVE-2025-55182']
                  });
                }
              }
            }
          }
        }
      }
      
      if (callee.name === 'useActionState') {
        const actionArg = node.arguments[0];
        if (actionArg) {
          const actionCode = this.getNodeCode(actionArg);
          
          if (actionCode.includes('eval') || 
              actionCode.includes('exec') ||
              actionCode.includes('spawn') ||
              actionCode.includes('Function(')) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-024',
              signatureName: 'React 19 useActionState with Code Execution',
              severity: SEVERITY_LEVELS.CRITICAL,
              category: IOC_CATEGORIES.RSC_SPECIFIC,
              description: 'useActionState action contains code execution patterns',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Remove code execution from action handlers',
              references: ['React 19 Security', 'CVE-2025-55182']
            });
          }
        }
      }
      
      if (callee.name === 'useOptimistic') {
        const updateFnArg = node.arguments[1];
        if (updateFnArg) {
          const updateCode = this.getNodeCode(updateFnArg);
          
          if (updateCode.includes('dangerouslySetInnerHTML') ||
              updateCode.includes('innerHTML') ||
              updateCode.includes('eval')) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-025',
              signatureName: 'React 19 useOptimistic XSS Risk',
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.CODE_INJECTION,
              description: 'useOptimistic update function contains XSS-prone patterns',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Sanitize data in optimistic updates',
              references: ['React 19 Security', 'OWASP XSS']
            });
          }
        }
      }
      
      if (callee.name === 'startTransition') {
        const transitionArg = node.arguments[0];
        if (transitionArg) {
          const transitionCode = this.getNodeCode(transitionArg);
          
          if (transitionCode.includes('fetch') && 
              (transitionCode.includes('process.env') || 
               transitionCode.includes('cookies') ||
               transitionCode.includes('headers'))) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-026',
              signatureName: 'React 19 Transition Data Leak',
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.DATA_EXFILTRATION,
              description: 'startTransition contains potential data exfiltration pattern',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Audit data handling in transitions',
              references: ['React 19 Security']
            });
          }
        }
      }
      
      if (callee.name === 'cache') {
        const cacheArg = node.arguments[0];
        if (cacheArg) {
          const cacheCode = this.getNodeCode(cacheArg);
          
          if (cacheCode.includes('cookies') || 
              cacheCode.includes('headers') ||
              cacheCode.includes('session') ||
              cacheCode.includes('auth')) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-027',
              signatureName: 'React 19 Server Cache Poisoning Risk',
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.RSC_SPECIFIC,
              description: 'Server-side cache may store user-specific sensitive data',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Never cache user-specific or sensitive data',
              references: ['React 19 Security', 'OWASP Cache Poisoning']
            });
          }
        }
      }
    }
  }
  
  checkCVE202555184Patterns(nodePath) {
    const { node } = nodePath;
    
    if (t.isWhileStatement(node) || t.isForStatement(node) || t.isDoWhileStatement(node)) {
      const test = node.test;
      
      const isInfiniteLoop = 
        (t.isBooleanLiteral(test) && test.value === true) ||
        (t.isNumericLiteral(test) && test.value !== 0) ||
        (t.isIdentifier(test) && test.name === 'true') ||
        (!test);
      
      if (isInfiniteLoop) {
        const hasServerDirective = this.currentCode && 
          this.currentCode.includes("'use server'") || 
          this.currentCode.includes('"use server"');
        
        if (hasServerDirective) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-028',
            signatureName: 'CVE-2025-55184 DoS: Infinite Loop in Server Context',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.RSC_SPECIFIC,
            description: 'Infinite loop detected in server action context - DoS vulnerability',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Add proper termination conditions to prevent server hang',
            references: ['CVE-2025-55184', 'MITRE T1499']
          });
        }
      }
    }
    
    if (t.isCallExpression(node)) {
      const callee = node.callee;
      
      if (t.isIdentifier(callee) && 
          ['setImmediate', 'queueMicrotask'].includes(callee.name)) {
        const arg = node.arguments[0];
        if (arg) {
          const argCode = this.getNodeCode(arg);
          if (argCode.includes(callee.name)) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-029',
              signatureName: 'CVE-2025-55184 DoS: Recursive Async Scheduling',
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.RSC_SPECIFIC,
              description: 'Recursive async scheduling can cause infinite CPU consumption',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Add termination conditions or iteration limits',
              references: ['CVE-2025-55184']
            });
          }
        }
      }
      
      if (t.isMemberExpression(callee) && 
          t.isIdentifier(callee.object) && 
          callee.object.name === 'process' &&
          t.isIdentifier(callee.property) && 
          callee.property.name === 'nextTick') {
        const arg = node.arguments[0];
        if (arg) {
          const argCode = this.getNodeCode(arg);
          if (argCode.includes('nextTick')) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-029',
              signatureName: 'CVE-2025-55184 DoS: Recursive nextTick',
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.RSC_SPECIFIC,
              description: 'Recursive process.nextTick can starve the event loop',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Add termination conditions',
              references: ['CVE-2025-55184']
            });
          }
        }
      }
    }
  }
  
  checkCVE202555183Patterns(nodePath) {
    const { node } = nodePath;
    
    if (!t.isCallExpression(node)) return;
    
    const callee = node.callee;
    
    if (t.isMemberExpression(callee) && 
        t.isIdentifier(callee.property) && 
        callee.property.name === 'toString') {
      
      const hasServerDirective = this.currentCode && 
        (this.currentCode.includes("'use server'") || 
         this.currentCode.includes('"use server"'));
      
      if (hasServerDirective) {
        const objectCode = this.getNodeCode(callee.object);
        
        if (objectCode.includes('function') || 
            objectCode.includes('async') ||
            objectCode.includes('=>')) {
          this.addFinding({
            signatureId: 'NEUROLINT-BEHAV-030',
            signatureName: 'CVE-2025-55183: Server Function Source Exposure',
            severity: SEVERITY_LEVELS.HIGH,
            category: IOC_CATEGORIES.RSC_SPECIFIC,
            description: 'Function.toString() in server context exposes source code',
            line: node.loc?.start.line,
            column: node.loc?.start.column,
            remediation: 'Never expose function source code from server actions',
            references: ['CVE-2025-55183']
          });
        }
      }
    }
    
    if (t.isIdentifier(callee) && callee.name === 'String') {
      const arg = node.arguments[0];
      if (arg) {
        const argCode = this.getNodeCode(arg);
        if (argCode.includes('function') || argCode.includes('=>')) {
          const hasServerDirective = this.currentCode && 
            (this.currentCode.includes("'use server'") || 
             this.currentCode.includes('"use server"'));
          
          if (hasServerDirective) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-031',
              signatureName: 'CVE-2025-55183: Function Stringification in Server',
              severity: SEVERITY_LEVELS.HIGH,
              category: IOC_CATEGORIES.RSC_SPECIFIC,
              description: 'String(function) in server context exposes source code',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Avoid converting functions to strings in server actions',
              references: ['CVE-2025-55183']
            });
          }
        }
      }
    }
    
    if (t.isMemberExpression(callee) && 
        t.isIdentifier(callee.property) && 
        ['json', 'send'].includes(callee.property.name)) {
      
      const hasServerDirective = this.currentCode && 
        (this.currentCode.includes("'use server'") || 
         this.currentCode.includes('"use server"'));
      
      if (hasServerDirective) {
        const arg = node.arguments[0];
        if (arg) {
          const argCode = this.getNodeCode(arg);
          
          if (argCode.includes('toString') || 
              argCode.includes('.stack') ||
              argCode.includes('Function')) {
            this.addFinding({
              signatureId: 'NEUROLINT-BEHAV-032',
              signatureName: 'CVE-2025-55183: Response May Contain Source Code',
              severity: SEVERITY_LEVELS.MEDIUM,
              category: IOC_CATEGORIES.RSC_SPECIFIC,
              description: 'Server response may contain function source code or stack traces',
              line: node.loc?.start.line,
              column: node.loc?.start.column,
              remediation: 'Sanitize response data to remove source code and stack traces',
              references: ['CVE-2025-55183']
            });
          }
        }
      }
    }
  }
  
  getNodeCode(node) {
    if (!node || !node.loc || !this.currentCode) return '';
    
    const lines = this.currentCode.split('\n');
    const startLine = node.loc.start.line - 1;
    const endLine = node.loc.end.line - 1;
    const startCol = node.loc.start.column;
    const endCol = node.loc.end.column;
    
    if (startLine === endLine) {
      return lines[startLine]?.substring(startCol, endCol) || '';
    }
    
    let code = lines[startLine]?.substring(startCol) || '';
    for (let i = startLine + 1; i < endLine; i++) {
      code += '\n' + (lines[i] || '');
    }
    code += '\n' + (lines[endLine]?.substring(0, endCol) || '');
    
    return code;
  }
  
  addFinding(finding) {
    const context = this.includeContext ? this.getContext(finding.line) : [];
    
    this.findings.push({
      id: `finding-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: this.currentFile,
      ...finding,
      context,
      confidence: finding.confidence || 0.85,
      timestamp: new Date().toISOString()
    });
  }
  
  getContext(line, range = 3) {
    if (!line || !this.currentCode) return [];
    
    const lines = this.currentCode.split('\n');
    const context = [];
    
    const start = Math.max(0, line - range - 1);
    const end = Math.min(lines.length, line + range);
    
    for (let i = start; i < end; i++) {
      context.push({
        lineNumber: i + 1,
        content: lines[i],
        isMatch: i + 1 === line
      });
    }
    
    return context;
  }
  
  getStats() {
    const stats = {
      total: this.findings.length,
      bySeverity: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        info: 0
      },
      byCategory: {}
    };
    
    for (const finding of this.findings) {
      stats.bySeverity[finding.severity] = (stats.bySeverity[finding.severity] || 0) + 1;
      stats.byCategory[finding.category] = (stats.byCategory[finding.category] || 0) + 1;
    }
    
    return stats;
  }
  
  getErrors() {
    return this.errorAggregator.toJSON();
  }
  
  clearErrors() {
    this.errorAggregator.clear();
  }
}

module.exports = BehavioralAnalyzer;
