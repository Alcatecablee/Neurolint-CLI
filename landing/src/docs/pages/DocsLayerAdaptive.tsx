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

export function DocsLayerAdaptive() {
  return (
    <DocsLayout
      title="Layer 7: Adaptive"
      description="Learns project-specific patterns from previous layers and applies custom rules automatically. Adapts to your codebase style."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Analyzes transformations from Layers 1-6</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Smart pattern extraction - only learns from files with actual React hooks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Applies learned rules with 70%+ confidence scoring</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Stores rules in .neurolint/learned-rules.json</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Separates suggestions from actual changes (accurate metrics)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Debug logging via NEUROLINT_DEBUG environment variable</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Dry-run mode returns transformed code for preview</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint adaptive scan ./src" />
        <CommandBlock command="neurolint adaptive fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=7 --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Manage learned rules:</p>
        <CommandBlock command="neurolint rules --list" />
        <CommandBlock command="neurolint rules --export=team-rules.json" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How It Learns</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 7 receives transformation results from previous layers when run together 
          via the <code className="text-gray-300 bg-zinc-800 px-1 rounded">--all-layers</code> flag 
          or when Layer 7 is included in a multi-layer run:
        </p>

        <Callout type="warning" title="Important">
          Learning only occurs when Layer 7 runs in the same execution as other layers. 
          Running <code className="text-gray-300 bg-zinc-800 px-1 rounded">neurolint fix . --layers=7</code> alone 
          will only apply existing rules, not learn new patterns.
        </Callout>

        <div className="space-y-4 mt-6">
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">1</div>
            <div>
              <h3 className="font-medium text-white">Receive Results</h3>
              <p className="text-sm text-gray-400">
                Gets <code className="text-gray-300 bg-zinc-800 px-1 rounded">previousResults</code> array from fix-master.js containing layer outcomes
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">2</div>
            <div>
              <h3 className="font-medium text-white">Extract Patterns</h3>
              <p className="text-sm text-gray-400">
                Compares before/after code from successful transformations (e.g., Layer 5 adding 'use client')
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">3</div>
            <div>
              <h3 className="font-medium text-white">Score & Store</h3>
              <p className="text-sm text-gray-400">
                Assigns confidence scores (starting at 0.9) and saves to .neurolint/learned-rules.json
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">4</div>
            <div>
              <h3 className="font-medium text-white">Apply</h3>
              <p className="text-sm text-gray-400">
                Applies rules with 70%+ confidence to current and future files
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Managing Rules</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">List learned rules:</p>
            <CommandBlock command="neurolint rules --list" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Export rules for team sharing:</p>
            <CommandBlock command="neurolint rules --export=team-rules.json" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Import rules on another machine:</p>
            <CommandBlock command="neurolint rules --import=team-rules.json" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Edit rule confidence:</p>
            <CommandBlock command="neurolint rules --edit=0 --confidence=0.9" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Reset all rules:</p>
            <CommandBlock command="neurolint rules --reset" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Smart pattern extraction</h3>
            <p className="text-sm text-gray-400">Only learns from files with actual React hooks - no overly broad patterns</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Confidence scoring</h3>
            <p className="text-sm text-gray-400">Only applies rules with minimum 70% confidence threshold</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Accurate metrics</h3>
            <p className="text-sm text-gray-400">Suggestions tracked separately from actual changes - no inflated counts</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Debug logging</h3>
            <p className="text-sm text-gray-400">Verbose error logging via NEUROLINT_DEBUG environment variable</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Production-grade reliability</h3>
            <p className="text-sm text-gray-400">Backed by 41 comprehensive unit tests covering all functionality</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 7 last after all other layers. Most effective when:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Running multiple fixes to build pattern database</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Enforcing project-specific conventions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Sharing learned rules across team members</span>
          </li>
        </ul>

        <Callout type="info" title="Technical details">
          Implements RuleStore class for pattern persistence. Uses confidence scoring 
          (0-1.0) and frequency tracking. Smart pattern extraction only creates rules 
          for files with actual React hooks (hasReactHooks, hasClientImports checks). 
          Dry-run mode returns transformed code. Backed by 41 unit tests.
        </Callout>
      </section>
    </DocsLayout>
  );
}
