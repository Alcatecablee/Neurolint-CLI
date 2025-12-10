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
import { Link } from "react-router-dom";
import { LandingFooter } from "./LandingFooter";
import { 
  Shield, 
  AlertTriangle, 
  Search, 
  FileCheck, 
  Terminal, 
  GitBranch,
  Copy,
  Check,
  X,
  Lock,
  Activity,
  Database,
  FileWarning,
  Bug,
  Cpu,
  Network,
  Eye,
  Clock,
  ArrowRight,
  CheckCircle,
  ChevronRight
} from "lucide-react";

const SecurityPage = () => {
  const [copied, setCopied] = React.useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [activeWorkflowStep, setActiveWorkflowStep] = React.useState(0);

  const copyCommand = (command: string, id: string) => {
    navigator.clipboard.writeText(command);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const workflowSteps = [
    { 
      step: 1, 
      title: 'Patch the CVE', 
      cmd: 'neurolint security:cve-2025-55182 . --fix', 
      desc: 'Apply security patches to vulnerable Server Components',
      screenshot: '/security-patched.png',
      screenshotAlt: 'CVE patch applied successfully'
    },
    { 
      step: 2, 
      title: 'Scan for Compromise', 
      cmd: 'neurolint security:scan-compromise ./ --mode=deep', 
      desc: 'Detect if exploitation occurred before you patched',
      screenshot: '/security-scan-compromise.png',
      screenshotAlt: 'Deep scan showing vulnerability detection'
    },
    { 
      step: 3, 
      title: 'Generate Incident Report', 
      cmd: 'neurolint security:incident-response ./ --format=sarif', 
      desc: 'Create exportable report for your security team',
      screenshot: '/security-incident-report.png',
      screenshotAlt: 'Incident response report output'
    },
    { 
      step: 4, 
      title: 'Verify Clean State', 
      cmd: 'neurolint security:compare-baseline ./', 
      desc: 'Confirm no unauthorized changes remain',
      screenshot: '/security-compare-baseline.png',
      screenshotAlt: 'Verification scan showing no vulnerabilities'
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <nav className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-black transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 md:h-16">
            <Link to="/" className="flex items-center group">
              <img src="/logo.png" alt="NeuroLint" className="h-8 md:h-9 transition-transform duration-200 group-hover:scale-105" />
            </Link>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>

            <div className="hidden md:flex items-center gap-1">
              <Link to="/" className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Home
              </Link>
              <Link to="/docs" className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Docs
              </Link>
              <Link to="/blog" className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Blog
              </Link>
              <Link to="/security" className="px-4 py-2 min-h-[44px] flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all duration-200 text-sm font-medium">
                Security
              </Link>
              <div className="w-px h-6 bg-white/10 mx-2"></div>
              <a 
                href="https://github.com/Alcatecablee/Neurolint-CLI"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
                aria-label="GitHub"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
        
        <div className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="px-4 py-4 space-y-2 bg-zinc-900/95 backdrop-blur-xl border-t border-black">
            <Link to="/" className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Home</Link>
            <Link to="/docs" className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Docs</Link>
            <Link to="/blog" className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium">Blog</Link>
            <Link to="/security" className="block px-4 py-3 min-h-[48px] text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all duration-200 text-base font-medium">Security</Link>
            <div className="border-t border-black my-3"></div>
            <a 
              href="https://www.npmjs.com/package/@neurolint/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-3 min-h-[48px] bg-white text-black rounded-lg font-semibold text-center transition-all duration-200"
            >
              Install CLI
            </a>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center text-center px-4 py-16 pt-24 relative">
        <div className="max-w-5xl mx-auto z-10">
          <div className="mb-6 animate-slide-in-down">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-black text-gray-300 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              Active Threat — CVE-2025-55182
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-6 animate-fade-in-blur">
            You Patched the CVE.<br />
            <span className="text-red-400">Were You Already Compromised?</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            Patching closes the door. But the intruder may already be inside. NeuroLint provides 
            <span className="text-white font-semibold"> forensic-grade incident response</span> to answer the question that keeps security teams up at night.
          </p>

          <p className="text-base text-gray-400 mb-10 max-w-2xl mx-auto">
            80+ IoC signatures. React 19 behavioral analysis. Full incident response workflow.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <button 
              onClick={() => copyCommand('npx @neurolint/cli security:scan-compromise ./src --mode=deep', 'hero-scan')}
              className="group px-6 py-4 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-200 flex items-center justify-center gap-3 font-semibold"
            >
              <Search className="w-5 h-5" />
              Am I Compromised?
              {copied === 'hero-scan' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
            </button>
            <button 
              onClick={() => copyCommand('npx @neurolint/cli security:incident-response ./src --format=sarif', 'hero-ir')}
              className="group px-6 py-4 bg-zinc-900 border border-black text-white rounded-xl hover:bg-zinc-800 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <FileCheck className="w-5 h-5 text-white" />
              <span className="font-mono text-sm">Generate Incident Report</span>
              {copied === 'hero-ir' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-500 group-hover:text-white" />}
            </button>
          </div>

          <a href="#workflow" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm">
            See the full incident response workflow
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section id="workflow" className="py-16 md:py-24 px-4 relative bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-black text-red-400 rounded-full text-sm font-medium mb-6">
              <AlertTriangle className="w-4 h-4" />
              CVE-2025-55182 Incident Response
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Incident Response Workflow
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Don't just patch—investigate. Follow this 4-step workflow to determine if your application was exploited before you patched.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 space-y-3">
              {workflowSteps.map((item, idx) => (
                <button
                  key={item.step}
                  onClick={() => setActiveWorkflowStep(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    activeWorkflowStep === idx 
                      ? 'bg-zinc-800 border-zinc-600' 
                      : 'bg-zinc-900 border-black hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activeWorkflowStep === idx ? 'bg-white text-black' : 'bg-zinc-700 text-white'
                    }`}>
                      <span className="text-sm font-bold">{item.step}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-semibold mb-1 ${activeWorkflowStep === idx ? 'text-white' : 'text-gray-300'}`}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{item.desc}</p>
                    </div>
                    {activeWorkflowStep === idx && (
                      <ChevronRight className="w-5 h-5 text-white flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}

              <div className="mt-4 p-4 bg-zinc-900 border border-black rounded-xl">
                <div className="flex items-center gap-2 text-green-400 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">Result</span>
                </div>
                <p className="text-sm text-gray-400">
                  Know definitively whether you were compromised or clean.
                </p>
              </div>
            </div>

            <div className="lg:w-2/3">
              {workflowSteps[activeWorkflowStep] && (
              <div className="bg-zinc-900 border border-black rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-black">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 border border-black rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">{workflowSteps[activeWorkflowStep].step}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{workflowSteps[activeWorkflowStep].title}</h3>
                        <p className="text-sm text-gray-400">{workflowSteps[activeWorkflowStep].desc}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-800 border border-black rounded-lg p-3">
                    <Terminal className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <code className="text-sm font-mono text-blue-400 flex-1 overflow-x-auto">
                      {workflowSteps[activeWorkflowStep].cmd}
                    </code>
                    <button
                      onClick={() => {
                        const step = workflowSteps[activeWorkflowStep];
                        if (step) copyCommand(step.cmd, `workflow-${activeWorkflowStep}`);
                      }}
                      className="p-1.5 hover:bg-zinc-700 rounded transition-colors flex-shrink-0"
                      aria-label="Copy command"
                    >
                      {copied === `workflow-${activeWorkflowStep}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src={workflowSteps[activeWorkflowStep].screenshot}
                    alt={workflowSteps[activeWorkflowStep].screenshotAlt}
                    className="w-full"
                  />
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="bg-zinc-900 border border-black rounded-2xl p-8 md:p-12">
            <div className="flex items-start gap-4 mb-8">
              <div className="p-3 bg-zinc-800 border border-black rounded-xl">
                <AlertTriangle className="w-8 h-8 text-amber-500" />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Why Patching Isn't Enough
                </h2>
                <p className="text-gray-400">
                  CVSS 10.0 — Critical Remote Code Execution in React 19 Server Components
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-800 border border-black rounded-lg p-4">
                <p className="text-2xl font-bold text-white mb-1">Dec 3</p>
                <p className="text-sm text-gray-400">CVE Disclosed</p>
              </div>
              <div className="bg-zinc-800 border border-black rounded-lg p-4">
                <p className="text-2xl font-bold text-red-400 mb-1">Hours</p>
                <p className="text-sm text-gray-400">Until Active Exploitation</p>
              </div>
              <div className="bg-zinc-800 border border-black rounded-lg p-4">
                <p className="text-2xl font-bold text-white mb-1">40%</p>
                <p className="text-sm text-gray-400">Cloud Environments Vulnerable</p>
              </div>
              <div className="bg-zinc-800 border border-black rounded-lg p-4">
                <p className="text-2xl font-bold text-amber-500 mb-1">State-Nexus</p>
                <p className="text-sm text-gray-400">Threat Actors Attacking</p>
              </div>
            </div>

            <p className="text-gray-300 mb-6">
              Companies patching now may have been compromised between Dec 3-8. Attackers ("initial access brokers") 
              automate break-ins, plant backdoors, and sell root access. A patch closes the door—but the intruder may already be inside.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/blog/cve-2025-55182-react-server-components-rce"
                className="px-5 py-3 bg-zinc-800 border border-black text-white rounded-lg hover:bg-zinc-700 transition-colors text-center text-sm font-medium"
              >
                Read Full Advisory
              </Link>
              <Link 
                to="/docs/security/cve-2025-55182"
                className="px-5 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors text-center text-sm font-medium"
              >
                View Remediation Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Detection Capabilities</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive security analysis purpose-built for React and Next.js applications.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-black rounded-xl p-6 hover:bg-zinc-800/50 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mb-4 group-hover:border-zinc-600 transition-colors">
                <Search className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">80+ IoC Signatures</h3>
              <p className="text-sm text-gray-400">
                Obfuscated eval, credential leaks, exfiltration patterns, code execution, persistence mechanisms.
              </p>
            </div>

            <div className="bg-zinc-900 border border-black rounded-xl p-6 hover:bg-zinc-800/50 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mb-4 group-hover:border-zinc-600 transition-colors">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">React 19 Behavioral Analysis</h3>
              <p className="text-sm text-gray-400">
                5 framework-specific patterns for use(), useActionState, useOptimistic. Semantic-level detection.
              </p>
            </div>

            <div className="bg-zinc-900 border border-black rounded-xl p-6 hover:bg-zinc-800/50 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mb-4 group-hover:border-zinc-600 transition-colors">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Incident Response</h3>
              <p className="text-sm text-gray-400">
                SARIF, JSON, HTML reports. GitHub Security tab integration. Enterprise CI/CD compatible.
              </p>
            </div>

            <div className="bg-zinc-900 border border-black rounded-xl p-6 hover:bg-zinc-800/50 transition-colors group">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mb-4 group-hover:border-zinc-600 transition-colors">
                <Database className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Baseline Verification</h3>
              <p className="text-sm text-gray-400">
                Cryptographic integrity checks. Detect unauthorized file changes. Git timeline reconstruction.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Scan Modes</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Choose scan depth based on your security requirements.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { mode: 'quick', name: 'Quick Scan', desc: 'Fast scan of common IoC patterns. Best for routine checks.', cmd: 'neurolint security:scan-compromise ./src' },
              { mode: 'standard', name: 'Standard Scan', desc: 'Full IoC signature matching across all 80+ patterns.', cmd: 'neurolint security:scan-compromise ./src --mode=standard' },
              { mode: 'deep', name: 'Deep Scan', desc: 'AST analysis + behavioral patterns + obfuscation detection.', cmd: 'neurolint security:scan-compromise ./src --mode=deep' },
              { mode: 'paranoid', name: 'Paranoid Scan', desc: 'Everything + heuristic analysis. More false positives, maximum coverage.', cmd: 'neurolint security:scan-compromise ./src --mode=paranoid' },
            ].map((scan) => (
              <div key={scan.mode} className="bg-zinc-900 border border-black rounded-xl p-5 hover:bg-zinc-800/50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">{scan.name}</h3>
                    <p className="text-sm text-gray-400">{scan.desc}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-blue-400 bg-zinc-800 px-3 py-2 rounded-lg truncate max-w-xs border border-black">
                      {scan.cmd}
                    </code>
                    <button
                      onClick={() => copyCommand(scan.cmd, scan.mode)}
                      className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-black rounded-lg transition-colors"
                      aria-label="Copy command"
                    >
                      {copied === scan.mode ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative bg-zinc-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">React 19 Behavioral Patterns</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Traditional security tools don't understand React Server Components. 
              We detect exploitation at the framework semantics level.
            </p>
          </div>

          <div className="space-y-3">
            {[
              { id: 'BEHAV-023', name: 'React 19 use() with User Input', severity: 'critical', desc: 'Detects user-controlled URLs in use(fetch()) calls using AST traversal' },
              { id: 'BEHAV-024', name: 'useActionState with Code Execution', severity: 'critical', desc: 'Detects eval(), exec(), spawn() in action handlers' },
              { id: 'BEHAV-025', name: 'useOptimistic XSS Risk', severity: 'high', desc: 'Detects innerHTML/dangerouslySetInnerHTML in optimistic updates' },
              { id: 'BEHAV-026', name: 'startTransition Data Leak', severity: 'high', desc: 'Detects potential data exfiltration in transition callbacks' },
              { id: 'BEHAV-027', name: 'Server Cache Poisoning Risk', severity: 'high', desc: 'Detects caching of user-specific data (cookies, session, auth)' },
            ].map((pattern) => (
              <div key={pattern.id} className="bg-zinc-900 border border-black rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <span className={`text-xs font-mono px-2 py-1 rounded border border-black ${
                    pattern.severity === 'critical' ? 'bg-zinc-800 text-red-400' : 'bg-zinc-800 text-orange-400'
                  }`}>
                    {pattern.id}
                  </span>
                  <div>
                    <p className="text-white font-medium">{pattern.name}</p>
                    <p className="text-sm text-gray-400">{pattern.desc}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded border border-black ${
                  pattern.severity === 'critical' ? 'bg-zinc-800 text-red-400' : 'bg-zinc-800 text-orange-400'
                }`}>
                  {pattern.severity.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">IoC Categories</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              80 signatures across 11 detection categories covering the full attack surface.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { range: 'IOC-001+', name: 'Code Execution', desc: 'eval, Function constructor, child_process', icon: Terminal, color: 'text-red-400' },
              { range: 'IOC-011+', name: 'Obfuscation', desc: 'Base64, hex encoding, string concatenation', icon: Eye, color: 'text-red-400' },
              { range: 'IOC-021+', name: 'Credential Exposure', desc: 'API keys, tokens, secrets in code', icon: Lock, color: 'text-orange-400' },
              { range: 'IOC-031+', name: 'Data Exfiltration', desc: 'Suspicious network calls, DNS exfil', icon: Network, color: 'text-orange-400' },
              { range: 'IOC-041+', name: 'Persistence', desc: 'Cron jobs, service installations', icon: Clock, color: 'text-amber-400' },
              { range: 'IOC-051+', name: 'Supply Chain', desc: 'npm postinstall, suspicious deps', icon: Bug, color: 'text-amber-400' },
              { range: 'IOC-061+', name: 'React 19 Specific', desc: 'Server Components, Actions abuse', icon: Cpu, color: 'text-blue-400' },
              { range: 'IOC-071+', name: 'CVE-2025-55182', desc: 'RCE exploitation patterns', icon: AlertTriangle, color: 'text-blue-400' },
            ].map((cat) => {
              const IconComponent = cat.icon;
              return (
                <div key={cat.range} className="bg-zinc-900 border border-black rounded-lg p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <IconComponent className={`w-5 h-5 ${cat.color} flex-shrink-0 mt-0.5`} />
                    <div>
                      <span className={`text-xs font-mono ${cat.color} block mb-1`}>{cat.range}</span>
                      <p className="text-white font-medium text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{cat.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative bg-zinc-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Real-World Scenario</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Timeline of how NeuroLint reveals post-exploitation compromise.
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-zinc-700"></div>
            
            <div className="space-y-8">
              {[
                { date: 'Dec 3', event: 'CVE-2025-55182 Disclosed', desc: 'Critical RCE vulnerability in React 19 Server Components goes public.', type: 'neutral' },
                { date: 'Dec 3', event: 'Active Exploitation Begins', desc: 'State-nexus threat actors begin automated scanning and exploitation within hours.', type: 'danger' },
                { date: 'Dec 4-7', event: 'Attacks Continue', desc: 'Your application is vulnerable. Attackers may plant backdoors, steal credentials.', type: 'danger' },
                { date: 'Dec 8', event: 'You Patch with NeuroLint', desc: 'Run security:cve-2025-55182 command. Vulnerability is now closed.', type: 'success' },
                { date: 'Dec 9', event: 'NeuroLint Reveals Compromise', desc: 'Deep scan detects backdoor planted on Dec 5. Security team investigates.', type: 'warning' },
              ].map((item, idx) => (
                <div key={idx} className={`flex gap-4 md:gap-8 ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  <div className={`flex-1 ${idx % 2 === 0 ? 'md:text-right' : ''}`}>
                    <div className="inline-block bg-zinc-900 border border-black rounded-xl p-4">
                      <span className={`text-xs font-mono ${
                        item.type === 'danger' ? 'text-red-400' : 
                        item.type === 'success' ? 'text-green-400' : 
                        item.type === 'warning' ? 'text-orange-400' : 
                        'text-gray-400'
                      }`}>{item.date}</span>
                      <h3 className="text-white font-semibold mt-1">{item.event}</h3>
                      <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                    </div>
                  </div>
                  <div className="relative flex-shrink-0 w-8 flex justify-center">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      item.type === 'danger' ? 'bg-red-500' : 
                      item.type === 'success' ? 'bg-green-500' : 
                      item.type === 'warning' ? 'bg-orange-500' : 
                      'bg-zinc-500'
                    }`}></div>
                  </div>
                  <div className="flex-1 hidden md:block"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Enterprise Integrations</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Export findings directly to your security tools and CI/CD pipelines.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-black rounded-xl p-6 text-center hover:bg-zinc-800/50 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <GitBranch className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">GitHub Security</h3>
              <p className="text-sm text-gray-400">Direct integration with GitHub Security tab via SARIF format</p>
            </div>
            <div className="bg-zinc-900 border border-black rounded-xl p-6 text-center hover:bg-zinc-800/50 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileWarning className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">SARIF Standard</h3>
              <p className="text-sm text-gray-400">Static Analysis Results Interchange Format for tool interoperability</p>
            </div>
            <div className="bg-zinc-900 border border-black rounded-xl p-6 text-center hover:bg-zinc-800/50 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <Terminal className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">CI/CD Pipelines</h3>
              <p className="text-sm text-gray-400">Exit codes and machine-readable JSON for automated security gates</p>
            </div>
            <div className="bg-zinc-900 border border-black rounded-xl p-6 text-center hover:bg-zinc-800/50 transition-colors">
              <div className="w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">Azure DevOps</h3>
              <p className="text-sm text-gray-400">Compatible with Azure Pipelines security scanning workflows</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 relative bg-zinc-900/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Scanning Now</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-8">
            NeuroLint CLI is free and open source (Apache 2.0). Install and scan in seconds.
          </p>

          <div className="bg-zinc-900 border border-black rounded-xl p-6 max-w-xl mx-auto mb-8">
            <div className="flex items-center justify-between gap-4">
              <code className="text-blue-400 font-mono text-sm md:text-base">
                npm install -g @neurolint/cli
              </code>
              <button
                onClick={() => copyCommand('npm install -g @neurolint/cli', 'install')}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 border border-black rounded-lg transition-colors flex-shrink-0"
                aria-label="Copy install command"
              >
                {copied === 'install' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/docs/layers/security"
              className="px-8 py-4 bg-white text-black rounded-xl hover:bg-gray-100 transition-all duration-200 font-semibold flex items-center justify-center gap-2"
            >
              Read the Docs
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="mailto:clivemakazhu@gmail.com?subject=NeuroLint Security Demo Request"
              className="px-8 py-4 bg-zinc-800 border border-black text-white rounded-xl hover:bg-zinc-700 transition-all duration-200 font-medium"
            >
              Book Security Demo
            </a>
          </div>

          <p className="mt-8 text-sm text-gray-500">
            Questions? Contact us at{" "}
            <a href="mailto:clivemakazhu@gmail.com" className="text-gray-400 hover:text-white transition-colors">
              clivemakazhu@gmail.com
            </a>
          </p>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default SecurityPage;
