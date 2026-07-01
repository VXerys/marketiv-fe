import type { ReactNode } from "react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatters";
import { DashboardBadge } from "./DashboardBadge";

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
  badgeText?: string;
  badgeTone?: "green" | "orange" | "blue" | "red" | "purple" | "navy" | "gray" | "yellow";
}

const toneIconClasses: Record<MetricTone, string> = {
  default: "text-neutral-500 bg-neutral-100 border-neutral-200/60!",
  orange: "text-orange-700 bg-orange-50 border-orange-200/50!",
  navy: "text-[#1e3a5f] bg-blue-50/50 border-[#1e3a5f]/10!",
  green: "text-green-700 bg-green-50 border-green-200/50!",
  blue: "text-blue-700 bg-blue-50 border-blue-200/50!",
  red: "text-red-700 bg-red-50 border-red-200/50!",
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
  badgeText,
  badgeTone = "green",
}: DashboardMetricCardProps) {
  // Map helper badgeTone value to expected tone type in DashboardBadge
  const mappedTone = badgeTone === "gray" ? "neutral" : badgeTone === "yellow" ? "amber" : badgeTone === "navy" ? "blue" : badgeTone;

  return (
    <div className={cn("metric-card border bg-card text-card-foreground p-5 rounded-2xl shadow-sm", className)}>
      <div className="metric-top flex items-center justify-between gap-3 mb-3">
        <div className={cn("metric-icon flex items-center justify-center h-10 w-10 rounded-xl border", toneIconClasses[tone])}>
          {icon}
        </div>
        {badgeText && (
          <DashboardBadge type="tone" tone={mappedTone} size="sm">
            {badgeText}
          </DashboardBadge>
        )}
      </div>
      <div className="metric-label text-sm font-semibold text-neutral-500 mb-1">{label}</div>
      <div className="metric-value text-2xl font-bold tracking-tight text-neutral-900">
        {formatValue(value, currency)}
      </div>
      {helper ? (
        <div className="metric-note mt-2 text-xs text-neutral-400 font-medium">{helper}</div>
      ) : null}
    </div>
  );
}
