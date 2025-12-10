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

export function DocsLayerPatterns() {
  return (
    <DocsLayout
      title="Layer 2: Patterns"
      description="Fixes common code patterns and anti-patterns. Handles React 19 breaking changes like Legacy Context and createFactory removal."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Removes console.log, alert, confirm, prompt statements with AST-based transformations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Handles console.log in arrow functions correctly (preserves valid syntax)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Fixes corrupted HTML entities (&amp;quot;, &amp;amp;, &amp;lt;, &amp;gt;)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Converts React.createFactory to JSX (React 19)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Detects Legacy Context usage (removed in React 19)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Migrates from next/legacy/image to next/image</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint patterns scan ./src" />
        <CommandBlock command="neurolint patterns fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=2 --verbose" />
        <CommandBlock command="neurolint fix ./src --layers=2 --dry-run" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">React 19: createFactory Migration</h2>
        
        <BeforeAfter
          filename="factories.js"
          before={{
            label: "Before (deprecated)",
            code: `import React from 'react';
const divFactory = React.createFactory('div');
const buttonFactory = createFactory('button');`
          }}
          after={{
            label: "After (modern JSX)",
            code: `import React from 'react';
const divFactory = (props) => <div {...props} />;
const buttonFactory = (props) => <button {...props} />;`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          React.createFactory is removed in React 19. This converts factory functions 
          to modern JSX components.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Console Statement Cleanup</h2>
        
        <BeforeAfter
          filename="handlers.js"
          before={{
            label: "Before",
            code: `const handler = () => console.log('test');
const logger = value => console.log(value);
function handleClick() {
  console.log('Button clicked');
  alert('Success!');
}`
          }}
          after={{
            label: "After",
            code: `const handler = () => {};
const logger = value => {};
function handleClick() {
  // [NeuroLint] Removed console.log
  // [NeuroLint] Replace with toast notification
}`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          AST-based transformations correctly handle console.log in arrow functions, 
          preserving valid JavaScript syntax. All arrow function patterns work: no params, 
          single param, multi-param, destructured params.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">React 19 Specific</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">createFactory removal</h3>
            <p className="text-sm text-gray-400">Converts React.createFactory('div') to JSX components</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Legacy Context detection</h3>
            <p className="text-sm text-gray-400">Detects contextTypes and getChildContext (removed in React 19)</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Module pattern factories</h3>
            <p className="text-sm text-gray-400">Warns about module pattern factories (no longer supported)</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Context migration</h3>
            <p className="text-sm text-gray-400">Suggests migration to React.createContext() and useContext()</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 2 after Layer 1. Essential for:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>React 19 migration preparation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Cleaning up legacy code patterns before component fixes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Removing debug statements before production</span>
          </li>
        </ul>

        <Callout type="info" title="Technical details">
          Uses @babel/parser with JSX and TypeScript plugins. Console.log removal uses 
          AST-based CallExpression visitor with context detection. Arrow functions are 
          converted to empty blocks with comments. Standalone statements become 
          EmptyStatements with leading comments.
        </Callout>
      </section>
    </DocsLayout>
  );
}
