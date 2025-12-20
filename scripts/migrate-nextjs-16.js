#!/usr/bin/env node

/**
 * NeuroLint - Licensed under Apache License 2.0
 * Copyright (c) 2025 NeuroLint
 * http://www.apache.org/licenses/LICENSE-2.0
 */



/**
 * Next.js 16 Migration Script
 * 
 * Handles comprehensive migration to Next.js 16 including:
 * - middleware.ts → proxy.ts rename
 * - experimental.ppr → Cache Components migration
 * - Function export update (middleware → proxy)
 * - Async params/searchParams updates
 * - New caching APIs (updateTag, refresh, cacheLife)
 */

const fs = require('fs').promises;
const path = require('path');
const BackupManager = require('../backup-manager');
const ora = require('../simple-ora');

class NextJS16Migrator {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.dryRun = options.dryRun || false;
    this.format = options.format || 'text';
    this.changes = [];
    this.backupManager = new BackupManager({
      backupDir: '.neurolint-backups',
      maxBackups: 10,
      verbose: this.verbose
    });
    this.backupSession = [];
    this.createdFiles = [];
    this.renamedFiles = [];
  }

  log(message, level = 'info') {
    if (this.format === 'json') return;
    if (this.verbose || level === 'error' || level === 'warning') {
      const prefix = level === 'error' ? '[ERROR]' : 
                     level === 'warning' ? '[WARNING]' :
                     level === 'success' ? '[SUCCESS]' : '[INFO]';
      console.log(`${prefix} ${message}`);
    }
  }

  outputJSON(data) {
    console.log(JSON.stringify(data, null, 2));
  }

  formatError(error) {
    if (this.verbose) {
      return error.stack || error.message;
    }
    return error.message;
  }

  /**
   * Collect all files that will be modified by the migration
   */
  async collectFilesToModify(projectPath) {
    const filesToBackup = [];

    const possibleMiddlewarePaths = [
      path.join(projectPath, 'middleware.ts'),
      path.join(projectPath, 'middleware.js'),
      path.join(projectPath, 'src', 'middleware.ts'),
      path.join(projectPath, 'src', 'middleware.js')
    ];
    for (const middlewarePath of possibleMiddlewarePaths) {
      const exists = await fs.access(middlewarePath).then(() => true).catch(() => false);
      if (exists) {
        filesToBackup.push(middlewarePath);
        break;
      }
    }

    const configPaths = [
      path.join(projectPath, 'next.config.js'),
      path.join(projectPath, 'next.config.mjs'),
      path.join(projectPath, 'next.config.ts')
    ];
    for (const configPath of configPaths) {
      const exists = await fs.access(configPath).then(() => true).catch(() => false);
      if (exists) {
        filesToBackup.push(configPath);
        break;
      }
    }

    const sourceFiles = await this.findSourceFiles(projectPath);
    for (const filePath of sourceFiles) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        if (this.fileNeedsModification(content)) {
          filesToBackup.push(filePath);
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return [...new Set(filesToBackup)];
  }

  /**
   * Check if a file needs modification based on content analysis
   */
  fileNeedsModification(content) {
    const needsUseCacheDirective = this.shouldAddUseCacheDirective(content) && 
                                    !content.includes("'use cache'") && 
                                    !content.includes('"use cache"');
    const hasUnstableCache = content.includes('unstable_cache');
    const hasRevalidateTag = content.includes('revalidateTag(') && !content.includes('cacheLife');
    const hasManualInvalidation = content.includes('fetch') && 
                                   content.includes('POST') && 
                                   !content.includes('updateTag') &&
                                   content.match(/(?:mutate|invalidate|refresh).*cache/i);
    const hasSyncParams = content.match(/\(\s*{\s*params\s*(?:,\s*searchParams\s*)?\}\s*\)/);
    const hasSyncCookies = content.match(/const\s+\w+\s*=\s*cookies\(\)/) && !content.includes('await cookies()');
    const hasSyncHeaders = content.match(/const\s+\w+\s*=\s*headers\(\)/) && !content.includes('await headers()');

    return needsUseCacheDirective || hasUnstableCache || hasRevalidateTag || 
           hasManualInvalidation || hasSyncParams || hasSyncCookies || hasSyncHeaders;
  }

  /**
   * Create backups for all files that will be modified
   */
  async createBackupSession(filesToBackup) {
    this.backupSession = [];
    
    for (const filePath of filesToBackup) {
      try {
        const backupResult = await this.backupManager.createBackup(filePath, 'migrate-nextjs-16');
        if (backupResult.success) {
          this.backupSession.push({
            originalPath: filePath,
            backupPath: backupResult.backupPath,
            timestamp: backupResult.timestamp
          });
          this.log(`Backed up: ${path.relative(process.cwd(), filePath)}`, 'info');
        }
      } catch (error) {
        this.log(`Warning: Could not backup ${filePath}: ${error.message}`, 'warning');
      }
    }

    return this.backupSession;
  }

  /**
   * Restore all files from the backup session and clean up artifacts
   */
  async rollbackAll() {
    let restored = 0;
    let cleaned = 0;
    const errors = [];

    for (const createdFile of this.createdFiles) {
      try {
        await fs.unlink(createdFile);
        cleaned++;
        this.log(`Deleted created file: ${path.relative(process.cwd(), createdFile)}`, 'info');
      } catch (error) {
        if (error.code !== 'ENOENT') {
          errors.push({ file: createdFile, error: `Failed to delete: ${error.message}` });
        }
      }
    }

    for (const rename of this.renamedFiles) {
      try {
        const renamedExists = await fs.access(rename.to).then(() => true).catch(() => false);
        if (renamedExists) {
          await fs.rename(rename.to, rename.from);
          cleaned++;
          this.log(`Restored rename: ${path.relative(process.cwd(), rename.to)} → ${path.relative(process.cwd(), rename.from)}`, 'info');
        }
      } catch (error) {
        errors.push({ file: rename.from, error: `Failed to undo rename: ${error.message}` });
      }
    }

    for (const backup of this.backupSession) {
      try {
        const result = await this.backupManager.restoreFromBackup(backup.backupPath, backup.originalPath);
        if (result.success) {
          restored++;
          this.log(`Restored: ${path.relative(process.cwd(), backup.originalPath)}`, 'info');
        } else {
          errors.push({ file: backup.originalPath, error: result.error });
        }
      } catch (error) {
        errors.push({ file: backup.originalPath, error: error.message });
      }
    }

    return { 
      success: errors.length === 0, 
      restored, 
      cleaned,
      total: this.backupSession.length + this.createdFiles.length + this.renamedFiles.length,
      errors 
    };
  }

  /**
   * Main migration entry point
   */
  async migrate(projectPath = process.cwd()) {
    this.changes = [];
    this.backupSession = [];
    this.createdFiles = [];
    this.renamedFiles = [];
    
    const spinner = this.format !== 'json' ? ora('Starting Next.js 16 migration...').start() : null;

    try {
      if (this.dryRun) {
        spinner?.succeed('Running in dry-run mode - no files will be modified');
      }

      spinner?.succeed('Analyzing project...');
      const collectSpinner = this.format !== 'json' ? ora('Collecting files to modify...').start() : null;
      const filesToModify = await this.collectFilesToModify(projectPath);
      collectSpinner?.succeed(`Found ${filesToModify.length} files to process`);

      if (!this.dryRun && filesToModify.length > 0) {
        const backupSpinner = this.format !== 'json' ? ora('Creating backup session...').start() : null;
        await this.backupManager.initialize();
        await this.createBackupSession(filesToModify);
        backupSpinner?.succeed(`Created ${this.backupSession.length} backups`);
      }

      const migrateSpinner = this.format !== 'json' ? ora('Running migrations...').start() : null;
      
      await this.migrateMiddlewareToProxy(projectPath);
      await this.migratePPRToCacheComponents(projectPath);
      await this.updateNextConfig(projectPath);
      await this.migrateCachingAPIs(projectPath);
      await this.updateAsyncAPIs(projectPath);
      
      migrateSpinner?.succeed(`Migration complete! ${this.changes.length} changes made.`);

      const result = {
        success: true,
        dryRun: this.dryRun,
        changes: this.changes,
        summary: this.generateSummary(),
        backups: this.backupSession.length
      };

      if (this.format === 'json') {
        this.outputJSON(result);
      }

      return result;

    } catch (error) {
      spinner?.fail(`Migration failed: ${this.formatError(error)}`);

      const hasChangesToRollback = !this.dryRun && (this.backupSession.length > 0 || this.createdFiles.length > 0 || this.renamedFiles.length > 0);
      if (hasChangesToRollback) {
        const rollbackSpinner = this.format !== 'json' ? ora('Rolling back changes...').start() : null;
        const rollbackResult = await this.rollbackAll();
        
        if (rollbackResult.success) {
          rollbackSpinner?.succeed(`Rolled back ${rollbackResult.restored} files, cleaned ${rollbackResult.cleaned} artifacts`);
        } else {
          rollbackSpinner?.fail(`Rollback completed with errors`);
          if (rollbackResult.errors.length > 0) {
            for (const err of rollbackResult.errors) {
              this.log(`Failed to restore ${err.file}: ${err.error}`, 'error');
            }
          }
        }
      }

      const errorResult = {
        success: false,
        error: this.formatError(error),
        dryRun: this.dryRun,
        rolledBack: this.backupSession.length > 0
      };

      if (this.format === 'json') {
        this.outputJSON(errorResult);
      }

      throw error;
    }
  }

  /**
   * Migrate middleware.ts to proxy.ts
   */
  async migrateMiddlewareToProxy(projectPath) {
    this.log('Checking for middleware.ts...', 'info');
    
    const possiblePaths = [
      path.join(projectPath, 'middleware.ts'),
      path.join(projectPath, 'middleware.js'),
      path.join(projectPath, 'src', 'middleware.ts'),
      path.join(projectPath, 'src', 'middleware.js')
    ];

    for (const middlewarePath of possiblePaths) {
      try {
        const exists = await fs.access(middlewarePath).then(() => true).catch(() => false);
        if (!exists) continue;

        const content = await fs.readFile(middlewarePath, 'utf8');
        const ext = path.extname(middlewarePath);
        const dir = path.dirname(middlewarePath);
        const proxyPath = path.join(dir, `proxy${ext}`);

        let newContent = content;

        newContent = newContent.replace(
          /export\s+(async\s+)?function\s+middleware\s*\(/g,
          'export $1function proxy('
        );

        newContent = newContent.replace(
          /export\s+default\s+middleware/g,
          'export default proxy'
        );

        if (!newContent.includes('export const runtime')) {
          const runtimeDeclaration = `\n// Next.js 16 requires explicit runtime declaration\nexport const runtime = "nodejs";\n\n`;
          newContent = runtimeDeclaration + newContent;
        }

        const migrationComment = `/**\n * Migrated from middleware.ts to proxy.ts for Next.js 16\n * The proxy.ts file makes the app's network boundary explicit\n * and runs on the Node.js runtime.\n */\n\n`;
        newContent = migrationComment + newContent;

        if (!this.dryRun) {
          await fs.writeFile(proxyPath, newContent, 'utf8');
          this.createdFiles.push(proxyPath);
          this.log(`Created ${proxyPath}`, 'success');
          
          const backupPath = `${middlewarePath}.backup`;
          await fs.rename(middlewarePath, backupPath);
          this.renamedFiles.push({ from: middlewarePath, to: backupPath });
          this.log(`Backed up original to ${backupPath}`, 'info');
        }

        this.changes.push({
          type: 'middleware_to_proxy',
          from: middlewarePath,
          to: proxyPath,
          description: 'Migrated middleware.ts to proxy.ts for Next.js 16'
        });

        this.log('Successfully migrated middleware to proxy', 'success');
        return;
      } catch (error) {
        continue;
      }
    }

    this.log('No middleware.ts file found (this is OK if not using middleware)', 'info');
  }

  /**
   * Migrate experimental.ppr to Cache Components
   */
  async migratePPRToCacheComponents(projectPath) {
    this.log('Checking for experimental.ppr configuration...', 'info');
    
    const configPaths = [
      path.join(projectPath, 'next.config.js'),
      path.join(projectPath, 'next.config.mjs'),
      path.join(projectPath, 'next.config.ts')
    ];

    for (const configPath of configPaths) {
      try {
        const exists = await fs.access(configPath).then(() => true).catch(() => false);
        if (!exists) continue;

        const content = await fs.readFile(configPath, 'utf8');
        
        if (content.includes('experimental.ppr') || content.match(/experimental\s*:\s*{[^}]*ppr\s*:/)) {
          let newContent = content;

          newContent = newContent.replace(
            /experimental:\s*{\s*ppr:\s*['"]?(?:true|incremental)['"]?\s*,?\s*}/g,
            'experimental: {}'
          );

          newContent = newContent.replace(
            /ppr:\s*['"]?(?:true|incremental)['"]?\s*,?/g,
            ''
          );

          newContent = newContent.replace(
            /experimental:\s*{\s*}/g,
            ''
          );

          const cacheComponentsConfig = `
  // Next.js 16: Cache Components replace experimental.ppr
  // Use 'use cache' directive in components for explicit caching
  experimental: {
    // Cache Components are now the default caching model
    dynamicIO: true, // Enable dynamic data fetching improvements
  },`;

          if (newContent.includes('module.exports')) {
            newContent = newContent.replace(
              /(const\s+nextConfig\s*=\s*{)/,
              `$1${cacheComponentsConfig}`
            );
          } else if (newContent.includes('export default')) {
            newContent = newContent.replace(
              /(export\s+default\s+{)/,
              `$1${cacheComponentsConfig}`
            );
          }

          const migrationComment = `/**\n * Next.js 16 Migration:\n * - Removed experimental.ppr (deprecated)\n * - Cache Components are now the default\n * - Use 'use cache' directive in components for explicit caching\n * - See: https://nextjs.org/docs/app/api-reference/directives/use-cache\n */\n\n`;
          newContent = migrationComment + newContent;

          if (!this.dryRun) {
            await fs.writeFile(configPath, newContent, 'utf8');
            this.log(`Updated ${configPath}`, 'success');
          }

          this.changes.push({
            type: 'ppr_to_cache_components',
            file: configPath,
            description: 'Migrated experimental.ppr to Cache Components model'
          });

          this.log('Successfully migrated PPR to Cache Components', 'success');
          return;
        }
      } catch (error) {
        continue;
      }
    }

    this.log('No experimental.ppr configuration found', 'info');
  }

  /**
   * Update next.config for Next.js 16 compatibility
   */
  async updateNextConfig(projectPath) {
    this.log('Updating next.config for Next.js 16...', 'info');
    
    const configPaths = [
      path.join(projectPath, 'next.config.js'),
      path.join(projectPath, 'next.config.mjs'),
      path.join(projectPath, 'next.config.ts')
    ];

    for (const configPath of configPaths) {
      try {
        const exists = await fs.access(configPath).then(() => true).catch(() => false);
        if (!exists) continue;

        const content = await fs.readFile(configPath, 'utf8');
        let newContent = content;
        let modified = false;

        if (!newContent.includes('turbopackFileSystemCacheForDev') && 
            !newContent.includes('experimental')) {
          const turbopackConfig = `
  experimental: {
    // Enable Turbopack filesystem caching for faster rebuilds
    turbopackFileSystemCacheForDev: true,
  },`;
          
          newContent = newContent.replace(
            /(const\s+nextConfig\s*=\s*{)/,
            `$1${turbopackConfig}`
          );
          modified = true;
        }

        if (newContent.includes('images: {') && newContent.includes('domains:')) {
          newContent = newContent.replace(
            /domains:\s*\[.*?\],?\s*/gs,
            '// domains is deprecated in Next.js 16. Use remotePatterns instead.\n  '
          );
          modified = true;
        }

        if (modified && !this.dryRun) {
          await fs.writeFile(configPath, newContent, 'utf8');
          this.log(`Updated ${configPath} for Next.js 16 compatibility`, 'success');
          
          this.changes.push({
            type: 'config_update',
            file: configPath,
            description: 'Updated next.config for Next.js 16 compatibility'
          });
        }

        return;
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Migrate old caching APIs to new Next.js 16 APIs
   */
  async migrateCachingAPIs(projectPath) {
    this.log('Scanning for old caching API usage...', 'info');
    
    const files = await this.findSourceFiles(projectPath);
    
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        let newContent = content;
        let modified = false;

        const shouldAddUseCache = this.shouldAddUseCacheDirective(content);
        if (shouldAddUseCache && !content.includes("'use cache'") && !content.includes('"use cache"')) {
          newContent = this.addUseCacheDirective(newContent);
          modified = true;
          this.log(`Added 'use cache' directive to ${path.basename(filePath)}`, 'success');
        }

        if (content.includes('unstable_cache')) {
          newContent = newContent.replace(
            /unstable_cache\(/g,
            '/* MIGRATED: Use "use cache" directive instead */ unstable_cache('
          );
          modified = true;
        }

        if (content.includes('revalidateTag(') && !content.includes('cacheLife')) {
          const cacheLifeComment = `
// Next.js 16: Consider using cacheLife() in your cache configuration
// Example: 
//   'use cache';
//   export const revalidate = cacheLife('hours');
//   
// Then call: revalidateTag('your-tag')
`;
          if (!content.includes('Consider using cacheLife')) {
            newContent = cacheLifeComment + newContent;
            modified = true;
          }
        }

        if (content.includes('fetch') && content.includes('POST') && !content.includes('updateTag')) {
          const hasManualInvalidation = content.match(/(?:mutate|invalidate|refresh).*cache/i);
          if (hasManualInvalidation) {
            const updateTagComment = `
// Next.js 16: Consider using updateTag() for read-your-writes consistency
// import { updateTag } from 'next/cache'
// updateTag('${path.basename(filePath, path.extname(filePath))}')
`;
            if (!content.includes('Consider using updateTag')) {
              newContent = updateTagComment + newContent;
              modified = true;
            }
          }
        }

        if (modified && !this.dryRun) {
          await fs.writeFile(filePath, newContent, 'utf8');
          this.changes.push({
            type: 'caching_api_migration',
            file: filePath,
            description: 'Updated caching APIs for Next.js 16'
          });
        }
      } catch (error) {
        continue;
      }
    }

    if (this.changes.filter(c => c.type === 'caching_api_migration').length > 0) {
      this.log('Migrated caching APIs', 'success');
    }
  }

  /**
   * Check if component should have 'use cache' directive
   */
  shouldAddUseCacheDirective(content) {
    if (content.includes("'use client'") || content.includes('"use client"')) {
      return false;
    }

    const hasFetch = content.includes('await fetch') || content.includes('fetch(');
    const hasDatabase = content.match(/(?:prisma|db|database)\./i);
    const hasAsyncComponent = content.match(/export\s+(?:default\s+)?async\s+function/);
    
    return hasFetch || hasDatabase || hasAsyncComponent;
  }

  /**
   * Add 'use cache' directive to file
   */
  addUseCacheDirective(content) {
    const lines = content.split('\n');
    let insertIndex = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim().startsWith('import ') || 
          lines[i].trim().startsWith('const ') ||
          lines[i].trim().startsWith('type ') ||
          lines[i].trim() === '') {
        insertIndex = i + 1;
      } else {
        break;
      }
    }
    
    lines.splice(insertIndex, 0, '', "'use cache';", '');
    return lines.join('\n');
  }

  /**
   * Update async request APIs (params, searchParams, cookies, headers)
   */
  async updateAsyncAPIs(projectPath) {
    this.log('Updating async request APIs...', 'info');
    
    const files = await this.findSourceFiles(projectPath);
    
    for (const filePath of files) {
      try {
        const content = await fs.readFile(filePath, 'utf8');
        let newContent = content;
        let modified = false;

        if (content.match(/\(\s*{\s*params\s*(?:,\s*searchParams\s*)?\}\s*\)/)) {
          newContent = this.convertSyncParamsToAsync(newContent);
          modified = true;
          this.log(`Converted sync params to async in ${path.basename(filePath)}`, 'success');
        }

        const cookiesMatch = content.match(/const\s+(\w+)\s*=\s*cookies\(\)/g);
        const headersMatch = content.match(/const\s+(\w+)\s*=\s*headers\(\)/g);
        
        if ((cookiesMatch && !content.includes('await cookies()')) || 
            (headersMatch && !content.includes('await headers()'))) {
          
          if (cookiesMatch && !content.includes('await cookies()')) {
            newContent = newContent.replace(
              /const\s+(\w+)\s*=\s*cookies\(\)/g,
              'const $1 = await cookies()'
            );
            modified = true;
            this.log(`Added await to cookies() in ${path.basename(filePath)}`, 'success');
          }

          if (headersMatch && !content.includes('await headers()')) {
            newContent = newContent.replace(
              /const\s+(\w+)\s*=\s*headers\(\)/g,
              'const $1 = await headers()'
            );
            modified = true;
            this.log(`Added await to headers() in ${path.basename(filePath)}`, 'success');
          }

          if (!newContent.includes('cookies() and headers() are now async')) {
            const lines = newContent.split('\n');
            let insertIndex = 0;
            
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].trim().startsWith('import ') ||
                  lines[i].trim().startsWith('type ') ||
                  lines[i].trim() === '' || 
                  lines[i].trim().startsWith("'use cache'") ||
                  lines[i].trim().startsWith('"use cache"')) {
                insertIndex = i + 1;
              } else {
                break;
              }
            }
            
            lines.splice(insertIndex, 0, '', '// Next.js 16: cookies() and headers() are now async', '');
            newContent = lines.join('\n');
          }
        }

        if (modified && newContent.includes('await') && !content.match(/export\s+(?:default\s+)?async\s+function/)) {
          newContent = this.ensureFunctionIsAsync(newContent);
        }

        if (modified && !this.dryRun) {
          await fs.writeFile(filePath, newContent, 'utf8');
          this.changes.push({
            type: 'async_api_update',
            file: filePath,
            description: 'Converted params/searchParams/cookies/headers to async APIs'
          });
        }
      } catch (error) {
        continue;
      }
    }
  }

  /**
   * Convert sync params destructuring to async
   */
  convertSyncParamsToAsync(content) {
    let newContent = content;

    newContent = newContent.replace(
      /(export\s+default\s+)(function\s+(\w+))\s*\(\s*{\s*params\s*(,\s*searchParams\s*)?\}\s*\)/g,
      '$1async $2(props)'
    );

    newContent = newContent.replace(
      /const\s+{([^}]+)}\s*=\s*params(?!\.)/g,
      'const {$1} = await props.params'
    );

    newContent = newContent.replace(
      /const\s+{([^}]+)}\s*=\s*searchParams(?!\.)/g,
      'const {$1} = await props.searchParams'
    );

    if (!newContent.includes('params and searchParams are now async')) {
      const lines = newContent.split('\n');
      let insertIndex = 0;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import ') ||
            lines[i].trim().startsWith('type ') ||
            lines[i].trim() === '') {
          insertIndex = i + 1;
        } else {
          break;
        }
      }
      
      lines.splice(insertIndex, 0, '', '// Next.js 16: params and searchParams are now async', '');
      newContent = lines.join('\n');
    }

    return newContent;
  }

  /**
   * Ensure function is async
   */
  ensureFunctionIsAsync(content) {
    let newContent = content.replace(
      /export\s+default\s+function(?!\s+async)/g,
      'export default async function'
    );

    newContent = newContent.replace(
      /export\s+function\s+(?!async)/g,
      'export async function '
    );

    return newContent;
  }

  /**
   * Find all source files in the project
   */
  async findSourceFiles(projectPath) {
    const files = [];
    const extensions = ['.ts', '.tsx', '.js', '.jsx'];
    const ignoreDirs = ['node_modules', '.next', 'dist', 'build', '.git'];

    async function scan(dir) {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          
          if (entry.isDirectory()) {
            if (!ignoreDirs.includes(entry.name)) {
              await scan(fullPath);
            }
          } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            if (extensions.includes(ext)) {
              files.push(fullPath);
            }
          }
        }
      } catch (error) {
        // Skip inaccessible directories
      }
    }

    await scan(projectPath);
    return files;
  }

  /**
   * Generate migration summary
   */
  generateSummary() {
    const summary = {
      total: this.changes.length,
      byType: {}
    };

    this.changes.forEach(change => {
      summary.byType[change.type] = (summary.byType[change.type] || 0) + 1;
    });

    return summary;
  }
}

module.exports = NextJS16Migrator;
