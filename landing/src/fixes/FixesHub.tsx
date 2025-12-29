import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Key, AlertTriangle, Droplets, Terminal, Settings, FileCode, RefreshCw, GitBranch, Github, ThumbsUp, Wrench, Search, Layers, Server, Clock } from "lucide-react";
import { useMetaTags } from "../hooks/useMetaTags";

interface FixCard {
  slug: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  layer: number;
  searches: string;
  badge?: string;
  githubIssue?: {
    number: string;
    reactions: string;
  };
}

const fixCategories = [
  {
    name: "React/JSX Issues",
    description: "Common React patterns that need auto-fixing",
    fixes: [
      {
        slug: "react-keys-auto-fix",
        title: "Auto-fix Missing React Keys",
        description: "ESLint only detects missing keys. NeuroLint auto-fixes them with smart ID inference.",
        icon: <Key className="w-5 h-5" />,
        layer: 3,
        searches: "890/mo",
        badge: "Flagship",
        githubIssue: {
          number: "#3215",
          reactions: "115",
        },
      },
      {
        slug: "forwardref-removal",
        title: "Remove forwardRef Wrapper",
        description: "React 19 passes ref as a regular prop. Auto-remove forwardRef and clean up imports.",
        icon: <RefreshCw className="w-5 h-5" />,
        layer: 3,
        searches: "1,200/mo",
      },
    ],
  },
  {
    name: "SSR/Hydration Issues",
    description: "Server-side rendering and hydration errors",
    fixes: [
      {
        slug: "hydration-mismatch-window-undefined",
        title: "Fix window is not defined",
        description: "Auto-wrap browser APIs with SSR guards. No more hydration mismatches.",
        icon: <Droplets className="w-5 h-5" />,
        layer: 4,
        searches: "8,100/mo",
      },
      {
        slug: "useeffect-cleanup-patterns",
        title: "useEffect Cleanup Patterns",
        description: "Auto-add cleanup functions to prevent memory leaks. Matches addEventListener→removeEventListener patterns.",
        icon: <Clock className="w-5 h-5" />,
        layer: 4,
        searches: "6,600/mo",
      },
      {
        slug: "rsc-common-errors",
        title: "Fix RSC Boundary Errors",
        description: "Auto-add 'use client' directives and extract client components from Server Components.",
        icon: <Server className="w-5 h-5" />,
        layer: 6,
        searches: "3,200/mo",
        badge: "React 18+",
      },
    ],
  },
  {
    name: "React 19 Migration",
    description: "Breaking changes in React 19",
    fixes: [
      {
        slug: "react-19-migration",
        title: "React 19 Breaking Changes",
        description: "Auto-migrate ReactDOM.render to createRoot, hydrate to hydrateRoot, and forwardRef removal.",
        icon: <GitBranch className="w-5 h-5" />,
        layer: 5,
        searches: "2,400/mo",
        badge: "Breaking",
      },
    ],
  },
  {
    name: "Next.js Migration",
    description: "Breaking changes and deprecations in Next.js 15+",
    fixes: [
      {
        slug: "next-lint-deprecated",
        title: "next lint Deprecated Migration",
        description: "Migrate from deprecated next lint to Biome. Auto-configure 4 npm scripts.",
        icon: <AlertTriangle className="w-5 h-5" />,
        layer: 2,
        searches: "1,800/mo",
        badge: "Urgent",
      },
      {
        slug: "nextjs-15-migration",
        title: "Next.js 15 Async APIs",
        description: "Migrate to async cookies(), headers(), params, and searchParams. Auto-update TypeScript types.",
        icon: <GitBranch className="w-5 h-5" />,
        layer: 5,
        searches: "4,400/mo",
        badge: "Breaking",
      },
    ],
  },
  {
    name: "TypeScript Configuration",
    description: "Optimal TypeScript setup for Next.js",
    fixes: [
      {
        slug: "typescript-strict-mode",
        title: "TypeScript Strict Mode Setup",
        description: "strict: true only enables 7 flags. NeuroLint enables 17 strictness flags automatically.",
        icon: <Settings className="w-5 h-5" />,
        layer: 1,
        searches: "8,900/mo",
      },
    ],
  },
  {
    name: "Build/Production Issues",
    description: "Clean code for production builds",
    fixes: [
      {
        slug: "console-log-removal",
        title: "Remove console.log from Production",
        description: "ESLint no-console only detects. NeuroLint auto-removes with documented comments.",
        icon: <FileCode className="w-5 h-5" />,
        layer: 2,
        searches: "3,600/mo",
      },
    ],
  },
];

function FixCardComponent({ fix }: { fix: FixCard }) {
  return (
    <Link
      to={`/fixes/${fix.slug}`}
      className="group block bg-zinc-900 border border-black rounded-xl p-5 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 bg-zinc-800 border border-black rounded-lg flex items-center justify-center text-white group-hover:bg-zinc-700 transition-colors">
          {fix.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
              {fix.title}
            </h3>
            {fix.badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                fix.badge === "Flagship" 
                  ? "bg-zinc-800 text-gray-300 border border-black" 
                  : fix.badge === "Urgent"
                  ? "bg-zinc-800 text-gray-300 border border-black"
                  : "bg-zinc-800 text-gray-300 border border-black"
              }`}>
                {fix.badge}
              </span>
            )}
            {fix.githubIssue && (
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.open(`https://github.com/jsx-eslint/eslint-plugin-react/issues/${fix.githubIssue!.number.replace('#', '')}`, '_blank');
                }}
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-gray-400 border border-black hover:bg-zinc-700 hover:text-gray-300 transition-colors cursor-pointer"
              >
                <Github className="w-3 h-3" />
                {fix.githubIssue.number}
                <ThumbsUp className="w-3 h-3 ml-1" />
                {fix.githubIssue.reactions}
              </button>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">{fix.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              Layer {fix.layer}
            </span>
            <span>{fix.searches} searches</span>
            <span className="flex items-center gap-1 text-blue-400 group-hover:text-blue-300">
              View Solution
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

export function FixesHub() {
  useMetaTags({
    title: "NeuroLint Fixes - Automated React & Next.js Code Fixes",
    description: "Browse 50+ automated fixes for React, Next.js, and TypeScript. Fix hydration errors, missing keys, React 19 migrations, and 700+ common issues instantly with one command.",
    keywords: "React fixes, Next.js fixes, code fixer, automated fixes, hydration errors, React keys, ESLint alternative, TypeScript fixes, React 19 migration",
    ogTitle: "NeuroLint Fixes - Auto-Fix React & Next.js Issues",
    ogDescription: "50+ one-command automated fixes for React and Next.js. No AI, deterministic results.",
    ogUrl: "https://www.neurolint.dev/fixes",
    ogImage: "https://www.neurolint.dev/og-image.png",
    canonical: "https://www.neurolint.dev/fixes",
    twitterCard: "summary_large_image",
    twitterCreator: "@neurolint",
    twitterImage: "https://www.neurolint.dev/og-image.png",
    articleSection: "Fixes"
  });

  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-black text-gray-300 rounded-full text-sm font-medium mb-6">
            One-Command Fixes
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Fix Common React Problems
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            Each page shows the exact problem, why existing tools fail, and the one-command NeuroLint fix.
            Verified with source code references.
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-zinc-800 border border-black rounded-lg flex items-center justify-center">
                <Wrench className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-white">50+</div>
                <div className="text-xs text-gray-500">Auto-fixes</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-zinc-800 border border-black rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-white">14,390</div>
                <div className="text-xs text-gray-500">Monthly searches</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-zinc-800 border border-black rounded-lg flex items-center justify-center">
                <Layers className="w-5 h-5 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-white">7</div>
                <div className="text-xs text-gray-500">Layer system</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-4">
        <div className="max-w-4xl mx-auto space-y-12">
          {fixCategories.map((category) => (
            <div key={category.name}>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white mb-1">{category.name}</h2>
                <p className="text-sm text-gray-500">{category.description}</p>
              </div>
              <div className="space-y-3">
                {category.fixes.map((fix) => (
                  <FixCardComponent key={fix.slug} fix={fix} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 bg-zinc-900/30 border-t border-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Request a Fix</h2>
          <p className="text-gray-400 mb-6">
            Have a common React/Next.js problem that needs an automated fix? Let us know.
          </p>
          <a
            href="https://github.com/Alcatecablee/Neurolint-CLI/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-zinc-800 border border-black text-white rounded-lg hover:bg-zinc-700 transition-colors text-sm font-medium"
          >
            Request a Fix
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
