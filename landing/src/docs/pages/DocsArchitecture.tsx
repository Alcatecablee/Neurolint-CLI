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
        "Updates tsconfig.json to ES2022 target and ESNext modules",
        "Detects Next.js version and applies appropriate compiler options",
        "Fixes package.json type field and engine requirements",
        "Updates next.config.js for App Router compatibility",
      ],
      link: "/docs/layers/config",
    },
    {
      num: 2,
      name: "Patterns",
      description: "Standardizes variables, removes console statements",
      fixes: [
        "Removes console.log and debug statements",
        "Fixes HTML entities in JSX (& to &amp;)",
        "Replaces var with const/let",
        "Removes unused imports",
      ],
      link: "/docs/layers/patterns",
    },
    {
      num: 3,
      name: "Components",
      description: "Adds keys, accessibility attributes, prop types",
      fixes: [
        "Adds missing key props in map() iterations",
        "Adds alt attributes to <img> elements",
        "Adds ARIA labels for accessibility",
        "Fixes missing React imports",
      ],
      link: "/docs/layers/react-repair",
    },
    {
      num: 4,
      name: "Hydration",
      description: "Guards client-side APIs for SSR",
      fixes: [
        "Wraps window access with typeof window !== 'undefined'",
        "Guards document usage for SSR safety",
        "Protects localStorage and sessionStorage calls",
        "Handles navigator API access",
      ],
      link: "/docs/layers/hydration",
    },
    {
      num: 5,
      name: "Next.js",
      description: "Optimizes App Router with directives",
      fixes: [
        "Adds 'use client' directives where needed",
        "Migrates next/router to next/navigation",
        "Handles React 19 breaking changes",
        "Updates deprecated Next.js patterns",
      ],
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
      link: "/docs/layers/testing",
    },
    {
      num: 7,
      name: "Adaptive",
      description: "Learns and applies patterns from prior fixes",
      fixes: [
        "Stores learned rules in .neurolint/learned-rules.json",
        "Applies project-specific patterns from previous runs",
        "Adapts to your team's coding conventions",
        "Remembers custom transformation preferences",
      ],
      link: "/docs/layers/adaptive",
    },
    {
      num: 8,
      name: "Security Forensics",
      description: "Detects IoCs, supply chain attacks, and CVE-2025-55182",
      fixes: [
        "80+ IoC signatures for post-exploitation detection",
        "CVE-2025-55182 React Server Components RCE detection",
        "Supply chain attack pattern recognition",
        "Baseline integrity verification",
      ],
      link: "/docs/layers/security",
    },
  ];

  return (
    <DocsLayout
      title="The 8-Layer Architecture"
      description="NeuroLint processes code through 8 progressive layers, each handling specific categories of issues from configuration to security."
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
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">
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
          Layers run in order from 1 to 8. Earlier layers prepare the codebase 
          for later transformations. For example, Layer 1 fixes configs before 
          Layer 5 applies Next.js migrations.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-6">Layer Details</h2>
        
        <div className="space-y-8">
          {layers.map((layer) => (
            <div 
              key={layer.num}
              className="border border-zinc-800 rounded-lg overflow-hidden"
            >
              <div className="flex items-center gap-4 px-5 py-4 bg-zinc-900/50 border-b border-zinc-800">
                <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded-lg font-mono text-lg text-white">
                  {layer.num}
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">{layer.name}</h3>
                  <p className="text-sm text-gray-400">{layer.description}</p>
                </div>
              </div>
              
              <div className="p-5">
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
        <h2 className="text-2xl font-bold text-white mb-4">How Transformations Work</h2>
        
        <p className="text-gray-300 mb-6">
          Each layer uses AST (Abstract Syntax Tree) parsing to understand your code 
          structure. This is safer than regex-based find-and-replace because it 
          understands code semantics.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5 mb-6">
          <h3 className="font-medium text-white mb-3">The transformation pipeline:</h3>
          <ol className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-500 font-mono text-xs">1</span>
              <span><strong className="text-gray-300">Parse</strong> - Code is parsed into an AST using Babel</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-500 font-mono text-xs">2</span>
              <span><strong className="text-gray-300">Transform</strong> - Layer-specific rules modify the AST</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-500 font-mono text-xs">3</span>
              <span><strong className="text-gray-300">Validate</strong> - Changed code is validated for syntax errors</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-500 font-mono text-xs">4</span>
              <span><strong className="text-gray-300">Backup</strong> - Original file is backed up with SHA-256 checksum</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-6 h-6 flex items-center justify-center bg-zinc-800 rounded text-gray-500 font-mono text-xs">5</span>
              <span><strong className="text-gray-300">Apply</strong> - Modified code is written to disk</span>
            </li>
          </ol>
        </div>

        <Callout type="warning" title="Validation failures">
          If validation fails (the transformed code has syntax errors), NeuroLint 
          falls back to regex-based transformations or reverts the change entirely. 
          Your code is never left in a broken state.
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Selecting Layers</h2>
        
        <p className="text-gray-300 mb-4">
          You can run all layers, specific layers, or a range:
        </p>

        <CodeBlock
          language="bash"
          code={`# Run all layers
neurolint fix ./src --all-layers

# Run specific layers
neurolint fix ./src --layers=1,3,4

# Run layers 1 through 5
neurolint fix ./src --layers=1,2,3,4,5

# Run only security forensics
neurolint fix ./src --layers=8`}
        />

        <p className="text-gray-400 text-sm mt-4">
          For large codebases, running layers incrementally (one at a time) is 
          recommended so you can review each category of changes.
        </p>
      </section>
    </DocsLayout>
  );
}
