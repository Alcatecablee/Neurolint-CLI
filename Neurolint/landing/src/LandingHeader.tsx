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


import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function LandingHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-4 px-4">
      <nav className="inline-flex items-center gap-8 px-10 py-2.5 rounded-full bg-white/5 border border-black backdrop-blur-sm w-[1100px] justify-between">
        {/* Brand */}
        <a href="/" className="flex items-center shrink-0">
          <img src="/logo.png" alt="NeuroLint Logo" className="h-7 transition-transform duration-200 hover:scale-105" />
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <a 
            href="/#comprehensive-demo" 
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Demo
          </a>
          <Link 
            to="/quickstart" 
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Quick Start
          </Link>
          <a 
            href="/#faq" 
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            FAQ
          </a>
          <Link 
            to="/blog" 
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Blog
          </Link>
          <Link 
            to="/docs"
            className="text-gray-300 hover:text-white text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Docs
          </Link>
          <Link 
            to="/fixes"
            className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Fixes
          </Link>
          <Link 
            to="/security"
            className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors px-3 py-1.5 rounded-full hover:bg-white/5"
          >
            Security
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <a 
            href="https://github.com/Alcatecablee/Neurolint-CLI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="GitHub"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          </a>
          <a 
            href="https://www.npmjs.com/package/@neurolint/cli"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white hover:bg-white/5 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
          >
            Install
          </a>
        </div>
      </nav>
    </div>
  );
}
