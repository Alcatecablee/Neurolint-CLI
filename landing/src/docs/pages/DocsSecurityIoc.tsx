import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

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
            <h3 className="font-medium text-white mb-2">Quick Scan (Default)</h3>
            <p className="text-gray-400 text-sm mb-2">Fast scan of common IoC patterns</p>
            <CommandBlock command="neurolint security:scan-compromise ./src" />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Standard Scan</h3>
            <p className="text-gray-400 text-sm mb-2">Full IoC signature matching</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --mode=standard" />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Deep Scan</h3>
            <p className="text-gray-400 text-sm mb-2">AST analysis + behavioral patterns + obfuscation detection</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --mode=deep" />
          </div>

          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Paranoid Scan</h3>
            <p className="text-gray-400 text-sm mb-2">Everything + heuristic analysis (more false positives)</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --mode=paranoid" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">IoC Categories</h2>
        
        <p className="text-gray-300 mb-4">
          Layer 8 detects 11 categories of indicators of compromise:
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-001+</span>
            <span className="text-gray-300">Code execution (eval, Function constructor, child_process)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-011+</span>
            <span className="text-gray-300">Obfuscation (hex encoding, base64, string concatenation)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-021+</span>
            <span className="text-gray-300">Credential exposure (API keys, tokens in code)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-031+</span>
            <span className="text-gray-300">Data exfiltration (fetch to suspicious domains)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-041+</span>
            <span className="text-gray-300">Persistence (cron jobs, service installations)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-051+</span>
            <span className="text-gray-300">Supply chain (npm postinstall scripts, suspicious deps)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-061+</span>
            <span className="text-gray-300">React 19 specific (Server Components, Actions)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <span className="font-mono w-20 text-gray-400">IOC-071+</span>
            <span className="text-gray-300">CVE-2025-55182 related patterns</span>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Output</h2>
        
        <CodeBlock
          language="text"
          code={`Scanning for indicators of compromise...

CRITICAL: IOC-003 found in src/utils/analytics.js:45
  Pattern: Obfuscated eval with string concatenation
  Risk: Remote code execution

HIGH: IOC-024 found in src/lib/auth.ts:112
  Pattern: Credential exposure in error message
  Risk: Information disclosure

MEDIUM: IOC-041 found in src/hooks/useData.ts:23
  Pattern: Fetch to IP address instead of domain
  Risk: Potential data exfiltration

Summary: 3 IoCs detected (1 critical, 1 high, 1 medium)
Recommendation: Review flagged files immediately`}
        />
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
