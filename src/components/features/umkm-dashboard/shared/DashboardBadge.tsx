import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardBadgeProps {
  type?: "status" | "category" | "count" | "tone";
  value?: string;
  tone?: "orange" | "green" | "blue" | "amber" | "red" | "neutral" | "slate" | "purple";
  className?: string;
  children?: ReactNode;
}

export function DashboardBadge({
  type = "tone",
  value,
  tone = "neutral",
  className,
  children,
}: DashboardBadgeProps) {
  // Status mapper to UI kit badge colors
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "draft":
        return { label: "Draft", badgeClass: "badge gray" };
      case "active":
        return { label: "Aktif", badgeClass: "badge green" };
      case "full":
        return { label: "Penuh", badgeClass: "badge yellow" };
      case "completed":
        return { label: "Selesai", badgeClass: "badge navy" };
      case "cancelled":
        return { label: "Dibatalkan", badgeClass: "badge red" };
      case "pending":
        return { label: "Pending", badgeClass: "badge yellow" };
      case "valid":
        return { label: "Valid", badgeClass: "badge green" };
      case "fraud":
        return { label: "Fraud", badgeClass: "badge red" };
      case "dispute":
        return { label: "Sengketa", badgeClass: "badge red" };
      default:
        return { label: status, badgeClass: "badge gray" };
    }
  };

  // Category mapper
  const getCategoryLabel = (cat: string) => {
    const c = cat.toLowerCase();
    switch (c) {
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
        return cat;
    }
  };

  const toneClasses = {
    orange: "badge orange",
    green: "badge green",
    blue: "badge blue",
    amber: "badge yellow",
    red: "badge red",
    neutral: "badge gray",
    slate: "badge navy",
    purple: "badge purple",
  };

  if (type === "status" && value) {
    const cfg = getStatusConfig(value);
    return (
      <span className={cn(cfg.badgeClass, className)}>
        {cfg.label}
      </span>
    );
  }

  if (type === "category" && value) {
    return (
      <span className={cn("badge orange", className)}>
        {getCategoryLabel(value)}
      </span>
    );
  }

  if (type === "count") {
    return (
      <span className={cn("inline-flex items-center justify-center font-extrabold rounded-full bg-neutral-200 text-text-secondary text-[10px] min-w-4.5 h-4.5 px-1 leading-none whitespace-nowrap border border-white", className)}>
        {children || value}
      </span>
    );
  }

  return (
    <span className={cn(toneClasses[tone] || "badge gray", className)}>
      {children || value}
    </span>
  );
}
