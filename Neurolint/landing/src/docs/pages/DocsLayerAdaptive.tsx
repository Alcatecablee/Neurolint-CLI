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
      description="Learns project-specific patterns from previous layers and applies custom rules automatically. Features cross-session learning that persists knowledge across CLI runs."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Analyzes transformations from Layers 1-8 using generalized AST-based pattern extraction</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Cross-session learning - learns from individual layer runs and persists patterns across sessions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Smart pattern extraction with automatic transformation logging and cleanup</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Applies learned rules with 70%+ confidence scoring</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Stores rules in .neurolint/learned-rules.json with transformation history in .neurolint/transformation-log.json</span>
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
          Layer 7 features advanced cross-session learning that persists knowledge across CLI runs. 
          The learning system works in two modes:
        </p>

        <Callout type="success" title="Cross-Session Learning Enabled">
          Layer 7 now learns from individual layer runs! Running{" "}
          <code className="text-gray-300 bg-zinc-800 px-1 rounded">neurolint fix . --layers=2</code>{" "}
          logs transformations that Layer 7 can learn from in future runs. No need to run all layers together.
        </Callout>

        <div className="space-y-4 mt-6">
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-2">Mode 1: Same-Session Learning</h3>
            <p className="text-sm text-gray-400 mb-3">
              When Layer 7 runs together with other layers, it receives transformation results directly:
            </p>
            <CodeBlock
              language="bash"
              code="neurolint fix . --layers=1,2,3,7\n# Layer 7 receives results from Layers 1, 2, 3 and learns immediately"
            />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-2">Mode 2: Cross-Session Learning (NEW)</h3>
            <p className="text-sm text-gray-400 mb-3">
              Individual layer runs log transformations to .neurolint/transformation-log.json. 
              Layer 7 reads this log and extracts patterns from previous sessions:
            </p>
            <CodeBlock
              language="bash"
              code="# Session 1: Run Layer 2 (logs transformations)\nneurolint fix . --layers=2\n\n# Session 2: Run Layer 7 (learns from log)\nneurolint fix . --layers=7\n# Automatically loads patterns from Session 1"
            />
          </div>
        </div>

        <div className="space-y-4 mt-8">
          <h3 className="text-lg font-semibold text-white mb-3">Learning Pipeline</h3>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-black rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">1</div>
            <div>
              <h3 className="font-medium text-white">Transformation Logging</h3>
              <p className="text-sm text-gray-400">
                TransformationLogger captures all code changes with before/after snapshots, timestamps, and metadata. Logs are rotated and cleaned automatically.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-black rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">2</div>
            <div>
              <h3 className="font-medium text-white">Pattern Extraction</h3>
              <p className="text-sm text-gray-400">
                CrossSessionLearningManager loads transformation history and uses AST-based diffing to extract reusable patterns from all 8 layers.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-black rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">3</div>
            <div>
              <h3 className="font-medium text-white">Score & Store</h3>
              <p className="text-sm text-gray-400">
                Assigns confidence scores (starting at 0.9) and saves to .neurolint/learned-rules.json with frequency tracking.
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-black rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">4</div>
            <div>
              <h3 className="font-medium text-white">Apply</h3>
              <p className="text-sm text-gray-400">
                Applies rules with 70%+ confidence to current and future files automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Generalized Pattern Extraction</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 7 uses AST-based analysis to learn from ALL transformation types, not just predefined patterns. 
          The system includes specialized extractors for different code types:
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Layer 1: Configuration Files</h3>
            <p className="text-sm text-gray-400">Extracts patterns from tsconfig.json, next.config.js, and package.json changes</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Layer 2-6: Code Transformations</h3>
            <p className="text-sm text-gray-400">Learns from console removal, hydration guards, 'use client' directives, and React patterns</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Layer 3: Component Transformations</h3>
            <p className="text-sm text-gray-400">Extracts JSX patterns, key props, accessibility improvements, and React 19 migrations</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Layer 8: Security Patterns</h3>
            <p className="text-sm text-gray-400">Learns from security findings including eval(), innerHTML, hardcoded credentials, and injection vulnerabilities</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Generic Extractor</h3>
            <p className="text-sm text-gray-400">Fallback system that learns from arbitrary code transformations using AST diff analysis</p>
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
          <div>
            <p className="text-sm text-gray-400 mb-2">View transformation log:</p>
            <CommandBlock command="cat .neurolint/transformation-log.json" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Cross-session learning</h3>
            <p className="text-sm text-gray-400">Learn from individual layer runs across sessions - no need to run all layers together</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Generalized AST-based extraction</h3>
            <p className="text-sm text-gray-400">Learn from ANY transformation type using Abstract Syntax Tree analysis, not just predefined patterns</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Transformation logging with rotation</h3>
            <p className="text-sm text-gray-400">Automatic log management with size limits, age-based cleanup, and rotation to prevent bloat</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Confidence scoring</h3>
            <p className="text-sm text-gray-400">Only applies rules with minimum 70% confidence threshold, with frequency-based confidence growth</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Security pattern learning</h3>
            <p className="text-sm text-gray-400">Automatically learns from Layer 8 security findings (95% confidence for security patterns)</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Accurate metrics</h3>
            <p className="text-sm text-gray-400">Suggestions tracked separately from actual changes - no inflated counts</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Debug logging</h3>
            <p className="text-sm text-gray-400">Verbose error logging via NEUROLINT_DEBUG environment variable</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Production-grade reliability</h3>
            <p className="text-sm text-gray-400">Backed by comprehensive unit tests covering all functionality</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 7 is most effective when:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Running incremental fixes over time to build a comprehensive pattern database</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Enforcing project-specific conventions automatically</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Sharing learned rules across team members via export/import</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Building adaptive CI/CD pipelines that learn from each deployment</span>
          </li>
        </ul>

        <Callout type="info" title="Technical details">
          Implements RuleStore for pattern persistence, TransformationLogger for cross-session tracking, 
          and CrossSessionLearningManager for historical pattern extraction. Uses confidence scoring 
          (0-1.0) with 70% minimum threshold and frequency tracking. AST-based pattern extraction 
          works for all 8 layers including config files, components, and security patterns. 
          Logs managed with automatic rotation and cleanup.
        </Callout>
      </section>
    </DocsLayout>
  );
}
