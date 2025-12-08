import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout, BeforeAfter } from "../components";
import { Link } from "react-router-dom";
import { Shield, AlertTriangle, Search, FileText, Clock } from "lucide-react";

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
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Shield className="w-5 h-5 text-red-400 mb-3" />
            <h3 className="font-semibold text-white mb-2">80+ IoC Signatures</h3>
            <p className="text-sm text-gray-400">
              Detect obfuscated eval, credential leaks, exfiltration patterns, and 
              post-exploitation behavior.
            </p>
          </div>
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Search className="w-5 h-5 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white mb-2">AST-Based Detection</h3>
            <p className="text-sm text-gray-400">
              Deep analysis using Abstract Syntax Tree parsing, not just pattern matching.
            </p>
          </div>
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <FileText className="w-5 h-5 text-green-400 mb-3" />
            <h3 className="font-semibold text-white mb-2">Baseline Verification</h3>
            <p className="text-sm text-gray-400">
              Create integrity baselines and detect unauthorized changes.
            </p>
          </div>
          <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <Clock className="w-5 h-5 text-purple-400 mb-3" />
            <h3 className="font-semibold text-white mb-2">Timeline Reconstruction</h3>
            <p className="text-sm text-gray-400">
              Trace compromise timeline through git history analysis.
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Scan</h2>
        
        <p className="text-gray-300 mb-4">
          Run a fast scan for indicators of compromise:
        </p>

        <CommandBlock command="neurolint security:scan-compromise ./src --verbose" />

        <p className="text-gray-400 text-sm mt-4 mb-4">
          Example output when issues are found:
        </p>

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
        <h2 className="text-2xl font-bold text-white mb-4">Scan Modes</h2>
        
        <p className="text-gray-300 mb-4">
          Choose scan depth based on your needs:
        </p>

        <div className="space-y-4">
          <div className="border border-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">Quick Scan (Default)</h3>
            <p className="text-gray-400 text-sm mb-2">Fast scan of common IoC patterns</p>
            <CommandBlock command="neurolint security:scan-compromise ./src" />
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">Standard Scan</h3>
            <p className="text-gray-400 text-sm mb-2">Full IoC signature matching</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --mode=standard" />
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
            <h3 className="font-medium text-white mb-2">Deep Scan</h3>
            <p className="text-gray-400 text-sm mb-2">AST analysis + behavioral patterns + obfuscation detection</p>
            <CommandBlock command="neurolint security:scan-compromise ./src --mode=deep" />
          </div>

          <div className="border border-zinc-800 rounded-lg p-4">
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

        <div className="space-y-3 text-sm">
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-20">IOC-001+</span>
            <span className="text-gray-300">Code execution (eval, Function constructor, child_process)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-red-400 font-mono w-20">IOC-011+</span>
            <span className="text-gray-300">Obfuscation (hex encoding, base64, string concatenation)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-orange-400 font-mono w-20">IOC-021+</span>
            <span className="text-gray-300">Credential exposure (API keys, tokens in code)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-orange-400 font-mono w-20">IOC-031+</span>
            <span className="text-gray-300">Data exfiltration (fetch to suspicious domains)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-yellow-400 font-mono w-20">IOC-041+</span>
            <span className="text-gray-300">Persistence (cron jobs, service installations)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-yellow-400 font-mono w-20">IOC-051+</span>
            <span className="text-gray-300">Supply chain (npm postinstall scripts, suspicious deps)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-blue-400 font-mono w-20">IOC-061+</span>
            <span className="text-gray-300">React 19 specific (Server Components, Actions)</span>
          </div>
          <div className="flex gap-3 p-3 bg-zinc-900 rounded-lg">
            <span className="text-blue-400 font-mono w-20">IOC-071+</span>
            <span className="text-gray-300">CVE-2025-55182 related patterns</span>
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
        <CommandBlock command="neurolint security:create-baseline ./src" />
        <p className="text-gray-400 text-sm mt-2">
          Creates a cryptographic hash of all files. Stored in <code className="text-blue-400">.neurolint/baseline.json</code>
        </p>

        <h3 className="text-lg font-medium text-white mt-6 mb-3">Compare against baseline</h3>
        <CommandBlock command="neurolint security:compare-baseline ./src" />
        <p className="text-gray-400 text-sm mt-2">
          Detects added, removed, or modified files since baseline creation
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Incident Response</h2>
        
        <p className="text-gray-300 mb-4">
          Generate incident response reports:
        </p>

        <CommandBlock command="neurolint security:incident-response ./src --format=json" />
        <CommandBlock command="neurolint security:incident-response ./src --format=sarif" />

        <p className="text-gray-400 text-sm mt-4">
          Output formats:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-gray-600">-</span>
            <span><strong className="text-gray-300">json</strong> - Machine-readable JSON for automation</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">-</span>
            <span><strong className="text-gray-300">sarif</strong> - Static Analysis Results Interchange Format (GitHub compatible)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600">-</span>
            <span><strong className="text-gray-300">html</strong> - Human-readable HTML report</span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
