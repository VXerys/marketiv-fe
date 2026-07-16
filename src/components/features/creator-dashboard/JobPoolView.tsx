"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
import { toast } from "sonner";
import {
  Briefcase,
  BadgeDollarSign,
  AlertTriangle,
  Clock,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import { CreatorJob } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { CreatorCardSkeleton, CreatorMetricSkeleton } from "./CreatorSkeleton";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const NICHE_GRADIENTS: Record<string, [string, string]> = {
  kuliner:    ["#f59e0b", "#ef4444"],
  fesyen:     ["#ec4899", "#8b5cf6"],
  pariwisata: ["#14b8a6", "#3b82f6"],
  edukasi:    ["#3b82f6", "#1d4ed8"],
  kecantikan: ["#f472b6", "#d946ef"],
  lainnya:    ["#7c3aed", "#4f46e5"],
};

const NICHE_LABELS: Record<string, string> = {
  kuliner:    "Kuliner",
  fesyen:     "Fashion",
  pariwisata: "Travel",
  edukasi:    "Edukasi",
  kecantikan: "Beauty",
  lainnya:    "Lainnya",
};

// ─── MetricTile ──────────────────────────────────────────────────────────────

interface MetricTileProps {
  label: string;
  value: string | number;
  helper?: string;
  icon: React.ReactNode;
  iconClass: string;
  highlight?: boolean;
}

function MetricTile({ label, value, helper, icon, iconClass, highlight }: MetricTileProps) {
  return (
    <div
      className={cn(
        "group relative p-4 sm:p-5 rounded-[22px] border bg-white/70 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_36px_rgba(37,99,235,.06)] hover:border-blue-400/30 select-none cursor-default",
        highlight
          ? "border-blue-200/50 shadow-[0_10px_30px_-10px_rgba(37,99,235,0.15)] bg-gradient-to-br from-blue-50/20 to-white/95"
          : "border-neutral-200/60 shadow-[0_2px_12px_rgba(15,23,42,.03)]"
      )}
    >
      {highlight && (
        <div className="absolute top-3.5 right-3.5">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200/30 text-[8px] font-extrabold text-blue-600 uppercase tracking-wider">
            Utama
          </span>
        </div>
      )}
      <div className={cn("h-9 w-9 rounded-[12px] flex items-center justify-center mb-3.5 border transition-transform duration-300 group-hover:scale-105", iconClass)}>
        {icon}
      </div>
      <div className="text-[.67rem] font-extrabold text-neutral-400 uppercase tracking-widest leading-none">{label}</div>
      <div className="font-display text-[1.3rem] sm:text-[1.4rem] font-black text-[#1e1b4b] tracking-tight leading-none mt-1.5 break-all">{value}</div>
      {helper && (
        <div className="text-[.7rem] text-neutral-400 font-semibold mt-1 leading-none">{helper}</div>
      )}
    </div>
  );
}

// ─── CampaignCard ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  job: CreatorJob;
  onClaim: (job: CreatorJob) => void;
}

function CampaignCard({ job, onClaim }: CampaignCardProps) {
  const isFull       = job.usedQuota >= job.quota;
  const isNearLimit  = job.quota - job.usedQuota <= 1 && !isFull;
  const isHighReward = job.ratePerThousandViews >= 6000;
  const slotUsedPct  = Math.min(100, Math.round((job.usedQuota / job.quota) * 100));
  const slotsLeft    = Math.max(0, job.quota - job.usedQuota);
  const [g1, g2]    = NICHE_GRADIENTS[job.niche] ?? NICHE_GRADIENTS.lainnya;
  const nicheLabel   = NICHE_LABELS[job.niche]   ?? "Lainnya";

  return (
    <div className="group bg-white rounded-[20px] border border-neutral-200/50 overflow-hidden shadow-[0_2px_16px_rgba(15,23,42,.05)] hover:shadow-[0_16px_48px_rgba(109,40,217,.13)] hover:-translate-y-1.5 hover:border-violet-400/20 transition-all duration-300 flex flex-col">

      {/* Cover image — 4:3 aspect ratio */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {job.thumbnailUrl ? (
          <Image
            src={job.thumbnailUrl}
            alt={job.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${g1}, ${g2})` }}
          >
            <span className="text-white/20 font-black text-7xl leading-none select-none">
              {job.brandName?.charAt(0) ?? "C"}
            </span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 52%)" }}
        />

        {/* Brand + PPV row (bottom overlay) */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-7 w-7 rounded-lg border border-white/20 overflow-hidden shrink-0 relative bg-white/10">
              {job.brandAvatar && (
                <Image src={job.brandAvatar} alt={job.brandName} fill className="object-cover" sizes="28px" />
              )}
            </div>
            <span className="text-white text-xs font-bold drop-shadow-sm truncate">{job.brandName}</span>
          </div>
          <span
            className="shrink-0 ml-2 px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider text-white border border-white/20"
            style={{ background: "rgba(255,255,255,.15)", backdropFilter: "blur(4px)" }}
          >
            PPV
          </span>
        </div>

        {/* Status chip (top-left) */}
        {(isNearLimit || isHighReward || isFull) && (
          <div className="absolute top-2.5 left-2.5">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border",
                isFull
                  ? "bg-neutral-800/90 text-neutral-300 border-neutral-600/30"
                  : isNearLimit
                    ? "bg-amber-50/90 text-amber-700 border-amber-300/40"
                    : "bg-violet-600/90 text-white border-violet-400/30"
              )}
              style={{ backdropFilter: "blur(4px)" }}
            >
              {isFull ? "Kuota Penuh" : isNearLimit ? "Hampir Penuh" : "Reward Tinggi"}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h4 className="text-sm font-extrabold text-[#1e1b4b] leading-snug line-clamp-2">{job.title}</h4>

        {/* Rate display */}
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[1.1rem] font-black text-[#7c3aed] tracking-tight leading-none">
            {formatCurrency(job.ratePerThousandViews)}
          </span>
          <span className="text-[10px] text-neutral-400 font-semibold">/ 1K views</span>
        </div>

        {/* Tags row */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[9px] font-bold border border-violet-200/50 uppercase tracking-wide">
            {nicheLabel}
          </span>
          {job.externalAssetUrl && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold border border-emerald-200/50 uppercase tracking-wide">
              Aset Tersedia
            </span>
          )}
          <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 ml-auto shrink-0">
            <Users className="w-3 h-3" />
            {slotsLeft} slot
          </span>
        </div>

        {/* Quota progress bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold text-neutral-400 uppercase tracking-wider">
            <span>Kuota Kreator</span>
            <span>{job.usedQuota} / {job.quota} Klaim</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${slotUsedPct}%`,
                background: isFull
                  ? "#94a3b8"
                  : "linear-gradient(90deg, #7c3aed, #4f46e5)",
              }}
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href={`/dashboard/kreator/job-pool/${job.id}`}
            className="flex-1 text-center py-2.5 rounded-[12px] text-[10px] font-extrabold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
          >
            Detail
          </Link>
          <button
            onClick={() => !isFull && onClaim(job)}
            disabled={isFull}
            className={cn(
              "flex-[2] py-2.5 rounded-[12px] text-[10px] font-extrabold transition-all duration-200",
              isFull
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : "text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            )}
            style={isFull ? undefined : {
              background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
              boxShadow: "0 4px 14px rgba(124,58,237,.30)",
            }}
          >
            {isFull ? "Kuota Penuh" : "Klaim Job"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface JobPoolViewProps {
  initialJobs: CreatorJob[];
}

export function JobPoolView({ initialJobs }: JobPoolViewProps) {
  const [jobs, setJobs] = useState<CreatorJob[]>(initialJobs);
  const { toolbarRef, isSticky } = useStickyToolbar();

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // Slicing State Simulators (for QA / User review)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);
  const [isEmptySimulated, setIsEmptySimulated] = useState(false);

  // Modal states
  const [claimingJob, setClaimingJob] = useState<CreatorJob | null>(null);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isRulesChecked, setIsRulesChecked] = useState({
    brief: false,
    privacy: false,
    retention: false,
    views: false,
  });

  const showToast = (msg: string) => toast.success(msg);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedNiche("all");
    setSortBy("latest");
    setFilterAvailableOnly(false);
  };

  const openClaimModal = (job: CreatorJob) => {
    setClaimingJob(job);
    setIsRulesChecked({ brief: false, privacy: false, retention: false, views: false });
  };

  const executeClaim = () => {
    if (!claimingJob) return;
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === claimingJob.id ? { ...job, usedQuota: job.usedQuota + 1 } : job
      )
    );
    setClaimingJob(null);
    setIsSuccessOpen(true);
  };

  // Summary metric calculations
  const totalJobsAvailable = jobs.filter(j => j.usedQuota < j.quota).length;
  const highestReward      = jobs.reduce((max, j) => j.ratePerThousandViews > max ? j.ratePerThousandViews : max, 0);
  const almostFullCount    = jobs.filter(j => j.usedQuota >= j.quota - 1 && j.usedQuota < j.quota).length;
  const newTodayCount      = jobs.filter(j => {
    const d = new Date(j.createdAt), t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
  }).length || 1;

  // Filter + sort
  const filteredJobs = jobs
    .filter(job => {
      const matchSearch  = job.title.toLowerCase().includes(search.toLowerCase()) || job.brandName.toLowerCase().includes(search.toLowerCase()) || job.brief.toLowerCase().includes(search.toLowerCase());
      const matchNiche   = selectedNiche === "all" || job.niche === selectedNiche;
      const matchAvail   = !filterAvailableOnly || job.usedQuota < job.quota;
      return matchSearch && matchNiche && matchAvail;
    })
    .sort((a, b) => {
      if (sortBy === "highest-rate") return b.ratePerThousandViews - a.ratePerThousandViews;
      if (sortBy === "lowest-rate")  return a.ratePerThousandViews - b.ratePerThousandViews;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const sortOptions = [
    { label: "Terbaru",         value: "latest" },
    { label: "Reward Tertinggi", value: "highest-rate" },
    { label: "Reward Terendah",  value: "lowest-rate" },
  ];

  const hasActiveFilters = search !== "" || selectedNiche !== "all" || filterAvailableOnly;
  const allRulesChecked  = isRulesChecked.brief && isRulesChecked.privacy && isRulesChecked.retention && isRulesChecked.views;

  // ── Error state ────────────────────────────────────────────────────────────
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
        <CreatorErrorState
          errorMsg="Simulator error diaktifkan untuk memenuhi persyaratan Slicing DoD."
          onRetry={() => { setIsErrorSimulated(false); showToast("Berhasil memulihkan dari state error!"); }}
        />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 relative">

      {isLoadingSimulated ? (
        <div>
          <CreatorMetricSkeleton />
          <div className="h-14 bg-white border border-neutral-200/50 rounded-xl animate-pulse w-full mb-6" />
          <CreatorCardSkeleton count={3} />
        </div>
      ) : (
        <div>
          {/* Header */}
          <CreatorPageHeader
            title="Job Pool Kampanye"
            description="Pilih campaign UMKM yang cocok dengan niche kamu."
          />

          {/* Summary Metric Tiles — 2/3/4 grid per Dashboard Rule */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 mb-7">
            <MetricTile
              label="Job Tersedia"
              value={totalJobsAvailable}
              helper="Klaim instan"
              iconClass="text-violet-600 bg-violet-50 border-violet-200/50"
              icon={<Briefcase className="w-4 h-4" />}
            />
            <MetricTile
              label="Reward Tertinggi"
              value={formatCurrency(highestReward)}
              helper="Per 1k tayangan"
              iconClass="text-amber-600 bg-amber-50 border-amber-200/50"
              icon={<BadgeDollarSign className="w-4 h-4" />}
              highlight
            />
            <MetricTile
              label="Hampir Penuh"
              value={almostFullCount}
              helper="Tinggal 1 kuota lagi"
              iconClass="text-amber-500 bg-amber-50 border-amber-200/50"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <MetricTile
              label="Job Baru Hari Ini"
              value={newTodayCount}
              helper="Kampanye terbaru"
              iconClass="text-indigo-600 bg-indigo-50 border-indigo-200/50"
              icon={<Clock className="w-4 h-4" />}
            />
          </div>

          {/* Filter Toolbar — sticky when scrolling */}
          <div ref={toolbarRef} className="mb-6 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8" style={{ position: "sticky", top: 0, zIndex: 30 }}>
          <div
            className="flex flex-col gap-3"
            style={{
              padding: isSticky ? "10px 14px" : "16px",
              borderRadius: isSticky ? 18 : 16,
              border: "1px solid rgba(17,24,39,.08)",
              background: isSticky ? "rgba(255,255,255,.92)" : "rgba(255,255,255,.8)",
              backdropFilter: isSticky ? "blur(24px)" : "none",
              WebkitBackdropFilter: isSticky ? "blur(24px)" : "none",
              boxShadow: isSticky ? "0 8px 30px rgba(15,23,42,.08), 0 1px 0 rgba(255,255,255,.8) inset" : "0 2px 8px rgba(15,23,42,.04)",
              transition: "all .28s cubic-bezier(.2,.8,.2,1)",
            }}
          >
            {/* Row 1: Search + mobile filter toggle */}
            <div className="flex gap-2.5 items-center">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari kampanye / brand..."
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium text-neutral-800 placeholder-neutral-400"
                />
              </div>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setFilterOpen((o) => !o)}
                className={cn(
                  "sm:hidden shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                  filterOpen || hasActiveFilters
                    ? "bg-violet-50 text-violet-700 border-violet-200"
                    : "bg-neutral-50/50 text-neutral-700 border-neutral-200/60"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />}
              </button>
            </div>

            {/* Row 2: All filters — always on sm+, collapsible on mobile */}
            <div className={cn("items-center gap-2.5 flex-wrap", filterOpen ? "flex" : "hidden sm:flex")}>
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-400 shrink-0 hidden sm:block" />

              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[140px]"
              >
                <option value="all">Semua Kategori</option>
                <option value="kecantikan">Kecantikan</option>
                <option value="kuliner">Kuliner</option>
                <option value="fesyen">Fesyen</option>
                <option value="pariwisata">Pariwisata</option>
                <option value="edukasi">Edukasi</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[160px]"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              <button
                onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
                className={cn(
                  "px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
                  filterAvailableOnly
                    ? "bg-primary text-white border-primary-600 shadow-sm"
                    : "bg-neutral-50/50 text-neutral-700 border-neutral-200/60 hover:bg-neutral-100"
                )}
              >
                Kuota Tersedia
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 cursor-pointer transition-colors whitespace-nowrap ml-auto border border-neutral-200/60 rounded-xl hover:bg-neutral-50"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </div>
          </div>

          {/* Grid Content */}
          {isEmptySimulated || filteredJobs.length === 0 ? (
            <CreatorEmptyState
              title={isEmptySimulated ? "Job pool kosong" : "Job tidak ditemukan"}
              description={
                isEmptySimulated
                  ? "UMKM belum menerbitkan kampanye baru di pool. Silakan tunggu beberapa saat lagi."
                  : "Coba ganti kata kunci pencarian atau bersihkan filter di atas."
              }
              actionButton={
                !isEmptySimulated && hasActiveFilters ? (
                  <button
                    onClick={handleClearFilters}
                    className="bg-primary hover:bg-primary-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-all shadow border border-primary-600/10 cursor-pointer"
                  >
                    Reset Filter
                  </button>
                ) : null
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredJobs.map((job) => (
                <CampaignCard key={job.id} job={job} onClaim={openClaimModal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Claim Checklist Modal ──────────────────────────────────────────── */}
      {claimingJob && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-neutral-900 leading-none">
                  Klaim Campaign
                </h3>
                <p className="text-xs text-neutral-400 font-bold mt-1.5 uppercase tracking-wide">
                  {claimingJob.title}
                </p>
              </div>
              <button
                onClick={() => setClaimingJob(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 text-xs font-semibold text-neutral-700">
              <p className="text-neutral-500 leading-relaxed font-medium">
                Sebelum mengklaim pekerjaan kampanye ini, Anda wajib menyetujui seluruh ketentuan pengerjaan Campaign Mode berikut:
              </p>

              <div className="space-y-3 pt-2">
                {[
                  { key: "brief" as const, text: "Saya menyetujui pengerjaan video sesuai panduan dan larangan pada brief produk." },
                  { key: "privacy" as const, text: "Saya akan memposting video di akun sosial media pribadi saya dan menyertakan link tayangnya sebagai bukti posting." },
                  { key: "retention" as const, text: "Saya tidak akan menghapus postingan video setidaknya selama 30 hari setelah masa tayang." },
                  { key: "views" as const, text: "Saya menyetujui bahwa pembayaran dihitung berdasarkan views tervalidasi yang di-audit sistem admin." },
                ].map(({ key, text }) => (
                  <label key={key} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRulesChecked[key]}
                      onChange={(e) => setIsRulesChecked({ ...isRulesChecked, [key]: e.target.checked })}
                      className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer shrink-0"
                    />
                    <span className="leading-relaxed">{text}</span>
                  </label>
                ))}
              </div>

              <div className="pt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setClaimingJob(null)}
                  className="flex-1 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={executeClaim}
                  disabled={!allRulesChecked}
                  className={cn(
                    "flex-1 py-3 font-bold text-xs rounded-full border transition-all cursor-pointer",
                    !allRulesChecked
                      ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none"
                      : "text-white border-transparent hover:-translate-y-0.5 active:translate-y-0 shadow-md"
                  )}
                  style={allRulesChecked ? {
                    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                    boxShadow: "0 4px 14px rgba(124,58,237,.30)",
                  } : undefined}
                >
                  Klaim Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Modal ─────────────────────────────────────────────────── */}
      {isSuccessOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mx-auto mb-5 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-black text-neutral-900 mb-2 leading-none">Campaign Berhasil Diklaim</h3>
            <p className="text-xs text-neutral-500 font-medium leading-relaxed max-w-xs mx-auto mb-6">
              Pekerjaan telah ditambahkan ke dashboard pengerjaan Anda. Silakan selesaikan konten video sebelum tanggal tenggat waktu.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsSuccessOpen(false)}
                className="flex-1 py-3 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer"
              >
                Cari Job Lain
              </button>
              <Link
                href="/dashboard/kreator/pekerjaan-aktif"
                className="flex-1 py-3 text-center text-white font-bold text-xs rounded-full border border-transparent transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 4px 14px rgba(124,58,237,.25)",
                }}
              >
                Lihat Pekerjaan Aktif
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
