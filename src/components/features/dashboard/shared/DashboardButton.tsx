import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type DashboardButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger" | "danger-outline" | "icon";
type DashboardButtonSize = "sm" | "md" | "lg" | "icon";

interface DashboardButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "variant" | "size"> {
  children: ReactNode;
  variant?: DashboardButtonVariant;
  size?: DashboardButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidthOnMobile?: boolean;
}

const variantClasses: Record<DashboardButtonVariant, string> = {
  primary: "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_14px_32px_rgba(234,88,12,0.24)]",
  secondary: "bg-[#0B1B33] text-white hover:bg-[#132B4F] shadow-[0_14px_32px_rgba(11,27,51,0.18)]",
  outline: "border border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50",
  ghost: "bg-transparent text-neutral-700 hover:bg-neutral-100",
  soft: "bg-orange-50 text-orange-700 hover:bg-orange-100",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-[0_14px_32px_rgba(220,38,38,0.18)]",
  "danger-outline": "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
  icon: "border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
};

const sizeMap: Record<DashboardButtonSize, ComponentPropsWithoutRef<typeof Button>["size"]> = {
  sm: "sm",
  md: "md",
  lg: "lg",
  icon: "icon",
};

export function DashboardButton({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidthOnMobile = false,
  className,
  "aria-label": ariaLabel,
  ...props
}: DashboardButtonProps) {
  return (
    <Button
      className={cn(variantClasses[variant], fullWidthOnMobile && "w-full sm:w-auto", className)}
      size={sizeMap[size]}
      aria-label={variant === "icon" ? ariaLabel ?? "Tombol aksi" : ariaLabel}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span className={cn(size === "icon" && "sr-only")}>{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </Button>
  );
}
