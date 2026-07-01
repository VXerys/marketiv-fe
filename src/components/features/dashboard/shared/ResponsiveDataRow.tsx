import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DashboardCard } from "./DashboardCard";

export interface ResponsiveDataCell {
  label: string;
  value: ReactNode;
  align?: "left" | "right";
}

interface ResponsiveDataRowProps {
  title: ReactNode;
  meta?: ReactNode;
  cells: ResponsiveDataCell[];
  actions?: ReactNode;
  className?: string;
}

export function ResponsiveDataRow({ title, meta, cells, actions, className }: ResponsiveDataRowProps) {
  return (
    <DashboardCard className={cn("space-y-4", className)} padding="md">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="min-w-0">{title}</div>
          {meta ? <div className="flex flex-wrap items-center gap-2">{meta}</div> : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={cn(
              "min-w-0 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-3",
              cell.align === "right" && "sm:text-right",
            )}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">{cell.label}</dt>
            <dd className="mt-1 min-w-0 break-words text-sm font-semibold text-neutral-800">{cell.value}</dd>
          </div>
        ))}
      </dl>
    </DashboardCard>
  );
}
