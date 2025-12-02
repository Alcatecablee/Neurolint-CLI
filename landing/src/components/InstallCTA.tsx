import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface InstallCTAProps {
  className?: string;
}

export function InstallCTA({ className = '' }: InstallCTAProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText('npm install -g @neurolint/cli');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`mt-8 pt-6 border-t border-black ${className}`}>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <span className="text-sm text-gray-400 font-medium">Ready to fix your code?</span>
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-black rounded-xl px-4 py-2.5 group hover:border-black transition-colors duration-300">
          <code className="text-blue-400 font-mono text-sm">
            $ npm install -g @neurolint/cli
          </code>
          <button
            onClick={copyToClipboard}
            className="p-1.5 hover:bg-white/10 rounded-md transition-colors ml-2"
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
    </div>
  );
}
