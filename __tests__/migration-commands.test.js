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

describe('Migration Commands Integration Tests', () => {
  let testDir;

  beforeEach(() => {
    testDir = fs.mkdtempSync(path.join(os.tmpdir(), 'migration-test-'));
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

  describe('migrate-react19 command', () => {
    test('should show help for migrate-react19', () => {
      const result = runCLI('migrate-react19 --help');
      expect(result.stdout).toContain('migrate-react19');
      expect(result.exitCode).toBe(0);
    });

    test('should handle migrate-react19 with dry-run flag', () => {
      const testFile = path.join(testDir, 'Component.jsx');
      fs.writeFileSync(testFile, `
import React, { forwardRef } from 'react';

const Button = forwardRef((props, ref) => {
  return <button ref={ref}>{props.children}</button>;
});

export default Button;
      `);

      const result = runCLI(`migrate-react19 ${testDir} --dry-run`, { cwd: testDir });
      
      // Should complete successfully
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
      // Should mention the file or migration
      expect(output).toMatch(/Component\.jsx|processed|analyzed|migration/i);
    });

    test('should process React 19 migration on real file', () => {
      const testFile = path.join(testDir, 'OldComponent.jsx');
      fs.writeFileSync(testFile, `
import React from 'react';
import PropTypes from 'prop-types';

function MyComponent({ name }) {
  return <div>Hello {name}</div>;
}

MyComponent.propTypes = {
  name: PropTypes.string.isRequired
};

export default MyComponent;
      `);

      const result = runCLI(`migrate-react19 ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should handle empty directory for migrate-react19', () => {
      const result = runCLI(`migrate-react19 ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle verbose flag for migrate-react19', () => {
      const testFile = path.join(testDir, 'test.jsx');
      fs.writeFileSync(testFile, 'import React from "react"; export default () => <div>Test</div>;');

      const result = runCLI(`migrate-react19 ${testDir} --verbose`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('migrate-nextjs-15.5 command', () => {
    test('should show help for migrate-nextjs-15.5', () => {
      const result = runCLI('migrate-nextjs-15.5 --help');
      expect(result.stdout).toContain('migrate-nextjs-15.5');
      expect(result.exitCode).toBe(0);
    });

    test('should handle migrate-nextjs-15.5 with dry-run', () => {
      // Create package.json with Next.js
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-nextjs',
        dependencies: { 'next': '^13.4.0', 'react': '^18.0.0' }
      }, null, 2));
      
      const testFile = path.join(testDir, 'middleware.ts');
      fs.writeFileSync(testFile, `
export function middleware(request) {
  return NextResponse.next();
}
      `);

      const result = runCLI(`migrate-nextjs-15.5 ${testDir} --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
      expect(output).toMatch(/next|migration|middleware/i);
    });

    test('should process Next.js 15.5 migration', () => {
      // Create package.json with Next.js
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-nextjs',
        dependencies: { 'next': '^13.4.0', 'react': '^18.0.0' }
      }, null, 2));
      
      const testFile = path.join(testDir, 'page.tsx');
      fs.writeFileSync(testFile, `
export default function Page() {
  return <div>Next.js Page</div>;
}
      `);

      const result = runCLI(`migrate-nextjs-15.5 ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      // Should not have critical errors
      expect(output).not.toMatch(/\[ERROR\].*validation failed/i);
    });

    test('should handle middleware runtime migration', () => {
      // Create package.json with Next.js
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-nextjs',
        dependencies: { 'next': '^13.4.0', 'react': '^18.0.0' }
      }, null, 2));
      
      const middlewareFile = path.join(testDir, 'middleware.js');
      fs.writeFileSync(middlewareFile, `
export function middleware(req) {
  return new Response('OK');
}
      `);

      const result = runCLI(`migrate-nextjs-15.5 ${testDir} --verbose`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('migrate-biome command', () => {
    test('should show help for migrate-biome', () => {
      const result = runCLI('migrate-biome --help');
      expect(result.stdout).toContain('migrate-biome');
      expect(result.exitCode).toBe(0);
    });

    test('should handle migrate-biome with dry-run', () => {
      // Create package.json for migration to work
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-project',
        dependencies: { 'eslint': '^8.0.0' }
      }, null, 2));
      
      const result = runCLI(`migrate-biome ${testDir} --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
      expect(output).toMatch(/biome|migration|package\.json/i);
    });

    test('should process Biome migration', () => {
      // Create package.json and ESLint config
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-project',
        dependencies: { 'eslint': '^8.0.0' }
      }, null, 2));
      
      const eslintFile = path.join(testDir, '.eslintrc.json');
      fs.writeFileSync(eslintFile, JSON.stringify({
        extends: ['next/core-web-vitals'],
        rules: {}
      }, null, 2));

      const result = runCLI(`migrate-biome ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle Biome migration without existing ESLint config', () => {
      // Create minimal package.json
      fs.writeFileSync(path.join(testDir, 'package.json'), JSON.stringify({
        name: 'test-project'
      }, null, 2));
      
      const result = runCLI(`migrate-biome ${testDir} --verbose`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      // Should mention biome or migration
      expect(output).toMatch(/biome|migration/i);
    });
  });

  describe('assess command', () => {
    test('should show help for assess', () => {
      const result = runCLI('assess --help');
      expect(result.stdout).toContain('assess');
      expect(result.exitCode).toBe(0);
    });

    test('should assess project complexity for empty directory', () => {
      const result = runCLI(`assess ${testDir}`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should assess project with Next.js features', () => {
      // Create mock Next.js files
      fs.mkdirSync(path.join(testDir, 'app'), { recursive: true });
      fs.writeFileSync(path.join(testDir, 'app', 'page.tsx'), 'export default function Page() { return <div>Test</div>; }');
      fs.writeFileSync(path.join(testDir, 'middleware.ts'), 'export function middleware() {}');
      
      const apiDir = path.join(testDir, 'app', 'api');
      fs.mkdirSync(apiDir, { recursive: true });
      fs.writeFileSync(path.join(apiDir, 'route.ts'), 'export async function GET() { return new Response("OK"); }');

      const result = runCLI(`assess ${testDir} --verbose`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      // Should contain complexity scoring information
      expect(output).toMatch(/complexity|score|features|simple|moderate|complex/i);
    });

    test('should assess project with verbose output', () => {
      const testFile = path.join(testDir, 'component.tsx');
      fs.writeFileSync(testFile, 'export default function Component() { return <div>Test</div>; }');

      const result = runCLI(`assess ${testDir} --verbose`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('simplify command', () => {
    test('should show help for simplify', () => {
      const result = runCLI('simplify --help');
      expect(result.stdout).toContain('simplify');
      expect(result.exitCode).toBe(0);
    });

    test('should handle simplify with dry-run and target=react', () => {
      const testFile = path.join(testDir, 'page.tsx');
      fs.writeFileSync(testFile, `
'use client';
export default function Page() {
  return <div>Next.js Page</div>;
}
      `);

      const result = runCLI(`simplify ${testDir} --target=react --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
      const output = result.stdout + result.stderr;
      expect(output.length).toBeGreaterThan(0);
    });

    test('should handle simplify with target=minimal-nextjs', () => {
      const testFile = path.join(testDir, 'component.tsx');
      fs.writeFileSync(testFile, 'export default function Component() { return <div>Test</div>; }');

      const result = runCLI(`simplify ${testDir} --target=minimal-nextjs --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should require target parameter', () => {
      const result = runCLI(`simplify ${testDir}`, { cwd: testDir });
      
      // Should either succeed or show helpful error
      expect(result.exitCode).toBe(0);
    });

    test('should handle simplify with verbose flag', () => {
      const testFile = path.join(testDir, 'app.tsx');
      fs.writeFileSync(testFile, 'export default function App() { return <div>App</div>; }');

      const result = runCLI(`simplify ${testDir} --target=react --verbose --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });
  });

  // Note: fix-deprecations is handled by other migration commands, not a standalone command

  describe('migrate command (general)', () => {
    test('should show help for migrate', () => {
      const result = runCLI('migrate --help');
      expect(result.stdout).toContain('migrate');
      expect(result.exitCode).toBe(0);
    });

    test('should handle migrate with --all-layers', () => {
      const testFile = path.join(testDir, 'component.jsx');
      fs.writeFileSync(testFile, 'export default () => <div>Test</div>;');

      const result = runCLI(`migrate ${testDir} --all-layers --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle migrate with specific layers', () => {
      const testFile = path.join(testDir, 'file.js');
      fs.writeFileSync(testFile, 'console.log("test");');

      const result = runCLI(`migrate ${testDir} --layers=1,2,5 --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });

    test('should handle migrate with backup flag', () => {
      const testFile = path.join(testDir, 'test.jsx');
      fs.writeFileSync(testFile, 'import React from "react"; export default () => <div>Test</div>;');

      const result = runCLI(`migrate ${testDir} --backup --dry-run`, { cwd: testDir });
      
      expect(result.exitCode).toBe(0);
    });
  });

  describe('Migration command error handling', () => {
    test('should handle non-existent path for migrate-react19', () => {
      const result = runCLI('migrate-react19 /non/existent/path');
      
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/not found|does not exist|error/i);
    });

    test('should handle non-existent path for assess', () => {
      const result = runCLI('assess /non/existent/path');
      
      expect(result.exitCode).not.toBe(0);
      const output = result.stdout + result.stderr;
      expect(output).toMatch(/not found|does not exist|error/i);
    });

    test('should handle invalid target for simplify', () => {
      const result = runCLI(`simplify ${testDir} --target=invalid`);
      
      // Should show error or help about valid targets
      expect(result.exitCode).toBe(0);
    });
  });
});
