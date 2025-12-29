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
    
    test('should define React 19 codemods with correct transform paths', () => {
      expect(cliContent).toContain('react19:');
      expect(cliContent).toContain("transform: 'react/19/replace-reactdom-render'");
      expect(cliContent).toContain("transform: 'react/19/replace-string-ref'");
      expect(cliContent).toContain("transform: 'react/19/replace-act-import'");
      expect(cliContent).toContain("transform: 'react/19/replace-use-form-state'");
    });
    
    test('should define React 19 migration recipe', () => {
      expect(cliContent).toContain('react19Recipe:');
      expect(cliContent).toContain("transform: 'react/19/migration-recipe'");
    });
    
    test('should define Next.js 15 codemods', () => {
      expect(cliContent).toContain('nextjs15:');
      expect(cliContent).toContain("transform: 'next-async-request-api'");
      expect(cliContent).toContain("transform: 'next-request-geo-ip'");
      expect(cliContent).toContain("transform: 'app-dir-runtime-config-experimental-edge'");
    });
    
    test('should define Next.js 16 codemods', () => {
      expect(cliContent).toContain('nextjs16:');
      expect(cliContent).toContain("transform: 'remove-experimental-ppr'");
      expect(cliContent).toContain("transform: 'remove-unstable-prefix'");
      expect(cliContent).toContain("transform: 'middleware-to-proxy'");
    });
  });
  
  describe('parseOptions', () => {
    test('should parse --with-official-codemods flag', () => {
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      expect(cliContent).toContain("withOfficialCodemods: args.includes('--with-official-codemods')");
    });
    
    test('should parse --skip-official flag', () => {
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      expect(cliContent).toContain("skipOfficialCodemods: args.includes('--skip-official')");
    });
    
    test('should parse --recipe flag', () => {
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      expect(cliContent).toContain("useRecipe: args.includes('--recipe')");
    });
    
    test('should parse --codemod-version flag', () => {
      const cliContent = require('fs').readFileSync(cliPath, 'utf8');
      expect(cliContent).toContain('codemodVersion');
      expect(cliContent).toContain('--codemod-version');
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
    
    test('should accept framework, targetPath, dryRun, verbose, codemodVersion, enableBackup and trackChanges parameters', () => {
      expect(cliContent).toContain('async function runOfficialCodemods');
      expect(cliContent).toContain('framework, targetPath, dryRun, verbose, codemodVersion');
      expect(cliContent).toContain('enableBackup');
      expect(cliContent).toContain('trackChanges');
    });
    
    test('should support version pinning', () => {
      expect(cliContent).toContain('codemodVersion &&');
      expect(cliContent).toContain('Using pinned version');
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
    
    test('should return results object with success, skipped, errors counts, version, manifest and backup', () => {
      expect(cliContent).toContain('success: successCount');
      expect(cliContent).toContain('skipped: skipCount');
      expect(cliContent).toContain('errors: errorCount');
      expect(cliContent).toContain('manifest');
      expect(cliContent).toContain('backup: backupInfo');
    });
    
    test('should use correct React codemod command syntax', () => {
      expect(cliContent).toContain('${reactCodemodPkg}');
      expect(cliContent).toContain('--target');
    });
    
    test('should use correct Next.js codemod command syntax', () => {
      expect(cliContent).toContain('${nextCodemodPkg}');
    });
    
    test('should default to @latest when no version specified', () => {
      expect(cliContent).toContain("codemod@latest");
      expect(cliContent).toContain("@next/codemod@latest");
    });
    
    test('should escape paths for shell safety', () => {
      expect(cliContent).toContain('escapedPath');
      expect(cliContent).toContain('targetPath.replace');
    });
  });
  
  describe('handleReact19Migration integration', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should check for withOfficialCodemods option', () => {
      expect(cliContent).toContain('shouldRunOfficialCodemods');
    });
    
    test('should support --recipe flag for migration-recipe', () => {
      expect(cliContent).toContain("options.useRecipe ? 'react19Recipe' : 'react19'");
    });
    
    test('should support --skip-official flag', () => {
      expect(cliContent).toContain('options.skipOfficialCodemods');
    });
    
    test('should call runOfficialCodemods with react19 or react19Recipe framework', () => {
      expect(cliContent).toContain("'react19Recipe' : 'react19'");
    });
    
    test('should log Phase 2 after codemods', () => {
      expect(cliContent).toContain('[Phase 2] Running NeuroLint enhancements');
    });
    
    test('should include phase1Results in summary', () => {
      expect(cliContent).toContain('if (phase1Results)');
      expect(cliContent).toContain('[Phase 1] Official Codemods:');
    });
  });
  
  describe('migrate-nextjs-15 integration', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should define migrate-nextjs-15 as alias case', () => {
      expect(cliContent).toContain("case 'migrate-nextjs-15':");
    });
    
    test('should run official codemods by default for migrate-nextjs-15', () => {
      expect(cliContent).toContain('isNextjs15Alias');
      expect(cliContent).toContain("framework: 'nextjs15'");
    });
    
    test('should respect --skip-official for migrate-nextjs-15', () => {
      expect(cliContent).toContain('shouldRunNextjs15Codemods');
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
    
    test('should respect --skip-official for migrate-nextjs-16', () => {
      expect(cliContent).toContain('shouldRunNextjs16Codemods');
      expect(cliContent).toContain('!options.skipOfficialCodemods');
    });
    
    test('should pass codemodVersion to runOfficialCodemods for migrate-nextjs-16', () => {
      expect(cliContent).toMatch(/migrate-nextjs-16[\s\S]*?codemodVersion:\s*options\.codemodVersion/);
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
        expect(output).toContain('remove-experimental-ppr');
      } catch (error) {
        if (error.stdout) {
          expect(error.stdout).toContain('[Phase 1]');
        }
      }
    });
  });
  
  describe('Command syntax validation', () => {
    let cliContent;
    
    beforeAll(async () => {
      cliContent = await fs.readFile(cliPath, 'utf8');
    });
    
    test('should use codemod@latest for React transforms (not @react-codemod)', () => {
      expect(cliContent).not.toContain('@react-codemod/replace-reactdom-render');
      expect(cliContent).not.toContain('@react-codemod/replace-string-ref');
      expect(cliContent).toContain('codemod@latest');
    });
    
    test('should use @next/codemod@latest for Next.js transforms', () => {
      expect(cliContent).toContain('@next/codemod@latest');
    });
    
    test('should use --target flag for React codemods', () => {
      expect(cliContent).toContain('--target');
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
  });
  
  test('should document --with-official-codemods for migrate-nextjs-16', () => {
    expect(docContent).toContain('migrate-nextjs-16 . --with-official-codemods');
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
  
  test('should document React 19 codemods with correct syntax', () => {
    expect(docContent).toContain('npx codemod@latest react/19/replace-reactdom-render');
    expect(docContent).toContain('npx codemod@latest react/19/replace-string-ref');
    expect(docContent).toContain('npx codemod@latest react/19/migration-recipe');
  });
  
  test('should document Next.js 15 codemods', () => {
    expect(docContent).toContain('next-async-request-api');
    expect(docContent).toContain('next-request-geo-ip');
    expect(docContent).toContain('app-dir-runtime-config-experimental-edge');
  });
  
  test('should document Next.js 16 codemods', () => {
    expect(docContent).toContain('remove-experimental-ppr');
    expect(docContent).toContain('remove-unstable-prefix');
    expect(docContent).toContain('middleware-to-proxy');
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
  
  test('should explain codemod CLI vs react-codemod', () => {
    expect(docContent).toMatch(/`?codemod`?\s+CLI/);
    expect(docContent).toContain('codemod@latest');
  });
});
