import type { ReactNode } from "react";
import * as React from "react";
import { FolderOpen, AlertCircle } from "lucide-react";

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
      <div className={cn("state-card flex flex-col items-center justify-center p-8 text-center border border-neutral-200/60 bg-white text-card-foreground rounded-[22px] shadow-xs", className)}>
        <Skeleton className="state-icon h-12 w-12 rounded-full mb-4" />
        <Skeleton className="h-5 w-40 rounded-full mb-2" />
        <Skeleton className="h-4 w-64 rounded-full" />
      </div>
    );
  }

  return (
    <div className={cn("state-card flex flex-col items-center justify-center p-8 text-center border border-dashed border-neutral-200/80 bg-white/80 text-card-foreground rounded-[22px] shadow-[0_2px_12px_rgba(15,23,42,.03)]", className)}>
      <div>
        {icon ? (
          <div className={cn("state-icon mx-auto mb-3.5 flex items-center justify-center h-12 w-12 rounded-2xl border bg-violet-50 text-violet-600 border-violet-100", kind === "error" && "text-red-600 bg-red-50 border-red-200")}>
            {icon}
          </div>
        ) : (
          <div className={cn("state-icon mx-auto mb-3.5 flex items-center justify-center h-12 w-12 rounded-2xl border bg-violet-50 text-violet-600 border-violet-100", kind === "error" && "text-red-600 bg-red-50 border-red-200")}>
            {kind === "error" ? <AlertCircle className="h-6 w-6" /> : <FolderOpen className="h-6 w-6" />}
          </div>
        )}
        <h3 className="text-base font-display font-extrabold text-neutral-900 tracking-tight mb-1.5">{title}</h3>
        {description ? <p className="text-neutral-500 font-medium max-w-md mx-auto text-xs leading-relaxed mb-5">{description}</p> : null}
        {actionLabel && onAction ? (
          <DashboardButton onClick={onAction} variant={kind === "error" ? "danger" : "primary"}>
            {actionLabel}
          </DashboardButton>
        ) : null}
      </div>
    </div>
  );
}
