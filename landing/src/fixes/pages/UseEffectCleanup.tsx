import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, AlertCircle, RefreshCw } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function UseEffectCleanup() {
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
            6,600/mo searches
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          useEffect Cleanup Patterns
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Memory leaks from missing cleanup functions are one of React's most common bugs.
          NeuroLint auto-adds cleanup returns to prevent "Can't perform state update on unmounted component" errors.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix:effect-cleanup ./src"
          description="Auto-add cleanup functions to useEffect hooks. Prevents memory leaks and unmounted component errors."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            When useEffect subscribes to events or starts async operations without cleanup, you get this warning:
          </p>
          
          <CodeBlock
            code={`Warning: Can't perform a React state update on an unmounted component.
This is a no-op, but it indicates a memory leak in your application.
To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.`}
            language="text"
            filename="Console Warning"
          />

          <p className="text-gray-300">
            This happens when a component unmounts before an async operation completes, or when 
            event listeners aren't removed. The fix requires adding a cleanup function, but 
            identifying all the places that need cleanup is tedious.
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-medium mb-1">Common Causes</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• <code className="text-blue-400">addEventListener</code> without <code className="text-blue-400">removeEventListener</code></li>
                  <li>• <code className="text-blue-400">setInterval</code> without <code className="text-blue-400">clearInterval</code></li>
                  <li>• <code className="text-blue-400">setTimeout</code> without <code className="text-blue-400">clearTimeout</code></li>
                  <li>• WebSocket connections without <code className="text-blue-400">close()</code></li>
                  <li>• Fetch requests without AbortController</li>
                  <li>• Subscription-based APIs without unsubscribe</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Existing Tools Don't Fix This</h2>
          <p className="text-gray-300">
            ESLint's <code className="text-blue-400">react-hooks/exhaustive-deps</code> only checks dependency arrays—it doesn't detect missing cleanup:
          </p>
        </section>

        <CompetitorCompare
          competitorName="ESLint react-hooks"
          rows={[
            { feature: "Detect missing dependencies", competitor: "yes", neurolint: "yes" },
            { feature: "Detect missing cleanup", competitor: "no", neurolint: "yes" },
            { feature: "Auto-add cleanup functions", competitor: "no", neurolint: "yes" },
            { feature: "Match cleanup to setup pattern", competitor: "no", neurolint: "yes", neurolintNote: "addEventListener → removeEventListener" },
            { feature: "Handle async cleanup (AbortController)", competitor: "no", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <Callout type="info" title="No ESLint Rule Exists">
            <p>
              There is no ESLint rule that detects or fixes missing useEffect cleanup functions.
              The <code>react-hooks/exhaustive-deps</code> rule only validates dependency arrays.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">How NeuroLint Fixes It</h2>
          <p className="text-gray-300">
            NeuroLint uses AST pattern matching to detect setup patterns and add corresponding cleanup:
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`import { useEffect, useState } from 'react';

function WindowResize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
  }, []);

  return <div>Width: {width}</div>;
}`}
            language="tsx"
            filename="WindowResize.tsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`import { useEffect, useState } from 'react';

function WindowResize() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return <div>Width: {width}</div>;
}`}
            language="tsx"
            filename="WindowResize.tsx"
            highlightLines={[9]}
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Pattern Matching</h3>
          <p className="text-gray-300">NeuroLint recognizes these setup/cleanup pairs:</p>

          <div className="bg-zinc-900 border border-black rounded-xl overflow-hidden my-6">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Setup Pattern</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Generated Cleanup</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-4 py-3 text-gray-400"><code className="text-blue-400">addEventListener()</code></td>
                  <td className="px-4 py-3 text-gray-400"><code className="text-green-400">removeEventListener()</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400"><code className="text-blue-400">setInterval()</code></td>
                  <td className="px-4 py-3 text-gray-400"><code className="text-green-400">clearInterval()</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400"><code className="text-blue-400">setTimeout()</code></td>
                  <td className="px-4 py-3 text-gray-400"><code className="text-green-400">clearTimeout()</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400"><code className="text-blue-400">subscribe()</code></td>
                  <td className="px-4 py-3 text-gray-400"><code className="text-green-400">unsubscribe()</code></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400"><code className="text-blue-400">fetch() with signal</code></td>
                  <td className="px-4 py-3 text-gray-400"><code className="text-green-400">AbortController.abort()</code></td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Async Operations with AbortController</h3>
          <p className="text-gray-300">NeuroLint also handles async fetch operations:</p>

          <CodeBlock
            code={`// Before: No cancellation for async fetch
useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(data => setData(data));
}, []);

// After: AbortController for proper cleanup
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setData(data))
    .catch(err => {
      if (err.name !== 'AbortError') throw err;
    });
  return () => controller.abort();
}, []);`}
            language="tsx"
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              The cleanup pattern detection is implemented in <code>scripts/fix-layer-4-hydration.js</code>.
              It uses AST traversal to match setup patterns with their corresponding cleanup functions.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Add cleanup functions to useEffect hooks
npx @neurolint/cli fix:effect-cleanup ./src

# Preview changes without applying
npx @neurolint/cli fix:effect-cleanup ./src --dry-run

# Only check specific hooks
npx @neurolint/cli fix:effect-cleanup ./src/hooks`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/hydration-mismatch-window-undefined"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Fix window is not defined
            </Link>
            <Link
              to="/fixes/react-19-migration"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              React 19 Migration
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
