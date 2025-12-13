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


import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function LandingHero() {
  const navigate = useNavigate();

  return (
    <section
      className="w-full min-h-[90vh] flex flex-col items-center justify-center section-padding container-padding bg-[#0a0a0f] relative overflow-hidden"
      role="banner"
      aria-labelledby="hero-heading"
    >
      {/* Subtle gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Main Heading */}
        <h1
          id="hero-heading"
          className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl font-bold text-white text-center leading-[1.1] mb-6 tracking-tight"
        >
          Fix Your React Code
          <br />
          <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">in Seconds</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-gray-400 font-normal mb-10 max-w-xl text-center leading-relaxed">
          Deterministic fixes for hydration errors, missing keys, and ESLint issues. No AI guesswork.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Button
            className="px-6 py-3 text-base font-medium rounded-lg bg-white hover:bg-gray-100 text-black transition-all duration-200 shadow-lg"
            onClick={() => window.open("https://www.npmjs.com/package/@neurolint/cli", "_blank")}
            size="lg"
            aria-label="Install NeuroLint CLI"
          >
            Get Started
            <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            className="px-6 py-3 text-base font-medium rounded-lg bg-transparent border border-white/20 text-white hover:bg-white/5 transition-all duration-200"
            onClick={() => navigate("/docs")}
            size="lg"
            aria-label="View Documentation"
          >
            View Docs
          </Button>
        </div>
      </div>
    </section>
  );
}
