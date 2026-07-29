"use client";

/* eslint-disable react-hooks/purity */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Briefcase,
  FileCheck,
  Clock,
  Wallet,
  ArrowDownToLine,
  Eye,
  Tag,
  MessageCircle,
  Search,
  Upload,
  Settings,
  User,
  Users,
  Star,
  BadgeCheck,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import {
  CreatorProfile,
  CreatorMetric,
  CreatorActiveWork,
  CreatorNegotiation,
  CreatorActivity,
  CreatorJob,
} from "@/types/creator-dashboard";
import {
  DashboardBadge,
  DashboardModal,
  DashboardButton,
  DashboardStateCard,
} from "@/components/features/dashboard/shared";
import { MetricCard } from "@/components/ui/metric-card";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

// ─── Niche theme maps ────────────────────────────────────────────────────────

const NICHE_GRADIENTS: Record<string, [string, string]> = {
  kuliner:    ["var(--color-amber-500)", "var(--color-red-500)"],
  fashion:     ["var(--color-pink-500)", "var(--color-violet-500)"],
  pariwisata: ["var(--color-teal-500)", "var(--color-blue-500)"],
  edukasi:    ["var(--color-blue-500)", "var(--color-blue-700)"],
  kecantikan: ["var(--color-pink-400)", "var(--color-fuchsia-500)"],
  lainnya:    ["var(--color-kreator-600)", "var(--color-kreator-gradient-end)"],
};

const NICHE_LABELS: Record<string, string> = {
  kuliner:    "Kuliner",
  fashion:     "Fashion",
  pariwisata: "Travel",
  edukasi:    "Edukasi",
  kecantikan: "Beauty",
  lainnya:    "Lainnya",
};

const CREATOR_BRAND_GRADIENT =
  "linear-gradient(135deg, var(--color-kreator-600), var(--color-kreator-gradient-end))";
const CREATOR_PROGRESS_GRADIENT =
  "linear-gradient(90deg, var(--color-kreator-600), var(--color-kreator-gradient-end))";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toString();
};

// ─── CampaignCard ────────────────────────────────────────────────────────────

interface CampaignCardProps {
  job: CreatorJob;
  onClaim: (id: string, title: string) => void;
}

function CampaignCard({ job, onClaim }: CampaignCardProps) {
  const isNearLimit  = job.quota - job.usedQuota <= 1;
  const isHighReward = job.ratePerThousandViews >= 6000;
  const slotUsedPct  = Math.min(100, Math.round((job.usedQuota / job.quota) * 100));
  const slotsLeft    = job.quota - job.usedQuota;
  const [g1, g2]    = NICHE_GRADIENTS[job.niche] ?? NICHE_GRADIENTS.lainnya;
  const nicheLabel   = NICHE_LABELS[job.niche]   ?? "Lainnya";

  return (
    <div className="group flex flex-col overflow-hidden rounded-[20px] border border-neutral-200/50 bg-white shadow-[0_2px_16px_rgba(15,23,42,.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-kreator-400/20 hover:shadow-kreator">

      {/* Cover image */}
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
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,.72) 0%, rgba(0,0,0,0) 52%)" }}
        />

        {/* Brand overlay row */}
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

        {/* Badge chip */}
        {(isNearLimit || isHighReward) && (
          <div className="absolute top-2.5 left-2.5">
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[8px] font-extrabold uppercase tracking-wider border",
                isNearLimit
                  ? "bg-amber-50/90 text-amber-700 border-amber-300/40"
                  : "bg-violet-600/90 text-white border-violet-400/30"
              )}
              style={{ backdropFilter: "blur(4px)" }}
            >
              {isNearLimit ? "Hampir Penuh" : "Reward Tinggi"}
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <h4 className="text-sm font-extrabold text-kreator-ink leading-snug line-clamp-2">{job.title}</h4>

        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-[1.1rem] font-black text-kreator-600 tracking-tight leading-none">
            {formatCurrency(job.ratePerThousandViews)}
          </span>
          <span className="text-[10px] text-neutral-400 font-semibold">/ 1K views</span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[9px] font-bold border border-violet-200/50 uppercase tracking-wide">
            {nicheLabel}
          </span>
          <span className="flex items-center gap-1 text-[9px] font-bold text-neutral-400 ml-auto">
            <Users className="w-3 h-3" />
            {slotsLeft} slot
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-[9px] font-bold text-neutral-400">
            <span>Slot Tersisa</span>
            <span>{100 - slotUsedPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${100 - slotUsedPct}%`,
                background: CREATOR_PROGRESS_GRADIENT,
                transition: "width .4s ease",
              }}
            />
          </div>
        </div>

        <div className="flex gap-2 mt-auto pt-1">
          <Link
            href="/dashboard/kreator/job-pool"
            className="flex-1 text-center py-2.5 rounded-[12px] text-[10px] font-extrabold text-neutral-600 border border-neutral-200 hover:bg-neutral-50 transition-all duration-200"
          >
            Detail
          </Link>
          <button
            onClick={() => onClaim(job.id, job.title)}
            className="flex-[2] py-2.5 rounded-[12px] text-white text-[10px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            style={{
              background: CREATOR_BRAND_GRADIENT,
              boxShadow: "var(--shadow-kreator)",
            }}
          >
            Klaim Job
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

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

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeWorks, setActiveWorks]         = useState<CreatorActiveWork[]>(initialActiveWorks);
  const [activities, setActivities]           = useState<CreatorActivity[]>(initialActivities);
  const [recJobs, setRecJobs]                 = useState<CreatorJob[]>(initialRecommendedJobs);
  const [currentMetrics, setCurrentMetrics]   = useState<CreatorMetric>(metrics);


  const [isTarikDanaOpen,       setIsTarikDanaOpen]       = useState(false);
  const [isSubmitBuktiOpen,     setIsSubmitBuktiOpen]     = useState(false);
  const [selectedWorkToSubmit,  setSelectedWorkToSubmit]  = useState<CreatorActiveWork | null>(null);

  const [bankName,        setBankName]        = useState("bca");
  const [accountNumber,   setAccountNumber]   = useState("");
  const [accountHolder,   setAccountHolder]   = useState("");
  const [withdrawAmount,  setWithdrawAmount]  = useState("");
  const [submitPlatform,  setSubmitPlatform]  = useState<"tiktok" | "instagram">("tiktok");
  const [submitUrl,       setSubmitUrl]       = useState("");

  // ── Handlers ───────────────────────────────────────────────────────────────

  const showToast = (msg: string) => toast.success(msg);

  const handleKlaimJob = (jobId: string, jobTitle: string) => {
    const targetJob = recJobs.find(j => j.id === jobId);
    if (!targetJob) return;

    setRecJobs(prev => prev.filter(j => j.id !== jobId));
    setActiveWorks(prev => [{
      id: `claim_new_${Date.now()}`,
      campaignId: targetJob.id,
      title: targetJob.title,
      brandName: targetJob.brandName,
      brandAvatar: targetJob.brandAvatar,
      brief: targetJob.brief,
      ratePerThousandViews: targetJob.ratePerThousandViews,
      status: "claimed" as const,
      claimedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, ...prev]);

    setCurrentMetrics(prev => ({
      ...prev,
      availableJobsCount: Math.max(0, prev.availableJobsCount - 1),
      activeJobsCount: prev.activeJobsCount + 1,
    }));

    setActivities(prev => [{
      id: `act_new_${Date.now()}`,
      type: "pending_escrow",
      title: "Pekerjaan Diklaim",
      description: `Mengklaim pekerjaan kampanye '${jobTitle}'.`,
      amount: targetJob.totalBudget,
      createdAt: new Date().toISOString(),
    }, ...prev]);

    showToast(`Pekerjaan "${jobTitle}" berhasil diklaim!`);
  };

  const handleWithdrawalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount);
    if (isNaN(amountNum) || amountNum <= 0) { showToast("Masukkan nominal penarikan yang valid."); return; }
    if (amountNum > currentMetrics.balance)  { showToast("Saldo wallet Anda tidak mencukupi."); return; }

    setCurrentMetrics(prev => ({
      ...prev,
      balance: prev.balance - amountNum,
      pendingPayouts: prev.pendingPayouts + amountNum,
    }));
    setActivities(prev => [{
      id: `act_new_${Date.now()}`,
      type: "payout",
      title: "Penarikan Diajukan",
      description: `Mengajukan penarikan Rp${amountNum.toLocaleString("id-ID")} ke ${bankName.toUpperCase()}`,
      amount: amountNum,
      createdAt: new Date().toISOString(),
    }, ...prev]);

    setIsTarikDanaOpen(false);
    showToast(`Pengajuan penarikan Rp${amountNum.toLocaleString("id-ID")} berhasil dikirim!`);
  };

  const handleProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkToSubmit || !submitUrl.trim() || !submitUrl.startsWith("http")) {
      showToast("Masukkan URL bukti tayang yang valid.");
      return;
    }

    setActiveWorks(prev =>
      prev.map(w =>
        w.id === selectedWorkToSubmit.id
          ? { ...w, status: "submitted" as const, submissionStatus: "pending" as const, fraudStatus: "safe" as const, contentUrl: submitUrl }
          : w
      )
    );
    setCurrentMetrics(prev => ({
      ...prev,
      activeJobsCount: Math.max(0, prev.activeJobsCount - 1),
      pendingSubmissionsCount: prev.pendingSubmissionsCount + 1,
    }));
    setActivities(prev => [{
      id: `act_new_${Date.now()}`,
      type: "submission_valid",
      title: "Bukti Posting Dikirim",
      description: `Mengirimkan link bukti tayang untuk '${selectedWorkToSubmit.title}'.`,
      createdAt: new Date().toISOString(),
    }, ...prev]);

    setIsSubmitBuktiOpen(false);
    showToast("Bukti tayang berhasil diunggah! Menunggu verifikasi admin.");
  };

  const getDaysRemaining = (deadlineStr: string): string => {
    const diffDays = Math.ceil((new Date(deadlineStr).getTime() - Date.now()) / 86_400_000);
    if (diffDays < 0) return "Melewati batas";
    if (diffDays === 0) return "Hari ini";
    return `${diffDays} hari lagi`;
  };

  const getActivityDot = (type: string): string => {
    switch (type) {
      case "submission_valid": return "var(--color-green-500)";
      case "payout":           return "var(--color-red-500)";
      case "negotiation_new":  return "var(--color-amber-500)";
      case "pending_escrow":   return "var(--color-kreator-600)";
      default:                 return "var(--color-control-disabled)";
    }
  };

  const getActivityBadgeClass = (type: string): string => {
    switch (type) {
      case "submission_valid": return "bg-green-50 text-green-700 border-green-200/50";
      case "payout":           return "bg-red-50 text-red-700 border-red-200/50";
      case "negotiation_new":  return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "pending_escrow":   return "bg-violet-50 text-violet-700 border-violet-200/50";
      default:                 return "bg-neutral-50 text-neutral-600 border-neutral-200/50";
    }
  };

  const getActivityLabel = (type: string): string => {
    switch (type) {
      case "submission_valid": return "VALID";
      case "payout":           return "PAYOUT";
      case "negotiation_new":  return "CHAT";
      case "pending_escrow":   return "KLAIM";
      default:                 return "INFO";
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative flex-1 overflow-y-auto bg-gradient-to-b from-kreator-page via-kreator-50/30 to-white p-4 sm:p-6 lg:p-8">

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <div className="max-w-[1400px] mx-auto space-y-8">

          {/* 1 ── Hero Profile Card */}
          <div
            className="relative overflow-hidden rounded-[32px] p-6 sm:p-10"
            style={{
              background: "linear-gradient(135deg, rgb(255 255 255 / 0.85) 0%, color-mix(in srgb, var(--color-kreator-soft) 75%, transparent) 45%, rgb(255 255 255 / 0.95) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: "1px solid color-mix(in srgb, var(--color-kreator-600) 15%, transparent)",
              boxShadow: "var(--shadow-kreator-hero)",
            }}
          >
            {/* Decorative radial blobs */}
            <div className="absolute -top-16 -right-16 h-64 w-64 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-kreator-600) 12%, transparent), transparent 70%)" }} />
            <div className="absolute -bottom-20 right-40 h-48 w-48 rounded-full pointer-events-none"
              style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--color-kreator-gradient-end) 8%, transparent), transparent 70%)" }} />

            <div className="relative flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">

              {/* Left: avatar + info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 w-full lg:w-auto">
                <div className="relative shrink-0 mx-auto sm:mx-0">
                  <div
                    className="relative h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-kreator-100 shadow-kreator-avatar sm:h-[105px] sm:w-[105px]"
                  >
                    <Image src={profile.avatarUrl} alt={profile.name} fill className="object-cover" sizes="105px" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 border-3 border-white shadow-sm" />
                </div>

                <div className="space-y-3.5 text-center sm:text-left flex-1 min-w-0">
                  <div>
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap mb-1">
                      <h2 className="text-2xl font-black leading-none tracking-tight text-kreator-ink sm:text-3xl">
                        Halo, {profile.name}
                      </h2>
                      {profile.isVerified ? (
                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/50 text-emerald-700 text-[9px] font-extrabold uppercase tracking-wider shadow-3xs">
                          <BadgeCheck className="w-3.5 h-3.5" /> Terverifikasi
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200/50 text-amber-700 text-[9px] font-extrabold uppercase tracking-wider shadow-3xs">
                          Pending
                        </span>
                      )}
                    </div>
                    <span className="mb-2 mt-1 inline-flex items-center rounded-full border border-kreator-600/10 bg-kreator-soft/70 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-kreator-600">
                      Niche: {profile.niche}
                    </span>
                    <p className="text-[0.92rem] font-semibold text-neutral-600 max-w-xl leading-relaxed mt-1">
                      {profile.bio || "Selamat datang kembali di dashboard pekerjaan Anda."}
                    </p>
                  </div>

                  {/* Structured high-contrast metrics pills */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                    {/* Followers */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-neutral-200/50 shadow-3xs">
                      <Users className="w-3.5 h-3.5 text-violet-600 shrink-0" />
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-wider">Followers</span>
                        <span className="text-xs font-black text-neutral-900 mt-0.5">{formatCount(profile.followers)}</span>
                      </div>
                    </div>
                    {/* Rating */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-neutral-200/50 shadow-3xs">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-wider">Rating</span>
                        <span className="text-xs font-black text-neutral-900 mt-0.5">{profile.rating.toFixed(1)}</span>
                      </div>
                    </div>
                    {/* Job Selesai */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/80 border border-neutral-200/50 shadow-3xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <div className="flex flex-col text-left leading-none">
                        <span className="text-[8px] text-neutral-400 font-extrabold uppercase tracking-wider">Job Selesai</span>
                        <span className="text-xs font-black text-neutral-900 mt-0.5">{profile.completedJobs}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: CTAs */}
              <div className="flex flex-row sm:flex-row lg:flex-col gap-2.5 shrink-0 w-full lg:w-auto">
                <Link
                  href="/dashboard/kreator/rate-card"
                  className="flex min-h-[44px] flex-1 items-center justify-center rounded-2xl border border-kreator-200 bg-white px-6 py-3 text-center text-xs font-extrabold text-kreator-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-kreator-300 hover:bg-kreator-50 hover:shadow-sm lg:flex-initial"
                >
                  Kelola Rate Card
                </Link>
                <Link
                  href="/dashboard/kreator/job-pool"
                  className="flex-1 lg:flex-initial text-center px-6 py-3 rounded-2xl text-white text-xs font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px] flex items-center justify-center"
                  style={{
                    background: CREATOR_BRAND_GRADIENT,
                    boxShadow: "var(--shadow-kreator-lg)",
                  }}
                >
                  Buka Job Pool
                </Link>
              </div>
            </div>
          </div>

          {/* 2 ── KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            <MetricCard label="Job Tersedia"        value={currentMetrics.availableJobsCount}                helper="Kampanye pool"          tone="kreator" icon={<Briefcase       className="w-4 h-4" />} />
            <MetricCard label="Pekerjaan Aktif"     value={currentMetrics.activeJobsCount}                   helper="Sedang dikerjakan"      tone="info"    icon={<FileCheck       className="w-4 h-4" />} />
            <MetricCard label="Submission Pending"  value={currentMetrics.pendingSubmissionsCount}           helper="Menunggu audit admin"   tone="warning" icon={<Clock           className="w-4 h-4" />} />
            <MetricCard label="Saldo Tersedia"      value={formatCompactCurrency(currentMetrics.balance)}    helper="Tarik ke rekening bank" tone="success" icon={<Wallet          className="w-4 h-4" />} badge="Utama" highlight />
            <MetricCard label="Pending Payout"      value={formatCompactCurrency(currentMetrics.pendingPayouts)} helper="Proses verifikasi"  tone="default" icon={<ArrowDownToLine className="w-4 h-4" />} />
            <MetricCard label="Views Tervalidasi"   value={formatCount(currentMetrics.validatedViewsCount)}  helper="Total views valid"      tone="info"    icon={<Eye             className="w-4 h-4" />} />
            <MetricCard label="Rate Card Aktif"     value={currentMetrics.activeRateCardsCount}              helper="Paket penawaran"        tone="success" icon={<Tag             className="w-4 h-4" />} />
            <MetricCard label="Order Negosiasi"     value={currentMetrics.negotiationOrdersCount}            helper="Rate Card orders"       tone="accent"  icon={<MessageCircle   className="w-4 h-4" />} />
          </div>

          {/* 3 ── Quick Actions */}
          <div>
            <h3 className="text-[.67rem] font-extrabold text-neutral-400 uppercase tracking-widest mb-4 leading-none">
              Aksi Cepat
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {/* Cari Job */}
              <Link
                href="/dashboard/kreator/job-pool"
                className="group flex flex-col items-center justify-center gap-2 rounded-[18px] border border-neutral-200/60 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-kreator-400/30 hover:bg-kreator-50/40 hover:shadow-kreator cursor-pointer"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-kreator-200/50 bg-kreator-50 transition-colors duration-200 group-hover:bg-kreator-100/80">
                  <Search className="h-4 w-4 text-kreator-600" />
                </div>
                <span className="text-center text-[10px] font-extrabold leading-tight text-neutral-700 transition-colors group-hover:text-kreator-700">Cari Job Pool</span>
              </Link>

              {/* Submit Bukti */}
              <button
                onClick={() => {
                  const activeJob = activeWorks.find(w => w.status === "claimed");
                  if (activeJob) { setSelectedWorkToSubmit(activeJob); setSubmitUrl(""); setIsSubmitBuktiOpen(true); }
                  else showToast("Anda tidak memiliki pekerjaan aktif.");
                }}
                className="group flex flex-col items-center justify-center gap-2 rounded-[18px] border border-neutral-200/60 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-kreator-400/30 hover:bg-kreator-50/40 hover:shadow-kreator cursor-pointer"
              >
                <div className="h-9 w-9 rounded-[12px] bg-indigo-50 border border-indigo-200/50 flex items-center justify-center group-hover:bg-indigo-100/80 transition-colors duration-200">
                  <Upload className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-center text-[10px] font-extrabold leading-tight text-neutral-700 transition-colors group-hover:text-kreator-700">Submit Bukti</span>
              </button>

              {/* Kelola Rate Card */}
              <Link
                href="/dashboard/kreator/rate-card"
                className="group flex flex-col items-center justify-center gap-2 rounded-[18px] border border-neutral-200/60 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-kreator-400/30 hover:bg-kreator-50/40 hover:shadow-kreator cursor-pointer"
              >
                <div className="h-9 w-9 rounded-[12px] bg-emerald-50 border border-emerald-200/50 flex items-center justify-center group-hover:bg-emerald-100/80 transition-colors duration-200">
                  <Settings className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-center text-[10px] font-extrabold leading-tight text-neutral-700 transition-colors group-hover:text-kreator-700">Kelola Rate Card</span>
              </Link>

              {/* Tarik Dana */}
              <button
                onClick={() => { setWithdrawAmount(""); setAccountNumber(""); setAccountHolder(""); setIsTarikDanaOpen(true); }}
                disabled={currentMetrics.balance <= 0}
                className={cn(
                  "group flex flex-col items-center justify-center gap-2 p-4 rounded-[18px] border transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,.04)]",
                  currentMetrics.balance <= 0
                    ? "bg-neutral-50 border-neutral-200 text-neutral-400 cursor-not-allowed"
                    : "bg-white border-neutral-200/60 hover:border-kreator-400/30 hover:bg-kreator-50/40 hover:-translate-y-0.5 hover:shadow-kreator cursor-pointer"
                )}
              >
                <div className={cn(
                  "h-9 w-9 rounded-[12px] flex items-center justify-center transition-colors duration-200",
                  currentMetrics.balance <= 0
                    ? "bg-neutral-100 border border-neutral-200"
                    : "bg-kreator-50 border border-kreator-200/50 group-hover:bg-kreator-100/80"
                )}>
                  <Wallet className={cn("w-4 h-4", currentMetrics.balance <= 0 ? "text-neutral-400" : "text-kreator-600")} />
                </div>
                <span className="text-center text-[10px] font-extrabold leading-tight transition-colors group-hover:text-kreator-700">Tarik Dana</span>
              </button>

              {/* Edit Profil */}
              <Link
                href="/dashboard/kreator/profil"
                className="group flex flex-col items-center justify-center gap-2 rounded-[18px] border border-neutral-200/60 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-kreator-400/30 hover:bg-kreator-50/40 hover:shadow-kreator cursor-pointer"
              >
                <div className="h-9 w-9 rounded-[12px] bg-blue-50 border border-blue-200/50 flex items-center justify-center group-hover:bg-blue-100/80 transition-colors duration-200">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-center text-[10px] font-extrabold leading-tight text-neutral-700 transition-colors group-hover:text-kreator-700">Edit Profil</span>
              </Link>
            </div>
          </div>

          {/* 4 ── Campaign Recommendations — full width 3-col grid */}
          <div>
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-base font-black leading-none text-kreator-ink">Rekomendasi Kampanye</h3>
                <p className="text-[10px] text-neutral-400 font-semibold mt-1">
                  Dipilih khusus berdasarkan niche &amp; kualifikasi profil kamu.
                </p>
              </div>
              <Link
                href="/dashboard/kreator/job-pool"
                className="flex items-center gap-1 text-[10px] font-extrabold text-violet-600 hover:text-violet-700 transition-colors"
              >
                Semua Kampanye
                <TrendingUp className="w-3 h-3" />
              </Link>
            </div>

            {recJobs.length === 0 ? (
              <DashboardStateCard
                kind="empty"
                title="Tidak ada rekomendasi baru"
                description="Seluruh kampanye yang sesuai dengan kualifikasi profil Anda telah diklaim. Silakan kunjungi Job Pool umum."
                actionLabel="Buka Job Pool"
                onAction={() => { window.location.href = "/dashboard/kreator/job-pool"; }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recJobs.map((job) => (
                  <CampaignCard key={job.id} job={job} onClaim={handleKlaimJob} />
                ))}
              </div>
            )}
          </div>

          {/* 5 ── Active Works + Activity Feed */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Active Works (8 col) */}
            <div className="lg:col-span-8">
              <div className="flex justify-between items-center mb-5">
                <div>
                  <h3 className="text-base font-black leading-none text-kreator-ink">Pekerjaan Aktif Saya</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold mt-1">Job yang sedang dalam pengerjaan.</p>
                </div>
                <Link href="/dashboard/kreator/pekerjaan-aktif" className="text-[10px] font-extrabold text-violet-600 hover:text-violet-700 transition-colors">
                  Selengkapnya
                </Link>
              </div>

              {activeWorks.length === 0 ? (
                <DashboardStateCard
                  kind="empty"
                  title="Tidak ada pekerjaan berjalan"
                  description="Saat ini Anda tidak memiliki kampanye aktif. Klaim job di atas untuk memulai."
                />
              ) : (
                <div className="space-y-3">
                  {activeWorks.slice(0, 3).map((work) => {
                    const showSubmitBtn = !work.contentUrl && work.status === "claimed";
                    return (
                      <div
                        key={work.id}
                        className="group flex flex-col items-start justify-between gap-4 rounded-[18px] border border-neutral-200/50 bg-white p-4 shadow-[0_2px_8px_rgba(15,23,42,.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-kreator-400/20 hover:shadow-kreator sm:flex-row sm:items-center sm:p-5"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="h-11 w-11 rounded-[12px] border border-neutral-200/50 overflow-hidden shrink-0 relative bg-neutral-100">
                            {work.brandAvatar && (
                              <Image src={work.brandAvatar} alt={work.brandName} fill className="object-cover" sizes="44px" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="truncate text-sm font-extrabold text-kreator-ink">{work.title}</h4>
                            <p className="text-[10px] font-bold text-neutral-400 mt-0.5 uppercase tracking-wide">
                              {work.brandName} &bull; {new Date(work.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short" })} &bull; {getDaysRemaining(work.deadline)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                          <DashboardBadge type="status" value={String(work.submissionStatus || work.status)} size="sm" />
                          {showSubmitBtn && (
                            <button
                              onClick={() => { setSelectedWorkToSubmit(work); setSubmitUrl(""); setIsSubmitBuktiOpen(true); }}
                              className="px-4 py-2 rounded-[10px] text-white text-[10px] font-extrabold transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                              style={{ background: CREATOR_BRAND_GRADIENT, boxShadow: "var(--shadow-kreator-sm)" }}
                            >
                              Submit Bukti
                            </button>
                          )}
                          {work.contentUrl && (
                            <a href={work.contentUrl} target="_blank" rel="noreferrer"
                              className="px-3.5 py-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-600 font-bold text-[10px] rounded-[10px] transition-colors">
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

            {/* Activity Feed (4 col) */}
            <div className="lg:col-span-4">
              <div className="mb-5">
                <h3 className="text-base font-black leading-none text-kreator-ink">Aktivitas &amp; Penghasilan</h3>
                <p className="text-[10px] text-neutral-400 font-semibold mt-1">Riwayat terbaru akun Anda.</p>
              </div>

              <div className="bg-white rounded-[22px] p-5 border border-neutral-200/50 shadow-[0_2px_12px_rgba(15,23,42,.04)]">
                <div className="relative pl-5 border-l-2 border-violet-100 space-y-5">
                  {activities.slice(0, 6).map((act) => (
                    <div key={act.id} className="relative">
                      <div
                        className="absolute -left-[23px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shrink-0"
                        style={{ background: getActivityDot(act.type) }}
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={cn(
                            "inline-flex px-2 py-0.5 rounded-md border text-[8px] font-extrabold uppercase tracking-wider",
                            getActivityBadgeClass(act.type)
                          )}>
                            {getActivityLabel(act.type)}
                          </span>
                          {act.amount !== undefined && (
                            <span className={cn("text-[10px] font-extrabold ml-auto", act.type === "payout" ? "text-red-600" : "text-emerald-600")}>
                              {act.type === "payout" ? "−" : "+"}{formatCurrency(act.amount)}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-extrabold leading-tight text-kreator-ink">{act.title}</p>
                        <p className="text-[10px] text-neutral-400 font-semibold leading-normal">{act.description}</p>
                        <span className="block text-[9px] text-neutral-300 font-bold mt-0.5">
                          {new Date(act.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  ))}
                  {activities.length === 0 && (
                    <p className="text-xs text-neutral-400 font-semibold py-4 text-center">Belum ada aktivitas.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

      {/* ── Tarik Dana Modal ──────────────────────────────────────────────── */}
      <DashboardModal
        isOpen={isTarikDanaOpen}
        title="Tarik Saldo Wallet"
        description={`Saldo tersedia: ${formatCurrency(currentMetrics.balance)}`}
        onClose={() => setIsTarikDanaOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsTarikDanaOpen(false)} fullWidthOnMobile>Batal</DashboardButton>
            <DashboardButton type="submit" form="tarik-dana-form" variant="primary" fullWidthOnMobile>Ajukan Penarikan</DashboardButton>
          </div>
        }
      >
        <form id="tarik-dana-form" onSubmit={handleWithdrawalSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Pilih Bank</label>
            <select value={bankName} onChange={e => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold text-neutral-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all">
              <option value="bca">Bank BCA</option>
              <option value="mandiri">Bank Mandiri</option>
              <option value="bni">Bank BNI</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Nomor Rekening</label>
            <input type="text" required placeholder="Masukkan nomor rekening..." value={accountNumber} onChange={e => setAccountNumber(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all font-semibold text-neutral-800" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Nama Pemilik Rekening</label>
            <input type="text" required placeholder="Sesuai nama rekening tabungan..." value={accountHolder} onChange={e => setAccountHolder(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all font-semibold text-neutral-800" />
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Nominal Penarikan</label>
            <input type="number" required min={50000} max={currentMetrics.balance} placeholder="Rp..." value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all font-semibold text-neutral-800" />
          </div>
        </form>
      </DashboardModal>

      {/* ── Submit Bukti Modal ────────────────────────────────────────────── */}
      <DashboardModal
        isOpen={isSubmitBuktiOpen && !!selectedWorkToSubmit}
        title="Kirim Bukti Tayang"
        description={selectedWorkToSubmit?.title}
        onClose={() => setIsSubmitBuktiOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsSubmitBuktiOpen(false)} fullWidthOnMobile>Batal</DashboardButton>
            <DashboardButton type="submit" form="submit-bukti-form" variant="primary" fullWidthOnMobile>Kirim Bukti Tayang</DashboardButton>
          </div>
        }
      >
        <form id="submit-bukti-form" onSubmit={handleProofSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-600 uppercase tracking-wider">Platform</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setSubmitPlatform("tiktok")}
                className={cn("py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer", submitPlatform === "tiktok" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50")}>
                TikTok
              </button>
              <button type="button" onClick={() => setSubmitPlatform("instagram")}
                className={cn("py-2.5 rounded-xl border font-bold text-xs transition-all cursor-pointer", submitPlatform === "instagram" ? "bg-violet-600 text-white border-violet-600" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50")}>
                Instagram
              </button>
            </div>
          </div>
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Tautan URL Video Tayang</label>
            <input type="url" required placeholder="https://tiktok.com/@username/video/..." value={submitUrl} onChange={e => setSubmitUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500/50 transition-all font-semibold text-neutral-800 placeholder-neutral-400" />
          </div>
        </form>
      </DashboardModal>
    </div>
  );
}
