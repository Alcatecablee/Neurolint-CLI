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


import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Menu, X, Search, ExternalLink } from "lucide-react";
import { DocsSidebar } from "./DocsSidebar";

interface DocsLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function DocsLayout({ children, title, description }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const getBreadcrumbs = () => {
    const parts = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Docs", path: "/docs" }];
    
    if (parts.length > 1 && parts[1]) {
      const pageTitle = parts[1].split("-").map(w => 
        w.charAt(0).toUpperCase() + w.slice(1)
      ).join(" ");
      breadcrumbs.push({ label: pageTitle, path: location.pathname });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-900/20 via-black to-zinc-900/10 pointer-events-none" />
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              
              <Link to="/" className="flex items-center">
                <img src="/docs-logo.png" alt="NeuroLint" className="h-7" />
              </Link>
              
              <div className="hidden sm:flex items-center text-sm text-gray-500">
                <ChevronRight className="w-4 h-4 mx-1" />
                <span className="text-gray-400">Documentation</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link 
                to="/security"
                className="px-3 py-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-colors text-sm font-medium"
              >
                Security
              </Link>
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a 
                href="https://www.npmjs.com/package/@neurolint/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-md text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Install
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-14 relative">
        <DocsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 lg:pl-64 min-h-screen relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/5 to-zinc-900/10 pointer-events-none" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative z-10">
            <nav className="flex items-center gap-1.5 text-sm mb-6">
              {getBreadcrumbs().map((crumb, idx) => (
                <React.Fragment key={crumb.path}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-gray-600" />}
                  <Link 
                    to={crumb.path}
                    className={idx === getBreadcrumbs().length - 1 
                      ? "text-gray-300" 
                      : "text-gray-500 hover:text-gray-300 transition-colors"
                    }
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </nav>

            <header className="mb-10">
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-3">
                {title}
              </h1>
              {description && (
                <p className="text-lg text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}
            </header>

            <article className="prose prose-invert prose-zinc max-w-none">
              {children}
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
