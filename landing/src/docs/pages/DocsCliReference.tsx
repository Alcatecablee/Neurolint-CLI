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
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

export function DocsCliReference() {
  return (
    <DocsLayout
      title="CLI Reference"
      description="Complete reference for all NeuroLint CLI v1.5.2 commands, options, and flags with real command outputs."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Global Options</h2>
        
        <p className="text-gray-300 mb-4">
          These options work with most commands:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Option</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--version, -v</td>
                <td className="py-3 px-4 text-gray-300">Display version number (e.g., 1.5.2)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--help, -h</td>
                <td className="py-3 px-4 text-gray-300">Display help information</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--verbose</td>
                <td className="py-3 px-4 text-gray-300">Enable detailed output logging with per-file details</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--dry-run</td>
                <td className="py-3 px-4 text-gray-300">Preview changes without applying them</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--backup</td>
                <td className="py-3 px-4 text-gray-300">Create backups before changes (default: true)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--no-backup</td>
                <td className="py-3 px-4 text-gray-300">Skip backup creation (not recommended)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--format json</td>
                <td className="py-3 px-4 text-gray-300">Output results as JSON (for CI/CD pipelines)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-blue-400">--output &lt;file&gt;</td>
                <td className="py-3 px-4 text-gray-300">Save output to a file</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">analyze</h2>
        
        <p className="text-gray-300 mb-4">
          Scan a project for issues without making any modifications. Shows recommended layers for each file.
        </p>

        <CodeBlock
          language="bash"
          code={`neurolint analyze <path> [options]

Options:
  --verbose       Show per-file analysis with issue types
  --layers=N,M    Only analyze specific layers
  --include       File patterns to include
  --exclude       File patterns to exclude`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Example Output</h3>
        
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
[ANALYZED] src/components/DataTable.tsx
  Issues Found: 12
  Recommended Layers: 3, 4, 5
  Issue Types:
    component: 1
    hydration: 2
    nextjs: 2
    accessibility: 1

[ANALYSIS SUMMARY]
  Files Analyzed: 12
  Total Issues Found: 64
  Average Issues per File: 5.3
  Layer Recommendations:
    Layer 4: 9 files (75.0%)
    Layer 3: 6 files (50.0%)
    Layer 5: 4 files (33.3%)
    Layer 2: 3 files (25.0%)`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">fix</h2>
        
        <p className="text-gray-300 mb-4">
          Apply transformations to fix detected issues. Creates automatic backups by default.
          Uses AST-first transformation with regex fallback and automatic syntax validation.
        </p>

        <CodeBlock
          language="bash"
          code={`neurolint fix <path> [options]

Options:
  --all-layers    Run all 7 layers (1-7, excludes security Layer 8)
  --layers=N,M    Run specific layers (comma-separated)
  --dry-run       Preview changes without applying
  --no-backup     Skip backup creation (not recommended)
  --verbose       Show detailed output per file`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Example Output</h3>
        
        <CommandBlock 
          command="neurolint fix ./src --layers=1,2,3,4 --dry-run --verbose"
          output={`[...] Running fix......
Running Layer 1 (Configuration) on page.tsx
[INFO] Project root: /workspace/src
Running Layer 2 (Pattern Fixes) on page.tsx
[INFO] AST-based pattern transformations: 2 changes (validated)
[SUCCESS] Layer 2 identified 2 pattern fixes (dry-run)
Running Layer 3 (Component Fixes) on page.tsx
[INFO] Using AST transformation (regex skipped)
[SUCCESS] Layer 3 identified 1 component fixes (dry-run)
Running Layer 4 (Hydration Fixes) on page.tsx
[INFO] Added SSR guard for localStorage.getItem()
[INFO] Wrapped window assignment in SSR guard
[INFO] AST-based hydration transformations: 2 changes (validated)

[FIXED] page.tsx
  Execution Time: 91ms
  Applied Fixes: 5
  Layers Applied: 3, 4, 5
  Fix Details:
    1. patterns - 2 transformation(s)
    2. components - 1 transformation(s)
    3. hydration - 2 transformation(s)
  Engine: shared-core

[FIX SUMMARY]
  Files Processed: 12
  Fixes Applied: 9
  Files Failed: 0
  Success Rate: 100.0%
  Total Execution Time: 1.00s`}
        />

        <Callout type="warning" title="Always preview first">
          Use <code className="text-blue-400">--dry-run</code> before applying fixes 
          to understand what will change. The fix command shows exactly which layers 
          and transformations will be applied.
        </Callout>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">layers</h2>
        
        <p className="text-gray-300 mb-4">
          Display information about all available transformation layers.
        </p>

        <CommandBlock 
          command="neurolint layers --verbose" 
          output={`[...] Running layers......
Layer 1: Configuration - Updates tsconfig.json, next.config.js, package.json
Layer 2: Patterns - Standardizes variables, removes console statements
Layer 3: Components - Adds keys, accessibility attributes, prop types
Layer 4: Hydration - Guards client-side APIs for SSR
Layer 5: Next.js - Optimizes App Router with directives
Layer 6: Testing - Adds error boundaries, prop types, loading states
Layer 7: Adaptive Pattern Learning - Learns and applies patterns from prior fixes
Layer 8: Security Forensics - Detects IoCs, supply chain attacks, and CVE-2025-55182 vulnerabilities
[SUCCESS] Layers completed`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Layer-Specific Commands</h2>
        
        <p className="text-gray-300 mb-4">
          Run individual layers directly with scan or fix subcommands:
        </p>

        <div className="space-y-4">
          <CommandBlock command="neurolint config scan ./src" />
          <CommandBlock command="neurolint patterns fix ./src --verbose" />
          <CommandBlock command="neurolint components scan ./src --verbose" />
          <CommandBlock command="neurolint hydration fix ./src --dry-run" />
          <CommandBlock command="neurolint nextjs scan ./src" />
          <CommandBlock command="neurolint testing fix ./src" />
          <CommandBlock command="neurolint adaptive scan ./src --verbose" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">validate</h2>
        
        <p className="text-gray-300 mb-4">
          Validate code syntax without making changes. Useful for CI/CD pipelines.
        </p>

        <CommandBlock 
          command="neurolint validate ./src --verbose"
          output={`[...] Running validate......
[VALID] src/next.config.js: Valid
[VALID] src/package.json: Valid
[VALID] src/tsconfig.json: Valid
[VALID] src/app/layout.tsx: Valid
[VALID] src/app/page.tsx: Valid
[VALID] src/components/DataTable.tsx: Valid
[VALID] src/components/UserCard.tsx: Valid
Validated 13 files, 0 invalid
completed`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">stats</h2>
        
        <p className="text-gray-300 mb-4">
          Show project statistics including file counts, issues, performance metrics, and memory usage.
        </p>

        <CommandBlock 
          command="neurolint stats ./src"
          output={`[...] Running stats......
Files: 13 (13 successful, 0 failed)
Issues: 64
States: 0, Backups: 0
Learned Rules: 0
Performance: 229ms (57 files/sec)
Memory: 21.21MB (peak: 10.31MB)
[SUCCESS] Stats completed`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">health</h2>
        
        <p className="text-gray-300 mb-4">
          Verify NeuroLint installation and configuration health.
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

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">init-config</h2>
        
        <p className="text-gray-300 mb-4">
          Generate or display NeuroLint configuration.
        </p>

        <CommandBlock command="neurolint init-config --init" />
        <CommandBlock 
          command="neurolint init-config --show"
          output={`{
  "enabledLayers": [1, 2, 3, 4, 5, 6, 7],
  "include": ["**/*.{ts,tsx,js,jsx,json}"],
  "exclude": ["**/node_modules/**", "**/dist/**", "**/.next/**"],
  "backup": true,
  "verbose": false,
  "dryRun": false,
  "maxRetries": 3,
  "batchSize": 50,
  "maxConcurrent": 10
}`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Migration Commands</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">check-deps</h3>
        <p className="text-gray-400 text-sm mb-3">
          Check React 19 dependency compatibility and suggest updates.
        </p>
        <CommandBlock 
          command="neurolint check-deps ./src"
          output={`[...] Running check-deps......

============================================================
  React 19 Dependency Compatibility Report
============================================================

React Version:
  [OK] ^19.0.0 (Compatible)

[OK] No known compatibility issues found

Recommendations:

[MEDIUM] Use package.json overrides for stubborn dependencies

Quick Fix Commands:
  npm install --force
  npm install --legacy-peer-deps

[OK] Dependency check completed!`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">check-compiler</h3>
        <p className="text-gray-400 text-sm mb-3">
          Detect React Compiler optimization opportunities.
        </p>
        <CommandBlock 
          command="neurolint check-compiler ./src --verbose"
          output={`[...] Running check-compiler......
[INFO] Scanning for manual memoization patterns...

============================================================
  React Compiler Opportunity Analysis
============================================================

Found 3 files with manual memoization:

useRef for prev values (1 occurrences in 1 files)
   Benefit: React Compiler can optimize value comparisons automatically
   • app/dashboard/page.tsx:7 (1x)

useMemo (1 occurrences in 1 files)
   Benefit: React Compiler automatically memoizes values
   • components/UserCard.tsx:18 (1x)

useCallback (1 occurrences in 1 files)
   Benefit: React Compiler automatically memoizes callbacks
   • components/UserCard.tsx:22 (1x)

Potential Benefits of React Compiler:
  - Reduce bundle size by ~150 bytes
  - Eliminate 3 manual optimization calls
  - Simplify code in 3 files

Strong Recommendation: Enable React Compiler`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">check-turbopack</h3>
        <p className="text-gray-400 text-sm mb-3">
          Analyze Turbopack migration compatibility.
        </p>
        <CommandBlock 
          command="neurolint check-turbopack ./src"
          output={`[...] Running check-turbopack......

============================================================
  Turbopack Migration Analysis
============================================================

(no issues found) No compatibility issues found!

Recommendations:

[SUCCESS] Project is Turbopack-ready!
   No blocking issues found.

[OPTIMIZATION] Enable Turbopack filesystem caching
   Add experimental.turbopackFileSystemCacheForDev: true

[SUCCESS] No Babel configuration detected
   Good! Turbopack uses SWC by default which is faster.

Migration Commands:
  next dev              # Uses Turbopack (Next.js 16 default)
  next dev --webpack    # Continue using Webpack`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">assess-router</h3>
        <p className="text-gray-400 text-sm mb-3">
          Assess Next.js router complexity and recommend optimal setup.
        </p>
        <CommandBlock 
          command="neurolint assess-router ./src --verbose"
          output={`[...] Running assess-router......

============================================================
Next.js Router Complexity Assessment
============================================================

Complexity Score: 50/100 (Moderate)

Router Configuration:
  App Router: Yes
  Pages Router: Yes
  Total Routes: 3

Features:
  Middleware: No
  API Routes: No
  Server Components: No
  Client Components: Yes

Recommendations:
  1. Mixed App Router and Pages Router detected - consider migrating fully
     Command: neurolint migrate-nextjs-16 . --dry-run
  2. No Server Components found - consider using them for better performance

[OK] Router complexity assessment completed!`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">migrate-react19</h3>
        <p className="text-gray-400 text-sm mb-3">
          Apply React 19 breaking change fixes (forwardRef, ReactDOM.render → createRoot, etc.)
        </p>
        <CommandBlock command="neurolint migrate-react19 ./src --dry-run --verbose" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">migrate-nextjs-16</h3>
        <p className="text-gray-400 text-sm mb-3">
          Migrate to Next.js 16 patterns (middleware, caching, async params)
        </p>
        <CommandBlock command="neurolint migrate-nextjs-16 ./src --dry-run --verbose" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">migrate-biome</h3>
        <p className="text-gray-400 text-sm mb-3">
          Migrate from ESLint/Prettier to Biome
        </p>
        <CommandBlock 
          command="neurolint migrate-biome ./src --dry-run"
          output={`[...] Running migrate-biome......
[SUCCESS] Biome migration completed!

Migration Summary:
  Biome config generated: Yes
  Package.json updated: Yes
  ESLint configs removed: No
  Prettier configs removed: No
  CI/CD updated: No

[INFO] This was a dry run. Use --apply to actually apply changes.`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Security Commands</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:scan-compromise</h3>
        <p className="text-gray-400 text-sm mb-3">
          Scan for indicators of compromise (IoCs). Layer 8 is read-only by default.
        </p>
        
        <div className="overflow-x-auto mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Mode</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Duration</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-green-400">--quick</td>
                <td className="py-3 px-4 text-gray-300">~30s</td>
                <td className="py-3 px-4 text-gray-300">Common IOC patterns only</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-yellow-400">(default)</td>
                <td className="py-3 px-4 text-gray-300">~2min</td>
                <td className="py-3 px-4 text-gray-300">Standard balanced analysis</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-orange-400">--deep</td>
                <td className="py-3 px-4 text-gray-300">~3min</td>
                <td className="py-3 px-4 text-gray-300">Extended pattern matching</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-red-400">--paranoid</td>
                <td className="py-3 px-4 text-gray-300">~5-10min</td>
                <td className="py-3 px-4 text-gray-300">Maximum depth with heuristic + behavioral analysis</td>
              </tr>
            </tbody>
          </table>
        </div>

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
    Match: setInterval(() => { ... fetch(
    Desc: Periodic beacon/heartbeat to external server
    Fix: Verify periodic requests are legitimate
    Confidence: 60%
    Hint: Schedule review in your next security sprint.`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:cve-2025-55182</h3>
        <p className="text-gray-400 text-sm mb-3">
          Check and patch the critical React Server Components RCE vulnerability (CVSS 10.0)
        </p>
        <CommandBlock 
          command="neurolint security:cve-2025-55182 ./src --dry-run"
          output={`======================================================================
   CRITICAL SECURITY VULNERABILITY: CVE-2025-55182
   React Server Components Remote Code Execution (CVSS 10.0)
======================================================================

[WARN] Found 2 vulnerable package(s)!

Vulnerable Packages:

  [VULNERABLE] react
              Current: ^19.0.0
              Patched: 19.0.1

  [VULNERABLE] next
              Current: ^16.0.0
              Patched: 16.0.7

[DRY RUN] Changes that would be made:
  - Update react to 19.0.1
  - Update react-dom to 19.0.1
  - Update next to 16.0.7

Run with --fix to apply these changes.`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:create-baseline</h3>
        <p className="text-gray-400 text-sm mb-3">
          Create a file hash baseline for drift detection (~10s)
        </p>
        <CommandBlock 
          command="neurolint security:create-baseline ./src"
          output={`[...] Running security:create-baseline......
[OK] Security baseline created!

  Baseline saved to: .neurolint/security-baseline.json
  Files indexed: 13
  Created at: 2025-12-10T16:17:40.167Z

  Use "neurolint security:compare-baseline" to detect drift.`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:compare-baseline</h3>
        <p className="text-gray-400 text-sm mb-3">
          Detect unauthorized changes since baseline (~15s)
        </p>
        <CommandBlock 
          command="neurolint security:compare-baseline ./src"
          output={`============================================================
  BASELINE COMPARISON RESULTS
============================================================

  Baseline created: 2025-12-10T16:17:40.167Z
  Comparison time:  2025-12-10T16:17:41.314Z

  ⚠ Changes detected since baseline:

    + 1 files added

    13 files unchanged

  Run with --verbose to see affected files.
  Run security:scan-compromise to check for threats.`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:incident-response</h3>
        <p className="text-gray-400 text-sm mb-3">
          Full forensic scan with timeline analysis (~2-10min)
        </p>
        <CommandBlock command="neurolint security:incident-response ./src --json" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:harden-actions</h3>
        <p className="text-gray-400 text-sm mb-3">
          Analyze/harden server actions (use --quarantine to fix)
        </p>
        <CommandBlock 
          command="neurolint security:harden-actions ./src"
          output={`[...] Running security:harden-actions......

[SECURE] No vulnerable server actions detected.`}
        />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">security:mitigation-playbook</h3>
        <p className="text-gray-400 text-sm mb-3">
          Generate compensating controls when patching is blocked
        </p>
        <CommandBlock 
          command="neurolint security:mitigation-playbook"
          output={`╔══════════════════════════════════════════════════════════════════╗
║                    CVE-2025-55182 MITIGATION PLAYBOOK             ║
╚══════════════════════════════════════════════════════════════════╝

URGENCY: MEDIUM
Apply mitigations before next production deployment.
Timeframe: Within 1 week

─── RECOMMENDED MITIGATIONS ───

1. Enhanced Monitoring & Alerting
   Effectiveness: MEDIUM | Time: 1-2 hours

2. Server Action Input Validation
   Effectiveness: MEDIUM | Time: 1-3 hours

3. Content Security Policy Hardening
   Effectiveness: MEDIUM | Time: 30 minutes

─── ACTION TIMELINE ───

IMMEDIATE (0-4 hours):
  □ Enable enhanced logging for server actions
  □ Review access logs for suspicious patterns

SHORT-TERM (1-3 days):
  □ Implement WAF rules to block exploit signatures
  □ Add input validation to all server actions

IMPORTANT: These are compensating controls, NOT a complete fix.`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Backup Commands</h2>
        
        <h3 className="text-lg font-medium text-white mt-6 mb-3">backups list</h3>
        <CommandBlock command="neurolint backups list" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">backups stats</h3>
        <CommandBlock command="neurolint backups stats" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">backups restore</h3>
        <CommandBlock command="neurolint backups restore 1 --yes" />

        <h3 className="text-lg font-medium text-white mt-6 mb-3">backups clean</h3>
        <CommandBlock command="neurolint backups clean" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Rules Commands (Adaptive Learning)</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 7 learns patterns from your fixes and applies them automatically when confidence exceeds 70%.
        </p>

        <CommandBlock 
          command="neurolint rules --list"
          output={`No learned rules yet. Rules will be created automatically as you use NeuroLint to fix code.
Use "neurolint fix <path>" to analyze and fix code, which will generate learned rules.`}
        />

        <CommandBlock command="neurolint rules --edit=0 --confidence=0.9" />
        <CommandBlock command="neurolint rules --export=rules.json" />
        <CommandBlock command="neurolint rules --import=rules.json" />
        <CommandBlock command="neurolint rules --delete=0" />
        <CommandBlock command="neurolint rules --reset" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Clean Command</h2>
        
        <p className="text-gray-300 mb-4">
          Clean up old backup and state files.
        </p>

        <CommandBlock command="neurolint clean --older-than=7 --verbose" />
        <CommandBlock command="neurolint clean --keep-latest=5 --states" />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Exit Codes</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-green-400">0</td>
                <td className="py-3 px-4 text-gray-300">Success - no issues or all fixed, or below --fail-on threshold</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-red-400">1</td>
                <td className="py-3 px-4 text-gray-300">Findings detected at or above --fail-on threshold (for security commands)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-yellow-400">2</td>
                <td className="py-3 px-4 text-gray-300">Error (invalid arguments, file access, etc.)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Callout type="info" title="CI/CD Integration">
          Use <code className="text-blue-400">--fail-on=critical</code> with security commands to fail 
          the build only on critical findings. Options: low, medium, high, critical.
        </Callout>
      </section>
    </DocsLayout>
  );
}
