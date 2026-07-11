"use client";

import { Eye, Users, Zap, ImageIcon } from "lucide-react";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardBadge } from "../shared/DashboardBadge";

interface CampaignLivePreviewCardProps {
  title: string;
  category: string;
  brief: string;
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  creatorQuota: number;
}

export function CampaignLivePreviewCard({
  title,
  category,
  brief,
  pricePerThousandViews,
  totalBudgetEscrow,
  creatorQuota,
}: CampaignLivePreviewCardProps) {
  const displayTitle = title.trim() || null;
  const displayBrief = brief.trim() || null;
  const estimatedViews =
    pricePerThousandViews > 0
      ? Math.round((totalBudgetEscrow / pricePerThousandViews) * 1000)
      : 0;

  return (
    <div
      className="rounded-2xl sm:rounded-[22px] overflow-hidden flex flex-col select-none"
      style={{ border: "1px solid rgba(17,24,39,.08)", boxShadow: "0 4px 20px rgba(15,23,42,.06)" }}
    >
      {/* ── Cover banner ──────────────────────────────────── */}
      <div
        className="relative h-32 w-full flex items-center justify-center overflow-hidden"
        style={{
          background:
            "radial-gradient(circle at 20% 50%, rgba(251,122,24,.70) 0%, transparent 60%), " +
            "radial-gradient(circle at 80% 20%, rgba(234,88,12,.55) 0%, transparent 55%), " +
            "linear-gradient(135deg, #f97316 0%, #c2410c 100%)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[.06]" />
        <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-black/[.08]" />

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-10">
          {category ? (
            <DashboardBadge
              type="category"
              value={category}
              className="font-extrabold uppercase text-[10px]"
            />
          ) : (
            <span className="text-[9px] font-[800] text-white/70 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-full uppercase tracking-wider">
              Pilih kategori
            </span>
          )}
        </div>

        {/* Live badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[9px] font-[800] text-white uppercase tracking-wider">Live Preview</span>
        </div>

        {/* Cover placeholder */}
        <div className="relative z-10 text-center text-white">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm grid place-items-center mx-auto mb-1.5 border border-white/25">
            <ImageIcon size={18} className="opacity-80" />
          </div>
          <span className="text-[9px] font-[700] tracking-wider uppercase opacity-75">Campaign Cover</span>
        </div>
      </div>

      {/* ── Card body ─────────────────────────────────────── */}
      <div className="p-4 flex flex-col gap-3.5 bg-white flex-1">
        {/* Title & brief */}
        <div className="space-y-1.5">
          <h4 className={`text-[.86rem] font-[760] leading-snug line-clamp-1 font-display ${displayTitle ? "text-ink-950" : "text-ink-300 italic"}`}>
            {displayTitle ?? "Judul campaign akan muncul di sini"}
          </h4>
          <p className={`text-[.74rem] leading-relaxed line-clamp-2 ${displayBrief ? "text-ink-500 font-[550]" : "text-ink-300 italic"}`}>
            {displayBrief ?? "Isi brief agar kreator memahami kebutuhan Anda"}
          </p>
        </div>

        {/* Stats grid */}
        <div
          className="grid grid-cols-2 gap-2.5 pt-3"
          style={{ borderTop: "1px dashed rgba(17,24,39,.10)" }}
        >
          {/* Escrow */}
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[.66rem] font-[700] text-ink-400 uppercase tracking-wider">
              <Zap size={9} className="text-orange-400" />
              Anggaran Escrow
            </span>
            <span className="text-[.84rem] font-[800] text-orange-600 font-display leading-none">
              {formatCurrency(totalBudgetEscrow)}
            </span>
          </div>

          {/* Rate */}
          <div className="space-y-0.5">
            <span className="text-[.66rem] font-[700] text-ink-400 uppercase tracking-wider block">
              Bayaran / 1K Views
            </span>
            <span className="text-[.84rem] font-[800] text-ink-800 font-display leading-none">
              {formatCurrency(pricePerThousandViews)}
            </span>
          </div>

          {/* Kreator quota */}
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[.66rem] font-[700] text-ink-400 uppercase tracking-wider">
              <Users size={9} className="text-blue-400" />
              Kuota Kreator
            </span>
            <span className="text-[.84rem] font-[800] text-ink-800 font-display leading-none">
              {creatorQuota} Slot
            </span>
          </div>

          {/* Target views */}
          <div className="space-y-0.5">
            <span className="flex items-center gap-1 text-[.66rem] font-[700] text-ink-400 uppercase tracking-wider">
              <Eye size={9} className="text-emerald-400" />
              Target Views
            </span>
            <span className="text-[.84rem] font-[800] text-emerald-600 font-display leading-none">
              {formatCompactNumber(estimatedViews)} Views
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
