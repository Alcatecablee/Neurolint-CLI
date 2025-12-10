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

export function DocsLayerConfig() {
  return (
    <DocsLayout
      title="Layer 1: Configuration"
      description="Modernizes project configuration files to align with Next.js 15.5+ and React 19 best practices. Enforces TypeScript strict mode and updates build tools."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Does</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Upgrades tsconfig.json to ES2022 with strict TypeScript settings</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Adds Turbopack configuration for faster Next.js 15.5 builds</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Migrates from ESLint to Biome for better performance</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Updates package.json scripts and dependencies</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Configures image optimization and remote patterns</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Removes deprecated Next.js experimental flags</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <p className="text-gray-400 text-sm mb-3">Using layer-specific command:</p>
        <CommandBlock command="neurolint config scan ./src" />
        <CommandBlock command="neurolint config fix ./src --verbose" />
        
        <p className="text-gray-400 text-sm mb-3 mt-4">Or using the fix command with layer flag:</p>
        <CommandBlock command="neurolint fix ./src --layers=1 --verbose" />
        <CommandBlock command="neurolint fix ./src --layers=1 --dry-run" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">TypeScript Configuration</h2>
        
        <BeforeAfter
          filename="tsconfig.json"
          before={{
            label: "Before",
            code: `{
  "compilerOptions": {
    "target": "ES2015",
    "module": "commonjs",
    "jsx": "react",
    "strict": false
  }
}`
          }}
          after={{
            label: "After",
            code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true
  }
}`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Upgrades to modern TypeScript standards with ES2022 features and enforces 
          strict type checking to prevent runtime errors.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Turbopack Integration</h2>
        
        <BeforeAfter
          filename="next.config.js"
          before={{
            label: "Before",
            code: `module.exports = {
  reactStrictMode: true
}`
          }}
          after={{
            label: "After",
            code: `module.exports = {
  reactStrictMode: true,
  experimental: {
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js'
        }
      }
    }
  }
}`
          }}
        />

        <p className="text-gray-400 text-sm mt-4">
          Adds Turbopack configuration for Next.js 15.5, providing up to 700x faster 
          cold starts and 4x faster updates.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Key Features</h2>
        
        <div className="space-y-3">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Strict TypeScript</h3>
            <p className="text-sm text-gray-400">Enforces strict: true and 17+ TypeScript compiler options</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">React 19 JSX</h3>
            <p className="text-sm text-gray-400">Sets jsx to 'react-jsx' for React 19 compatibility</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Modern Scripts</h3>
            <p className="text-sm text-gray-400">Adds type-check, build:analyze scripts</p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-1">Turbopack</h3>
            <p className="text-sm text-gray-400">Configures experimental.turbo for 2-3x faster builds</p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <p className="text-gray-300 mb-4">
          Run Layer 1 first before any other layers. Essential when:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Upgrading to Next.js 15.5 or React 19</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Starting a new project with strict TypeScript</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Modernizing outdated build configurations</span>
          </li>
        </ul>

        <Callout type="info" title="Execution order">
          Layer 1 performs static analysis and modification of JSON and JS configuration 
          files using AST parsing. It detects Next.js version from package.json to apply 
          version-specific optimizations.
        </Callout>
      </section>
    </DocsLayout>
  );
}
