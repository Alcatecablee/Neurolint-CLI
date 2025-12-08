import React from "react";
import { AlertTriangle, Info, CheckCircle, XCircle, Zap } from "lucide-react";

type CalloutType = "info" | "warning" | "success" | "error" | "tip";

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}

const calloutStyles: Record<CalloutType, { icon: React.ReactNode; borderColor: string; bgColor: string; iconColor: string }> = {
  info: {
    icon: <Info className="w-5 h-5" />,
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    iconColor: "text-blue-400",
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/5",
    iconColor: "text-yellow-400",
  },
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    borderColor: "border-green-500/30",
    bgColor: "bg-green-500/5",
    iconColor: "text-green-400",
  },
  error: {
    icon: <XCircle className="w-5 h-5" />,
    borderColor: "border-red-500/30",
    bgColor: "bg-red-500/5",
    iconColor: "text-red-400",
  },
  tip: {
    icon: <Zap className="w-5 h-5" />,
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/5",
    iconColor: "text-purple-400",
  },
};

export function Callout({ type = "info", title, children }: CalloutProps) {
  const styles = calloutStyles[type];

  return (
    <div
      className={`
        rounded-lg border-l-4 p-4 my-6
        ${styles.borderColor} ${styles.bgColor}
      `}
    >
      <div className="flex gap-3">
        <div className={`flex-shrink-0 mt-0.5 ${styles.iconColor}`}>
          {styles.icon}
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <p className="font-semibold text-white mb-1">{title}</p>
          )}
          <div className="text-gray-300 text-sm leading-relaxed [&>p]:m-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
