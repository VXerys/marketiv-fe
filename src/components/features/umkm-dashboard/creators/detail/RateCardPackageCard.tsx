"use client";

import { cn } from "@/lib/utils";

export interface RateCardPackage {
  id: string;
  name: string;
  price: string;
  description: string;
  deliveryDays: number;
  revisionLimit: number;
  deliverables: string[];
  recommended?: boolean;
}

interface RateCardPackageCardProps {
  pkg: RateCardPackage;
  onSelectPackage: (pkg: RateCardPackage) => void;
}

export function RateCardPackageCard({ pkg, onSelectPackage }: RateCardPackageCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-white flex flex-col justify-between p-5 transition-all duration-350 select-none relative",
        pkg.recommended
          ? "border-primary shadow-[0_12px_28px_-8px_rgba(235,94,40,0.08)] scale-[1.01]"
          : "border-border-soft shadow-2xs hover:border-neutral-300"
      )}
    >
      {pkg.recommended && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-[8px] font-extrabold uppercase tracking-widest text-white border border-white">
          Paling Populer
        </span>
      )}

      <div className="space-y-4">
        {/* Package Header */}
        <div>
          <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
            {pkg.name}
          </h4>
          <div className="flex items-baseline gap-1 mt-1.5">
            <span className="text-base sm:text-lg font-extrabold text-primary tracking-tight">
              {pkg.price}
            </span>
            <span className="text-[9px] font-bold text-text-muted">/ Konten</span>
          </div>
          <p className="text-[10px] text-text-secondary mt-1 font-semibold leading-relaxed">
            {pkg.description}
          </p>
        </div>

        {/* Technical terms */}
        <div className="flex gap-4 border-y border-dashed border-border-soft py-2.5 text-[9px] font-bold text-text-muted">
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{pkg.deliveryDays} Hari Kerja</span>
          </div>
          <div className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18v3.54" />
            </svg>
            <span>{pkg.revisionLimit}x Revisi</span>
          </div>
        </div>

        {/* Deliverables list */}
        <div className="space-y-2">
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
            Detail Deliverables
          </span>
          <ul className="space-y-1.5">
            {pkg.deliverables.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-[10px] font-semibold text-text-secondary leading-tight">
                <span className="h-3.5 w-3.5 rounded-full bg-success-soft/35 text-success flex items-center justify-center shrink-0 text-[8px]">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onSelectPackage(pkg)}
        className={cn(
          "w-full py-2.5 rounded-xl text-xs font-bold transition-all duration-200 mt-5 cursor-pointer shadow-2xs",
          pkg.recommended
            ? "bg-primary hover:bg-primary-600 text-white border border-primary hover:border-primary-600"
            : "bg-neutral-50 hover:bg-neutral-100 text-text-primary border border-border-subtle hover:border-neutral-300"
        )}
      >
        Mulai Negosiasi
      </button>
    </div>
  );
}
