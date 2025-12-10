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
import { DocsLayout, CommandBlock, Callout, CodeBlock } from "../components";

export function DocsInstallation() {
  return (
    <DocsLayout
      title="Installation"
      description="Install NeuroLint CLI globally with npm, yarn, or pnpm. Requires Node.js 18 or higher."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
        
        <ul className="space-y-2 text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>Node.js 18.0.0 or higher</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-500 mt-1">-</span>
            <span>npm, yarn, or pnpm package manager</span>
          </li>
        </ul>

        <Callout type="info" title="Node.js Version">
          NeuroLint requires Node.js 18+ due to glob v12 dependencies. 
          Check your version with <code className="text-blue-400">node --version</code>.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Global Installation</h2>
        
        <p className="text-gray-300 mb-4">
          Install NeuroLint globally to use the <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">neurolint</code> command 
          from any directory:
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500 mb-2">npm</p>
            <CommandBlock command="npm install -g @neurolint/cli" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">yarn</p>
            <CommandBlock command="yarn global add @neurolint/cli" />
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-2">pnpm</p>
            <CommandBlock command="pnpm add -g @neurolint/cli" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Using npx</h2>
        
        <p className="text-gray-300 mb-4">
          Run NeuroLint without installing globally using npx:
        </p>

        <CommandBlock command="npx @neurolint/cli analyze ./your-project" />
        
        <p className="text-gray-400 text-sm mt-4">
          This downloads and runs the latest version each time. Good for one-off 
          usage or CI/CD pipelines.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Project-Local Installation</h2>
        
        <p className="text-gray-300 mb-4">
          Add NeuroLint as a dev dependency for consistent versions across your team:
        </p>

        <CommandBlock command="npm install --save-dev @neurolint/cli" />

        <p className="text-gray-300 mt-4 mb-4">
          Then add scripts to your package.json:
        </p>

        <CodeBlock
          language="json"
          filename="package.json"
          code={`{
  "scripts": {
    "lint:analyze": "neurolint analyze ./src --verbose",
    "lint:fix": "neurolint fix ./src --all-layers --dry-run",
    "lint:apply": "neurolint fix ./src --all-layers"
  }
}`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Verify Installation</h2>
        
        <p className="text-gray-300 mb-4">
          After installation, verify it works:
        </p>

        <CommandBlock 
          command="neurolint --version" 
          output="1.4.9
-> Star us: https://github.com/Alcatecablee/Neurolint"
        />

        <CommandBlock 
          command="neurolint --help" 
          output={`Usage: neurolint [command] [options]

Commands:
  analyze <path>      Analyze code for issues
  fix <path>          Fix detected issues  
  layers              Show all available layers
  validate <path>     Validate code without changes
  ...`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Troubleshooting</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium text-white mb-2">Command not found</h3>
            <p className="text-gray-400 text-sm mb-2">
              If you get "command not found" after global installation, ensure your 
              npm global bin directory is in your PATH:
            </p>
            <CommandBlock command="npm config get prefix" output="/usr/local" />
            <p className="text-gray-400 text-sm mt-2">
              Add <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">/usr/local/bin</code> (or the output path + /bin) to your PATH.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Permission errors on Linux/macOS</h3>
            <p className="text-gray-400 text-sm mb-2">
              If you encounter EACCES errors, configure npm to use a different directory:
            </p>
            <CommandBlock command="mkdir ~/.npm-global && npm config set prefix '~/.npm-global'" />
            <p className="text-gray-400 text-sm mt-2">
              Then add <code className="text-blue-400 bg-zinc-800 px-1.5 py-0.5 rounded text-sm">~/.npm-global/bin</code> to your PATH.
            </p>
          </div>

          <div>
            <h3 className="font-medium text-white mb-2">Node version too old</h3>
            <p className="text-gray-400 text-sm mb-2">
              NeuroLint requires Node.js 18+. Update Node using nvm:
            </p>
            <CommandBlock command="nvm install 20 && nvm use 20" />
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
