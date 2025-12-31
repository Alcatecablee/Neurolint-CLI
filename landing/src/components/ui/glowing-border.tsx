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


import * as React from "react";

export type GlowVariant = "always" | "hover" | "pulse" | "none";
export type GlowColor = "white" | "green" | "blue" | "purple" | "orange" | "red";

export interface GlowingBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlowVariant;
  color?: GlowColor;
  children: React.ReactNode;
}

const colorClasses: Record<GlowColor, string> = {
  white: "shadow-[0_0_15px_rgba(255,255,255,0.3)]",
  green: "shadow-[0_0_15px_rgba(34,197,94,0.4)]",
  blue: "shadow-[0_0_15px_rgba(59,130,246,0.4)]",
  purple: "shadow-[0_0_15px_rgba(168,85,247,0.4)]",
  orange: "shadow-[0_0_15px_rgba(249,115,22,0.4)]",
  red: "shadow-[0_0_15px_rgba(239,68,68,0.4)]",
};

const hoverColorClasses: Record<GlowColor, string> = {
  white: "hover:shadow-[0_0_20px_rgba(255,255,255,0.5)]",
  green: "hover:shadow-[0_0_20px_rgba(34,197,94,0.6)]",
  blue: "hover:shadow-[0_0_20px_rgba(59,130,246,0.6)]",
  purple: "hover:shadow-[0_0_20px_rgba(168,85,247,0.6)]",
  orange: "hover:shadow-[0_0_20px_rgba(249,115,22,0.6)]",
  red: "hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]",
};

export function GlowingBorder({
  variant = "hover",
  color = "white",
  className = "",
  children,
  ...props
}: GlowingBorderProps) {
  const baseClasses = "rounded-lg transition-all duration-300";
  
  let glowClasses = "";
  
  switch (variant) {
    case "always":
      glowClasses = colorClasses[color];
      break;
    case "hover":
      glowClasses = hoverColorClasses[color];
      break;
    case "pulse":
      glowClasses = `${colorClasses[color]} animate-pulse`;
      break;
    case "none":
    default:
      glowClasses = "";
      break;
  }

  return (
    <div
      className={`${baseClasses} ${glowClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function getRandomGlowVariant(): GlowVariant {
  const variants: GlowVariant[] = ["always", "hover", "pulse"];
  return variants[Math.floor(Math.random() * variants.length)] as GlowVariant;
}
