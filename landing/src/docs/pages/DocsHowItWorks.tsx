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
import { DocsLayout, CodeBlock, Callout } from "../components";
import { Link } from "react-router-dom";

export function DocsHowItWorks() {
  return (
    <DocsLayout
      title="How It Works"
      description="NeuroLint uses Abstract Syntax Tree (AST) parsing to understand and transform your code with 100% reliability. No AI, no guesswork."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Deterministic Transformations</h2>
        
        <p className="text-gray-300 mb-6">
          Unlike AI-powered tools that can produce inconsistent results, NeuroLint applies 
          deterministic transformations. The same input always produces the same output.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Rule-Based</h3>
            <p className="text-sm text-gray-400">
              Every transformation follows predefined rules that have been tested 
              against thousands of code patterns.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Predictable</h3>
            <p className="text-sm text-gray-400">
              Run the same command twice, get the same result. No randomness, 
              no temperature settings, no surprises.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Safe</h3>
            <p className="text-sm text-gray-400">
              Automatic backups before every change. Validation after every 
              transformation. Your code is never left in a broken state.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Auditable</h3>
            <p className="text-sm text-gray-400">
              Every change is logged with before/after state. Review exactly 
              what was modified and why.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">The Transformation Pipeline</h2>
        
        <p className="text-gray-300 mb-6">
          Each file goes through a 5-step transformation pipeline:
        </p>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-lg text-white">1</div>
            <div>
              <h3 className="font-medium text-white">Parse</h3>
              <p className="text-sm text-gray-400">
                Code is parsed into an Abstract Syntax Tree (AST) using Babel. This creates 
                a structured representation of your code that can be safely modified.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-lg text-white">2</div>
            <div>
              <h3 className="font-medium text-white">Transform</h3>
              <p className="text-sm text-gray-400">
                Layer-specific rules traverse the AST and modify nodes. Each layer has 
                specialized visitors that handle different types of issues.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-lg text-white">3</div>
            <div>
              <h3 className="font-medium text-white">Validate</h3>
              <p className="text-sm text-gray-400">
                Changed code is re-parsed to verify syntax correctness. If validation fails, 
                the transformation is reverted.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-lg text-white">4</div>
            <div>
              <h3 className="font-medium text-white">Backup</h3>
              <p className="text-sm text-gray-400">
                Original file is backed up with SHA-256 checksum for integrity verification. 
                Backups are stored in .neurolint-backups/ with timestamps.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-lg text-white">5</div>
            <div>
              <h3 className="font-medium text-white">Apply</h3>
              <p className="text-sm text-gray-400">
                Modified code is written to disk. A detailed log is generated showing 
                exactly what changed and which rules were applied.
              </p>
            </div>
          </div>
        </div>

        <Callout type="info" title="Three-Step Safety Pattern">
          <p className="mb-2">Every transformation follows this safety pattern:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li><strong>AST First</strong> - Attempts Babel-based AST transformation</li>
            <li><strong>Regex Fallback</strong> - If AST fails or makes no changes, tries regex patterns</li>
            <li><strong>Validate & Revert</strong> - Validates syntax, reverts if invalid</li>
          </ol>
          <p className="mt-2 text-xs">You'll see logs like: <code>"[INFO] AST-based transformations: 2 changes (validated)"</code> or <code>"[ERROR] Regex fallback produced invalid syntax - REJECTING changes"</code></p>
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">AST vs Regex</h2>
        
        <p className="text-gray-300 mb-6">
          NeuroLint primarily uses AST parsing instead of regex find-and-replace. 
          This is safer because it understands code semantics:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Approach</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Pros</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Cons</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-medium text-white">AST Parsing</td>
                <td className="py-3 px-4 text-gray-400">Understands code structure, handles edge cases, preserves formatting</td>
                <td className="py-3 px-4 text-gray-400">Slightly slower, requires valid syntax</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-medium text-white">Regex Replace</td>
                <td className="py-3 px-4 text-gray-400">Fast, works on any text</td>
                <td className="py-3 px-4 text-gray-400">Can break code, misses context, false positives</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-400 text-sm mt-4">
          NeuroLint always attempts AST first for accuracy, then falls back to regex 
          if AST makes no changes. Both results are syntax-validated before applying.
          If validation fails, changes are automatically rejected to protect your code.
        </p>
        
        <CodeBlock
          language="text"
          code={`[INFO] AST-based pattern transformations: 2 changes (validated)
[SUCCESS] Layer 2 identified 2 pattern fixes (dry-run)
[WARNING] AST transformation produced invalid syntax - reverted to original
[INFO] Attempting regex fallback for pattern transformations
[INFO] Regex fallback succeeded with 2 changes (validated)
[ERROR] Regex fallback produced invalid syntax - REJECTING changes`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Layer Execution Order</h2>
        
        <p className="text-gray-300 mb-4">
          Layers run in order from 1 to 8. This order matters because earlier layers 
          prepare the codebase for later transformations:
        </p>

        <CodeBlock
          language="text"
          code={`Layer 1 (Config)     → Fixes build configs first
Layer 2 (Patterns)   → Cleans code patterns
Layer 3 (Components) → Improves React components
Layer 4 (Hydration)  → Adds SSR guards
Layer 5 (Next.js)    → App Router optimizations
Layer 6 (Testing)    → Test infrastructure
Layer 7 (Adaptive)   → Applies & learns rules (when run with other layers)
Layer 8 (Security)   → Scans for threats (read-only by default)`}
        />

        <p className="text-gray-400 text-sm mt-4">
          For example, Layer 1 must fix tsconfig.json before Layer 5 can properly 
          detect Next.js version and apply appropriate migrations.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Next Steps</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/ast-transformations" className="text-white hover:text-gray-300">
                AST Transformations
              </Link>
              {" "}- deep dive into how transformations work
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>
              <Link to="/docs/architecture" className="text-white hover:text-gray-300">
                8-Layer Architecture
              </Link>
              {" "}- understand each layer in detail
            </span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
