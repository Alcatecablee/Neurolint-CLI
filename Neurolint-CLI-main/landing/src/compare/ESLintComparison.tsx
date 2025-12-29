import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { CompetitorCompare } from "../fixes/components/CompetitorCompare";
import { CodeBlock } from "../docs/components/CodeBlock";
import { Callout } from "../docs/components/Callout";

export function ESLintComparison() {
  return (
    <article className="py-12 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/fixes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fixes
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          NeuroLint vs ESLint: Auto-Fix Comparison
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          ESLint is great at <strong className="text-white">detecting</strong> issues. 
          NeuroLint <strong className="text-white">fixes</strong> them. Here's what each tool actually does.
        </p>

        <Callout type="info" title="Not a Replacement">
          <p>
            NeuroLint is not an ESLint replacement. ESLint handles code style 
            and static analysis. NeuroLint adds automated fixes for issues ESLint can only detect.
          </p>
        </Callout>

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-6">Auto-Fix Comparison</h2>
        </section>

        <CompetitorCompare
          competitorName="ESLint"
          rows={[
            { feature: "Detect missing React keys", competitor: "yes", neurolint: "yes" },
            { feature: "Auto-fix missing keys", competitor: "no", competitorNote: "Issue #3215", neurolint: "yes" },
            { feature: "Detect hydration mismatches", competitor: "no", neurolint: "yes" },
            { feature: "Auto-wrap SSR guards", competitor: "no", neurolint: "yes" },
            { feature: "Detect console.log", competitor: "yes", neurolint: "yes" },
            { feature: "Auto-remove console.log", competitor: "no", neurolint: "yes" },
            { feature: "forwardRef removal (React 19)", competitor: "no", neurolint: "yes" },
            { feature: "useEffect cleanup detection", competitor: "no", neurolint: "yes" },
            { feature: "TypeScript strict mode setup", competitor: "no", competitorNote: "N/A", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The jsx-key Problem</h2>
          <p className="text-gray-300">
            This is ESLint's most-requested auto-fix feature. GitHub issue #3215 has 115+ reactions 
            asking for it. But ESLint <strong className="text-white">cannot</strong> auto-fix missing keys:
          </p>

          <CodeBlock
            code={`$ eslint src/UserList.jsx
warning  Missing "key" prop for element in iterator  react/jsx-key

$ eslint --fix src/UserList.jsx
# ... no changes made

$ cat src/UserList.jsx
# Still no key! ESLint only detects, doesn't fix.`}
            language="bash"
            filename="ESLint cannot fix missing keys"
          />

          <p className="text-gray-300 mt-4">
            ESLint can't fix this because it doesn't know your data structure. It can't guess whether 
            the key should be <code className="text-blue-400">id</code>, <code className="text-blue-400">_id</code>, 
            <code className="text-blue-400">uuid</code>, or the array index.
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">NeuroLint's Smart ID Inference</h3>
          <p className="text-gray-300">
            NeuroLint uses AST analysis to find stable IDs in your data:
          </p>

          <CodeBlock
            code={`// NeuroLint analyzes the .map() callback parameter
users.map(user => <li>{user.name}</li>)
            
// Checks for id-like properties: id, _id, key, uuid
// If found, uses it as key
users.map(user => <li key={user.id}>{user.name}</li>)

// If no stable ID, falls back to index with warning
items.map((item, i) => <li key={i}>{item}</li>)
// Warning: Using index as key - may cause issues with reordering`}
            language="jsx"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">When to Use Each Tool</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="bg-zinc-900 border border-black rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Use ESLint For</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Code style enforcement (quotes, semicolons)</li>
                <li>Import sorting and organization</li>
                <li>Basic React patterns (hooks rules)</li>
                <li>Accessibility detection (jsx-a11y)</li>
              </ul>
            </div>
            <div className="bg-zinc-900 border border-black rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Use NeuroLint For</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>Auto-fixing issues ESLint only detects</li>
                <li>React 19 / Next.js 15+ migrations</li>
                <li>SSR/hydration guard insertion</li>
                <li>Security scanning (IoC detection)</li>
              </ul>
            </div>
          </div>

          <Callout type="success" title="Use Both Together">
            <p>
              The recommended workflow: Run ESLint for style, then run NeuroLint to fix 
              what ESLint detected but couldn't fix. They complement each other.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Try NeuroLint</h2>
          <CodeBlock
            code={`# Run NeuroLint to fix what ESLint can't
npx @neurolint/cli analyze ./src

# Fix all auto-fixable issues
npx @neurolint/cli fix:all ./src

# Preview changes first
npx @neurolint/cli fix:all ./src --dry-run`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Pages</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/react-keys-auto-fix"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Auto-fix missing React keys
            </Link>
            <Link
              to="/compare/biome"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              NeuroLint vs Biome
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
