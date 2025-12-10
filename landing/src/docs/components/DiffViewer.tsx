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
import { Minus, Plus, FileCode } from "lucide-react";

interface DiffViewerProps {
  before: string;
  after: string;
  filename?: string;
  language?: string;
}

interface DiffLine {
  type: "unchanged" | "removed" | "added";
  content: string;
  lineNumber: { before?: number; after?: number };
}

function computeDiff(before: string, after: string): DiffLine[] {
  const beforeLines = before.trim().split("\n");
  const afterLines = after.trim().split("\n");
  const result: DiffLine[] = [];

  let beforeIdx = 0;
  let afterIdx = 0;
  let beforeLineNum = 1;
  let afterLineNum = 1;

  while (beforeIdx < beforeLines.length || afterIdx < afterLines.length) {
    const beforeLine = beforeLines[beforeIdx];
    const afterLine = afterLines[afterIdx];

    if (beforeLine === afterLine) {
      result.push({
        type: "unchanged",
        content: beforeLine || "",
        lineNumber: { before: beforeLineNum, after: afterLineNum },
      });
      beforeIdx++;
      afterIdx++;
      beforeLineNum++;
      afterLineNum++;
    } else if (beforeIdx < beforeLines.length && afterIdx < afterLines.length) {
      result.push({
        type: "removed",
        content: beforeLine || "",
        lineNumber: { before: beforeLineNum },
      });
      result.push({
        type: "added",
        content: afterLine || "",
        lineNumber: { after: afterLineNum },
      });
      beforeIdx++;
      afterIdx++;
      beforeLineNum++;
      afterLineNum++;
    } else if (beforeIdx < beforeLines.length) {
      result.push({
        type: "removed",
        content: beforeLine || "",
        lineNumber: { before: beforeLineNum },
      });
      beforeIdx++;
      beforeLineNum++;
    } else {
      result.push({
        type: "added",
        content: afterLine || "",
        lineNumber: { after: afterLineNum },
      });
      afterIdx++;
      afterLineNum++;
    }
  }

  return result;
}

export function DiffViewer({ before, after, filename }: DiffViewerProps) {
  const diffLines = computeDiff(before, after);

  const removedCount = diffLines.filter((l) => l.type === "removed").length;
  const addedCount = diffLines.filter((l) => l.type === "added").length;

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 my-6">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-800/50 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-gray-500" />
          {filename && (
            <span className="text-sm text-gray-300 font-mono">{filename}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          {removedCount > 0 && (
            <span className="flex items-center gap-1 text-red-400">
              <Minus className="w-3 h-3" />
              {removedCount}
            </span>
          )}
          {addedCount > 0 && (
            <span className="flex items-center gap-1 text-green-400">
              <Plus className="w-3 h-3" />
              {addedCount}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <tbody>
            {diffLines.map((line, idx) => (
              <tr
                key={idx}
                className={
                  line.type === "removed"
                    ? "bg-red-500/10"
                    : line.type === "added"
                    ? "bg-green-500/10"
                    : ""
                }
              >
                <td className="w-12 px-3 py-0.5 text-right text-gray-600 select-none border-r border-zinc-800">
                  {line.lineNumber.before || ""}
                </td>
                <td className="w-12 px-3 py-0.5 text-right text-gray-600 select-none border-r border-zinc-800">
                  {line.lineNumber.after || ""}
                </td>
                <td className="w-6 px-2 py-0.5 text-center select-none">
                  {line.type === "removed" && (
                    <span className="text-red-400">-</span>
                  )}
                  {line.type === "added" && (
                    <span className="text-green-400">+</span>
                  )}
                </td>
                <td className="px-3 py-0.5 whitespace-pre">
                  <span
                    className={
                      line.type === "removed"
                        ? "text-red-300"
                        : line.type === "added"
                        ? "text-green-300"
                        : "text-gray-300"
                    }
                  >
                    {line.content}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface BeforeAfterProps {
  before: { code: string; label?: string };
  after: { code: string; label?: string };
  filename?: string;
}

export function BeforeAfter({ before, after, filename }: BeforeAfterProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 my-6">
      <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-red-400" />
          <span className="text-sm text-gray-400">
            {before.label || "Before"}
          </span>
          {filename && (
            <span className="text-xs text-gray-500 font-mono ml-auto">
              {filename}
            </span>
          )}
        </div>
        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
          {before.code.trim()}
        </pre>
      </div>

      <div className="rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-2 px-4 py-2 bg-zinc-800/50 border-b border-zinc-800">
          <div className="w-2 h-2 rounded-full bg-green-400" />
          <span className="text-sm text-gray-400">
            {after.label || "After"}
          </span>
          {filename && (
            <span className="text-xs text-gray-500 font-mono ml-auto">
              {filename}
            </span>
          )}
        </div>
        <pre className="p-4 text-sm font-mono text-gray-300 overflow-x-auto">
          {after.code.trim()}
        </pre>
      </div>
    </div>
  );
}
