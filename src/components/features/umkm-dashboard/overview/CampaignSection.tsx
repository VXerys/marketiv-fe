"use client";

import Link from "next/link";
import { Users, Eye, Calendar, ChevronRight, Plus } from "lucide-react";
import type { Campaign, CampaignStatus } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";

interface CampaignSectionProps {
  campaigns?: Campaign[];
  isLoading?: boolean;
  onCreateClick?: () => void;
  onViewAllClick?: () => void;
}

const STATUS_CONFIG: Record<CampaignStatus, { label: string; bg: string; color: string; border: string }> = {
  active: { label: "Aktif", bg: "#f1fbf5", color: "#177b42", border: "rgba(22,163,74,.22)" },
  draft: { label: "Konsep", bg: "#f8fafc", color: "#687386", border: "rgba(148,163,184,.28)" },
  paused: { label: "Dijeda", bg: "#fff7ed", color: "#bd4b0b", border: "rgba(251,146,60,.24)" },
  completed: { label: "Selesai", bg: "#f0f6ff", color: "#2d5bd1", border: "rgba(96,165,250,.25)" },
};

function CampaignSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden bg-white border border-neutral-200/80 rounded-[28px] shadow-[0_12px_36px_-12px_rgba(0,0,0,0.05)]">
      {/* Cover placeholder */}
      <div className="h-[160px] bg-[#edf1f5] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent" style={{ animation: "shimmer 1.45s infinite" }} />
      </div>
      {/* Body placeholder */}
      <div className="p-5 flex flex-col gap-3">
        {[80, 60, 100, 70].map((w, i) => (
          <div
            key={i}
            className="relative overflow-hidden rounded-lg bg-[#edf1f5]"
            style={{ width: `${w}%`, height: i === 2 ? 8 : 14 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent" style={{ animation: "shimmer 1.45s infinite" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatViews(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `${(num / 1000).toFixed(0)}rb`;
  return String(num);
}

function formatBudget(num: number): string {
  if (num >= 1000000) return `Rp ${(num / 1000000).toFixed(1)}jt`;
  if (num >= 1000) return `Rp ${(num / 1000).toFixed(0)}rb`;
  return `Rp ${num}`;
}



function CampaignCard({ campaign }: { campaign: Campaign }) {
  const statusCfg = STATUS_CONFIG[campaign.status] || STATUS_CONFIG.active;
  const progressPercent = campaign.totalBudgetEscrow > 0 ? Math.min(100, Math.round((campaign.usedBudget / campaign.totalBudgetEscrow) * 100)) : 0;
  
  // Custom cover gradients based on niche
  const coverGradients: Record<string, string> = {
    kuliner: "linear-gradient(135deg, #ea580c, #c2410c)",
    fashion: "linear-gradient(135deg, #16a34a, #15803d)",
    pariwisata: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    edukasi: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    kecantikan: "linear-gradient(135deg, #db2777, #be185d)",
    lainnya: "linear-gradient(135deg, #475569, #334155)",
  };

  const coverGradient = coverGradients[campaign.niche] || coverGradients.kuliner;

  return (
    <Link
      href={`/dashboard/umkm/campaign/${campaign.id}`}
      className="flex flex-col overflow-hidden bg-white border border-slate-200/90 rounded-3xl shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_10px_30px_rgba(15,23,42,0.08)] cursor-pointer hover-card-animate h-full justify-between transition-all"
    >
      {/* Cover Header */}
      <div
        className="h-36 relative overflow-hidden shrink-0 flex flex-col justify-between p-3.5"
        style={{
          background: coverGradient,
        }}
      >
        {/* Subtle overlay texture */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />

        {/* Top Header Row: Status badge */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-white/40">
            <span className="w-2 h-2 rounded-full" style={{ background: statusCfg.color }} />
            <span className="text-[11px] font-black tracking-tight" style={{ color: statusCfg.color }}>
              {statusCfg.label}
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-black/25 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
            {campaign.niche}
          </span>
        </div>

        {/* Bottom Banner Row: Budget chip */}
        <div className="relative z-10 flex justify-end">
          <div className="px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md shadow-md border border-white/60 text-slate-900 font-black text-xs tracking-tight">
            {formatBudget(campaign.totalBudgetEscrow)}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col justify-between flex-1 gap-3">
        <div className="space-y-2">
          {/* Title */}
          <h3 className="font-display font-black text-slate-900 text-base sm:text-lg leading-snug tracking-tight line-clamp-1">
            {campaign.title}
          </h3>

          {/* CPM / Reward Rate Info */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-black">
            <span>Komisi:</span>
            <span>{formatCurrency(campaign.pricePerThousandViews)}</span>
            <span className="text-orange-500 font-semibold">/ 1rb Tayangan</span>
          </div>
        </div>

        {/* Stats row with high contrast icons & text */}
        <div className="flex items-center gap-3 text-xs font-extrabold text-slate-700 flex-wrap pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-500 shrink-0" />
            <span>{campaign.usedQuota}/{campaign.creatorQuota} Kreator</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Eye size={14} className="text-slate-500 shrink-0" />
            <span>{campaign.totalViews === undefined ? "—" : formatViews(campaign.totalViews)} tayangan</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} className="text-slate-500 shrink-0" />
            <span>{new Date(campaign.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
          </div>
        </div>

        {/* Progress & Budget */}
        <div className="pt-2">
          <div className="flex items-center justify-between gap-2 mb-1.5 text-xs font-black">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              ANGGARAN TERPAKAI
            </span>
            <div className="flex items-center gap-1.5 whitespace-nowrap text-slate-900 font-extrabold">
              <span>{formatBudget(campaign.usedBudget)}</span>
              <span className="text-slate-300 font-normal">/</span>
              <span className="text-slate-500">{formatBudget(campaign.totalBudgetEscrow)}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-black border ${
                  progressPercent >= 100
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-orange-50 text-orange-600 border-orange-200"
                }`}
              >
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden relative shadow-inner">
            <div
              className={`h-full rounded-full transition-all duration-700 relative ${
                progressPercent >= 100
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                  : "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400"
              }`}
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute inset-0 bg-white/20 rounded-full h-1/2" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function CampaignSection({ campaigns = [], isLoading = false, onCreateClick, onViewAllClick }: CampaignSectionProps) {
  const visibleCampaigns = campaigns.slice(0, 2);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "#ea580c",
              fontSize: ".72rem",
              fontWeight: 900,
              letterSpacing: ".12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            <span style={{ display: "block", width: 14, height: 2, borderRadius: 999, background: "#f97316" }} />
            Kampanye
          </div>
          <h2
            style={{
              fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif",
              fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)",
              fontWeight: 700,
              letterSpacing: "-.055em",
              lineHeight: 1,
              color: "#182033",
              margin: 0,
            }}
          >
            Kampanye Terbaru Anda
          </h2>
        </div>

        {!isLoading && campaigns.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={onViewAllClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 34,
                padding: "0 12px",
                border: "1px solid rgba(17,24,39,.09)",
                borderRadius: 11,
                background: "rgba(255,255,255,.82)",
                color: "#556174",
                fontSize: ".78rem",
                fontWeight: 790,
                boxShadow: "0 6px 18px rgba(15,23,42,.05)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Lihat Semua
              <ChevronRight size={13} />
            </button>
            <button
              onClick={onCreateClick}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                minHeight: 34,
                padding: "0 12px",
                border: "none",
                borderRadius: 11,
                background: "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
                color: "white",
                fontSize: ".78rem",
                fontWeight: 800,
                boxShadow: "0 8px 20px rgba(234,88,12,.2)",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              <Plus size={14} />
              Buat Kampanye Baru
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <CampaignSkeleton key={i} />
          ))}
        </div>
      ) : campaigns.length === 0 ? (
        <div
          style={{
            padding: "48px 20px",
            borderRadius: 24,
            border: "1px solid rgba(17,24,39,.08)",
            background: "white",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(15,23,42,.04)",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📢</div>
          <h3 style={{ margin: "0 0 6px", fontFamily: "var(--font-plus-jakarta-sans), Sora, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "#182033" }}>
            Belum Ada Kampanye
          </h3>
          <p style={{ margin: "0 0 20px", fontSize: ".82rem", color: "#737f91", maxWidth: 320, marginLeft: "auto", marginRight: "auto" }}>
            Mulai promosikan bisnis Anda dengan membuat kampanye pertama.
          </p>
          <button
            onClick={onCreateClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minHeight: 36,
              padding: "0 16px",
              border: "none",
              borderRadius: 11,
              background: "linear-gradient(180deg, #fb7a18 0%, #ea580c 100%)",
              color: "white",
              fontSize: ".82rem",
              fontWeight: 800,
              boxShadow: "0 8px 20px rgba(234,88,12,.2)",
              cursor: "pointer",
            }}
          >
            <Plus size={14} />
            Buat Kampanye Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {visibleCampaigns.map((camp) => (
            <CampaignCard key={camp.id} campaign={camp} />
          ))}
        </div>
      )}
    </div>
  );
}
