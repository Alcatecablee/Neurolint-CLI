/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout, BeforeAfter } from "../components";

export function DocsCommandMigrateNextjs16() {
  return (
    <DocsLayout
      title="migrate-nextjs-16"
      description="Migrate your project to Next.js 16 compatibility. Handles middleware changes, caching updates, and async API migrations."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <CodeBlock
          language="bash"
          code={`neurolint migrate-nextjs-16 <path> [options]`}
        />

        <div className="mt-6 space-y-4">
          <CommandBlock command="neurolint migrate-nextjs-16 . --dry-run --verbose" />
          <CommandBlock command="neurolint migrate-nextjs-16 . --verbose" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Migrates</h2>
        
        <div className="space-y-3 text-sm">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Middleware to Proxy</h3>
            <p className="text-gray-400">Renames middleware.ts to proxy.ts and updates function exports.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">PPR to Cache Components</h3>
            <p className="text-gray-400">Migrates experimental.ppr to the new Cache Components pattern.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Async params</h3>
            <p className="text-gray-400">Converts sync params to async: {"({ params })"} to async (props) with await.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">cookies() and headers()</h3>
            <p className="text-gray-400">Adds await to cookies() and headers() calls (now async in Next.js 16).</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">'use cache' directives</h3>
            <p className="text-gray-400">Adds 'use cache' directives to Server Components for explicit caching.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Cache management</h3>
            <p className="text-gray-400">Integrates cacheLife and updateTag() for cache management.</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Examples</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">Async Params Migration</h3>
        <BeforeAfter
          filename="page.tsx"
          before={{
            label: "Next.js 15 (sync params)",
            code: `export default function Page({ params }) {
  const { slug } = params;
  return <div>{slug}</div>;
}`
          }}
          after={{
            label: "Next.js 16 (async params)",
            code: `export default async function Page(props) {
  const params = await props.params;
  const { slug } = params;
  return <div>{slug}</div>;
}`
          }}
        />

        <h3 className="text-lg font-medium text-white mt-8 mb-3">Async cookies()</h3>
        <BeforeAfter
          filename="layout.tsx"
          before={{
            label: "Next.js 15",
            code: `import { cookies } from 'next/headers';

export default function Layout() {
  const cookieStore = cookies();
  const theme = cookieStore.get('theme');
  return <div className={theme}>{children}</div>;
}`
          }}
          after={{
            label: "Next.js 16",
            code: `import { cookies } from 'next/headers';

export default async function Layout() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme');
  return <div className={theme}>{children}</div>;
}`
          }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Migration Workflow</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">1</div>
            <div>
              <h3 className="font-medium text-white">Backup your project</h3>
              <CommandBlock command="git commit -am 'Pre Next.js 16 migration'" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">2</div>
            <div>
              <h3 className="font-medium text-white">Analyze router complexity</h3>
              <CommandBlock command="neurolint assess-router . --verbose" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">3</div>
            <div>
              <h3 className="font-medium text-white">Check Turbopack readiness</h3>
              <CommandBlock command="neurolint check-turbopack ." />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">4</div>
            <div>
              <h3 className="font-medium text-white">Preview migration</h3>
              <CommandBlock command="neurolint migrate-nextjs-16 . --dry-run --verbose" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">5</div>
            <div>
              <h3 className="font-medium text-white">Apply migration</h3>
              <CommandBlock command="neurolint migrate-nextjs-16 . --verbose" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">6</div>
            <div>
              <h3 className="font-medium text-white">Update Next.js</h3>
              <CommandBlock command="npm install next@16" />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Migration Notes</h2>
        
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Middleware logic remains the same, only file renamed to proxy.ts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>PPR becomes Cache Components (auto-handled)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>All async APIs (cookies, headers, params) require await</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Caching is now explicit with 'use cache' directive</span>
          </li>
        </ul>

        <Callout type="info" title="Turbopack recommended">
          Next.js 16 works best with Turbopack. Run check-turbopack to assess compatibility.
        </Callout>
      </section>
    </DocsLayout>
  );
}
