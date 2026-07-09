"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Eye, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCompactViews, formatCompactCurrency } from "@/lib/formatters";
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
  onExport: () => void;
  onEdit: () => void;
}

// Cover gradients per niche — dipertahankan karena nilai dinamis runtime
const COVER_GRADIENTS: Record<string, string> = {
  kuliner:    "linear-gradient(135deg, #fb923c, #c2410c)",
  fesyen:     "linear-gradient(135deg, #16a34a, #84cc16)",
  pariwisata: "linear-gradient(135deg, #1e3a5f, #93c5fd)",
  edukasi:    "linear-gradient(135deg, #a78bfa, #6d28d9)",
  kecantikan: "linear-gradient(135deg, #f472b6, #be185d)",
  lainnya:    "linear-gradient(135deg, #6b7280, #374151)",
};

// Status dot color untuk badge overlay di atas cover — tetap inline karena dinamis
const STATUS_DOT_COLOR: Record<CampaignStatus, string> = {
  active:    "text-emerald-700 border-emerald-200/60",
  draft:     "text-ink-500 border-ink-200/60",
  full:      "text-orange-700 border-orange-200/60",
  completed: "text-blue-700 border-blue-200/60",
  cancelled: "text-red-700 border-red-200/60",
};

const STATUS_LABEL: Record<CampaignStatus, string> = {
  active:    "Aktif",
  draft:     "Draft",
  full:      "Penuh",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export function CampaignCard({
  campaign,
  pendingCount = 0,
  validCount = 0,
  disputeCount = 0,
  onDuplicate,
  onCancel,
  onExport,
  onEdit,
}: CampaignCardProps) {
  const router = useRouter();

  const coverGradient = COVER_GRADIENTS[campaign.niche] ?? COVER_GRADIENTS.kuliner;
  const progressPercent = campaign.creatorQuota > 0
    ? Math.min(100, Math.round((campaign.usedQuota / campaign.creatorQuota) * 100))
    : 0;

  const isCancelDisabled = campaign.status === "completed" || campaign.status === "cancelled";
  const isEditVisible    = campaign.status === "draft";

  const actionItems = [
    { label: "Lihat Detail",       onClick: () => router.push(`/dashboard/umkm/campaign/${campaign.id}`) },
    ...(isEditVisible ? [{ label: "Edit Draft", onClick: onEdit }] : []),
    { label: "Duplikasi Campaign", onClick: onDuplicate },
    { label: "Unduh Laporan",      onClick: onExport    },
    ...(!isCancelDisabled ? [{ label: "Batalkan Campaign", onClick: onCancel, danger: true }] : []),
  ];

  const statusDotClass = STATUS_DOT_COLOR[campaign.status] ?? STATUS_DOT_COLOR.active;
  const statusLabel    = STATUS_LABEL[campaign.status] ?? "Aktif";

  return (
    <div className="campaign-card">
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

        {/* Category chip */}
        <span className="absolute top-3 right-10 px-2.5 py-[5px] rounded-full bg-[rgba(12,23,43,.36)] border border-white/20 text-white text-[.7rem] font-[800] backdrop-blur-[10px] capitalize">
          {campaign.niche}
        </span>

        {/* Budget chip — pakai formatCompactCurrency dari @/lib/formatters */}
        <span className="absolute bottom-3 right-3 px-3 py-2 rounded-[14px] bg-white/90 border border-white/30 shadow-md text-[.82rem] font-[850] text-ink-900 tracking-tight backdrop-blur-[10px]">
          {formatCompactCurrency(campaign.totalBudgetEscrow)}
        </span>
      </div>

      {/* Body */}
      <div className="campaign-card-body">
        <div className="min-w-0">
          <h3 className="campaign-card-title">{campaign.title}</h3>
          <p className="text-xs text-text-muted line-clamp-2 min-w-0 mt-1">{campaign.brief}</p>
        </div>

        {/* Stats row */}
        <div className="campaign-card-meta">
          <span><Users size={13} />{campaign.usedQuota}/{campaign.creatorQuota} kreator</span>
          {/* pakai formatCompactViews dari @/lib/formatters */}
          <span><Eye size={13} />{formatCompactViews(campaign.totalViews)} views</span>
          <span>
            <Calendar size={13} />
            {new Date(campaign.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
          </span>
        </div>

        {/* Quota progress */}
        <div className="min-w-0">
          <div className="flex justify-between mb-1.5 text-[.74rem] font-[760] text-ink-500">
            <span>Progress Kuota</span>
            <span className="text-ink-900 font-[800]">{progressPercent}%</span>
          </div>
          <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-[inherit] transition-[width] duration-[600ms] ease-[cubic-bezier(.2,.8,.2,1)] bg-gradient-to-r",
                progressPercent >= 100 ? "from-green-600 to-lime-400" : "from-orange-500 to-amber-400"
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Submissions summary */}
        <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary border-t border-border-soft pt-3 justify-between items-center min-w-0">
          <span className="font-bold uppercase tracking-wider text-[9px] text-text-muted truncate">Submissions</span>
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

        {/* Primary CTA */}
        <div className="mt-auto pt-2">
          <Link
            href={`/dashboard/umkm/campaign/${campaign.id}`}
            className={cn(
              "flex items-center justify-center min-h-[36px] w-full rounded-[11px] text-[.82rem] font-[800] transition-all duration-200 no-underline",
              campaign.status === "draft"
                ? "bg-ink-900/[.06] text-ink-900 hover:bg-ink-900/[.10]"
                : "bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-[0_8px_20px_rgba(234,88,12,.2)] hover:shadow-[0_12px_28px_rgba(234,88,12,.28)] hover:-translate-y-px"
            )}
          >
            {campaign.status === "draft" ? "Lanjutkan Draft" : "Lihat Detail"}
          </Link>
        </div>
      </div>
    </div>
  );
}
