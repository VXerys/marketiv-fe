import { type ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatusBadgeVariant = "active" | "pending";

interface StatusBadgeProps {
  children: ReactNode;
  variant: StatusBadgeVariant;
  withDot?: boolean;
  className?: string;
}

const STATUS_BADGE_CLASSES: Record<StatusBadgeVariant, string> = {
  active:
    "bg-green-50 text-green-700 text-[11px] px-3 py-0.5 rounded-full border border-green-200/60 shadow-sm flex items-center gap-1.5 font-bold uppercase tracking-wider shrink-0",
  pending:
    "text-[9px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-amber-200/50 shadow-sm",
};

export function StatusBadge({ children, variant, withDot, className }: StatusBadgeProps) {
  return (
    <span className={cn(STATUS_BADGE_CLASSES[variant], className)}>
      {withDot && <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>}
      {children}
    </span>
  );
}
