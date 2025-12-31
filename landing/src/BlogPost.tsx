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
import { Link, useParams, Navigate } from "react-router-dom";
import { LandingFooter } from "./LandingFooter";
import { LandingHeader } from "./LandingHeader";
import { StarField } from "./components/StarField";
import { Calendar, Clock, ArrowLeft, ArrowRight, User, X, Check, Copy } from "lucide-react";
import { useMetaTags } from "./hooks/useMetaTags";

const HydrationErrorsPost: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  useMetaTags({
    title: "How to Fix React Hydration Errors Automatically: Complete 2025 Guide",
    description: "Fix 'window is not defined', 'document is not defined', and SSR hydration mismatches in React & Next.js.",
    ogTitle: "How to Fix React Hydration Errors Automatically",
    ogUrl: "https://www.neurolint.dev/blog/fix-react-nextjs-hydration-errors-complete-guide",
    canonical: "https://www.neurolint.dev/blog/fix-react-nextjs-hydration-errors-complete-guide",
  });

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-white relative overflow-hidden">
      <StarField />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 via-transparent to-black pointer-events-none" />
      <LandingHeader />
      <main className="relative z-10 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Blog
          </Link>
          <article className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-bold mb-8">How to Fix React Hydration Errors Automatically: Complete 2025 Guide</h1>
            <div className="bg-zinc-900/50 border border-black rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-red-400 text-lg">!</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold mb-2">TL;DR - Quick Fix</h4>
                  <p className="text-gray-300 mb-3">Run this command to automatically fix hydration errors:</p>
                  <div className="bg-zinc-900/80 border border-black rounded-lg p-3 relative group">
                    <code className="text-green-400 font-mono text-sm">npx @neurolint/cli fix --layers 4,5 ./src</code>
                    <button
                      onClick={() => copyCommand('npx @neurolint/cli fix --layers 4,5 ./src')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/10 rounded transition-colors"
                    >
                      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-gray-400" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xl text-gray-300">
              Hydration errors are one of the most common and frustrating issues developers face when building server-side rendered (SSR) applications.
            </p>
          </article>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
};

export const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  if (slug === "fix-hydration-errors") {
    return <HydrationErrorsPost />;
  }
  return <Navigate to="/blog" replace />;
};

export default BlogPost;
