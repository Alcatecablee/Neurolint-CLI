import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

export function DocsCliReference() {
  return (
    <DocsLayout
      title="CLI Reference"
      description="Complete reference for all NeuroLint CLI commands, options, and flags."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Global Options</h2>
        
        <p className="text-gray-300 mb-4">
          These options work with all commands:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Option</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--version, -v</td>
                <td className="py-3 px-4 text-gray-300">Display version number</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--help, -h</td>
                <td className="py-3 px-4 text-gray-300">Display help information</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--verbose</td>
                <td className="py-3 px-4 text-gray-300">Enable detailed output logging</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--dry-run</td>
                <td className="py-3 px-4 text-gray-300">Preview changes without applying them</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">analyze</h2>
        
        <p className="text-gray-300 mb-4">
          Scan a project for issues without making any modifications.
        </p>

        <CodeBlock
          language="bash"
          code={`neurolint analyze <path> [options]

Options:
  --verbose     Show detailed analysis output
  --json        Output results as JSON
  --layers=N    Only analyze specific layers`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Examples</h3>
        
        <CommandBlock command="neurolint analyze ./src" />
        <CommandBlock command="neurolint analyze ./src --verbose" />
        <CommandBlock command="neurolint analyze ./src/components --layers=3,4" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">fix</h2>
        
        <p className="text-gray-300 mb-4">
          Apply transformations to fix detected issues. Creates automatic backups.
        </p>

        <CodeBlock
          language="bash"
          code={`neurolint fix <path> [options]

Options:
  --all-layers    Run all 8 layers
  --layers=N,M    Run specific layers (comma-separated)
  --dry-run       Preview changes without applying
  --no-backup     Skip backup creation (not recommended)
  --verbose       Show detailed output`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Examples</h3>
        
        <CommandBlock command="neurolint fix ./src --all-layers --dry-run" />
        <CommandBlock command="neurolint fix ./src --layers=1,2,3 --verbose" />
        <CommandBlock command="neurolint fix ./src --all-layers" />

        <Callout type="warning" title="Always preview first">
          Use <code className="text-blue-400">--dry-run</code> before applying fixes 
          to understand what will change.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">layers</h2>
        
        <p className="text-gray-300 mb-4">
          Display information about all available transformation layers.
        </p>

        <CommandBlock 
          command="neurolint layers" 
          output={`Available Layers:
1. ConfigMaster - Modernizes TypeScript, Next.js, and package.json configs
2. PatternCleanse - Cleans code patterns (console removal, var to const)
3. ReactRepair - Adds missing keys, alt attributes, ARIA labels
4. HydraFix - Wraps browser APIs with SSR-safe checks
5. NextGuard - Adds 'use client', migrates router imports
6. TestReady - Adds error boundaries, test scaffolding
7. AdaptiveLearn - Learns and applies project-specific patterns
8. SecurityForensics - Detects IoCs and CVE vulnerabilities`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">validate</h2>
        
        <p className="text-gray-300 mb-4">
          Validate code syntax without making changes. Useful for CI/CD pipelines.
        </p>

        <CommandBlock command="neurolint validate ./src --verbose" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">stats</h2>
        
        <p className="text-gray-300 mb-4">
          Show project statistics including file counts and issue summary.
        </p>

        <CommandBlock command="neurolint stats ./src --verbose" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">check-deps</h2>
        
        <p className="text-gray-300 mb-4">
          Check React 19 dependency compatibility and suggest updates.
        </p>

        <CommandBlock command="neurolint check-deps ./your-project --verbose" />
        <CommandBlock command="neurolint check-deps ./your-project --fix --verbose" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Migration Commands</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">migrate-react19</h3>
        <p className="text-gray-400 text-sm mb-3">
          Apply React 19 breaking change fixes (ReactDOM.render to createRoot, etc.)
        </p>
        <CommandBlock command="neurolint migrate-react19 ./src --dry-run --verbose" />
        <CommandBlock command="neurolint migrate-react19 ./src --verbose" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">migrate-nextjs-16</h3>
        <p className="text-gray-400 text-sm mb-3">
          Migrate to Next.js 16 patterns (middleware, caching, params)
        </p>
        <CommandBlock command="neurolint migrate-nextjs-16 ./src --dry-run --verbose" />
        <CommandBlock command="neurolint migrate-nextjs-16 ./src --verbose" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">migrate-biome</h3>
        <p className="text-gray-400 text-sm mb-3">
          Migrate from ESLint/Prettier to Biome
        </p>
        <CommandBlock command="neurolint migrate-biome ./src --dry-run --verbose" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Security Commands</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:scan-compromise</h3>
        <p className="text-gray-400 text-sm mb-3">
          Scan for indicators of compromise (IoCs)
        </p>
        <CommandBlock command="neurolint security:scan-compromise ./src --verbose" />
        <CommandBlock command="neurolint security:scan-compromise ./src --mode=deep" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:cve-2025-55182</h3>
        <p className="text-gray-400 text-sm mb-3">
          Check and patch the critical React Server Components RCE vulnerability
        </p>
        <CommandBlock command="neurolint security:cve-2025-55182 ./your-project --dry-run" />
        <CommandBlock command="neurolint security:cve-2025-55182 ./your-project --fix" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:create-baseline</h3>
        <p className="text-gray-400 text-sm mb-3">
          Create a security baseline for future comparison
        </p>
        <CommandBlock command="neurolint security:create-baseline ./src" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:compare-baseline</h3>
        <p className="text-gray-400 text-sm mb-3">
          Compare current state against a saved baseline
        </p>
        <CommandBlock command="neurolint security:compare-baseline ./src" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Backup Commands</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">backup list</h3>
        <p className="text-gray-400 text-sm mb-3">
          List all available backups
        </p>
        <CommandBlock command="neurolint backup list" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">restore</h3>
        <p className="text-gray-400 text-sm mb-3">
          Restore files from a backup
        </p>
        <CommandBlock command="neurolint restore --interactive" />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Exit Codes</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-green-400">0</td>
                <td className="py-3 px-4 text-gray-300">Success (no issues or all fixed)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-yellow-400">1</td>
                <td className="py-3 px-4 text-gray-300">Issues found (analysis) or partial fixes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-red-400">2</td>
                <td className="py-3 px-4 text-gray-300">Error (invalid arguments, file access, etc.)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsLayout>
  );
}
