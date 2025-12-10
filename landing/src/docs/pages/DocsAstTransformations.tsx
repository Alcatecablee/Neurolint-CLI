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
import { DocsLayout, CodeBlock, Callout, BeforeAfter } from "../components";

export function DocsAstTransformations() {
  return (
    <DocsLayout
      title="AST Transformations"
      description="Understanding how NeuroLint uses Abstract Syntax Tree parsing to safely transform your code."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What is an AST?</h2>
        
        <p className="text-gray-300 mb-6">
          An Abstract Syntax Tree (AST) is a tree representation of the syntactic structure 
          of source code. Each node in the tree represents a construct in the code.
        </p>

        <CodeBlock
          language="javascript"
          filename="example.js"
          code={`const greeting = "hello";`}
        />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          This simple code becomes an AST with nodes for:
        </p>

        <CodeBlock
          language="json"
          code={`{
  "type": "VariableDeclaration",
  "kind": "const",
  "declarations": [{
    "type": "VariableDeclarator",
    "id": { "type": "Identifier", "name": "greeting" },
    "init": { "type": "StringLiteral", "value": "hello" }
  }]
}`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How NeuroLint Uses AST</h2>
        
        <p className="text-gray-300 mb-6">
          NeuroLint uses Babel's parser and traverse utilities to analyze and modify AST nodes:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">@babel/parser</h3>
            <p className="text-sm text-gray-400">
              Parses JavaScript/TypeScript/JSX into AST with full support for modern syntax.
            </p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">@babel/traverse</h3>
            <p className="text-sm text-gray-400">
              Traverses the AST tree and allows us to visit specific node types 
              (e.g., all CallExpressions or JSXElements).
            </p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">@babel/types</h3>
            <p className="text-sm text-gray-400">
              Provides utilities to check node types and create new AST nodes safely.
            </p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">@babel/generator</h3>
            <p className="text-sm text-gray-400">
              Converts the modified AST back into code while preserving formatting.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Transformation</h2>
        
        <p className="text-gray-300 mb-4">
          Here's how Layer 4 wraps localStorage access with SSR guards:
        </p>

        <BeforeAfter
          filename="theme.ts"
          before={{
            label: "Original code",
            code: `const theme = localStorage.getItem('theme');`
          }}
          after={{
            label: "After Layer 4",
            code: `const theme = (typeof window !== "undefined" 
  ? localStorage.getItem('theme') 
  : null);`
          }}
        />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          The transformation process:
        </p>

        <ol className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-gray-600">1.</span>
            <span>Traverse finds CallExpression with callee <code className="text-gray-300 bg-zinc-800 px-1 rounded">localStorage.getItem</code></span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">2.</span>
            <span>Check if it's already guarded (skip if so)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">3.</span>
            <span>Create conditional expression: typeof window !== "undefined" ? original : null</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">4.</span>
            <span>Replace the original node with the conditional</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">5.</span>
            <span>Generate code from modified AST</span>
          </li>
        </ol>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Visitor Pattern</h2>
        
        <p className="text-gray-300 mb-4">
          NeuroLint uses the visitor pattern to process specific node types:
        </p>

        <CodeBlock
          language="javascript"
          code={`traverse(ast, {
  // Visit all function calls
  CallExpression(path) {
    if (isConsoleLog(path.node)) {
      // Transform or remove
    }
  },
  
  // Visit all JSX elements
  JSXElement(path) {
    if (isMapCallback(path) && !hasKeyProp(path)) {
      addKeyProp(path);
    }
  },
  
  // Visit specific identifiers
  Identifier(path) {
    if (path.node.name === 'window') {
      wrapWithSSRCheck(path);
    }
  }
});`}
        />

        <Callout type="info" title="Path vs Node">
          A "path" wraps a node and provides context like parent, scope, and 
          methods to modify the tree. Always work with paths, not raw nodes.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Edge Case Handling</h2>
        
        <p className="text-gray-300 mb-4">
          AST transformations handle complex edge cases that regex would break:
        </p>

        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Arrow function bodies</h3>
            <p className="text-sm text-gray-400 mb-2">
              When removing console.log from an arrow function, we can't just delete it:
            </p>
            <CodeBlock
              language="javascript"
              code={`// Before: const fn = () => console.log('x');
// Wrong:  const fn = () => ;  // Syntax error!
// Right:  const fn = () => {} // Empty block`}
            />
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Nested member expressions</h3>
            <p className="text-sm text-gray-400 mb-2">
              Deep property access needs the root object guarded:
            </p>
            <CodeBlock
              language="javascript"
              code={`// window.navigator.geolocation.watchPosition
// Must guard 'window', not the inner properties`}
            />
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Already guarded code</h3>
            <p className="text-sm text-gray-400 mb-2">
              Skip transformations when code is already safe:
            </p>
            <CodeBlock
              language="javascript"
              code={`// Already has guard - don't double-wrap
if (typeof window !== 'undefined') {
  localStorage.getItem('x');
}`}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Why Not Just Use ESLint?</h2>
        
        <p className="text-gray-300 mb-4">
          ESLint is great for linting but has limitations for transformations:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Feature</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">ESLint</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">NeuroLint</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Complex transformations</td>
                <td className="py-3 px-4 text-gray-400">Limited (simple fixes only)</td>
                <td className="py-3 px-4 text-gray-300">Full AST rewriting</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Multi-file changes</td>
                <td className="py-3 px-4 text-gray-400">No</td>
                <td className="py-3 px-4 text-gray-300">Yes (imports, configs)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Migration support</td>
                <td className="py-3 px-4 text-gray-400">No</td>
                <td className="py-3 px-4 text-gray-300">React 19, Next.js 16</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Backup system</td>
                <td className="py-3 px-4 text-gray-400">No</td>
                <td className="py-3 px-4 text-gray-300">Automatic with restore</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </DocsLayout>
  );
}
