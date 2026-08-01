import { cn } from "@/lib/utils";

export interface DashboardProgressProps {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
  tone?: "orange" | "green" | "blue" | "red" | "neutral";
  className?: string;
}

const barColors: Record<NonNullable<DashboardProgressProps["tone"]>, string> = {
  orange: "bg-primary",
  green: "bg-success",
  blue: "bg-info",
  red: "bg-danger",
  neutral: "bg-neutral-600",
};

const backgroundColors: Record<NonNullable<DashboardProgressProps["tone"]>, string> = {
  orange: "bg-primary-50",
  green: "bg-success-soft",
  blue: "bg-info-soft",
  red: "bg-danger-soft",
  neutral: "bg-neutral-100",
};

/** Shared progress primitive for dashboard feature surfaces. */
export function DashboardProgress({
  label,
  value,
  max,
  valueLabel,
  tone = "orange",
  className,
}: DashboardProgressProps) {
  const denominator = max <= 0 ? 1 : max;
  const percentage = Math.min(100, Math.max(0, (value / denominator) * 100));

  return (
    <div className={cn("min-w-0 w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2 text-[10px] font-bold text-text-secondary">
        <span className="truncate">{label}</span>
        <span className="shrink-0 whitespace-nowrap text-text-primary">
          {valueLabel || `${Math.round(percentage)}%`}
        </span>
      </div>
      <div className={cn("h-2.5 w-full overflow-hidden rounded-full", backgroundColors[tone])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColors[tone])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
