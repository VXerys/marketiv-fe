import { ReactNode, CSSProperties } from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveDataRowProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

export function ResponsiveDataRow({ className, style, children }: ResponsiveDataRowProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-3.5 p-4 md:py-3.5 md:px-5 border border-border-soft md:border-t-0 md:border-x-0 md:border-b rounded-2xl md:rounded-none bg-surface-card md:bg-transparent shadow-xs md:shadow-none hover:bg-neutral-50/30 transition-all min-w-0",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

export interface ResponsiveDataCellProps {
  className?: string;
  label?: string; // Shows on mobile only as a label
  children: ReactNode;
}

export function ResponsiveDataCell({ className, label, children }: ResponsiveDataCellProps) {
  return (
    <div className={cn("flex flex-row md:flex-col justify-between md:justify-center items-center md:items-start gap-2 min-w-0 w-full md:w-auto", className)}>
      {label && (
        <span className="md:hidden text-[9px] font-bold text-text-muted uppercase tracking-wider shrink-0">
          {label}
        </span>
      )}
      <div className="min-w-0 text-text-primary text-xs">
        {children}
      </div>
    </div>
  );
}
