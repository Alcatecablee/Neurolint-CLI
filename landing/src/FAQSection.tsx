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


import React, { useState } from "react";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { InstallCTA } from "./components/InstallCTA";

interface FAQItem {
  question: string;
  answer: string;
  keywords?: string[];
}

const faqData: FAQItem[] = [
  {
    question: "Is NeuroLint really 100% free?",
    answer:
      "Yes! NeuroLint CLI is completely free with no subscriptions, no API keys required, and no hidden costs. Install it via npm and start fixing your React & Next.js code immediately. All features are included - no premium tiers or paid upgrades.",
    keywords: [
      "free",
      "no cost",
      "npm",
      "CLI",
      "no subscription",
      "no API keys",
    ],
  },
  {
    question: "What are the 8 layers?",
    answer:
      "NeuroLint uses a sophisticated 8-layer pipeline for comprehensive code fixes: (1) Configuration - TypeScript and Next.js config modernization, (2) Patterns - HTML entities, console cleanup, var to const/let, (3) Components - missing keys, accessibility, prop validation, (4) Hydration - SSR safety guards for localStorage/window, (5) Next.js - App Router optimization and React 19 API migrations, (6) Testing - accessibility and error boundary improvements, (7) Adaptive - machine learning that learns patterns from your codebase, (8) Security Forensics - post-exploitation detection, compromise scanning, and incident response with 70 IoC signatures.",
    keywords: [
      "layers",
      "pipeline",
      "configuration",
      "patterns",
      "components",
      "hydration",
      "Next.js",
      "testing",
      "adaptive",
    ],
  },
  {
    question: "Will NeuroLint break my code?",
    answer:
      "No. NeuroLint creates automatic backups before making any changes. Every fix is deterministic and rule-based (not AI), so you get consistent, predictable results. You can review all changes and roll back instantly if needed. We prioritize safety over speed.",
    keywords: [
      "safety",
      "automatic backups",
      "rollback",
      "deterministic",
      "rule-based",
      "no breaking changes",
    ],
  },
  {
    question: "Does NeuroLint use AI?",
    answer:
      "No. NeuroLint uses proven AST-based (Abstract Syntax Tree) transformations with Babel, not AI. This means you get deterministic, consistent fixes every time - no hallucinations, no guesswork, no unpredictable results. We parse and transform your code based on established patterns and best practices.",
    keywords: [
      "no AI",
      "rule-based",
      "deterministic",
      "consistent",
      "proven patterns",
      "no hallucinations",
      "AST",
      "Babel",
    ],
  },
  {
    question: "What frameworks and versions are supported?",
    answer:
      "NeuroLint works with React 16+, React 18, React 19, Next.js 13.4 - 15.5, and TypeScript codebases. We fix common issues like hydration crashes (window is not defined), missing React keys, ESLint errors, accessibility problems, and Next.js App Router migration issues.",
    keywords: [
      "React",
      "Next.js",
      "TypeScript",
      "React 18",
      "React 19",
      "Next.js 15",
      "App Router",
    ],
  },
  {
    question: "Does NeuroLint help migrate to React 19?",
    answer:
      "Yes! NeuroLint automatically converts deprecated React 19 APIs: ReactDOM.render() to createRoot(), ReactDOM.hydrate() to hydrateRoot(), and updates react-dom/test-utils imports. It also warns about removed APIs like findDOMNode and unmountComponentAtNode with migration suggestions.",
    keywords: [
      "React 19",
      "migration",
      "createRoot",
      "hydrateRoot",
      "ReactDOM",
      "deprecated APIs",
      "upgrade",
    ],
  },
  {
    question: "Is there a VS Code extension?",
    answer:
      "Yes! NeuroLint integrates directly into VS Code with real-time diagnostics, code actions, hover information, and a dedicated tree view for issues. The extension mirrors all CLI capabilities and works seamlessly with VS Code's undo/redo system. Download the .vsix from our GitHub releases.",
    keywords: [
      "VS Code",
      "extension",
      "IDE",
      "diagnostics",
      "code actions",
      "editor",
    ],
  },
  {
    question: "How long does it take to fix my code?",
    answer:
      "Most projects are analyzed in seconds and fixed in minutes. Small projects (< 50 files) typically take 1-2 minutes. Medium projects (50-200 files) take 5-10 minutes. Large projects (200+ files) take 15-30 minutes. The CLI shows real-time progress as it works.",
    keywords: [
      "speed",
      "performance",
      "quick fixes",
      "real-time progress",
      "minutes not hours",
    ],
  },
  {
    question: "What are the system requirements?",
    answer:
      "NeuroLint requires Node.js 16+ and npm 7+ (Node.js 20+ recommended for best compatibility). Works on macOS, Linux, and Windows. Supports CI/CD environments including GitHub Actions, GitLab CI, CircleCI, and Jenkins. Compatible with monorepos, turborepo, and nx workspaces.",
    keywords: [
      "Node.js",
      "npm",
      "macOS",
      "Linux",
      "Windows",
      "CI/CD",
      "monorepo",
      "prerequisites",
    ],
  },
  {
    question: "How do backups and rollbacks work?",
    answer:
      "Before making any changes, NeuroLint automatically creates timestamped backups in .neurolint-backups/. Each layer creates its own backup, so you can rollback to any point. The centralized backup manager tracks all changes across your project. To restore, run 'neurolint restore' and select the backup timestamp. Backups are never modified or deleted automatically - you have full control.",
    keywords: [
      "backup",
      "restore",
      "rollback",
      "safety",
      "undo changes",
      "recovery",
      "layer backups",
    ],
  },
  {
    question: "Does NeuroLint collect any data?",
    answer:
      "NeuroLint runs 100% locally on your machine. Any usage analytics are stored only on your machine to help track quality improvements - nothing is ever sent to external servers. Your code never leaves your computer. Works completely offline. No API keys, accounts, or internet connection required after installation.",
    keywords: [
      "privacy",
      "local analytics",
      "offline",
      "local",
      "security",
      "no external tracking",
    ],
  },
];

const FAQItem: React.FC<{
  faq: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ faq, isOpen, onToggle }) => {
  return (
    <div className="border border-black rounded-xl overflow-hidden">
      <button
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-zinc-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-semibold text-white pr-4">
          {faq.question}
        </h3>
        <div className="flex-shrink-0">
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-zinc-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-zinc-400" />
          )}
        </div>
      </button>
      {isOpen && (
        <div className="px-6 pb-4">
          <div className="pt-2 border-t border-black">
            <p className="text-zinc-300 leading-relaxed">{faq.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export const FAQSection: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };

  // Generate JSON-LD structured data for SEO
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqData.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section
        className="py-24 px-4"
        id="faq"
        role="region"
        aria-labelledby="faq-heading"
      >
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-black rounded-xl backdrop-blur-sm mb-6">
              <HelpCircle className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-zinc-400">
                Frequently Asked Questions
              </span>
            </div>

            <h2
              id="faq-heading"
              className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white"
            >
              Everything You Need to Know
            </h2>

            <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium">
              Get answers to common questions about NeuroLint's free CLI tool,
              safety features, and how it fixes React & Next.js bugs automatically.
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                faq={faq}
                isOpen={openItems.has(index)}
                onToggle={() => toggleItem(index)}
              />
            ))}
          </div>

          {/* Additional Help */}
          <div className="mt-16 text-center">
            <div className="p-8 bg-zinc-900/40 border border-black rounded-2xl backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-4">
                Need more help?
              </h3>
              <p className="text-zinc-400 mb-6">
                Check out our comprehensive documentation or reach out for support.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://github.com/Alcatecablee/Neurolint-CLI/blob/main/CLI_USAGE.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  View Documentation
                </a>
                <a
                  href="mailto:clivemakazhu@gmail.com"
                  className="inline-flex items-center px-6 py-3 bg-zinc-800 text-white font-semibold rounded-xl border border-black hover:bg-zinc-700 transition-colors"
                >
                  Email Support
                </a>
              </div>

              {/* CTA for FAQ Section */}
              <InstallCTA className="mt-8" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
