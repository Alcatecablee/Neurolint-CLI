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
import { LandingHeader } from "./LandingHeader";
import { StarField } from "./components/StarField";
import { Calendar, Clock, ArrowRight, X } from "lucide-react";
import { useMetaTags } from "./hooks/useMetaTags";

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
    slug: "react-rce-patch",
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
    slug: "react2shell-exploit",
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
    slug: "nextjs-rce-patch",
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
    slug: "cve-detection-guide",
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
    slug: "security-forensics",
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
    slug: "fix-hydration-errors",
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
    slug: "8-layer-pipeline",
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
    slug: "eslint-vs-neurolint",
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
    slug: "react-19-migration",
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

export const BlogPage: React.FC = () => {
  useMetaTags({
    title: "NeuroLint Blog - React, Next.js & Security Insights",
    description: "Read in-depth guides on React hydration errors, Next.js migrations, CVE security updates, and automated code fixing. Expert articles on modern JavaScript development.",
    keywords: "React blog, Next.js blog, security, CVE, code fixing, development guides, React 19, TypeScript",
    ogTitle: "NeuroLint Blog - React & Next.js Development Guides",
    ogDescription: "Expert articles on fixing React hydration errors, Next.js migrations, security vulnerabilities, and automated code transformations.",
    ogUrl: "https://www.neurolint.dev/blog",
    ogImage: "https://www.neurolint.dev/og-image.png",
    canonical: "https://www.neurolint.dev/blog",
    twitterCard: "summary_large_image",
    twitterCreator: "@neurolint",
    twitterImage: "https://www.neurolint.dev/og-image.png",
    articleSection: "Blog"
  });

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      <StarField />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black pointer-events-none" />
      <BlogList />
    </div>
  );
};

const BlogList: React.FC = () => {
  return (
    <>
      <LandingHeader />
      <div className="relative z-10 pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">NeuroLint Blog</h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Expert insights on React, Next.js, code fixing, and security. Stay updated with the latest development practices.
          </p>
        </div>
        <FeaturedPostsSection />
        <AllPostsSection />
      </div>
      <LandingFooter />
    </>
  );
};

const Header: React.FC = () => {
  return null;
};

const FeaturedPostsSection: React.FC = () => {
  const featured = blogPosts.filter((post) => post.featured);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-b border-black/20">
      <h2 className="text-2xl font-bold text-white mb-8">Featured</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featured.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
};

const AllPostsSection: React.FC = () => {
  const nonFeatured = blogPosts.filter((post) => !post.featured);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-white mb-8">All Articles</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nonFeatured.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
};

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

// Deprecated: Use BlogPage instead. Kept for backward compatibility with imports.
export const Blog: React.FC = BlogPage;

// Old implementation kept as reference - remove in future refactor
const _LegacyBlog: React.FC = () => {
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
      
      <div className="min-h-screen bg-[#050508] text-white">
        <LandingHeader />

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

export default BlogPage;
