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
    <header className="sticky top-0 z-40 w-full bg-transparent backdrop-blur-sm px-4 py-3 flex items-center justify-between">
      {/* Brand with uploaded logo */}
      <a href="/" className="flex items-center gap-2 shrink-0">
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Faab978f39ff64270b6e29ab49582f574%2F38b5bfac1a6242ebb67f91834016d010?format=webp&width=800"
          alt="Logo"
          className="w-8 h-8"
          draggable={false}
          loading="eager"
        />
        <span className="font-bold text-white text-lg tracking-tight">
          NEURO<span className="text-zinc-400">LINT</span>
        </span>
      </a>

      {/* Centered Navigation Pill */}
      <nav className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-full px-2 py-1.5">
        <a
          href="/demo"
          className="text-zinc-300 hover:text-white text-sm font-medium transition-colors px-4 py-1.5 rounded-full hover:bg-zinc-800"
        >
          Demo
        </a>
        <a
          href="/quick-start"
          className="text-zinc-300 hover:text-white text-sm font-medium transition-colors px-4 py-1.5 rounded-full hover:bg-zinc-800"
        >
          Quick Start
        </a>
        <a
          href="/faq"
          className="text-zinc-300 hover:text-white text-sm font-medium transition-colors px-4 py-1.5 rounded-full hover:bg-zinc-800"
        >
          FAQ
        </a>
        <a
          href="/blog"
          className="text-zinc-300 hover:text-white text-sm font-medium transition-colors px-4 py-1.5 rounded-full hover:bg-zinc-800"
        >
          Blog
        </a>
        <a
          href="/docs"
          className="text-zinc-300 hover:text-white text-sm font-medium transition-colors px-4 py-1.5 rounded-full hover:bg-zinc-800"
        >
          Docs
        </a>
        <a
          href="/security"
          className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors px-4 py-1.5 rounded-full hover:bg-zinc-800"
        >
          Security
        </a>
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="https://github.com/AlfredoPrograma/neurolint"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
          </svg>
        </a>
        <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 text-sm font-medium hidden sm:inline-flex">
          Install
        </Button>
      </div>
    </header>
  );
}
