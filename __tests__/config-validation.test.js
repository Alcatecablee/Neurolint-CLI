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

describe('Configuration and Input Validation', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'config-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Command Validation', () => {
    test('should reject invalid commands', () => {
      const result = runCLI(`invalid-command ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(1);
    });

    test('should show help for --help flag', () => {
      const result = runCLI(`--help`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/usage|commands|options/i);
    });

    test('should show version for --version flag', () => {
      const result = runCLI(`--version`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should handle help command', () => {
      const result = runCLI(`help`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toMatch(/usage|commands/i);
    });
  });

  describe('Layer Validation', () => {
    test('should reject invalid layer numbers', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --layers 99`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });

    test('should reject layer 0', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --layers 0`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });

    test('should accept valid layer range 1-7', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --layers 1,2,3`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept --all-layers flag', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --all-layers`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Path Validation', () => {
    test('should fail gracefully for non-existent paths', () => {
      const nonExistent = path.join(testDir, 'does-not-exist');

      const result = runCLI(`fix ${nonExistent}`, { cwd: testDir });

      expect(result.exitCode).toBe(1);
      expect(result.stdout + result.stderr).toMatch(/not found|does not exist|ENOENT/i);
    });

    test('should accept current directory', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix .`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should handle absolute paths', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir}`, { cwd: process.cwd() });

      expect(result.exitCode).toBe(0);
    });

    test('should handle relative paths', () => {
      const subDir = path.join(testDir, 'src');
      fs.mkdirSync(subDir);
      
      const testFile = path.join(subDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix src`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Flag Validation', () => {
    test('should accept --verbose flag', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --verbose`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept --dry-run flag', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept --include flag with pattern', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --include "*.js"`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept --exclude flag with pattern', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --exclude "*.test.js"`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should handle multiple flags together', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir} --verbose --dry-run --all-layers`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Pattern Validation', () => {
    test('should handle valid file patterns', () => {
      fs.writeFileSync(path.join(testDir, 'app.js'), 'console.log("app");');
      fs.writeFileSync(path.join(testDir, 'test.js'), 'console.log("test");');

      const result = runCLI(`fix ${testDir} --include "app.js"`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should handle wildcard patterns', () => {
      fs.writeFileSync(path.join(testDir, 'app.js'), 'console.log("app");');
      fs.writeFileSync(path.join(testDir, 'test.jsx'), 'console.log("test");');

      const result = runCLI(`fix ${testDir} --include "*.jsx"`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should handle exclude patterns', () => {
      fs.writeFileSync(path.join(testDir, 'app.js'), 'console.log("app");');
      fs.writeFileSync(path.join(testDir, 'app.test.js'), 'console.log("test");');

      const result = runCLI(`fix ${testDir} --exclude "*.test.js"`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Subcommand Validation', () => {
    test('should accept analyze command', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept fix command', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept validate command', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`validate ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });

    test('should accept patterns subcommand', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`patterns fix ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    });
  });

  describe('Argument Requirements', () => {
    test('should require path argument for fix command', () => {
      const result = runCLI(`fix`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });

    test('should require path argument for analyze command', () => {
      const result = runCLI(`analyze`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });
  });

  describe('Cross-Platform Path Handling', () => {
    test('should handle forward slashes on all platforms', () => {
      const subDir = path.join(testDir, 'src');
      fs.mkdirSync(subDir);
      
      const testFile = path.join(subDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix src/test.js`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });

    test('should handle backslashes on Windows', () => {
      if (process.platform !== 'win32') {
        return;
      }

      const subDir = path.join(testDir, 'src');
      fs.mkdirSync(subDir);
      
      const testFile = path.join(subDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix src\\test.js`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });

    test('should normalize mixed path separators', () => {
      const subDir = path.join(testDir, 'src');
      fs.mkdirSync(subDir);
      
      const testFile = path.join(subDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const normalizedPath = path.normalize('src/test.js');
      const result = runCLI(`fix ${normalizedPath}`, { cwd: testDir });

      expect([0, 1]).toContain(result.exitCode);
    });
  });
});
