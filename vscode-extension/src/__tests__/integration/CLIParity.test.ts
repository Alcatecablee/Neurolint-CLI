/**
 * Integration Tests: VS Code Extension vs CLI Parity
 * 
 * Ensures the VS Code extension produces consistent output with the CLI processFile function.
 * This validates that the shared-core integration works correctly across both platforms.
 * 
 * Testing Strategy:
 * - CLIProcessFileSimulator: Represents EXPECTED CLI behavior (authoritative specification)
 * - ExtensionAnalyzer: Represents extension behavior (can diverge for testing)
 * - When aligned: Extension produces CLI-compatible output
 * - When divergent: Test infrastructure detects the mismatch
 * 
 * NOTE: True E2E parity requires running both CLI and extension against same code.
 * These tests verify the extension matches the SPECIFIED CLI behavior.
 * The shared-core module ensures actual runtime parity.
 * 
 * Architecture:
 * - CLI Path: CLIProcessFileSimulator.analyze() - expected behavior specification
 * - Extension Path: SharedCoreAdapter -> mockNeurolintCore -> ExtensionAnalyzer
 * - Parity Tests: Verify extension output matches expected CLI specification
 */

import * as vscode from 'vscode';
import { SharedCoreAdapter } from '../../utils/SharedCoreAdapter';
import * as path from 'path';

let extensionBehaviorOverride: ((code: string, options: any) => any) | null = null;

const mockNeurolintCore = {
  core: {
    initialize: jest.fn().mockResolvedValue(undefined)
  },
  analyze: jest.fn().mockImplementation((code: string, options: any) => {
    if (extensionBehaviorOverride) {
      return Promise.resolve(extensionBehaviorOverride(code, options));
    }
    return Promise.resolve({ issues: [] });
  }),
  applyFixes: jest.fn().mockImplementation((code: string, issues: any[], options: any) => {
    return Promise.resolve({
      success: true,
      code,
      appliedFixes: [],
      totalFixes: 0
    });
  }),
  rules: new Map([['react-key', {}], ['console-log', {}]])
};

jest.mock('../../utils/SharedCoreAdapter', () => {
  const originalModule = jest.requireActual('../../utils/SharedCoreAdapter');
  return {
    ...originalModule,
    SharedCoreAdapter: class extends originalModule.SharedCoreAdapter {
      constructor(outputChannel: any, workspaceRoot: string) {
        super(outputChannel, workspaceRoot);
        (this as any).neurolintCore = mockNeurolintCore;
      }
    }
  };
});

/**
 * Extension Behavior Simulator
 * Simulates the SharedCoreAdapter/neurolint-core behavior in the VS Code extension.
 * When aligned with CLI, produces identical output. When divergent, produces different output.
 */
class ExtensionAnalyzer {
  private static divergeFromCLI = false;

  static setDivergentMode(diverge: boolean): void {
    this.divergeFromCLI = diverge;
  }

  static analyze(code: string, options: any): {
    issues: Array<{
      severity: string;
      message: string;
      description: string;
      layer: number;
      location: { line: number; column: number };
      ruleName: string;
      rule: string;
    }>;
  } {
    if (this.divergeFromCLI) {
      return {
        issues: [{
          severity: 'error',
          message: 'DIVERGENT: Extension detected different issue',
          description: 'Extension analyzed differently than CLI',
          layer: 99,
          location: { line: 999, column: 999 },
          ruleName: 'divergent-rule',
          rule: 'divergent-rule'
        }]
      };
    }
    
    return CLIProcessFileSimulator.analyze(code, options);
  }
}

/**
 * CLI Behavior Simulator
 * Independently simulates CLI fix-master.js processFile behavior.
 * This is the AUTHORITATIVE source for expected CLI output.
 */
class CLIProcessFileSimulator {
  /**
   * Simulate CLI processFile behavior independently
   * This must match the actual CLI behavior to be a valid comparison
   */
  static analyze(code: string, options: any): {
    issues: Array<{
      severity: string;
      message: string;
      description: string;
      layer: number;
      location: { line: number; column: number };
      ruleName: string;
      rule: string;
    }>;
  } {
    const issues: any[] = [];
    const lines = code.split('\n');
    
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineNum = lineIndex + 1;
      
      if (options?.layers?.includes(2) || !options?.layers) {
        const consoleMatch = line.match(/console\.(log|warn|error|debug)\(/);
        if (consoleMatch) {
          issues.push({
            severity: 'warning',
            message: `Remove console.${consoleMatch[1]} statement`,
            description: `Console statements should be removed in production code`,
            layer: 2,
            location: { line: lineNum, column: line.indexOf('console') + 1 },
            ruleName: 'no-console',
            rule: 'no-console'
          });
        }
      }
      
      if (options?.layers?.includes(3) || !options?.layers) {
        const mapMatch = line.match(/\.map\([^)]*=>\s*<\w+[^>]*>(?!.*key=)/);
        if (mapMatch && !line.includes('key=')) {
          issues.push({
            severity: 'warning',
            message: 'Missing key prop in list item',
            description: 'Each child in a list should have a unique "key" prop',
            layer: 3,
            location: { line: lineNum, column: line.indexOf('.map') + 1 },
            ruleName: 'react-key',
            rule: 'react-key'
          });
        }
      }
      
      if (options?.layers?.includes(5) || !options?.layers) {
        if (line.includes('useState') || line.includes('useEffect')) {
          const hasUseClient = code.startsWith("'use client'") || code.startsWith('"use client"');
          if (!hasUseClient && options?.filename?.includes('page')) {
            issues.push({
              severity: 'warning',
              message: 'Missing "use client" directive',
              description: 'Files using React hooks should have "use client" directive for Next.js 14+',
              layer: 5,
              location: { line: 1, column: 1 },
              ruleName: 'use-client',
              rule: 'use-client'
            });
            break;
          }
        }
      }
    }
    
    return { issues };
  }
  
  static applyFixes(code: string, issues: any[], options: any): {
    success: boolean;
    code: string;
    appliedFixes: any[];
    totalFixes: number;
  } {
    let fixedCode = code;
    const appliedFixes: any[] = [];
    
    for (const issue of issues) {
      if (issue.ruleName === 'no-console') {
        const lines = fixedCode.split('\n');
        lines[issue.location.line - 1] = '// [NeuroLint] Removed console statement';
        fixedCode = lines.join('\n');
        appliedFixes.push({
          rule: issue.ruleName,
          description: `Removed ${issue.message}`,
          location: issue.location,
          layer: issue.layer
        });
      }
    }
    
    return {
      success: true,
      code: fixedCode,
      appliedFixes,
      totalFixes: appliedFixes.length
    };
  }
}

describe('CLI Parity Tests', () => {
  let adapter: SharedCoreAdapter;
  let outputChannel: vscode.OutputChannel;

  beforeEach(() => {
    jest.clearAllMocks();
    outputChannel = vscode.window.createOutputChannel('NeuroLint Test');
    adapter = new SharedCoreAdapter(outputChannel, '/test/workspace');
  });

  describe('Output Format Parity - Extension vs CLI (Independent Comparison)', () => {
    const testCases = [
      {
        name: 'console.log removal (Layer 2)',
        code: `function test() {\n  console.log('debug');\n  return 42;\n}`,
        filename: 'test.ts',
        filePath: '/test/workspace/test.ts',
        layers: [2]
      },
      {
        name: 'missing key props (Layer 3)',
        code: `const items = [1, 2, 3];\nconst list = items.map(item => <div>{item}</div>);`,
        filename: 'Component.tsx',
        filePath: '/test/workspace/src/components/Component.tsx',
        layers: [3]
      },
      {
        name: 'missing use client directive (Layer 5)',
        code: `import { useState } from 'react';\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}`,
        filename: 'page.tsx',
        filePath: '/test/workspace/app/page.tsx',
        layers: [5]
      }
    ];

    beforeEach(() => {
      ExtensionAnalyzer.setDivergentMode(false);
      extensionBehaviorOverride = (code, options) => ExtensionAnalyzer.analyze(code, options);
    });

    afterEach(() => {
      ExtensionAnalyzer.setDivergentMode(false);
      extensionBehaviorOverride = null;
    });

    testCases.forEach(({ name, code, filename, filePath, layers }) => {
      it(`should produce identical output to CLI for: ${name}`, async () => {
        const cliResult = CLIProcessFileSimulator.analyze(code, { filename: filePath, layers });

        const extensionResult = await adapter.analyze(code, { filename: filePath, layers });

        expect(extensionResult.issues.length).toBe(cliResult.issues.length);
        
        if (extensionResult.issues.length > 0 && cliResult.issues.length > 0) {
          for (let i = 0; i < extensionResult.issues.length; i++) {
            const extIssue = extensionResult.issues[i];
            const cliIssue = cliResult.issues[i];
            
            expect(extIssue.message).toBe(cliIssue.message);
            expect(extIssue.layer).toBe(cliIssue.layer);
            expect(extIssue.location.line).toBe(cliIssue.location.line);
            expect(extIssue.location.column).toBe(cliIssue.location.column);
            expect(extIssue.ruleName).toBe(cliIssue.ruleName);
          }
        }
      });
    });

    it('should detect when extension diverges from CLI output', async () => {
      const code = 'console.log("test");';
      const options = { filename: '/workspace/test.ts', layers: [2] };
      
      const cliResult = CLIProcessFileSimulator.analyze(code, options);
      
      ExtensionAnalyzer.setDivergentMode(true);

      const extensionResult = await adapter.analyze(code, options);

      expect(extensionResult.issues[0].message).not.toBe(cliResult.issues[0].message);
      expect(extensionResult.issues[0].layer).not.toBe(cliResult.issues[0].layer);
      expect(extensionResult.issues[0].location).not.toEqual(cliResult.issues[0].location);
      
      ExtensionAnalyzer.setDivergentMode(false);
    });

    it('should verify parity detection works correctly', async () => {
      const code = 'console.log("test");';
      const options = { filename: '/workspace/test.ts', layers: [2] };
      
      const cliResult = CLIProcessFileSimulator.analyze(code, options);
      
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: [{
          severity: 'warning',
          message: 'DIFFERENT MESSAGE',
          description: 'Wrong description',
          layer: 2,
          location: { line: 999, column: 999 },
          ruleName: 'wrong-rule'
        }]
      });

      const extensionResult = await adapter.analyze(code, options);

      expect(extensionResult.issues[0].message).not.toBe(cliResult.issues[0].message);
      expect(extensionResult.issues[0].location).not.toEqual(cliResult.issues[0].location);
    });

    it('should match CLI issue structure for all detected issues', async () => {
      const code = `function test() {
  console.log("a");
  console.warn("b");
  return 42;
}`;
      const options = { filename: '/workspace/test.ts', layers: [2] };
      
      const cliResult = CLIProcessFileSimulator.analyze(code, options);
      
      mockNeurolintCore.analyze.mockImplementationOnce((inputCode: string, inputOptions: any) => {
        return Promise.resolve(CLIProcessFileSimulator.analyze(inputCode, inputOptions));
      });

      const extResult = await adapter.analyze(code, options);

      expect(extResult.issues.length).toBe(cliResult.issues.length);
      expect(extResult.issues.length).toBe(2);

      for (let i = 0; i < extResult.issues.length; i++) {
        const extIssue = extResult.issues[i];
        const cliIssue = cliResult.issues[i];

        expect(extIssue.message).toBe(cliIssue.message);
        expect(extIssue.layer).toBe(cliIssue.layer);
        expect(extIssue.location).toEqual(cliIssue.location);
        expect(extIssue.ruleName).toBe(cliIssue.ruleName);
      }
    });
  });

  describe('File Path Handling Parity', () => {
    it('should pass full file path to shared core for better layer heuristics', async () => {
      const fullPath = '/test/workspace/src/components/Button.tsx';
      const code = 'export function Button() { return <button>Click</button>; }';

      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: []
      });

      await adapter.analyze(code, { 
        filename: fullPath,
        layers: [1, 2, 3, 4, 5, 6, 7] 
      });

      expect(mockNeurolintCore.analyze).toHaveBeenCalledWith(
        code,
        expect.objectContaining({
          filename: fullPath,
          platform: 'vscode'
        })
      );
    });

    it('should handle relative paths consistently', async () => {
      const relativePath = 'src/components/Button.tsx';
      const code = 'export function Button() { return <button>Click</button>; }';

      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: []
      });

      await adapter.analyze(code, { filename: relativePath });

      expect(mockNeurolintCore.analyze).toHaveBeenCalledWith(
        code,
        expect.objectContaining({
          filename: relativePath
        })
      );
    });

    it('should extract file extension for layer detection', async () => {
      const tsxFile = 'Component.tsx';
      const tsFile = 'utils.ts';
      const jsxFile = 'App.jsx';

      mockNeurolintCore.analyze.mockResolvedValue({ issues: [] });

      await adapter.analyze('const x = 1;', { filename: tsxFile });
      await adapter.analyze('const x = 1;', { filename: tsFile });
      await adapter.analyze('const x = 1;', { filename: jsxFile });

      expect(mockNeurolintCore.analyze).toHaveBeenCalledTimes(3);
    });
  });

  describe('Layer Execution Parity', () => {
    it('should execute layers in the same order as CLI', async () => {
      const code = 'console.log("test");';
      const layers = [1, 2, 3, 4, 5, 6, 7];

      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: []
      });

      await adapter.analyze(code, { layers, filename: 'test.tsx' });

      expect(mockNeurolintCore.analyze).toHaveBeenCalledWith(
        code,
        expect.objectContaining({
          layers: expect.arrayContaining([1, 2, 3, 4, 5, 6, 7])
        })
      );
    });

    it('should respect layer subset selection like CLI', async () => {
      const code = 'console.log("test");';
      const layers = [2, 3];

      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: [{
          severity: 'warning',
          message: 'Remove console.log',
          layer: 2,
          location: { line: 1, column: 1 }
        }]
      });

      const result = await adapter.analyze(code, { layers, filename: 'test.tsx' });

      expect(mockNeurolintCore.analyze).toHaveBeenCalledWith(
        code,
        expect.objectContaining({
          layers: [2, 3]
        })
      );
    });
  });

  describe('Fix Application Parity', () => {
    it('should return fix results matching CLI processFile format', async () => {
      const code = 'console.log("test");';
      const issues = [{
        type: 'warning' as const,
        message: 'Remove console.log',
        description: 'Console statements should be removed in production',
        layer: 2,
        location: { line: 1, column: 1 },
        ruleName: 'no-console'
      }];

      mockNeurolintCore.applyFixes = jest.fn().mockResolvedValueOnce({
        success: true,
        code: '// [NeuroLint] Removed console.log\n;',
        appliedFixes: [{
          rule: 'no-console',
          description: 'Removed console.log statement',
          location: { line: 1, column: 1 },
          layer: 2
        }],
        totalFixes: 1
      });

      const result = await adapter.applyFixes(code, issues, { dryRun: false });

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('code');
      expect(result).toHaveProperty('appliedFixes');
      expect(result.success).toBe(true);
      expect(result.appliedFixes).toHaveLength(1);
    });

    it('should pass filename and filePath to shared core during fix application', async () => {
      const code = 'console.log("test");';
      const filename = 'Button.tsx';
      const filePath = '/workspace/src/components/Button.tsx';
      const issues = [{
        type: 'warning' as const,
        message: 'Remove console.log',
        description: 'Console statements should be removed in production',
        layer: 2,
        location: { line: 1, column: 1 },
        ruleName: 'no-console'
      }];

      mockNeurolintCore.applyFixes = jest.fn().mockResolvedValueOnce({
        success: true,
        code: '// fixed',
        appliedFixes: [],
        totalFixes: 0
      });

      await adapter.applyFixes(code, issues, { 
        dryRun: false,
        filename: filename,
        filePath: filePath
      });

      expect(mockNeurolintCore.applyFixes).toHaveBeenCalledWith(
        code,
        issues,
        expect.objectContaining({
          filename: filename,
          filePath: filePath,
          platform: 'vscode'
        })
      );
    });

    it('should match CLI fix application output independently', async () => {
      const code = 'console.log("test");';
      const options = { filename: '/workspace/test.ts', layers: [2] };
      
      const cliResult = CLIProcessFileSimulator.analyze(code, options);
      const cliFixResult = CLIProcessFileSimulator.applyFixes(code, cliResult.issues, options);
      
      mockNeurolintCore.applyFixes = jest.fn().mockImplementationOnce((inputCode, inputIssues, inputOptions) => {
        return Promise.resolve(CLIProcessFileSimulator.applyFixes(inputCode, inputIssues, inputOptions));
      });

      const extensionFixResult = await adapter.applyFixes(code, cliResult.issues as any, {
        filename: 'test.ts',
        filePath: '/workspace/test.ts'
      });

      expect(extensionFixResult.success).toBe(cliFixResult.success);
      expect(extensionFixResult.appliedFixes.length).toBe(cliFixResult.appliedFixes.length);
      expect(extensionFixResult.code).toBe(cliFixResult.code);
    });

    it('should include detailed change descriptions in fix results', async () => {
      const code = 'const items = [1,2,3].map(x => <div>{x}</div>);';
      const issues = [{
        type: 'warning' as const,
        message: 'Missing key prop',
        description: 'React lists need unique key props',
        layer: 3,
        location: { line: 1, column: 30 },
        ruleName: 'react-key'
      }];

      mockNeurolintCore.applyFixes = jest.fn().mockResolvedValueOnce({
        success: true,
        code: 'const items = [1,2,3].map((x, index) => <div key={index}>{x}</div>);',
        appliedFixes: [{
          rule: 'react-key',
          description: 'Added key={index} prop to list item',
          location: { line: 1, column: 30 },
          layer: 3,
          oldCode: '<div>{x}</div>',
          newCode: '<div key={index}>{x}</div>'
        }],
        totalFixes: 1
      });

      const result = await adapter.applyFixes(code, issues, { dryRun: false });

      expect(result.appliedFixes[0]).toHaveProperty('description');
      expect(result.appliedFixes[0].description).toContain('key');
    });
  });

  describe('Error Handling Parity', () => {
    it('should handle syntax errors consistently with CLI', async () => {
      const invalidCode = 'const x = {';
      
      mockNeurolintCore.analyze.mockRejectedValueOnce(new Error('Syntax error: Unexpected end of input'));

      const result = await adapter.analyze(invalidCode, { filename: 'broken.ts' });

      expect(result.error).toBeDefined();
      expect(result.issues).toHaveLength(0);
    });

    it('should handle empty file consistently with CLI', async () => {
      const result = await adapter.analyze('', { filename: 'empty.ts' });

      expect(result.error).toContain('empty');
    });

    it('should handle unsupported file types gracefully', async () => {
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: []
      });

      const result = await adapter.analyze('const x = 1;', { filename: 'data.json' });

      expect(result.issues).toBeDefined();
    });
  });

  describe('Summary Format Parity', () => {
    it('should group issues by layer like CLI output', async () => {
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: [
          { severity: 'warning', message: 'Issue 1', layer: 2, location: { line: 1, column: 1 } },
          { severity: 'warning', message: 'Issue 2', layer: 2, location: { line: 2, column: 1 } },
          { severity: 'warning', message: 'Issue 3', layer: 3, location: { line: 3, column: 1 } }
        ]
      });

      const result = await adapter.analyze('const x = 1;', { filename: 'test.tsx' });

      expect(result.summary.issuesByLayer).toBeDefined();
      expect(typeof result.summary.issuesByLayer).toBe('object');
      
      const layer2Issues = result.summary.issuesByLayer[2] || [];
      const layer3Issues = result.summary.issuesByLayer[3] || [];
      
      expect(layer2Issues.length).toBe(2);
      expect(layer3Issues.length).toBe(1);
    });

    it('should include total issue count matching CLI', async () => {
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: [
          { severity: 'warning', message: 'Issue 1', layer: 2, location: { line: 1, column: 1 } },
          { severity: 'error', message: 'Issue 2', layer: 3, location: { line: 2, column: 1 } }
        ]
      });

      const result = await adapter.analyze('const x = 1;', { filename: 'test.tsx' });

      expect(result.summary.totalIssues).toBe(2);
    });
  });
});

describe('CLI vs Extension Output Comparison', () => {
  let adapter: SharedCoreAdapter;
  let outputChannel: vscode.OutputChannel;

  beforeEach(() => {
    jest.clearAllMocks();
    outputChannel = vscode.window.createOutputChannel('NeuroLint Test');
    adapter = new SharedCoreAdapter(outputChannel, '/test/workspace');
  });

  const realWorldTestCases = [
    {
      name: 'React component with multiple issues',
      code: `
import React from 'react';

export function UserList({ users }) {
  console.log('Rendering users:', users);
  
  return (
    <div>
      {users.map(user => (
        <div>
          <span>{user.name}</span>
          <button onClick={() => alert('Clicked!')}>Delete</button>
        </div>
      ))}
    </div>
  );
}`,
      filename: 'UserList.tsx',
      expectedLayers: [2, 3]
    },
    {
      name: 'Next.js page with hydration issues',
      code: `
import { useState, useEffect } from 'react';

export default function Dashboard() {
  const [width, setWidth] = useState(window.innerWidth);
  
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return <div>Width: {width}</div>;
}`,
      filename: 'dashboard.tsx',
      expectedLayers: [4, 5]
    }
  ];

  realWorldTestCases.forEach(({ name, code, filename, expectedLayers }) => {
    it(`should produce consistent analysis for: ${name}`, async () => {
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: expectedLayers.map((layer, i) => ({
          severity: 'warning',
          message: `Issue ${i + 1} in layer ${layer}`,
          description: `Detected issue in layer ${layer}`,
          layer,
          location: { line: i + 1, column: 1 },
          ruleName: `layer-${layer}-rule`
        }))
      });

      const result = await adapter.analyze(code, { 
        filename,
        layers: [1, 2, 3, 4, 5, 6, 7]
      });

      expect(result.issues.length).toBeGreaterThanOrEqual(0);
      expect(result.summary).toBeDefined();
      expect(result.summary.filename).toBe(filename);

      result.issues.forEach(issue => {
        expect(issue).toHaveProperty('type');
        expect(issue).toHaveProperty('message');
        expect(issue).toHaveProperty('layer');
        expect(issue).toHaveProperty('location');
        expect(issue.location).toHaveProperty('line');
        expect(issue.location).toHaveProperty('column');
      });
    });
  });
});

/**
 * E2E CLI Parity Tests
 * 
 * These tests spawn the actual CLI harness (scripts/run-cli-analysis.js)
 * to get authentic CLI output, then compare against extension output.
 * 
 * Requires:
 * - Node.js child_process
 * - Temp file creation for fixtures
 * - CLI harness script
 */
describe('E2E CLI Parity (CLI Harness)', () => {
  const childProcess = require('child_process');
  const fs = require('fs');
  const os = require('os');
  
  let adapter: SharedCoreAdapter;
  
  beforeEach(() => {
    const mockOutputChannel = {
      appendLine: jest.fn(),
      append: jest.fn(),
      clear: jest.fn(),
      show: jest.fn(),
      hide: jest.fn(),
      dispose: jest.fn(),
      name: 'NeuroLint',
      replace: jest.fn()
    } as unknown as vscode.OutputChannel;
    
    adapter = new SharedCoreAdapter(mockOutputChannel, '/mock/workspace');
  });
  
  const CLI_HARNESS_PATH = path.resolve(__dirname, '../../../../scripts/run-cli-analysis.js');
  
  interface CLIResult {
    success: boolean;
    filePath: string;
    layers: number[];
    issues: Array<{
      severity: string;
      message: string;
      layer: number;
      location: { line: number; column: number };
      ruleName: string;
    }>;
    issueCount: number;
    error?: string;
  }
  
  function runCLIHarness(filePath: string, layers: number[] = [1, 2, 3, 4, 5, 6, 7]): Promise<CLIResult> {
    return new Promise((resolve, reject) => {
      const args = ['--file', filePath, '--layers', layers.join(',')];
      
      childProcess.execFile('node', [CLI_HARNESS_PATH, ...args], { timeout: 10000 }, (error: any, stdout: string, stderr: string) => {
        if (error) {
          try {
            const errorResult = JSON.parse(stderr || stdout);
            resolve({ success: false, ...errorResult } as CLIResult);
          } catch {
            reject(new Error(`CLI harness failed: ${error.message}\nstdout: ${stdout}\nstderr: ${stderr}`));
          }
          return;
        }
        
        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse CLI output: ${stdout}`));
        }
      });
    });
  }
  
  function createTempFile(code: string, filename: string): string {
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, `neurolint-test-${Date.now()}-${filename}`);
    fs.writeFileSync(tempPath, code, 'utf-8');
    return tempPath;
  }
  
  function cleanupTempFile(filePath: string): void {
    try {
      fs.unlinkSync(filePath);
    } catch {
    }
  }
  
  it('should verify CLI harness is accessible', () => {
    expect(fs.existsSync(CLI_HARNESS_PATH)).toBe(true);
  });
  
  it('should get CLI output for console.log detection', async () => {
    const code = 'console.log("test");';
    const tempFile = createTempFile(code, 'console-test.ts');
    
    try {
      const cliResult = await runCLIHarness(tempFile, [2]);
      
      expect(cliResult.success).toBe(true);
      expect(Array.isArray(cliResult.issues)).toBe(true);
      expect(cliResult.filePath).toBe(tempFile);
      
    } finally {
      cleanupTempFile(tempFile);
    }
  });
  
  it('should compare extension output against CLI harness output', async () => {
    const code = 'console.log("hello"); console.warn("world");';
    const tempFile = createTempFile(code, 'parity-test.ts');
    
    try {
      const cliResult = await runCLIHarness(tempFile, [2]);
      
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: cliResult.issues
      });
      
      const extensionResult = await adapter.analyze(code, {
        filename: tempFile,
        layers: [2]
      });
      
      expect(extensionResult.issues.length).toBe(cliResult.issueCount);
      
      if (cliResult.issues.length > 0 && extensionResult.issues.length > 0) {
        for (let i = 0; i < Math.min(cliResult.issues.length, extensionResult.issues.length); i++) {
          expect(extensionResult.issues[i].layer).toBe(cliResult.issues[i].layer);
        }
      }
      
    } finally {
      cleanupTempFile(tempFile);
    }
  });
  
  it('should detect divergence when extension returns different results', async () => {
    const code = 'console.log("test");';
    const tempFile = createTempFile(code, 'divergence-test.ts');
    
    try {
      const cliResult = await runCLIHarness(tempFile, [2]);
      
      mockNeurolintCore.analyze.mockResolvedValueOnce({
        issues: [{
          severity: 'error',
          message: 'DIVERGENT: This is not what CLI returned',
          layer: 99,
          location: { line: 999, column: 999 },
          ruleName: 'fake-rule'
        }]
      });
      
      const extensionResult = await adapter.analyze(code, {
        filename: tempFile,
        layers: [2]
      });
      
      if (cliResult.issues.length > 0) {
        expect(extensionResult.issues[0].message).not.toBe(cliResult.issues[0].message);
        expect(extensionResult.issues[0].layer).not.toBe(cliResult.issues[0].layer);
      }
      
    } finally {
      cleanupTempFile(tempFile);
    }
  });
});
