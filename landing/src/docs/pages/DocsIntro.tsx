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
import { DocsLayout, CodeBlock, CommandBlock, Callout, BeforeAfter } from "../components";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Layers, Zap, RefreshCw } from "lucide-react";

export function DocsIntro() {
  return (
    <DocsLayout
      title="NeuroLint: The React Code Fixer & ESLint Alternative for 2025"
      description="NeuroLint is a deterministic React code fixer that automatically fixes hydration errors, ESLint issues, and security vulnerabilities. AST-powered code transformation for React 19 and Next.js 16 - no AI, just reliable automated fixes."
    >
      <section className="mb-12">
        <div className="p-6 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-800/50 rounded-lg mb-8">
          <p className="text-gray-200 text-lg leading-relaxed">
            NeuroLint uses <strong className="text-white">Abstract Syntax Tree (AST) parsing</strong> with 
            regex fallback and <strong className="text-white">automatic validation</strong> to transform 
            your React and Next.js code. Every transformation is validated - if syntax breaks, changes 
            are automatically reverted.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="font-medium text-white">AST-First Transformations</h3>
            </div>
            <p className="text-sm text-gray-400">
              Parses code using Babel AST for accurate transformations. Falls back to regex only when 
              AST fails. All changes are syntax-validated before saving.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-5 h-5 text-blue-400" />
              <h3 className="font-medium text-white">8-Layer Architecture</h3>
            </div>
            <p className="text-sm text-gray-400">
              Progressive layers from config fixes to security forensics. Each layer focuses on 
              specific issue types for predictable, targeted fixes.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-5 h-5 text-green-400" />
              <h3 className="font-medium text-white">Automatic Backups</h3>
            </div>
            <p className="text-sm text-gray-400">
              Every transformation creates a backup. Restore anytime with one command. 
              Centralized backup management with list, restore, and clean operations.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-red-400" />
              <h3 className="font-medium text-white">Security Forensics</h3>
            </div>
            <p className="text-sm text-gray-400">
              Layer 8 detects 80+ indicators of compromise, CVE-2025-55182 vulnerabilities, 
              and supply chain attacks. Read-only by default - never breaks code.
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
        <CommandBlock 
          command="neurolint analyze ./src --verbose" 
          output={`[...] Running analyze......
Processing 12 files...
[ANALYZED] src/app/page.tsx
  Issues Found: 10
  Recommended Layers: 3, 4, 5
  Issue Types:
    hydration: 2
    nextjs: 3
    accessibility: 1
    layer-5-issue: 1
    layer-4-issue: 2
    layer-3-issue: 1

[ANALYSIS SUMMARY]
  Files Analyzed: 12
  Total Issues Found: 64
  Average Issues per File: 5.3
  Layer Recommendations:
    Layer 4: 9 files (75.0%)
    Layer 3: 6 files (50.0%)
    Layer 5: 4 files (33.3%)`}
        />

        <p className="text-gray-400 text-sm mt-4">
          This scans your project without making any changes. To preview what fixes 
          would be applied:
        </p>

        <CommandBlock 
          command="neurolint fix ./src --layers=1,2,3 --dry-run --verbose"
          output={`[...] Running fix......
Running Layer 1 (Configuration) on page.tsx
Running Layer 2 (Pattern Fixes) on page.tsx
[INFO] AST-based pattern transformations: 2 changes (validated)
[SUCCESS] Layer 2 identified 2 pattern fixes (dry-run)
Running Layer 3 (Component Fixes) on page.tsx
[SUCCESS] Layer 3 identified 1 component fixes (dry-run)

[FIX SUMMARY]
  Files Processed: 12
  Fixes Applied: 9
  Files Failed: 0
  Success Rate: 100.0%
  Total Execution Time: 1.00s`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">The 8 Layers</h2>
        
        <p className="text-gray-300 mb-6">
          Each layer focuses on specific code quality issues. Run individual layers or 
          combine them for comprehensive fixes:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Layer</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">What It Fixes</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">1</td>
                <td className="py-3 px-4 text-white">Configuration</td>
                <td className="py-3 px-4 text-gray-300">tsconfig.json, next.config.js, package.json modernization</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">2</td>
                <td className="py-3 px-4 text-white">Patterns</td>
                <td className="py-3 px-4 text-gray-300">Console statements, legacy context, React.createFactory</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">3</td>
                <td className="py-3 px-4 text-white">Components</td>
                <td className="py-3 px-4 text-gray-300">Missing keys, accessibility (alt, aria-label), forwardRef</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">4</td>
                <td className="py-3 px-4 text-white">Hydration</td>
                <td className="py-3 px-4 text-gray-300">SSR guards for window, document, localStorage, sessionStorage</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">5</td>
                <td className="py-3 px-4 text-white">Next.js</td>
                <td className="py-3 px-4 text-gray-300">'use client' directives, ReactDOM.render → createRoot</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">6</td>
                <td className="py-3 px-4 text-white">Testing</td>
                <td className="py-3 px-4 text-gray-300">Error boundaries, prop types, loading states</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">7</td>
                <td className="py-3 px-4 text-white">Adaptive</td>
                <td className="py-3 px-4 text-gray-300">Learns patterns from fixes, applies with confidence scoring</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-red-400">8</td>
                <td className="py-3 px-4 text-white">Security Forensics</td>
                <td className="py-3 px-4 text-gray-300">IoC detection, CVE-2025-55182, supply chain attacks (read-only)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info" title="Layer 8 is read-only by default">
          Security Forensics (Layer 8) only analyzes code - it never modifies it unless you 
          explicitly use <code className="text-blue-400">--quarantine</code> mode. This ensures 
          security scanning never breaks your build.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Transformation Safety</h2>
        
        <p className="text-gray-300 mb-4">
          NeuroLint uses a three-step safety process for every transformation:
        </p>

        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 bg-blue-900/50 rounded-full flex items-center justify-center text-blue-400 font-bold">1</div>
            <div>
              <h3 className="font-medium text-white">AST Transformation</h3>
              <p className="text-sm text-gray-400">
                First attempts AST-based transformation using Babel parser for maximum accuracy.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 bg-yellow-900/50 rounded-full flex items-center justify-center text-yellow-400 font-bold">2</div>
            <div>
              <h3 className="font-medium text-white">Regex Fallback</h3>
              <p className="text-sm text-gray-400">
                If AST fails or makes no changes, applies regex-based pattern matching as fallback.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="w-8 h-8 bg-green-900/50 rounded-full flex items-center justify-center text-green-400 font-bold">3</div>
            <div>
              <h3 className="font-medium text-white">Validation & Revert</h3>
              <p className="text-sm text-gray-400">
                Validates transformed code syntax. If invalid, automatically reverts to original.
                You'll see messages like: <code className="text-yellow-400">"[ERROR] Regex fallback produced invalid syntax - REJECTING changes"</code>
              </p>
            </div>
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
  const savedData = localStorage.getItem('user');
  
  return (
    <div>
      Screen width: {width}px
      Data: {savedData}
    </div>
  );
}`
          }}
          after={{
            label: "After (SSR-safe with guards)",
            code: `function UserProfile() {
  const width = typeof window !== 'undefined' 
    ? window.innerWidth 
    : 0;
  const savedData = typeof window !== 'undefined'
    ? localStorage.getItem('user')
    : null;
  
  return (
    <div>
      Screen width: {width}px
      Data: {savedData}
    </div>
  );
}`
          }}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Security Scanning</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 8 scans for indicators of compromise without modifying your code:
        </p>

        <CommandBlock 
          command="neurolint security:scan-compromise ./src --quick"
          output={`[...] Running security:scan-compromise......
[INFO] NeuroLint Security Forensics - Layer 8
[INFO] Post-Exploitation Detection & Incident Response

[INFO] SCAN SUMMARY
[INFO] Status: WARNINGS
[INFO] Files: 12 scanned, 0 skipped
[INFO] Duration: 0.03s
[INFO] Findings: 1 total
[INFO] Breakdown: Critical=0, High=0, Medium=1, Low=0

[INFO] File: src/app/dashboard/page.tsx
  [INFO] Beacon/Heartbeat Pattern
    ID: NEUROLINT-IOC-058
    Location: Line 20, Col 23
    Desc: Periodic beacon/heartbeat to external server
    Fix: Verify periodic requests are legitimate
    Confidence: 60%`}
        />

        <Callout type="warning" title="Security scans are non-destructive">
          Security scanning never modifies your code. Use <code className="text-blue-400">--quarantine</code> 
          mode only when you explicitly want to neutralize critical threats.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Health Check</h2>
        
        <p className="text-gray-300 mb-4">
          Verify your NeuroLint installation is working correctly:
        </p>

        <CommandBlock 
          command="neurolint health"
          output={`[...] Running health......
[SUCCESS] Configuration: Present
[SUCCESS] Learned rules file created: .neurolint/learned-rules.json
[SUCCESS] Shared Core: Operational
[SUCCESS] Fix Master: Operational
[SUCCESS] State Directory: Present
[SUCCESS] Health completed`}
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
              <p className="text-sm text-gray-400">Analyze and fix your first project in 5 minutes</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link 
            to="/docs/cli-reference"
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-colors group"
          >
            <div>
              <h3 className="font-medium text-white">CLI Reference</h3>
              <p className="text-sm text-gray-400">Complete command reference with all options</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
          <Link 
            to="/docs/architecture"
            className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:border-zinc-700 transition-colors group"
          >
            <div>
              <h3 className="font-medium text-white">The 8-Layer Architecture</h3>
              <p className="text-sm text-gray-400">Deep dive into how each layer transforms your code</p>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </section>
    </DocsLayout>
  );
}
