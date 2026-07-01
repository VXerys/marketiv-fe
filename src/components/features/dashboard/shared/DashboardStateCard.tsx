import type { ReactNode } from "react";
import * as React from "react";

import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardButton } from "./DashboardButton";

type DashboardStateKind = "empty" | "error" | "loading";

interface DashboardStateCardProps {
  kind: DashboardStateKind;
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function DashboardStateCard({
  kind,
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: DashboardStateCardProps) {
  if (kind === "loading") {
    return (
      <div className={cn("state-card flex flex-col items-center justify-center p-8 text-center border bg-card text-card-foreground rounded-3xl", className)}>
        <Skeleton className="state-icon h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-5 w-40 rounded-full mb-2" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("state-card flex flex-col items-center justify-center p-8 text-center border bg-card text-card-foreground rounded-3xl", className)}>
      <div>
        {icon ? (
          <div className={cn("state-icon mx-auto mb-4 flex items-center justify-center h-12 w-12 rounded-full border bg-neutral-50", kind === "error" && "text-red-700! bg-red-50! border-red-200/50!")}>
            {icon}
          </div>
        ) : (
          <div className={cn("state-icon mx-auto mb-4 flex items-center justify-center h-12 w-12 rounded-full border bg-neutral-50 font-bold", kind === "error" && "text-red-700! bg-red-50! border-red-200/50!")}>
            {kind === "error" ? "×" : "!"}
          </div>
        )}
        <h3 className="text-xl font-display font-extrabold text-neutral-900 tracking-tight mb-2">{title}</h3>
        {description ? <p className="text-neutral-500 font-semibold max-w-md mx-auto text-sm leading-relaxed mb-6">{description}</p> : null}
        {actionLabel && onAction ? (
          <DashboardButton onClick={onAction} variant={kind === "error" ? "danger" : "primary"}>
            {actionLabel}
          </DashboardButton>
        ) : null}
      </div>
    </div>
  );
}
