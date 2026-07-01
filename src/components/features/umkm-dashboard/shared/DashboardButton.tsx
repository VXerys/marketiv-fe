import { ButtonHTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface DashboardButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "soft" | "danger" | "danger-outline" | "icon";
  size?: "sm" | "md" | "lg" | "xl" | "icon";
  href?: string;
  target?: string;
  rel?: string;
  className?: string;
  children: ReactNode;
  onClick?: (e: any) => void;
}

export function DashboardButton({
  variant = "primary",
  size = "md",
  href,
  className,
  children,
  disabled,
  ...props
}: DashboardButtonProps) {
  // Translate variants
  if (variant === "danger-outline") {
    // Custom style for danger-outline
    const sizeClasses = {
      sm: "h-8 px-4 text-xs",
      md: "h-10 px-6 text-sm",
      lg: "h-12 px-8 text-base font-bold",
      xl: "px-6 py-3 text-base font-bold",
    };
    
    return (
      <Button
        variant="ghost"
        size={size === "icon" ? "icon" : size}
        href={href}
        className={cn(
          "bg-white/30 text-danger-strong border border-danger-strong/20 hover:bg-danger-soft/30 hover:border-danger-strong/40 hover:text-danger-strong rounded-full transition-all duration-200",
          sizeClasses[size === "icon" ? "md" : size],
          disabled && "pointer-events-none opacity-50",
          className
        )}
        disabled={disabled}
        {...props as any}
      >
        {children}
      </Button>
    );
  }

  // Translate icon style if variant === "icon"
  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        href={href}
        className={cn(
          "h-9 w-9 p-0 flex items-center justify-center rounded-full border border-border-soft hover:bg-neutral-50 transition-all",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        disabled={disabled}
        {...props as any}
      >
        {children}
      </Button>
    );
  }

  // Standard Button mapper
  const buttonVariantMap: Record<string, "primary" | "secondary" | "soft" | "outline" | "ghost" | "danger"> = {
    primary: "primary",
    secondary: "secondary",
    outline: "outline",
    ghost: "ghost",
    soft: "soft",
    danger: "danger",
  };

  return (
    <Button
      variant={buttonVariantMap[variant] || "primary"}
      size={size}
      href={href}
      className={cn("rounded-full font-bold transition-all duration-200 shadow-xs", className)}
      disabled={disabled}
      {...props as any}
    >
      {children}
    </Button>
  );
}
