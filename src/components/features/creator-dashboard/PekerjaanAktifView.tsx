"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CreatorActiveWork } from "@/types/creator-dashboard";
import { toast } from "sonner";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { DashboardStateCard } from "@/components/features/dashboard/shared";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
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

const getThumbnailUrl = (campaignId: string): string => {
  if (campaignId === "campaign_006") return "https://images.unsplash.com/photo-1558171813-4c088753af8f?w=400&h=300&fit=crop";
  if (campaignId === "campaign_007") return "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=300&fit=crop";
  if (campaignId === "campaign_008") return "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=300&fit=crop";
  return "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=300&fit=crop";
};

// ─── MetricTile ──────────────────────────────────────────────────────────────

interface MetricTileProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  iconBg: string;
  accent?: "default" | "blue" | "green" | "red" | "amber";
}

const ACCENT_STYLES: Record<string, { card: string; badge: string }> = {
  default: {
    card: "border-neutral-200/60 shadow-[0_2px_12px_rgba(15,23,42,.03)]",
    badge: "",
  },
  blue: {
    card: "border-blue-200/40 shadow-[0_4px_20px_rgba(37,99,235,.06)] bg-gradient-to-br from-blue-50/30 to-white",
    badge: "bg-blue-50 border-blue-200/30 text-blue-600",
  },
  green: {
    card: "border-emerald-200/40 shadow-[0_4px_20px_rgba(22,163,74,.06)] bg-gradient-to-br from-emerald-50/30 to-white",
    badge: "bg-emerald-50 border-emerald-200/30 text-emerald-600",
  },
  red: {
    card: "border-red-200/40 shadow-[0_4px_20px_rgba(220,38,38,.06)] bg-gradient-to-br from-red-50/30 to-white",
    badge: "bg-red-50 border-red-200/30 text-red-600",
  },
  amber: {
    card: "border-amber-200/40 shadow-[0_4px_20px_rgba(217,119,6,.06)] bg-gradient-to-br from-amber-50/30 to-white",
    badge: "bg-amber-50 border-amber-200/30 text-amber-600",
  },
};

function MetricTile({ label, value, helper, icon, iconBg, accent = "default" }: MetricTileProps) {
  const styles = ACCENT_STYLES[accent];
  return (
    <div
      className={cn(
        "group relative p-4 sm:p-5 rounded-[22px] border bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(15,23,42,.08)] select-none cursor-default",
        styles.card
      )}
    >
      <div className={cn("h-9 w-9 rounded-[12px] flex items-center justify-center mb-3.5 border transition-transform duration-300 group-hover:scale-105", iconBg)}>
        {icon}
      </div>
      <div className="text-[.67rem] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">{label}</div>
      <div className="font-display text-[1.3rem] sm:text-[1.4rem] font-black text-[#1e1b4b] tracking-tight leading-none mt-1.5">{value}</div>
      {helper && (
        <div className="text-[.7rem] text-neutral-400 font-semibold mt-1 leading-none">{helper}</div>
      )}
    </div>
  );
}

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

function ActiveJobCard({
  work,
  getSubStatusLabel,
  getDaysRemaining,
}: {
  work: CreatorActiveWork;
  getSubStatusLabel: (w: CreatorActiveWork) => string;
  getDaysRemaining: (d: string) => { text: string; days: number };
}) {
  const subStatus    = getSubStatusLabel(work);
  const hasSubmitted = !!work.contentUrl;
  const { text: deadlineText, days } = getDaysRemaining(work.deadline);
  const thumbnailUrl = getThumbnailUrl(work.campaignId);
  const isFraud  = ["Fraud", "Dispute", "Rejected"].includes(subStatus);
  const isValid  = subStatus === "Valid" || subStatus === "Selesai";
  const isPending = subStatus === "Menunggu Validasi";

  // Earnings data
  const mockViews    = work.actualViews ?? (hasSubmitted ? 12500 : 50000);
  const earningVal   = isValid
    ? (work.earnings ?? 0)
    : (work.ratePerThousandViews * mockViews) / 1000;
  const earningLabel = isValid ? "Pendapatan Dirilis" : "Estimasi Reward";

  // Claimed date
  const claimedDate = new Date(work.claimedAt).toLocaleDateString("id-ID", {
    day: "numeric", month: "short",
  });

  const platform = work.platform;

  const STATUS_CHIP: Record<string, string> = {
    "Belum Submit":      "bg-blue-600/90 text-white border-blue-400/30",
    "Menunggu Validasi": "bg-amber-500/90 text-white border-amber-300/30",
    "Valid":             "bg-emerald-600/90 text-white border-emerald-400/30",
    "Selesai":           "bg-emerald-600/90 text-white border-emerald-400/30",
    "Fraud":             "bg-red-600/90 text-white border-red-400/30",
    "Dispute":           "bg-red-600/90 text-white border-red-400/30",
    "Rejected":          "bg-red-600/90 text-white border-red-400/30",
  };

  return (
    <div
      className={cn(
        "group bg-white rounded-[22px] border overflow-hidden transition-all duration-300 flex flex-col animate-in fade-in",
        isFraud
          ? "border-red-200/60 shadow-[0_4px_20px_rgba(220,38,38,.07)] hover:shadow-[0_16px_48px_rgba(220,38,38,.12)] hover:-translate-y-1.5 hover:border-red-300/40"
          : isValid
          ? "border-emerald-200/50 shadow-[0_4px_20px_rgba(22,163,74,.07)] hover:shadow-[0_16px_48px_rgba(22,163,74,.12)] hover:-translate-y-1.5 hover:border-emerald-300/40"
          : "border-neutral-200/50 shadow-[0_2px_16px_rgba(15,23,42,.05)] hover:shadow-[0_16px_48px_rgba(109,40,217,.12)] hover:-translate-y-1.5 hover:border-violet-400/20"
      )}
    >
      {/* Cover image — same 4:3 as Job Pool */}
      <div className="relative w-full overflow-hidden shrink-0" style={{ aspectRatio: "4/3" }}>
        <Image
          src={thumbnailUrl}
          alt={work.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
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
        <h4 className="text-sm font-extrabold text-[#1e1b4b] leading-snug line-clamp-2">{work.title}</h4>

        {/* CPM Rate row */}
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[1.1rem] font-black text-[#7c3aed] tracking-tight leading-none">
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
            {(isValid || isPending ? "Audit" : "Target")} {mockViews.toLocaleString("id-ID")} views
          </span>
        </div>

        {/* Earnings row */}
        <div className="flex items-center justify-between bg-neutral-50 border border-neutral-200/30 rounded-[10px] px-3 py-2">
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{earningLabel}</span>
          <span className={cn("text-[11px] font-black", isValid ? "text-emerald-700" : "text-[#7c3aed]")}>
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
              className="font-bold text-[#7c3aed] truncate hover:underline"
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
                background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: "0 4px 14px rgba(124,58,237,.30)",
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
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PekerjaanAktifView({ initialWorks }: PekerjaanAktifViewProps) {
  const [works] = useState<CreatorActiveWork[]>(initialWorks);

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDeadline, setSelectedDeadline] = useState("all");
  const [sortBy, setSortBy] = useState("nearest-deadline");

  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);
  const [isEmptySimulated, setIsEmptySimulated] = useState(false);

  const showToast = (msg: string) => toast.success(msg);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedDeadline("all");
    setSortBy("nearest-deadline");
  };

  const getSubStatusLabel = (work: CreatorActiveWork): string => {
    if (work.submissionStatus) {
      if (work.submissionStatus === "Pending") return "Menunggu Validasi";
      if (work.submissionStatus === "Valid") return "Valid";
      if (work.submissionStatus === "Fraud") return "Fraud";
      if (work.submissionStatus === "Dispute") return "Dispute";
      if (work.submissionStatus === "Rejected") return "Rejected";
    }
    if (work.status === "Selesai") return "Selesai";
    return "Belum Submit";
  };

  const countBelumSubmit  = works.filter(w => !w.submissionStatus && w.status === "Aktif").length;
  const countPending      = works.filter(w => w.submissionStatus === "Pending").length;
  const countValid        = works.filter(w => w.submissionStatus === "Valid" || w.status === "Selesai").length;
  const countReviewFraud  = works.filter(w => ["Fraud", "Dispute", "Rejected"].includes(w.submissionStatus ?? "")).length;

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

      const subStatus = getSubStatusLabel(w);
      const matchesStatus =
        selectedStatus === "all" ||
        (selectedStatus === "belum-submit" && subStatus === "Belum Submit") ||
        (selectedStatus === "pending" && subStatus === "Menunggu Validasi") ||
        (selectedStatus === "valid" && (subStatus === "Valid" || subStatus === "Selesai")) ||
        (selectedStatus === "review-fraud" && ["Fraud", "Dispute", "Rejected"].includes(subStatus));

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

  if (isErrorSimulated) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4.5 mb-8 max-w-md w-full flex items-center justify-between shadow-sm text-xs font-semibold text-red-800">
          <span>Mode Uji Coba Error Aktif.</span>
          <button
            onClick={() => setIsErrorSimulated(false)}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all cursor-pointer font-bold"
          >
            Matikan Mode Error
          </button>
        </div>
        <DashboardStateCard
          kind="error"
          title="Terjadi Kesalahan"
          description="Simulator error diaktifkan pada Halaman Pekerjaan Aktif."
          actionLabel="Coba Lagi"
          onAction={() => {
            setIsErrorSimulated(false);
            showToast("Berhasil memulihkan dari state error!");
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">

      {isLoadingSimulated ? (
        <div className="space-y-6 animate-pulse">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-neutral-100 rounded-[22px]" />)}
          </div>
          <div className="h-14 bg-neutral-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-72 bg-neutral-100 rounded-[22px]" />)}
          </div>
        </div>
      ) : (
        <div>
          <CreatorPageHeader
            title="Pekerjaan Aktif"
            description="Pantau campaign yang sudah kamu klaim."
          />

          {/* Summary tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7">
            <MetricTile
              label="Belum Submit"
              value={countBelumSubmit}
              helper="Butuh posting bukti"
              accent="default"
              iconBg="bg-neutral-50 border-neutral-200/60"
              icon={<Clock className="w-4.5 h-4.5 text-neutral-500" />}
            />
            <MetricTile
              label="Menunggu Validasi"
              value={countPending}
              helper="Sedang diaudit"
              accent="blue"
              iconBg="bg-blue-50 border-blue-200/40"
              icon={<PlayCircle className="w-4.5 h-4.5 text-blue-500" />}
            />
            <MetricTile
              label="Valid"
              value={countValid}
              helper="Reward siap cair"
              accent="green"
              iconBg="bg-emerald-50 border-emerald-200/40"
              icon={<CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />}
            />
            <MetricTile
              label="Perlu Review / Fraud"
              value={countReviewFraud}
              helper="Ada kendala konten"
              accent="red"
              iconBg="bg-red-50 border-red-200/40"
              icon={<AlertTriangle className="w-4.5 h-4.5 text-red-500" />}
            />
          </div>

          {/* Toolbar */}
          <div className="bg-white border border-neutral-200/60 rounded-[22px] p-3 sm:p-4 mb-6 flex flex-col gap-3 shadow-[0_2px_12px_rgba(15,23,42,.04)]">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch">
              {/* Search */}
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

              {/* Status filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 min-w-[160px] transition-all"
              >
                <option value="all">Semua Status</option>
                <option value="belum-submit">Belum Submit</option>
                <option value="pending">Menunggu Validasi</option>
                <option value="valid">Valid / Selesai</option>
                <option value="review-fraud">Review / Fraud</option>
              </select>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0" />

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

          {/* Grid */}
          {isEmptySimulated || filteredWorks.length === 0 ? (
            <DashboardStateCard
              kind="empty"
              title="Belum ada pekerjaan aktif"
              description={
                isEmptySimulated
                  ? "Kamu belum mengklaim campaign apa pun dari pool pekerjaan."
                  : "Tidak ada pekerjaan aktif yang cocok dengan filter pencarianmu."
              }
              actionLabel={isEmptySimulated ? "Cari Job di Job Pool" : "Reset Filter"}
              onAction={
                isEmptySimulated
                  ? () => { window.location.href = "/dashboard/kreator/job-pool"; }
                  : handleClearFilters
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
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
