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
import { Link } from "react-router-dom";

export function LandingFooter() {
  return (
    <footer className="w-full py-8 px-6 bg-zinc-900 border-t border-black">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-semibold mb-4">NeuroLint</h3>
            <p className="text-zinc-400 text-sm">
              Rule-based code transformation for React and TypeScript projects.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/docs"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <Link
                  to="/fixes"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Automated Fixes
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Security Forensics
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="mailto:clivemakazhu@gmail.com"
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  Email Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-black mt-8 pt-6 text-center">
          <p className="text-zinc-400 text-sm">
            &copy; {new Date().getFullYear()} NeuroLint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
