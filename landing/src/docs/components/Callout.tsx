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

type CalloutType = "info" | "warning" | "success" | "error" | "tip";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutLabels: Record<CalloutType, string> = {
  info: "Note",
  warning: "Warning",
  success: "Success",
  error: "Error",
  tip: "Tip",
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const label = title || calloutLabels[type];

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 my-6">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
          {label}
        </p>
        <div className="text-gray-300 text-sm leading-relaxed [&>p]:m-0">
          {children}
        </div>
      </div>
    </div>
  );
}
