import React, { useState } from "react";
import { Copy, Check, Zap } from "lucide-react";

interface TLDRCommandCardProps {
  command: string;
  description?: string;
}

export function TLDRCommandCard({ command, description }: TLDRCommandCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="bg-zinc-900 border border-black rounded-xl p-6 my-6">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-5 h-5 text-green-400" />
        <span className="text-sm font-semibold text-green-400 uppercase tracking-wider">TL;DR — One Command Fix</span>
      </div>
      {description && (
        <p className="text-gray-400 text-sm mb-4">{description}</p>
      )}
      <div className="flex items-center gap-3 bg-zinc-800 border border-black rounded-lg p-4">
        <code className="flex-1 text-sm font-mono text-blue-400 overflow-x-auto">
          $ {command}
        </code>
        <button
          onClick={handleCopy}
          className="flex-shrink-0 p-2 text-gray-500 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          aria-label={copied ? "Copied" : "Copy command"}
        >
          {copied ? (
            <Check className="w-5 h-5 text-green-400" />
          ) : (
            <Copy className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}
