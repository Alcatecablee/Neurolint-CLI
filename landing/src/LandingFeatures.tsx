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


import { Zap, Users, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GlowingBorder,
  getRandomGlowVariant,
} from "@/components/ui/glowing-border";

const LAYERS = [
  {
    name: "ConfigMaster",
    description:
      "Enables 17 TypeScript strict flags, auto-upgrades JSX for React 19, configures Turbopack, and migrates next lint to Biome.",
    status: "live",
    experimental: false,
  },
  {
    name: "PatternCleanse",
    description:
      "Auto-removes console.log with documented comments, converts React 19 createFactory to JSX, and fixes Next.js 15.5 deprecations.",
    status: "live",
    experimental: false,
  },
  {
    name: "ReactRepair",
    description:
      "Auto-fixes missing React keys (not just detection), converts forwardRef to direct ref props, and adds accessibility attributes.",
    status: "live",
    experimental: false,
  },
  {
    name: "HydraFix",
    description:
      "AST-based auto-fix for hydration issues. Wraps localStorage, window, and document APIs with SSR guards automatically.",
    status: "live",
    experimental: false,
  },
  {
    name: "NextGuard",
    description:
      "Handles 5 React 19 DOM API migrations and 15 Next.js 15.5 deprecation patterns. Converts ReactDOM.render to createRoot.",
    status: "live",
    experimental: false,
  },
  {
    name: "TestReady",
    description:
      "Detects RSC testing issues, warns about MSW + App Router conflicts, and generates test scaffolding with prop extraction.",
    status: "live",
    experimental: false,
  },
  {
    name: "Adaptive",
    description:
      "Cross-layer pattern learning with 70% confidence threshold. Learns from Layers 1-8 transformations and persists rules.",
    status: "live",
    experimental: false,
  },
  {
    name: "SecurityForensics",
    description:
      "80 IoC signatures + 27 AST-based behavioral patterns. Detects React 19 hook exploits and CVE-2025-55182 indicators.",
    status: "live",
    experimental: false,
  },
];

export function LandingFeatures() {
  // Store toggle state per experimental layer, but do *not* run code, demo only:
  const [experimentalStates, setExperimentalStates] = useState<
    Record<string, boolean>
  >({});

  const handleToggle = (name: string) => {
    setExperimentalStates((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <section
      id="features"
      className="w-full flex flex-col items-center py-24 px-4"
      role="region"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl w-full">
        {/* Features Title */}
        <h2
          id="features-heading"
          className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white text-center"
        >
          Features & Roadmap
        </h2>

        {/* CALL TO ACTION FOR ENGINEERING COLLABORATORS */}
        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 mb-7">
          <div className="flex items-center text-white text-base font-semibold">
            <Users className="mr-2" />
            <span>
              Engineer or AI researcher? Help build the world��s first
              fully-automated code refactoring platform!
            </span>
          </div>
          <Button
            className="bg-[#292939] text-white text-base border border-black hover:bg-[#393b44]"
            asChild
          >
            <a
              href="mailto:clivemakazhu@gmail.com?subject=I want to help NeuroLint!"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Involved
            </a>
          </Button>
        </div>

        {/* Features Grid: LAYERS (with experimental toggles) */}
        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-8">
          {LAYERS.map((layer, idx) => {
            // Mix of different glow effects - some always on, some hover, some random
            const getGlowVariant = () => {
              if (layer.status === "live") return "always"; // Live features always glow
              if (idx % 3 === 0) return "hover"; // Every 3rd item only glows on hover
              return getRandomGlowVariant(); // Others get random animations
            };

            return (
              <GlowingBorder
                key={layer.name}
                variant={getGlowVariant()}
                color={layer.status === "live" ? "green" : "white"}
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1b21] border border-black w-full relative">
                  <Badge
                    variant={layer.status === "live" ? "default" : "secondary"}
                    className={
                      layer.status === "live"
                        ? "bg-zinc-700 text-white"
                        : "bg-[#23233b] text-gray-300"
                    }
                  >
                    {layer.status === "live"
                      ? "LIVE"
                      : layer.experimental
                        ? "EXPERIMENTAL"
                        : "READY"}
                  </Badge>
                  {/* Name/Index */}
                  <span
                    className={
                      layer.status === "live"
                        ? "font-bold text-white"
                        : "text-gray-400"
                    }
                  >
                    {idx + 1}. {layer.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-300 flex-1">
                    {layer.description}
                  </span>
                  {/* If experimental, show demo toggle */}
                  {layer.experimental && (
                    <label className="flex items-center gap-1 ml-1">
                      <input
                        type="checkbox"
                        className="form-checkbox rounded border-zinc-400 focus:ring-2 focus:ring-zinc-400 accent-zinc-400 w-5 h-5 bg-[#26233b]"
                        checked={experimentalStates[layer.name] || false}
                        onChange={() => handleToggle(layer.name)}
                        disabled={true}
                      />
                      <span className="text-xs text-zinc-400">Demo</span>
                    </label>
                  )}
                  {/* Show warning on hover if experimental */}
                  {layer.experimental && (
                    <div className="absolute right-2 bottom-2 flex items-center">
                      <AlertTriangle className="w-4 h-4 text-zinc-400" />
                      <span className="sr-only">Experimental, not live!</span>
                    </div>
                  )}
                </div>
              </GlowingBorder>
            );
          })}
        </div>

        {/* Current Implementation Notice */}
        <div className="bg-zinc-900 border border-black text-zinc-200 rounded-lg p-4 mb-6 text-sm flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-zinc-400" />
          <div>
            <b>Current Implementation:</b> NeuroLint currently uses
            sophisticated rule-based transformations and AST parsing. All layers
            shown above are functional and use proven pattern-matching
            techniques. AI integration is planned for future releases.{" "}
            <a
              href="mailto:clivemakazhu@gmail.com"
              className="underline text-white"
            >
              Share feedback or collaborate!
            </a>
          </div>
        </div>

        {/* Differentiators */}
        <h3 className="text-xl font-semibold text-zinc-200 mb-2 mt-4 flex items-center gap-2">
          <Zap className="w-5 h-5" /> What makes NeuroLint different?
        </h3>
        <ul className="ml-5 list-disc space-y-1 text-sm text-zinc-100">
          <li>
            <b>Auto-fixes, not just detection</b>: ESLint's jsx-key only detects missing keys. Layer 3 actually fixes them. ESLint's no-console only warns. Layer 2 removes them.
          </li>
          <li>
            <b>AST + regex hybrid</b>: Uses Babel AST for robust transformations, falls back to regex for edge cases, validates syntax before accepting changes.
          </li>
          <li>
            <b>One-pass multi-config</b>: Layer 1 optimizes tsconfig.json + next.config.js + package.json in a single command.
          </li>
          <li>
            <b>Framework-aware security</b>: 80 IoC signatures + 27 behavioral patterns that understand React 19 hooks and Next.js 15.5 patterns.
          </li>
        </ul>
      </div>

      {/* How it Works */}
      <div id="how" className="mt-16 max-w-4xl w-full">
        <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tight text-white text-center">
          How it Works
        </h2>
        <GlowingBorder variant="pulse" color="blue">
          <div className="bg-zinc-900/80 rounded-xl border border-black p-8 text-gray-200 hover-glow transition-all duration-300">
            <ol className="list-decimal ml-5 space-y-2 text-sm">
              <li>
                Upload your TypeScript/Next.js project or configs—no setup
                required.
              </li>
              <li>
                Select the analysis layer(s) you want to run, including
                full-stack config upgrades.
              </li>
              <li>
                Preview and approve changes. Full dry run, transparency, and
                safety tooling always enabled.
              </li>
              <li>
                Enjoy a modernized, production-ready codebase in seconds.
                Advanced orchestrator coming soon.
              </li>
            </ol>
          </div>
        </GlowingBorder>
      </div>
    </section>
  );
}
