"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Share2,
  Play,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  AlignLeft,
  Info,
  Globe,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileText,
  Tag,
  X,
} from "lucide-react";
import { CreatorJob } from "@/types/creator-dashboard";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import { claimCampaign } from "@/services/creator/creator-dashboard.service";
import { toast } from "sonner";
import {
  DashboardModal,
  DashboardButton,
  DashboardStateCard,
} from "@/components/features/dashboard/shared";

interface JobDetailViewProps {
  job: CreatorJob | null;
}

const VIDEO_SUB_TABS = ["Semua", "Pending", "Approved", "Rejected", "Need Action", "Deleted"];
// "Syarat akun" dihapus: minimum followers & niche yang diperbolehkan tidak punya
// kolom apa pun di campaigns/campaign_briefs — sebelumnya diisi konstanta.
const BRIEF_PILLS = ["Aturan", "Narasi", "Caption", "Tentang"] as const;
type BriefPill = (typeof BRIEF_PILLS)[number];

/** Placeholder saat UMKM belum mengisi bagian brief tersebut. */
function BriefEmpty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-neutral-400 font-medium italic">{children}</p>;
}

export function JobDetailView({ job: initialJob }: JobDetailViewProps) {
  const [job, setJob] = useState<CreatorJob | null>(initialJob);
  const [activeTab, setActiveTab] = useState<"detail" | "video">("detail");
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [activeVideoTab, setActiveVideoTab] = useState("Semua");

  // Brief inline section
  const [isBriefOpen, setIsBriefOpen] = useState(false);
  const [activeBriefSection, setActiveBriefSection] = useState<"brief" | "materi">("brief");
  const [activeBriefPill, setActiveBriefPill] = useState<BriefPill>("Aturan");
  const briefRef = useRef<HTMLDivElement>(null);

  const [countdown, setCountdown] = useState({ h: 3, m: 16, s: 43 });
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isRulesChecked, setIsRulesChecked] = useState({
    brief: false,
    privacy: false,
    retention: false,
    views: false,
  });

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((prev) => {
        let { h, m, s } = prev;
        if (--s < 0) { s = 59; if (--m < 0) { m = 59; if (--h < 0) h = 0; } }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatCountdown = () => {
    const { h, m, s } = countdown;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const openBrief = () => {
    setIsBriefOpen(true);
    setTimeout(() => {
      briefRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  /**
   * Klaim campaign. Kuota lokal baru dinaikkan SETELAH server menerima —
   * sebelumnya dinaikkan optimistis, sehingga kuota terlihat berkurang walau
   * klaimnya ditolak (kuota penuh / sudah pernah klaim / profil belum lengkap).
   */
  const handleClaimSubmit = async () => {
    if (!job || isClaiming) return;
    setIsClaiming(true);
    const res = await claimCampaign(job.id);
    setIsClaiming(false);

    if (!res.success) {
      setIsClaimOpen(false);
      toast.error(res.error ?? "Gagal mengambil pekerjaan ini.");
      return;
    }

    setJob((prev) => (prev ? { ...prev, usedQuota: prev.usedQuota + 1 } : null));
    setIsClaimOpen(false);
    setIsSuccessOpen(true);
  };

  if (!job) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[70vh]">
        <DashboardStateCard kind="empty" title="Kampanye tidak ditemukan" description="ID kampanye tidak valid atau telah dihapus." actionLabel="Kembali ke Job Pool" onAction={() => { window.location.href = "/dashboard/kreator/job-pool"; }} />
      </div>
    );
  }

  const isFull = job.usedQuota >= job.quota;
  const isNearLimit = job.quota - job.usedQuota <= 1 && !isFull;
  const percentQuotaUsed = Math.round((job.usedQuota / job.quota) * 100);
  const budgetRemaining = 100 - percentQuotaUsed;
  const allChecked = isRulesChecked.brief && isRulesChecked.privacy && isRulesChecked.retention && isRulesChecked.views;
  const descText = job.productDescription ?? "";
  const isLongDesc = descText.length > 220;

  const doList = job.doAndDont?.do ?? [];
  const dontList = job.doAndDont?.dont ?? [];
  const platforms = job.platforms ?? [];
  const materials = job.materials ?? [];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ═══ HERO — full-bleed image background ═══ */}
      <div className="relative overflow-hidden" style={{ minHeight: 340 }}>
        {/* Blurred bg image */}
        {job.thumbnailUrl ? (
          <div className="absolute inset-0 scale-110">
            <Image src={job.thumbnailUrl} alt="" fill className="object-cover" priority sizes="100vw" />
          </div>
        ) : (
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1e1b4b, #0c172b)" }} />
        )}

        {/* Main dark overlay */}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 50%, rgba(0,0,0,0.55) 100%)" }}
        />

        {/* Bottom fade — eases into the card below */}
        <div
          className="absolute bottom-0 left-0 right-0 h-20 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.25))" }}
        />

        {/* Hero content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10">
          {/* Back */}
          <Link href="/dashboard/kreator/job-pool" className="inline-flex items-center gap-1.5 text-xs font-bold text-white/55 hover:text-white transition-colors mb-6 group">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
            Kembali
          </Link>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 items-center">
            {/* Left info */}
            <div className="flex-1 min-w-0 space-y-4">
              {/* Brand row */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="relative w-7 h-7 rounded-full border-2 border-white/25 overflow-hidden bg-white/15 shrink-0">
                    {job.brandAvatar ? (
                      <Image src={job.brandAvatar} alt={job.brandName} fill className="object-cover" sizes="28px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-black text-xs text-white/60">{job.brandName?.charAt(0)}</div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-white/80">{job.brandName}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-white/15 border border-white/20 text-[10px] font-black uppercase tracking-wide text-white/80">CLIPPING</span>
                <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border",
                  isFull ? "bg-red-500/30 text-red-200 border-red-400/30"
                  : isNearLimit ? "bg-amber-500/30 text-amber-200 border-amber-400/30"
                  : "bg-emerald-500/30 text-emerald-200 border-emerald-400/30")}>
                  {isFull ? "PENUH" : isNearLimit ? "HAMPIR PENUH" : "ACTIVE"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-white leading-tight tracking-tight">
                {job.title}
              </h1>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl sm:text-[2.2rem] font-black text-white tracking-tight leading-none">
                  {formatCurrency(job.ratePerThousandViews)}
                </span>
                <span className="text-sm text-white/50 font-bold">/ 1K views</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold text-white/55">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-white/65" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  INSTAGRAM
                </span>
                <span className="w-1 h-1 rounded-full bg-white/25 shrink-0" />
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3 text-white/65" />
                  {job.niche.toUpperCase()}
                </span>
                <span className="w-1 h-1 rounded-full bg-white/25 shrink-0" />
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-white/65" />
                  {(job.targetViews || 7659).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  disabled={isFull}
                  onClick={() => { setIsRulesChecked({ brief: false, privacy: false, retention: false, views: false }); setIsClaimOpen(true); }}
                  className={cn("min-h-[44px] px-7 font-black text-sm rounded-xl transition-all duration-200",
                    isFull ? "bg-white/10 text-white/30 cursor-not-allowed" : "text-white hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-lg")}
                  style={!isFull ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 20px rgba(124,58,237,.40)" } : undefined}
                >
                  {isFull ? "Kuota Penuh" : "Join Campaign"}
                </button>
                <button onClick={() => setActiveTab("video")} className="min-h-[44px] px-5 inline-flex items-center gap-2 font-bold text-sm rounded-xl border border-white/25 bg-white/10 hover:bg-white/18 text-white transition-all duration-200 cursor-pointer backdrop-blur-sm">
                  <Play className="w-3.5 h-3.5" />
                  Submit Video
                </button>
                <button className="min-h-[44px] w-11 flex items-center justify-center rounded-xl border border-white/25 bg-white/10 hover:bg-white/18 text-white transition-all duration-200 cursor-pointer backdrop-blur-sm">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right: thumbnail */}
            <div className="relative w-full lg:w-[400px] xl:w-[440px] aspect-video rounded-2xl overflow-hidden shadow-2xl shrink-0 border-2 border-white/20">
              {job.thumbnailUrl ? (
                <Image src={job.thumbnailUrl} alt={job.title} fill sizes="(max-width: 1024px) 100vw, 440px" className="object-cover" priority />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center font-black text-8xl text-white/10 select-none" style={{ background: "linear-gradient(135deg, #6d28d9, #3730a3)" }}>
                  {job.brandName?.charAt(0) ?? "M"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT CARD — overlaps hero with rounded top ═══ */}
      <div className="relative -mt-7 bg-white rounded-t-[28px] shadow-[0_15px_30px_rgba(0,0,0,0.03)]">

        {/* Tab bar at top of white card */}
        <div className="border-b border-neutral-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-8">
            {(["detail", "video"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn("py-4 text-sm font-bold border-b-2 transition-all duration-200 cursor-pointer",
                  activeTab === tab ? "border-violet-500 text-violet-600" : "border-transparent text-neutral-400 hover:text-neutral-700")}
              >
                {tab === "detail" ? "Detail" : "Video Kamu"}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7">

          {/* ── Detail tab ── */}
          {activeTab === "detail" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">

                {/* Left (8 cols) */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Tentang Campaign */}
                  <div className="bg-white border border-neutral-200/60 rounded-[22px] p-6 shadow-sm">
                    <h3 className="text-sm font-extrabold text-neutral-800 mb-4">Tentang Campaign</h3>
                    <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                      {isDescExpanded || !isLongDesc ? descText : descText.slice(0, 220) + "..."}
                    </p>
                    {isLongDesc && (
                      <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 mt-3 transition-colors cursor-pointer">
                        <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", isDescExpanded && "rotate-180")} />
                        {isDescExpanded ? "Sembunyikan" : "Show more"}
                      </button>
                    )}
                  </div>

                  {/* Brief & Materi card */}
                  <button
                    onClick={openBrief}
                    className="w-full bg-white border border-neutral-200/60 rounded-[22px] shadow-sm hover:shadow-md hover:-translate-y-0.5 p-5 flex items-center gap-4 text-left transition-all duration-200 group cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center shrink-0 transition-colors duration-200">
                      <FileText className="w-5 h-5 text-violet-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-extrabold text-neutral-800">Brief &amp; Materi Clipping</div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        Penjelasan brand, narasi, aturan + logo, footage &amp; materi yang harus dipakai
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-violet-400 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                </div>

                {/* Right (4 cols) */}
                <div className="lg:col-span-4">
                  <div className="bg-white border border-neutral-200/60 rounded-[22px] p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-neutral-700">Budget Tersisa</span>
                      <span className="text-sm font-black text-neutral-900">{budgetRemaining}%</span>
                    </div>
                    <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${budgetRemaining}%`, background: "linear-gradient(90deg, #7c3aed, #4f46e5)" }} />
                    </div>
                    <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-neutral-100">
                      <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-3.5">
                        <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-2">Mulai Dibayar</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-black text-neutral-900">1.000 Views</span>
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-violet-100 text-violet-700 border border-violet-200 leading-none">CPM Awal</span>
                        </div>
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-3.5">
                        <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-2">Min Views · CPM Penuh</span>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-black text-neutral-900">{(job.targetViews || 10000).toLocaleString("id-ID")} Views</span>
                          <span className="px-1.5 py-0.5 rounded-md text-[9px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 leading-none">CPM Penuh</span>
                        </div>
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-3.5">
                        <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-2">CPM (Rate /1K Views)</span>
                        <span className="text-xs font-black text-neutral-900">{formatCurrency(job.ratePerThousandViews)}</span>
                      </div>
                      <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-3.5">
                        <span className="block text-[9px] font-black text-neutral-400 uppercase tracking-wide mb-2">Max Views per Video</span>
                        <span className="text-xs font-black text-neutral-900">{(job.targetViews ?? 500000).toLocaleString("id-ID")} Views</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Brief & Materi inline section ── */}
              {isBriefOpen && (
                <div ref={briefRef} className="rounded-[22px] border border-neutral-200/60 bg-white shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Brief header */}
                  <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-neutral-100">
                    <div>
                      <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wide mb-0.5">
                        Materi Clipping Campaigns:
                      </p>
                      <h3 className="text-base font-black text-neutral-900">{job.title}</h3>
                      <p className="text-xs text-neutral-400 mt-0.5 font-medium">
                        Dibuat pada{" "}
                        {new Date(job.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                    <button onClick={() => setIsBriefOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-500 transition-colors cursor-pointer shrink-0 mt-0.5">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Brief / Materi toggle */}
                  <div className="px-6 pt-5">
                    <div className="grid grid-cols-2 rounded-xl overflow-hidden border border-neutral-200/60 mb-5">
                      <button
                        onClick={() => setActiveBriefSection("brief")}
                        className={cn("py-2.5 text-xs font-bold transition-all cursor-pointer",
                          activeBriefSection === "brief" ? "bg-violet-600 text-white" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100")}
                      >
                        Brief
                      </button>
                      <button
                        onClick={() => setActiveBriefSection("materi")}
                        className={cn("py-2.5 text-xs font-bold transition-all cursor-pointer",
                          activeBriefSection === "materi" ? "bg-violet-600 text-white" : "bg-neutral-50 text-neutral-400 hover:bg-neutral-100")}
                      >
                        Materi
                      </button>
                    </div>
                  </div>

                  {/* ── Brief content ── */}
                  {activeBriefSection === "brief" && (
                    <div className="px-6 pb-6 space-y-5">
                      {/* Pill nav */}
                      <div className="flex flex-wrap gap-2">
                        {BRIEF_PILLS.map((pill) => (
                          <button key={pill} onClick={() => setActiveBriefPill(pill)}
                            className={cn("px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer",
                              activeBriefPill === pill ? "bg-violet-600 text-white shadow-sm shadow-violet-200" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200")}>
                            {pill}
                          </button>
                        ))}
                      </div>

                      {/* Aturan */}
                      {activeBriefPill === "Aturan" && (
                        <div className="space-y-4">
                          <SectionBox title="Aturan konten" badge={`${platforms.length} platform`}>
                            <FieldBox label="Platform yang diperbolehkan">
                              {platforms.length > 0 ? (
                                <div className="flex gap-2 flex-wrap">
                                  {platforms.map((p) => (
                                    <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200/40 rounded-xl text-xs font-bold text-neutral-700 capitalize">
                                      {p}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <BriefEmpty>Belum ditentukan UMKM.</BriefEmpty>
                              )}
                            </FieldBox>
                          </SectionBox>

                          <SectionBox title="Do's & Don'ts" badge={`${doList.length + dontList.length} aturan`}>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="bg-emerald-50/60 border border-emerald-200/50 rounded-2xl p-4 space-y-2.5">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-[10px] font-black text-emerald-700 uppercase tracking-wide">HAL YANG BOLEH DILAKUKAN</span>
                                </div>
                                <ul className="space-y-2">
                                  {doList.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-emerald-800 font-semibold leading-normal">
                                      <span className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="bg-rose-50/60 border border-rose-200/50 rounded-2xl p-4 space-y-2.5">
                                <div className="flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span className="text-[10px] font-black text-rose-700 uppercase tracking-wide">HAL YANG DILARANG</span>
                                </div>
                                <ul className="space-y-2">
                                  {dontList.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-[11px] text-rose-800 font-semibold leading-normal">
                                      <span className="w-1 h-1 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                                      {item}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </SectionBox>
                        </div>
                      )}

                      {/* Narasi — campaign_briefs.briefDetail */}
                      {activeBriefPill === "Narasi" && (
                        <div className="space-y-4">
                          <SectionBox title="Narasi & pesan" badge="Panduan">
                            <FieldBox label="Instruksi konten dari UMKM">
                              {job.contentInstruction ? (
                                <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-4 text-sm text-neutral-700 font-medium leading-relaxed whitespace-pre-line">
                                  {job.contentInstruction}
                                </div>
                              ) : (
                                <BriefEmpty>UMKM belum menuliskan instruksi konten.</BriefEmpty>
                              )}
                            </FieldBox>
                          </SectionBox>
                        </div>
                      )}

                      {/* Caption — campaign_briefs.cta */}
                      {activeBriefPill === "Caption" && (
                        <div className="space-y-4">
                          <SectionBox title="Caption & CTA" badge="Panduan">
                            <FieldBox label="Call to action yang disarankan">
                              {job.ctaInstruction ? (
                                <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-4 text-sm text-neutral-700 font-medium leading-relaxed whitespace-pre-line">
                                  {job.ctaInstruction}
                                </div>
                              ) : (
                                <BriefEmpty>UMKM belum menuliskan CTA.</BriefEmpty>
                              )}
                            </FieldBox>
                          </SectionBox>
                        </div>
                      )}

                      {/* Tentang */}
                      {activeBriefPill === "Tentang" && (
                        <div className="space-y-4">
                          <SectionBox title="Tentang brand" badge="Informasi">
                            <FieldBox label="Deskripsi produk">
                              {job.productDescription ? (
                                <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                                  {job.productDescription}
                                </p>
                              ) : (
                                <BriefEmpty>Belum diisi UMKM.</BriefEmpty>
                              )}
                            </FieldBox>
                            <FieldBox label="Objektif campaign">
                              {job.targetAudience ? (
                                <p className="text-sm text-neutral-700 font-medium leading-relaxed">
                                  {job.targetAudience}
                                </p>
                              ) : (
                                <BriefEmpty>Belum diisi UMKM.</BriefEmpty>
                              )}
                            </FieldBox>
                          </SectionBox>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Materi content ── */}
                  {activeBriefSection === "materi" && (
                    <div className="px-6 pb-6 space-y-4">
                      <div className="bg-neutral-50 border border-neutral-200/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-neutral-500 font-medium">
                        <Info className="w-4 h-4 shrink-0 text-neutral-400 mt-0.5" />
                        Penggunaan materi tidak wajib. Boleh pakai sebagian.
                      </div>

                      <div className="space-y-2.5">
                        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-wide">
                          Material links (logo, footage, foto produk, dll)
                        </p>
                        {materials.length > 0 ? (
                          materials.map((material) => (
                            <div key={material.id} className="flex items-center gap-3.5 border border-neutral-200/60 rounded-2xl p-4 hover:bg-neutral-50 transition-colors group">
                              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                                {material.kind === "link" ? <Globe className="w-4 h-4 text-neutral-500" /> : <FileText className="w-4 h-4 text-neutral-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-neutral-800 truncate">{material.label}</div>
                              </div>
                              <a
                                href={material.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-700 text-white text-xs font-bold shrink-0 transition-colors cursor-pointer"
                              >
                                {material.kind === "link" ? <><ExternalLink className="w-3 h-3" /> Buka</> : <><ChevronDown className="w-3 h-3 rotate-180" /> Unduh</>}
                              </a>
                            </div>
                          ))
                        ) : (
                          <BriefEmpty>UMKM belum melampirkan materi apa pun.</BriefEmpty>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Video Kamu tab ── */}
          {activeTab === "video" && (
            <div className="bg-white border border-neutral-200/60 rounded-[22px] shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h3 className="text-sm font-extrabold text-neutral-800">Video Kamu</h3>
                <button className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-800 border border-neutral-200 hover:border-neutral-300 rounded-xl px-3.5 py-2 transition-all duration-200 cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Refresh Views dalam <strong className="text-neutral-700 font-black">{formatCountdown()}</strong></span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex border-b border-neutral-100 overflow-x-auto px-5">
                {VIDEO_SUB_TABS.map((tab) => (
                  <button key={tab} onClick={() => setActiveVideoTab(tab)}
                    className={cn("py-3.5 px-3 text-xs font-bold border-b-2 whitespace-nowrap transition-all duration-200 cursor-pointer",
                      activeVideoTab === tab ? "border-violet-500 text-violet-600" : "border-transparent text-neutral-400 hover:text-neutral-600")}>
                    {tab}
                  </button>
                ))}
              </div>
              <div className="px-5 py-3 border-b border-neutral-50">
                <button className="inline-flex items-center gap-2 text-xs font-bold text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-700 rounded-xl px-3.5 py-2 transition-all duration-200 cursor-pointer">
                  Urutkan dari <AlignLeft className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="py-16 text-center">
                <p className="text-sm text-neutral-400 font-medium">Join campaign dulu untuk mulai submit video.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ CLAIM MODAL ═══ */}
      <DashboardModal
        isOpen={isClaimOpen && !!job}
        title="Klaim Campaign Ini?"
        description={job.title}
        onClose={() => setIsClaimOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsClaimOpen(false)} disabled={isClaiming} fullWidthOnMobile>Batal</DashboardButton>
            <button type="button" onClick={handleClaimSubmit} disabled={!allChecked || isClaiming}
              className={cn("flex-1 sm:flex-none py-2.5 px-5 font-bold text-xs rounded-full border transition-all cursor-pointer",
                !allChecked || isClaiming ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed" : "text-white border-transparent hover:-translate-y-0.5 active:translate-y-0")}
              style={allChecked && !isClaiming ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 4px 14px rgba(124,58,237,.30)" } : undefined}>
              {isClaiming ? "Memproses…" : "Klaim Sekarang"}
            </button>
          </div>
        }
      >
        <div className="space-y-4 text-xs font-semibold text-neutral-700">
          <p className="text-neutral-500 leading-relaxed font-medium">Harap centang persetujuan di bawah sebelum mengambil kontrak pekerjaan:</p>
          <div className="space-y-3 pt-2">
            {([
              { key: "brief", text: "Saya mengerti video review produk harus mematuhi do's & don'ts yang tertera pada brief." },
              { key: "privacy", text: "Saya akan menayangkan video di akun sosial media pribadi saya dan melampirkan link URL postingan tayang tersebut." },
              { key: "retention", text: "Saya setuju tidak menghapus postingan video selama minimal 30 hari sejak bukti tayang diajukan." },
              { key: "views", text: "Saya mengerti pembayaran reward dihitung secara proporsional berdasarkan views tayangan valid." },
            ] as const).map(({ key, text }) => (
              <label key={key} className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={isRulesChecked[key]}
                  onChange={(e) => setIsRulesChecked({ ...isRulesChecked, [key]: e.target.checked })}
                  className="mt-0.5 rounded border-neutral-300 text-violet-600 focus:ring-violet-500/20 w-4 h-4 cursor-pointer" />
                <span className="leading-relaxed">{text}</span>
              </label>
            ))}
          </div>
        </div>
      </DashboardModal>

      {/* ═══ SUCCESS MODAL ═══ */}
      <DashboardModal
        isOpen={isSuccessOpen}
        title="Campaign Berhasil Diklaim"
        description="Pekerjaan ini telah ditambahkan ke dashboard pengerjaan Anda. Silakan persiapkan video Anda sesuai brief."
        onClose={() => setIsSuccessOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsSuccessOpen(false)} fullWidthOnMobile>Tutup</DashboardButton>
            <DashboardButton type="button" variant="primary" onClick={() => { window.location.href = "/dashboard/kreator/pekerjaan-aktif"; }} fullWidthOnMobile>Lihat Pekerjaan Aktif</DashboardButton>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mx-auto mb-2 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </DashboardModal>
    </div>
  );
}

// ── Shared sub-components for brief sections ──

function SectionBox({ title, badge, children }: { title: string; badge?: string; children: React.ReactNode }) {
  return (
    <div className="border border-neutral-200/60 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-neutral-50 border-b border-neutral-200/40">
        <h4 className="text-xs font-black text-neutral-800">{title}</h4>
        {badge && <span className="text-[10px] font-bold text-neutral-400">{badge}</span>}
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wide block">{label}</label>
      {children}
    </div>
  );
}
