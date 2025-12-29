import React from "react";
import { AlertTriangle, XCircle, Info } from "lucide-react";

type BadgeType = "limitation" | "breaking" | "deprecated" | "error";

interface ProblemBadgeProps {
  type: BadgeType;
  tool?: string;
}

const badgeConfig: Record<BadgeType, { label: string; icon: React.ReactNode; className: string }> = {
  limitation: {
    label: "LIMITATION",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  breaking: {
    label: "BREAKING CHANGE",
    icon: <XCircle className="w-3.5 h-3.5" />,
    className: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  deprecated: {
    label: "DEPRECATED",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    className: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  error: {
    label: "COMMON ERROR",
    icon: <Info className="w-3.5 h-3.5" />,
    className: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
};

export function ProblemBadge({ type, tool }: ProblemBadgeProps) {
  const config = badgeConfig[type];
  const displayText = tool ? `${tool} ${config.label}` : config.label;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${config.className}`}>
      {config.icon}
      {displayText}
    </span>
  );
}
