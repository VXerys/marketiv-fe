"use client";

import { useState } from "react";
import Link from "next/link";
import { CreatorActiveWork } from "@/types/creator-dashboard";
import Image from "next/image";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { DashboardCard, DashboardBadge, DashboardModal, DashboardButton, DashboardStateCard } from "@/components/features/dashboard/shared";

interface ActiveWorkDetailViewProps {
  work: CreatorActiveWork | null;
  onRetry?: () => void;
}

export function ActiveWorkDetailView({ work: initialWork, onRetry }: ActiveWorkDetailViewProps) {
  const [work, setWork] = useState<CreatorActiveWork | null>(initialWork);

  // Slicing State Simulators (DoD)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  // Form states
  const [platform, setPlatform] = useState<"tiktok" | "instagram">("tiktok");
  const [contentUrl, setContentUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Modals & Progress
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSubStatusLabel = (w: CreatorActiveWork): string => {
    if (w.submissionStatus) {
      if (w.submissionStatus === "Pending") return "Menunggu Validasi";
      if (w.submissionStatus === "Valid") return "Valid";
      if (w.submissionStatus === "Fraud") return "Fraud";
      if (w.submissionStatus === "Dispute") return "Dispute";
      if (w.submissionStatus === "Rejected") return "Rejected";
    }
    if (w.status === "Selesai") return "Selesai";
    return "Belum Submit";
  };

  const validateUrl = (url: string, plat: "tiktok" | "instagram"): boolean => {
    const trimmed = url.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      setValidationError("URL wajib diawali dengan http:// atau https://");
      return false;
    }

    const lower = trimmed.toLowerCase();
    if (plat === "tiktok" && !lower.includes("tiktok.com")) {
      setValidationError("Format URL salah. URL wajib memuat domain 'tiktok.com' untuk platform TikTok.");
      return false;
    }
    if (plat === "instagram" && !lower.includes("instagram.com")) {
      setValidationError("Format URL salah. URL wajib memuat domain 'instagram.com' untuk platform Instagram Reels.");
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUrl(contentUrl, platform)) return;
    setIsConfirmOpen(true);
  };

  const executeSubmit = () => {
    setIsConfirmOpen(false);
    setIsSubmitting(true);

    // Simulate network delay for premium feel
    setTimeout(() => {
      setIsSubmitting(false);
      setWork(prev => {
        if (!prev) return null;
        return {
          ...prev,
          contentUrl: contentUrl.trim(),
          platform: platform,
          submissionStatus: "Pending",
          submittedAt: new Date().toISOString(),
          notes: notes.trim(),
        };
      });
      setIsSuccessOpen(true);
    }, 1000);
  };

  // State Error Simulator
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
          description="Simulator error diaktifkan pada Halaman Detail Pekerjaan."
          actionLabel="Coba Lagi"
          onAction={() => {
            setIsErrorSimulated(false);
            showToast("Berhasil memulihkan dari state error!");
            if (onRetry) onRetry();
          }}
        />
      </div>
    );
  }

  // Not Found state
  if (!work) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[70vh]">
        <DashboardStateCard
          kind="empty"
          title="Pekerjaan tidak ditemukan"
          description="ID pekerjaan yang Anda cari tidak terdaftar atau telah dibatalkan."
          actionLabel="Kembali ke Pekerjaan Aktif"
          onAction={() => { window.location.href = '/dashboard/kreator/pekerjaan-aktif'; }}
        />
      </div>
    );
  }

  const statusLabel = getSubStatusLabel(work);
  const isSubmitted = !!work.contentUrl;

  // Estimate Views and Earnings
  const dummyViews = work.actualViews || (isSubmitted ? 12500 : 0);
  const earningsEstimate = work.earnings || (work.ratePerThousandViews * dummyViews) / 1000;

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
          <span>Panel Simulator State (Submit Bukti Slicing):</span>
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
            onClick={() => setIsErrorSimulated(true)}
            className="px-3.5 py-1.5 bg-white text-red-600 border border-red-200 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
          >
            Simulasi Error
          </button>
        </div>
      </div>

      {isLoadingSimulated ? (
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-neutral-200 rounded w-24 mb-4"></div>
          <div className="h-24 bg-white border border-neutral-200/50 rounded-3xl p-6 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-44 bg-white border rounded-3xl p-6"></div>
              <div className="h-64 bg-white border rounded-3xl p-6"></div>
            </div>
            <div className="space-y-6">
              <div className="h-40 bg-white border rounded-3xl p-6"></div>
              <div className="h-52 bg-white border rounded-3xl p-6"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl">
          {/* Back Button */}
          <Link
            href="/dashboard/kreator/pekerjaan-aktif"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-500 hover:text-primary transition-colors mb-6 group cursor-pointer"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Pekerjaan Aktif</span>
          </Link>

          {/* Work Header */}
          <DashboardCard padding="lg" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-14 h-14 rounded-xl border border-neutral-200/30 overflow-hidden shrink-0 bg-neutral-50">
                {work.brandAvatar ? (
                  <Image
                    src={work.brandAvatar}
                    alt={work.brandName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-neutral-400">B</div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight truncate">
                  {work.title}
                </h2>
                <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                  {work.brandName}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <DashboardBadge
                type="status"
                value={statusLabel === 'Menunggu Validasi' ? 'pending' : statusLabel === 'Valid' ? 'valid' : statusLabel === 'Fraud' ? 'fraud' : statusLabel === 'Selesai' ? 'completed' : statusLabel === 'Belum Submit' ? 'open' : 'pending'}
                size="sm"
              />
            </div>
          </DashboardCard>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Pane (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Brief Summary */}
              <DashboardCard padding="lg" className="space-y-6">
                <h3 className="font-extrabold text-neutral-900 text-sm border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Brief Kampanye &amp; Detail Aset
                </h3>

                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Instruksi Pengerjaan</h4>
                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                    {work.brief}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/20 text-center">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Rate 1k Views</span>
                    <span className="block text-xs font-black text-neutral-900 mt-1">{formatCurrency(work.ratePerThousandViews)}</span>
                  </div>
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/20 text-center">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Tanggal Klaim</span>
                    <span className="block text-xs font-black text-neutral-900 mt-1">
                      {new Date(work.claimedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/20 text-center">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Batas Waktu</span>
                    <span className="block text-xs font-black text-red-600 mt-1">
                      {new Date(work.deadline).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/20 text-center">
                    <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Bukti Tayang</span>
                    <span className="block text-[10px] font-black text-indigo-700 mt-1 uppercase">URL PUBLIK</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-50 p-4 rounded-2xl border border-neutral-200/30">
                  <div className="text-center sm:text-left">
                    <h5 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wider">Materi Pendukung &amp; Logo Brand</h5>
                    <p className="text-[11px] text-neutral-400 font-semibold mt-0.5">Silakan unduh aset video raw atau referensi foto di Drive.</p>
                  </div>
                  <a
                    href="https://drive.google.com/drive/folders/mock-assets"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-xs rounded-xl shadow transition-all shrink-0 cursor-pointer"
                  >
                    Buka Aset Drive
                  </a>
                </div>
              </DashboardCard>

              {/* Submit Form (Only if not submitted) */}
              {!isSubmitted ? (
                <DashboardCard padding="lg" className="space-y-6">
                  <div>
                    <h3 className="font-extrabold text-neutral-900 text-sm border-b border-neutral-100 pb-3 uppercase tracking-wider">
                      Submit Bukti Tayang (Link URL)
                    </h3>
                    <p className="text-xs text-neutral-400 font-bold mt-1.5">
                      PASTIKAN VIDEO SUDAH DI-POSTING DI AKUN TIKTOK ATAU INSTAGRAM REELS ANDA TERLEBIH DAHULU.
                    </p>
                  </div>

                  {validationError && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start gap-3 text-red-800 text-xs font-bold leading-relaxed shadow-sm">
                      <svg className="w-4.5 h-4.5 shrink-0 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>{validationError}</span>
                    </div>
                  )}

                  <form onSubmit={handlePreSubmit} className="space-y-5">
                    {/* Platform Selector */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                        Pilih Platform Penayangan
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => {
                            setPlatform("tiktok");
                            setValidationError(null);
                          }}
                          className={cn(
                            "py-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer",
                            platform === "tiktok"
                              ? "bg-neutral-950 text-white border-neutral-950 shadow-md"
                              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          <span>TikTok Video</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlatform("instagram");
                            setValidationError(null);
                          }}
                          className={cn(
                            "py-3.5 rounded-2xl border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer",
                            platform === "instagram"
                              ? "bg-neutral-950 text-white border-neutral-950 shadow-md"
                              : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
                          )}
                        >
                          <span>Instagram Reels</span>
                        </button>
                      </div>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                        Tautan Link URL Postingan Publik
                      </label>
                      <input
                        type="url"
                        required
                        placeholder={
                          platform === "tiktok"
                            ? "https://www.tiktok.com/@username/video/12345678"
                            : "https://www.instagram.com/reel/CtO12345/"
                        }
                        value={contentUrl}
                        onChange={(e) => {
                          setContentUrl(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 placeholder-neutral-400"
                      />
                      <span className="block text-[10px] text-neutral-400 font-bold leading-relaxed">
                        ⚠️ **Sistem Campaign Mode:** Dilarang mengunggah video final langsung ke platform Marketiv. Cukup masukkan tautan URL video publik Anda di atas.
                      </span>
                    </div>

                    {/* Optional Note */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-neutral-400 uppercase tracking-wider">
                        Catatan Tambahan untuk Admin / UMKM (Opsional)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Contoh: Video sudah ditayangkan menggunakan hashtag brand..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold text-neutral-800 placeholder-neutral-400 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 text-center bg-primary hover:bg-primary-600 text-white font-black text-sm rounded-full transition-all border border-primary-600/10 shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      Kirim Bukti Postingan
                    </button>
                  </form>
                </DashboardCard>
              ) : (
                /* URL Preview details if submitted */
                <div className="space-y-6">
                  {/* Submitted Content Preview Card */}
                  <DashboardCard padding="lg" className="space-y-5">
                    <h3 className="font-extrabold text-neutral-900 text-sm border-b border-neutral-100 pb-3 uppercase tracking-wider">
                      Detail Bukti Tayang Diajukan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Platform</span>
                        <span className="block text-xs font-black text-neutral-900 mt-1 uppercase">
                          📱 {work.platform || "tiktok"}
                        </span>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 col-span-2">
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Postingan Video URL</span>
                        <a
                          href={work.contentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-xs font-black text-primary mt-1 truncate hover:underline"
                        >
                          {work.contentUrl}
                        </a>
                      </div>
                    </div>

                    {work.notes && (
                      <div className="space-y-1 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Catatan Pengiriman</span>
                        <p className="text-xs text-neutral-600 font-semibold">{work.notes}</p>
                      </div>
                    )}

                    {work.submissionStatus === "Fraud" && work.rejectedReason && (
                      <div className="bg-red-50 border border-red-150 p-4 rounded-2xl text-xs font-bold text-red-800 space-y-1">
                        <span className="block text-[9px] uppercase tracking-wider text-red-500">Alasan Penolakan Audit / Sengketa:</span>
                        <p className="leading-relaxed">{work.rejectedReason}</p>
                      </div>
                    )}
                  </DashboardCard>

                  {/* Estimation Card */}
                  <DashboardCard padding="lg" className="space-y-6">
                    <h3 className="font-extrabold text-neutral-900 text-sm border-b border-neutral-100 pb-3 uppercase tracking-wider">
                      Estimasi &amp; Data Views Tayangan
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Jumlah Views Tayangan</span>
                        <span className="block text-lg font-black text-neutral-900 mt-1">
                          {dummyViews.toLocaleString("id-ID")}
                        </span>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 text-center">
                        <span className="block text-[8px] font-bold text-neutral-400 uppercase tracking-wider">Rate per 1k views</span>
                        <span className="block text-lg font-black text-neutral-900 mt-1">
                          {formatCurrency(work.ratePerThousandViews)}
                        </span>
                      </div>
                      <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100 text-center">
                        <span className="block text-[8px] font-bold text-indigo-500 uppercase tracking-wider">Total Reward Cair</span>
                        <span className="block text-lg font-black text-indigo-950 mt-1">
                          {formatCurrency(earningsEstimate)}
                        </span>
                      </div>
                    </div>

                    <div className="bg-indigo-50/20 border border-indigo-100 rounded-2xl p-4 text-[11px] text-indigo-950 font-bold leading-normal">
                      💡 Dana reward dihitung berkala berdasarkan data views video Anda di sosial media yang disinkronkan oleh sistem audit admin Marketiv.
                    </div>
                  </DashboardCard>
                </div>
              )}

            </div>

            {/* Right Pane (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Timeline tracking */}
              <DashboardCard padding="md" className="space-y-6">
                <h4 className="font-extrabold text-neutral-900 text-xs border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Timeline Progres Bukti
                </h4>

                <div className="relative pl-6 space-y-6 text-xs">
                  {/* Vertical line indicator */}
                  <div className="absolute left-2.5 top-1.5 bottom-1.5 w-0.5 bg-neutral-200"></div>

                  {/* Step 1: Claimed */}
                  <div className="relative">
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-green-500 border-4 border-white flex items-center justify-center shadow-sm"></div>
                    <div>
                      <h5 className="font-extrabold text-neutral-900 leading-tight">Kampanye Di-klaim</h5>
                      <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
                        {new Date(work.claimedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Submitted */}
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute -left-6 top-0.5 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                        isSubmitted ? "bg-green-500" : "bg-neutral-300"
                      )}
                    ></div>
                    <div>
                      <h5 className="font-extrabold text-neutral-900 leading-tight">Bukti Video Di-submit</h5>
                      <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
                        {work.submittedAt
                          ? new Date(work.submittedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                          : "Belum diserahkan"}
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Audit Validation */}
                  <div className="relative">
                    <div
                      className={cn(
                        "absolute -left-6 top-0.5 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                        statusLabel === "Valid" || statusLabel === "Selesai"
                          ? "bg-green-500"
                          : statusLabel === "Fraud" || statusLabel === "Dispute" || statusLabel === "Rejected"
                          ? "bg-red-500"
                          : statusLabel === "Menunggu Validasi"
                          ? "bg-amber-500"
                          : "bg-neutral-300"
                      )}
                    ></div>
                    <div>
                      <h5 className="font-extrabold text-neutral-900 leading-tight">Audit Validasi Admin</h5>
                      <p className="text-[10px] text-neutral-400 font-bold mt-0.5">
                        {statusLabel === "Valid" || statusLabel === "Selesai"
                          ? "Disetujui. Dana cair"
                          : statusLabel === "Fraud"
                          ? "Ditolak / Fraud Terdeteksi"
                          : statusLabel === "Dispute"
                          ? "Dalam persengketaan views"
                          : statusLabel === "Menunggu Validasi"
                          ? "Sedang diaudit berkala"
                          : "Menunggu bukti tayang"}
                      </p>
                    </div>
                  </div>
                </div>
              </DashboardCard>

              {/* Campaign Mode Domain Rule Notification */}
              <div className="bg-indigo-50/20 border border-indigo-200/30 rounded-3xl p-6 space-y-4">
                <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <span>ℹ️ Standar Campaign Mode</span>
                </h4>
                <ul className="space-y-2 text-[10px] text-indigo-950 font-bold leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span>&bull;</span>
                    <span>Modul chat komunikasi ditiadakan demi efisiensi pengerjaan.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span>&bull;</span>
                    <span>Audit views disinkronisasikan langsung melalui API publik media sosial.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span>&bull;</span>
                    <span>Pertanyaan kendala teknis dapat diajukan langsung kepada Admin via menu support.</span>
                  </li>
                </ul>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <DashboardModal
        isOpen={isConfirmOpen}
        title="Konfirmasi Pengiriman Bukti"
        description={`Yakin ingin mengirim URL ${platform === 'tiktok' ? 'TikTok' : 'Instagram Reels'} berikut sebagai bukti tayang?`}
        onClose={() => setIsConfirmOpen(false)}
        confirmLabel="Ya, Kirim Bukti"
        cancelLabel="Cek Ulang URL"
        onConfirm={executeSubmit}
      >
        <div className="mt-3 bg-neutral-50 border border-neutral-200 rounded-2xl p-4 break-all text-xs font-semibold text-primary">
          {contentUrl}
        </div>
      </DashboardModal>

      {/* Success Modal */}
      <DashboardModal
        isOpen={isSuccessOpen}
        title="Bukti Tayang Berhasil Dikirim!"
        description="Bukti tayang Anda sedang diverifikasi oleh admin. Anda akan mendapat notifikasi setelah proses selesai."
        onClose={() => setIsSuccessOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsSuccessOpen(false)} fullWidthOnMobile>Tutup</DashboardButton>
            <DashboardButton type="button" variant="primary" onClick={() => { window.location.href = '/dashboard/kreator/pekerjaan-aktif'; }} fullWidthOnMobile>Kembali ke List</DashboardButton>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mx-auto mb-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </DashboardModal>

      {/* Loading overlay during simulation */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-neutral-900/30 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-2xl shadow-xl flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-xs font-bold text-neutral-700">Mengirim tautan bukti posting...</span>
          </div>
        </div>
      )}
    </div>
  );
}
