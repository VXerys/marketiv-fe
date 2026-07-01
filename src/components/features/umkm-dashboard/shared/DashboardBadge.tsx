import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface DashboardBadgeProps {
  type?: "status" | "category" | "count" | "tone";
  value?: string;
  tone?: "orange" | "green" | "blue" | "amber" | "red" | "neutral" | "slate";
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
  // Status mapper
  const getStatusConfig = (status: string) => {
    const s = status.toLowerCase();
    switch (s) {
      case "draft":
        return { label: "Draft", classes: "bg-neutral-100 text-neutral-700 border-neutral-200" };
      case "active":
        return { label: "Aktif", classes: "bg-success-soft text-success-strong border-success-soft" };
      case "full":
        return { label: "Penuh", classes: "bg-warning-soft text-warning-strong border-warning-soft" };
      case "completed":
        return { label: "Selesai", classes: "bg-info-soft text-info-strong border-info-soft" };
      case "cancelled":
        return { label: "Dibatalkan", classes: "bg-danger-soft text-danger-strong border-danger-soft" };
      case "pending":
        return { label: "Pending", classes: "bg-warning-soft text-warning-strong border-warning-soft" };
      case "valid":
        return { label: "Valid", classes: "bg-success-soft text-success-strong border-success-soft" };
      case "fraud":
        return { label: "Fraud", classes: "bg-danger-soft text-danger-strong border-danger-soft" };
      case "dispute":
        return { label: "Sengketa", classes: "bg-danger-soft text-danger-strong border-danger-soft" };
      default:
        return { label: status, classes: "bg-neutral-100 text-neutral-700 border-neutral-200" };
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
    orange: "bg-primary-50 text-primary-700 border-primary-200",
    green: "bg-success-soft text-success-strong border-success-soft",
    blue: "bg-info-soft text-info-strong border-info-soft",
    amber: "bg-warning-soft text-warning-strong border-warning-soft",
    red: "bg-danger-soft text-danger-strong border-danger-soft",
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    slate: "bg-secondary-50 text-secondary-700 border-secondary-200",
  };

  // Base styling classes
  const baseClasses = "inline-flex items-center justify-center font-semibold rounded-full border text-[11px] h-5 px-2.5 whitespace-nowrap leading-none transition-colors";

  if (type === "status" && value) {
    const cfg = getStatusConfig(value);
    return (
      <span className={cn(baseClasses, cfg.classes, className)}>
        {cfg.label}
      </span>
    );
  }

  if (type === "category" && value) {
    return (
      <span className={cn(baseClasses, "bg-neutral-50 text-text-secondary border-border-soft capitalize", className)}>
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
    <span className={cn(baseClasses, toneClasses[tone], className)}>
      {children || value}
    </span>
  );
}
