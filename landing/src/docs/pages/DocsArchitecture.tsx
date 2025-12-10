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
import { DocsLayout, CodeBlock, Callout, BeforeAfter } from "../components";
import { Link } from "react-router-dom";

export function DocsArchitecture() {
  const layers = [
    {
      num: 1,
      name: "Configuration",
      description: "Updates tsconfig.json, next.config.js, package.json",
      fixes: [
        "Enforces TypeScript strict mode settings (strict, noImplicitAny, strictNullChecks, etc.)",
        "Updates target to ES2022 and module to ESNext",
        "Sets compilerOptions.jsx to react-jsx for React 19 compatibility",
        "Removes deprecated Next.js experimental flags",
        "Adds Turbopack configuration suggestions for Next.js 15+",
      ],
      engine: "JSON parsing + regex for JS configs",
      link: "/docs/layers/config",
    },
    {
      num: 2,
      name: "Patterns",
      description: "Removes debug statements, fixes HTML entities",
      fixes: [
        "Removes console.log, console.warn, console.error statements via AST",
        "Removes alert, confirm, prompt dialog calls",
        "Fixes HTML entities in JSX (&quot; to \", &amp; to &, etc.)",
        "Detects Legacy Context patterns (contextTypes, getChildContext) and warns",
        "Detects React.createFactory usage and converts to JSX",
      ],
      engine: "AST-first with regex fallback, syntax validated",
      link: "/docs/layers/patterns",
    },
    {
      num: 3,
      name: "Components",
      description: "Adds keys, accessibility attributes, ref fixes",
      fixes: [
        "Adds missing key props in map() iterations using stack-based tokenization",
        "Adds alt attributes to <img> elements",
        "Adds aria-label to buttons without accessible text",
        "Converts forwardRef to direct ref prop for React 19 compatibility",
        "Converts string refs to callback ref pattern",
      ],
      engine: "AST transformation with regex fallback",
      link: "/docs/layers/react-repair",
    },
    {
      num: 4,
      name: "Hydration",
      description: "Guards client-side APIs for SSR",
      fixes: [
        "Wraps localStorage.getItem/setItem/removeItem with typeof window !== 'undefined' guards",
        "Guards sessionStorage calls for SSR safety",
        "Protects window.matchMedia, window.location, window.navigator, window.innerWidth access",
        "Guards document.querySelector, document.getElementById, document.body calls",
        "Checks if already guarded (isAlreadyGuarded) to avoid double-wrapping",
      ],
      engine: "AST-first with isAlreadyGuarded() detection",
      link: "/docs/layers/hydration",
    },
    {
      num: 5,
      name: "Next.js",
      description: "Optimizes App Router with directives",
      fixes: [
        "Adds 'use client' directives where hooks/browser APIs detected",
        "Converts ReactDOM.render to createRoot() for React 19",
        "Converts ReactDOM.hydrate to hydrateRoot() for React 19",
        "Converts unmountComponentAtNode to root.unmount()",
        "Migrates next/router to next/navigation patterns",
      ],
      engine: "Manual parsing for nested parentheses, AST for imports",
      link: "/docs/layers/nextjs",
    },
    {
      num: 6,
      name: "Testing",
      description: "Adds error boundaries, prop types, loading states",
      fixes: [
        "Adds error boundaries where missing",
        "Suggests test scaffolding patterns",
        "Provides MSW integration guidance",
        "RSC testing recommendations",
      ],
      engine: "AST analysis with suggestions",
      link: "/docs/layers/testing",
    },
    {
      num: 7,
      name: "Adaptive",
      description: "Learns and applies patterns from prior fixes",
      fixes: [
        "Stores learned rules in .neurolint/learned-rules.json with confidence scoring",
        "Applies patterns only when confidence exceeds 70% threshold",
        "Extracts patterns from files with actual React hooks",
        "Manages rules via --list, --edit, --delete, --reset commands",
        "Debug logging available via NEUROLINT_DEBUG environment variable",
      ],
      engine: "RuleStore with regex patterns and confidence thresholds",
      link: "/docs/layers/adaptive",
    },
    {
      num: 8,
      name: "Security Forensics",
      description: "Detects IoCs, supply chain attacks, and CVE-2025-55182",
      fixes: [
        "80+ IoC signatures for post-exploitation detection (beacons, data exfiltration)",
        "CVE-2025-55182 React Server Components RCE detection (CVSS 10.0)",
        "Supply chain attack pattern recognition",
        "Baseline creation and drift detection via file hashing",
        "Incident response with git timeline analysis",
      ],
      engine: "Read-only by default, only modifies code in --quarantine mode",
      link: "/docs/layers/security",
    },
  ];

  return (
    <DocsLayout
      title="The 8-Layer Architecture"
      description="NeuroLint processes code through 8 progressive layers, each handling specific categories of issues from configuration to security forensics."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
        
        <p className="text-gray-300 mb-6">
          The 8-layer architecture ensures comprehensive code transformation while 
          maintaining predictability. Each layer focuses on a specific category of 
          issues, allowing you to apply fixes incrementally or all at once.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <div className="flex flex-col gap-2">
            {layers.map((layer, idx) => (
              <div 
                key={layer.num}
                className={`flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors ${layer.num === 8 ? 'border border-red-900/50' : ''}`}
              >
                <div className={`w-8 h-8 flex items-center justify-center rounded font-mono text-sm ${layer.num === 8 ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-gray-400'}`}>
                  {layer.num}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-white">{layer.name}</span>
                  <span className="text-gray-500 mx-2">-</span>
                  <span className="text-gray-400 text-sm">{layer.description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Callout type="info" title="Layer execution order">
          Layers 1-7 run in order when using --all-layers. Layer 8 (Security Forensics) 
          is read-only by default and runs separately via security: commands. Earlier layers prepare 
          the codebase for later transformations.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">The Transformation Safety Pipeline</h2>
        
        <p className="text-gray-300 mb-6">
          NeuroLint uses a three-step safety process for every transformation to ensure 
          your code is never left in a broken state:
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
          <ol className="space-y-4 text-gray-400 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-blue-900/50 rounded text-blue-400 font-mono text-sm">1</span>
              <div>
                <strong className="text-white">AST Transformation</strong>
                <p className="mt-1">First attempts AST-based transformation using Babel parser for maximum accuracy. Parses with TypeScript and JSX plugins enabled.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-yellow-900/50 rounded text-yellow-400 font-mono text-sm">2</span>
              <div>
                <strong className="text-white">Regex Fallback</strong>
                <p className="mt-1">If AST fails or makes no changes, applies regex-based pattern matching. Uses custom patterns for console removal, SSR guards, and key props.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-8 h-8 flex items-center justify-center bg-green-900/50 rounded text-green-400 font-mono text-sm">3</span>
              <div>
                <strong className="text-white">Syntax Validation & Revert</strong>
                <p className="mt-1">Validates transformed code using Babel parser. If syntax is invalid, automatically reverts to original. You'll see: <code className="text-yellow-400">"[ERROR] Regex fallback produced invalid syntax - REJECTING changes"</code></p>
              </div>
            </li>
          </ol>
        </div>

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
        <h2 className="text-2xl font-bold text-white mb-6">Layer Details</h2>
        
        <div className="space-y-8">
          {layers.map((layer) => (
            <div 
              key={layer.num}
              className={`border rounded-lg overflow-hidden ${layer.num === 8 ? 'border-red-900/50' : 'border-zinc-800'}`}
            >
              <div className={`flex items-center gap-4 px-5 py-4 border-b ${layer.num === 8 ? 'bg-red-900/20 border-red-900/50' : 'bg-zinc-900/50 border-zinc-800'}`}>
                <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-mono text-lg ${layer.num === 8 ? 'bg-red-900/50 text-red-400' : 'bg-zinc-800 text-white'}`}>
                  {layer.num}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{layer.name}</h3>
                  <p className="text-sm text-gray-400">{layer.description}</p>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Engine:</span>
                  <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-1 rounded">{layer.engine}</span>
                </div>
                
                <h4 className="text-sm font-medium text-gray-300 uppercase tracking-wide mb-3">
                  What it fixes
                </h4>
                <ul className="space-y-2">
                  {layer.fixes.map((fix, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-400 text-sm">
                      <span className="text-gray-600 mt-0.5">-</span>
                      {fix}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to={layer.link}
                  className="inline-block mt-4 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View full documentation
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Backup System</h2>
        
        <p className="text-gray-300 mb-4">
          Every fix operation creates automatic backups before modifying files:
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-4">
          <ul className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">-</span>
              Backups stored in centralized <code className="text-blue-400">.neurolint-backups/</code> directory
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">-</span>
              SHA-256 checksums for integrity verification
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">-</span>
              Restore with <code className="text-blue-400">neurolint backups restore &lt;n&gt; --yes</code>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-gray-600 mt-0.5">-</span>
              Maximum 10 backups retained by default
            </li>
          </ul>
        </div>

        <Callout type="warning" title="Layer 8 is read-only by default">
          Layer 8 (Security Forensics) never modifies code unless you explicitly use <code className="text-blue-400">--quarantine</code> mode. 
          This ensures security scanning never breaks your build.
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Selecting Layers</h2>
        
        <p className="text-gray-300 mb-4">
          You can run all layers, specific layers, or a range:
        </p>

        <CodeBlock
          language="bash"
          code={`# Run all layers (1-7, excludes Layer 8)
neurolint fix ./src --all-layers

# Run specific layers
neurolint fix ./src --layers=1,3,4

# Run layers 1 through 5
neurolint fix ./src --layers=1,2,3,4,5

# Run layer-specific commands
neurolint hydration fix ./src --verbose
neurolint components scan ./src

# Security forensics (Layer 8) runs separately
neurolint security:scan-compromise ./src --quick`}
        />

        <p className="text-gray-400 text-sm mt-4">
          For large codebases, running layers incrementally (one at a time) with 
          <code className="text-blue-400"> --dry-run</code> is recommended so you can review 
          each category of changes before applying.
        </p>
      </section>
    </DocsLayout>
  );
}
