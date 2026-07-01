import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type DashboardBadgeTone =
  | "neutral"
  | "orange"
  | "green"
  | "blue"
  | "amber"
  | "red"
  | "purple"
  | "slate";

type DashboardBadgeSize = "sm" | "md";

interface DashboardBadgeProps {
  children?: ReactNode;
  type?: "status" | "category" | "count" | "tone";
  value?: string;
  tone?: DashboardBadgeTone;
  size?: DashboardBadgeSize;
  dot?: boolean;
  className?: string;
}

const toneClasses: Record<DashboardBadgeTone, string> = {
  neutral: "border-neutral-200 bg-neutral-100 text-neutral-700",
  orange: "border-orange-200 bg-orange-50 text-orange-700",
  green: "border-green-200 bg-green-50 text-green-700",
  blue: "border-blue-200 bg-blue-50 text-blue-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  red: "border-red-200 bg-red-50 text-red-700",
  purple: "border-purple-200 bg-purple-50 text-purple-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
};

const dotClasses: Record<DashboardBadgeTone, string> = {
  neutral: "bg-neutral-500",
  orange: "bg-orange-500",
  green: "bg-green-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  slate: "bg-slate-500",
};

const sizeClasses: Record<DashboardBadgeSize, string> = {
  sm: "px-2.5 py-1 text-[10px]",
  md: "px-3 py-1.5 text-xs",
};

function getStatusLabel(status: string): string {
  const normalizedStatus = status.toLowerCase();

  switch (normalizedStatus) {
    case "draft":
      return "Draft";
    case "active":
      return "Aktif";
    case "full":
      return "Penuh";
    case "completed":
      return "Selesai";
    case "cancelled":
      return "Dibatalkan";
    case "pending":
      return "Pending";
    case "valid":
      return "Valid";
    case "fraud":
      return "Fraud";
    case "dispute":
      return "Sengketa";
    default:
      return status;
  }
}

function getCategoryLabel(category: string): string {
  const normalizedCategory = category.toLowerCase();

  switch (normalizedCategory) {
    case "kuliner":
      return "Kuliner";
    case "fesyen":
      return "Fesyen";
    case "pariwisata":
      return "Pariwisata";
    case "edukasi":
      return "Edukasi";
    case "kecantikan":
      return "Kecantikan";
    case "lainnya":
      return "Lainnya";
    default:
      return category;
  }
}

export function getDashboardStatusTone(status: string): DashboardBadgeTone {
  const normalizedStatus = status.toLowerCase();

  if (["active", "approved", "paid", "completed", "published", "accepted", "success"].includes(normalizedStatus)) {
    return "green";
  }

  if (["pending", "review", "waiting", "draft", "submitted"].some((item) => normalizedStatus.includes(item))) {
    return "amber";
  }

  if (["rejected", "failed", "cancelled", "expired", "danger"].some((item) => normalizedStatus.includes(item))) {
    return "red";
  }

  if (["open", "available", "claimed", "in_progress"].some((item) => normalizedStatus.includes(item))) {
    return "blue";
  }

  return "neutral";
}

export function getDashboardCategoryTone(category: string): DashboardBadgeTone {
  const normalizedCategory = category.toLowerCase();

  if (["fashion", "beauty", "lifestyle"].some((item) => normalizedCategory.includes(item))) {
    return "purple";
  }

  if (["food", "kuliner", "fnb"].some((item) => normalizedCategory.includes(item))) {
    return "orange";
  }

  if (["tech", "gadget", "digital"].some((item) => normalizedCategory.includes(item))) {
    return "blue";
  }

  if (["health", "wellness", "eco"].some((item) => normalizedCategory.includes(item))) {
    return "green";
  }

  return "slate";
}

export function DashboardBadge({
  children,
  type = "tone",
  value,
  tone = "neutral",
  size = "md",
  dot = false,
  className,
}: DashboardBadgeProps) {
  const resolvedTone =
    type === "status" && value ? getDashboardStatusTone(value) : type === "category" && value ? getDashboardCategoryTone(value) : tone;
  const content =
    type === "status" && value
      ? getStatusLabel(value)
      : type === "category" && value
        ? getCategoryLabel(value)
        : children ?? value;

  if (type === "count") {
    return (
      <span
        className={cn(
          "inline-flex min-h-4.5 min-w-4.5 items-center justify-center rounded-full border border-white bg-neutral-200 px-1 text-[10px] font-extrabold leading-none text-text-secondary",
          "max-w-full whitespace-normal break-words text-center",
          className,
        )}
      >
        {content}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center justify-center gap-1.5 rounded-full border font-semibold leading-tight",
        "whitespace-normal break-words text-center",
        toneClasses[resolvedTone],
        sizeClasses[size],
        className,
      )}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[resolvedTone])} /> : null}
      <span className="min-w-0">{content}</span>
    </span>
  );
}
