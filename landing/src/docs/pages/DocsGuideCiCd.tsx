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

export function DocsGuideCiCd() {
  return (
    <DocsLayout
      title="CI/CD Integration"
      description="Integrate NeuroLint into your continuous integration and deployment pipeline for automated code quality and security checks."
    >
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Package.json Scripts</h2>
        
        <p className="text-gray-300 mb-4">
          Add these scripts to your package.json for easy integration:
        </p>

        <CodeBlock
          language="json"
          filename="package.json"
          code={`{
  "scripts": {
    "lint:analyze": "neurolint analyze src/ --format=json --output=neurolint-report.json",
    "lint:fix": "neurolint fix src/ --all-layers --dry-run --verbose",
    "lint:apply": "neurolint fix src/ --all-layers --verbose",
    "security:scan": "neurolint security:scan-compromise src/ --fail-on=high"
  }
}`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">GitHub Actions</h2>
        
        <CodeBlock
          language="yaml"
          filename=".github/workflows/neurolint.yml"
          code={`name: NeuroLint Code Quality

on: [push, pull_request]

jobs:
  neurolint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Install NeuroLint
        run: npm install -g @neurolint/cli
        
      - name: Analyze code
        run: neurolint analyze ./src --format=json --output=report.json
        
      - name: Security scan
        run: neurolint security:scan-compromise ./src --fail-on=high
        
      - name: Upload report
        uses: actions/upload-artifact@v4
        with:
          name: neurolint-report
          path: report.json`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">GitLab CI</h2>
        
        <CodeBlock
          language="yaml"
          filename=".gitlab-ci.yml"
          code={`neurolint:
  image: node:20
  stage: lint
  script:
    - npm install -g @neurolint/cli
    - neurolint analyze ./src --format=json --output=report.json
    - neurolint security:scan-compromise ./src --fail-on=high
  artifacts:
    paths:
      - report.json
    expire_in: 1 week`}
        />
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Exit Codes</h2>
        
        <p className="text-gray-300 mb-4">
          Use exit codes to control your pipeline:
        </p>

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
                <td className="py-3 px-4 font-mono text-gray-300">0</td>
                <td className="py-3 px-4 text-gray-400">Success (no issues or all fixed)</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">1</td>
                <td className="py-3 px-4 text-gray-400">Issues found (analysis) or partial fixes</td>
              </tr>
              <tr className="border-b border-zinc-800/50">
                <td className="py-3 px-4 font-mono text-gray-300">2</td>
                <td className="py-3 px-4 text-gray-400">Error (invalid arguments, file access, etc.)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold text-white mb-4">Security Gate</h2>
        
        <p className="text-gray-300 mb-4">
          Add a security gate that fails builds on high-severity findings:
        </p>

        <CommandBlock command="neurolint security:scan-compromise ./src --fail-on=high --format=sarif --output=security.sarif" />

        <p className="text-gray-400 text-sm mt-4">
          The SARIF output can be uploaded to GitHub Security tab for visibility.
        </p>

        <Callout type="warning" title="Production deployments">
          Always run security scans before deploying to production. Use --fail-on=medium 
          for stricter enforcement.
        </Callout>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
        
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Run analyze on every PR to catch issues early</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Use --dry-run in CI to preview changes without modifying code</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Save reports as artifacts for review</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Run security scans on main branch and before releases</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gray-600 mt-1">-</span>
            <span>Create baselines after releases for drift detection</span>
          </li>
        </ul>
      </section>
    </DocsLayout>
  );
}
