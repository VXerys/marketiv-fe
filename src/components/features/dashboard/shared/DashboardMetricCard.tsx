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
    <div 
      className={cn(
        "relative p-3.5 sm:p-4.5 rounded-2xl sm:rounded-[22px] border border-border bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group select-none", 
        className
      )}
    >
      <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3.5">
        <div className={cn("flex items-center justify-center h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-[14px] border shadow-3xs transition-transform duration-300 group-hover:scale-105", toneIconClasses[tone])}>
          {/* Support responsive scale of SVG child */}
          <div className="[&>svg]:w-3.5 [&>svg]:h-3.5 sm:[&>svg]:w-5 sm:[&>svg]:h-5">
            {icon}
          </div>
        </div>
        {badgeText && (
          <DashboardBadge type="tone" tone={mappedTone} size="sm">
            {badgeText}
          </DashboardBadge>
        )}
      </div>
      
      {/* Label */}
      <div className="text-[0.66rem] sm:text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase leading-none">
        {label}
      </div>
      
      {/* Value */}
      <div className="font-display text-[1.2rem] sm:text-[1.4rem] lg:text-[1.55rem] font-black text-neutral-900 tracking-tight leading-none mt-1 sm:mt-1.5 break-all">
        {formatValue(value, currency)}
      </div>
      
      {/* Helper text */}
      {helper && (
        <div className="metric-note text-[0.68rem] sm:text-[0.74rem] text-neutral-400 font-semibold mt-1 sm:mt-1.5 leading-none">
          {helper}
        </div>
      )}
    </div>
  );
}
