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
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Automatic typeof guards</h3>
            <p className="text-sm text-gray-400">Wraps window, document, localStorage, sessionStorage access</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">useEffect cleanup</h3>
            <p className="text-sm text-gray-400">Generates return functions for event listeners</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Nested property handling</h3>
            <p className="text-sm text-gray-400">Handles deep access like window.navigator.geolocation</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-black rounded-lg">
            <h3 className="font-medium text-white mb-1">Smart detection</h3>
            <p className="text-sm text-gray-400">Skips already guarded code to avoid double-wrapping</p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">More Examples</h2>
        
        <h3 className="text-lg font-semibold text-white mb-4 mt-6">DOM Query SSR Guard</h3>
        <BeforeAfter
          filename="Modal.tsx"
          before={{
            label: "Before (SSR error)",
            code: `function Modal({ isOpen }) {
  useEffect(() => {
    const backdrop = document.querySelector('[role="dialog"]');
    backdrop?.addEventListener('click', close);
  }, []);
  return <div role="dialog">...</div>;
}`
          }}
          after={{
            label: "After (SSR-safe)",
            code: `function Modal({ isOpen }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const backdrop = document.querySelector('[role="dialog"]');
      backdrop?.addEventListener('click', close);
    }
  }, []);
  return <div role="dialog">...</div>;
}`
          }}
        />
        <p className="text-gray-400 text-sm mt-4">
          Wraps DOM queries in typeof document check. Layer 4 detects document.querySelector, 
          getElementById, getElementsByClassName and automatically guards them.
        </p>

        <h3 className="text-lg font-semibold text-white mb-4 mt-6">Window Navigation SSR Guard</h3>
        <BeforeAfter
          filename="Redirect.tsx"
          before={{
            label: "Before (causes error)",
            code: `function Redirect() {
  useEffect(() => {
    window.location.href = '/dashboard';
  }, [user]);
}`
          }}
          after={{
            label: "After (SSR-safe)",
            code: `function Redirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.href = '/dashboard';
    }
  }, [user]);
}`
          }}
        />
        <p className="text-gray-400 text-sm mt-4">
          window.location, window.history, and window.navigator are read/write operations. 
          Layer 4 wraps assignments in if-statements for safety.
        </p>

        <h3 className="text-lg font-semibold text-white mb-4 mt-6">Nested Browser API Access</h3>
        <BeforeAfter
          filename="GeoLocation.tsx"
          before={{
            label: "Before (nested API)",
            code: `function UserLocation() {
  const [coords, setCoords] = useState(null);
  
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      pos => setCoords(pos.coords)
    );
  }, []);
}`
          }}
          after={{
            label: "After (guarded)",
            code: `function UserLocation() {
  const [coords, setCoords] = useState(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords(pos.coords)
      );
    }
  }, []);
}`
          }}
        />
        <p className="text-gray-400 text-sm mt-4">
          Layer 4 handles deeply nested APIs like window.navigator.geolocation, 
          window.matchMedia, and window.localStorage.getItem(). Wraps at the statement level.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Complete API Coverage</h2>
        
        <h3 className="text-base font-medium text-white mb-3">Window APIs (7 Protected)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-300">API</th>
                <th className="text-left py-2 px-3 text-gray-300">Type</th>
                <th className="text-left py-2 px-3 text-gray-300">Guard Style</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">window.matchMedia</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-blue-400">Ternary</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">window.location</td>
                <td className="py-2 px-3">Read/Write</td>
                <td className="py-2 px-3 text-blue-400">If-statement</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">window.navigator</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-blue-400">Ternary</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">window.innerWidth</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-blue-400">Ternary</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">window.innerHeight</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-blue-400">Ternary</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">window.scrollY / scrollX</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-blue-400">Ternary</td>
              </tr>
              <tr>
                <td className="py-2 px-3">window.addEventListener</td>
                <td className="py-2 px-3">Write</td>
                <td className="py-2 px-3 text-blue-400">If-statement + cleanup</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-medium text-white mb-3">Document APIs (8 Protected)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-300">API</th>
                <th className="text-left py-2 px-3 text-gray-300">Type</th>
                <th className="text-left py-2 px-3 text-gray-300">Example</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.querySelector</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">$('.modal')</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.querySelectorAll</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">$$('[role]')</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.getElementById</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">$('#root')</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.getElementsByClassName</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">$$('.item')</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.getElementsByTagName</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">$$('button')</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.body</td>
                <td className="py-2 px-3">Read/Write</td>
                <td className="py-2 px-3 text-gray-500">document.body.innerHTML</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">document.documentElement</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">document.documentElement.style</td>
              </tr>
              <tr>
                <td className="py-2 px-3">document.head</td>
                <td className="py-2 px-3">Read</td>
                <td className="py-2 px-3 text-gray-500">document.head.appendChild</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-base font-medium text-white mb-3">Storage APIs (4 Protected)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm text-gray-400">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 px-3 text-gray-300">API</th>
                <th className="text-left py-2 px-3 text-gray-300">Methods</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">localStorage</td>
                <td className="py-2 px-3">getItem, setItem, removeItem, clear</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">sessionStorage</td>
                <td className="py-2 px-3">getItem, setItem, removeItem, clear</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-2 px-3">navigator.geolocation</td>
                <td className="py-2 px-3">getCurrentPosition, watchPosition</td>
              </tr>
              <tr>
                <td className="py-2 px-3">window.indexedDB</td>
                <td className="py-2 px-3">open, deleteDatabase</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">How It Works: Dual-Mode Approach</h2>
        
        <h3 className="text-base font-medium text-white mb-3">Primary: AST Transformation</h3>
        <p className="text-gray-400 text-sm mb-4">
          Layer 4 uses Babel's AST parser with TypeScript and JSX support to understand code structure:
        </p>
        <div className="bg-zinc-900/50 border border-black rounded-lg p-4 mb-4">
          <p className="text-gray-300 text-sm mb-3 font-mono">
            parser.parse(code, &#123;
            <br/>
            {'  '}sourceType: 'module',
            <br/>
            {'  '}plugins: ['typescript', 'jsx'],
            <br/>
            {'  '}allowImportExportEverywhere: true
            <br/>
            &#125;)
          </p>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          This allows Layer 4 to understand complex patterns that regex can't handle:
          window.matchMedia('(prefers-color-scheme: dark)').matches, nested properties, 
          and context-aware wrapping decisions.
        </p>

        <h3 className="text-base font-medium text-white mb-3">Fallback: Regex Transformation</h3>
        <p className="text-gray-400 text-sm mb-4">
          If AST parsing fails (malformed code, edge cases), Layer 4 doesn't crash. 
          It automatically falls back to regex patterns:
        </p>
        <div className="bg-zinc-900/50 border border-black rounded-lg p-4 mb-4">
          <p className="text-gray-300 text-sm font-mono mb-2">/localStorage\.(getItem|setItem|removeItem)\s*\(/g</p>
          <p className="text-gray-300 text-sm font-mono mb-2">/window\.(location|navigator|innerWidth|innerHeight)\b/g</p>
          <p className="text-gray-300 text-sm font-mono">/document\.(querySelector|getElementById|body)\b/g</p>
        </div>
        <p className="text-gray-400 text-sm">
          After any transformation, Layer 4 validates the output syntax. If the result 
          is invalid JavaScript, it rejects the change and returns the original code. 
          This ensures your build never breaks.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Smart Guard Detection</h2>
        
        <p className="text-gray-400 text-sm mb-4">
          Layer 4 analyzes your code to detect existing SSR guards and skips already-protected code. 
          This prevents double-wrapping and unnecessary verbose output:
        </p>

        <h3 className="text-base font-medium text-white mb-3">Pattern 1: Ternary Guard (Already Protected)</h3>
        <div className="bg-zinc-900/50 border border-black rounded-lg p-4 mb-4">
          <p className="text-gray-300 text-sm font-mono">
            const width = typeof window !== "undefined" ? window.innerWidth : 0;
          </p>
        </div>
        <p className="text-gray-400 text-sm mb-4">
          Layer 4 detects this pattern and skips it — no double-wrapping.
        </p>

        <h3 className="text-base font-medium text-white mb-3">Pattern 2: If-Statement Guard (Already Protected)</h3>
        <div className="bg-zinc-900/50 border border-black rounded-lg p-4 mb-4">
          <p className="text-gray-300 text-sm font-mono">
            if (typeof window !== "undefined") &#123;<br/>
            {'  '}window.scrollY = 100;<br/>
            &#125;
          </p>
        </div>
        <p className="text-gray-400 text-sm">
          Layer 4 traverses the AST parent chain to detect guards at any level. 
          Supports both ternary and if-statement patterns.
        </p>
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
