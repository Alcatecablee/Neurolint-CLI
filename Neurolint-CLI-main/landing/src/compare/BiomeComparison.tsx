import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { CompetitorCompare } from "../fixes/components/CompetitorCompare";
import { CodeBlock } from "../docs/components/CodeBlock";
import { Callout } from "../docs/components/Callout";

export function BiomeComparison() {
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
          NeuroLint vs Biome: Feature Comparison
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          Biome is a fast linter and formatter. NeuroLint is a code fixer and migration tool. 
          They solve different problems and work well together.
        </p>

        <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
            <div>
              <p className="text-white font-medium mb-1">Next.js 16 Replaces next lint with Biome</p>
              <p className="text-gray-400 text-sm">
                Starting in Next.js 15.5, <code className="text-blue-400">next lint</code> is deprecated.
                Next.js 16 removes it entirely in favor of Biome. NeuroLint can auto-migrate your setup.
              </p>
              <Link
                to="/fixes/next-lint-deprecated"
                className="inline-flex items-center gap-1 text-gray-300 text-sm mt-2 hover:text-white"
              >
                Learn about next lint migration
              </Link>
            </div>
          </div>
        </div>

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-6">Feature Comparison</h2>
        </section>

        <CompetitorCompare
          competitorName="Biome"
          rows={[
            { feature: "Primary purpose", competitor: "partial", competitorNote: "Linting + Formatting", neurolint: "partial", neurolintNote: "Auto-fixing + Migrations" },
            { feature: "Speed (Rust-powered)", competitor: "yes", neurolint: "no", neurolintNote: "Node.js" },
            { feature: "Code formatting", competitor: "yes", neurolint: "no" },
            { feature: "Import sorting", competitor: "yes", neurolint: "no" },
            { feature: "Auto-fix missing React keys", competitor: "no", neurolint: "yes" },
            { feature: "Auto-wrap SSR guards", competitor: "no", neurolint: "yes" },
            { feature: "React 19 migration", competitor: "no", neurolint: "yes" },
            { feature: "Next.js 15/16 migration", competitor: "no", neurolint: "yes" },
            { feature: "Security scanning (IoC)", competitor: "no", neurolint: "yes", neurolintNote: "80 signatures" },
            { feature: "8-layer architecture", competitor: "no", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Why Next.js Chose Biome</h2>
          <p className="text-gray-300">
            Next.js deprecated <code className="text-blue-400">next lint</code> in v15.5 because:
          </p>

          <ul className="list-disc list-inside text-gray-300 space-y-2 my-4">
            <li><strong className="text-white">Speed:</strong> Biome is 10-100x faster than ESLint (Rust vs JavaScript)</li>
            <li><strong className="text-white">Unified tooling:</strong> Biome combines linting and formatting</li>
            <li><strong className="text-white">Less configuration:</strong> Sensible defaults out of the box</li>
            <li><strong className="text-white">Active development:</strong> Biome is rapidly improving</li>
          </ul>

          <Callout type="info" title="Migrating from next lint to Biome">
            <p>
              If you're on Next.js 15.5+ and see "next lint is deprecated", NeuroLint can 
              auto-configure Biome and update your npm scripts. See the 
              <Link to="/fixes/next-lint-deprecated" className="text-gray-300 mx-1 hover:text-white">
                next lint deprecated migration guide
              </Link>.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Use Both Together</h2>
          <p className="text-gray-300">
            The recommended workflow is to use Biome for linting/formatting and NeuroLint for 
            migrations and complex auto-fixes:
          </p>

          <CodeBlock
            code={`# 1. Format and lint with Biome (fast)
npx @biomejs/biome check --write ./src

# 2. Run NeuroLint for advanced fixes
npx @neurolint/cli fix:all ./src

# 3. Migrate React 19 / Next.js 15 code
npx @neurolint/cli migrate:react-19 ./src
npx @neurolint/cli migrate:nextjs-15 ./app`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">NeuroLint Helps You Adopt Biome</h2>
          <p className="text-gray-300">
            If you're migrating from ESLint to Biome, NeuroLint can help set up the transition:
          </p>

          <CodeBlock
            code={`# Migrate from next lint to Biome
npx @neurolint/cli migrate:next-lint

# This will:
# 1. Install @biomejs/biome
# 2. Create biome.json with Next.js-appropriate rules
# 3. Update package.json scripts:
#    - "lint": "biome check ."
#    - "lint:fix": "biome check --write ."
#    - "format": "biome format --write ."
# 4. Remove eslintrc and .eslintignore if present`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Summary</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="bg-zinc-900 border border-black rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-3">Biome</h3>
              <p className="text-gray-400 text-sm">
                Fast linting and formatting. Replaces ESLint + Prettier. 
                Great for code style and basic error detection.
              </p>
            </div>
            <div className="bg-zinc-900 border border-black rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-3">NeuroLint</h3>
              <p className="text-gray-400 text-sm">
                Auto-fixing and migrations. Fixes issues linters only detect. 
                Handles React/Next.js version upgrades and security scanning.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Pages</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/next-lint-deprecated"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              next lint deprecated migration
            </Link>
            <Link
              to="/compare/eslint"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              NeuroLint vs ESLint
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
