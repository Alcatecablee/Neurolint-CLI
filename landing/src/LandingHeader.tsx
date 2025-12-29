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


import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex justify-center pt-4 px-4">
      <header className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
        {/* Brand with uploaded logo */}
        <a href="/" className="flex items-center gap-2 shrink-0 pr-2 border-r border-white/10">
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
            alt="Logo"
            className="w-6 h-6"
            draggable={false}
            loading="eager"
          />
          <span className="font-semibold text-white text-sm tracking-tight">
            NEURO<span className="text-zinc-400">LINT</span>
          </span>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <a
            href="/fixes"
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1 rounded-full hover:bg-white/5"
          >
            Fixes
          </a>
          <a
            href="/blog"
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1 rounded-full hover:bg-white/5"
          >
            Blog
          </a>
          <a
            href="/docs"
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1 rounded-full hover:bg-white/5"
          >
            Docs
          </a>
          <a
            href="/security"
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors px-3 py-1 rounded-full hover:bg-white/5"
          >
            Security
          </a>
        </nav>

        {/* Divider and GitHub */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10">
          <a
            href="https://github.com/AlfredoPrograma/neurolint"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
            </svg>
          </a>
          <Button 
            variant="ghost" 
            className="text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium h-7 px-3 rounded-full"
            onClick={() => window.open("https://www.npmjs.com/package/@neurolint/cli", "_blank")}
          >
            Install
          </Button>
        </div>
      </header>
    </div>
  );
}
