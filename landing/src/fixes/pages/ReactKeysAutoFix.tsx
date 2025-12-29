import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, ThumbsUp } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";
import { useMetaTags } from "../../hooks/useMetaTags";

export function ReactKeysAutoFix() {
    useMetaTags({
        title: "Auto-fix Missing React Keys - NeuroLint",
        description: "Automatically add stable keys to React .map() renders. ESLint detects missing keys but can't fix them. NeuroLint fixes them intelligently with ID inference.",
        keywords: "React keys, jsx-key, auto-fix, ESLint alternative, code fixer",
        ogTitle: "Auto-fix Missing React Keys",
        ogDescription: "Automatically add stable keys to React .map() renders with NeuroLint",
        ogUrl: "https://www.neurolint.dev/fixes/react-keys-auto-fix",
        ogImage: "https://www.neurolint.dev/og-image.png",
        canonical: "https://www.neurolint.dev/fixes/react-keys-auto-fix",
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

        <div className="mb-6">
          <ProblemBadge type="limitation" tool="ESLint" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Auto-fix Missing React Keys
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          ESLint's jsx-a11y/jsx-key rule only <strong className="text-white">detects</strong> missing keys. 
          It cannot auto-fix them. NeuroLint fixes them automatically with smart ID inference.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix:react-keys ./src"
          description="Automatically add stable keys to all .map() renders. Uses existing IDs when available."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            When you run ESLint on code with missing React keys, you get warnings like this:
          </p>
          
          <CodeBlock
            code={`warning  Missing "key" prop for element in iterator  react/jsx-key`}
            language="text"
            filename="ESLint Output"
          />

          <p className="text-gray-300">
            But when you run <code className="text-blue-400">eslint --fix</code>, nothing happens. 
            The warning remains because ESLint has no auto-fix for jsx-key.
          </p>

          <Callout type="info" title="Why ESLint Can't Auto-Fix Keys">
            <p>
              ESLint operates at the AST level but doesn't know your data structure. 
              It can't guess what property should be used as the key—it could be <code>id</code>, <code>_id</code>, <code>uuid</code>, or the array index.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Community's Frustration</h2>
          <p className="text-gray-300">
            This isn't just a minor inconvenience. The ESLint community has been asking for auto-fix support for years:
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <div className="flex items-start gap-4">
              <Github className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <a 
                  href="https://github.com/jsx-eslint/eslint-plugin-react/issues/3215"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  eslint-plugin-react Issue #3215
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-gray-400 text-sm mt-1">
                  "jsx-key Missing key prop false positives" — 115+ reactions
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    115+ reactions
                  </span>
                  <span>Feb 2022</span>
                </div>
              </div>
            </div>
          </div>

          <Callout type="tip" title="The Core Issue">
            <p>
              Even when jsx-key works correctly, <strong>it has no auto-fix</strong>. 
              The ESLint docs confirm: jsx-key only detects missing keys—developers must add them manually.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What ESLint Does vs NeuroLint</h2>
        </section>

        <CompetitorCompare
          competitorName="ESLint"
          rows={[
            { feature: "Detect missing keys", competitor: "yes", neurolint: "yes" },
            { feature: "Auto-fix missing keys", competitor: "no", neurolint: "yes" },
            { feature: "Smart ID inference (id, _id, key)", competitor: "no", neurolint: "yes" },
            { feature: "Fall back to index safely", competitor: "no", neurolint: "yes", neurolintNote: "When no stable ID exists" },
            { feature: "Avoid false positives", competitor: "partial", competitorNote: "Issue #3215", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">How NeuroLint Fixes Keys</h2>
          <p className="text-gray-300">
            NeuroLint uses AST analysis with smart parameter classification:
          </p>

          <ol className="list-decimal list-inside text-gray-300 space-y-2 my-4">
            <li><strong className="text-white">Try stable IDs first:</strong> Looks for <code className="text-blue-400">id</code>, <code className="text-blue-400">key</code>, <code className="text-blue-400">_id</code>, <code className="text-blue-400">uuid</code> properties</li>
            <li><strong className="text-white">Check for compound keys:</strong> Uses <code className="text-blue-400">{"`${item.type}-${item.name}`"}</code> when single ID isn't unique</li>
            <li><strong className="text-white">Fall back to index:</strong> Uses array index only when no stable ID exists</li>
          </ol>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`const UserList = ({ users }) => (
  <ul>
    {users.map(user => (
      <li>{user.name}</li>
    ))}
  </ul>
);`}
            language="jsx"
            filename="UserList.jsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`const UserList = ({ users }) => (
  <ul>
    {users.map(user => (
      <li key={user.id}>{user.name}</li>
    ))}
  </ul>
);`}
            language="jsx"
            filename="UserList.jsx"
            highlightLines={[4]}
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              This smart ID classification is implemented in <code>scripts/fix-layer-3-components.js</code> lines 159-184. 
              NeuroLint is open source—you can verify exactly how it works.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Fix all missing keys in your project
npx @neurolint/cli fix:react-keys ./src

# Preview changes without applying
npx @neurolint/cli fix:react-keys ./src --dry-run`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/hydration-mismatch"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Fix window is not defined
            </Link>
            <Link
              to="/fixes/console-log-removal"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Remove console.log
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
