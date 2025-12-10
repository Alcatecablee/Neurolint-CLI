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
import { DocsLayout, CommandBlock, Callout } from "../components";

export function DocsGuideTroubleshooting() {
  return (
    <DocsLayout
      title="Troubleshooting"
      description="Common issues and their solutions when using NeuroLint CLI."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Command Not Found</h2>
        
        <p className="text-gray-300 mb-4">
          If you get "command not found" after global installation:
        </p>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
          <h3 className="font-medium text-white mb-2">Check npm global path</h3>
          <CommandBlock command="npm config get prefix" />
          <p className="text-gray-400 text-sm mt-2">
            Add the output path + /bin to your PATH environment variable.
          </p>
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="font-medium text-white mb-2">Use npx instead</h3>
          <CommandBlock command="npx @neurolint/cli analyze ./src" />
          <p className="text-gray-400 text-sm mt-2">
            npx runs without global installation.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Permission Errors (Linux/macOS)</h2>
        
        <p className="text-gray-300 mb-4">
          If you encounter EACCES permission errors:
        </p>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="font-medium text-white mb-2">Configure npm to use a different directory</h3>
          <CommandBlock command="mkdir ~/.npm-global && npm config set prefix '~/.npm-global'" />
          <p className="text-gray-400 text-sm mt-2">
            Then add ~/.npm-global/bin to your PATH.
          </p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Node Version Too Old</h2>
        
        <p className="text-gray-300 mb-4">
          NeuroLint requires Node.js 18+:
        </p>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="font-medium text-white mb-2">Check your version</h3>
          <CommandBlock command="node --version" />
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mt-4">
          <h3 className="font-medium text-white mb-2">Update using nvm</h3>
          <CommandBlock command="nvm install 20 && nvm use 20" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">No Files Found</h2>
        
        <p className="text-gray-300 mb-4">
          If NeuroLint reports "no files found":
        </p>

        <ul className="space-y-2 text-gray-400 text-sm mb-4">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Check you're in the correct directory</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Verify the path exists: ls ./src</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>NeuroLint only analyzes .ts, .tsx, .js, .jsx files by default</span>
          </li>
        </ul>

        <CommandBlock command="neurolint analyze . --verbose" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Transformation Failed</h2>
        
        <p className="text-gray-300 mb-4">
          If a transformation fails on a specific file:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm mb-4">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Check the file has valid syntax first</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>NeuroLint will skip files with parse errors</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Use --verbose to see detailed error messages</span>
          </li>
        </ul>

        <CommandBlock command="neurolint fix ./src/problematic-file.tsx --layers=3 --verbose" />

        <Callout type="info" title="Safe fallback">
          If AST transformation fails, NeuroLint either uses regex fallback or 
          skips the file entirely. Your code is never left in a broken state.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Restore Failed</h2>
        
        <p className="text-gray-300 mb-4">
          If you can't restore from a backup:
        </p>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg mb-4">
          <h3 className="font-medium text-white mb-2">List available backups</h3>
          <CommandBlock command="neurolint backup list" />
        </div>

        <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="font-medium text-white mb-2">Manual restore</h3>
          <p className="text-gray-400 text-sm mb-2">
            Backups are stored as plain files in .neurolint-backups/. 
            You can manually copy files back if needed.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Getting Help</h2>
        
        <p className="text-gray-300 mb-4">
          If you're still stuck:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Run neurolint health to check configuration</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Check the verbose output for error details</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>
              Open an issue on{" "}
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-gray-300"
              >
                GitHub
              </a>
            </span>
          </li>
        </ul>

        <CommandBlock command="neurolint health" />
      </section>
    </DocsLayout>
  );
}
