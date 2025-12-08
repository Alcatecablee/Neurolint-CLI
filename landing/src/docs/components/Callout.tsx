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
