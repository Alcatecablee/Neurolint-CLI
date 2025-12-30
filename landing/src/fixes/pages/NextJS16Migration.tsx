import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, AlertCircle, GitBranch, CheckCircle2, ExternalLink } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function NextJS16Migration() {
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
          <ProblemBadge type="breaking" />
          <span className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <span className="w-6 h-px bg-purple-500/30"></span>
            <Search className="w-3.5 h-3.5" />
            4,400/mo searches
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
            <span className="w-6 h-px bg-amber-500/30"></span>
            Breaking Changes
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Next.js 16 Migration Guide
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          <a href="https://nextjs.org/blog/next-16" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Next.js 16</a> introduces async Request APIs and removes legacy patterns.
          NeuroLint auto-migrates your codebase with AST transformations.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli migrate:nextjs-16 ./src"
          description="Auto-migrate to Next.js 16 async APIs. Updates cookies(), headers(), params, and searchParams."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Breaking Changes in Next.js 16</h2>
          <p className="text-gray-300">
            Next.js 16 makes several <a href="https://nextjs.org/docs/app/building-your-application/data-fetching" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Request APIs</a> async that were previously synchronous. 
            This is a <strong className="text-white">breaking change</strong> that affects most apps:
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-medium mb-1">APIs Now Async in Next.js 16</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• <a href="https://nextjs.org/docs/app/api-reference/functions/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><code className="text-blue-400">cookies()</code></a> - Must await or use <code className="text-blue-400">React.use()</code></li>
                  <li>• <a href="https://nextjs.org/docs/app/api-reference/functions/headers" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300"><code className="text-blue-400">headers()</code></a> - Must await or use <code className="text-blue-400">React.use()</code></li>
                  <li>• <code className="text-blue-400">params</code> - Page/layout prop is now a Promise</li>
                  <li>• <code className="text-blue-400">searchParams</code> - Page prop is now a Promise</li>
                  <li>• <code className="text-blue-400">draftMode()</code> - Must await</li>
                </ul>
              </div>
            </div>
          </div>

          <CodeBlock
            code={`Error: Route "/dashboard/[id]" used \`params.id\`. \`params\` should be awaited 
before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`}
            language="text"
            filename="Next.js 16 Error"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Manual Migration is Tedious</h2>
          <p className="text-gray-300">
            Next.js provides a codemod, but it has significant limitations:
          </p>
        </section>

        <CompetitorCompare
          competitorName="Next.js Codemod"
          rows={[
            { feature: "Basic async/await conversion", competitor: "yes", neurolint: "yes" },
            { feature: "Handle complex destructuring", competitor: "partial", competitorNote: "Manual review needed", neurolint: "yes" },
            { feature: "Update TypeScript types", competitor: "no", neurolint: "yes" },
            { feature: "Preserve existing async functions", competitor: "partial", neurolint: "yes" },
            { feature: "Handle nested params usage", competitor: "no", neurolint: "yes" },
            { feature: "Rollback on error", competitor: "no", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">How NeuroLint Migrates</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">1. Async Route Params</h3>
          <p className="text-gray-300">Page and layout params are now Promises:</p>

          <CodeBlock
            code={`// Before (Next.js 15)
export default function Page({ params }: { params: { id: string } }) {
  return <div>ID: {params.id}</div>;
}

// After (Next.js 16) - NeuroLint auto-converts
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  return <div>ID: {id}</div>;
}`}
            language="tsx"
            filename="app/dashboard/[id]/page.tsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">2. Async cookies() and headers()</h3>
          <CodeBlock
            code={`// Before (Next.js 15)
import { cookies } from 'next/headers';

export default function Page() {
  const cookieStore = cookies();
  const token = cookieStore.get('token');
  return <div>Token: {token?.value}</div>;
}

// After (Next.js 16) - NeuroLint auto-converts
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token');
  return <div>Token: {token?.value}</div>;
}`}
            language="tsx"
            filename="app/dashboard/page.tsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">3. SearchParams Migration</h3>
          <CodeBlock
            code={`// Before (Next.js 15)
export default function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  return <div>Search: {searchParams.q}</div>;
}

// After (Next.js 16) - NeuroLint auto-converts
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <div>Search: {q}</div>;
}`}
            language="tsx"
            filename="app/search/page.tsx"
          />

          <Callout type="info" title="Client Components">
            <p>
              For Client Components that can't be async, NeuroLint uses <code>React.use()</code> 
              to unwrap the Promise synchronously. This maintains compatibility while following 
              Next.js 16 patterns.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Additional Next.js 16 Changes</h2>
          
          <div className="bg-zinc-900 border border-black rounded-xl overflow-hidden my-6">
            <table className="w-full text-sm">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">Change</th>
                  <th className="text-left px-4 py-3 text-gray-300 font-medium">NeuroLint Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                <tr>
                  <td className="px-4 py-3 text-gray-400">Async Request APIs</td>
                  <td className="px-4 py-3"><span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Auto-converts</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400">TypeScript type updates</td>
                  <td className="px-4 py-3"><span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Auto-updates</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400">Runtime changes (default dynamic)</td>
                  <td className="px-4 py-3"><span className="text-green-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Adds config</span></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-gray-400">Caching behavior changes</td>
                  <td className="px-4 py-3"><span className="text-amber-400">Reports for review</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <Callout type="success" title="Verified in Source Code">
            <p>
              The Next.js 16 migration logic is implemented in <code>scripts/fix-layer-5-nextjs.js</code>.
              It uses AST traversal to find all usages of async APIs and transforms them appropriately.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Migrate to Next.js 16 async APIs
npx @neurolint/cli migrate:nextjs-16 ./app

# Preview changes without applying
npx @neurolint/cli migrate:nextjs-16 ./app --dry-run

# Also update TypeScript types
npx @neurolint/cli migrate:nextjs-16 ./app --update-types`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Official Next.js Resources</h2>
          <div className="bg-zinc-900/50 border border-black rounded-xl p-6 mb-8">
            <p className="text-gray-300 mb-4">Consult official Next.js documentation for complete upgrade details:</p>
            <div className="space-y-3">
              <a href="https://nextjs.org/blog/next-16" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <ExternalLink className="w-4 h-4" />
                Next.js 16 Release Notes
              </a>
              <a href="https://nextjs.org/docs/app/building-your-application/upgrading/version-16" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <ExternalLink className="w-4 h-4" />
                Next.js 16 Upgrade Guide
              </a>
              <a href="https://nextjs.org/docs/app/api-reference/functions/cookies" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <ExternalLink className="w-4 h-4" />
                cookies() Function Documentation
              </a>
              <a href="https://nextjs.org/docs/app/api-reference/functions/headers" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <ExternalLink className="w-4 h-4" />
                headers() Function Documentation
              </a>
              <a href="https://nextjs.org/docs/app/building-your-application/data-fetching" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                <ExternalLink className="w-4 h-4" />
                Request Lifecycle & APIs
              </a>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/next-lint-deprecated"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              next lint deprecated migration
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
