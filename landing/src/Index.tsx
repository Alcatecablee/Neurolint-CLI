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


import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { FAQSection } from "./FAQSection";
import { LandingHeader } from "./LandingHeader";
import { ModalDemo } from "./components/ModalDemo";
import { LayersDocSection } from "./components/LayersDocSection";
import { LandingFooter } from "./LandingFooter";
import { DemoCarousel } from "./components/DemoCarousel";
import { TestimonialsSection } from "./components/TestimonialsSection";
import { TrustMetrics } from "./components/TrustMetrics";
import { StarField } from "./components/StarField";
import { useIndexNow } from "./hooks/useIndexNow";

import {
  Target,
  Zap,
  Search,
  Puzzle,
  BarChart3,
  Atom,
  Settings,
  Copy,
  Check,
  GitBranch,
  Shield,
  RefreshCw,
  CheckSquare,
  FileCheck,
  X,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { InstallCTA } from "./components/InstallCTA";

// Security Alert Modal Component - Critical CVE notification
const SecurityAlertModal = ({ onClose }: { onClose: () => void }) => {
  const [copied, setCopied] = React.useState(false);
  
  const copyCommand = () => {
    navigator.clipboard.writeText('npx @neurolint/cli security:cve-2025-55182 . --fix');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-black rounded-xl shadow-2xl animate-slide-in-up">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-12 h-12 bg-zinc-800 border border-black rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-1">
                Critical Security Vulnerability
              </h2>
              <p className="text-sm text-gray-400">
                CVE-2025-55182 | CVSS 10.0
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-300">
              A critical remote code execution vulnerability affects all React 19 apps using Server Components. Patch immediately.
            </p>
            
            <div className="bg-zinc-800 border border-black rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">One-Command Fix</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm text-white font-mono">
                  npx @neurolint/cli security:cve-2025-55182 . --fix
                </code>
                <button
                  onClick={copyCommand}
                  className="p-2 bg-zinc-700 hover:bg-zinc-600 border border-black rounded-lg transition-colors"
                  aria-label="Copy command"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/blog/react-rce-patch"
              className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-black text-white rounded-lg font-medium text-sm text-center transition-colors"
            >
              Learn More
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white hover:bg-gray-100 text-black rounded-lg font-semibold text-sm transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Beta Banner Component - Floating notification style (mobile-first)
const BetaBanner = ({ onClose }: { onClose: () => void }) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto z-50 max-w-sm animate-slide-in-up">
      <div className="bg-zinc-900/95 backdrop-blur-md border border-black rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center border border-black">
            <span className="text-sm">Beta</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-300 leading-relaxed">
              <span className="text-white font-medium">NeuroLint CLI is in beta.</span>{" "}
              We'd love your feedback and contributions!
            </p>
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Share feedback
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white"
            aria-label="Close banner"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Lazy Loading Hook
const useInView = (threshold = 0.1) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, isInView] as const;
};

// Headline Component - Static main headline with animated sub-text
const TypewriterHeadline = () => {
  const [currentText, setCurrentText] = React.useState("");
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);

  const words = [
    "hydration crashes in seconds",
    "missing React keys automatically", 
    "80+ security vulnerabilities",
    "React 19 breaking changes",
    "Next.js 15.5 deprecations",
    "SSR guard issues instantly",
  ];

  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    const typingSpeed = 80;
    const deletingSpeed = 40;
    const delayBetweenWords = 2500;

    const currentWord = words[currentWordIndex];
    if (!currentWord) return;

    if (currentIndex < currentWord.length) {
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev + currentWord[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);
    } else {
      timeout = setTimeout(
        () => {
          if (currentText.length > 0) {
            setCurrentText((prev) => prev.slice(0, -1));
          } else {
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
            setCurrentIndex(0);
          }
        },
        currentText.length === currentWord.length
          ? delayBetweenWords
          : deletingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, currentText, currentWordIndex, words]);

  return (
    <div className="mb-8 md:mb-12">
      <h2 className="text-3xl xs:text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4">
        Fix Your React Code Automatically
      </h2>
      <p className="text-lg sm:text-xl md:text-2xl text-gray-400">
        Eliminate{" "}
        <span className="text-white font-semibold inline-block min-w-[180px] sm:min-w-[220px] md:min-w-[280px]">
          {currentText}
        </span>
      </p>
    </div>
  );
};

export default function Index() {
  const [mounted, setMounted] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [bannerVisible, setBannerVisible] = React.useState(true);

  useIndexNow();

  // Lazy loading refs for each section
  const [demoSectionRef, demoSectionInView] = useInView(0.1);
  const [howItWorksSectionRef, howItWorksInView] = useInView(0.2);
  const [orchestrationSectionRef, orchestrationSectionInView] = useInView(0.2);
  const [faqSectionRef, faqSectionInView] = useInView(0.2);
  const [finalCtaSectionRef, finalCtaSectionInView] = useInView(0.2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm install -g @neurolint/cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  React.useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll(".feature-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
        (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
      });
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const [securityBannerVisible, setSecurityBannerVisible] = React.useState(false);

  const handleSecurityModalClose = () => {
    setSecurityBannerVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('neurolint-security-modal-seen', 'true');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden" id="main-content">
      {/* Security Alert Modal - Only show once per session */}
      {securityBannerVisible && <SecurityAlertModal onClose={handleSecurityModalClose} />}
      
      {/* Beta Banner - Only show on desktop, not with security modal */}
      {bannerVisible && !securityBannerVisible && window.innerWidth >= 768 && (
        <BetaBanner onClose={() => setBannerVisible(false)} />
      )}


      {/* Floating Centered Navigation */}
      <LandingHeader />

      {/* Hero Section - Clean Demora-style */}
      <section
        className="min-h-[90vh] flex items-center justify-center text-center px-4 py-16 pt-24 relative bg-[#050508]"
        aria-label="Hero section"
        role="main"
      >
        {/* Animated Stars */}
        <StarField />
        
        {/* Subtle gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black pointer-events-none" />

        <div className="max-w-4xl mx-auto z-10 animate-fade-in-blur">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Automatically Fix React & Next.js Bugs
            <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">in Seconds</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-400 font-normal mb-3 max-w-2xl mx-auto leading-relaxed">
            Auto-fix hydration errors, missing keys, and ESLint issues.
          </p>
          <p className="text-base sm:text-lg text-gray-300 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            <span className="text-blue-400">No AI.</span> <span className="text-blue-400">No guesswork.</span> <span className="text-blue-400">No hallucinations.</span>
            <br />
            We don't guess what your code should be. We apply proven rules to fix what's definitely broken.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <a
              href="https://www.npmjs.com/package/@neurolint/cli"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 text-base font-medium rounded-lg bg-white hover:bg-gray-100 text-black transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              to="/docs"
              className="px-6 py-3 text-base font-medium rounded-lg bg-transparent border border-black text-white hover:bg-white/5 transition-all duration-200"
            >
              View Docs
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Metrics Section */}
      <section className="py-16 px-4 relative z-10">
        <TrustMetrics className="max-w-4xl mx-auto" />
      </section>

      {/* Social Proof Badges - Moved up for better conversion */}
      <section className="py-8 md:py-12 bg-black" data-testid="social-proof-section">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-80 hover:opacity-100 transition-opacity duration-500">
            <a 
              href="https://www.producthunt.com/products/neurolint-cli?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-neurolint-cli" 
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-105"
              data-testid="producthunt-badge"
            >
              <img 
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1043969&theme=dark&t=1764635497036" 
                alt="NeuroLint CLI Featured on Product Hunt - Voted as an Essential Tool for React and Next.js Developers to Automate Code Fixes" 
                width="200" 
                height="44"
                className="h-9 sm:h-10 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            </a>
            
            <a 
              href="https://startupfa.me/s/neurolint-cli?utm_source=neurolint.dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-105"
              data-testid="startupfame-badge"
            >
              <img 
                src="https://startupfa.me/badges/featured/dark-small-rounded.webp" 
                alt="NeuroLint CLI Featured on Startup Fame - Recognized as a Top Emerging Open Source Security and Code Quality Tool for Modern Web Apps" 
                width="180" 
                height="28"
                className="h-7 sm:h-8 w-auto grayscale hover:grayscale-0 transition-all duration-300"
              />
            </a>
            
            <a 
              href="https://github.com/Alcatecablee/Neurolint-CLI/stargazers" 
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 hover:scale-105"
              data-testid="github-stars-badge"
            >
              <img 
                src="https://img.shields.io/github/stars/Alcatecablee/Neurolint-CLI?style=for-the-badge&logo=github&logoColor=white&labelColor=181717&color=181717" 
                alt="GitHub Stars" 
                height="24"
                className="h-6 sm:h-7 w-auto"
              />
            </a>
          </div>
        </div>
      </section>

      {/* Install Command Section with CTA */}
      <section className="py-12 md:py-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-lg sm:text-xl text-gray-300 font-medium mb-6">Ready to fix your code?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <button
              onClick={() => window.open("https://www.npmjs.com/package/@neurolint/cli", "_blank")}
              className="px-6 py-3 text-base font-medium rounded-lg bg-white hover:bg-gray-100 text-black transition-all duration-200 shadow-lg flex items-center gap-2"
            >
              Install Now
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/docs"
              className="px-6 py-3 text-base font-medium rounded-lg bg-transparent border border-white/30 text-white hover:bg-white/5 transition-all duration-200"
            >
              View Docs
            </Link>
          </div>
          <div className="bg-zinc-900/80 border border-black rounded-xl p-4 md:p-5 backdrop-blur-sm relative group hover:border-black transition-colors duration-300">
            <code className="text-blue-400 font-mono text-sm md:text-base lg:text-lg block text-center pr-10">
              $ npm install -g @neurolint/cli
            </code>
            <button
              onClick={copyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-white/10 rounded-md transition-colors"
              aria-label="Copy install command"
            >
              {copied ? (
                <Check className="w-4 h-4 text-blue-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400 group-hover:text-white" />
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials Section - High up for trust building */}
      <TestimonialsSection />

      {/* Interactive Demo Section */}
      <div id="comprehensive-demo" ref={demoSectionRef} className={`transition-all duration-1000 transform ${
        demoSectionInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-20'
      }`}>
        <ModalDemo />
      </div>

      {/* Layers Documentation Section */}
      <LayersDocSection />

      {/* How It Works Section - Simplified and moved up */}
      <section ref={howItWorksSectionRef} className="py-16 md:py-24 px-4" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-16 md:mb-20 transition-all duration-700 ease-out transform ${
            howItWorksInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'
          }`}>
            <h2 
              id="how-it-works-heading"
              className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white transition-all duration-700 delay-100 ease-out transform px-4 ${
                howItWorksInView
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              One Command, Thousands of Fixes
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium transition-all duration-700 delay-200 ease-out transform px-4 ${
              howItWorksInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              Unlike other tools that suggest fixes, we actually apply them automatically
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                title: "Install",
                description:
                  "npm install -g @neurolint/cli - One command to install the free CLI tool globally",
              },
              {
                step: "02",
                title: "Analyze",
                description:
                  "neurolint analyze src/ - Scan your codebase and detect hydration crashes, missing keys, and ESLint errors",
              },
              {
                step: "03",
                title: "Fix",
                description:
                  "neurolint fix --all-layers - Apply automatic fixes with built-in backups. Rollback anytime if needed.",
              },
            ].map((item, index) => (
              <div 
                key={index} 
                className={`group relative transition-all duration-700 ease-out transform ${
                  howItWorksInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{ transitionDelay: `${(index * 150) + 400}ms` }}
              >
                <div className="relative p-6 md:p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl border-2 border-black rounded-2xl transition-all duration-300 ease-out hover:bg-gradient-to-br hover:from-white/8 hover:to-white/4 hover:border-black min-h-[280px] sm:min-h-[320px] flex flex-col shadow-lg hover:shadow-2xl focus-within:ring-2 focus-within:ring-white/30 focus-within:ring-offset-2 focus-within:ring-offset-black">
                  <div className="text-4xl md:text-5xl font-black text-white mb-3 md:mb-4" aria-hidden="true">
                    {item.step}
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-white leading-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed font-medium text-sm md:text-base flex-grow">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA for How It Works Section */}
          <InstallCTA className="mt-16" />
        </div>
      </section>

      {/* Orchestration Pattern Section */}
      <section ref={orchestrationSectionRef} className="py-20 md:py-32 px-4 bg-gradient-to-b from-black via-zinc-900/30 to-black">
        <div className="max-w-7xl mx-auto">
          <div className={`text-center mb-20 transition-all duration-700 ease-out transform ${
            orchestrationSectionInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'
          }`}>
            <h2 className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white transition-all duration-700 delay-100 ease-out transform ${
              orchestrationSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              Why NeuroLint Never Breaks Your Code
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed transition-all duration-700 delay-200 ease-out transform ${
              orchestrationSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              The 5-Step Fail-Safe Orchestration System That AI Tools Can't Match
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
            {[
              {
                stage: "1",
                title: "AST Transform",
                description: "Try precise code transformation using Abstract Syntax Tree parsing for deep structural understanding.",
                Icon: GitBranch
              },
              {
                stage: "2",
                title: "First Validation",
                description: "Immediately validate the AST result to ensure code remains syntactically correct and semantically sound.",
                Icon: FileCheck
              },
              {
                stage: "3",
                title: "Regex Fallback",
                description: "If AST or validation fails, fall back to regex-based transformation as a safety net.",
                Icon: RefreshCw
              },
              {
                stage: "4",
                title: "Second Validation",
                description: "Re-validate the regex result with the same strict checks. Every path must pass validation — no shortcuts.",
                Icon: CheckSquare
              },
              {
                stage: "5",
                title: "Accept or Revert",
                description: "Only apply changes if validation passed. If validation fails at any step, automatically revert to last known good state.",
                Icon: Shield
              }
            ].map((item, index) => (
              <div
                key={index}
                className={`bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl p-6 md:p-8 rounded-2xl border-2 border-black hover:border-black hover:from-white/8 hover:to-white/4 transition-all duration-700 ease-out transform shadow-lg hover:shadow-2xl ${
                  orchestrationSectionInView
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-20 scale-95'
                }`}
                style={{ transitionDelay: `${(index * 100) + 400}ms` }}
              >
                <div className="mb-4">
                  <item.Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mb-3">Stage {item.stage}</div>
                <h3 className="text-lg md:text-xl font-bold mb-3 text-white leading-tight">{item.title}</h3>
                <p className="text-sm md:text-base text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className={`max-w-6xl mx-auto space-y-12 transition-all duration-700 ease-out transform ${
            orchestrationSectionInView
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-20'
          }`} style={{ transitionDelay: '850ms' }}>
            
            {/* AI Tools vs NeuroLint Comparison */}
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border-2 border-black shadow-2xl overflow-hidden">
              <div className="bg-black/40 border-b border-black p-6 md:p-8">
                <h3 className="text-4xl sm:text-5xl md:text-6xl font-black text-white text-center tracking-tight">AI Tools vs NeuroLint</h3>
              </div>
              <div className="p-8 md:p-12">
                <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                  <div className="bg-black/60 border-2 border-black rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-black transition-all duration-300">
                    <h4 className="text-xl md:text-2xl font-black text-zinc-400 mb-6">
                      AI Code Tools
                    </h4>
                    <div className="space-y-4 text-zinc-400 text-sm md:text-base">
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">01</span>
                        <span>Generate code without validation</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">02</span>
                        <span>Hallucinate invalid syntax</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">03</span>
                        <span>Break production deployments</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/5 border border-black">
                        <span className="text-zinc-500 font-mono">04</span>
                        <span>Waste developer time debugging</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/60 border-2 border-black rounded-2xl p-6 md:p-8 backdrop-blur-xl hover:border-black transition-all duration-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                    <h4 className="text-xl md:text-2xl font-black text-white mb-6 relative">
                      NeuroLint
                    </h4>
                    <div className="space-y-4 text-gray-200 text-sm md:text-base relative">
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">01</span>
                        <span>Validate every transformation twice</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">02</span>
                        <span>Deterministic, rule-based fixes</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">03</span>
                        <span>Auto-revert on validation failure</span>
                      </div>
                      <div className="flex items-start gap-4 p-3 rounded-xl bg-white/10 border border-black">
                        <span className="text-white font-mono font-bold">04</span>
                        <span>Guaranteed valid code output</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA for Orchestration Section */}
            <InstallCTA className="mt-12" />
              
          </div>
        </div>
      </section>

      {/* ESLint Comparison Section - Professional stylish implementation */}
      <section className="py-24 px-4 bg-black relative overflow-hidden" id="eslint-alternative">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white">
              ESLint Alternative with Automatic Fixes
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              The only ESLint replacement that doesn't just flag errors — it fixes them automatically
            </p>
          </div>

          <div className="bg-zinc-900/50 border border-black rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black bg-white/[0.02]">
                    <th className="py-6 px-8 text-sm font-semibold text-gray-400 uppercase tracking-wider">Feature</th>
                    <th className="py-6 px-8 text-sm font-semibold text-gray-400 uppercase tracking-wider text-center">ESLint Plugins</th>
                    <th className="py-6 px-8 text-sm font-semibold text-white uppercase tracking-wider text-center bg-white/[0.03]">
                      <div className="flex flex-col items-center gap-1">
                        <img src="/logo.png" alt="NeuroLint" className="h-4 opacity-90" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black">
                  {[
                    { feature: "Detect window/document usage", eslint: "check", neuro: "check" },
                    { feature: "Auto-wrap with SSR guards", eslint: "cross", neuro: "check" },
                    { feature: "Detect missing React keys", eslint: "check", neuro: "check" },
                    { feature: "Auto-fix missing keys", eslint: "cross", neuro: "check" },
                    { feature: "Detect localStorage usage", eslint: "warning", neuro: "check" },
                    { feature: "Avoid double-wrapping", eslint: "cross", neuro: "check" },
                    { feature: "React 19 migration fixes", eslint: "cross", neuro: "check" },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="py-5 px-8 text-gray-300 font-medium group-hover:text-white transition-colors">{row.feature}</td>
                      <td className="py-5 px-8 text-center">
                        <div className="flex justify-center">
                          {row.eslint === "check" ? (
                            <Check className="w-5 h-5 text-green-500/80" />
                          ) : row.eslint === "warning" ? (
                            <div className="flex flex-col items-center gap-0.5">
                              <AlertCircle className="w-5 h-5 text-amber-500/80" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center gap-0.5">
                              <X className="w-5 h-5 text-red-500/60" />
                              <span className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">N/A</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-8 text-center bg-white/[0.02] border-x border-black">
                        <div className="flex justify-center">
                          <Check className="w-5 h-5 text-green-400" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link 
              to="/compare/eslint" 
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-medium"
            >
              View detailed comparison
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      </section>

      {/* Hydration Errors Section - Professional stylish implementation */}
      <section className="py-24 px-4 bg-black relative overflow-hidden" id="hydration-fixes">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white">
              Fix Hydration Errors Automatically
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto font-medium leading-relaxed">
              Prevents hydration mismatches in Next.js SSR by guarding browser APIs. No more "window is not defined".
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* Feature 1: Smart SSR Guards */}
            <div className="bg-zinc-900/40 border border-black rounded-2xl p-8 md:p-10 backdrop-blur-sm group hover:border-blue-500/20 transition-all duration-500">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1 space-y-6">
                  <div className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-px bg-blue-500/30"></span>
                    Browser API Guarding
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    localStorage & Window Safety
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    NeuroLint detects usage of browser-only APIs and automatically wraps them in <code className="text-blue-400">typeof window !== 'undefined'</code> guards. It intelligently handles initial state, expressions, and assignments.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "7 Window APIs (matchMedia, location, navigator, etc.)",
                      "8 Document APIs (querySelector, body, head, etc.)",
                      "Storage APIs (localStorage & sessionStorage)",
                      "Smart detection skips already-guarded code"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full bg-black/60 border border-black rounded-xl overflow-hidden p-6 font-mono text-sm relative">
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/20" />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-zinc-600 block mb-2">// ❌ Hydration Error</span>
                      <code className="text-red-400 block break-all">const val = localStorage.getItem('key')</code>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <span className="text-zinc-400 block mb-2">// ✓ NeuroLint Fixed</span>
                      <code className="text-green-400 block break-all">
                        const val = typeof window !== 'undefined' ? localStorage.getItem('key') : null
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Effect Cleanup */}
            <div className="bg-zinc-900/40 border border-black rounded-2xl p-8 md:p-10 backdrop-blur-sm group hover:border-purple-500/20 transition-all duration-500">
              <div className="flex flex-col md:flex-row-reverse gap-10 items-start">
                <div className="flex-1 space-y-6">
                  <div className="text-sm font-bold text-purple-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-8 h-px bg-purple-500/30"></span>
                    Lifecycle Hardening
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                    Event Listener Auto-Cleanup
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    Prevent memory leaks and hydration ghosting. NeuroLint identifies window event listeners and automatically injects the corresponding <code className="text-purple-400">removeEventListener</code> in the useEffect cleanup phase.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Dual-Mode: AST parsing with Regex fallback",
                      "Expression-level vs Statement-level wrapping",
                      "Auto-reverts on validation failure",
                      "1035+ lines of verified transformation logic"
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                        <Check className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 w-full bg-black/60 border border-black rounded-xl overflow-hidden p-6 font-mono text-sm relative">
                  <div className="space-y-4">
                    <div>
                      <span className="text-zinc-600 block mb-2">// Before: Potential Leak</span>
                      <code className="text-red-400 block">
                        useEffect(() =&gt; {"{"}
                        <br />
                        &nbsp;&nbsp;window.addEventListener('resize', fn)
                        <br />
                        {"}"}, [])
                      </code>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <span className="text-zinc-400 block mb-2">// After: Safe Cleanup</span>
                      <code className="text-green-400 block">
                        useEffect(() =&gt; {"{"}
                        <br />
                        &nbsp;&nbsp;window.addEventListener('resize', fn)
                        <br />
                        &nbsp;&nbsp;return () =&gt; window.removeEventListener('resize', fn)
                        <br />
                        {"}"}, [])
                      </code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            <Link 
              to="/fixes/hydration-mismatch" 
              className="px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              Learn More About Hydration Fixes
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Decorative background glow */}
        <div className="absolute bottom-0 right-0 w-full max-w-4xl aspect-square bg-purple-500/5 blur-[120px] rounded-full pointer-events-none translate-x-1/2 translate-y-1/2" />
      </section>

      {/* FAQ Section */}
      <div ref={faqSectionRef} className={`transition-all duration-1000 transform ${
        faqSectionInView
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-20'
      }`}>
        <FAQSection />
      </div>

      {/* Final CTA Section */}
      <section ref={finalCtaSectionRef} className="py-24 px-4">
        <div className="max-w-6xl mx-auto relative">
          <div className={`relative bg-gradient-to-r from-zinc-800 to-black backdrop-blur-xl border-2 border-black rounded-3xl p-8 sm:p-12 md:p-16 lg:p-24 text-center transition-all duration-700 ease-out transform shadow-lg ${
            finalCtaSectionInView
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-20 scale-95'
          }`}>
            <h2 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-6 md:mb-8 tracking-tight text-white transition-all duration-700 delay-100 ease-out transform px-4 ${
              finalCtaSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              Stop Shipping Bugs. Start Using NeuroLint.
            </h2>
            <p className={`text-lg sm:text-xl md:text-2xl text-gray-300 mb-10 md:mb-16 max-w-4xl mx-auto font-medium transition-all duration-700 delay-200 ease-out transform px-4 ${
              finalCtaSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-10'
            }`}>
              100% Free CLI. No registration required. Automatic backups included.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center transition-all duration-700 delay-300 ease-out transform ${
              finalCtaSectionInView
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-20'
            }`}>
              <a
                href="https://www.npmjs.com/package/@neurolint/cli"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 active:bg-gray-200 transition-all duration-300 ease-out text-base sm:text-lg shadow-2xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[48px] touch-manipulation"
                aria-label="Install NeuroLint CLI from npm"
              >
                Install Free CLI
              </a>
              <a
                href="#comprehensive-demo"
                className="px-8 sm:px-10 py-4 sm:py-5 bg-black/60 text-white font-bold rounded-2xl border-2 border-black hover:bg-black/80 hover:border-black active:bg-black transition-all duration-300 ease-out text-base sm:text-lg backdrop-blur-xl hover:scale-[1.02] active:scale-[0.98] shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-black min-h-[48px] touch-manipulation"
                aria-label="Try interactive demo"
              >
                Try Interactive Demo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
