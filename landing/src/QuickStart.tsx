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


import { Copy, Check, X, Menu } from "lucide-react";
import { useState, useEffect } from "react";

// Beta Banner Component - Floating notification style
const BetaBanner = ({ onClose }: { onClose: () => void }) => {
  return (
    <div 
      className="fixed bottom-6 left-6 z-50 max-w-sm animate-slide-in-up"
      role="banner"
      aria-label="Beta announcement"
    >
      <div className="bg-zinc-900/95 backdrop-blur-md border border-black rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-black">
            <span className="text-sm">Beta</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-white font-medium">NeuroLint CLI is in beta.</span>{" "}
              We'd love your feedback and contributions!
            </p>
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Share feedback
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            aria-label="Close beta announcement banner"
            title="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export function QuickStart() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [bannerVisible, setBannerVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // SEO: Update document title and meta description for Quick Start page
    const originalTitle = document.title;
    document.title = 'Quick Start Guide - NeuroLint CLI | Installation & Commands';
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    const originalDescription = metaDescription?.getAttribute('content') || '';
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Get started with NeuroLint CLI in minutes. Learn how to install, analyze code, preview fixes, and automatically fix React/Next.js issues with simple commands.');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogTitle) ogTitle.setAttribute('content', 'Quick Start Guide - NeuroLint CLI');
    if (ogDescription) ogDescription.setAttribute('content', 'Get started with NeuroLint CLI in minutes. Install, analyze, and fix React/Next.js code issues automatically.');

    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute('content', originalDescription);
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const copyToClipboard = async (command: string, id: string) => {
    try {
      await navigator.clipboard.writeText(command);
      setCopiedCommand(id);
      setTimeout(() => setCopiedCommand(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const CommandBlock = ({ 
    command, 
    id
  }: { 
    command: string; 
    id: string;
  }) => (
    <div className="max-w-2xl mx-auto bg-zinc-900/90 border border-black rounded-xl p-4 md:p-5 backdrop-blur-sm relative group hover:border-black hover:bg-zinc-800/90 hover:shadow-lg hover:shadow-zinc-900/50 transition-all duration-300 ease-out mb-4 transform hover:scale-[1.01]">
      <code className="text-blue-400 font-mono text-xs sm:text-sm md:text-base block pr-12 md:pr-14 break-all">
        {command}
      </code>
      <button
        onClick={() => copyToClipboard(command, id)}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 md:p-3 hover:bg-white/10 rounded-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400/50 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label={copiedCommand === id ? "Command copied" : `Copy command: ${command}`}
        title={copiedCommand === id ? "Copied!" : "Copy to clipboard"}
      >
        {copiedCommand === id ? (
          <Check className="w-5 h-5 text-blue-400" aria-hidden="true" />
        ) : (
          <Copy className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors duration-200" aria-hidden="true" />
        )}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden scroll-smooth" id="main-content">
      {/* Beta Banner */}
      {bannerVisible && <BetaBanner onClose={() => setBannerVisible(false)} />}

      {/* Global Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-green-500/15 to-blue-600/15 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <nav 
        className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-black transition-all duration-300"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <a 
              href="/" 
              className="flex items-center group"
              aria-label="NeuroLint home"
            >
              <img src="/logo.png" alt="NeuroLint logo" className="h-9 transition-transform duration-200 group-hover:scale-105" />
            </a>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              <a 
                href="/" 
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Home
              </a>
              <a 
                href="/quick-start" 
                className="px-4 py-2 text-white bg-white/10 rounded-lg text-sm font-medium"
                aria-current="page"
              >
                Quick Start
              </a>
              <a 
                href="/#faq" 
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                FAQ
              </a>
              <a 
                href="/docs"
                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Docs
              </a>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
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
                className="ml-2 px-5 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-sm"
              >
                Install
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded-lg transition-all duration-200 min-w-[44px] min-h-[44px]"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div 
              id="mobile-menu"
              className="md:hidden py-4 border-t border-black animate-fadeIn"
              role="menu"
            >
              <div className="flex flex-col gap-3">
                <a 
                  href="/" 
                  className="text-gray-300 hover:text-white transition-all duration-200 text-base font-medium py-3 px-4 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/50"
                  role="menuitem"
                >
                  Home
                </a>
                <a 
                  href="/quick-start" 
                  className="text-white font-medium text-base py-3 px-4 rounded-lg bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
                  aria-current="page"
                  role="menuitem"
                >
                  Quick Start
                </a>
                <a 
                  href="/#faq" 
                  className="text-gray-300 hover:text-white transition-all duration-200 text-base font-medium py-3 px-4 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/50"
                  role="menuitem"
                >
                  FAQ
                </a>
                <a 
                  href="/docs"
                  className="text-gray-300 hover:text-white transition-all duration-200 text-base font-medium py-3 px-4 rounded-lg hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-white/50"
                  role="menuitem"
                >
                  Docs
                </a>
                <a 
                  href="https://www.npmjs.com/package/@neurolint/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-100 transition-all duration-200 text-center shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 active:scale-95"
                  role="menuitem"
                >
                  Install
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <section
        className="min-h-screen flex items-center justify-center text-center px-4 sm:px-6 py-20 md:py-24 pt-24 md:pt-32 relative"
        aria-label="Quick Start Guide"
        role="main"
      >
        <div className="max-w-6xl mx-auto z-10 w-full">
          <div className="mb-6 md:mb-8 animate-fadeIn">
            <span
              className="inline-block px-5 md:px-6 py-2 md:py-2.5 bg-white text-black rounded-full text-xs md:text-sm font-bold shadow-md hover:shadow-xl transition-all duration-300 cursor-default hover:scale-105"
              role="status"
            >
              Complete CLI Reference
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white animate-fadeIn">
            Quick Start
          </h1>
          
          <div className="mb-12 md:mb-16 animate-fadeIn">
            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
              Complete CLI reference with all NeuroLint commands
            </p>
            <p className="text-sm sm:text-base text-gray-400 mt-4 md:mt-6 max-w-2xl mx-auto px-2 sm:px-4">
              Replace <code className="text-blue-400 bg-zinc-800 px-2 py-0.5 rounded text-xs sm:text-sm">your-project</code> with your actual project path
              <br className="hidden sm:block" />
              <span className="text-xs sm:text-sm">(e.g., <code className="text-blue-400 text-xs sm:text-sm">C:\Users\YourName\my-app</code> on Windows or <code className="text-blue-400 text-xs sm:text-sm">/Users/YourName/my-app</code> on Mac)</span>
            </p>
          </div>

          {/* Basic Commands */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="basic-commands">Basic Commands</h2>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Show Version</h3>
            <CommandBlock command="neurolint --version" id="version" />
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Show Help</h3>
            <CommandBlock command="neurolint --help" id="help" />
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Show All Layers</h3>
            <CommandBlock command="neurolint layers" id="layers" />
          </div>

          {/* Analysis Commands */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 scroll-mt-24" id="analysis-commands">Analysis Commands (Safe - No Changes)</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-8">These commands analyze your project without making any modifications</p>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Analyze Project</h3>
            <CommandBlock command="neurolint analyze your-project" id="analyze" />
            <CommandBlock command="neurolint analyze your-project --verbose" id="analyze-verbose" />
            <CommandBlock command="neurolint analyze your-project/src --verbose" id="analyze-folder" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Check Project Statistics</h3>
            <CommandBlock command="neurolint stats your-project --verbose" id="stats" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Validate Without Changes</h3>
            <CommandBlock command="neurolint validate your-project --verbose" id="validate" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Check React 19 Dependency Compatibility</h3>
            <CommandBlock command="neurolint check-deps your-project --verbose" id="check-deps" />
            <CommandBlock command="neurolint check-deps your-project --fix --verbose" id="check-deps-fix" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Check Turbopack Migration Readiness</h3>
            <CommandBlock command="neurolint check-turbopack your-project --verbose" id="turbopack" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Check React Compiler Opportunities</h3>
            <CommandBlock command="neurolint check-compiler your-project --verbose" id="compiler" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Assess Router Complexity</h3>
            <CommandBlock command="neurolint assess-router your-project --verbose" id="router" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Detect React 19.2 Feature Opportunities</h3>
            <CommandBlock command="neurolint detect-react192 your-project --verbose" id="react192" />
          </div>

          {/* Dry Run Commands */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 scroll-mt-24" id="dry-run-commands">Dry Run Commands (Preview Changes - No Modifications)</h2>
            <p className="text-sm sm:text-base text-gray-400 mb-8">See what would be fixed without actually changing your files</p>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Preview All Layer Fixes</h3>
            <CommandBlock command="neurolint fix your-project --all-layers --dry-run --verbose" id="preview-all" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Preview Specific Layer Fixes</h3>
            <CommandBlock command="neurolint fix your-project --layers=1 --dry-run --verbose" id="layer1" />
            <CommandBlock command="neurolint fix your-project --layers=2 --dry-run --verbose" id="layer2" />
            <CommandBlock command="neurolint fix your-project --layers=3 --dry-run --verbose" id="layer3" />
            <CommandBlock command="neurolint fix your-project --layers=4 --dry-run --verbose" id="layer4" />
            <CommandBlock command="neurolint fix your-project --layers=5 --dry-run --verbose" id="layer5" />
            <CommandBlock command="neurolint fix your-project --layers=6 --dry-run --verbose" id="layer6" />
            <CommandBlock command="neurolint fix your-project --layers=7 --dry-run --verbose" id="layer7" />
            <CommandBlock command="neurolint fix your-project --layers=1,2,3 --dry-run --verbose" id="layers-multi" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Preview Migration Commands</h3>
            <CommandBlock command="neurolint migrate-react19 your-project --dry-run --verbose" id="migrate-react19-preview" />
            <CommandBlock command="neurolint migrate-nextjs-16 your-project --dry-run --verbose" id="migrate-next16-preview" />
            <CommandBlock command="neurolint migrate-nextjs-15.5 your-project --dry-run --verbose" id="migrate-next155-preview" />
            <CommandBlock command="neurolint migrate-biome your-project --dry-run --verbose" id="migrate-biome-preview" />
          </div>

          {/* Actual Fix Commands */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="fix-commands">Actual Fix Commands (MAKES CHANGES - Backups created automatically)</h2>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Apply All Fixes (Automatic Backup)</h3>
            <CommandBlock command="neurolint fix your-project --all-layers --verbose" id="fix-all" />
            <CommandBlock command="neurolint fix your-project --layers=1,2,3 --verbose" id="fix-specific" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Apply Fixes Without Backup (Not Recommended)</h3>
            <CommandBlock command="neurolint fix your-project --all-layers --no-backup --verbose" id="fix-no-backup-all" />
            <CommandBlock command="neurolint fix your-project --layers=1 --no-backup --verbose" id="fix-no-backup-layer1" />
          </div>

          {/* Migration Commands */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="migration-commands">Migration Commands (MAKES CHANGES - Backups created automatically)</h2>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">React 19 Migration</h3>
            <CommandBlock command="neurolint migrate-react19 your-project --verbose" id="migrate-react19" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Next.js 16 Migration</h3>
            <CommandBlock command="neurolint migrate-nextjs-16 your-project --verbose" id="migrate-next16" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Biome Migration</h3>
            <CommandBlock command="neurolint migrate-biome your-project --verbose" id="migrate-biome" />
          </div>

          {/* Backup Management */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="backup-management">Backup Management</h2>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">List Backups</h3>
            <CommandBlock command="neurolint backup list" id="backup-list" />
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Restore from Backup</h3>
            <CommandBlock command="neurolint restore --interactive" id="restore" />
          </div>

          {/* Testing Workflow */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="testing-workflow">Testing Workflow (Recommended Order)</h2>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">Step 1: Analyze First</h3>
            <CommandBlock command="neurolint analyze your-project --verbose" id="workflow-analyze" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Step 2: Check Dependencies</h3>
            <CommandBlock command="neurolint check-deps your-project --verbose" id="workflow-deps" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Step 3: Preview Fixes</h3>
            <CommandBlock command="neurolint fix your-project --all-layers --dry-run --verbose" id="workflow-preview" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Step 4: Apply Layer by Layer (Safest Approach - Automatic Backups)</h3>
            <CommandBlock command="neurolint fix your-project --layers=1 --verbose" id="workflow-layer1" />
            <CommandBlock command="neurolint fix your-project --layers=2 --verbose" id="workflow-layer2" />
            <CommandBlock command="neurolint fix your-project --layers=3 --verbose" id="workflow-layer3" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">Step 5: Validate</h3>
            <CommandBlock command="neurolint validate your-project --verbose" id="workflow-validate" />
          </div>

          {/* Quick Reference by Use Case */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="quick-reference">Quick Reference by Use Case</h2>
            
            <h3 className="text-base sm:text-lg text-gray-300 mb-4">"I want to see what issues exist"</h3>
            <CommandBlock command="neurolint analyze your-project --verbose" id="usecase-issues" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">"I want to see what would be fixed"</h3>
            <CommandBlock command="neurolint fix your-project --all-layers --dry-run --verbose" id="usecase-preview" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">"I want to fix everything safely"</h3>
            <CommandBlock command="neurolint fix your-project --all-layers --verbose" id="usecase-fix" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">"I want to migrate to React 19"</h3>
            <CommandBlock command="neurolint migrate-react19 your-project --dry-run --verbose" id="usecase-react19-preview" />
            <CommandBlock command="neurolint migrate-react19 your-project --verbose" id="usecase-react19-apply" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">"I want to check Turbopack compatibility"</h3>
            <CommandBlock command="neurolint check-turbopack your-project --verbose" id="usecase-turbopack" />

            <h3 className="text-base sm:text-lg text-gray-300 mb-4 mt-8">"I need to undo changes"</h3>
            <CommandBlock command="neurolint restore --interactive" id="usecase-undo" />
          </div>

          {/* Notes */}
          <div className="mb-12 md:mb-16 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 scroll-mt-24" id="notes">Notes</h2>
            <div className="text-sm sm:text-base text-gray-400 space-y-2 max-w-3xl mx-auto text-left">
              <p>• Always use <code className="text-blue-400">--dry-run</code> first to preview changes before applying</p>
              <p>• Backups are created <strong>automatically by default</strong> - use <code className="text-blue-400">--no-backup</code> to skip (not recommended)</p>
              <p>• Use <code className="text-blue-400">--verbose</code> to see detailed output and understand what's happening</p>
              <p>• The CLI validates all transformations twice (AST + regex fallback) to prevent breaking your code</p>
              <p>• All paths can be relative or absolute - use what works best for your system</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-black py-12 px-4 text-center text-gray-400">
        <div className="max-w-7xl mx-auto">
          <p className="mb-6">© 2024 NeuroLint. All rights reserved.</p>
          <div className="flex justify-center gap-8 text-sm">
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors font-medium"
            >
              GitHub
            </a>
            <a 
              href="https://www.npmjs.com/package/@neurolint/cli" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white transition-colors font-medium"
            >
              npm
            </a>
            <a 
              href="mailto:clivemakazhu@gmail.com"
              className="hover:text-white transition-colors font-medium"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
