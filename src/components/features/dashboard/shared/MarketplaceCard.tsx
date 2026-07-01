import Image from "next/image";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DashboardCard } from "./DashboardCard";

interface MarketplaceCardImage {
  src: string;
  alt: string;
}

interface MarketplaceCardProps {
  kind: "campaign" | "job";
  title: ReactNode;
  subtitle?: ReactNode;
  image?: MarketplaceCardImage;
  badges?: ReactNode;
  metrics?: ReactNode;
  primaryAction: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
}

export function MarketplaceCard({
  kind,
  title,
  subtitle,
  image,
  badges,
  metrics,
  primaryAction,
  secondaryAction,
  className,
}: MarketplaceCardProps) {
  return (
    <DashboardCard className={cn("group flex h-full flex-col gap-5", className)} data-kind={kind} interactive>
      <div className="flex min-w-0 items-start gap-4">
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100">
          {image ? (
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="56px"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-bold text-orange-700">
              {String(title).charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="min-w-0">
            <h3 className="line-clamp-2 text-lg font-bold leading-snug text-neutral-950">{title}</h3>
            {subtitle ? <p className="mt-1 truncate text-sm font-medium text-neutral-500">{subtitle}</p> : null}
          </div>
          {badges ? <div className="flex flex-wrap gap-2">{badges}</div> : null}
        </div>
      </div>
      {metrics ? <div className="min-w-0 flex-1 space-y-4">{metrics}</div> : null}
      <div className="flex flex-col gap-3 sm:flex-row">
        {secondaryAction ? <div className="sm:flex-1">{secondaryAction}</div> : null}
        <div className="sm:flex-1">{primaryAction}</div>
      </div>
    </DashboardCard>
  );
}
