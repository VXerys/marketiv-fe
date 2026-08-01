"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
import { CreatorActiveWork } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { DashboardStateCard } from "@/components/features/dashboard/shared";
import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency } from "@/lib/formatters";
import { getClaimStatusLabel, getFraudStatusLabel, getSubmissionStatusLabel } from "@/lib/creator-status";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { unclaimCampaign } from "@/services/creator/creator-dashboard.service";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  PlayCircle,
  Clock,
  Search,
  SlidersHorizontal,
  X,
  TriangleAlert,
} from "lucide-react";

interface PekerjaanAktifViewProps {
  initialWorks: CreatorActiveWork[];
}

/**
 * Thumbnail campaign.
 *
 * Versi lama memetakan `campaign_006/007/008` ke tiga foto Unsplash dan sisanya
 * ke foto keempat — id-id itu hanya ada di mock, jadi dengan data nyata SEMUA
 * campaign memakai foto makanan yang sama. `campaigns` tidak punya kolom
 * thumbnail (lihat mapCampaign di umkm-appwrite.service.ts), jadi sampai kolom
 * itu ada, yang jujur adalah tidak menampilkan foto sama sekali.
 */

// ─── ActiveJobCard ────────────────────────────────────────────────────────────

const PLATFORM_ICON = {
  tiktok: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  ),
  instagram: (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  ),
};

const CREATOR_DARK_GRADIENT =
  "linear-gradient(135deg, var(--color-kreator-ink) 0%, var(--color-kreator-ink-mid) 45%, var(--color-kreator-900) 100%)";
const CREATOR_ACTION_GRADIENT =
  "linear-gradient(135deg, var(--color-kreator-600), var(--color-kreator-action-end))";

function ActiveJobCard({
  work,
  getSubStatusLabel,
  getDaysRemaining,
  onUnclaim,
}: {
  work: CreatorActiveWork;
  getSubStatusLabel: (w: CreatorActiveWork) => string;
  getDaysRemaining: (d: string) => { text: string; days: number };
  onUnclaim: () => void;
}) {
  const subStatus    = getSubStatusLabel(work);
  const hasSubmitted = !!work.contentUrl;
  const { text: deadlineText, days } = getDaysRemaining(work.deadline);
  const isFraud   = work.submissionStatus === "rejected" || work.status === "rejected" || work.fraudStatus === "rejected";
  const isValid   = work.submissionStatus === "approved" || work.status === "approved";
  const isPending = work.submissionStatus === "pending";
  // Sejalan dengan guard service: hanya claim `claimed` yang belum kirim bukti.
  const canUnclaim = work.status === "claimed" && !hasSubmitted;

  // Earnings data
  // Views hasil audit backend; 0 sebelum tervalidasi. Estimasi hanya ditampilkan
  // bila sudah ada angka nyata — jangan menjanjikan nominal dari views karangan.
  const auditedViews = work.actualViews ?? 0;
  const earningVal   = isValid
    ? (work.earnings ?? 0)
    : (work.ratePerThousandViews * auditedViews) / 1000;
  const earningLabel = isValid ? "Pendapatan Dirilis" : "Estimasi Reward";

  const platform = work.platform;

  // Key = label hasil getSubStatusLabel (lihat src/lib/creator-status.ts)
  const STATUS_CHIP: Record<string, string> = {
    "Belum Submit":      "bg-blue-600/90 text-white border-blue-400/30",
    "Menunggu Review":   "bg-amber-500/90 text-white border-amber-300/30",
    "Perlu Ditinjau":    "bg-amber-500/90 text-white border-amber-300/30",
    "Disetujui":         "bg-emerald-600/90 text-white border-emerald-400/30",
    "Selesai":           "bg-emerald-600/90 text-white border-emerald-400/30",
    "Ditolak":           "bg-red-600/90 text-white border-red-400/30",
    "Terindikasi Fraud": "bg-red-600/90 text-white border-red-400/30",
  };

  return (
    <div
      className={cn(
        "group bg-white rounded-[22px] border overflow-hidden transition-all duration-300 flex flex-col animate-in fade-in",
        isFraud
          ? "border-red-200/60 shadow-[0_4px_20px_rgba(220,38,38,.07)] hover:shadow-[0_16px_48px_rgba(220,38,38,.12)] hover:-translate-y-1.5 hover:border-red-300/40"
          : isValid
          ? "border-emerald-200/50 shadow-[0_4px_20px_rgba(22,163,74,.07)] hover:shadow-[0_16px_48px_rgba(22,163,74,.12)] hover:-translate-y-1.5 hover:border-emerald-300/40"
          : "border-neutral-200/50 shadow-1 hover:shadow-kreator-avatar hover:-translate-y-1.5 hover:border-kreator-400/20"
      )}
    >
      {/* Cover image — same 4:3 as Job Pool */}
      <div className="relative w-full overflow-hidden shrink-0" style={{ aspectRatio: "4/3" }}>
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: CREATOR_DARK_GRADIENT,
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 52%)" }}
        />

        {/* Brand row */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg border border-white/20 overflow-hidden shrink-0 relative bg-white/10">
              {work.brandAvatar ? (
                <Image src={work.brandAvatar} alt={work.brandName} fill className="object-cover" sizes="28px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-bold text-[10px] text-white/50">B</div>
              )}
            </div>
            <span className="text-white text-xs font-bold drop-shadow-sm truncate">{work.brandName}</span>
          </div>
          <span
            className="shrink-0 ml-2 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider text-white border border-white/20"
            style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(4px)" }}
          >
            PPV
          </span>
        </div>

        {/* Status chip */}
        <div className="absolute top-2.5 left-2.5">
          <span
            className={cn(
              "px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border",
              STATUS_CHIP[subStatus] ?? "bg-neutral-800/90 text-white border-neutral-600/30"
            )}
            style={{ backdropFilter: "blur(4px)" }}
          >
            {subStatus}
          </span>
        </div>
      </div>

      {/* Card body — same compact density as Job Pool */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h4 className="text-sm font-extrabold text-kreator-ink leading-snug line-clamp-2">{work.title}</h4>

        {/* CPM Rate row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[1.1rem] font-black text-kreator-600 tracking-tight leading-none">
              {formatCurrency(work.ratePerThousandViews)}
            </span>
            <span className="text-[10px] text-neutral-400 font-semibold">/ 1K views</span>
          </div>
          <span className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border shrink-0",
            platform === "tiktok"
              ? "bg-neutral-900 text-white border-neutral-700"
              : platform === "instagram"
              ? "bg-gradient-to-r from-fuchsia-600 to-pink-500 text-white border-transparent"
              : "bg-neutral-100 text-neutral-500 border-neutral-200"
          )}>
            {platform && PLATFORM_ICON[platform]}
            {platform === "tiktok" ? "TikTok" : platform === "instagram" ? "IG Reels" : "TikTok / IG"}
          </span>
        </div>

        {/* Tags row — deadline urgency + views label */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[9px] font-bold border",
            days < 0
              ? "bg-red-50 text-red-600 border-red-200/50"
              : days <= 3 && !hasSubmitted
              ? "bg-amber-50 text-amber-700 border-amber-200/50"
              : "bg-neutral-50 text-neutral-500 border-neutral-200/50"
          )}>
            ⏱ {deadlineText}
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-violet-50 text-violet-600 border border-violet-200/50">
            {(isValid || isPending ? "Audit" : "Target")} {auditedViews.toLocaleString("id-ID")} views
          </span>
        </div>

        {/* Earnings row */}
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/30 rounded-[10px] px-3 py-2">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{earningLabel}</span>
          <span className={cn("text-[11px] font-black", isValid ? "text-emerald-700" : "text-kreator-600")}>
            {formatCurrency(earningVal)}
          </span>
        </div>

        {/* Submitted URL — compact single line */}
        {work.contentUrl && (
          <div className="flex items-center justify-between gap-2 text-[10px]">
            <span className="text-neutral-400 font-bold uppercase tracking-wider shrink-0">Bukti</span>
            <a
              href={work.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-kreator-600 truncate hover:underline"
            >
              {work.contentUrl}
            </a>
          </div>
        )}

        {/* Fraud warning — compact */}
        {isFraud && work.rejectedReason && (
          <div className="bg-red-50 border border-red-200/60 rounded-[10px] px-2.5 py-2 text-[10px] font-bold text-red-800 leading-snug flex items-start gap-1.5">
            <TriangleAlert className="w-3 h-3 text-red-500 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{work.rejectedReason}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/dashboard/kreator/pekerjaan-aktif/${work.id}`}
            className="flex-1 text-center py-2.5 rounded-[12px] text-[10px] font-extrabold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
          >
            Detail
          </Link>

          {!hasSubmitted ? (
            <Link
              href={`/dashboard/kreator/pekerjaan-aktif/${work.id}`}
              className="flex-[2] text-center py-2.5 rounded-[12px] text-[10px] font-extrabold text-white hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              style={{
                background: CREATOR_ACTION_GRADIENT,
                boxShadow: "var(--shadow-kreator)",
              }}
            >
              Submit Bukti
            </Link>
          ) : (
            <div className="flex-[2] flex items-center justify-center bg-neutral-50 border border-neutral-200/50 text-[10px] font-extrabold text-neutral-400 rounded-[12px] py-2.5 tracking-wider select-none">
              Sudah Dikirim
            </div>
          )}
        </div>

        {/*
          Batalkan hanya selama belum ada bukti terkirim. Sengaja beremphasis
          rendah (teks, bukan tombol penuh) — aksi merusak yang jarang dipakai
          tidak boleh menyaingi "Submit Bukti" secara visual.
        */}
        {canUnclaim && (
          <button
            onClick={onUnclaim}
            className="text-[10px] font-bold text-neutral-400 hover:text-red-600 transition-colors self-center underline underline-offset-2 cursor-pointer"
          >
            Batalkan pekerjaan ini
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PekerjaanAktifView({ initialWorks }: PekerjaanAktifViewProps) {
  const [works, setWorks] = useState<CreatorActiveWork[]>(initialWorks);
  const [unclaimTarget, setUnclaimTarget] = useState<CreatorActiveWork | null>(null);
  const { toolbarRef, isSticky } = useStickyToolbar();

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDeadline, setSelectedDeadline] = useState("all");
  const [sortBy, setSortBy] = useState("nearest-deadline");
  const [filterOpen, setFilterOpen] = useState(false);



  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedDeadline("all");
    setSortBy("nearest-deadline");
  };

  /**
   * Batalkan claim. Baris claim dihapus di backend, jadi ikut dibuang dari
   * daftar. Lempar ulang saat gagal supaya ConfirmDialog tetap terbuka
   * dengan pesan errornya.
   */
  const handleUnclaimConfirm = async () => {
    if (!unclaimTarget) return;
    const target = unclaimTarget;
    const res = await unclaimCampaign(target.id);
    if (!res.success) {
      toast.error(res.error ?? "Gagal membatalkan pekerjaan.");
      throw new Error(res.error ?? "Gagal membatalkan pekerjaan.");
    }
    setWorks((prev) => prev.filter((w) => w.id !== target.id));
    toast.success(`Pekerjaan "${target.title}" dibatalkan. Slot campaign kembali terbuka.`);
  };

  const getSubStatusLabel = (work: CreatorActiveWork): string => {
    // Klaim kedaluwarsa lebih dulu: submission tidak akan pernah ada, dan tanpa
    // cabang ini kreator melihat "Belum Submit" untuk klaim yang sudah hangus.
    if (work.status === "expired") return getClaimStatusLabel("expired");
    if (work.fraudStatus && work.fraudStatus !== "safe") return getFraudStatusLabel(work.fraudStatus);
    if (work.submissionStatus) return getSubmissionStatusLabel(work.submissionStatus);
    if (work.status === "approved") return "Selesai";
    return "Belum Submit";
  };

  const countBelumSubmit  = works.filter(w => !w.submissionStatus && w.status === "claimed").length;
  const countPending      = works.filter(w => w.submissionStatus === "pending").length;
  const countValid        = works.filter(w => w.submissionStatus === "approved" || w.status === "approved").length;
  const countReviewFraud  = works.filter(
    w => w.submissionStatus === "rejected" || (w.fraudStatus != null && w.fraudStatus !== "safe")
  ).length;

  const getDaysRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { text: "Melewati batas", days: diffDays };
    if (diffDays === 0) return { text: "Hari ini", days: 0 };
    return { text: `${diffDays} hari lagi`, days: diffDays };
  };

  const filteredWorks = works
    .filter((w) => {
      const matchesSearch =
        w.title.toLowerCase().includes(search.toLowerCase()) ||
        w.brandName.toLowerCase().includes(search.toLowerCase()) ||
        w.brief.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "belum-submit" && !w.submissionStatus && w.status === "claimed") ||
        (selectedStatus === "pending" && w.submissionStatus === "pending") ||
        (selectedStatus === "valid" && (w.submissionStatus === "approved" || w.status === "approved")) ||
        (selectedStatus === "review-fraud" &&
          (w.submissionStatus === "rejected" || (w.fraudStatus != null && w.fraudStatus !== "safe")));

      const { days } = getDaysRemaining(w.deadline);
      const matchesDeadline =
        selectedDeadline === "all" ||
        (selectedDeadline === "soon" && days >= 0 && days <= 5) ||
        (selectedDeadline === "later" && days > 5);

      return matchesSearch && matchesStatus && matchesDeadline;
    })
    .sort((a, b) => {
      if (sortBy === "nearest-deadline") {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      }
      return new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime();
    });

  const hasActiveFilters = search !== "" || selectedStatus !== "all" || selectedDeadline !== "all";


  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 relative">

        <div>
          <CreatorPageHeader
            title="Pekerjaan Aktif"
            description="Pantau campaign yang sudah kamu klaim."
          />

          {/* Summary tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
            <MetricCard
              label="Belum Submit"
              value={countBelumSubmit}
              helper="Butuh posting bukti"
              tone="default"
              icon={<Clock />}
            />
            <MetricCard
              label="Menunggu Validasi"
              value={countPending}
              helper="Sedang diaudit"
              tone="info"
              icon={<PlayCircle />}
            />
            <MetricCard
              label="Valid"
              value={countValid}
              helper="Reward siap cair"
              tone="success"
              icon={<CheckCircle2 />}
            />
            <MetricCard
              label="Perlu Review / Fraud"
              value={countReviewFraud}
              helper="Ada kendala konten"
              tone="danger"
              icon={<AlertTriangle />}
            />
          </div>

          {/* Toolbar — sticky when scrolling */}
          <div ref={toolbarRef} className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ position: "sticky", top: 0, zIndex: 30 }}>
          <div
            className="flex flex-col gap-3"
            style={{
              padding: isSticky ? "10px 14px" : "12px 16px",
              borderRadius: isSticky ? 18 : 22,
              border: "1px solid rgba(17,24,39,.08)",
              background: isSticky ? "rgba(255,255,255,.92)" : "white",
              backdropFilter: isSticky ? "blur(24px)" : "none",
              WebkitBackdropFilter: isSticky ? "blur(24px)" : "none",
              boxShadow: isSticky ? "0 8px 30px rgba(15,23,42,.08), 0 1px 0 rgba(255,255,255,.8) inset" : "0 2px 12px rgba(15,23,42,.04)",
              transition: "all .28s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {/* Row 1: Search + mobile filter toggle */}
            <div className="flex gap-2.5 items-center">
              <div className="relative flex-1">
                <Search className="absolute inset-y-0 left-3.5 my-auto w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pekerjaan / brand..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all font-medium text-neutral-800 placeholder-neutral-400"
                />
              </div>
              {/* Mobile filter toggle — hidden on sm+ */}
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={cn(
                  "sm:hidden shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  filterOpen || hasActiveFilters
                    ? "bg-violet-50 text-violet-700 border-violet-200"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200/60"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
              </button>
            </div>

            {/* Row 2: All filter selects — always on sm+, collapsible on mobile */}
            <div className={cn("items-center gap-3 flex-wrap", filterOpen ? "flex" : "hidden sm:flex")}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:block" />

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[150px]"
              >
                <option value="all">Semua Status</option>
                <option value="belum-submit">Belum Submit</option>
                <option value="pending">Menunggu Validasi</option>
                <option value="valid">Valid / Selesai</option>
                <option value="review-fraud">Review / Fraud</option>
              </select>

              <select
                value={selectedDeadline}
                onChange={(e) => setSelectedDeadline(e.target.value)}
                className="px-3.5 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[150px]"
              >
                <option value="all">Semua Batas Waktu</option>
                <option value="soon">Segera (≤ 5 hari)</option>
                <option value="later">Masih Lama (&gt; 5 hari)</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2 bg-neutral-50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[170px]"
              >
                <option value="nearest-deadline">Deadline Terdekat</option>
                <option value="latest-claimed">Baru Diklaim</option>
              </select>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="ml-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer border border-neutral-200/60"
                >
                  <X className="w-3.5 h-3.5" />
                  Reset Filter
                </button>
              )}
            </div>
          </div>
          </div>

          {/* Grid */}
          {filteredWorks.length === 0 ? (
            <DashboardStateCard
              kind="empty"
              title={hasActiveFilters ? "Tidak ada yang cocok" : "Belum ada pekerjaan aktif"}
              description={
                hasActiveFilters
                  ? "Tidak ada pekerjaan aktif yang cocok dengan filter pencarianmu."
                  : "Kamu belum mengklaim campaign apa pun dari pool pekerjaan."
              }
              actionLabel={hasActiveFilters ? "Reset Filter" : "Cari Job di Job Pool"}
              onAction={
                hasActiveFilters
                  ? handleClearFilters
                  : () => { window.location.href = "/dashboard/kreator/job-pool"; }
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredWorks.map((work) => (
                <ActiveJobCard
                  key={work.id}
                  work={work}
                  getSubStatusLabel={getSubStatusLabel}
                  getDaysRemaining={getDaysRemaining}
                  onUnclaim={() => setUnclaimTarget(work)}
                />
              ))}
            </div>
          )}
        </div>

        {unclaimTarget && (
          <ConfirmDialog
            open={!!unclaimTarget}
            onClose={() => setUnclaimTarget(null)}
            title="Batalkan Pekerjaan Ini?"
            description={
              <>
                Klaim kamu atas{" "}
                <span className="font-semibold text-text-primary">
                  &quot;{unclaimTarget.title}&quot;
                </span>{" "}
                akan dilepas dan slotnya kembali terbuka untuk kreator lain.
              </>
            }
            note="Kamu masih bisa mengambil campaign ini lagi selama slotnya belum penuh. Progres dan catatan pada pekerjaan ini tidak disimpan."
            confirmLabel="Batalkan Pekerjaan"
            tone="warning"
            onConfirm={handleUnclaimConfirm}
          />
        )}
    </div>
  );
}
