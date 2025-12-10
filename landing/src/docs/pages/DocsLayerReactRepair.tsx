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

export function DocsLayerReactRepair() {
  return (
    <DocsLayout
      title="Layer 3: Components"
      description="Enhances React component quality with accessibility improvements, missing key props, and React 19 ref modernization."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds missing key props in .map() iterations</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Converts forwardRef to direct ref props (React 19)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds aria-label to buttons and interactive elements</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds alt text to images for WCAG 2.1 AA compliance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Fixes string refs to callback/useRef pattern</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Warns about PropTypes (deprecated in React 19)</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint components scan ./src" />
        <CommandBlock command="neurolint components fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=3 --verbose" />
        <CommandBlock command="neurolint fix ./src --layers=3 --dry-run" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">forwardRef Modernization</h2>
        
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

        <p className="text-gray-400 text-sm mt-4">
          React 19 allows ref as a regular prop, eliminating the need for forwardRef wrapper.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Accessibility and Key Props</h2>
        
        <BeforeAfter
          filename="TodoList.tsx"
          before={{
            label: "Before (accessibility issues)",
            code: `function TodoList({ todos }) {
  return (
    <div>
      {todos.map(todo => (
        <div>
          <button onClick={() => delete(todo)}>
            <svg>...</svg>
          </button>
        </div>
      ))}
    </div>
  );
}`
          }}
          after={{
            label: "After (accessible)",
            code: `function TodoList({ todos }) {
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <button 
            aria-label="Delete todo"
            onClick={() => delete(todo)}
          >
            <svg>...</svg>
          </button>
        </div>
      ))}
    </div>
  );
}`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Adds key props to prevent React warnings and aria-label for screen reader accessibility.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">WCAG 2.1 AA Compliance</h3>
            <p className="text-sm text-gray-400">Adds alt text, aria-labels, and other accessibility attributes</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">React 19 Ref Pattern</h3>
            <p className="text-sm text-gray-400">Converts forwardRef to direct ref prop access</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">String Ref Migration</h3>
            <p className="text-sm text-gray-400">Transforms string refs to callback refs</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">PropTypes Warnings</h3>
            <p className="text-sm text-gray-400">Suggests TypeScript types over PropTypes</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 3 after Layer 2. Critical for:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>React 19 upgrades (ref pattern changes)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Accessibility compliance (WCAG 2.1 AA)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Fixing React warnings about missing keys</span>
          </li>
        </ul>

        <Callout type="info" title="Technical details">
          Combines AST transformation with regex fallbacks. Uses ASTTransformer class 
          for component analysis and modification. Detects component patterns and applies 
          accessibility rules.
        </Callout>
      </section>
    </DocsLayout>
  );
}
