import React from "react";
import { SubmissionStatus } from "../types";
import { getSubmissionStatusConfig } from "../utils";
import { cn } from "@/lib/utils";

interface SubmissionStatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: SubmissionStatus;
}

export function SubmissionStatusBadge({
  status,
  className,
  ...props
}: SubmissionStatusBadgeProps) {
  const config = getSubmissionStatusConfig(status);

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors",
        config.badgeBgClass,
        config.badgeTextClass,
        config.badgeBorderClass,
        className
      )}
      title={config.description}
      {...props}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full shrink-0",
          config.dotColorClass,
          status === "pending" && "animate-pulse"
        )}
      />
      <span>{config.label}</span>
    </div>
  );
}
