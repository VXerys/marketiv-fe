import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DashboardButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger" | "danger-outline" | "icon";
type DashboardButtonSize = "sm" | "md" | "lg" | "icon";

export interface DashboardButtonProps extends Omit<ComponentPropsWithoutRef<typeof Button>, "variant" | "size"> {
  children: ReactNode;
  variant?: DashboardButtonVariant;
  size?: DashboardButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidthOnMobile?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

const variantClasses: Record<DashboardButtonVariant, string> = {
  primary:
    "min-h-[44px] px-6 sm:px-7 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs sm:text-sm font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none",
  secondary:
    "min-h-[44px] px-5 sm:px-6 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs sm:text-sm font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none",
  outline:
    "min-h-[44px] px-5 sm:px-6 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs sm:text-sm font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none",
  ghost:
    "min-h-[38px] px-4 rounded-full text-ink-700 hover:bg-neutral-100 text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
  soft:
    "min-h-[44px] px-5 sm:px-6 rounded-full border border-orange-200 bg-orange-50 text-orange-700 text-xs sm:text-sm font-bold hover:bg-orange-100 transition-all cursor-pointer whitespace-nowrap",
  danger:
    "min-h-[44px] px-5 sm:px-6 rounded-full border border-red-200 bg-red-600 text-white text-xs sm:text-sm font-extrabold shadow-2xs hover:bg-red-700 active:scale-[.98] transition-all cursor-pointer whitespace-nowrap",
  "danger-outline":
    "min-h-[44px] px-5 sm:px-6 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs sm:text-sm font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer whitespace-nowrap",
  icon:
    "h-10 w-10 p-0 rounded-full border border-neutral-200/80 bg-white text-ink-800 hover:bg-neutral-50 flex items-center justify-center cursor-pointer transition-all",
};

const sizeClasses: Record<DashboardButtonSize, string> = {
  sm: "min-h-[36px] px-4 text-xs font-bold",
  md: "",
  lg: "min-h-[48px] px-8 text-base font-extrabold",
  icon: "h-10 w-10 p-0",
};

export function DashboardButton({
  children,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidthOnMobile = false,
  href,
  target,
  rel,
  className,
  "aria-label": ariaLabel,
  ...props
}: DashboardButtonProps) {
  const content = (
    <>
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      <span className={cn(size === "icon" && "sr-only")}>{children}</span>
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </>
  );

  return (
    <Button
      className={cn(variantClasses[variant], sizeClasses[size], fullWidthOnMobile && "w-full sm:w-auto", className)}
      aria-label={variant === "icon" ? ariaLabel ?? "Tombol aksi" : ariaLabel}
      asChild={!!href}
      {...(props as React.ComponentPropsWithoutRef<typeof Button>)}
    >
      {href ? (
        <Link href={href} target={target} rel={rel}>
          {content}
        </Link>
      ) : (
        content
      )}
    </Button>
  );
}
