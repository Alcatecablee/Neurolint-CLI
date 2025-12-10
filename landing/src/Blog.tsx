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
import { Calendar, Clock, ArrowRight, X } from "lucide-react";

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  featured?: boolean;
}

const blogPosts: BlogPost[] = [
  {
    slug: "cve-2025-55182-react-server-components-rce",
    title: "CVE-2025-55182: Critical React Server Components RCE Vulnerability - Complete Guide",
    description: "A critical remote code execution vulnerability (CVSS 10.0) affects React 19 apps using Server Components. Learn about threat actors, exploitation timeline, detection, and patching.",
    date: "2025-12-08",
    readTime: "12 min read",
    author: "NeuroLint Team",
    category: "Security",
    tags: ["Security", "CVE", "React 19", "Next.js", "RCE", "Threat Intelligence"],
    featured: true,
  },
  {
    slug: "react2shell-cve-2025-55182-exploit-explained",
    title: "React2Shell Explained: How CVE-2025-55182 Enables Remote Code Execution in React Apps",
    description: "Deep dive into React2Shell (CVE-2025-55182) - the critical unauthenticated RCE vulnerability in React Server Components Flight protocol. Understand the attack vector, proof of concept, and how to protect your applications.",
    date: "2025-12-08",
    readTime: "14 min read",
    author: "NeuroLint Team",
    category: "Security",
    tags: ["React2Shell", "CVE-2025-55182", "RCE", "React 19", "Flight Protocol", "Security"],
    featured: true,
  },
  {
    slug: "cve-2025-66478-nextjs-rce-vulnerability",
    title: "CVE-2025-66478: Next.js Server Actions RCE - What You Need to Know",
    description: "CVE-2025-66478 is the Next.js variant of the React2Shell vulnerability. Learn how this critical RCE affects Next.js 14 and 15 applications using Server Actions, and how to patch immediately with NeuroLint.",
    date: "2025-12-07",
    readTime: "11 min read",
    author: "NeuroLint Team",
    category: "Security",
    tags: ["CVE-2025-66478", "Next.js", "Server Actions", "RCE", "React2Shell", "Security"],
    featured: true,
  },
  {
    slug: "detecting-post-exploitation-cve-2025-55182",
    title: "Detecting Post-Exploitation: How to Know If CVE-2025-55182 Was Used Against You",
    description: "Patching isn't enough. Learn how to detect if your React/Next.js application was already compromised by CVE-2025-55182 using NeuroLint's Layer 8 Security Forensics.",
    date: "2025-12-07",
    readTime: "10 min read",
    author: "NeuroLint Team",
    category: "Security",
    tags: ["Security", "Forensics", "IoC", "Incident Response", "React 19"],
    featured: true,
  },
  {
    slug: "layer-8-security-forensics-deep-dive",
    title: "Layer 8 Security Forensics: Deep Dive into NeuroLint's Compromise Detection Engine",
    description: "Explore NeuroLint's Layer 8 security forensics capabilities - 80+ IoC signatures, AST-based behavioral analysis, RSC-specific patterns, and baseline integrity checking.",
    date: "2025-12-06",
    readTime: "15 min read",
    author: "NeuroLint Team",
    category: "Deep Dives",
    tags: ["Security", "AST", "Architecture", "Layer 8", "Forensics"],
    featured: false,
  },
  {
    slug: "fix-react-nextjs-hydration-errors-complete-guide",
    title: "How to Fix React Hydration Errors Automatically: Complete 2025 Guide",
    description: "Fix 'window is not defined', 'document is not defined', and SSR hydration mismatches in React & Next.js. Learn the exact patterns that cause React hydration errors and how to fix them automatically with AST-based code transformation.",
    date: "2025-12-05",
    readTime: "12 min read",
    author: "NeuroLint Team",
    category: "Tutorials",
    tags: ["React Hydration Error Fix", "Next.js SSR", "React Debugging", "Code Fixer"],
    featured: true,
  },
  {
    slug: "8-layer-code-fixing-pipeline-explained",
    title: "Automated React Code Fixer: How the 8-Layer Pipeline Works (ESLint Alternative)",
    description: "Discover how AST-based code transformation automatically fixes 700+ React and Next.js issues. Better than ESLint for automated fixes - deterministic results, no AI hallucinations, instant code repair.",
    date: "2025-12-04",
    readTime: "15 min read",
    author: "NeuroLint Team",
    category: "Deep Dives",
    tags: ["React Code Fixer", "ESLint Alternative", "AST Transformation", "Automated Fixes"],
    featured: true,
  },
  {
    slug: "eslint-vs-neurolint-why-rule-based-fixing-wins",
    title: "ESLint vs NeuroLint: Why Rule-Based Code Fixing Beats Linting in 2025",
    description: "ESLint finds problems, NeuroLint fixes them. Compare the traditional linting approach vs automated AST-based code transformation. See why developers are switching from ESLint warnings to automatic fixes.",
    date: "2025-12-10",
    readTime: "10 min read",
    author: "NeuroLint Team",
    category: "Comparisons",
    tags: ["ESLint Alternative", "React Code Fixer", "Linting", "Automated Fixes"],
    featured: true,
  },
  {
    slug: "react-19-migration-guide-breaking-changes-fixes",
    title: "React 19 Migration Guide: Fix Breaking Changes Automatically (2025)",
    description: "Upgrade from React 18 to React 19 without the headaches. This guide covers all React 19 breaking changes and shows how to automatically fix ReactDOM.render, act() imports, and deprecated APIs.",
    date: "2025-12-10",
    readTime: "14 min read",
    author: "NeuroLint Team",
    category: "Tutorials",
    tags: ["React 19 Migration", "Breaking Changes", "Next.js Migration", "Automated Fixes"],
    featured: true,
  },
];

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => {
  const isSecurityPost = post.category === "Security";
  
  return (
    <Link 
      to={`/blog/${post.slug}`}
      className="group block bg-zinc-900/80 border border-black rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-black/80 hover:shadow-white/5"
    >
      <div className="aspect-video relative overflow-hidden bg-zinc-800/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-black text-white/10 group-hover:text-white/20 transition-colors">
            {isSecurityPost ? "CVE" : post.category === "Tutorials" ? "01" : "02"}
          </div>
        </div>
        {post.featured && (
          <div className="absolute top-4 left-4 px-3 py-1 text-xs font-bold rounded-full bg-white text-black">
            {isSecurityPost ? "Security" : "Featured"}
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="flex items-center gap-3 text-sm text-gray-400 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {post.readTime}
          </span>
        </div>
        <h2 className="text-xl font-bold text-white mb-3 group-hover:text-gray-300 transition-colors line-clamp-2">
          {post.title}
        </h2>
        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
          {post.description}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2 py-1 bg-zinc-800 text-gray-400 text-xs rounded-full border border-black">
                {tag}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-blue-400 text-sm font-medium group-hover:gap-2 transition-all">
            Read more <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export const Blog: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    document.title = "React Code Fixer Blog | Fix Hydration Errors, ESLint Issues & Security Bugs - NeuroLint";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Learn how to fix React hydration errors, Next.js migration issues, and automate ESLint fixes. Expert guides on React debugging, code transformation, and security vulnerability detection for 2025.');
    }
    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 'React code fixer, fix React hydration errors, ESLint alternative, React debugging guide, Next.js migration tool, CVE-2025-55182, React Server Components security, automated bug fixer, React 19 migration');
    }
  }, []);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "NeuroLint Blog",
    "description": "Expert guides, tutorials, and deep dives on React, Next.js, and automated code fixing",
    "url": "https://www.neurolint.dev/blog",
    "publisher": {
      "@type": "Organization",
      "name": "NeuroLint",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.neurolint.dev/logo.png"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.description,
      "datePublished": post.date,
      "author": {
        "@type": "Organization",
        "name": post.author
      },
      "url": `https://www.neurolint.dev/blog/${post.slug}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="min-h-screen bg-black text-white">
        <nav className="fixed top-0 w-full z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-black transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 md:h-16">
              <Link to="/" className="flex items-center group">
                <img src="/logo.png" alt="NeuroLint" className="h-8 md:h-9 transition-transform duration-200 group-hover:scale-105" />
              </Link>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 touch-manipulation"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              <div className="hidden md:flex items-center gap-1">
                <Link 
                  to="/"
                  className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Home
                </Link>
                <a 
                  href="/#comprehensive-demo" 
                  className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Demo
                </a>
                <a 
                  href="/#faq" 
                  className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  FAQ
                </a>
                <Link 
                  to="/blog"
                  className="px-4 py-2 min-h-[44px] flex items-center text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Blog
                </Link>
                <a 
                  href="/docs"
                  className="px-4 py-2 min-h-[44px] flex items-center text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  Docs
                </a>
                <Link 
                  to="/security"
                  className="px-4 py-2 min-h-[44px] flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all duration-200 text-sm font-medium"
                >
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
                <a 
                  href="https://www.npmjs.com/package/@neurolint/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 px-5 py-2 min-h-[44px] flex items-center bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-sm"
                >
                  Install
                </a>
              </div>
            </div>
          </div>
          
          <div 
            className={`md:hidden transition-all duration-300 ease-out overflow-hidden ${
              mobileMenuOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="px-4 py-4 space-y-2 bg-zinc-900/95 backdrop-blur-xl border-t border-black">
              <Link 
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
              >
                Home
              </Link>
              <Link 
                to="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[48px] text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
              >
                Blog
              </Link>
              <a 
                href="/docs"
                className="block px-4 py-3 min-h-[48px] text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
              >
                Docs
              </a>
              <Link 
                to="/security"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-3 min-h-[48px] text-red-400 hover:text-red-300 hover:bg-red-500/5 rounded-lg transition-all duration-200 text-base font-medium touch-manipulation"
              >
                Security
              </Link>
              <div className="border-t border-black my-3"></div>
              <div className="flex items-center gap-3 px-4">
                <a 
                  href="https://github.com/Alcatecablee/Neurolint-CLI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center text-gray-300 hover:text-white bg-white/5 rounded-lg transition-all duration-200 touch-manipulation"
                  aria-label="GitHub"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
                <a 
                  href="https://www.npmjs.com/package/@neurolint/cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-5 py-3 min-h-[48px] flex items-center justify-center bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200 text-base touch-manipulation"
                >
                  Install CLI
                </a>
              </div>
            </div>
          </div>
        </nav>

        <main className="relative pt-32 pb-20 px-4">

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-black rounded-full mb-6">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <span className="text-gray-300 text-sm font-medium">Developer Resources</span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight">
                NeuroLint <span className="text-gray-400">Blog</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto">
                Expert guides on fixing React & Next.js bugs, understanding hydration errors, and automating code quality improvements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>

            <div className="mt-20 text-center">
              <div className="p-8 bg-zinc-900/80 border border-black rounded-xl">
                <h2 className="text-2xl font-bold mb-4">Want to contribute?</h2>
                <p className="text-gray-400 mb-6">
                  Have a topic you'd like us to cover? Open an issue on GitHub or submit a pull request.
                </p>
                <a
                  href="https://github.com/Alcatecablee/Neurolint/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Suggest a Topic
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </main>

        <LandingFooter />
      </div>
    </>
  );
};

export default Blog;
