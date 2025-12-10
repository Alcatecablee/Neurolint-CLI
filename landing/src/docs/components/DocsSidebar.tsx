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
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  items?: NavItem[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigation: NavSection[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Quick Start", href: "/docs/quickstart" },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "How It Works", href: "/docs/how-it-works" },
      { title: "The 8-Layer Architecture", href: "/docs/architecture" },
      { title: "AST Transformations", href: "/docs/ast-transformations" },
    ],
  },
  {
    title: "Commands",
    items: [
      { title: "CLI Reference", href: "/docs/cli-reference" },
      { title: "analyze", href: "/docs/commands/analyze" },
      { title: "fix", href: "/docs/commands/fix" },
      { title: "migrate-react19", href: "/docs/commands/migrate-react19" },
      { title: "migrate-nextjs-16", href: "/docs/commands/migrate-nextjs-16" },
    ],
  },
  {
    title: "Layers",
    items: [
      { title: "Layer 1: Configuration", href: "/docs/layers/config" },
      { title: "Layer 2: Patterns", href: "/docs/layers/patterns" },
      { title: "Layer 3: Components", href: "/docs/layers/react-repair" },
      { title: "Layer 4: Hydration", href: "/docs/layers/hydration" },
      { title: "Layer 5: Next.js", href: "/docs/layers/nextjs" },
      { title: "Layer 6: Testing", href: "/docs/layers/testing" },
      { title: "Layer 7: Adaptive", href: "/docs/layers/adaptive" },
      { title: "Layer 8: Security Forensics", href: "/docs/layers/security" },
    ],
  },
  {
    title: "Security",
    items: [
      { title: "CVE-2025-55182", href: "/docs/security/cve-2025-55182" },
      { title: "IoC Detection", href: "/docs/security/ioc-detection" },
      { title: "Incident Response", href: "/docs/security/incident-response" },
    ],
  },
  {
    title: "Guides",
    items: [
      { title: "CI/CD Integration", href: "/docs/guides/ci-cd" },
      { title: "Backup & Restore", href: "/docs/guides/backup" },
      { title: "Troubleshooting", href: "/docs/guides/troubleshooting" },
    ],
  },
];

interface DocsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DocsSidebar({ isOpen, onClose }: DocsSidebarProps) {
  const location = useLocation();
  const [expandedSections, setExpandedSections] = React.useState<string[]>(
    navigation.map((s) => s.title)
  );

  const toggleSection = (title: string) => {
    setExpandedSections((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-14 left-0 z-40 w-64 h-[calc(100vh-3.5rem)] 
          bg-black/90 backdrop-blur-xl border-r border-white/5 overflow-y-auto
          transition-transform duration-200 ease-out
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <nav className="p-4 space-y-6">
          {navigation.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full text-left mb-2 group"
              >
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider group-hover:text-gray-400 transition-colors">
                  {section.title}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition-transform ${
                    expandedSections.includes(section.title) ? "" : "-rotate-90"
                  }`}
                />
              </button>

              {expandedSections.includes(section.title) && (
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.href}>
                      <Link
                        to={item.href}
                        onClick={onClose}
                        className={`
                          block px-3 py-2 text-sm rounded-md transition-colors
                          ${
                            isActive(item.href)
                              ? "bg-zinc-800 text-white font-medium"
                              : "text-gray-400 hover:text-white hover:bg-zinc-800/50"
                          }
                        `}
                      >
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 mt-6">
          <div className="text-xs text-gray-500">
            <span className="block mb-1">Version 1.4.9</span>
            <a
              href="https://github.com/Alcatecablee/Neurolint-CLI/releases"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
            >
              View changelog
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
