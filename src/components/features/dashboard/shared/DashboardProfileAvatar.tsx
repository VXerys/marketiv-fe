"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface DashboardProfileAvatarProps {
  avatarUrl?: string | null;
  name?: string;
  size?: "sm" | "md" | "lg";
  variant: "umkm" | "kreator";
  className?: string;
  imageClassName?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs font-semibold rounded-full",
  md: "h-9 w-9 text-sm font-semibold rounded-[10px]",
  lg: "h-16 w-16 text-xl font-bold rounded-2xl",
};

const sizePx = {
  sm: 32,
  md: 36,
  lg: 64,
};

export function DashboardProfileAvatar({
  avatarUrl,
  name,
  size = "md",
  variant,
  className,
  imageClassName,
}: DashboardProfileAvatarProps) {
  const initial = name?.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      <div
        className={cn(
          "relative overflow-hidden bg-neutral-100 shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={avatarUrl}
          alt={name || "Avatar"}
          width={sizePx[size]}
          height={sizePx[size]}
          sizes={`${sizePx[size]}px`}
          className={cn("h-full w-full object-cover", imageClassName)}
        />
      </div>
    );
  }

  const gradientClass =
    variant === "umkm"
      ? "bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 text-white shadow-3xs"
      : "bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-700 text-white shadow-3xs";

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 select-none font-display",
        gradientClass,
        sizeClasses[size],
        className
      )}
    >
      <span>{initial}</span>
    </div>
  );
}
