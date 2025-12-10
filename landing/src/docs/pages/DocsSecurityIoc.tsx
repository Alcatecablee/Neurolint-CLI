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

export function DocsSecurityIoc() {
  return (
    <DocsLayout
      title="IoC Detection"
      description="Scan your codebase for 80+ Indicators of Compromise (IoCs) across 11 detection categories. Detect backdoors, crypto miners, and supply chain attacks."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Scan</h2>
        
        <CommandBlock command="neurolint security:scan-compromise ./src --verbose" />
        
        <p className="text-gray-400 text-sm mt-4">
          This scans your codebase for indicators of compromise without making any changes.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Scan Modes</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Quick Scan</h3>
              <span className="text-xs text-gray-500">~30 seconds</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Common IoC patterns only - great for pre-commit hooks</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --quick" />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Standard Scan (Default)</h3>
              <span className="text-xs text-gray-500">~2 minutes</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Full IoC signature matching - balanced analysis</p>
            <CommandBlock command="neurolint security:scan-compromise ./src" />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-white">Deep Scan</h3>
              <span className="text-xs text-gray-500">~3 minutes</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">Extended pattern matching + AST analysis</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --deep" />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
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
        <h2 className="text-2xl font-bold text-white mb-4">IoC Categories</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 8 detects 80+ indicators of compromise across 11 categories:
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-001-010</span>
            <span className="text-gray-300">Code Injection (eval, Function constructor, child_process, setTimeout strings)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-orange-400">IOC-011-015</span>
            <span className="text-gray-300">Obfuscation (base64, hex encoding, unicode escapes, JSFuck)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-016-030</span>
            <span className="text-gray-300">RSC-Specific CVE-2025-55182 (rogue server actions, credential harvesting)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-orange-400">IOC-031-045</span>
            <span className="text-gray-300">Next.js Specific (malicious rewrites, middleware hijacking, edge runtime abuse)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-046-052</span>
            <span className="text-gray-300">Backdoors (reverse shells, webshells, hidden endpoints, SSH keys)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-053-058</span>
            <span className="text-gray-300">Data Exfiltration (network to IPs, env var theft, DNS exfil, beacons)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-orange-400">IOC-059-063</span>
            <span className="text-gray-300">Supply Chain (postinstall hooks, git hook tampering, typosquatting)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-064-067</span>
            <span className="text-gray-300">Persistence (system path writes, systemd services, registry, profile files)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-068-070</span>
            <span className="text-gray-300">Crypto Mining (mining libraries, worker miners, stratum protocol)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-24 text-red-400">IOC-071-080</span>
            <span className="text-gray-300">RSC Extended (WebSocket C2, service worker attacks, PWA tampering, cache poisoning)</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Output</h2>
        
        <p className="text-gray-300 mb-4">
          Here's an example of a complete incident response scan:
        </p>

        <div className="rounded-lg overflow-hidden border border-zinc-800 mb-6">
          <img 
            src="/attached_assets/Screenshot_2025-12-09_033436_1765291802535.png" 
            alt="Security scan showing vulnerable packages detected"
            className="w-full"
          />
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">CI/CD Integration</h2>
        
        <p className="text-gray-300 mb-4">
          Use the --fail-on flag to fail builds on specific severity thresholds:
        </p>

        <CommandBlock command="neurolint security:scan-compromise ./src --fail-on=high" />
        <CommandBlock command="neurolint security:scan-compromise ./src --format=json" />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">What It Detects</h2>
        
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Code injection patterns (eval/atob, dynamic Function)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Obfuscated payloads (Base64, hex encoding)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>RSC-specific attacks (rogue server actions, credential harvesting)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Next.js attacks (middleware hijacking, config injection)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Backdoors (reverse shells, webshells, hidden endpoints)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Data exfiltration (network beacons, env var theft)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Crypto miners (mining libraries, stratum protocol)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Supply chain tampering (postinstall hooks, typosquatting)</span>
          </li>
        </ul>

        <Callout type="info" title="Read-only by default">
          Layer 8 never modifies code during scans. It only reports findings 
          for manual review.
        </Callout>
      </section>
    </DocsLayout>
  );
}
