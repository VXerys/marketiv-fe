"use client";

/* eslint-disable react-hooks/purity */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CreatorProfile,
  CreatorMetric,
  CreatorActiveWork,
  CreatorNegotiation,
  CreatorActivity,
  CreatorJob,
} from "@/types/creator-dashboard";
import { CreatorActionCard } from "./CreatorActionCard";
import { CreatorMetricSkeleton, CreatorCardSkeleton, CreatorListSkeleton } from "./CreatorSkeleton";
import { DashboardMetricCard, DashboardBadge, DashboardModal, DashboardButton, DashboardStateCard } from "@/components/features/dashboard/shared";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

interface CreatorDashboardViewProps {
  profile: CreatorProfile;
  metrics: CreatorMetric;
  activeWorks: CreatorActiveWork[];
  negotiations: CreatorNegotiation[];
  activities: CreatorActivity[];
  recommendedJobs: CreatorJob[];
}

export function CreatorDashboardView({
  profile,
  metrics,
  activeWorks: initialActiveWorks,
  activities: initialActivities,
  recommendedJobs: initialRecommendedJobs,
}: CreatorDashboardViewProps) {
  // State variables for data and interactive flows
  const [activeWorks, setActiveWorks] = useState<CreatorActiveWork[]>(initialActiveWorks);
  const [activities, setActivities] = useState<CreatorActivity[]>(initialActivities);
  const [recJobs, setRecJobs] = useState<CreatorJob[]>(initialRecommendedJobs);
  const [currentMetrics, setCurrentMetrics] = useState<CreatorMetric>(metrics);

  // Slicing State Simulators (for QA / User review)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isEmptySimulated, setIsEmptySimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  // Modals state
  const [isTarikDanaOpen, setIsTarikDanaOpen] = useState(false);
  const [isSubmitBuktiOpen, setIsSubmitBuktiOpen] = useState(false);
  const [selectedWorkToSubmit, setSelectedWorkToSubmit] = useState<CreatorActiveWork | null>(null);

  // Form inputs
  const [bankName, setBankName] = useState("bca");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  
  const [submitPlatform, setSubmitPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [submitUrl, setSubmitUrl] = useState("");

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Simulated handlers
  const handleKlaimJob = (jobId: string, jobTitle: string) => {
    // 1. Move from recommended to active works
    const targetJob = recJobs.find(j => j.id === jobId);
    if (!targetJob) return;

    // Remove from recommended list locally
    setRecJobs(prev => prev.filter(j => j.id !== jobId));

    // Add to active works
    const newActive: CreatorActiveWork = {
      id: `claim_new_${Date.now()}`,
      campaignId: targetJob.id,
      title: targetJob.title,
      brandName: targetJob.brandName,
      brandAvatar: targetJob.brandAvatar,
      brief: targetJob.brief,
      ratePerThousandViews: targetJob.ratePerThousandViews,
      status: "Aktif",
      claimedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    };

    setActiveWorks([newActive, ...activeWorks]);

    // Update metrics
    setCurrentMetrics(prev => ({
      ...prev,
      availableJobsCount: Math.max(0, prev.availableJobsCount - 1),
      activeJobsCount: prev.activeJobsCount + 1,
    }));

    // Add activity
    const newAct: CreatorActivity = {
      id: `act_new_${Date.now()}`,
      type: "pending_escrow",
      title: "Pekerjaan Diklaim",
      description: `Mengklaim pekerjaan kampanye '${jobTitle}'.`,
      amount: targetJob.totalBudget,
      createdAt: new Date().toISOString(),
    };
    setActivities([newAct, ...activities]);

    showToast(`Pekerjaan "${jobTitle}" berhasil diklaim!`);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Silakan masukkan nominal penarikan yang valid.");
      return;
    }

    if (amountNum > currentMetrics.balance) {
      showToast("Saldo wallet Anda tidak mencukupi.");
      return;
    }

    // Update local state metrics
    setCurrentMetrics(prev => ({
      ...prev,
      balance: prev.balance - amountNum,
      pendingPayouts: prev.pendingPayouts + amountNum,
    }));

    // Add activity
    const newAct: CreatorActivity = {
      id: `act_new_${Date.now()}`,
      type: "payout",
      title: "Penarikan Diajukan",
      description: `Mengajukan penarikan Rp${amountNum.toLocaleString("id-ID")} ke ${bankName.toUpperCase()}`,
      amount: amountNum,
      createdAt: new Date().toISOString(),
    };
    setActivities([newAct, ...activities]);

    setIsTarikDanaOpen(false);
    showToast(`Pengajuan penarikan Rp${amountNum.toLocaleString("id-ID")} berhasil dikirim!`);
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkToSubmit || !submitUrl.trim() || !submitUrl.startsWith("http")) {
      showToast("Silakan masukkan URL bukti tayang postingan sosial media yang valid.");
      return;
    }

    // Update active works state
    setActiveWorks(prev =>
      prev.map(w =>
        w.id === selectedWorkToSubmit.id
          ? {
              ...w,
              status: "Selesai" as const,
              submissionStatus: "Pending" as const,
              contentUrl: submitUrl,
            }
          : w
      )
    );

    // Update metrics
    setCurrentMetrics(prev => ({
      ...prev,
      activeJobsCount: Math.max(0, prev.activeJobsCount - 1),
      pendingSubmissionsCount: prev.pendingSubmissionsCount + 1,
    }));

    // Add activity
    const newAct: CreatorActivity = {
      id: `act_new_${Date.now()}`,
      type: "submission_valid",
      title: "Bukti Posting Dikirim",
      description: `Mengirimkan link bukti tayang untuk '${selectedWorkToSubmit.title}'.`,
      createdAt: new Date().toISOString(),
    };
    setActivities([newAct, ...activities]);

    setIsSubmitBuktiOpen(false);
    showToast("Bukti tayang berhasil diunggah! Menunggu verifikasi admin.");
  };

  const getDaysRemaining = (deadlineStr: string) => {
    const deadline = new Date(deadlineStr);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Melewati batas";
    if (diffDays === 0) return "Hari ini";
    return `${diffDays} hari lagi`;
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "submission_valid":
        return "bg-green-50 text-green-700 border-green-200/50";
      case "payout":
        return "bg-red-50 text-red-700 border-red-200/50";
      case "negotiation_new":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "pending_escrow":
        return "bg-indigo-50 text-indigo-700 border-indigo-200/50";
      default:
        return "bg-neutral-50 text-neutral-600 border-neutral-200/50";
    }
  };

  // State Simulators Renderer
  if (isErrorSimulated) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[80vh]">
        {/* Simulator controls */}
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
          description="Simulator error diaktifkan untuk memenuhi persyaratan Slicing DoD."
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
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
          <svg className="w-4.5 h-4.5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Simulator Dashboard Controls Bar (Premium Slicing Feature) */}
      <div className="mb-6 bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-xs font-bold text-neutral-700">
        <div className="flex items-center gap-2 text-neutral-900">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span>Panel Simulator State (Slicing DoD):</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              setIsLoadingSimulated(!isLoadingSimulated);
              if (!isLoadingSimulated) {
                showToast("Simulasi Shimmer Loading Aktif.");
              }
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isLoadingSimulated
                ? "bg-primary text-white border-primary-600 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isLoadingSimulated ? "Matikan Shimmer" : "Simulasi Shimmer"}
          </button>
          <button
            onClick={() => {
              setIsEmptySimulated(!isEmptySimulated);
              if (!isEmptySimulated) {
                showToast("Simulasi Empty State Rekomendasi Aktif.");
              }
            }}
            className={cn(
              "px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer",
              isEmptySimulated
                ? "bg-primary text-white border-primary-600 shadow-sm"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
            )}
          >
            {isEmptySimulated ? "Matikan Empty" : "Simulasi Empty"}
          </button>
          <button
            onClick={() => {
              setIsErrorSimulated(true);
              showToast("Simulasi Error State Aktif.");
            }}
            className="px-3.5 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            Simulasi Error
          </button>
        </div>
      </div>

      {isLoadingSimulated ? (
        <div>
          {/* Shimmer View */}
          <div className="h-24 bg-white border border-neutral-200/50 rounded-3xl animate-pulse p-6 mb-8 flex items-center justify-between">
            <div className="space-y-3">
              <div className="h-6 bg-neutral-200 rounded w-48"></div>
              <div className="h-3.5 bg-neutral-200 rounded w-96"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-10 bg-neutral-200 rounded-full w-28"></div>
              <div className="h-10 bg-neutral-200 rounded-full w-28"></div>
            </div>
          </div>
          <CreatorMetricSkeleton />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-4.5 bg-neutral-200 rounded w-36 mb-4"></div>
              <CreatorCardSkeleton count={2} />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <div className="h-4.5 bg-neutral-200 rounded w-36 mb-4"></div>
              <CreatorListSkeleton count={3} />
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* 1. Greeting Header */}
          <div className="bg-white/90 border border-neutral-200/50 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 shadow-[0_8px_30px_rgba(235,94,40,0.015)]">
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl lg:text-3xl font-black text-neutral-900 tracking-tight leading-none">
                  Halo, {profile.name}
                </h2>
                <DashboardBadge
                  type="status"
                  value={profile.isVerified ? "active" : "pending"}
                  size="sm"
                />
              </div>
              <p className="text-sm text-neutral-500 font-semibold max-w-xl leading-relaxed">
                Niche: <span className="text-primary font-bold uppercase">{profile.niche}</span> &bull; {profile.bio}
              </p>
            </div>
            <div className="flex gap-3 shrink-0 w-full md:w-auto">
              <Link
                href="/dashboard/kreator/rate-card"
                className="flex-1 md:flex-initial text-center px-5 py-3 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-bold text-xs rounded-full transition-all cursor-pointer shadow-sm"
              >
                Kelola Rate Card
              </Link>
              <Link
                href="/dashboard/kreator/job-pool"
                className="flex-1 md:flex-initial text-center px-6 py-3 bg-primary hover:bg-primary-600 text-white font-bold text-xs rounded-full transition-all border border-primary-600/10 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Buka Job Pool
              </Link>
            </div>
          </div>

          {/* 2. Metric Cards Grid (2 cols mobile, 3 tablet, 4 desktop) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <DashboardMetricCard
              label="Job Tersedia"
              value={currentMetrics.availableJobsCount}
              helper="Kampanye pool"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 9.172V5L8 4z" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Pekerjaan Aktif"
              value={currentMetrics.activeJobsCount}
              helper="Sedang dikerjakan"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Submission Pending"
              value={currentMetrics.pendingSubmissionsCount}
              helper="Menunggu audit admin"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Saldo Tersedia"
              value={currentMetrics.balance}
              currency="compact"
              helper="Tarik ke rekening bank"
              tone="orange"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Pending Payout"
              value={currentMetrics.pendingPayouts}
              currency="compact"
              helper="Proses verifikasi"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Views Tervalidasi"
              value={currentMetrics.validatedViewsCount}
              helper="Total views valid"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Rate Card Aktif"
              value={currentMetrics.activeRateCardsCount}
              helper="Paket penawaran"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              }
            />
            <DashboardMetricCard
              label="Order Negosiasi"
              value={currentMetrics.negotiationOrdersCount}
              helper="Rate Card orders"
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              }
            />
          </div>

          {/* 3. Quick Actions Stack */}
          <div className="mb-10">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Aksi Cepat</h3>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 w-full">
              <Link
                href="/dashboard/kreator/job-pool"
                className="flex-1 sm:flex-initial bg-white border border-neutral-200/60 p-4.5 rounded-2xl hover:border-primary/50 text-neutral-800 hover:text-primary transition-all flex items-center justify-center gap-3 font-extrabold text-xs shadow-sm hover:shadow active:scale-98 duration-200"
              >
                🔍 Cari &amp; Buka Job Pool
              </Link>
              <button
                onClick={() => {
                  const activeJob = activeWorks.find(w => w.status === "Aktif");
                  if (activeJob) {
                    setSelectedWorkToSubmit(activeJob);
                    setSubmitUrl("");
                    setIsSubmitBuktiOpen(true);
                  } else {
                    showToast("Anda tidak memiliki pekerjaan aktif pengerjaan.");
                  }
                }}
                className="flex-1 sm:flex-initial bg-white border border-neutral-200/60 p-4.5 rounded-2xl hover:border-primary/50 text-neutral-800 hover:text-primary transition-all flex items-center justify-center gap-3 font-extrabold text-xs shadow-sm hover:shadow active:scale-98 duration-200 cursor-pointer"
              >
                📤 Submit Bukti Tayang
              </button>
              <Link
                href="/dashboard/kreator/rate-card"
                className="flex-1 sm:flex-initial bg-white border border-neutral-200/60 p-4.5 rounded-2xl hover:border-primary/50 text-neutral-800 hover:text-primary transition-all flex items-center justify-center gap-3 font-extrabold text-xs shadow-sm hover:shadow active:scale-98 duration-200"
              >
                ⚙️ Kelola Rate Card
              </Link>
              <button
                onClick={() => {
                  setWithdrawAmount("");
                  setAccountNumber("");
                  setAccountHolder("");
                  setIsTarikDanaOpen(true);
                }}
                disabled={currentMetrics.balance <= 0}
                className={cn(
                  "flex-1 sm:flex-initial border p-4.5 rounded-2xl flex items-center justify-center gap-3 font-extrabold text-xs shadow-sm transition-all duration-200",
                  currentMetrics.balance <= 0
                    ? "bg-neutral-50 text-neutral-400 border-neutral-200 cursor-not-allowed"
                    : "bg-white border-neutral-200/60 hover:border-primary/50 text-neutral-800 hover:text-primary cursor-pointer hover:shadow active:scale-98"
                )}
              >
                💰 Tarik Dana Wallet
              </button>
              <Link
                href="/dashboard/kreator/profil"
                className="flex-1 sm:flex-initial bg-white border border-neutral-200/60 p-4.5 rounded-2xl hover:border-primary/50 text-neutral-800 hover:text-primary transition-all flex items-center justify-center gap-3 font-extrabold text-xs shadow-sm hover:shadow active:scale-98 duration-200"
              >
                👤 Edit Profil Saya
              </Link>
            </div>
          </div>

          {/* Main Content Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Main Segment (8 Columns) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* 4. Recommended Jobs (Sesuai niche, high reward, or near quota) */}
              <div>
                <div className="flex justify-between items-center mb-4.5">
                  <h3 className="text-lg font-black text-neutral-900 leading-none">
                    Rekomendasi Kampanye
                  </h3>
                  <Link
                    href="/dashboard/kreator/job-pool"
                    className="text-xs font-bold text-primary hover:text-primary-600 transition-colors"
                  >
                    Semua Kampanye
                  </Link>
                </div>

                {isEmptySimulated || recJobs.length === 0 ? (
                  <DashboardStateCard
                    kind="empty"
                    title="Tidak ada rekomendasi baru"
                    description="Seluruh kampanye yang sesuai dengan kualifikasi profil Anda telah diklaim. Silakan kunjungi Job Pool umum."
                    actionLabel="Buka Job Pool"
                    onAction={() => { window.location.href = '/dashboard/kreator/job-pool'; }}
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recJobs.map((job) => {
                      const isNearLimit = job.quota - job.usedQuota <= 1;
                      const isHighReward = job.ratePerThousandViews >= 6000;
                      
                      // Custom subtitle triggers for highlights
                      let highlightText = "Sesuai Niche";
                      if (isNearLimit) highlightText = "🔥 Kuota Hampir Penuh";
                      else if (isHighReward) highlightText = "💎 Reward Tinggi";

                      return (
                        <CreatorActionCard
                          key={job.id}
                          title={job.title}
                          subtitle={job.brandName}
                          avatarUrl={job.brandAvatar}
                          badgeText={highlightText}
                          badgeType="campaign"
                          description={job.brief}
                          details={[
                            { label: "Rate per 1k views", value: formatCurrency(job.ratePerThousandViews) },
                            { label: "Kuota Tersisa", value: `${job.quota - job.usedQuota} Slot` },
                          ]}
                          actions={
                            <div className="grid grid-cols-2 gap-2 mt-2 w-full">
                              <Link
                                href="/dashboard/kreator/job-pool"
                                className="w-full text-center bg-neutral-100 hover:bg-neutral-200/80 text-neutral-800 font-bold text-xs py-2.5 rounded-xl transition-all border border-neutral-300/40"
                              >
                                Lihat Detail
                              </Link>
                              <button
                                onClick={() => handleKlaimJob(job.id, job.title)}
                                className="w-full text-center bg-primary hover:bg-primary-600 text-white font-bold text-xs py-2.5 rounded-xl transition-all border border-primary-600/10 shadow-sm cursor-pointer"
                              >
                                Klaim Job
                              </button>
                            </div>
                          }
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 5. Active Work Preview (Claimed jobs) */}
              <div>
                <div className="flex justify-between items-center mb-4.5">
                  <h3 className="text-lg font-black text-neutral-900 leading-none">
                    Pekerjaan Aktif Saya
                  </h3>
                  <Link
                    href="/dashboard/kreator/pekerjaan-aktif"
                    className="text-xs font-bold text-primary hover:text-primary-600 transition-colors"
                  >
                    Selengkapnya
                  </Link>
                </div>

                {activeWorks.length === 0 ? (
                  <DashboardStateCard
                    kind="empty"
                    title="Tidak ada pekerjaan berjalan"
                    description="Saat ini Anda tidak memiliki kampanye aktif yang sedang dikerjakan. Klaim job di atas untuk memulai."
                  />
                ) : (
                  <div className="space-y-4">
                    {activeWorks.slice(0, 2).map((work) => {
                      const showSubmitBtn = !work.contentUrl && work.status === "Aktif";

                      return (
                        <div
                          key={work.id}
                          className="bg-white border border-neutral-200/50 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-sm transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {work.brandAvatar ? (
                              <div className="w-12 h-12 rounded-xl overflow-hidden border border-neutral-200/40 shrink-0 relative bg-neutral-50">
                                <Image
                                  src={work.brandAvatar}
                                  alt={work.brandName}
                                  className="w-full h-full object-cover"
                                  width={48}
                                  height={48}
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center font-bold text-neutral-400 shrink-0">
                                B
                              </div>
                            )}
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-neutral-900 text-sm truncate">{work.title}</h4>
                              <p className="text-[10px] text-neutral-400 font-bold mt-0.5 uppercase tracking-wider">
                                {work.brandName} &bull; Deadline: {new Date(work.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} ({getDaysRemaining(work.deadline)})
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-start">
                            <DashboardBadge
                              type="status"
                              value={String(work.submissionStatus || work.status)}
                              size="sm"
                            />
                            {showSubmitBtn && (
                              <button
                                onClick={() => {
                                  setSelectedWorkToSubmit(work);
                                  setSubmitUrl("");
                                  setIsSubmitBuktiOpen(true);
                                }}
                                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                              >
                                Submit Bukti
                              </button>
                            )}
                            {work.contentUrl && (
                              <a
                                href={work.contentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3.5 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold text-xs rounded-xl transition-colors"
                              >
                                Lihat Post
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

            {/* Right Side Column (4 Columns) */}
            <div className="lg:col-span-4 space-y-8">
              
              {/* 6. Recent Activity / Earning Feed */}
              <div>
                <h3 className="text-lg font-black text-neutral-900 leading-none mb-4.5">
                  Aktivitas &amp; Penghasilan
                </h3>
                
                <div className="bg-white border border-neutral-200/50 shadow-sm rounded-3xl p-5 space-y-4">
                  {activities.map((act) => (
                    <div
                      key={act.id}
                      className="flex gap-3 items-start border-b border-neutral-100 last:border-0 pb-3 last:pb-0"
                    >
                      <span className={cn(
                        "inline-flex px-2 py-0.5 rounded-md border text-[8px] font-black uppercase tracking-wider shrink-0 mt-0.5",
                        getActivityBadgeColor(act.type)
                      )}>
                        {act.type === "submission_valid" ? "VALID" :
                         act.type === "payout" ? "PAYOUT" :
                         act.type === "negotiation_new" ? "CHAT" : "ESCROW"}
                      </span>
                      
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h5 className="text-xs font-bold text-neutral-900 truncate">
                          {act.title}
                        </h5>
                        <p className="text-[11px] text-neutral-500 font-semibold leading-normal">
                          {act.description}
                        </p>
                        <span className="block text-[9px] text-neutral-400 font-bold mt-1">
                          {new Date(act.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>

                      {act.amount !== undefined && (
                        <span className={cn(
                          "text-xs font-black shrink-0 text-right mt-0.5",
                          act.type === "payout" ? "text-red-600" : "text-neutral-800"
                        )}>
                          {act.type === "payout" ? "-" : "+"} {formatCurrency(act.amount)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Tarik Dana Modal */}
      <DashboardModal
        isOpen={isTarikDanaOpen}
        title="Tarik Saldo Wallet"
        description={`Saldo tersedia: ${formatCurrency(currentMetrics.balance)}`}
        onClose={() => setIsTarikDanaOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsTarikDanaOpen(false)} fullWidthOnMobile>
              Batal
            </DashboardButton>
            <DashboardButton type="submit" form="tarik-dana-form" variant="primary" fullWidthOnMobile>
              Ajukan Penarikan
            </DashboardButton>
          </div>
        }
      >
        <form id="tarik-dana-form" onSubmit={handleWithdrawalSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Pilih Bank</label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none"
            >
              <option value="bca">Bank BCA</option>
              <option value="mandiri">Bank Mandiri</option>
              <option value="bni">Bank BNI</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Nomor Rekening</label>
            <input
              type="text"
              required
              placeholder="Masukkan nomor rekening..."
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Nama Pemilik Rekening</label>
            <input
              type="text"
              required
              placeholder="Sesuai nama rekening tabungan..."
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Nominal Penarikan</label>
            <input
              type="number"
              required
              min={50000}
              max={currentMetrics.balance}
              placeholder="Rp..."
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800"
            />
          </div>
        </form>
      </DashboardModal>

      {/* Submit Proof Modal */}
      <DashboardModal
        isOpen={isSubmitBuktiOpen && !!selectedWorkToSubmit}
        title="Kirim Bukti Tayang"
        description={selectedWorkToSubmit?.title}
        onClose={() => setIsSubmitBuktiOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsSubmitBuktiOpen(false)} fullWidthOnMobile>
              Batal
            </DashboardButton>
            <DashboardButton type="submit" form="submit-bukti-form" variant="primary" fullWidthOnMobile>
              Kirim Bukti Tayang
            </DashboardButton>
          </div>
        }
      >
        <form id="submit-bukti-form" onSubmit={handleProofSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSubmitPlatform("tiktok")}
                className={cn(
                  "py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  submitPlatform === "tiktok"
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                )}
              >
                TikTok
              </button>
              <button
                type="button"
                onClick={() => setSubmitPlatform("instagram")}
                className={cn(
                  "py-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer",
                  submitPlatform === "instagram"
                    ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                )}
              >
                Instagram
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Tautan URL Video Tayang</label>
            <input
              type="url"
              required
              placeholder="https://tiktok.com/@username/video/..."
              value={submitUrl}
              onChange={(e) => setSubmitUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 placeholder-neutral-400"
            />
          </div>
        </form>
      </DashboardModal>
    </div>
  );
}
