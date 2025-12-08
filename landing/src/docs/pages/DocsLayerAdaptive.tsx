import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

export function DocsLayerAdaptive() {
  return (
    <DocsLayout
      title="Layer 7: AdaptiveLearn"
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
            <span>Extracts common patterns and creates rules</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Applies learned rules with confidence scoring</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Stores rules in .neurolint/learned-rules.json</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Provides adaptive suggestions for inline styles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adapts to project-specific conventions</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <CommandBlock command="neurolint fix ./src --layers=7 --verbose" />
        <CommandBlock command="neurolint rules --list" />
        <CommandBlock command="neurolint rules --export=team-rules.json" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How It Learns</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 7 observes the transformations applied by previous layers and extracts 
          patterns that can be reused:
        </p>

        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">1</div>
            <div>
              <h3 className="font-medium text-white">Observe</h3>
              <p className="text-sm text-gray-400">
                Watches transformations from Layers 1-6 and records before/after states
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">2</div>
            <div>
              <h3 className="font-medium text-white">Extract</h3>
              <p className="text-sm text-gray-400">
                Identifies common patterns across multiple files
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">3</div>
            <div>
              <h3 className="font-medium text-white">Score</h3>
              <p className="text-sm text-gray-400">
                Assigns confidence scores based on frequency and consistency
              </p>
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">4</div>
            <div>
              <h3 className="font-medium text-white">Apply</h3>
              <p className="text-sm text-gray-400">
                Applies rules with 70%+ confidence to new files
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
            <h3 className="font-medium text-white mb-1">Pattern extraction</h3>
            <p className="text-sm text-gray-400">Machine learning-like pattern extraction from transformations</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Confidence scoring</h3>
            <p className="text-sm text-gray-400">Only applies rules with minimum 70% confidence</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Rule persistence</h3>
            <p className="text-sm text-gray-400">Rules persist across runs and can be shared</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Style adaptation</h3>
            <p className="text-sm text-gray-400">Learns project-specific code style preferences</p>
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
          (0-1.0) and frequency tracking. Extracts patterns by comparing before/after 
          code from previous layers.
        </Callout>
      </section>
    </DocsLayout>
  );
}
