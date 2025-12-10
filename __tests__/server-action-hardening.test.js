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
 * Server Action Hardening Tests
 * Regression tests for directive detection and CLI aggregation logic
 */

const path = require('path');
const fs = require('fs').promises;

describe('ServerActionHardening Module', () => {
  let ServerActionHardening;
  
  beforeAll(() => {
    const module = require('../scripts/fix-layer-8-security/server-action-hardening');
    ServerActionHardening = module.ServerActionHardening;
  });

  describe('Directive Detection (Regression Tests)', () => {
    let hardener;
    
    beforeEach(() => {
      hardener = new ServerActionHardening({ verbose: false });
    });

    test('should detect top-level "use server" directive (stored in ast.program.directives)', async () => {
      const code = `'use server';

import { exec } from 'child_process';

export async function dangerousAction(data) {
  exec(data.command);
}`;
      
      const result = await hardener.analyze(code, 'test-server-action.ts');
      expect(result.isServerAction).toBe(true);
    });

    test('should detect top-level "use server" with double quotes', async () => {
      const code = `"use server";

export async function serverAction() {
  return { success: true };
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(true);
    });

    test('should detect "use server" after multiline comments', async () => {
      const code = `/**
 * This is a server action file
 * With multiline comments
 */

'use server';

export async function myAction() {
  return 'hello';
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(true);
    });

    test('should detect "use server" after single-line comments', async () => {
      const code = `// Server actions file
// Copyright 2025

'use server';

export async function action() {}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(true);
    });

    test('should detect inline "use server" directive in function body', async () => {
      const code = `export async function inlineServerAction(formData) {
  'use server';
  const name = formData.get('name');
  return { name };
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(true);
    });

    test('should detect inline "use server" in arrow function', async () => {
      const code = `export const arrowAction = async (data) => {
  'use server';
  return data.value * 2;
};`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(true);
    });

    test('should NOT detect "use server" in string literals (false positive)', async () => {
      const code = `const message = "This file does not use server actions";
const config = { mode: 'use server' };`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(false);
    });

    test('should NOT detect files without "use server" directive', async () => {
      const code = `export function clientComponent() {
  return <div>Hello</div>;
}`;
      
      const result = await hardener.analyze(code, 'test.tsx');
      expect(result.isServerAction).toBe(false);
    });

    test('should detect "use server" in TypeScript files with type annotations', async () => {
      const code = `'use server';

import type { FormData } from 'next/types';

export async function typedAction(formData: FormData): Promise<{ success: boolean }> {
  return { success: true };
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.isServerAction).toBe(true);
    });
  });

  describe('Dangerous Call Detection', () => {
    let hardener;
    
    beforeEach(() => {
      hardener = new ServerActionHardening({ verbose: false });
    });

    test('should detect exec() calls in server actions', async () => {
      const code = `'use server';

import { exec } from 'child_process';

export async function runCommand(cmd) {
  exec(cmd);
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.dangerousCalls.length).toBeGreaterThan(0);
      expect(result.dangerousCalls[0].function).toBe('exec');
      expect(result.dangerousCalls[0].severity).toBe('CRITICAL');
    });

    test('should detect eval() calls in server actions', async () => {
      const code = `'use server';

export async function evaluate(code) {
  return eval(code);
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.dangerousCalls.length).toBeGreaterThan(0);
      expect(result.dangerousCalls[0].function).toBe('eval');
    });

    test('should detect spawn() calls in server actions', async () => {
      const code = `'use server';

import { spawn } from 'child_process';

export async function runProcess(cmd, args) {
  spawn(cmd, args);
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.dangerousCalls.length).toBeGreaterThan(0);
      expect(result.dangerousCalls[0].function).toBe('spawn');
    });

    test('should detect new Function() constructor', async () => {
      const code = `'use server';

export async function createFunc(body) {
  return new Function('x', body);
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.dangerousCalls.length).toBeGreaterThan(0);
    });

    test('should NOT flag safe function calls', async () => {
      const code = `'use server';

export async function safeAction(data) {
  console.log(data);
  return JSON.stringify(data);
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.dangerousCalls.length).toBe(0);
    });
  });

  describe('Environment Exposure Detection', () => {
    let hardener;
    
    beforeEach(() => {
      hardener = new ServerActionHardening({ verbose: false });
    });

    test('should detect process.env exposure in return statements', async () => {
      const code = `'use server';

export async function leakEnv() {
  return process.env;
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.envExposures.length).toBeGreaterThan(0);
    });

    test('should detect process.env in object spread', async () => {
      const code = `'use server';

export async function leakEnvSpread() {
  return { ...process.env };
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.envExposures.length).toBeGreaterThan(0);
    });

    test('should NOT flag safe env access (specific keys)', async () => {
      const code = `'use server';

export async function getPublicConfig() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  return { apiUrl };
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.envExposures.length).toBe(0);
    });
  });

  describe('Unsafe Pattern Detection', () => {
    let hardener;
    
    beforeEach(() => {
      hardener = new ServerActionHardening({ verbose: false });
    });

    test('should detect child_process imports', async () => {
      const code = `'use server';

import { exec } from 'child_process';

export async function action() {}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.unsafePatterns.length).toBeGreaterThan(0);
    });

    test('should detect node:child_process imports', async () => {
      const code = `'use server';

import { execSync } from 'node:child_process';

export async function action() {}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.unsafePatterns.length).toBeGreaterThan(0);
    });
  });

  describe('Hardening Recommendations', () => {
    let hardener;
    
    beforeEach(() => {
      hardener = new ServerActionHardening({ verbose: false });
    });

    test('should generate recommendations for dangerous calls', async () => {
      const code = `'use server';

import { exec } from 'child_process';

export async function dangerousAction(cmd) {
  exec(cmd);
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.hardeningRecommendations.length).toBeGreaterThan(0);
      expect(result.hardeningRecommendations.some(r => r.priority === 'CRITICAL')).toBe(true);
    });

    test('should generate recommendations for env exposure', async () => {
      const code = `'use server';

export async function leakEnv() {
  return process.env;
}`;
      
      const result = await hardener.analyze(code, 'test.ts');
      expect(result.hardeningRecommendations.length).toBeGreaterThan(0);
      expect(result.hardeningRecommendations.some(r => r.priority === 'HIGH')).toBe(true);
    });
  });
});

describe('CLI Aggregation Logic', () => {
  /**
   * NOTE: These tests verify the aggregation PATTERN used in the CLI handler (cli.js lines 5356-5363).
   * The CLI handler is not exported as a separate module, so we test the aggregation logic directly.
   * The "CLI Integration Tests (End-to-End)" section below exercises the actual CLI handler to
   * catch regressions in the real code path.
   * 
   * The aggregation pattern being tested is:
   *   const issueCount = (result.dangerousCalls?.length || 0) + 
   *                     (result.envExposures?.length || 0) + 
   *                     (result.unsafePatterns?.length || 0);
   *   if (result.isServerAction && issueCount > 0) { ... }
   */
  describe('Issue Aggregation', () => {
    test('should correctly aggregate multiple issue types', () => {
      const result = {
        isServerAction: true,
        dangerousCalls: [
          { function: 'exec', line: 10, severity: 'CRITICAL' },
          { function: 'eval', line: 15, severity: 'CRITICAL' }
        ],
        envExposures: [
          { type: 'direct', line: 20 }
        ],
        unsafePatterns: [
          { type: 'import', source: 'child_process', line: 5 }
        ]
      };
      
      const issueCount = (result.dangerousCalls?.length || 0) + 
                        (result.envExposures?.length || 0) + 
                        (result.unsafePatterns?.length || 0);
      
      expect(issueCount).toBe(4);
      
      const issues = [
        ...(result.dangerousCalls || []), 
        ...(result.envExposures || []), 
        ...(result.unsafePatterns || [])
      ];
      
      expect(issues.length).toBe(4);
    });

    test('should handle empty arrays gracefully', () => {
      const result = {
        isServerAction: true,
        dangerousCalls: [],
        envExposures: [],
        unsafePatterns: []
      };
      
      const issueCount = (result.dangerousCalls?.length || 0) + 
                        (result.envExposures?.length || 0) + 
                        (result.unsafePatterns?.length || 0);
      
      expect(issueCount).toBe(0);
    });

    test('should handle undefined arrays gracefully', () => {
      const result = {
        isServerAction: true
      };
      
      const issueCount = (result.dangerousCalls?.length || 0) + 
                        (result.envExposures?.length || 0) + 
                        (result.unsafePatterns?.length || 0);
      
      expect(issueCount).toBe(0);
    });

    test('should correctly check isServerAction property', () => {
      const serverActionResult = { isServerAction: true, dangerousCalls: [] };
      const nonServerActionResult = { isServerAction: false, dangerousCalls: [] };
      
      expect(serverActionResult.isServerAction).toBe(true);
      expect(nonServerActionResult.isServerAction).toBe(false);
    });

    test('should NOT use deprecated hasServerActions property', () => {
      const result = {
        isServerAction: true,
        hasServerActions: undefined
      };
      
      expect(result.isServerAction).toBe(true);
      expect(result.hasServerActions).toBeUndefined();
    });
  });

  describe('Result Processing', () => {
    test('should add filePath to result when processing', () => {
      const result = {
        isServerAction: true,
        dangerousCalls: [{ function: 'exec' }],
        envExposures: [],
        unsafePatterns: []
      };
      
      const filePath = '/path/to/server-action.ts';
      result.filePath = filePath;
      
      expect(result.filePath).toBe(filePath);
    });

    test('should create combined issues array from individual arrays', () => {
      const result = {
        isServerAction: true,
        dangerousCalls: [{ function: 'exec', line: 10 }],
        envExposures: [{ type: 'direct', line: 20 }],
        unsafePatterns: []
      };
      
      result.issues = [
        ...(result.dangerousCalls || []), 
        ...(result.envExposures || []), 
        ...(result.unsafePatterns || [])
      ];
      
      expect(result.issues.length).toBe(2);
      expect(result.issues[0].function).toBe('exec');
      expect(result.issues[1].type).toBe('direct');
    });
  });
});

describe('Integration with Test Fixtures', () => {
  let ServerActionHardening;
  const fixturesPath = path.join(__dirname, 'fixtures', 'layer-8');
  
  beforeAll(() => {
    const module = require('../scripts/fix-layer-8-security/server-action-hardening');
    ServerActionHardening = module.ServerActionHardening;
  });

  test('should detect issues in rsc-vulnerable.tsx fixture', async () => {
    const hardener = new ServerActionHardening({ verbose: false });
    const code = await fs.readFile(path.join(fixturesPath, 'rsc-vulnerable.tsx'), 'utf8');
    
    const result = await hardener.analyze(code, 'rsc-vulnerable.tsx');
    
    expect(result.isServerAction).toBe(true);
    expect(result.dangerousCalls.length).toBeGreaterThan(0);
  });

  test('should detect issues in rsc-vulnerable.jsx fixture', async () => {
    const hardener = new ServerActionHardening({ verbose: false });
    const code = await fs.readFile(path.join(fixturesPath, 'rsc-vulnerable.jsx'), 'utf8');
    
    const result = await hardener.analyze(code, 'rsc-vulnerable.jsx');
    
    expect(result.isServerAction).toBe(true);
    expect(result.dangerousCalls.length).toBeGreaterThan(0);
  });

  test('should NOT flag clean-code.js fixture as server action', async () => {
    const hardener = new ServerActionHardening({ verbose: false });
    const code = await fs.readFile(path.join(fixturesPath, 'clean-code.js'), 'utf8');
    
    const result = await hardener.analyze(code, 'clean-code.js');
    
    expect(result.isServerAction).toBe(false);
  });
});

describe('CLI Integration Tests (End-to-End)', () => {
  const { execSync } = require('child_process');
  const fixturesPath = path.join(__dirname, 'fixtures', 'layer-8');
  
  test('security:harden-actions should detect vulnerable server actions in fixtures', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath}`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toContain('[WARNING]');
    expect(output).toContain('issues');
    expect(output).toContain('server action');
  });

  test('security:harden-actions should show issue count in output', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath}`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toMatch(/Found \d+ issues in \d+ server action files/);
  });

  test('security:harden-actions should detect exec() dangerous calls', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath} --verbose`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toContain('exec()');
    expect(output).toContain('dangerous function call');
  });

  test('security:harden-actions should detect eval() dangerous calls', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath} --verbose`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toContain('eval()');
  });

  test('security:harden-actions should show hardening recommendations', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath}`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toContain('Hardening Recommendations');
    expect(output).toContain('[CRITICAL]');
  });

  test('security:harden-actions --quarantine --dry-run should preview transformations', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath} --quarantine --dry-run`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toContain('[WARNING]');
    expect(output).toContain('Dry-run complete');
  });

  test('security:harden-actions on clean directory should report SECURE', () => {
    const cleanPath = path.join(__dirname, 'fixtures', 'layer-8', 'clean-code.js');
    const tempDir = path.join(__dirname, 'fixtures', 'temp-clean');
    
    try {
      require('fs').mkdirSync(tempDir, { recursive: true });
      require('fs').copyFileSync(cleanPath, path.join(tempDir, 'clean.js'));
      
      const output = execSync(
        `node cli.js security:harden-actions ${tempDir}`,
        { encoding: 'utf8', timeout: 30000 }
      );
      
      expect(output).toContain('[SECURE]');
      expect(output).toContain('No vulnerable server actions detected');
    } finally {
      require('fs').rmSync(tempDir, { recursive: true, force: true });
    }
  });

  test('security:harden-actions on non-existent path should exit with error', () => {
    expect(() => {
      execSync(
        `node cli.js security:harden-actions /nonexistent/path`,
        { encoding: 'utf8', timeout: 30000 }
      );
    }).toThrow();
  });

  test('CLI aggregation uses isServerAction (not deprecated hasServerActions)', () => {
    const output = execSync(
      `node cli.js security:harden-actions ${fixturesPath}`,
      { encoding: 'utf8', timeout: 30000 }
    );
    
    expect(output).toContain('[WARNING]');
    expect(output).toContain('Found');
    expect(output).not.toContain('hasServerActions');
  });
});
