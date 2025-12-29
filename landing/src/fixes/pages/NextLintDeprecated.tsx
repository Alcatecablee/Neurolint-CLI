import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github, MessageSquare, Clock } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function NextLintDeprecated() {
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

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <ProblemBadge type="deprecated" tool="Next.js" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            <Clock className="w-3.5 h-3.5" />
            Time Sensitive
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          next lint Deprecated Migration
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          <code className="text-orange-400">next lint</code> was deprecated in Next.js 15.5 and 
          <strong className="text-white"> removed in Next.js 16</strong>. 
          NeuroLint auto-migrates your project to Biome in one command.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix:next-lint-migration ./src"
          description="Migrate from next lint to Biome. Auto-configures 4 npm scripts: lint, check, format, type-check."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            If you're on Next.js 15.5+, you'll see this deprecation warning:
          </p>
          
          <CodeBlock
            code={`⚠ "next lint" is deprecated and will be removed in Next.js 16.
  Please migrate to Biome or ESLint directly.
  See: https://nextjs.org/docs/app/building-your-application/migrating/eslint`}
            language="text"
            filename="Next.js Warning"
          />

          <p className="text-gray-300">
            On Next.js 16, <code className="text-orange-400">next lint</code> simply doesn't exist anymore. 
            Your CI pipelines will break if you don't migrate.
          </p>

          <Callout type="warning" title="Breaking Change in Next.js 16">
            <p>
              Next.js 16 completely removes the <code>next lint</code> command. 
              Projects that haven't migrated will fail on upgrade.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Community Discussion</h2>
          <p className="text-gray-300">
            This deprecation sparked a 2-year discussion with over 100 comments:
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <div className="flex items-start gap-4">
              <Github className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
              <div>
                <a 
                  href="https://github.com/vercel/next.js/discussions/59347"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white font-medium hover:text-blue-400 transition-colors flex items-center gap-2"
                >
                  Next.js Discussion #59347
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-gray-400 text-sm mt-1">
                  "Deprecating next lint and moving to external linters"
                </p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4" />
                    100+ comments
                  </span>
                  <span>2 year discussion</span>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Manual Migration vs NeuroLint</h2>
        </section>

        <CompetitorCompare
          competitorName="Manual"
          rows={[
            { feature: "Install Biome", competitor: "yes", competitorNote: "npm install", neurolint: "yes", neurolintNote: "Automatic" },
            { feature: "Configure biome.json", competitor: "yes", competitorNote: "Manual setup", neurolint: "yes" },
            { feature: "Update package.json scripts", competitor: "yes", competitorNote: "4 scripts to add", neurolint: "yes" },
            { feature: "Remove next lint config", competitor: "yes", competitorNote: "Manual cleanup", neurolint: "yes" },
            { feature: "Time to complete", competitor: "partial", competitorNote: "15-30 min", neurolint: "yes", neurolintNote: "< 1 min" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What NeuroLint Does</h2>
          <p className="text-gray-300">
            NeuroLint handles the complete migration automatically:
          </p>

          <ol className="list-decimal list-inside text-gray-300 space-y-2 my-4">
            <li><strong className="text-white">Installs Biome:</strong> Adds <code className="text-blue-400">@biomejs/biome</code> as a dev dependency</li>
            <li><strong className="text-white">Creates biome.json:</strong> Preconfigured for Next.js projects</li>
            <li><strong className="text-white">Updates package.json:</strong> Adds 4 scripts (lint, check, format, type-check)</li>
            <li><strong className="text-white">Cleans up:</strong> Removes old next lint configuration</li>
          </ol>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">New package.json Scripts</h3>
          <CodeBlock
            code={`{
  "scripts": {
    "lint": "biome lint .",
    "check": "biome check .",
    "format": "biome format --write .",
    "type-check": "tsc --noEmit"
  }
}`}
            language="json"
            filename="package.json"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Generated biome.json</h3>
          <CodeBlock
            code={`{
  "$schema": "https://biomejs.dev/schemas/1.9.0/schema.json",
  "organizeImports": { "enabled": true },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "useExhaustiveDependencies": "warn",
        "noUnusedImports": "error"
      }
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  }
}`}
            language="json"
            filename="biome.json"
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              The migration logic is implemented in <code>scripts/fix-layer-2-patterns.js</code> lines 367-386. 
              You can verify exactly what NeuroLint does before running it.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Migrate from next lint to Biome
npx @neurolint/cli fix:next-lint-migration ./src

# Preview changes without applying
npx @neurolint/cli fix:next-lint-migration ./src --dry-run`}
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
