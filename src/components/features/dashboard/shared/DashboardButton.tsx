import type { ComponentPropsWithoutRef, ReactNode } from "react";
import * as React from "react";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
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
  primary: "btn btn-primary",
  secondary: "btn btn-secondary",
  outline: "btn btn-outline",
  ghost: "btn btn-subtle",
  soft: "btn btn-outline",
  danger: "btn btn-danger",
  "danger-outline": "btn btn-danger", // fallback
  icon: "btn btn-icon",
};

const sizeClasses: Record<DashboardButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "",
  icon: "btn-icon",
};

/**
 * @deprecated Use Button component from @/components/ui/button instead.
 */
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
