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

export function DocsLayerTesting() {
  return (
    <DocsLayout
      title="Layer 6: Testing"
      description="Enhances testing infrastructure with proper imports, improved descriptions, and guidance for React Server Components."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds missing @testing-library/react imports</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Improves test descriptions for clarity</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds accessibility testing suggestions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Provides RSC (React Server Components) testing guidance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Warns about MSW compatibility issues with App Router</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Generates test file scaffolding</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint testing scan ./src" />
        <CommandBlock command="neurolint testing fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=6 --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Generate test scaffolding:</p>
        <CommandBlock command="neurolint init-tests ./src/components/" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Server Component Testing</h2>
        
        <BeforeAfter
          filename="ServerComponent.test.tsx"
          before={{
            label: "Before",
            code: `import { render, screen } from '@testing-library/react';

test('renders', () => {
  render(<ServerComponent />);
});`
          }}
          after={{
            label: "After (with guidance)",
            code: `// WARNING: React Server Component Testing:
// - Use integration tests (Playwright/Cypress)
// - Or mock fetch/database calls and test business logic
// - Server Components cannot use traditional React testing

import { render, screen } from '@testing-library/react';

test('renders', () => {
  render(<ServerComponent />);
});`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Server Components are server-only and cannot be tested with traditional 
          React testing tools. Integration tests are recommended.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Testing Library Improvements</h2>
        
        <BeforeAfter
          filename="Button.test.tsx"
          before={{
            label: "Before",
            code: `test('test', () => {
  render(<Button />);
});`
          }}
          after={{
            label: "After",
            code: `import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

test('Button should render correctly', () => {
  render(<Button />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});`
          }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Import injection</h3>
            <p className="text-sm text-gray-400">Automatic testing library import injection</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Description enhancement</h3>
            <p className="text-sm text-gray-400">Improves test descriptions for clarity</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">RSC testing</h3>
            <p className="text-sm text-gray-400">Provides best practices for Server Components</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Config generation</h3>
            <p className="text-sm text-gray-400">Jest/Vitest configuration generation</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 6 after Layer 5. Essential for:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Projects needing comprehensive test coverage</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Teams new to Server Components testing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Adding error boundaries and test scaffolding</span>
          </li>
        </ul>

        <Callout type="warning" title="MSW compatibility">
          MSW Edge Runtime has compatibility issues with App Router. Layer 6 suggests 
          fetch mocking alternatives for Server Components.
        </Callout>
      </section>
    </DocsLayout>
  );
}
