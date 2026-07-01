import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters";

interface CreatorMetricCardProps {
  label: string;
  value: string | number;
  helperText?: string;
  trendText?: string;
  trendType?: "up" | "down" | "neutral";
  icon?: ReactNode;
  isCurrency?: boolean;
  isCompactCurrency?: boolean;
  variant?: "default" | "dark" | "orange";
  className?: string;
}

export function CreatorMetricCard({
  label,
  value,
  helperText,
  trendText,
  trendType = "neutral",
  icon,
  isCurrency = false,
  isCompactCurrency = false,
  variant = "default",
  className,
}: CreatorMetricCardProps) {
  const renderValue = () => {
    if (typeof value === "number") {
      if (isCompactCurrency) {
        return formatCompactCurrency(value);
      }
      if (isCurrency) {
        return formatCurrency(value);
      }
      return value.toLocaleString("id-ID");
    }
    return value;
  };

  const trendColors = {
    up: "text-green-600 bg-green-50",
    down: "text-red-600 bg-red-50",
    neutral: "text-neutral-500 bg-neutral-50",
  };

  const trendIcons = {
    up: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-9 9-4-4-6 6" />
      </svg>
    ),
    down: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-9-9-4 4-6-6" />
      </svg>
    ),
    neutral: null,
  };

  const variants = {
    default: "bg-white border border-neutral-200/60 shadow-[0_10px_30px_rgba(0,0,0,0.02)]",
    dark: "bg-navy-main text-white border border-white/10 shadow-[0_12px_30px_rgba(15,23,42,0.15)]",
    orange: "bg-primary text-white border border-primary-600 shadow-[0_12px_30px_rgba(249,115,22,0.2)]",
  };

  return (
    <div className={cn("rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-md", variants[variant], className)}>
      <div className="flex justify-between items-start">
        <span className={cn("text-xs font-bold uppercase tracking-wider", variant === "default" ? "text-neutral-400" : "text-white/60")}>
          {label}
        </span>
        {icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", 
            variant === "default" 
              ? "bg-neutral-50 border-neutral-200/60 text-neutral-600" 
              : "bg-white/10 border-white/10 text-white"
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-black tracking-tight leading-none">
          {renderValue()}
        </h3>
        {(trendText || helperText) && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap text-xs">
            {trendText && (
              <span className={cn("inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold", trendColors[trendType])}>
                {trendIcons[trendType]}
                {trendText}
              </span>
            )}
            {helperText && (
              <span className={variant === "default" ? "text-neutral-500" : "text-white/70"}>
                {helperText}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
