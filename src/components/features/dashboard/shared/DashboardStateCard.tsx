import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DashboardButton } from "./DashboardButton";
import { DashboardCard } from "./DashboardCard";

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
      <DashboardCard className={cn("space-y-4", className)}>
        <div className="h-10 w-10 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="space-y-2">
          <div className="h-4 w-40 animate-pulse rounded-full bg-neutral-100" />
          <div className="h-3 w-full max-w-sm animate-pulse rounded-full bg-neutral-100" />
        </div>
      </DashboardCard>
    );
  }

  return (
    <DashboardCard className={cn("flex flex-col items-center text-center", className)}>
      {icon ? <div className="mb-4 rounded-2xl bg-neutral-100 p-3 text-neutral-600">{icon}</div> : null}
      <h3 className="text-lg font-bold text-neutral-950">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-6 text-neutral-500">{description}</p> : null}
      {actionLabel && onAction ? (
        <DashboardButton className="mt-5" onClick={onAction} variant={kind === "error" ? "danger" : "primary"}>
          {actionLabel}
        </DashboardButton>
      ) : null}
    </DashboardCard>
  );
}
