"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Eye, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactViews, formatCompactCurrency, formatCurrency } from "@/lib/formatters";
import type { Campaign, CampaignStatus } from "@/types/umkm-dashboard.types";
import { DashboardBadge } from "../shared/DashboardBadge";
import { DashboardActionMenu } from "../shared/DashboardActionMenu";

interface CampaignCardProps {
  campaign: Campaign;
  pendingCount?: number;
  validCount?: number;
  disputeCount?: number;
  onDuplicate: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onExport: () => void;
  onEdit: () => void;
}

// Cover gradients per niche — dipertahankan karena nilai dinamis runtime
const COVER_GRADIENTS: Record<string, string> = {
  kuliner:    "linear-gradient(135deg, #fb923c, #c2410c)",
  fashion:     "linear-gradient(135deg, #16a34a, #84cc16)",
  pariwisata: "linear-gradient(135deg, #1e3a5f, #93c5fd)",
  edukasi:    "linear-gradient(135deg, #a78bfa, #6d28d9)",
  kecantikan: "linear-gradient(135deg, #f472b6, #be185d)",
  lainnya:    "linear-gradient(135deg, #6b7280, #374151)",
};

// Status dot color untuk badge overlay di atas cover — tetap inline karena dinamis
const STATUS_DOT_COLOR: Record<CampaignStatus, string> = {
  active:    "text-emerald-700 border-emerald-200/60",
  draft:     "text-ink-500 border-ink-200/60",
  paused:    "text-orange-700 border-orange-200/60",
  completed: "text-blue-700 border-blue-200/60",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active:    "Aktif",
  draft:     "Draft",
  paused:    "Dijeda",
  completed: "Selesai",
};

// Niche (kategori) color configuration untuk label bervariasi sesuai best practices
const NICHE_COLOR_CONFIG: Record<string, { bg: string; text: string; border: string }> = {
  kuliner:    { bg: "bg-orange-50",     text: "text-orange-700",    border: "border-orange-200/40" },
  fashion:     { bg: "bg-emerald-50",    text: "text-emerald-700",   border: "border-emerald-200/40" },
  pariwisata: { bg: "bg-blue-50",       text: "text-blue-700",      border: "border-blue-200/40" },
  edukasi:    { bg: "bg-purple-50",     text: "text-purple-700",    border: "border-purple-200/40" },
  kecantikan: { bg: "bg-rose-50",       text: "text-rose-600",      border: "border-rose-200/40" },
  lainnya:    { bg: "bg-neutral-50",    text: "text-neutral-600",   border: "border-neutral-200/40" },
};

export function CampaignCard({
  campaign,
  pendingCount = 0,
  validCount = 0,
  disputeCount = 0,
  onDuplicate,
  onCancel,
  onDelete,
  onExport,
  onEdit,
}: CampaignCardProps) {
  const router = useRouter();

  const coverGradient = COVER_GRADIENTS[campaign.niche] ?? COVER_GRADIENTS.kuliner;
  
  // Progress Budget (uang) sesuai 00_BACKEND (spentAmount/totalBudget)
  const progressPercent = campaign.totalBudgetEscrow > 0
    ? Math.min(100, Math.round((campaign.usedBudget / campaign.totalBudgetEscrow) * 100))
    : 0;

  const isCancelDisabled = campaign.status === "completed";
  const isEditVisible    = campaign.status === "draft";
  // Hapus permanen hanya untuk draft — sekali tayang campaign cuma bisa dijeda.
  const isDeleteVisible  = campaign.status === "draft";

  const actionItems = [
    { label: "Lihat Detail",       onClick: () => router.push(`/dashboard/umkm/campaign/${campaign.id}`) },
    ...(isEditVisible ? [{ label: "Edit Draft", onClick: onEdit }] : []),
    { label: "Duplikasi Campaign", onClick: onDuplicate },
    { label: "Unduh Laporan",      onClick: onExport    },
    ...(!isCancelDisabled ? [{ label: "Batalkan Campaign", onClick: onCancel, danger: true }] : []),
    ...(isDeleteVisible ? [{ label: "Hapus Draft", onClick: onDelete, danger: true }] : []),
  ];

  const statusDotClass = STATUS_DOT_COLOR[campaign.status] ?? STATUS_DOT_COLOR.active;
  const statusLabel    = STATUS_LABEL[campaign.status] ?? "Aktif";
  
  const nicheCfg = NICHE_COLOR_CONFIG[campaign.niche] ?? NICHE_COLOR_CONFIG.lainnya;

  return (
    <div className="campaign-card hover-card-animate">
      {/* Action menu — z-50 so it floats above cover art */}
      <div className="absolute top-3 right-3 z-50">
        <DashboardActionMenu items={actionItems} />
      </div>

      {/* Cover art */}
      <div className="campaign-card-cover" style={{ background: coverGradient }}>
        {/* Decorative light overlay — kompleks gradient, dipertahankan */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 18% 24%, rgba(255,255,255,.82) 0 10%, transparent 11%)," +
              "radial-gradient(circle at 82% 22%, rgba(255,255,255,.38) 0 8%, transparent 9%)," +
              "linear-gradient(180deg, transparent 34%, rgba(12,23,43,.32))",
          }}
        />

        {/* Status badge overlay — menggunakan Tailwind token, bukan hex statik */}
        <span
          className={cn(
            "absolute top-3 left-3 inline-flex items-center gap-1.5 min-h-[28px] px-2.5 rounded-full bg-white/90 border text-[.72rem] font-[800] backdrop-blur-[10px]",
            statusDotClass
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current" />
          {statusLabel}
        </span>

        {/* Budget chip — pakai formatCompactCurrency dari @/lib/formatters */}
        <span className="absolute bottom-3 right-3 px-3 py-2 rounded-[14px] bg-white/90 border border-white/30 shadow-md text-[.82rem] font-[850] text-ink-900 tracking-tight backdrop-blur-[10px]">
          {formatCompactCurrency(campaign.totalBudgetEscrow)}
        </span>
      </div>

      {/* Body */}
      <div className="campaign-card-body">
        <div className="min-w-0">
          {/* Category chip dengan warna yang bervariasi sesuai niche */}
          <span className={cn(
            "inline-block text-[9px] font-black uppercase tracking-widest mb-1.5 select-none px-2 py-0.5 rounded-md border",
            nicheCfg.bg,
            nicheCfg.text,
            nicheCfg.border
          )}>
            {campaign.niche}
          </span>
          <h3 className="campaign-card-title">{campaign.title}</h3>
          <p className="text-xs text-text-muted line-clamp-2 min-w-0 mt-1">{campaign.brief}</p>
        </div>

        {/* CPM / Reward Rate Info — Exact formatCurrency is best practice for exact payouts */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-primary-50/70 border border-primary/10 text-[10px] font-bold text-primary w-fit select-none">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Komisi: <strong className="font-extrabold">{formatCurrency(campaign.pricePerThousandViews)}</strong> / 1.000 tayangan</span>
        </div>

        {/* Stats row — descriptive terminology */}
        <div className="campaign-card-meta">
          <span className="flex items-center gap-1 font-extrabold text-[0.72rem]"><Users size={13} className="text-text-muted" />{campaign.usedQuota}/{campaign.creatorQuota} Kreator</span>
          <span className="flex items-center gap-1 font-extrabold text-[0.72rem]"><Eye size={13} className="text-text-muted" />{formatCompactViews(campaign.totalViews)} Views</span>
          <span className="flex items-center gap-1 font-extrabold text-[0.72rem]">
            <Calendar size={13} className="text-text-muted" />
            {new Date(campaign.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Budget progress (Ganti progress kuota ke progress uang) */}
        <div className="min-w-0">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
              Anggaran Terpakai
            </span>
            <span className="text-[12px] font-extrabold text-neutral-900">
              {formatCompactCurrency(campaign.usedBudget)}{" "}
              <span className="text-neutral-400 font-medium">/ {formatCompactCurrency(campaign.totalBudgetEscrow)}</span>{" "}
              <span className={cn(
                "ml-1 text-[11px] px-1.5 py-0.5 rounded-md font-bold border",
                progressPercent >= 100
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-orange-50 text-orange-600 border-orange-100"
              )}>
                {progressPercent}%
              </span>
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-neutral-100/80 shadow-[inset_0_1.5px_3px_rgba(15,23,42,0.06)] overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-[800ms] ease-[cubic-bezier(.2,.8,.2,1)] relative bg-gradient-to-r",
                progressPercent >= 100
                  ? "from-emerald-500 via-teal-500 to-emerald-400"
                  : "from-orange-600 via-orange-500 to-amber-400"
              )}
              style={{ width: `${progressPercent}%` }}
            >
              {/* Glossy top highlight for 3D premium depth */}
              <div className="absolute inset-x-0 top-0 h-[35%] bg-white/25 rounded-full" />
            </div>
          </div>
        </div>

        {/* Submissions summary — descriptive label */}
        <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary border-t border-border-soft pt-3 justify-between items-center min-w-0">
          <span className="font-bold uppercase tracking-wider text-[9px] text-text-muted truncate">Validasi Konten</span>
          <div className="flex gap-1.5 shrink-0">
            <DashboardBadge tone="amber" className="h-4.5 px-2 text-[9px] font-bold">
              {pendingCount} Pending
            </DashboardBadge>
            <DashboardBadge tone="green" className="h-4.5 px-2 text-[9px] font-bold">
              {validCount} Valid
            </DashboardBadge>
            {disputeCount > 0 && (
              <DashboardBadge tone="red" className="h-4.5 px-2 text-[9px] font-bold">
                {disputeCount} Sengketa
              </DashboardBadge>
            )}
          </div>
        </div>

        {/* Primary CTA with premium hover transitions */}
        <div className="mt-auto pt-2">
          <Link
            href={`/dashboard/umkm/campaign/${campaign.id}`}
            className={cn(
              "flex items-center justify-center min-h-[36px] w-full rounded-[11px] text-[.82rem] font-[800] transition-all duration-250 no-underline cursor-pointer select-none text-center",
              campaign.status === "draft"
                ? "bg-neutral-900 text-white shadow-[0_8px_20px_rgba(0,0,0,.15)] hover:bg-neutral-800 hover:-translate-y-0.5 active:translate-y-0"
                : "bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-[0_8px_20px_rgba(234,88,12,.2)] hover:from-[#ea580c] hover:to-[#c2410c] hover:shadow-[0_12px_28px_rgba(234,88,12,.35)] hover:-translate-y-0.5 active:translate-y-0"
            )}
          >
            {campaign.status === "draft" ? "Lanjutkan Draft" : "Lihat Detail"}
          </Link>
        </div>
      </div>
    </div>
  );
}
