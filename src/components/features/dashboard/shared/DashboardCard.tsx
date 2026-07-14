import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as React from "react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DashboardCardVariant = "default" | "soft" | "elevated" | "featured" | "dark" | "danger";
type DashboardCardPadding = "none" | "sm" | "md" | "lg";

export interface DashboardCardProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  variant?: DashboardCardVariant;
  padding?: DashboardCardPadding;
  interactive?: boolean;
}

const variantClasses: Record<DashboardCardVariant, string> = {
  default: "bento-card",
  soft: "glass-panel rounded-3xl",
  elevated: "bento-card shadow-lg",
  featured: "border border-orange-200/80 bg-gradient-to-br from-white via-[#FFF8ED] to-orange-50/70 shadow-[0_28px_70px_rgba(234,88,12,0.14)] rounded-3xl",
  dark: "glass-panel-dark text-white",
  danger: "border border-red-200/80 bg-red-50/80 shadow-[0_18px_45px_rgba(185,28,28,0.08)] rounded-3xl",
};

const paddingClasses: Record<DashboardCardPadding, string> = {
  none: "p-0",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

/**
 * @deprecated Use Card component from @/components/ui/card instead.
 */
export function DashboardCard({
  children,
  className,
  variant = "default",
  padding,
  interactive = false,
  ...props
}: DashboardCardProps) {
  const hasPaddingOverride = padding !== undefined;
  const paddingClass = hasPaddingOverride ? paddingClasses[padding] : (variant === "default" || variant === "elevated" ? "" : paddingClasses.md);

  return (
    <Card
      className={cn(
        "min-w-0 flex flex-col gap-0 border bg-card text-card-foreground",
        variantClasses[variant],
        paddingClass,
        interactive && variant !== "default" && variant !== "elevated" && "transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_32px_80px_rgba(15,23,42,0.14)]",
        className,
      )}
      {...props}
    >
      {children}
    </Card>
  );
}
