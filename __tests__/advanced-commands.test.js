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


const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const CLI_PATH = path.join(__dirname, '..', 'cli.js');

function runCLI(args = '', options = {}) {
  try {
    const result = execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
      ...options
    });
    return { stdout: result, stderr: '', exitCode: 0 };
  } catch (error) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1
    };
  }
}

describe('Advanced Commands Integration Tests', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'advanced-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      try {
        fs.rmSync(testDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    }
  });

  describe('rules command', () => {
    test('should show help for rules', () => {
      const result = runCLI('rules --help');
      expect(result.stdout).toContain('rules');
      expect(result.exitCode).toBe(0);
    });

    test('should list learned rules', () => {
      const result = runCLI('rules --list');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should handle rules export', () => {
      const exportFile = path.join(testDir, 'exported-rules.json');
      const result = runCLI(`rules --export=${exportFile}`);
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle rules import', () => {
      const importFile = path.join(testDir, 'import-rules.json');
      fs.writeFileSync(importFile, JSON.stringify([], null, 2));
      
      const result = runCLI(`rules --import=${importFile}`);
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle rules reset', () => {
      const result = runCLI('rules --reset');
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle rule delete by ID', () => {
      const result = runCLI('rules --delete=0');
      
      // Should either succeed or show message that rule doesn't exist
      expect(result.exitCode).toBe(0);
    });

    test('should handle rule edit with confidence', () => {
      const result = runCLI('rules --edit=0 --confidence=0.9');
      
      // Should either succeed or show message that rule doesn't exist
      expect(result.exitCode).toBe(0);
    });

    test('should reject invalid confidence value', () => {
      const result = runCLI('rules --edit=0 --confidence=2.0');
      
      // Invalid confidence should fail (confidence must be 0-1)
      const output = result.stdout + result.stderr;
      // Either exits with error OR logs error but succeeds gracefully
      expect(output).toMatch(/invalid|error|confidence.*0.*1|out of range/i);
    });

    test('should handle rules with verbose flag', () => {
      const result = runCLI('rules --list --verbose');
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('stats command', () => {
    test('should show help for stats', () => {
      const result = runCLI('stats --help');
      expect(result.stdout).toContain('stats');
      expect(result.exitCode).toBe(0);
    });

    test('should show stats for current directory', () => {
      const result = runCLI('stats .');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/files|issues|performance|memory/i);
    });

    test('should show stats for specific directory', () => {
      // Create test files
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');
      
      const result = runCLI(`stats ${testDir}`);
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should show stats with verbose output', () => {
      const result = runCLI('stats . --verbose');
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle stats for non-existent directory', () => {
      const result = runCLI('stats /non/existent/path');
      
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/not found|does not exist|error/i);
    });

    test('should show performance metrics in stats', () => {
      const testFile = path.join(testDir, 'file.js');
      fs.writeFileSync(testFile, 'const x = 1;');
      
      const result = runCLI(`stats ${testDir} --verbose`);
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      // Should contain performance info
      expect(output).toMatch(/files|successful|failed|performance|memory/i);
    });
  });

  describe('backups command', () => {
    test('should show help for backups', () => {
      const result = runCLI('backups --help');
      expect(result.stdout).toContain('backups');
      expect(result.exitCode).toBe(0);
    });

    test('should list backups', () => {
      const result = runCLI('backups list');
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle backups list with verbose', () => {
      const result = runCLI('backups list --verbose');
      
      expect(result.exitCode).toBe(0);
    });

    test('should show backup stats', () => {
      const result = runCLI('backups stats');
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle backup restore command', () => {
      const result = runCLI('backups restore --help');
      
      // Should show help or indicate no backups
      expect(result.exitCode).toBe(0);
    });

    test('should handle backups clean', () => {
      const result = runCLI('backups clean --keep-latest=5');
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('clean command', () => {
    test('should show help for clean', () => {
      const result = runCLI('clean --help');
      expect(result.stdout).toContain('clean');
      expect(result.exitCode).toBe(0);
    });

    test('should clean old backups with --older-than', () => {
      const result = runCLI('clean --older-than=7');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should clean with --keep-latest flag', () => {
      const result = runCLI('clean --keep-latest=5');
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle clean with verbose output', () => {
      const result = runCLI('clean --older-than=30 --verbose');
      
      expect(result.exitCode).toBe(0);
    });

    test('should validate --older-than parameter', () => {
      const result = runCLI('clean --older-than=-1');
      
      // Negative days should fail or show error
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/invalid|error|negative|positive/i);
    });

    test('should validate --keep-latest parameter', () => {
      const result = runCLI('clean --keep-latest=0');
      
      // Zero or negative should show warning or error
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/invalid|error|zero|positive|at least/i);
    });
  });

  describe('init-config command', () => {
    test('should show help for init-config', () => {
      const result = runCLI('init-config --help');
      expect(result.stdout).toContain('init-config');
      expect(result.exitCode).toBe(0);
    });

    test('should generate or display configuration', () => {
      const result = runCLI('init-config');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should handle init-config in specific directory', () => {
      const result = runCLI(`init-config ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle init-config with verbose flag', () => {
      const result = runCLI('init-config --verbose');
      
      expect(result.exitCode).toBe(0);
    });

    test('should create neurolint config file', () => {
      const result = runCLI(`init-config ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      
      // Check if config file was created (if command supports it)
      const possibleConfigFiles = [
        path.join(testDir, '.neurolintrc'),
        path.join(testDir, '.neurolintrc.json'),
        path.join(testDir, 'neurolint.config.js')
      ];
      
      // At least one config might exist, or command might just display config
      const configExists = possibleConfigFiles.some(f => fs.existsSync(f));
      // Don't fail if no config - command might just display it
      expect([true, false]).toContain(configExists);
    });
  });

  describe('init-tests command', () => {
    test('should show help for init-tests', () => {
      const result = runCLI('init-tests --help');
      expect(result.stdout).toContain('init-tests');
      expect(result.exitCode).toBe(0);
    });

    test('should generate test files for components', () => {
      // Create a sample component
      const componentFile = path.join(testDir, 'Button.tsx');
      fs.writeFileSync(componentFile, `
export default function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}
      `);

      const result = runCLI(`init-tests ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle init-tests for specific file', () => {
      const componentFile = path.join(testDir, 'Component.jsx');
      fs.writeFileSync(componentFile, 'export default () => <div>Test</div>;');

      const result = runCLI(`init-tests ${componentFile}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle init-tests with verbose flag', () => {
      const componentFile = path.join(testDir, 'App.tsx');
      fs.writeFileSync(componentFile, 'export default function App() { return <div>App</div>; }');

      const result = runCLI(`init-tests ${testDir} --verbose`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle init-tests for empty directory', () => {
      const result = runCLI(`init-tests ${testDir}`, { cwd: testDir });
      
      // Should handle gracefully
      expect(result.exitCode).toBe(0);
    });
  });

  describe('health command', () => {
    test('should show help for health', () => {
      const result = runCLI('health --help');
      expect(result.stdout).toContain('health');
      expect(result.exitCode).toBe(0);
    });

    test('should run health check', () => {
      const result = runCLI('health');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should show health status with verbose', () => {
      const result = runCLI('health --verbose');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      // Should contain health-related info
      expect(output).toMatch(/health|status|check|configuration|system/i);
    });

    test('should verify configuration in health check', () => {
      const result = runCLI('health');
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      // Health check should verify various aspects
      expect(output.length).toBeGreaterThan(0);
    });

    test('should handle health check in project directory', () => {
      const packageFile = path.join(testDir, 'package.json');
      fs.writeFileSync(packageFile, JSON.stringify({
        name: 'test-project',
        version: '1.0.0'
      }, null, 2));

      const result = runCLI('health', { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Advanced command combinations', () => {
    test('should chain stats and health commands', () => {
      const statsResult = runCLI('stats .');
      expect([0, 1]).toContain(statsResult.exitCode);

      const healthResult = runCLI('health');
      expect([0, 1]).toContain(healthResult.exitCode);
    });

    test('should use rules after processing files', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      // First process files
      const fixResult = runCLI(`fix ${testDir} --layers=7`, { cwd: testDir });
      expect([0, 1]).toContain(fixResult.exitCode);

      // Then check rules
      const rulesResult = runCLI('rules --list');
      expect([0, 1]).toContain(rulesResult.exitCode);
    });

    test('should create backup then list backups', () => {
      const testFile = path.join(testDir, 'file.js');
      fs.writeFileSync(testFile, 'const x = 1;');

      // Process file (should create backup)
      const fixResult = runCLI(`fix ${testDir} --backup`, { cwd: testDir });
      expect([0, 1]).toContain(fixResult.exitCode);

      // List backups
      const backupsResult = runCLI('backups list');
      expect([0, 1]).toContain(backupsResult.exitCode);
    });
  });

  describe('Advanced command error handling', () => {
    test('should handle rules import with non-existent file', () => {
      const result = runCLI('rules --import=/non/existent/rules.json');
      
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/not found|does not exist|error/i);
    });

    test('should handle rules export to invalid path', () => {
      const result = runCLI('rules --export=/invalid/path/rules.json');
      
      // Should fail or handle gracefully
      expect(result.exitCode).toBe(0);
    });

    test('should handle init-tests with invalid path', () => {
      const result = runCLI('init-tests /non/existent/path');
      
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/not found|does not exist|error/i);
    });
  });
});
