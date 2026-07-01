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
  orange: "from-orange-500 to-amber-400",
  green: "from-green-500 to-emerald-400",
  yellow: "from-amber-500 to-yellow-300",
  red: "from-red-500 to-rose-400",
  blue: "from-blue-500 to-cyan-400",
};

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
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className={cn("relative h-full rounded-full bg-gradient-to-r", toneClasses[tone])}
          style={{ width: `${percentage}%` }}
        >
          {shimmer ? <span className="absolute inset-0 bg-white/25 opacity-40" /> : null}
        </div>
      </div>
    </div>
  );
}
