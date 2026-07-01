import { cn } from "@/lib/utils";

export interface DashboardProgressProps {
  label: string;
  value: number;
  max: number;
  valueLabel?: string;
  tone?: "orange" | "green" | "blue" | "red" | "neutral";
  className?: string;
}

export function DashboardProgress({
  label,
  value,
  max,
  valueLabel,
  tone = "orange",
  className,
}: DashboardProgressProps) {
  // Clamp calculation between 0 and 100
  const denominator = max <= 0 ? 1 : max;
  const percentage = Math.min(100, Math.max(0, (value / denominator) * 100));

  const barColors = {
    orange: "bg-primary",
    green: "bg-success",
    blue: "bg-info",
    red: "bg-danger",
    neutral: "bg-neutral-600",
  };

  const bgColors = {
    orange: "bg-primary-50",
    green: "bg-success-soft",
    blue: "bg-info-soft",
    red: "bg-danger-soft",
    neutral: "bg-neutral-100",
  };

  return (
    <div className={cn("space-y-1.5 min-w-0 w-full", className)}>
      <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary gap-2">
        <span className="truncate">{label}</span>
        <span className="shrink-0 text-text-primary whitespace-nowrap">
          {valueLabel || `${Math.round(percentage)}%`}
        </span>
      </div>
      <div className={cn("h-2.5 rounded-full overflow-hidden w-full", bgColors[tone])}>
        <div
          className={cn("h-full rounded-full transition-all duration-500 ease-out", barColors[tone])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
