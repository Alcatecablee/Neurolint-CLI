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
    const startTime = Date.now();
    const result = execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf8',
      cwd: options.cwd || process.cwd(),
      ...options
    });
    const duration = Date.now() - startTime;
    return { stdout: result, stderr: '', exitCode: 0, duration };
  } catch (error) {
    const duration = Date.now() - (error.startTime || Date.now());
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.status || 1,
      duration
    };
  }
}

describe('Performance Tests', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-test-'));
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('Large Codebase Handling', () => {
    test('should handle 100 files within reasonable time', () => {
      for (let i = 0; i < 100; i++) {
        const file = path.join(testDir, `file${i}.js`);
        fs.writeFileSync(file, `console.log("file ${i}");\nconsole.log("test");`);
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(60000);
    }, 70000);

    test('should handle 200 files without crashing', () => {
      for (let i = 0; i < 200; i++) {
        const file = path.join(testDir, `module${i}.js`);
        fs.writeFileSync(file, `export const value${i} = ${i};\nconsole.log(${i});`);
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(120000);
    }, 130000);

    test('should handle deeply nested directory structures', () => {
      let currentPath = testDir;
      
      for (let i = 0; i < 20; i++) {
        currentPath = path.join(currentPath, `level${i}`);
        fs.mkdirSync(currentPath);
        
        for (let j = 0; j < 5; j++) {
          const file = path.join(currentPath, `file${j}.js`);
          fs.writeFileSync(file, `console.log("level ${i} file ${j}");`);
        }
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(30000);
    }, 40000);
  });

  describe('Large File Handling', () => {
    test('should handle files with 1000 lines', () => {
      const largeFile = path.join(testDir, 'large.js');
      const lines = [];
      
      for (let i = 0; i < 1000; i++) {
        lines.push(`function func${i}() { console.log(${i}); }`);
      }
      
      fs.writeFileSync(largeFile, lines.join('\n'));

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(10000);
    });

    test('should handle files with 5000 lines', () => {
      const veryLargeFile = path.join(testDir, 'very-large.js');
      const lines = [];
      
      for (let i = 0; i < 5000; i++) {
        lines.push(`const var${i} = ${i};`);
      }
      
      fs.writeFileSync(veryLargeFile, lines.join('\n'));

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(15000);
    });

    test('should handle files with long lines', () => {
      const longLineFile = path.join(testDir, 'long-lines.js');
      const longString = 'x'.repeat(10000);
      fs.writeFileSync(longLineFile, `const str = "${longString}";`);

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(5000);
    });
  });

  describe('Mixed Content Performance', () => {
    test('should handle project with mixed JS, JSX, TS, TSX files', () => {
      const extensions = ['js', 'jsx', 'ts', 'tsx'];
      
      for (let i = 0; i < 50; i++) {
        const ext = extensions[i % extensions.length];
        const file = path.join(testDir, `component${i}.${ext}`);
        fs.writeFileSync(file, `export default function Component${i}() { return null; }`);
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(30000);
    });

    test('should handle real-world project structure', () => {
      const dirs = ['src', 'src/components', 'src/utils', 'src/hooks', 'tests'];
      dirs.forEach(dir => fs.mkdirSync(path.join(testDir, dir), { recursive: true }));

      for (let i = 0; i < 30; i++) {
        fs.writeFileSync(
          path.join(testDir, 'src/components', `Component${i}.jsx`),
          `export default function Component${i}() { return <div>Test</div>; }`
        );
      }

      for (let i = 0; i < 20; i++) {
        fs.writeFileSync(
          path.join(testDir, 'src/utils', `util${i}.js`),
          `export function util${i}() { console.log(${i}); }`
        );
      }

      for (let i = 0; i < 15; i++) {
        fs.writeFileSync(
          path.join(testDir, 'src/hooks', `use${i}.js`),
          `export function use${i}() { return null; }`
        );
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
      expect(result.duration).toBeLessThan(20000);
    });
  });

  describe('Memory Efficiency', () => {
    test('should handle 300 small files without memory issues', () => {
      for (let i = 0; i < 300; i++) {
        const file = path.join(testDir, `small${i}.js`);
        fs.writeFileSync(file, `const x = ${i};`);
      }

      const result = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(result.exitCode).toBe(0);
    }, 180000);
  });

  describe('Analyze vs Fix Performance', () => {
    test('analyze should be faster than fix for same codebase', () => {
      for (let i = 0; i < 20; i++) {
        const file = path.join(testDir, `test${i}.js`);
        fs.writeFileSync(file, `console.log("test ${i}");`);
      }

      const analyzeResult = runCLI(`analyze ${testDir}`, { cwd: testDir });
      const fixResult = runCLI(`patterns fix ${testDir}`, { cwd: testDir });

      expect(analyzeResult.exitCode).toBe(0);
      expect(fixResult.exitCode).toBe(0);
      expect(analyzeResult.duration).toBeLessThanOrEqual(fixResult.duration);
    });
  });

  describe('Incremental Processing', () => {
    test('should handle incremental file additions efficiently', () => {
      for (let i = 0; i < 10; i++) {
        const file = path.join(testDir, `initial${i}.js`);
        fs.writeFileSync(file, `console.log(${i});`);
      }

      const firstRun = runCLI(`analyze ${testDir}`, { cwd: testDir });

      for (let i = 10; i < 20; i++) {
        const file = path.join(testDir, `added${i}.js`);
        fs.writeFileSync(file, `console.log(${i});`);
      }

      const secondRun = runCLI(`analyze ${testDir}`, { cwd: testDir });

      expect(firstRun.exitCode).toBe(0);
      expect(secondRun.exitCode).toBe(0);
      
      expect(secondRun.duration).toBeLessThan(firstRun.duration * 3);
    });
  });
});
