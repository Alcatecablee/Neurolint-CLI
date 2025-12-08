import React from "react";
import { DocsLayout, CommandBlock, CodeBlock, Callout } from "../components";

export function DocsSecurityCve() {
  return (
    <DocsLayout
      title="CVE-2025-55182"
      description="Critical Remote Code Execution vulnerability (CVSS 10.0) affecting React 19 apps using Server Components. Patch immediately."
    >
      <Callout type="error" title="Critical Security Vulnerability">
        This is a critical remote code execution vulnerability with a CVSS score of 10.0. 
        All React 19 applications using Server Components are affected. Patch immediately.
      </Callout>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">One-Command Fix</h2>
        
        <CommandBlock command="npx @neurolint/cli security:cve-2025-55182 . --fix" />
        
        <p className="text-gray-400 text-sm mt-4">
          Then install the patched dependencies:
        </p>
        
        <CommandBlock command="npm install" />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Affected Versions</h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Package</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Vulnerable</th>
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Patched</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">react</td>
                <td className="py-3 px-4 text-gray-400">19.0.0, 19.1.0, 19.1.1, 19.2.0</td>
                <td className="py-3 px-4 text-gray-300">19.0.1, 19.1.2, 19.2.1</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">next</td>
                <td className="py-3 px-4 text-gray-400">15.0-16.2 (various)</td>
                <td className="py-3 px-4 text-gray-300">15.0.5+, 15.1.9+, 16.0.7+</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 text-gray-300">react-server-dom-webpack</td>
                <td className="py-3 px-4 text-gray-400">19.0.0, 19.1.0, 19.2.0</td>
                <td className="py-3 px-4 text-gray-300">19.0.1, 19.1.2, 19.2.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">NOT Affected</h2>
        
        <p className="text-gray-300 mb-4">
          The following are NOT affected by this vulnerability:
        </p>

        <ul className="space-y-2 text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>React 18 and earlier</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>SPAs without React Server Components</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Next.js Pages Router applications</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Client-side only React applications</span>
          </li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-400 mb-2">Scan for vulnerable packages:</p>
            <CommandBlock command="neurolint security:cve-2025-55182 ." />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Preview changes (recommended first):</p>
            <CommandBlock command="neurolint security:cve-2025-55182 . --dry-run" />
          </div>
          <div>
            <p className="text-sm text-gray-400 mb-2">Apply the security patch:</p>
            <CommandBlock command="neurolint security:cve-2025-55182 . --fix" />
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Example Output</h2>
        
        <CodeBlock
          language="text"
          code={`======================================================================
   CRITICAL SECURITY VULNERABILITY: CVE-2025-55182
   React Server Components Remote Code Execution (CVSS 10.0)
======================================================================

[!] Found 2 vulnerable package(s)!

Vulnerable Packages:

  [VULNERABLE] react
              Current: ^19.2.0
              Patched: 19.2.1

  [VULNERABLE] next
              Current: ^16.0.0
              Patched: 16.0.7

[DRY RUN] Changes that would be made:

  - Update react to 19.2.1
  - Update react-dom to 19.2.1
  - Update next to 16.0.7

Run with --fix to apply these changes.`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">What It Fixes</h2>
        
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Updates React to patched versions (19.0.1, 19.1.2, 19.2.1)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Updates Next.js to patched versions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Updates react-server-dom packages to patched versions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Adds package.json overrides for peer dependency conflicts</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Creates automatic backup before applying changes</span>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">More Information</h2>
        
        <p className="text-gray-400 text-sm">
          Read the full security advisory at{" "}
          <a 
            href="https://react.dev/blog/2025/12/03/critical-security-vulnerability-in-react-server-components"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-gray-300"
          >
            react.dev
          </a>
        </p>
      </section>
    </DocsLayout>
  );
}
