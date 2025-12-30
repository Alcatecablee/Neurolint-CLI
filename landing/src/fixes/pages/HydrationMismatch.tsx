import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Search, AlertCircle } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";
import { useMetaTags } from "../../hooks/useMetaTags";

export function HydrationMismatch() {
  useMetaTags({
    title: "Fix 'window is not defined' Hydration Errors - NeuroLint",
    description: "Automatically fix React hydration errors including 'window is not defined', 'document is not defined', and SSR mismatches with AST-based code transformation.",
    keywords: "hydration error, window not defined, React SSR, Next.js hydration, code fixer",
    ogTitle: "Fix 'window is not defined' Errors",
    ogDescription: "Auto-fix React hydration errors and SSR mismatches with NeuroLint",
    ogUrl: "https://www.neurolint.dev/fixes/hydration-mismatch",
    ogImage: "https://www.neurolint.dev/og-image.png",
    canonical: "https://www.neurolint.dev/fixes/hydration-mismatch",
    twitterCard: "summary_large_image",
    twitterCreator: "@neurolint",
  });
  return (
    <article className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/fixes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fixes
        </Link>

        <div className="flex flex-wrap items-center gap-6 mb-6">
          <ProblemBadge type="error" />
          <span className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <span className="w-6 h-px bg-purple-500/30"></span>
            <Search className="w-3.5 h-3.5" />
            3,400/mo searches
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Fix "window is not defined" Errors
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Browser APIs like <code className="text-red-400">window</code>, <code className="text-red-400">localStorage</code>, 
          and <code className="text-red-400">document</code> don't exist on the server. 
          NeuroLint auto-wraps them with SSR guards.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix:hydration-guards ./src"
          description="Auto-wrap browser API usage with SSR-safe guards. Prevents hydration mismatches."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            When you use browser APIs in a Next.js or SSR React app, you get this error:
          </p>
          
          <CodeBlock
            code={`ReferenceError: window is not defined
    at Module.<anonymous> (/app/components/Analytics.tsx:5:1)
    at Object.<anonymous> (/app/.next/server/pages/_app.js:1:1)`}
            language="text"
            filename="Server Error"
          />

          <p className="text-gray-300">
            This happens because your code runs on the server first, where <code className="text-blue-400">window</code> doesn't exist.
            The fix is to wrap browser-only code in a check, but doing this manually is tedious and error-prone.
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-medium mb-1">Common Causes</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Direct <code className="text-blue-400">window.innerWidth</code> access in components</li>
                  <li>• <code className="text-blue-400">localStorage.getItem()</code> in initial render</li>
                  <li>• Third-party libraries that assume browser environment</li>
                  <li>• Event listeners added without client-side checks</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Existing Tools Don't Fix This</h2>
          <p className="text-gray-300">
            There are ESLint plugins for SSR, but they only <strong className="text-white">detect</strong> the issue—they don't fix it:
          </p>
        </section>

        <CompetitorCompare
          competitorName="ESLint SSR Plugins"
          rows={[
            { feature: "Detect window/document usage", competitor: "yes", neurolint: "yes" },
            { feature: "Auto-wrap with SSR guards", competitor: "no", neurolint: "yes" },
            { feature: "Detect localStorage usage", competitor: "partial", neurolint: "yes" },
            { feature: "Avoid double-wrapping", competitor: "no", competitorNote: "N/A", neurolint: "yes" },
            { feature: "Handle dynamic imports", competitor: "no", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <Callout type="info" title="No Codemods Exist">
            <p>
              There is no jscodeshift codemod for adding hydration guards. 
              NeuroLint is the first tool to offer automated SSR guard insertion.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">How NeuroLint Fixes It</h2>
          <p className="text-gray-300">
            NeuroLint uses AST analysis with Babel to find browser API usage and wrap it safely:
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}`}
            language="typescript"
            filename="useWindowSize.ts"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`import { useEffect, useState } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}`}
            language="typescript"
            filename="useWindowSize.ts"
            highlightLines={[5, 6, 10]}
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Smart Guard Placement</h3>
          <p className="text-gray-300">NeuroLint is smart about where to add guards:</p>

          <ul className="list-disc list-inside text-gray-300 space-y-2 my-4">
            <li><strong className="text-white">Initial state:</strong> Wraps with ternary for SSR-safe defaults</li>
            <li><strong className="text-white">useEffect:</strong> Adds early return (browser APIs are safe in effects)</li>
            <li><strong className="text-white">Event handlers:</strong> No wrapping needed (only run client-side)</li>
            <li><strong className="text-white">Existing guards:</strong> Detects and skips to prevent double-wrapping</li>
          </ul>

          <Callout type="success" title="Verified in Source Code">
            <p>
              The hydration guard logic is implemented in <code>scripts/fix-layer-4-hydration.js</code>. 
              It uses AST traversal to find browser API usage and applies contextually appropriate guards.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Add SSR guards to browser API usage
npx @neurolint/cli fix:hydration-guards ./src

# Preview changes without applying
npx @neurolint/cli fix:hydration-guards ./src --dry-run

# Only check specific files
npx @neurolint/cli fix:hydration-guards ./src/hooks`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/react-keys-auto-fix"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Auto-fix missing React keys
            </Link>
            <Link
              to="/fixes/next-lint-deprecated"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              next lint deprecated migration
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
