import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type StatusBadgeVariant = "active" | "pending" | "success" | "warning" | "error" | "normal";

interface StatusBadgeProps {
  children: ReactNode;
  variant: StatusBadgeVariant;
  withDot?: boolean; // In UI kit, the dot is automatically rendered by .badge::before, so we can ignore or hide it.
  className?: string;
}

const STATUS_BADGE_CLASSES: Record<StatusBadgeVariant, string> = {
  active: "badge green",
  pending: "badge yellow",
  success: "badge green",
  warning: "badge yellow",
  error: "badge red",
  normal: "badge gray",
};

export function StatusBadge({ children, variant, className }: StatusBadgeProps) {
  return (
    <span className={cn(STATUS_BADGE_CLASSES[variant], className)}>
      {children}
    </span>
  );
}

