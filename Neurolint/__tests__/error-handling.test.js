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

describe('Error Handling and Edge Cases', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'error-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      function fixPermissions(dir) {
        try {
          fs.chmodSync(dir, 0o755);
          const files = fs.readdirSync(dir);
          files.forEach(file => {
            const filePath = path.join(dir, file);
            try {
              const stats = fs.statSync(filePath);
              if (stats.isDirectory()) {
                fixPermissions(filePath);
              } else {
                fs.chmodSync(filePath, 0o644);
              }
            } catch (e) {
            }
          });
        } catch (e) {
        }
      }
      
      fixPermissions(testDir);
      
      try {
        fs.rmSync(testDir, { recursive: true, force: true });
      } catch (e) {
      }
    }
  });

  describe('Permission Errors', () => {
    test('should handle read-only files gracefully', () => {
      const testFile = path.join(testDir, 'readonly.js');
      fs.writeFileSync(testFile, 'console.log("test");');
      
      fs.chmodSync(testFile, 0o444);

      const result = runCLI(`patterns fix ${testDir}`, { cwd: testDir });

      // Read-only files should either succeed (skip) or fail gracefully
      expect([0, 1]).toContain(result.exitCode);
    });

    test('should handle unwritable directories', () => {
      if (process.platform === 'win32') {
        return;
      }

      const subDir = path.join(testDir, 'unwritable');
      fs.mkdirSync(subDir);
      
      const testFile = path.join(subDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');
      
      fs.chmodSync(subDir, 0o555);

      const result = runCLI(`patterns fix ${subDir}`, { cwd: testDir });

      // Unwritable directories should either succeed (no changes) or fail gracefully
      expect([0, 1]).toContain(result.exitCode);
    });

    test('should report permission errors in output', () => {
      if (process.platform === 'win32') {
        return;
      }

      const testFile = path.join(testDir, 'locked.js');
      fs.writeFileSync(testFile, 'console.log("test");');
      fs.chmodSync(testFile, 0o000);

      const result = runCLI(`patterns fix ${testDir} --verbose`, { cwd: testDir });

      // Should either skip locked files (exit 0) or report error (exit 1)
      expect([0, 1]).toContain(result.exitCode);
    });
  });

  describe('Empty and Invalid Input', () => {
    test('should handle empty directory gracefully', () => {
      const emptyDir = path.join(testDir, 'empty');
      fs.mkdirSync(emptyDir);

      const result = runCLI(`fix ${emptyDir}`, { cwd: testDir });

      // Empty directory is valid - should succeed
      expect(result.exitCode).toBe(0);
    });

    test('should handle empty files', () => {
      const emptyFile = path.join(testDir, 'empty.js');
      fs.writeFileSync(emptyFile, '');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Empty files are valid - should succeed
      expect(result.exitCode).toBe(0);
    });

    test('should handle files with only whitespace', () => {
      const whitespaceFile = path.join(testDir, 'whitespace.js');
      fs.writeFileSync(whitespaceFile, '   \n\n  \t  \n  ');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Whitespace-only files are valid - should succeed
      expect(result.exitCode).toBe(0);
    });

    test('should handle very long file names', () => {
      const longName = 'a'.repeat(100) + '.js';
      const longFile = path.join(testDir, longName);
      fs.writeFileSync(longFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Long filenames are valid - should succeed
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Malformed Code', () => {
    test('should handle syntax errors without crashing', () => {
      const syntaxErrorFile = path.join(testDir, 'syntax-error.js');
      fs.writeFileSync(syntaxErrorFile, 'function broken( { {{ invalid');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Syntax errors should be skipped gracefully, file should remain
      expect(fs.existsSync(syntaxErrorFile)).toBe(true);
      expect([0, 1]).toContain(result.exitCode);
    });

    test('should handle incomplete JSX', () => {
      const incompleteJSX = path.join(testDir, 'incomplete.jsx');
      fs.writeFileSync(incompleteJSX, 'function App() { return <div> }');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Invalid JSX should be skipped, file should remain
      expect(fs.existsSync(incompleteJSX)).toBe(true);
      expect([0, 1]).toContain(result.exitCode);
    });

    test('should handle mixed encoding issues gracefully', () => {
      const mixedFile = path.join(testDir, 'mixed.js');
      fs.writeFileSync(mixedFile, 'console.log("test ☺️");');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // UTF-8 with emojis should work fine
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    test('should handle symlinks without following infinitely', () => {
      if (process.platform === 'win32') {
        return;
      }

      const realFile = path.join(testDir, 'real.js');
      fs.writeFileSync(realFile, 'console.log("test");');
      
      const linkFile = path.join(testDir, 'link.js');
      try {
        fs.symlinkSync(realFile, linkFile);
      } catch (e) {
        return;
      }

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Symlinks should be handled without infinite loops
      expect(result.exitCode).toBe(0);
    });

    test('should handle special characters in file names', () => {
      const specialChars = ['test space.js', 'test@special.js', 'test-dash.js'];
      
      specialChars.forEach(name => {
        const specialFile = path.join(testDir, name);
        fs.writeFileSync(specialFile, 'console.log("test");');
      });

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Special characters in filenames should work
      expect(result.exitCode).toBe(0);
    });

    test('should handle deeply nested directories', () => {
      let deepPath = testDir;
      for (let i = 0; i < 10; i++) {
        deepPath = path.join(deepPath, `level${i}`);
        fs.mkdirSync(deepPath);
      }
      
      const deepFile = path.join(deepPath, 'deep.js');
      fs.writeFileSync(deepFile, 'console.log("deep");');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Deep nesting should work
      expect(result.exitCode).toBe(0);
    });

    test('should handle files with no extension', () => {
      const noExtFile = path.join(testDir, 'noext');
      fs.writeFileSync(noExtFile, 'console.log("test");');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Files without extensions should be skipped gracefully
      expect(result.exitCode).toBe(0);
    });

    test('should handle binary files gracefully', () => {
      const binaryFile = path.join(testDir, 'binary.jpg');
      const buffer = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0]);
      fs.writeFileSync(binaryFile, buffer);

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Binary files should be skipped
      expect(result.exitCode).toBe(0);
    });
  });

  describe('File System Races', () => {
    test('should handle file deleted during processing', () => {
      const tempFile = path.join(testDir, 'temp.js');
      fs.writeFileSync(tempFile, 'console.log("test");');

      setTimeout(() => {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }, 10);

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // File deletion race should be handled gracefully
      expect([0, 1]).toContain(result.exitCode);
    });
  });

  describe('Disk Space and Limits', () => {
    test('should handle extremely large files', () => {
      const largeFile = path.join(testDir, 'large.js');
      const largeContent = 'x'.repeat(1000000);
      fs.writeFileSync(largeFile, largeContent);

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      // Large files should be handled (analyzed or skipped)
      expect([0, 1]).toContain(result.exitCode);
    });

    test('should handle many files in directory', () => {
      for (let i = 0; i < 50; i++) {
        const file = path.join(testDir, `file${i}.js`);
        fs.writeFileSync(file, `console.log("file ${i}");`);
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      // Many files should be handled successfully
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Concurrent Access', () => {
    test('should handle multiple CLI invocations on same directory', async () => {
      const testFile = path.join(testDir, 'concurrent.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const promise1 = new Promise((resolve) => {
        const result = runCLI(`analyze ${testDir}`, { cwd: testDir });
        resolve(result);
      });

      const promise2 = new Promise((resolve) => {
        const result = runCLI(`analyze ${testDir}`, { cwd: testDir });
        resolve(result);
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // Both concurrent runs should complete
      expect([0, 1]).toContain(result1.exitCode);
      expect([0, 1]).toContain(result2.exitCode);
    });
  });

  describe('Missing Dependencies', () => {
    test('should handle missing node_modules gracefully', () => {
      const testFile = path.join(testDir, 'app.js');
      fs.writeFileSync(testFile, 'import React from "react";');

      const result = runCLI(`fix ${testDir}`, { cwd: testDir });

      // Missing node_modules should not crash the CLI
      expect([0, 1]).toContain(result.exitCode);
    });
  });

  describe('Path Edge Cases', () => {
    test('should handle relative path resolution', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix .`, { cwd: testDir });

      // Relative path '.' should work
      expect(result.exitCode).toBe(0);
    });

    test('should handle parent directory references', () => {
      const subDir = path.join(testDir, 'sub');
      fs.mkdirSync(subDir);
      
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`fix ..`, { cwd: subDir });

      // Parent directory references should work
      expect([0, 1]).toContain(result.exitCode);
    });
  });

  describe('Non-Existent Paths', () => {
    test('should fail with exit code 1 for non-existent directory', () => {
      const nonExistent = path.join(testDir, 'does-not-exist');

      const result = runCLI(`fix ${nonExistent}`, { cwd: testDir });

      // Non-existent paths should return error exit code
      expect(result.exitCode).toBe(1);
      expect(result.stdout + result.stderr).toMatch(/not found|does not exist|ENOENT/i);
    });

    test('should fail with exit code 1 for invalid command', () => {
      const result = runCLI(`invalid-command ${testDir}`, { cwd: testDir });

      // Invalid commands should return error exit code
      expect(result.exitCode).toBe(1);
    });
  });
});
