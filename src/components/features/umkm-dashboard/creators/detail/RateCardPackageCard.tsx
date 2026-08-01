"use client";

import { cn } from "@/lib/utils";

export interface RateCardPackage {
  id: string;
  name: string;
  price: string;
  description: string;
  deliveryDays: number;
  revisionLimit: number | null;
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
        "price-card !flex !flex-col justify-between h-full select-none transition-all duration-300 hover:scale-[1.015] hover:-translate-y-1 hover:shadow-md hover:border-orange-300/40",
        pkg.recommended && "featured hover:border-orange-400/50"
      )}
    >
      {pkg.recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-[8px] font-extrabold uppercase tracking-widest text-white border border-white z-10 shadow-sm">
          Paling Populer
        </span>
      )}

      <div className="space-y-4">
        {/* Package Header */}
        <div>
          <h4 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
            {pkg.name}
          </h4>
          <div className="text-2xl font-black tracking-tighter text-ink-950 leading-none mt-2.5 flex items-baseline gap-1 flex-wrap font-display">
            <span>{pkg.price.split("/")[0]}</span>
            <span className="text-ink-500 text-xs font-semibold">/ Konten</span>
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
            <span>{pkg.revisionLimit != null ? `${pkg.revisionLimit}x` : "—"} Revisi</span>
          </div>
        </div>

        {/* Deliverables list */}
        <div className="space-y-2">
          <span className="block text-[8px] font-bold text-text-muted uppercase tracking-wider">
            Detail Deliverables
          </span>
          <ul className="feature-list">
            {pkg.deliverables.map((item, idx) => (
              <li key={idx}>
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
          "w-full py-3 rounded-xl text-xs font-bold transition-all duration-200 mt-auto cursor-pointer flex items-center justify-center min-h-[42px]",
          pkg.recommended
            ? "bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white border-0 shadow-[0_4px_14px_rgba(234,88,12,.18)] hover:shadow-[0_8px_20px_rgba(234,88,12,.24)] hover:-translate-y-px"
            : "bg-white hover:bg-orange-50/50 text-ink-800 border border-border shadow-3xs hover:border-orange-200/50"
        )}
      >
        Mulai Negosiasi
      </button>
    </div>
  );
}
