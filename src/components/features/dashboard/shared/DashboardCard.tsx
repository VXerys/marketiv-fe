import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

type DashboardCardVariant = "default" | "soft" | "elevated" | "featured" | "dark" | "danger";
type DashboardCardPadding = "none" | "sm" | "md" | "lg";

interface DashboardCardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  variant?: DashboardCardVariant;
  padding?: DashboardCardPadding;
  interactive?: boolean;
}

const variantClasses: Record<DashboardCardVariant, string> = {
  default: "border-neutral-200/70 bg-white/95 shadow-[0_24px_70px_rgba(15,23,42,0.08)]",
  soft: "border-neutral-200/60 bg-[#FFF8ED]/90 shadow-[0_18px_45px_rgba(15,23,42,0.06)]",
  elevated: "border-neutral-200/70 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)]",
  featured: "border-orange-200/80 bg-gradient-to-br from-white via-[#FFF8ED] to-orange-50/70 shadow-[0_28px_70px_rgba(234,88,12,0.14)]",
  dark: "border-[#1E3A5F] bg-[#0B1B33] text-white shadow-[0_30px_80px_rgba(11,27,51,0.22)]",
  danger: "border-red-200/80 bg-red-50/80 shadow-[0_18px_45px_rgba(185,28,28,0.08)]",
};

const paddingClasses: Record<DashboardCardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export function DashboardCard({
  children,
  className,
  variant = "default",
  padding = "md",
  interactive = false,
  ...props
}: DashboardCardProps) {
  return (
    <div
      className={cn(
        "min-w-0 rounded-3xl border",
        variantClasses[variant],
        paddingClasses[padding],
        interactive && "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_rgba(15,23,42,0.14)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
