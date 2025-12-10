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
import { DocsLayout, CommandBlock, Callout, CodeBlock, BeforeAfter } from "../components";
import { Link } from "react-router-dom";

export function DocsQuickstart() {
  return (
    <DocsLayout
      title="Quick Start"
      description="Get up and running with NeuroLint in under 5 minutes. Learn the core workflow: analyze, preview, and fix."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">The Basic Workflow</h2>
        
        <p className="text-gray-300 mb-6">
          NeuroLint follows a safe, progressive workflow: analyze first, preview changes, 
          then apply fixes. This ensures you always know what will change before it happens.
        </p>

        <div className="flex items-center gap-3 mb-8 text-sm">
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-400 font-mono">1</span>
            <span className="text-gray-300">Analyze</span>
          </div>
          <span className="text-gray-600">-</span>
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-400 font-mono">2</span>
            <span className="text-gray-300">Preview</span>
          </div>
          <span className="text-gray-600">-</span>
          <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg">
            <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-400 font-mono">3</span>
            <span className="text-gray-300">Fix</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Step 1: Analyze Your Project</h2>
        
        <p className="text-gray-300 mb-4">
          Start by analyzing your project to see what issues NeuroLint detects. 
          This is a read-only operation that makes no changes:
        </p>

        <CommandBlock command="neurolint analyze ./your-project --verbose" />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          Example output:
        </p>

        <CodeBlock
          language="text"
          code={`Analyzing ./your-project...

Found 23 files to analyze
Processing: src/components/UserCard.tsx
Processing: src/pages/dashboard.tsx
...

Analysis Complete
-----------------
Layer 1 (Configuration): 2 issues
Layer 2 (Patterns): 5 issues  
Layer 3 (Components): 8 issues
Layer 4 (Hydration): 3 issues
Layer 5 (Next.js): 5 issues

Total: 23 issues found
Run 'neurolint fix ./your-project --dry-run' to preview fixes`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Step 2: Preview Fixes (Dry Run)</h2>
        
        <p className="text-gray-300 mb-4">
          Before making any changes, preview what will be fixed using the 
          <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded text-sm mx-1">--dry-run</code> 
          flag:
        </p>

        <CommandBlock command="neurolint fix ./your-project --all-layers --dry-run --verbose" />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          This shows exactly what would change without modifying any files:
        </p>

        <CodeBlock
          language="text"
          code={`[DRY RUN] Preview of changes...

src/components/UserCard.tsx
  Line 12: Would wrap 'window.innerWidth' with SSR check
  Line 45: Would add key prop to mapped element

src/pages/dashboard.tsx
  Line 8: Would add 'use client' directive
  Line 23: Would migrate 'next/router' to 'next/navigation'

Total: 4 files would be modified
Run without --dry-run to apply changes`}
        />

        <Callout type="tip" title="Preview specific layers">
          You can preview just one layer at a time to understand each transformation:
          <code className="block mt-2 text-blue-400">neurolint fix ./your-project --layers=4 --dry-run</code>
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Step 3: Apply Fixes</h2>
        
        <p className="text-gray-300 mb-4">
          Once you're satisfied with the preview, apply the fixes. NeuroLint 
          automatically creates backups before modifying any files:
        </p>

        <CommandBlock command="neurolint fix ./your-project --all-layers --verbose" />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          Output:
        </p>

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
        <h2 className="text-2xl font-bold text-white mb-4">Restoring from Backup</h2>
        
        <p className="text-gray-300 mb-4">
          If something goes wrong, restore your files from the automatic backup:
        </p>

        <CommandBlock command="neurolint restore --interactive" />

        <p className="text-gray-400 text-sm mt-4">
          This shows all available backups and lets you restore any or all files 
          to their previous state.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Layer-by-Layer Approach</h2>
        
        <p className="text-gray-300 mb-4">
          For more control, apply one layer at a time. This is recommended for 
          large codebases or when you want to review each type of change. You can use either 
          layer-specific commands or the generic <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">--layers=N</code> flag:
        </p>

        <div className="space-y-2">
          <CommandBlock command="neurolint config fix ./your-project" />
          <p className="text-gray-500 text-sm">Or: <code className="text-gray-400">neurolint fix ./your-project --layers=1</code> - Configuration fixes (tsconfig, next.config, package.json)</p>
        </div>

        <div className="space-y-2 mt-4">
          <CommandBlock command="neurolint patterns fix ./your-project" />
          <p className="text-gray-500 text-sm">Or: <code className="text-gray-400">neurolint fix ./your-project --layers=2</code> - Pattern fixes (console removal, var to const)</p>
        </div>

        <div className="space-y-2 mt-4">
          <CommandBlock command="neurolint components fix ./your-project" />
          <p className="text-gray-500 text-sm">Or: <code className="text-gray-400">neurolint fix ./your-project --layers=3</code> - Component fixes (keys, alt attributes, ARIA labels)</p>
        </div>

        <div className="space-y-2 mt-4">
          <CommandBlock command="neurolint hydration fix ./your-project" />
          <p className="text-gray-500 text-sm">Or: <code className="text-gray-400">neurolint fix ./your-project --layers=4</code> - Hydration fixes (SSR-safe browser API access)</p>
        </div>

        <Callout type="info" title="Multiple layers">
          You can apply multiple layers at once with the generic format: 
          <code className="text-blue-400 ml-1">--layers=1,2,3</code>
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">What's Next</h2>
        
        <p className="text-gray-300 mb-4">
          Now that you understand the basic workflow, explore:
        </p>

        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/architecture" className="text-blue-400 hover:text-blue-300">
                The 8-Layer Architecture
              </Link>
              {" "}- understand what each layer does
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/cli-reference" className="text-blue-400 hover:text-blue-300">
                CLI Reference
              </Link>
              {" "}- all available commands and options
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/layers/security" className="text-blue-400 hover:text-blue-300">
                Layer 8: Security Forensics
              </Link>
              {" "}- detect compromises and vulnerabilities
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/guides/ci-cd" className="text-blue-400 hover:text-blue-300">
                CI/CD Integration
              </Link>
              {" "}- automate NeuroLint in your pipeline
            </span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
