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


import React, { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  copyable?: boolean;
}

const customTheme = {
  ...oneDark,
  'pre[class*="language-"]': {
    ...oneDark['pre[class*="language-"]'],
    background: "#18181b",
    margin: 0,
    padding: "1rem",
    fontSize: "0.875rem",
    lineHeight: "1.7",
  },
  'code[class*="language-"]': {
    ...oneDark['code[class*="language-"]'],
    background: "transparent",
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  },
};

export function CodeBlock({
  code,
  language = "bash",
  filename,
  showLineNumbers = false,
  highlightLines = [],
  copyable = true,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 my-4">
      {filename && (
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400 font-mono">{filename}</span>
          </div>
          {copyable && (
            <button
              onClick={handleCopy}
              className="p-1.5 text-gray-500 hover:text-white hover:bg-zinc-700 rounded transition-colors"
              aria-label={copied ? "Copied" : "Copy code"}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      )}

      <div className="relative group">
        {!filename && copyable && (
          <button
            onClick={handleCopy}
            className="absolute right-3 top-3 p-1.5 text-gray-500 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded opacity-0 group-hover:opacity-100 transition-all"
            aria-label={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        )}

        <SyntaxHighlighter
          language={language}
          style={customTheme}
          showLineNumbers={showLineNumbers}
          wrapLines={true}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = { display: "block" };
            if (highlightLines.includes(lineNumber)) {
              style.backgroundColor = "rgba(59, 130, 246, 0.1)";
              style.borderLeft = "3px solid #3b82f6";
              style.marginLeft = "-3px";
              style.paddingLeft = "calc(1rem - 3px)";
            }
            return { style };
          }}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

interface CommandBlockProps {
  command: string;
  output?: string;
}

export function CommandBlock({ command, output }: CommandBlockProps) {
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
    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 my-4">
      <div className="flex items-center justify-between px-4 py-3 group">
        <code className="text-sm font-mono">
          <span className="text-gray-500 select-none">$ </span>
          <span className="text-blue-400">{command}</span>
        </code>
        <button
          onClick={handleCopy}
          className="p-1.5 text-gray-500 hover:text-white hover:bg-zinc-700 rounded transition-colors"
          aria-label={copied ? "Copied" : "Copy command"}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>
      {output && (
        <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-800">
          <pre className="text-sm text-gray-400 font-mono whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
}
