import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, AlertCircle, Server, Laptop } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function RSCCommonErrors() {
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
            3,200/mo searches
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-widest">
            <span className="w-6 h-px bg-blue-500/30"></span>
            <Server className="w-3.5 h-3.5" />
            React Server Components
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Fix React Server Component Errors
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          RSC boundary violations cause cryptic errors. NeuroLint auto-adds 
          <code className="text-blue-400 mx-1">'use client'</code> directives and refactors
          client-only code to proper boundaries.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix:rsc-boundaries ./app"
          description="Auto-fix RSC boundary violations. Adds 'use client' directives and extracts client components."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            React Server Components have strict rules about what can run on the server vs client. 
            When you violate these boundaries, you get confusing errors:
          </p>
          
          <CodeBlock
            code={`Error: useState only works in Client Components. Add the "use client" directive 
at the top of the file to use it.

Error: Event handlers cannot be passed to Client Component props.

Error: Functions cannot be passed directly to Client Components unless you 
explicitly expose it by marking it with "use server".`}
            language="text"
            filename="RSC Errors"
          />

          <div className="bg-zinc-900 border border-black rounded-xl p-5 my-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <p className="text-white font-medium mb-1">Common RSC Violations</p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li>• Using <code className="text-blue-400">useState</code>/<code className="text-blue-400">useEffect</code> in Server Components</li>
                  <li>• Passing functions as props to Client Components</li>
                  <li>• Using browser APIs (<code className="text-blue-400">window</code>, <code className="text-blue-400">localStorage</code>) in Server Components</li>
                  <li>• Importing client-only libraries in Server Components</li>
                  <li>• Event handlers (<code className="text-blue-400">onClick</code>) in Server Components</li>
                </ul>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Existing Tools Only Detect</h2>
          <p className="text-gray-300">
            Next.js and ESLint plugins can detect RSC violations, but they don't auto-fix them:
          </p>
        </section>

        <CompetitorCompare
          competitorName="ESLint / Next.js"
          rows={[
            { feature: "Detect useState in Server Components", competitor: "yes", neurolint: "yes" },
            { feature: "Auto-add 'use client' directive", competitor: "no", neurolint: "yes" },
            { feature: "Extract client code to separate file", competitor: "no", neurolint: "yes" },
            { feature: "Preserve Server Component benefits", competitor: "partial", competitorNote: "Manual", neurolint: "yes" },
            { feature: "Handle mixed server/client logic", competitor: "no", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">How NeuroLint Fixes RSC Errors</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Strategy 1: Add 'use client' Directive</h3>
          <p className="text-gray-300">
            When a component uses only client features, NeuroLint adds the directive:
          </p>

          <CodeBlock
            code={`// Before: Error - useState in Server Component
import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}

// After: NeuroLint adds 'use client'
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}`}
            language="tsx"
            filename="Counter.tsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Strategy 2: Extract Client Components</h3>
          <p className="text-gray-300">
            When a Server Component has mixed logic, NeuroLint extracts client code:
          </p>

          <CodeBlock
            code={`// Before: Mixed server/client logic
import { getUser } from '@/lib/db';

export async function UserProfile() {
  const user = await getUser(); // Server-only
  const [isEditing, setIsEditing] = useState(false); // Client-only - ERROR
  
  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={() => setIsEditing(true)}>Edit</button>
    </div>
  );
}`}
            language="tsx"
            filename="UserProfile.tsx (Before)"
          />

          <p className="text-gray-300">NeuroLint splits this into two files:</p>

          <CodeBlock
            code={`// UserProfile.tsx (Server Component - keeps server logic)
import { getUser } from '@/lib/db';
import { EditButton } from './EditButton';

export async function UserProfile() {
  const user = await getUser();
  
  return (
    <div>
      <h1>{user.name}</h1>
      <EditButton />
    </div>
  );
}`}
            language="tsx"
            filename="UserProfile.tsx (After)"
          />

          <CodeBlock
            code={`// EditButton.tsx (Client Component - extracted)
'use client';

import { useState } from 'react';

export function EditButton() {
  const [isEditing, setIsEditing] = useState(false);
  return <button onClick={() => setIsEditing(true)}>Edit</button>;
}`}
            language="tsx"
            filename="EditButton.tsx (Extracted)"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">RSC Boundary Rules</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
            <div className="bg-zinc-900 border border-black rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Server className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-white">Server Components</span>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Can use async/await for data fetching</li>
                <li>Can access database directly</li>
                <li>Can access secrets/env vars</li>
                <li>Cannot use useState/useEffect</li>
                <li>Cannot use event handlers</li>
                <li>Cannot use browser APIs</li>
              </ul>
            </div>
            <div className="bg-zinc-900 border border-black rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Laptop className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-white">Client Components</span>
              </div>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>Can use useState/useEffect</li>
                <li>Can use event handlers (onClick, etc.)</li>
                <li>Can use browser APIs (window, etc.)</li>
                <li>Cannot be async component function</li>
                <li>Cannot import server-only code</li>
                <li>Ships more JS to client</li>
              </ul>
            </div>
          </div>

          <Callout type="info" title="Testing RSC Boundaries">
            <p>
              NeuroLint's Layer 6 (Testing) includes RSC boundary testing. It verifies that 
              Server Components don't accidentally import client-only code, preventing 
              runtime errors before deployment.
            </p>
          </Callout>

          <Callout type="success" title="Verified in Source Code">
            <p>
              The RSC boundary detection is implemented in <code>scripts/fix-layer-6-testing.js</code>.
              It uses AST analysis to identify client-only patterns and applies the appropriate fix strategy.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Fix RSC boundary violations
npx @neurolint/cli fix:rsc-boundaries ./app

# Preview changes without applying
npx @neurolint/cli fix:rsc-boundaries ./app --dry-run

# Extract client components to separate files
npx @neurolint/cli fix:rsc-boundaries ./app --extract-clients`}
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
              to="/fixes/nextjs-15-migration"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Next.js 15 Migration
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
