import React from "react";
import { AlertTriangle, XCircle, Info } from "lucide-react";

type BadgeType = "limitation" | "breaking" | "deprecated" | "error";

interface ProblemBadgeProps {
  type: BadgeType;
  tool?: string;
}

const badgeConfig: Record<BadgeType, { label: string; icon: React.ReactNode; colorClass: string; bgLineClass: string }> = {
  limitation: {
    label: "LIMITATION",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    colorClass: "text-amber-400",
    bgLineClass: "bg-amber-500/30",
  },
  breaking: {
    label: "BREAKING CHANGE",
    icon: <XCircle className="w-3.5 h-3.5" />,
    colorClass: "text-red-400",
    bgLineClass: "bg-red-500/30",
  },
  deprecated: {
    label: "DEPRECATED",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    colorClass: "text-orange-400",
    bgLineClass: "bg-orange-500/30",
  },
  error: {
    label: "COMMON ERROR",
    icon: <Info className="w-3.5 h-3.5" />,
    colorClass: "text-blue-400",
    bgLineClass: "bg-blue-500/30",
  },
};

export function ProblemBadge({ type, tool }: ProblemBadgeProps) {
  const config = badgeConfig[type];
  const displayText = tool ? `${tool} ${config.label}` : config.label;

  return (
    <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${config.colorClass}`}>
      <span className={`w-6 h-px ${config.bgLineClass}`}></span>
      {config.icon}
      {displayText}
    </span>
  );
}
