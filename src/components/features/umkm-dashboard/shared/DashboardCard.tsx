import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardCardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "elevated" | "dark" | "danger";
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}

export function DashboardCard({
  variant = "default",
  interactive = false,
  className,
  children,
  ...props
}: DashboardCardProps) {
  const variantStyles = {
    default: "bg-white/70 backdrop-blur-md border border-neutral-200/50 shadow-[0_12px_30px_-10px_rgba(235,94,40,0.04),_0_4px_12px_-5px_rgba(0,0,0,0.015),_inset_0_1px_0_rgba(255,255,255,0.95)]",
    soft: "bg-white/45 backdrop-blur-sm border border-neutral-200/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
    elevated: "bg-white/85 backdrop-blur-lg border border-neutral-200/60 shadow-[0_16px_36px_-12px_rgba(235,94,40,0.06),_0_6px_16px_-6px_rgba(0,0,0,0.02),_inset_0_1px_0_rgba(255,255,255,0.95)]",
    dark: "bg-navy-card/90 backdrop-blur-md text-white border border-white/10 shadow-[0_12px_30px_-10px_rgba(15,23,42,0.3)]",
    danger: "bg-danger-soft/15 backdrop-blur-md text-text-primary border border-danger-soft/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]",
  };

  return (
    <div
      className={cn(
        "rounded-2xl transition-all duration-300 min-w-0 overflow-hidden",
        variantStyles[variant],
        interactive && "hover:shadow-[0_22px_45px_-12px_rgba(235,94,40,0.1),_0_8px_20px_-8px_rgba(0,0,0,0.03),_inset_0_1px_0_rgba(255,255,255,0.95)] hover:-translate-y-1 hover:scale-[1.01] hover:border-primary/30 cursor-pointer active:scale-100 active:translate-y-0 duration-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
