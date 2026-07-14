import * as React from "react";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type DashboardProgressTone = "orange" | "green" | "yellow" | "red" | "blue";

interface DashboardProgressProps {
  value: number;
  max?: number;
  label?: string;
  valueLabel?: string;
  tone?: DashboardProgressTone;
  shimmer?: boolean;
  className?: string;
}

const toneClasses: Record<DashboardProgressTone, string> = {
  orange: "bg-gradient-to-r from-orange-500 to-amber-400",
  green: "bg-gradient-to-r from-green-500 to-emerald-400",
  yellow: "bg-gradient-to-r from-amber-500 to-yellow-300",
  red: "bg-gradient-to-r from-red-500 to-rose-400",
  blue: "bg-gradient-to-r from-blue-500 to-cyan-400",
};

/**
 * @deprecated Use Progress component from @/components/ui/progress instead.
 */
export function DashboardProgress({
  value,
  max = 100,
  label,
  valueLabel,
  tone = "orange",
  shimmer = true,
  className,
}: DashboardProgressProps) {
  const percentage = max > 0 ? Math.min(Math.max((value / max) * 100, 0), 100) : 0;

  return (
    <div className={cn("space-y-2", className)}>
      {label || valueLabel ? (
        <div className="flex items-center justify-between gap-3 text-xs font-semibold text-neutral-500">
          {label ? <span>{label}</span> : <span />}
          {valueLabel ? <span className="text-neutral-700">{valueLabel}</span> : null}
        </div>
      ) : null}
      <div className="relative overflow-hidden rounded-full bg-neutral-100 h-2.5">
        <Progress
          value={percentage}
          className="h-full bg-neutral-100 border-none rounded-full"
          style={{
            // Directly style the Progress indicator via inline CSS variable if desired, or class
            backgroundColor: "transparent",
          }}
        >
          {/* Internal Progress Indicator override using tone class */}
          <div
            className={cn("h-full rounded-full transition-all duration-300", toneClasses[tone])}
            style={{ width: `${percentage}%` }}
          >
            {shimmer ? <span className="absolute inset-0 bg-white/25 opacity-40 animate-pulse" /> : null}
          </div>
        </Progress>
      </div>
    </div>
  );
}
