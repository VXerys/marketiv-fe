"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CreatorJob } from "@/types/creator-dashboard";
import { cn } from "@/lib/utils";
import {
  DashboardCard,
  DashboardMetricCard,
  DashboardBadge,
  DashboardProgress,
  DashboardModal,
  DashboardButton,
  DashboardStateCard,
} from "@/components/features/dashboard/shared";

interface JobDetailViewProps {
  job: CreatorJob | null;
  onRetry?: () => void;
}

export function JobDetailView({ job: initialJob, onRetry }: JobDetailViewProps) {
  const [job, setJob] = useState<CreatorJob | null>(initialJob);

  // States for loaders and simulated errors (for QA review)
  const [isLoadingSimulated, setIsLoadingSimulated] = useState(false);
  const [isErrorSimulated, setIsErrorSimulated] = useState(false);

  // Claim modals
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isRulesChecked, setIsRulesChecked] = useState({
    brief: false,
    privacy: false,
    retention: false,
    views: false,
  });

  const handleClaimSubmit = () => {
    if (!job) return;
    
    // Simulate updating job quota locally
    setJob(prev => prev ? { ...prev, usedQuota: prev.usedQuota + 1 } : null);
    
    setIsClaimOpen(false);
    setIsSuccessOpen(true);
  };

  // State simulators render
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
          description="Simulator error diaktifkan pada Halaman Detail."
          actionLabel="Coba Lagi"
          onAction={() => {
            setIsErrorSimulated(false);
            if (onRetry) onRetry();
          }}
        />
      </div>
    );
  }

  // Not Found state
  if (!job) {
    return (
      <div className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col justify-center items-center min-h-[70vh]">
        <DashboardStateCard
          kind="empty"
          title="Kampanye tidak ditemukan"
          description="ID kampanye yang Anda masukkan tidak valid atau kampanye telah dihapus oleh pengiklan UMKM."
          actionLabel="Kembali ke Job Pool"
          onAction={() => { window.location.href = '/dashboard/kreator/job-pool'; }}
        />
      </div>
    );
  }

  const isFull = job.usedQuota >= job.quota;
  const isNearLimit = job.quota - job.usedQuota <= 1 && !isFull;
  const percentQuotaUsed = Math.round((job.usedQuota / job.quota) * 100);

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
      {/* Simulator Control Panel */}
      <div className="mb-6 bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.01)] text-xs font-bold text-neutral-700 shrink-0">
        <div className="flex items-center gap-2 text-neutral-900">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-ping"></span>
          <span>Panel Simulator State (Detail Slicing):</span>
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
          <div className="h-6 bg-neutral-200 rounded w-16 mb-4"></div>
          <div className="h-20 bg-white border border-neutral-200/50 rounded-3xl p-6 mb-6"></div>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 h-24 bg-neutral-200/10 rounded-2xl p-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-2 h-96 bg-white border rounded-3xl p-6"></div>
            <div className="h-72 bg-white border rounded-3xl p-6"></div>
          </div>
        </div>
      ) : (
        <div className="max-w-6xl">
          {/* 1. Back button */}
          <Link
            href="/dashboard/kreator/job-pool"
            className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-500 hover:text-primary transition-colors mb-6 group cursor-pointer"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Kembali ke Job Pool</span>
          </Link>

          {/* 2. Campaign Header */}
          <DashboardCard padding="lg" className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8">
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-16 h-16 rounded-2xl border border-neutral-200/40 overflow-hidden shrink-0 bg-neutral-50">
                {job.brandAvatar ? (
                  <Image
                    src={job.brandAvatar}
                    alt={job.brandName}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-neutral-400">B</div>
                )}
              </div>
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-neutral-900 leading-tight truncate">
                  {job.title}
                </h2>
                <p className="text-xs font-bold text-neutral-400 mt-1 uppercase tracking-wider">
                  {job.brandName}
                </p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              <DashboardBadge type="status" value={isFull ? 'full' : isNearLimit ? 'pending' : 'active'} size="sm" />
              <DashboardBadge type="category" value={job.niche} size="sm" />
            </div>
          </DashboardCard>

          {/* 3. Metric Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
            <DashboardMetricCard label="Rate / 1k Views" value={job.ratePerThousandViews} currency="compact" />
            <DashboardMetricCard label="Budget Escrow" value={job.totalBudget} currency="compact" />
            <DashboardMetricCard label="Target Views" value={(job.targetViews || 50000).toLocaleString('id-ID')} />
            <DashboardMetricCard label="Batas Waktu" value={new Date(job.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} />
            <DashboardMetricCard label="Kuota Terisi" value={`${job.usedQuota} / ${job.quota}`} />
          </div>

          {/* Progress bar of quota */}
          <DashboardCard padding="sm" className="mb-8">
            <DashboardProgress
              value={job.usedQuota}
              max={job.quota}
              label="Progress Kuota Pendaftaran"
              valueLabel={`${percentQuotaUsed}%`}
              tone={isFull ? 'red' : isNearLimit ? 'yellow' : 'orange'}
            />
          </DashboardCard>

          {/* Grid Brief and Assets Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Content Pane (8 columns) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* 4. Brief Section */}
              <DashboardCard padding="lg" className="space-y-6">
                <h3 className="font-extrabold text-neutral-900 text-sm border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Brief Pekerjaan &amp; Produk
                </h3>

                {/* Product description */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Deskripsi Produk</h4>
                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                    {job.productDescription || "Deskripsi produk belum disediakan."}
                  </p>
                </div>

                {/* Content instruction */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Instruksi Konten Video</h4>
                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                    {job.contentInstruction || "Buat konten review video pendek yang menarik."}
                  </p>
                </div>

                {/* Do and Don't */}
                {job.doAndDont && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="bg-green-50/20 border border-green-200/30 p-4.5 rounded-2xl space-y-2.5">
                      <h5 className="text-[10px] font-black text-green-700 uppercase tracking-wider">✓ HAL YANG WAJIB DILAKUKAN (DO)</h5>
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-green-800 font-bold leading-normal">
                        {job.doAndDont.do.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-red-50/20 border border-red-200/30 p-4.5 rounded-2xl space-y-2.5">
                      <h5 className="text-[10px] font-black text-red-700 uppercase tracking-wider">✗ HAL YANG DILARANG (DON&apos;T)</h5>
                      <ul className="list-disc pl-4 space-y-1.5 text-[11px] text-red-800 font-bold leading-normal">
                        {job.doAndDont.dont.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Target Audience */}
                <div className="space-y-1.5 pt-2">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Target Audiens Pemirsa</h4>
                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                    {job.targetAudience || "Target audiens tidak ditentukan."}
                  </p>
                </div>

                {/* CTA Instruction */}
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Ajakan Bertindak (CTA Video)</h4>
                  <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                    {job.ctaInstruction || "Ajak penonton membeli produk brand UMKM."}
                  </p>
                </div>
              </DashboardCard>

            </div>

            {/* Right Pane (4 columns) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* 5. Asset Section */}
              <DashboardCard padding="md" className="space-y-5">
                <h4 className="font-extrabold text-neutral-900 text-xs border-b border-neutral-100 pb-3 uppercase tracking-wider">
                  Materi &amp; Aset Kreatif
                </h4>
                
                {job.thumbnailUrl && (
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-neutral-200/30">
                    <Image src={job.thumbnailUrl!} alt="Thumbnail Produk" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                  </div>
                )}

                {job.externalAssetUrl ? (
                  <div className="space-y-2">
                    <span className="block text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Aset Google Drive/Dropbox</span>
                    <a
                      href={job.externalAssetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full text-center bg-green-950 hover:bg-green-900 text-white font-extrabold text-xs py-3 rounded-xl transition-all shadow border border-green-600/10 cursor-pointer"
                    >
                      Buka Link Aset Materi
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 font-medium">Tidak ada aset eksternal terlampir.</p>
                )}
              </DashboardCard>

              {/* 6. Payment Rule Card */}
              <div className="bg-indigo-50/20 border border-indigo-200/30 rounded-3xl p-6 space-y-4">
                <h4 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wider flex items-center gap-1.5 leading-none">
                  <span>💳 Aturan Pembayaran Campaign</span>
                </h4>
                <ul className="space-y-2.5 text-[11px] text-indigo-950 font-bold leading-normal">
                  <li className="flex items-start gap-2">
                    <span>&bull;</span>
                    <span>Dana reward akan dirilis setelah bukti link tayang publik Anda tervalidasi oleh sistem.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>&bull;</span>
                    <span>Jumlah views video riil di platform sosial media (Instagram/TikTok) akan diverifikasi berkala.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>&bull;</span>
                    <span>Kreator **tidak perlu mengunggah video final** ke platform Marketiv. Cukup cantumkan URL postingan Anda saat mengajukan bukti kerja.</span>
                  </li>
                </ul>
              </div>

              {/* Claim Trigger Button */}
              <button
                disabled={isFull}
                onClick={() => {
                  setIsRulesChecked({
                    brief: false,
                    privacy: false,
                    retention: false,
                    views: false,
                  });
                  setIsClaimOpen(true);
                }}
                className={cn(
                  "w-full py-4 text-center font-black text-sm rounded-full transition-all border shadow-md cursor-pointer",
                  isFull
                    ? "bg-neutral-100 text-neutral-400 border-neutral-200 cursor-not-allowed shadow-none"
                    : "bg-primary hover:bg-primary-600 text-white border-primary-600/10 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                )}
              >
                {isFull ? "Kuota Kampanye Penuh" : "Klaim Kampanye Ini"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* Claim Modal (Checklist) */}
      <DashboardModal
        isOpen={isClaimOpen && !!job}
        title="Klaim Campaign Ini?"
        description={job?.title}
        onClose={() => setIsClaimOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsClaimOpen(false)} fullWidthOnMobile>Batal</DashboardButton>
            <DashboardButton type="button" variant="primary" onClick={handleClaimSubmit} disabled={!(isRulesChecked.brief && isRulesChecked.privacy && isRulesChecked.retention && isRulesChecked.views)} fullWidthOnMobile>Klaim Sekarang</DashboardButton>
          </div>
        }
      >
        <div className="space-y-4 text-xs font-semibold text-neutral-700">
          <p className="text-neutral-500 leading-relaxed font-medium">
            Harap centang persetujuan di bawah sebelum mengambil kontrak pekerjaan:
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
                Saya mengerti video review produk harus mematuhi do&apos;s &amp; don&apos;ts yang tertera pada brief.
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
                Saya akan menayangkan video di akun sosial media pribadi saya dan melampirkan link URL postingan tayang tersebut.
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
                Saya setuju tidak menghapus postingan video selama minimal 30 hari sejak bukti tayang diajukan.
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
                Saya mengerti pembayaran reward dihitung secara proporsional berdasarkan views tayangan valid.
              </span>
            </label>
          </div>
        </div>
      </DashboardModal>

      {/* Success Modal */}
      <DashboardModal
        isOpen={isSuccessOpen}
        title="Campaign Berhasil Diklaim"
        description="Pekerjaan ini telah ditambahkan ke dashboard pengerjaan Anda. Silakan persiapkan video Anda sesuai brief."
        onClose={() => setIsSuccessOpen(false)}
        footer={
          <div className="flex gap-3 w-full">
            <DashboardButton type="button" variant="outline" onClick={() => setIsSuccessOpen(false)} fullWidthOnMobile>Tutup</DashboardButton>
            <DashboardButton type="button" variant="primary" onClick={() => { window.location.href = '/dashboard/kreator/pekerjaan-aktif'; }} fullWidthOnMobile>Lihat Pekerjaan Aktif</DashboardButton>
          </div>
        }
      >
        <div className="flex flex-col items-center text-center pt-2">
          <div className="w-16 h-16 rounded-full bg-green-50 border border-green-100 flex items-center justify-center text-green-500 mx-auto mb-2 shadow-sm">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
      </DashboardModal>
    </div>
  );
}
