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
import { DocsLayout, CommandBlock, Callout } from "../components";
import { Link } from "react-router-dom";

export function DocsLayerSecurity() {
  return (
    <DocsLayout
      title="Layer 8: Security Forensics"
      description="Post-exploitation detection and incident response capabilities. Detects 80+ indicators of compromise, CVE vulnerabilities, and supply chain attacks."
    >
      <Callout type="error" title="CVE-2025-55182 - Critical RCE">
        A critical remote code execution vulnerability (CVSS 10.0) affects React 19 apps 
        using Server Components. Run{" "}
        <code className="text-red-300">neurolint security:cve-2025-55182 . --fix</code>{" "}
        immediately.{" "}
        <Link to="/docs/security/cve-2025-55182" className="text-red-300 underline">
          Read the full advisory
        </Link>
      </Callout>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
        
        <p className="text-gray-300 mb-6">
          Layer 8 extends NeuroLint beyond code quality into security forensics. 
          While patches fix vulnerabilities, Layer 8 answers the critical question: 
          "Am I already compromised?"
        </p>

        <div className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">80+ IoC Signatures</h3>
            <p className="text-sm text-gray-400">
              Detect obfuscated eval, credential leaks, exfiltration patterns, and 
              post-exploitation behavior.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">AST-Based Detection</h3>
            <p className="text-sm text-gray-400">
              Deep analysis using Abstract Syntax Tree parsing, not just pattern matching.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Baseline Verification</h3>
            <p className="text-sm text-gray-400">
              Create integrity baselines and detect unauthorized changes.
            </p>
          </div>
          <div className="p-5 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Timeline Reconstruction</h3>
            <p className="text-sm text-gray-400">
              Trace compromise timeline through git history analysis.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Which Command Do I Need?</h2>
        
        <p className="text-gray-300 mb-6">
          Choose the right security command based on your situation:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Situation</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Command</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Purpose</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Am I vulnerable to CVE-2025-55182?</td>
                <td className="py-3 px-4"><code className="text-blue-400 text-xs">security:cve-2025-55182</code></td>
                <td className="py-3 px-4 text-gray-400">Check and patch the vulnerability</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Am I already compromised?</td>
                <td className="py-3 px-4"><code className="text-blue-400 text-xs">security:scan-compromise</code></td>
                <td className="py-3 px-4 text-gray-400">Quick scan for indicators of compromise</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">I need a full forensic investigation</td>
                <td className="py-3 px-4"><code className="text-blue-400 text-xs">security:incident-response</code></td>
                <td className="py-3 px-4 text-gray-400">Deep analysis with timeline reconstruction</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">I want to establish a clean baseline</td>
                <td className="py-3 px-4"><code className="text-blue-400 text-xs">security:create-baseline</code></td>
                <td className="py-3 px-4 text-gray-400">Create integrity hash baseline</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">Has my code changed unexpectedly?</td>
                <td className="py-3 px-4"><code className="text-blue-400 text-xs">security:compare-baseline</code></td>
                <td className="py-3 px-4 text-gray-400">Detect file tampering</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">How do I secure my server actions?</td>
                <td className="py-3 px-4"><code className="text-blue-400 text-xs">security:harden-actions</code></td>
                <td className="py-3 px-4 text-gray-400">Audit and secure server actions</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Scan</h2>
        
        <p className="text-gray-300 mb-4">
          Run a fast scan for indicators of compromise:
        </p>

        <CommandBlock command="neurolint security:scan-compromise ./src --verbose" />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          Example incident response output:
        </p>

        <div className="rounded-lg overflow-hidden border border-zinc-800 mb-6">
          <img 
            src="/attached_assets/Screenshot_2025-12-09_034612_1765291802532.png" 
            alt="Incident Response Report showing findings summary"
            className="w-full"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Scan Modes</h2>
        
        <p className="text-gray-300 mb-4">
          Choose scan depth based on your needs:
        </p>

        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Quick Scan</h3>
              <span className="text-xs text-gray-500">~30 seconds</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Common IoC patterns only - great for pre-commit hooks</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --quick" />
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Standard Scan (Default)</h3>
              <span className="text-xs text-gray-500">~2 minutes</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Full IoC signature matching - balanced analysis</p>
            <CommandBlock command="neurolint security:scan-compromise ./src" />
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Deep Scan</h3>
              <span className="text-xs text-gray-500">~3 minutes</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Extended pattern matching + AST analysis</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --deep" />
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Paranoid Scan</h3>
              <span className="text-xs text-gray-500">~5-10 minutes</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Heuristic + behavioral analysis (may have false positives)</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --paranoid" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Exit Codes</h2>
        
        <p className="text-gray-300 mb-4">
          Security commands return exit codes for CI/CD integration:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Code</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Meaning</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><span className="text-green-400 font-mono">0</span></td>
                <td className="py-3 px-4 text-gray-300">No issues found (or only low severity)</td>
                <td className="py-3 px-4 text-gray-400">All clear - safe to proceed</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><span className="text-yellow-400 font-mono">1</span></td>
                <td className="py-3 px-4 text-gray-300">High severity issues detected</td>
                <td className="py-3 px-4 text-gray-400">Review findings, may need remediation</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4"><span className="text-red-400 font-mono">2</span></td>
                <td className="py-3 px-4 text-gray-300">Critical severity issues detected</td>
                <td className="py-3 px-4 text-gray-400">Immediate action required</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <p className="text-sm text-gray-400 mb-2">Use <code className="text-blue-400">--fail-on</code> to control when builds fail:</p>
          <CommandBlock command="neurolint security:scan-compromise ./src --fail-on=high" />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Severity Levels</h2>
        
        <div className="space-y-4">
          <div className="border-l-4 border-red-500 bg-zinc-900/50 p-4 rounded-r-lg">
            <h3 className="font-medium text-red-400 mb-2">Critical (Exit Code 2)</h3>
            <p className="text-gray-400 text-sm mb-2">
              Active compromise indicators or extremely dangerous patterns.
            </p>
            <p className="text-gray-500 text-xs">
              Examples: <code>eval(atob(...))</code>, reverse shell patterns, known backdoor signatures
            </p>
          </div>

          <div className="border-l-4 border-orange-500 bg-zinc-900/50 p-4 rounded-r-lg">
            <h3 className="font-medium text-orange-400 mb-2">High (Exit Code 1)</h3>
            <p className="text-gray-400 text-sm mb-2">
              Suspicious patterns that often indicate compromise.
            </p>
            <p className="text-gray-500 text-xs">
              Examples: Dynamic function construction, suspicious network calls, modified package.json scripts
            </p>
          </div>

          <div className="border-l-4 border-yellow-500 bg-zinc-900/50 p-4 rounded-r-lg">
            <h3 className="font-medium text-yellow-400 mb-2">Medium (Warning)</h3>
            <p className="text-gray-400 text-sm mb-2">
              Potentially risky patterns that may be legitimate.
            </p>
            <p className="text-gray-500 text-xs">
              Examples: Large base64 strings, outdated packages with known CVEs
            </p>
          </div>

          <div className="border-l-4 border-blue-500 bg-zinc-900/50 p-4 rounded-r-lg">
            <h3 className="font-medium text-blue-400 mb-2">Low (Informational)</h3>
            <p className="text-gray-400 text-sm mb-2">
              Best practice recommendations.
            </p>
            <p className="text-gray-500 text-xs">
              Examples: Missing input validation, console.log in production
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">IoC Categories</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 8 detects 80+ indicators of compromise across 11 categories:
        </p>

        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-001-010</span>
            <span className="text-gray-300">Code Injection (eval, Function constructor, child_process, setTimeout strings)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-orange-400 font-mono w-24">IOC-011-015</span>
            <span className="text-gray-300">Obfuscation (base64, hex encoding, unicode escapes, JSFuck)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-016-030</span>
            <span className="text-gray-300">RSC-Specific CVE-2025-55182 (rogue server actions, credential harvesting)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-orange-400 font-mono w-24">IOC-031-045</span>
            <span className="text-gray-300">Next.js Specific (malicious rewrites, middleware hijacking, edge runtime)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-046-052</span>
            <span className="text-gray-300">Backdoors (reverse shells, webshells, hidden endpoints, SSH keys)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-053-058</span>
            <span className="text-gray-300">Data Exfiltration (network to IPs, env var theft, DNS exfil, beacons)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-orange-400 font-mono w-24">IOC-059-063</span>
            <span className="text-gray-300">Supply Chain (postinstall hooks, git hook tampering, typosquatting)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-064-067</span>
            <span className="text-gray-300">Persistence (system path writes, systemd services, registry, profile files)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-068-070</span>
            <span className="text-gray-300">Crypto Mining (mining libraries, worker miners, stratum protocol)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-24">IOC-071-080</span>
            <span className="text-gray-300">RSC Extended (WebSocket C2, service worker attacks, PWA tampering)</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">React 19 Behavioral Patterns</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 8 includes 5 React 19-specific behavioral analysis patterns:
        </p>

        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">BEHAV-023</span>
              <span className="text-sm text-gray-300">React 19 use() with User Input</span>
            </div>
            <p className="text-gray-400 text-sm">
              Detects user-controlled URLs in <code className="text-blue-400">use(fetch())</code> calls
            </p>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-red-400 bg-red-400/10 px-2 py-0.5 rounded">BEHAV-024</span>
              <span className="text-sm text-gray-300">useActionState with Code Execution</span>
            </div>
            <p className="text-gray-400 text-sm">
              Detects <code className="text-blue-400">eval</code>/<code className="text-blue-400">exec</code> in action handlers
            </p>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">BEHAV-025</span>
              <span className="text-sm text-gray-300">useOptimistic XSS Risk</span>
            </div>
            <p className="text-gray-400 text-sm">
              Detects <code className="text-blue-400">dangerouslySetInnerHTML</code> in optimistic updates
            </p>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">BEHAV-026</span>
              <span className="text-sm text-gray-300">startTransition Data Leak</span>
            </div>
            <p className="text-gray-400 text-sm">
              Detects potential data exfiltration in transitions
            </p>
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded">BEHAV-027</span>
              <span className="text-sm text-gray-300">Server Cache Poisoning Risk</span>
            </div>
            <p className="text-gray-400 text-sm">
              Detects caching of user-specific sensitive data
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Baseline Management</h2>
        
        <p className="text-gray-300 mb-4">
          Create integrity baselines to detect unauthorized changes:
        </p>

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Create a baseline</h3>
        <CommandBlock command="neurolint security:create-baseline ./src -o .neurolint/baseline.json" />
        <p className="text-gray-400 text-sm mt-2">
          Creates a cryptographic hash of all files. Stored in <code className="text-blue-400">.neurolint/baseline.json</code>
        </p>

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Compare against baseline</h3>
        <CommandBlock command="neurolint security:compare-baseline ./src --baseline=.neurolint/baseline.json" />
        <p className="text-gray-400 text-sm mt-2">
          Detects added, removed, or modified files since baseline creation
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Incident Response</h2>
        
        <p className="text-gray-300 mb-4">
          Generate incident response reports:
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Quick forensic overview:</p>
            <CommandBlock command="neurolint security:incident-response ./src --quick" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Full investigation with extended history:</p>
            <CommandBlock command="neurolint security:incident-response ./src --full --lookback=30" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Export to specific location:</p>
            <CommandBlock command="neurolint security:incident-response ./src --output=./security-report/" />
          </div>
        </div>

        <p className="text-gray-400 text-sm mt-6">
          Output formats:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-gray-600">-</span>
            <span><strong className="text-gray-300">--json</strong> - Machine-readable JSON for automation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">-</span>
            <span><strong className="text-gray-300">--format=sarif</strong> - Static Analysis Results Interchange Format (GitHub compatible)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">-</span>
            <span><strong className="text-gray-300">--format=html</strong> - Human-readable HTML report</span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
