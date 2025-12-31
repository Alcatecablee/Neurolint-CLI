import React from "react";
import { Link, Outlet } from "react-router-dom";
import { LandingFooter } from "../LandingFooter";
import { X } from "lucide-react";

export function FixesLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <nav className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-black transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <Link to="/" className="flex items-center group">
              <img src="/logo.png" alt="NeuroLint" className="h-8 md:h-9 transition-transform duration-200 group-hover:scale-105" />
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Home
              </Link>
              <Link to="/fixes" className="px-4 py-2 min-h-[44px] flex items-center text-white bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Fixes
              </Link>
              <Link to="/docs" className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Docs
              </Link>
              <Link to="/blog" className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Blog
              </Link>
              <Link to="/security" className="px-4 py-2 min-h-[44px] flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Security
              </Link>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-2 bg-zinc-900/95 backdrop-blur-xl border-t border-black">
            <Link to="/" className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Home</Link>
            <Link to="/fixes" className="block px-4 py-3 min-h-[48px] text-white bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Fixes</Link>
            <Link to="/docs" className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Docs</Link>
            <Link to="/blog" className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Blog</Link>
            <Link to="/security" className="block px-4 py-3 min-h-[48px] text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all duration-200 text-base font-medium">Security</Link>
            <div className="border-t border-black my-3"></div>
            <a 
              href="https://www.npmjs.com/package/@neurolint/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 min-h-[48px] bg-white text-black rounded-lg font-semibold text-center transition-all duration-200"
            >
              Install CLI
            </a>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        <Outlet />
      </main>

      <LandingFooter />
    </div>
  );
}
