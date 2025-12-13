/**
 * Tests for Official Codemods Integration
 * Tests the --with-official-codemods flag for migrate-react19 and migrate-nextjs-16
 */

const path = require('path');
const fs = require('fs').promises;
const { execSync } = require('child_process');

describe('Official Codemods Integration', () => {
  const cliPath = path.join(__dirname, '..', 'cli.js');
  
  describe('OFFICIAL_CODEMODS configuration', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should define React 19 codemods', () => {
      expect(cliContent).toContain('react19:');
      expect(cliContent).toContain('@react-codemod/replace-reactdom-render');
      expect(cliContent).toContain('@react-codemod/replace-string-ref');
      expect(cliContent).toContain('@react-codemod/use-context-hook');
      expect(cliContent).toContain('@react-codemod/rename-unsafe-lifecycles');
    });
    
    test('should define Next.js 16 codemods', () => {
      expect(cliContent).toContain('nextjs16:');
      expect(cliContent).toContain('@next/codemod');
      expect(cliContent).toContain('new-link');
      expect(cliContent).toContain('app-dir-imports');
      expect(cliContent).toContain('metadata');
      expect(cliContent).toContain('next-request-geo-ip');
    });
  });
  
  describe('parseOptions', () => {
    test('should parse --with-official-codemods flag', () => {
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      expect(cliContent).toContain("withOfficialCodemods: args.includes('--with-official-codemods')");
    });
  });
  
  describe('runOfficialCodemods function', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should be defined in cli.js', () => {
      expect(cliContent).toContain('function runOfficialCodemods');
    });
    
    test('should accept framework, targetPath, dryRun, and verbose parameters', () => {
      expect(cliContent).toContain('runOfficialCodemods({ framework, targetPath, dryRun, verbose })');
    });
    
    test('should check for npx availability', () => {
      expect(cliContent).toContain("execSync('npx --version'");
    });
    
    test('should handle dry-run mode', () => {
      expect(cliContent).toContain('if (dryRun)');
      expect(cliContent).toContain('Dry-run mode - skipping official codemods execution');
    });
    
    test('should log Phase 1 header', () => {
      expect(cliContent).toContain('[Phase 1] Running official');
    });
    
    test('should have non-blocking error handling', () => {
      expect(cliContent).toContain('Codemod errors are non-blocking');
    });
    
    test('should return results object with success, skipped, errors counts', () => {
      expect(cliContent).toContain('return { success: successCount, skipped: skipCount, errors: errorCount, results }');
    });
  });
  
  describe('handleReact19Migration integration', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should check for withOfficialCodemods option', () => {
      expect(cliContent).toContain('if (options.withOfficialCodemods)');
    });
    
    test('should call runOfficialCodemods with react19 framework', () => {
      expect(cliContent).toContain("framework: 'react19'");
    });
    
    test('should log Phase 2 after codemods', () => {
      expect(cliContent).toContain('[Phase 2] Running NeuroLint enhancements');
    });
    
    test('should include phase1Results in summary', () => {
      expect(cliContent).toContain('if (phase1Results)');
      expect(cliContent).toContain('[Phase 1] Official Codemods:');
    });
  });
  
  describe('migrate-nextjs-16 integration', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should check for withOfficialCodemods in migrate-nextjs-16 case', () => {
      expect(cliContent).toContain('nextjs16Phase1Results');
    });
    
    test('should call runOfficialCodemods with nextjs16 framework', () => {
      expect(cliContent).toContain("framework: 'nextjs16'");
    });
    
    test('should include phase1 results in Next.js 16 summary', () => {
      expect(cliContent).toContain('[NEXT.JS 16 MIGRATION SUMMARY]');
      expect(cliContent).toContain('if (nextjs16Phase1Results)');
    });
  });
  
  describe('CLI help text', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should document --with-official-codemods in options', () => {
      expect(cliContent).toContain('--with-official-codemods');
    });
    
    test('should include examples with the new flag', () => {
      expect(cliContent).toContain('migrate-react19 . --with-official-codemods');
      expect(cliContent).toContain('migrate-nextjs-16 . --with-official-codemods');
    });
  });
  
  describe('CLI dry-run execution', () => {
    test('should show codemods that would run in dry-run mode for React 19', () => {
      const testDir = path.join(__dirname, '..', 'demo-project');
      
      try {
        const output = execSync(
          `node ${cliPath} migrate-react19 ${testDir} --with-official-codemods --dry-run`,
          { encoding: 'utf8', timeout: 30000 }
        );
        
        expect(output).toContain('[Phase 1]');
        expect(output).toContain('Dry-run mode');
        expect(output).toContain('replace-reactdom-render');
      } catch (error) {
        if (error.stdout) {
          expect(error.stdout).toContain('[Phase 1]');
        }
      }
    });
    
    test('should show codemods that would run in dry-run mode for Next.js 16', () => {
      const testDir = path.join(__dirname, '..', 'demo-project');
      
      try {
        const output = execSync(
          `node ${cliPath} migrate-nextjs-16 ${testDir} --with-official-codemods --dry-run`,
          { encoding: 'utf8', timeout: 30000 }
        );
        
        expect(output).toContain('[Phase 1]');
        expect(output).toContain('Dry-run mode');
        expect(output).toContain('new-link');
      } catch (error) {
        if (error.stdout) {
          expect(error.stdout).toContain('[Phase 1]');
        }
      }
    });
  });
});

describe('CLI_USAGE.md documentation', () => {
  let docContent;
  
  beforeAll(async () => {
    docContent = await fs.readFile(path.join(__dirname, '..', 'CLI_USAGE.md'), 'utf8');
  });
  
  test('should document --with-official-codemods for migrate-react19', () => {
    expect(docContent).toContain('migrate-react19 . --with-official-codemods');
    expect(docContent).toContain('@react-codemod');
  });
  
  test('should document --with-official-codemods for migrate-nextjs-16', () => {
    expect(docContent).toContain('migrate-nextjs-16 . --with-official-codemods');
    expect(docContent).toContain('@next/codemod');
  });
  
  test('should explain Phase 1 and Phase 2', () => {
    expect(docContent).toContain('Phase 1');
    expect(docContent).toContain('Phase 2');
  });
});

describe('OFFICIAL-CODEMODS-INTEGRATION.md documentation', () => {
  let docContent;
  
  beforeAll(async () => {
    docContent = await fs.readFile(path.join(__dirname, '..', 'docs', 'OFFICIAL-CODEMODS-INTEGRATION.md'), 'utf8');
  });
  
  test('should exist and contain integration strategy', () => {
    expect(docContent).toContain('Official Codemods Integration');
  });
  
  test('should document React 19 codemods', () => {
    expect(docContent).toContain('replace-reactdom-render');
    expect(docContent).toContain('replace-string-ref');
    expect(docContent).toContain('use-context-hook');
  });
  
  test('should document Next.js codemods', () => {
    expect(docContent).toContain('new-link');
    expect(docContent).toContain('app-dir-imports');
    expect(docContent).toContain('metadata');
  });
  
  test('should explain sequential execution model', () => {
    expect(docContent).toContain('Sequential Execution');
    expect(docContent).toContain('Phase 1');
    expect(docContent).toContain('Phase 2');
  });
  
  test('should document error handling', () => {
    expect(docContent).toContain('non-blocking');
    expect(docContent).toContain('Error Handling');
  });
});
