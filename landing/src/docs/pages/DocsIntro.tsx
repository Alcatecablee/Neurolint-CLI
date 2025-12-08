import React from "react";
import { DocsLayout, CodeBlock, CommandBlock, Callout, BeforeAfter } from "../components";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function DocsIntro() {
  return (
    <DocsLayout
      title="Introduction"
      description="NeuroLint is a deterministic code transformation tool for React, Next.js, and TypeScript projects. No AI, no guesswork - just reliable, rule-based fixes."
    >
      <section className="mb-12">
        <p className="text-gray-300 text-lg leading-relaxed mb-6">
          NeuroLint uses Abstract Syntax Tree (AST) parsing and predefined transformation rules 
          to automatically fix code issues with 100% reliability. Unlike AI-powered tools that 
          can produce inconsistent results, NeuroLint applies deterministic transformations that 
          you can trust.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Deterministic Fixes</h3>
            <p className="text-sm text-gray-400">
              Same input always produces the same output. No randomness, no surprises.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">8-Layer Architecture</h3>
            <p className="text-sm text-gray-400">
              Progressive layers from config fixes to security forensics.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Automatic Backups</h3>
            <p className="text-sm text-gray-400">
              Every transformation creates a backup. Restore anytime with one command.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Security Forensics</h3>
            <p className="text-sm text-gray-400">
              Layer 8 detects 80+ indicators of compromise and CVE vulnerabilities.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Example</h2>
        <p className="text-gray-300 mb-4">
          Install globally and run your first analysis in seconds:
        </p>

        <CommandBlock command="npm install -g @neurolint/cli" />
        <CommandBlock command="neurolint analyze ./your-project --verbose" />

        <p className="text-gray-400 text-sm mt-4">
          This scans your project without making any changes. To preview what fixes 
          would be applied:
        </p>

        <CommandBlock command="neurolint fix ./your-project --all-layers --dry-run" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What Gets Fixed</h2>
        
        <p className="text-gray-300 mb-6">
          NeuroLint handles the most common React and Next.js issues that cause 
          build failures, runtime errors, and hydration mismatches:
        </p>

        <div className="space-y-4">
          <div className="border-l-2 border-zinc-700 pl-4">
            <h3 className="font-medium text-white">Hydration Errors</h3>
            <p className="text-sm text-gray-400">
              Wraps browser APIs (window, document, localStorage) with SSR-safe checks 
              to prevent "window is not defined" errors.
            </p>
          </div>
          <div className="border-l-2 border-zinc-700 pl-4">
            <h3 className="font-medium text-white">Missing Keys</h3>
            <p className="text-sm text-gray-400">
              Adds unique key props to elements in map() iterations.
            </p>
          </div>
          <div className="border-l-2 border-zinc-700 pl-4">
            <h3 className="font-medium text-white">Accessibility</h3>
            <p className="text-sm text-gray-400">
              Adds alt attributes to images and ARIA labels where missing.
            </p>
          </div>
          <div className="border-l-2 border-zinc-700 pl-4">
            <h3 className="font-medium text-white">Next.js Migrations</h3>
            <p className="text-sm text-gray-400">
              Migrates next/router to next/navigation, adds 'use client' directives, 
              and handles React 19 breaking changes.
            </p>
          </div>
          <div className="border-l-2 border-zinc-700 pl-4">
            <h3 className="font-medium text-white">Configuration</h3>
            <p className="text-sm text-gray-400">
              Modernizes tsconfig.json, package.json, and next.config.js for 
              compatibility and best practices.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Before and After</h2>
        
        <p className="text-gray-300 mb-4">
          Here's a typical hydration fix that Layer 4 applies automatically:
        </p>

        <BeforeAfter
          filename="UserProfile.tsx"
          before={{
            label: "Before (causes hydration error)",
            code: `function UserProfile() {
  const width = window.innerWidth;
  
  return (
    <div>
      Screen width: {width}px
    </div>
  );
}`
          }}
          after={{
            label: "After (SSR-safe)",
            code: `function UserProfile() {
  const width = typeof window !== 'undefined' 
    ? window.innerWidth 
    : 0;
  
  return (
    <div>
      Screen width: {width}px
    </div>
  );
}`
          }}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Next Steps</h2>
        
        <div className="grid gap-3">
          <Link 
            to="/docs/installation"
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-colors group"
          >
            <div>
              <h3 className="font-medium text-white">Installation</h3>
              <p className="text-sm text-gray-400">Install NeuroLint globally or use npx</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link 
            to="/docs/quickstart"
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-colors group"
          >
            <div>
              <h3 className="font-medium text-white">Quick Start</h3>
              <p className="text-sm text-gray-400">Analyze and fix your first project</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link 
            to="/docs/architecture"
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-colors group"
          >
            <div>
              <h3 className="font-medium text-white">The 8-Layer Architecture</h3>
              <p className="text-sm text-gray-400">Understand how each layer transforms your code</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </section>
    </DocsLayout>
  );
}
