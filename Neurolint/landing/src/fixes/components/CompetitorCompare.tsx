import React from "react";
import { Check, X, AlertTriangle } from "lucide-react";

interface CompareRow {
  feature: string;
  competitor: "yes" | "no" | "partial";
  neurolint: "yes" | "no" | "partial";
  competitorNote?: string;
  neurolintNote?: string;
}

interface CompetitorCompareProps {
  competitorName: string;
  rows: CompareRow[];
  competitorLogo?: React.ReactNode;
}

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  switch (status) {
    case "yes":
      return <Check className="w-5 h-5 text-green-400" />;
    case "no":
      return <X className="w-5 h-5 text-red-400" />;
    case "partial":
      return <AlertTriangle className="w-5 h-5 text-amber-400" />;
  }
}

export function CompetitorCompare({ competitorName, rows, competitorLogo }: CompetitorCompareProps) {
  return (
    <div className="my-8 overflow-hidden rounded-xl border border-black">
      <table className="w-full">
        <thead>
          <tr className="bg-zinc-900">
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-400 border-b border-black">Feature</th>
            <th className="text-center px-4 py-3 text-sm font-semibold text-gray-400 border-b border-black w-32">
              <div className="flex items-center justify-center gap-2">
                {competitorLogo}
                <span>{competitorName}</span>
              </div>
            </th>
            <th className="text-center px-4 py-3 text-sm font-semibold text-white border-b border-black w-32 bg-zinc-800">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.png" alt="NeuroLint" className="h-5" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={idx} className="border-b border-black last:border-b-0 hover:bg-zinc-900/50 transition-colors">
              <td className="px-4 py-3 text-sm text-gray-300">{row.feature}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={row.competitor} />
                  {row.competitorNote && (
                    <span className="text-xs text-gray-500">{row.competitorNote}</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-center bg-zinc-800/30">
                <div className="flex flex-col items-center gap-1">
                  <StatusIcon status={row.neurolint} />
                  {row.neurolintNote && (
                    <span className="text-xs text-gray-400">{row.neurolintNote}</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
