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
import { Link } from "react-router-dom";

export function DocsCommandMigrateReact19() {
  return (
    <DocsLayout
      title="React 19 Migration Tool: Fix Breaking Changes Automatically"
      description="Automatically fix React 19 breaking changes. Migrates ReactDOM.render to createRoot, updates act() imports, and handles deprecated APIs. The fastest way to upgrade from React 18 to 19."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <CodeBlock
          language="bash"
          code={`neurolint migrate-react19 <path> [options]`}
        />

        <div className="mt-6 space-y-4">
          <CommandBlock command="neurolint migrate-react19 . --dry-run --verbose" />
          <CommandBlock command="neurolint migrate-react19 . --verbose" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Migrates</h2>
        
        <div className="space-y-3 text-sm">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">forwardRef to direct ref props</h3>
            <p className="text-gray-400">React 19 allows ref as a regular prop, eliminating the need for forwardRef wrapper.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">String refs to callback refs</h3>
            <p className="text-gray-400">Converts deprecated string refs to modern callback ref pattern.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">ReactDOM.render to createRoot</h3>
            <p className="text-gray-400">Migrates legacy render API to new concurrent-safe createRoot.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">ReactDOM.hydrate to hydrateRoot</h3>
            <p className="text-gray-400">Updates SSR hydration to new API with correct parameter order.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">react-dom/test-utils imports</h3>
            <p className="text-gray-400">Moves act import from react-dom/test-utils to react.</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Legacy Context detection</h3>
            <p className="text-gray-400">Detects contextTypes and getChildContext usage (removed in React 19).</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Examples</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">forwardRef Migration</h3>
        <BeforeAfter
          filename="Input.tsx"
          before={{
            label: "React 18 (with forwardRef)",
            code: `const Input = forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    return <input ref={ref} {...props} />;
  }
);`
          }}
          after={{
            label: "React 19 (direct ref prop)",
            code: `const Input = ({ ref, ...props }: Props) => {
  return <input ref={ref} {...props} />;
};`
          }}
        />

        <h3 className="text-lg font-medium text-white mt-8 mb-3">createRoot Migration</h3>
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
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Migration Workflow</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">1</div>
            <div>
              <h3 className="font-medium text-white">Analyze current state</h3>
              <CommandBlock command="neurolint analyze . --verbose" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">2</div>
            <div>
              <h3 className="font-medium text-white">Check dependency compatibility</h3>
              <CommandBlock command="neurolint check-deps . --fix" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">3</div>
            <div>
              <h3 className="font-medium text-white">Preview migration changes</h3>
              <CommandBlock command="neurolint migrate-react19 . --dry-run --verbose" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">4</div>
            <div>
              <h3 className="font-medium text-white">Apply migration</h3>
              <CommandBlock command="neurolint migrate-react19 . --verbose" />
            </div>
          </div>
          <div className="flex gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 flex items-center justify-center bg-zinc-800 rounded font-mono text-sm text-gray-400">5</div>
            <div>
              <h3 className="font-medium text-white">Update dependencies</h3>
              <CommandBlock command="npm install react@19 react-dom@19" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Post-Migration Checklist</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>All tests passing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>No console warnings in browser</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Server-side rendering works</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Type checking passes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Performance benchmarks stable</span>
          </li>
        </ul>

        <Callout type="warning" title="Manual review needed">
          Some changes require manual review: PropTypes to TypeScript migration, 
          legacy context API usage, and unmountComponentAtNode calls.
        </Callout>
      </section>
    </DocsLayout>
  );
}
