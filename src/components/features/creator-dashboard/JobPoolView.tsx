"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreatorJob } from "@/types/creator-dashboard";
import { CreatorPageHeader } from "./CreatorPageHeader";
import { CreatorMetricCard } from "./CreatorMetricCard";
import { CreatorEmptyState } from "./CreatorEmptyState";
import { CreatorErrorState } from "./CreatorErrorState";
import { CreatorCardSkeleton, CreatorMetricSkeleton } from "./CreatorSkeleton";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  DashboardBadge,
  DashboardButton,
  DashboardProgress,
  getDashboardCategoryTone,
  getDashboardStatusTone,
} from "@/components/features/dashboard/shared";

interface JobPoolViewProps {
  initialJobs: CreatorJob[];
}

export function JobPoolView({ initialJobs }: JobPoolViewProps) {
  const [jobs, setJobs] = useState<CreatorJob[]>(initialJobs);

  // Filter states
  const [search, setSearch] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [filterAvailableOnly, setFilterAvailableOnly] = useState(false);

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

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSelectedNiche("all");
    setSortBy("latest");
    setFilterAvailableOnly(false);
  };

  const openClaimModal = (job: CreatorJob) => {
    setClaimingJob(job);
    setIsRulesChecked({
      brief: false,
      privacy: false,
      retention: false,
      views: false,
    });
  };

  const executeClaim = () => {
    if (!claimingJob) return;

    // Simulate claiming the job locally
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === claimingJob.id
          ? { ...job, usedQuota: job.usedQuota + 1 }
          : job
      )
    );

    setClaimingJob(null);
    setIsSuccessOpen(true);
  };

  // Summary Metrics calculations
  const totalJobsAvailable = jobs.filter(j => j.usedQuota < j.quota).length;
  
  const highestReward = jobs.reduce((max, job) => 
    job.ratePerThousandViews > max ? job.ratePerThousandViews : max, 0
  );

  const almostFullCount = jobs.filter(job => 
    job.usedQuota >= job.quota - 1 && job.usedQuota < job.quota
  ).length;

  const newTodayCount = jobs.filter(job => {
    const createdDate = new Date(job.createdAt);
    const today = new Date();
    return createdDate.getDate() === today.getDate() && 
           createdDate.getMonth() === today.getMonth() &&
           createdDate.getFullYear() === today.getFullYear();
  }).length || 1; // Fallback default mock value

  // Filtering & Sorting
  const filteredJobs = jobs
    .filter((job) => {
      const matchesSearch =
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        job.brandName.toLowerCase().includes(search.toLowerCase()) ||
        job.brief.toLowerCase().includes(search.toLowerCase());

      const matchesNiche =
        selectedNiche === "all" || job.niche === selectedNiche;

      const matchesAvailable =
        !filterAvailableOnly || job.usedQuota < job.quota;

      return matchesSearch && matchesNiche && matchesAvailable;
    })
    .sort((a, b) => {
      if (sortBy === "highest-rate") {
        return b.ratePerThousandViews - a.ratePerThousandViews;
      }
      if (sortBy === "lowest-rate") {
        return a.ratePerThousandViews - b.ratePerThousandViews;
      }
      // default: newest
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const sortOptions = [
    { label: "Terbaru", value: "latest" },
    { label: "Reward Tertinggi", value: "highest-rate" },
    { label: "Reward Terendah", value: "lowest-rate" },
  ];

  const hasActiveFilters = search !== "" || selectedNiche !== "all" || filterAvailableOnly;

  // Render State Simulators
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
          onRetry={() => {
            setIsErrorSimulated(false);
            showToast("Berhasil memulihkan dari state error!");
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
          <svg className="w-4.5 h-4.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simulator Control Panel */}
      <div className="mb-6 bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-xs font-bold text-neutral-700 shrink-0">
        <div className="flex items-center gap-2 text-neutral-900">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span>Panel Simulator State (Slicing DoD):</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsLoadingSimulated(!isLoadingSimulated)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isLoadingSimulated
                ? "bg-primary text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isLoadingSimulated ? "Matikan Shimmer" : "Simulasi Shimmer"}
          </button>
          <button
            onClick={() => setIsEmptySimulated(!isEmptySimulated)}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isEmptySimulated
                ? "bg-primary text-white border-primary-600"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isEmptySimulated ? "Matikan Empty" : "Simulasi Empty"}
          </button>
          <button
            onClick={() => setIsErrorSimulated(true)}
            className="px-3.5 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            Simulasi Error
          </button>
        </div>
      </div>

      {isLoadingSimulated ? (
        <div>
          <CreatorMetricSkeleton />
          <div className="h-10 bg-white border border-neutral-200/50 rounded-xl animate-pulse w-full mb-6"></div>
          <CreatorCardSkeleton count={3} />
        </div>
      ) : (
        <div>
          {/* Header */}
          <CreatorPageHeader
            title="Job Pool Kampanye"
            description="Pilih campaign UMKM yang cocok dengan niche kamu."
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <CreatorMetricCard
              label="Job Tersedia"
              value={totalJobsAvailable}
              helperText="Klaim instan"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Reward Tertinggi"
              value={highestReward}
              isCurrency={true}
              helperText="Per 1k tayangan"
              variant="orange"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Hampir Penuh"
              value={almostFullCount}
              helperText="Tinggal 1 kuota lagi"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              }
            />
            <CreatorMetricCard
              label="Job Baru Hari Ini"
              value={newTodayCount}
              helperText="Kampanye terbaru"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>

          {/* Filtering Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6 bg-white/80 border border-neutral-200/50 p-4 rounded-2xl">
            <div className="flex-1 flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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

              {/* Niche select */}
              <select
                value={selectedNiche}
                onChange={(e) => setSelectedNiche(e.target.value)}
                className="px-3.5 py-2.5 bg-neutral-50/50 border border-neutral-200/60 rounded-xl text-sm font-bold text-neutral-700 cursor-pointer focus:outline-none min-w-[140px]"
              >
                <option value="all">Semua Kategori</option>
                <option value="kecantikan">Kecantikan</option>
                <option value="kuliner">Kuliner</option>
                <option value="fesyen">Fesyen</option>
                <option value="pariwisata">Pariwisata</option>
              </select>
            </div>

            <div className="flex w-full flex-col gap-3 shrink-0 sm:flex-row sm:items-center md:w-auto">
              {/* Sort by */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full min-w-0 rounded-xl border border-neutral-200/60 bg-neutral-50/50 px-3.5 py-2.5 text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none sm:w-auto sm:min-w-[140px]"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Quota filter button */}
              <button
                onClick={() => setFilterAvailableOnly(!filterAvailableOnly)}
                className={cn(
                  "w-full rounded-xl border px-3.5 py-2.5 text-xs font-bold transition-all cursor-pointer sm:w-auto",
                  filterAvailableOnly
                    ? "bg-primary text-white border-primary-600 shadow-sm"
                    : "bg-neutral-50/50 text-neutral-700 border-neutral-200/60 hover:bg-neutral-50"
                )}
              >
                Kuota Tersedia
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="flex w-full items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-neutral-500 cursor-pointer hover:text-neutral-900 sm:w-auto"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Grid Content */}
          {isEmptySimulated || filteredJobs.length === 0 ? (
            <CreatorEmptyState
              title={isEmptySimulated ? "Job pool kosong" : "Job tidak ditemukan"}
              description={
                isEmptySimulated
                  ? "UMKM belum menerbitkan kampanye baru di pool. Silakan hubungi admin atau tunggu beberapa saat lagi."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => {
                const isFull = job.usedQuota >= job.quota;
                const isNearLimit = job.quota - job.usedQuota <= 1 && !isFull;
                
                const percentQuotaUsed = Math.min(100, Math.round((job.usedQuota / job.quota) * 100));

                return (
                  <div
                    key={job.id}
                    className="bg-white/95 border border-neutral-200/50 shadow-[0_12px_30px_rgba(235,94,40,0.015)] hover:shadow-[0_20px_40px_rgba(235,94,40,0.05)] rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between h-full group"
                  >
                    <div>
                      {/* Header info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl border border-neutral-200/30 overflow-hidden shrink-0 relative bg-neutral-50 flex items-center justify-center">
                          {job.brandAvatar ? (
                            <Image
                              src={job.brandAvatar}
                              alt={job.brandName}
                              fill
                              sizes="48px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <span className="font-bold text-neutral-400">B</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-extrabold text-neutral-900 group-hover:text-primary transition-colors text-sm truncate leading-tight">
                            {job.title}
                          </h4>
                          <p className="text-[10px] font-bold text-neutral-400 mt-1 truncate">
                            {job.brandName}
                          </p>
                        </div>
                        
                        <DashboardBadge tone={getDashboardStatusTone(isFull ? "full" : isNearLimit ? "pending" : "active")} size="sm">
                          {isFull ? "Penuh" : isNearLimit ? "Hampir Penuh" : "Aktif"}
                        </DashboardBadge>
                      </div>

                      {/* Brief preview */}
                      <p className="text-xs text-neutral-500 font-semibold leading-relaxed mb-4 line-clamp-3">
                        {job.brief}
                      </p>

                      {/* Info badges */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        <DashboardBadge tone={getDashboardCategoryTone(job.niche)} size="sm" className="uppercase tracking-wider">
                          🎥 {job.niche}
                        </DashboardBadge>
                        {job.externalAssetUrl && (
                          <DashboardBadge tone="green" size="sm" className="uppercase tracking-wider">
                            📂 Aset Tersedia
                          </DashboardBadge>
                        )}
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="mb-4 border-t border-neutral-100 pt-3">
                        <DashboardProgress
                          value={percentQuotaUsed}
                          label="KUOTA KREATOR"
                          valueLabel={`${job.usedQuota} / ${job.quota} Klaim`}
                          tone={isFull ? "red" : isNearLimit ? "yellow" : "orange"}
                        />
                      </div>

                      {/* Details specs */}
                      <div className="grid grid-cols-2 gap-3 py-3 px-4 rounded-2xl bg-neutral-50 border border-neutral-200/20 mb-5 text-xs">
                        <div>
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Rate 1k views</span>
                          <span className="block font-black text-neutral-900 mt-0.5">
                            {formatCurrency(job.ratePerThousandViews)}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider">Budget Escrow</span>
                          <span className="block font-black text-neutral-900 mt-0.5">
                            {formatCurrency(job.totalBudget)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2">
                      <DashboardButton
                        href={`/dashboard/kreator/job-pool/${job.id}`}
                        variant="outline"
                        size="md"
                        fullWidthOnMobile
                        className="w-full rounded-xl border-neutral-300/40 bg-neutral-100 text-xs font-extrabold text-neutral-800 hover:bg-neutral-200/80"
                      >
                        Lihat Detail
                      </DashboardButton>
                      <DashboardButton
                        disabled={isFull}
                        onClick={() => openClaimModal(job)}
                        variant="primary"
                        size="md"
                        fullWidthOnMobile
                        className={cn(
                          "w-full rounded-xl border-primary-600/10 text-xs font-extrabold shadow-sm hover:shadow-md",
                          isFull && "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed hover:bg-neutral-100 hover:shadow-sm",
                        )}
                      >
                        {isFull ? "Kuota Penuh" : "Klaim Job"}
                      </DashboardButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Claim Checklist Rules Modal */}
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
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRulesChecked.brief}
                    onChange={(e) => setIsRulesChecked({ ...isRulesChecked, brief: e.target.checked })}
                    className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    Saya menyetujui pengerjaan video sesuai panduan dan larangan pada brief produk.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRulesChecked.privacy}
                    onChange={(e) => setIsRulesChecked({ ...isRulesChecked, privacy: e.target.checked })}
                    className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    Saya akan memposting video di akun sosial media pribadi saya dan menyertakan link tayangnya sebagai bukti posting.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRulesChecked.retention}
                    onChange={(e) => setIsRulesChecked({ ...isRulesChecked, retention: e.target.checked })}
                    className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    Saya tidak akan menghapus postingan video setidaknya selama 30 hari setelah masa tayang.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRulesChecked.views}
                    onChange={(e) => setIsRulesChecked({ ...isRulesChecked, views: e.target.checked })}
                    className="mt-0.5 rounded border-neutral-300 text-primary focus:ring-primary/20 w-4 h-4 cursor-pointer"
                  />
                  <span className="leading-relaxed">
                    Saya menyetujui bahwa pembayaran dihitung berdasarkan views tervalidasi yang di-audit sistem admin.
                  </span>
                </label>
              </div>

              <div className="pt-6 flex gap-3">
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
                  disabled={!(isRulesChecked.brief && isRulesChecked.privacy && isRulesChecked.retention && isRulesChecked.views)}
                  className={cn(
                    "flex-1 py-3 font-bold text-xs rounded-full border transition-all shadow-md cursor-pointer",
                    !(isRulesChecked.brief && isRulesChecked.privacy && isRulesChecked.retention && isRulesChecked.views)
                      ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none"
                      : "bg-primary hover:bg-primary-600 text-white border-primary-600/10 hover:-translate-y-0.5 active:translate-y-0"
                  )}
                >
                  Klaim Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-neutral-200/50 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mx-auto mb-5 shadow-sm">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-black text-neutral-900 mb-2 leading-none">
              Campaign Berhasil Diklaim
            </h3>
            
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
                className="flex-1 py-3 text-center bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full border border-primary-600/10 shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
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
