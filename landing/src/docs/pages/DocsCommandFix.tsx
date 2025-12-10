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


import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";
import { Link } from "react-router-dom";

export function DocsCommandFix() {
  return (
    <DocsLayout
      title="fix"
      description="Apply automatic transformations to fix detected issues. Creates backups before modifying files."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <CodeBlock
          language="bash"
          code={`neurolint fix <path> [options]`}
        />

        <div className="mt-6 space-y-4">
          <CommandBlock command="neurolint fix ./src --all-layers --dry-run" />
          <CommandBlock command="neurolint fix ./src --all-layers --verbose" />
          <CommandBlock command="neurolint fix ./src --layers=1,2,3" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Options</h2>
        
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
                <td className="py-3 px-4 font-mono text-gray-300">--all-layers</td>
                <td className="py-3 px-4 text-gray-400">Run all 8 transformation layers</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--layers=N,M</td>
                <td className="py-3 px-4 text-gray-400">Run specific layers (comma-separated)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--dry-run</td>
                <td className="py-3 px-4 text-gray-400">Preview changes without applying them</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--verbose</td>
                <td className="py-3 px-4 text-gray-400">Show detailed output for each transformation</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--no-backup</td>
                <td className="py-3 px-4 text-gray-400">Skip backup creation (not recommended)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--backup</td>
                <td className="py-3 px-4 text-gray-400">Create backup before changes (default)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--production</td>
                <td className="py-3 px-4 text-gray-400">Use production-grade backups with enhanced logging and retention</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Safety Features</h2>
        
        <div className="grid gap-4 my-6">
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Automatic Backups</h3>
            <p className="text-sm text-gray-400">
              Every fix creates a backup with SHA-256 checksums. Restore anytime 
              with <code className="text-gray-300 bg-zinc-800 px-1 rounded">neurolint restore --interactive</code>
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Dry-Run Mode</h3>
            <p className="text-sm text-gray-400">
              Preview exactly what will change before applying. Always use 
              <code className="text-gray-300 bg-zinc-800 px-1 rounded">--dry-run</code> first.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">AST-Based Transformations</h3>
            <p className="text-sm text-gray-400">
              Code is parsed into an Abstract Syntax Tree before modification, 
              preserving structure and formatting.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Validation</h3>
            <p className="text-sm text-gray-400">
              Each transformation is validated for syntax errors before writing. 
              Invalid transformations are automatically reverted.
            </p>
          </div>
        </div>

        <Callout type="warning" title="Always preview first">
          Use <code className="text-gray-300">--dry-run</code> before applying fixes 
          to understand what will change.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Output</h2>
        
        <CodeBlock
          language="text"
          code={`Creating backup...
Backup saved to .neurolint-backups/backup-2025-12-08-143052/

Applying Layer 1 (Configuration)...
  Updated: tsconfig.json
  Updated: next.config.js

Applying Layer 2 (Patterns)...
  Fixed: src/utils/helpers.ts (removed console.log)

Applying Layer 3 (Components)...
  Fixed: src/components/List.tsx (added key prop)

Applying Layer 4 (Hydration)...
  Fixed: src/components/UserCard.tsx (SSR-safe window access)

Applying Layer 5 (Next.js)...
  Fixed: src/pages/dashboard.tsx (added 'use client')

Complete! 5 files modified
Backup available: neurolint restore --interactive`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Layer-by-Layer Approach</h2>
        
        <p className="text-gray-300 mb-4">
          For large codebases, apply one layer at a time to review each category of changes:
        </p>

        <div className="space-y-4">
          <div>
            <CommandBlock command="neurolint fix ./src --layers=1 --verbose" />
            <p className="text-gray-500 text-sm mt-1">Config fixes (tsconfig, next.config, package.json)</p>
          </div>
          <div>
            <CommandBlock command="neurolint fix ./src --layers=2 --verbose" />
            <p className="text-gray-500 text-sm mt-1">Pattern fixes (console removal, var to const)</p>
          </div>
          <div>
            <CommandBlock command="neurolint fix ./src --layers=3 --verbose" />
            <p className="text-gray-500 text-sm mt-1">React fixes (keys, alt attributes, ARIA labels)</p>
          </div>
          <div>
            <CommandBlock command="neurolint fix ./src --layers=4 --verbose" />
            <p className="text-gray-500 text-sm mt-1">Hydration fixes (SSR-safe browser API access)</p>
          </div>
        </div>

        <Callout type="info" title="Combining layers">
          You can apply multiple layers at once: <code className="text-gray-300">--layers=1,2,3</code>
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Next Steps</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/guides/backup" className="text-white hover:text-gray-300">
                Backup & Restore
              </Link>
              {" "}- learn how to restore from backups
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/architecture" className="text-white hover:text-gray-300">
                8-Layer Architecture
              </Link>
              {" "}- understand what each layer does
            </span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
