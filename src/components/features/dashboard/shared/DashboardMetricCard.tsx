import type { ReactNode } from "react";

import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatters";

import { DashboardCard } from "./DashboardCard";

type MetricTone = "default" | "orange" | "navy" | "green" | "blue" | "red";
type CurrencyMode = "none" | "compact" | "full";

interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  helper?: string;
  icon?: ReactNode;
  tone?: MetricTone;
  currency?: CurrencyMode;
  className?: string;
}

const toneClasses: Record<MetricTone, { icon: string; value: string }> = {
  default: { icon: "bg-neutral-100 text-neutral-700", value: "text-neutral-950" },
  orange: { icon: "bg-orange-100 text-orange-700", value: "text-orange-600" },
  navy: { icon: "bg-[#0B1B33] text-white", value: "text-[#0B1B33]" },
  green: { icon: "bg-green-100 text-green-700", value: "text-green-600" },
  blue: { icon: "bg-blue-100 text-blue-700", value: "text-blue-600" },
  red: { icon: "bg-red-100 text-red-700", value: "text-red-600" },
};

function formatValue(value: string | number, currency: CurrencyMode): string {
  if (typeof value === "string" || currency === "none") {
    return String(value);
  }

  return currency === "full" ? formatCurrency(value) : formatCompactCurrency(value);
}

export function DashboardMetricCard({
  label,
  value,
  helper,
  icon,
  tone = "default",
  currency = "none",
  className,
}: DashboardMetricCardProps) {
  return (
    <DashboardCard className={cn("space-y-4", className)} padding="md">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-neutral-500">{label}</p>
        {icon ? <div className={cn("rounded-2xl p-2.5", toneClasses[tone].icon)}>{icon}</div> : null}
      </div>
      <div className="space-y-1">
        <p className={cn("break-words text-2xl font-bold tracking-tight sm:text-3xl", toneClasses[tone].value)}>
          {formatValue(value, currency)}
        </p>
        {helper ? <p className="text-sm text-neutral-500">{helper}</p> : null}
      </div>
    </DashboardCard>
  );
}
