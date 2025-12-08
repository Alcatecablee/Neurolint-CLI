import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

export function DocsSecurityIncidentResponse() {
  return (
    <DocsLayout
      title="Incident Response"
      description="Comprehensive forensic analysis for incident response teams. Generate SARIF, JSON, and HTML reports for security investigations."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Full Incident Response</h2>
        
        <CommandBlock command="neurolint security:incident-response ./src" />
        
        <p className="text-gray-400 text-sm mt-4">
          Runs all phases: code-scan, timeline, dependencies, and behavioral analysis.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Analysis Phases</h2>
        
        <div className="space-y-4">
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Code Scan</h3>
            <p className="text-gray-400 text-sm">
              Scans all source files for IoC signatures and suspicious patterns
            </p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Timeline Reconstruction</h3>
            <p className="text-gray-400 text-sm">
              Analyzes git history to trace when suspicious code was introduced
            </p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Dependency Analysis</h3>
            <p className="text-gray-400 text-sm">
              Checks for vulnerable or malicious dependencies in node_modules
            </p>
          </div>
          <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <h3 className="font-medium text-white mb-2">Behavioral Analysis</h3>
            <p className="text-gray-400 text-sm">
              Detects suspicious runtime patterns using AST analysis
            </p>
          </div>
        </div>

        <CommandBlock command="neurolint security:incident-response ./src --phases=all" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Output Formats</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Generate all report formats:</p>
            <CommandBlock command="neurolint security:incident-response ./src --format=all" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">SARIF format (GitHub Security tab):</p>
            <CommandBlock command="neurolint security:incident-response ./src --format=sarif" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">JSON format (machine-readable):</p>
            <CommandBlock command="neurolint security:incident-response ./src --format=json" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">HTML format (visual report):</p>
            <CommandBlock command="neurolint security:incident-response ./src --format=html" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Baseline Management</h2>
        
        <p className="text-gray-300 mb-4">
          Create integrity baselines to detect unauthorized changes:
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Create a baseline:</p>
            <CommandBlock command="neurolint security:create-baseline ./src" />
            <p className="text-gray-500 text-xs mt-1">
              Creates cryptographic hashes stored in .neurolint/baseline.json
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Compare against baseline:</p>
            <CommandBlock command="neurolint security:compare-baseline ./src" />
            <p className="text-gray-500 text-xs mt-1">
              Detects added, removed, or modified files since baseline creation
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Report Contents</h2>
        
        <p className="text-gray-300 mb-4">
          The incident response report includes:
        </p>

        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Summary of all detected IoCs with severity levels</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Timeline of suspicious commits with author information</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>List of vulnerable dependencies with CVE references</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Behavioral patterns detected (data exfiltration, persistence)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Recommended remediation steps</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Risk assessment score</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">When to Use</h2>
        
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>After a suspected security incident</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Regular security audits</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Before deploying to production</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>CI/CD security gates</span>
          </li>
        </ul>

        <Callout type="info" title="SARIF Integration">
          SARIF 2.1.0 format integrates directly with GitHub Security tab. 
          Upload the report to see findings in your repository's Security section.
        </Callout>
      </section>
    </DocsLayout>
  );
}
