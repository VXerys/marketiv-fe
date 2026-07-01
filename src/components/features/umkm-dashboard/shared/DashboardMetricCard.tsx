import { ReactNode } from "react";
import { DashboardCard } from "./DashboardCard";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface DashboardMetricCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  trendText?: string;
  trendType?: "up" | "down" | "neutral";
  icon?: ReactNode;
  variant?: "default" | "soft" | "elevated" | "dark" | "danger";
  className?: string;
  isCompactCurrency?: boolean;
  isFullCurrency?: boolean;
}

export function DashboardMetricCard({
  label,
  value,
  helperText,
  trendText,
  trendType = "neutral",
  icon,
  variant = "elevated",
  className,
  isCompactCurrency = false,
  isFullCurrency = false,
}: DashboardMetricCardProps) {
  
  // Format numeric values contextually
  const renderValue = () => {
    if (typeof value === "number") {
      if (isCompactCurrency) {
        return formatCompactCurrency(value);
      }
      if (isFullCurrency) {
        return formatCurrency(value);
      }
      return value.toLocaleString("id-ID");
    }
    return value;
  };

  const trendColors = {
    up: "text-success",
    down: "text-danger",
    neutral: "text-text-muted",
  };

  const trendIcons = {
    up: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
      </svg>
    ),
    down: (
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-9-9-4 4-6-6" />
      </svg>
    ),
    neutral: null,
  };

  return (
    <DashboardMetricCardContainer variant={variant} className={className}>
      <div className="flex items-start justify-between gap-3 w-full min-w-0">
        
        {/* Metric Info */}
        <div className="min-w-0 flex-1 space-y-1">
          <span className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider truncate">
            {label}
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight truncate leading-none">
            {renderValue()}
          </h3>
          
          {/* Trend & Helper info */}
          <div className="flex items-center gap-1.5 min-w-0 pt-0.5">
            {trendText && (
              <span className={cn("inline-flex items-center gap-0.5 text-[10px] font-extrabold shrink-0", trendColors[trendType])}>
                {trendIcons[trendType]}
                <span>{trendText}</span>
              </span>
            )}
            {helperText && (
              <span className="text-[10px] text-text-muted truncate block">
                {helperText}
              </span>
            )}
          </div>
        </div>

        {/* Non-shrinking Icon */}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0 border border-border-soft text-text-secondary">
            {icon}
          </div>
        )}

      </div>
    </DashboardMetricCardContainer>
  );
}

// Wrapper targeting DashboardCard variants
interface DashboardMetricCardContainerProps {
  variant?: "default" | "soft" | "elevated" | "dark" | "danger";
  className?: string;
  children: ReactNode;
}

function DashboardMetricCardContainer({
  variant = "elevated",
  className,
  children,
}: DashboardMetricCardContainerProps) {
  return (
    <DashboardCard variant={variant} className={cn("p-4.5 sm:p-5", className)}>
      {children}
    </DashboardCard>
  );
}
