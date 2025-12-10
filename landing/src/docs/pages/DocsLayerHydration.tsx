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

export function DocsLayerHydration() {
  return (
    <DocsLayout
      title="Layer 4: Fix React Hydration Errors Automatically"
      description="Automatically fix 'window is not defined' and hydration mismatch errors in React & Next.js. Adds SSR-safe guards for browser APIs like localStorage, document, and window."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds typeof window !== 'undefined' guards for browser globals</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Wraps localStorage/sessionStorage access in SSR checks</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Implements automatic addEventListener cleanup with removeEventListener</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds typeof document !== 'undefined' guards for DOM access</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Prevents 'ReferenceError: window/document is not defined' in SSR</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint hydration scan ./src" />
        <CommandBlock command="neurolint hydration fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=4 --verbose" />
        <CommandBlock command="neurolint fix ./src --layers=4 --dry-run" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">LocalStorage SSR Guard</h2>
        
        <BeforeAfter
          filename="ThemeProvider.tsx"
          before={{
            label: "Before (causes SSR error)",
            code: `function ThemeProvider() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 'light'
  );
  return <div className={\`theme-\${theme}\`}>...</div>;
}`
          }}
          after={{
            label: "After (SSR-safe)",
            code: `function ThemeProvider() {
  const [theme, setTheme] = useState(
    (typeof window !== "undefined" 
      ? localStorage.getItem('theme') 
      : null) || 'light'
  );
  return <div className={\`theme-\${theme}\`}>...</div>;
}`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Wraps localStorage access in typeof window check to prevent server-side ReferenceError. 
          Falls back to null if window is undefined, then || operator uses 'light' default.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Event Listener Cleanup</h2>
        
        <BeforeAfter
          filename="useWindowSize.ts"
          before={{
            label: "Before (memory leak)",
            code: `useEffect(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
}, []);`
          }}
          after={{
            label: "After (proper cleanup)",
            code: `useEffect(() => {
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
  return () => {
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('scroll', handleScroll);
  };
}, []);`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Automatically generates cleanup function with removeEventListener for all 
          addEventListener calls in useEffect, preventing memory leaks.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Automatic typeof guards</h3>
            <p className="text-sm text-gray-400">Wraps window, document, localStorage, sessionStorage access</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">useEffect cleanup</h3>
            <p className="text-sm text-gray-400">Generates return functions for event listeners</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Nested property handling</h3>
            <p className="text-sm text-gray-400">Handles deep access like window.navigator.geolocation</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Smart detection</h3>
            <p className="text-sm text-gray-400">Skips already guarded code to avoid double-wrapping</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 4 after Layer 3. Essential for:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>All Next.js projects with SSR/SSG</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Fixing "window is not defined" errors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Components using localStorage, sessionStorage, or window APIs</span>
          </li>
        </ul>

        <Callout type="info" title="Technical details">
          AST-based transformations using @babel/parser and @babel/traverse. Uses strict 
          guard detection for exact 'typeof global !== "undefined"' patterns. Handles 
          deeply nested member expressions via getRootGlobalName() helper.
        </Callout>
      </section>
    </DocsLayout>
  );
}
