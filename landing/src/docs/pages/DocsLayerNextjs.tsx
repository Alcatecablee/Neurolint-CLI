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
import { DocsLayout, CommandBlock, Callout, BeforeAfter } from "../components";

export function DocsLayerNextjs() {
  return (
    <DocsLayout
      title="Layer 5: Next.js"
      description="Optimizes Next.js 15.5 App Router usage with proper directives, React 19 DOM API migrations, and type-safe routing."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds 'use client' directives for interactive components</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Converts ReactDOM.render to createRoot (React 19)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Converts ReactDOM.hydrate to hydrateRoot (React 19)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Migrates from react-dom/test-utils to react (act import)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Implements type-safe routing with TypeScript interfaces</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Detects findDOMNode usage (removed in React 19)</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint nextjs scan ./src" />
        <CommandBlock command="neurolint nextjs fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=5 --verbose" />
        <CommandBlock command="neurolint fix ./src --layers=5 --dry-run" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">createRoot Migration</h2>
        
        <BeforeAfter
          filename="index.tsx"
          before={{
            label: "React 18 (ReactDOM.render)",
            code: `import ReactDOM from 'react-dom';

ReactDOM.render(
  <App />,
  document.getElementById('root')
);`
          }}
          after={{
            label: "React 19 (createRoot)",
            code: `import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

const root = createRoot(document.getElementById('root'));
root.render(<App />);`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          React 19 removes ReactDOM.render. The new createRoot API enables concurrent 
          features and better error handling. Multiple ReactDOM.render calls generate 
          unique variable names (root, root1, root2).
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">'use client' Directive</h2>
        
        <BeforeAfter
          filename="Counter.tsx"
          before={{
            label: "Before (missing directive)",
            code: `import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}`
          }}
          after={{
            label: "After (Client Component)",
            code: `'use client';

import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Components using hooks, event handlers, or browser APIs must be marked as 
          Client Components in Next.js App Router.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">React 19 Specific</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">ReactDOM.render migration</h3>
            <p className="text-sm text-gray-400">Converts to createRoot with unique variable names</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">ReactDOM.hydrate migration</h3>
            <p className="text-sm text-gray-400">Converts to hydrateRoot with correct parameter order</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">act() import migration</h3>
            <p className="text-sm text-gray-400">Moves act from react-dom/test-utils to react</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">findDOMNode detection</h3>
            <p className="text-sm text-gray-400">Detects removed API and suggests useRef</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 5 after Layer 4. Critical for:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Next.js 15.5 App Router projects</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>React 19 DOM API migration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Adding 'use client' directives to interactive components</span>
          </li>
        </ul>

        <Callout type="info" title="Technical details">
          AST-based transformation using @babel/parser. Detects React hooks, event 
          handlers, and browser API usage to determine Client Component requirements. 
          Implements TypeSafeRoutingTransformer for route params.
        </Callout>
      </section>
    </DocsLayout>
  );
}
