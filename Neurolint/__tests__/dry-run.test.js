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
const crypto = require('crypto');

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

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getDirectoryState(dir) {
  const state = {};
  
  function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    entries.forEach(entry => {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = path.relative(dir, fullPath);
      
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.isFile()) {
        state[relativePath] = {
          hash: getFileHash(fullPath),
          size: fs.statSync(fullPath).size,
          mode: fs.statSync(fullPath).mode
        };
      }
    });
  }
  
  scan(dir);
  return state;
}

describe('Dry-Run Mode Verification', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'dryrun-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('File Mutation Prevention', () => {
    test('should not modify any files with --dry-run flag', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("hello");\nconsole.log("world");');

      const beforeState = getDirectoryState(testDir);
      const beforeHash = getFileHash(testFile);

      const result = runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      const afterState = getDirectoryState(testDir);
      const afterHash = getFileHash(testFile);

      expect(result.exitCode).toBe(0);
      expect(afterHash).toBe(beforeHash);
      expect(JSON.stringify(afterState)).toBe(JSON.stringify(beforeState));
    });

    test('should not create backup files with --dry-run', () => {
      const testFile = path.join(testDir, 'app.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const filesBefore = fs.readdirSync(testDir);

      runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      const filesAfter = fs.readdirSync(testDir);

      expect(filesAfter).toEqual(filesBefore);
      
      const backupFiles = filesAfter.filter(f => f.includes('backup') || f.includes('.bak'));
      expect(backupFiles).toHaveLength(0);
    });

    test('should not create .neurolint directories with --dry-run', () => {
      const testFile = path.join(testDir, 'code.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      const neurolintDir = path.join(testDir, '.neurolint');
      const neurolintBackupDir = path.join(testDir, '.neurolint-backups');

      expect(fs.existsSync(neurolintDir)).toBe(false);
      expect(fs.existsSync(neurolintBackupDir)).toBe(false);
    });

    test('should not modify multiple files with --dry-run', () => {
      const files = ['app.js', 'utils.js', 'config.js'];
      const hashes = {};

      files.forEach(file => {
        const filePath = path.join(testDir, file);
        fs.writeFileSync(filePath, `console.log("${file}");\nconsole.log("test");`);
        hashes[file] = getFileHash(filePath);
      });

      runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      files.forEach(file => {
        const filePath = path.join(testDir, file);
        const afterHash = getFileHash(filePath);
        expect(afterHash).toBe(hashes[file]);
      });
    });
  });

  describe('Dry-Run vs Normal Mode Comparison', () => {
    test('should show same issues in dry-run as normal mode (without fixing)', () => {
      const testContent = 'console.log("test");\nconsole.log("debug");';
      
      const dryRunDir = path.join(testDir, 'dryrun');
      const normalDir = path.join(testDir, 'normal');
      fs.mkdirSync(dryRunDir);
      fs.mkdirSync(normalDir);

      fs.writeFileSync(path.join(dryRunDir, 'test.js'), testContent);
      fs.writeFileSync(path.join(normalDir, 'test.js'), testContent);

      const dryRunResult = runCLI(`analyze ${dryRunDir} --dry-run`, { cwd: testDir });
      const normalResult = runCLI(`analyze ${normalDir}`, { cwd: testDir });

      expect(dryRunResult.exitCode).toBe(normalResult.exitCode);
    });

    test('should report what would be fixed without actually fixing', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const beforeHash = getFileHash(testFile);

      const result = runCLI(`patterns fix ${testDir} --dry-run --verbose`, { cwd: testDir });

      const afterHash = getFileHash(testFile);

      expect(afterHash).toBe(beforeHash);
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Nested Directories', () => {
    test('should not modify files in nested directories with --dry-run', () => {
      const subDir = path.join(testDir, 'src');
      const nestedDir = path.join(subDir, 'components');
      fs.mkdirSync(subDir);
      fs.mkdirSync(nestedDir);

      const files = [
        path.join(testDir, 'root.js'),
        path.join(subDir, 'app.js'),
        path.join(nestedDir, 'button.jsx')
      ];

      const hashes = {};
      files.forEach(file => {
        fs.writeFileSync(file, 'console.log("test");');
        hashes[file] = getFileHash(file);
      });

      runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      files.forEach(file => {
        const afterHash = getFileHash(file);
        expect(afterHash).toBe(hashes[file]);
      });
    });
  });

  describe('File Permissions', () => {
    test('should not modify file permissions with --dry-run', () => {
      const testFile = path.join(testDir, 'test.js');
      fs.writeFileSync(testFile, 'console.log("test");');
      fs.chmodSync(testFile, 0o644);

      const beforeMode = fs.statSync(testFile).mode;

      runCLI(`fix ${testDir} --dry-run`, { cwd: testDir });

      const afterMode = fs.statSync(testFile).mode;

      expect(afterMode).toBe(beforeMode);
    });
  });

  describe('Edge Cases', () => {
    test('should handle --dry-run with all layers flag', () => {
      const testFile = path.join(testDir, 'app.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const beforeHash = getFileHash(testFile);

      const result = runCLI(`fix ${testDir} --dry-run --all-layers`, { cwd: testDir });

      const afterHash = getFileHash(testFile);

      expect(result.exitCode).toBe(0);
      expect(afterHash).toBe(beforeHash);
    });

    test('should handle --dry-run with specific layers', () => {
      const testFile = path.join(testDir, 'component.jsx');
      fs.writeFileSync(testFile, 'export default function App() { return <div>test</div>; }');

      const beforeHash = getFileHash(testFile);

      runCLI(`fix ${testDir} --dry-run --layers 1,2,3`, { cwd: testDir });

      const afterHash = getFileHash(testFile);

      expect(afterHash).toBe(beforeHash);
    });
  });
});
