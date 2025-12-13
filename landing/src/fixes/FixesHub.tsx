import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Key, AlertTriangle, Droplets, Terminal, Settings, Zap } from "lucide-react";

interface FixCard {
  slug: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  layer: number;
  searches: string;
  badge?: string;
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
        searches: "720/mo",
        badge: "Flagship",
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
        searches: "3,400/mo",
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors truncate">
              {fix.title}
            </h3>
            {fix.badge && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                fix.badge === "Flagship" 
                  ? "bg-blue-500/10 text-blue-400" 
                  : "bg-orange-500/10 text-orange-400"
              }`}>
                {fix.badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">{fix.description}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3" />
              Layer {fix.layer}
            </span>
            <span>{fix.searches} searches</span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
      </div>
    </Link>
  );
}

export function FixesHub() {
  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-24 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-black text-gray-300 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4 text-green-400" />
            One-Command Fixes
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Fix Common React Problems
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Each page shows the exact problem, why existing tools fail, and the one-command NeuroLint fix.
            Verified with source code references.
          </p>
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
          <h2 className="text-2xl font-bold text-white mb-4">More Fixes Coming Soon</h2>
          <p className="text-gray-400 mb-6">
            We're adding more automated fixes for TypeScript strict mode, console.log removal, and React 19 breaking changes.
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
