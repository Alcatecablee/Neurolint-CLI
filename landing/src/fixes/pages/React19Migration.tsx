import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, Search } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function React19Migration() {
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
          <ProblemBadge type="breaking" tool="React 19" />
          <span className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <span className="w-6 h-px bg-purple-500/30"></span>
            <Search className="w-3.5 h-3.5" />
            8,400/mo searches
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          React 19 Breaking Changes Migration
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          React 19 removes <code className="text-red-400">ReactDOM.render</code>, <code className="text-red-400">ReactDOM.hydrate</code>, 
          and <code className="text-red-400">forwardRef</code>. NeuroLint auto-migrates your entire codebase.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix . --layer=5"
          description="Auto-migrate ReactDOM.render to createRoot, hydrate to hydrateRoot, and forwardRef to direct ref props."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Breaking Changes</h2>
          <p className="text-gray-300">
            React 19 removes several APIs that have been deprecated for years. If you upgrade without migrating, 
            your app will not compile.
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <p className="text-white font-medium mb-3">Removed in React 19:</p>
            <ul className="text-gray-400 text-sm space-y-2">
              <li><code className="text-red-400">ReactDOM.render()</code> - Use createRoot().render()</li>
              <li><code className="text-red-400">ReactDOM.hydrate()</code> - Use hydrateRoot()</li>
              <li><code className="text-red-400">forwardRef()</code> - Pass ref as a regular prop</li>
              <li><code className="text-red-400">React.createFactory()</code> - Use JSX</li>
              <li><code className="text-red-400">Legacy Context</code> - Use createContext/useContext</li>
            </ul>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Manual vs NeuroLint</h2>
        </section>

        <CompetitorCompare
          competitorName="react-codemod"
          rows={[
            { feature: "ReactDOM.render to createRoot", competitor: "yes", neurolint: "yes" },
            { feature: "ReactDOM.hydrate to hydrateRoot", competitor: "yes", neurolint: "yes" },
            { feature: "forwardRef removal", competitor: "yes", neurolint: "yes" },
            { feature: "Unique root variable names", competitor: "partial", neurolint: "yes", neurolintNote: "root, root1, root2" },
            { feature: "Combined with Next.js fixes", competitor: "no", neurolint: "yes" },
            { feature: "One command for all layers", competitor: "no", competitorNote: "Multiple codemod runs", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">ReactDOM.render Migration</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`}
            language="jsx"
            filename="index.jsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`import { createRoot } from 'react-dom/client';
import App from './App';

const root = createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`}
            language="jsx"
            filename="index.jsx"
            highlightLines={[1, 4, 5]}
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">forwardRef Migration</h2>
          <p className="text-gray-300">
            React 19 passes ref as a regular prop. No more forwardRef wrapper needed:
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`import { forwardRef } from 'react';

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});`}
            language="tsx"
            filename="Input.tsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`interface InputProps {
  ref?: React.Ref<HTMLInputElement>;
  // ... other props
}

const Input = ({ ref, ...props }: InputProps) => {
  return <input ref={ref} {...props} />;
};`}
            language="tsx"
            filename="Input.tsx"
            highlightLines={[2, 6]}
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Multiple render() Calls</h2>
          <p className="text-gray-300">
            NeuroLint handles files with multiple ReactDOM.render calls by generating unique root variable names:
          </p>

          <CodeBlock
            code={`// NeuroLint generates unique names for each root
const root = createRoot(document.getElementById('main'));
const root1 = createRoot(document.getElementById('sidebar'));
const root2 = createRoot(document.getElementById('modal'));`}
            language="jsx"
            filename="Multiple roots"
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              The migration logic is in <code>scripts/fix-layer-5-nextjs.js</code> lines 33-331. 
              It handles 5 React 19 DOM API changes with proper parenthesis parsing.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Migrate all React 19 breaking changes
npx @neurolint/cli fix . --layer=5

# Preview changes without applying
npx @neurolint/cli fix . --layer=5 --dry-run

# Run all layers for complete migration
npx @neurolint/cli fix . --all-layers`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/next-lint-deprecated"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              next lint deprecated migration
            </Link>
            <Link
              to="/fixes/hydration-mismatch-window-undefined"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Fix window is not defined
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
