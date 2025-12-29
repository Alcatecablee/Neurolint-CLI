import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function ConsoleLogRemoval() {
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
          Remove console.log from Production
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          ESLint's <code className="text-blue-400">no-console</code> rule only <strong className="text-white">detects</strong> console statements.
          It cannot auto-remove them. NeuroLint removes them with documented comments.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix . --layer=2"
          description="Auto-remove console.log, console.warn, console.error with documented comments showing what was removed."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            Console statements slip into production builds. When you run ESLint with <code className="text-blue-400">no-console</code>:
          </p>
          
          <CodeBlock
            code={`warning  Unexpected console statement  no-console

$ eslint --fix
# ... nothing happens. The console.log is still there.`}
            language="text"
            filename="ESLint Output"
          />

          <p className="text-gray-300">
            ESLint's <code className="text-blue-400">--fix</code> flag does nothing for <code className="text-blue-400">no-console</code>.
            The rule only reports violations—it cannot remove the code.
          </p>

          <Callout type="info" title="Why ESLint Does Not Auto-Fix no-console">
            <p>
              From ESLint's documentation: The no-console rule has no auto-fix because removing console statements 
              could break code that relies on the return value or has side effects.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Build-Time Stripping vs NeuroLint</h2>
          <p className="text-gray-300">
            Build tools like Terser and Babel can strip console statements, but they do it silently:
          </p>
        </section>

        <CompetitorCompare
          competitorName="Terser/Babel"
          rows={[
            { feature: "Remove console statements", competitor: "yes", competitorNote: "At build time", neurolint: "yes", neurolintNote: "In source code" },
            { feature: "Document what was removed", competitor: "no", neurolint: "yes" },
            { feature: "Visible in code reviews", competitor: "no", neurolint: "yes" },
            { feature: "Works with any build tool", competitor: "partial", competitorNote: "Terser/Webpack only", neurolint: "yes" },
            { feature: "Handles arrow function bodies", competitor: "yes", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">How NeuroLint Removes console.log</h2>
          <p className="text-gray-300">
            NeuroLint uses AST transformation with Babel to find and remove console statements, 
            leaving a comment documenting what was removed:
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`function handleLogin(user) {
  console.log("User logged in:", user.email);
  
  if (user.isAdmin) {
    console.warn("Admin access granted");
  }
  
  return authenticateUser(user);
}`}
            language="javascript"
            filename="auth.js"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`function handleLogin(user) {
  // [NeuroLint] Console statement removed: "User logged in:", user.email
  
  if (user.isAdmin) {
    // [NeuroLint] Console statement removed: "Admin access granted"
  }
  
  return authenticateUser(user);
}`}
            language="javascript"
            filename="auth.js"
            highlightLines={[2, 5]}
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Arrow Function Edge Cases</h3>
          <p className="text-gray-300">
            NeuroLint handles expression-bodied arrow functions that other tools break:
          </p>

          <CodeBlock
            code={`// Before - expression body with console
const handler = (e) => console.log(e.target.value);

// After - converted to block body with comment
const handler = (e) => {
  // [NeuroLint] Console statement removed
};`}
            language="javascript"
            filename="Arrow function handling"
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              The console removal logic is implemented in <code>scripts/fix-layer-2-patterns.js</code> lines 54-95. 
              AST transformation is in <code>ast-transformer.js</code> lines 148-246.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What Gets Removed</h2>
          <p className="text-gray-300">NeuroLint removes all console methods:</p>

          <ul className="list-disc list-inside text-gray-300 space-y-2 my-4">
            <li><code className="text-blue-400">console.log()</code></li>
            <li><code className="text-blue-400">console.warn()</code></li>
            <li><code className="text-blue-400">console.error()</code></li>
            <li><code className="text-blue-400">console.info()</code></li>
            <li><code className="text-blue-400">console.debug()</code></li>
          </ul>

          <p className="text-gray-300">
            It also removes <code className="text-blue-400">alert()</code>, <code className="text-blue-400">confirm()</code>, 
            and <code className="text-blue-400">prompt()</code> dialogs.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Remove console statements with documented comments
npx @neurolint/cli fix . --layer=2

# Preview changes without applying
npx @neurolint/cli fix . --layer=2 --dry-run

# Verbose output showing each removal
npx @neurolint/cli fix . --layer=2 --verbose`}
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
              to="/fixes/typescript-strict-mode"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              TypeScript strict mode setup
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
