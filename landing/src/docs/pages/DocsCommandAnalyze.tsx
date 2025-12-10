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

export function DocsCommandAnalyze() {
  return (
    <DocsLayout
      title="analyze"
      description="Scan your codebase for issues and get recommendations on which layers to apply. This command never modifies files."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <CodeBlock
          language="bash"
          code={`neurolint analyze <path> [options]`}
        />

        <div className="mt-6 space-y-4">
          <CommandBlock command="neurolint analyze ./src" />
          <CommandBlock command="neurolint analyze ./src --verbose" />
          <CommandBlock command="neurolint analyze ./src/components/Button.tsx" />
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
                <td className="py-3 px-4 font-mono text-gray-300">--verbose</td>
                <td className="py-3 px-4 text-gray-400">Show detailed analysis output with file-by-file breakdown</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--format=json</td>
                <td className="py-3 px-4 text-gray-400">Output results as JSON for CI/CD integration</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--output=&lt;file&gt;</td>
                <td className="py-3 px-4 text-gray-400">Save output to a file</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">--layers=N</td>
                <td className="py-3 px-4 text-gray-400">Only analyze specific layers (comma-separated)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Detects</h2>
        
        <p className="text-gray-300 mb-4">
          The analyze command scans for issues across all 8 layers:
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L1</span>
            <span className="text-gray-300">Configuration issues (tsconfig, next.config, package.json)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L2</span>
            <span className="text-gray-300">Code patterns needing cleanup (console.log, var, HTML entities)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L3</span>
            <span className="text-gray-300">Missing React keys and accessibility issues</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L4</span>
            <span className="text-gray-300">Hydration risks (browser APIs without SSR guards)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L5</span>
            <span className="text-gray-300">Next.js optimization opportunities</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L6</span>
            <span className="text-gray-300">Missing tests and error boundaries</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L7</span>
            <span className="text-gray-300">Custom patterns from learned rules</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="text-gray-500 font-mono w-12">L8</span>
            <span className="text-gray-300">Security threats and indicators of compromise</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Output</h2>
        
        <CodeBlock
          language="text"
          code={`Analyzing ./src...

Found 61 files to analyze
Processing: src/components/UserCard.tsx
Processing: src/pages/dashboard.tsx
...

Analysis Complete
-----------------
Layer 1 (Config): 2 issues
Layer 2 (Patterns): 5 issues  
Layer 3 (React): 8 issues
Layer 4 (Hydration): 3 issues
Layer 5 (Next.js): 5 issues

Total: 23 issues found

Run 'neurolint fix ./src --dry-run' to preview fixes`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">CI/CD Integration</h2>
        
        <p className="text-gray-300 mb-4">
          Use JSON output for automated pipelines:
        </p>

        <CommandBlock command="neurolint analyze ./src --format=json --output=analysis.json" />

        <Callout type="tip" title="Exit codes">
          The analyze command returns exit code 0 if no issues found, 1 if issues detected, 
          and 2 for errors. Use this in CI/CD to fail builds on issues.
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Next Steps</h2>
        
        <p className="text-gray-300 mb-4">
          After analyzing your project:
        </p>

        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/commands/fix" className="text-white hover:text-gray-300">
                Preview fixes with dry-run
              </Link>
              {" "}- see exactly what would change
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/architecture" className="text-white hover:text-gray-300">
                Understand the layers
              </Link>
              {" "}- learn what each layer does
            </span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
