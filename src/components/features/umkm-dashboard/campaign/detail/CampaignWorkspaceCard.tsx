"use client";

import { useState } from "react";
import { Campaign, CampaignSubmission } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardButton } from "../../shared";

interface CampaignWorkspaceCardProps {
  campaign: Campaign;
  submissions: CampaignSubmission[];
}

export function CampaignWorkspaceCard({ campaign, submissions }: CampaignWorkspaceCardProps) {
  const [activeTab, setActiveTab] = useState<"brief" | "assets" | "performance">("brief");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(campaign.externalAssetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Performance Tab Data Logic
  const averageViews =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((sum, s) => sum + s.actualViews, 0) / submissions.length
        )
      : 0;

  const bestSubmission =
    submissions.length > 0
      ? [...submissions].sort((a, b) => b.actualViews - a.actualViews)[0]
      : null;

  /**
   * Estimasi views diturunkan dari anggaran dan tarifnya, bukan dari angka
   * ajaib. Sebelumnya `creatorQuota * 15000` — 15000 tidak berasal dari kolom
   * mana pun; ia fabrikasi yang sama yang sudah dibuang dari CampaignDetailPage
   * dan reviewSubmission, tapi selamat di sini.
   *
   * `null` saat tarifnya belum diisi, supaya UI menampilkan "—" alih-alih
   * angka yang dikarang dari pembagian nol.
   */
  const estimatedViews =
    campaign.pricePerThousandViews > 0
      ? Math.floor((campaign.totalBudgetEscrow / campaign.pricePerThousandViews) * 1000)
      : null;

  // Tabs configuration
  const workspaceTabs = [
    { id: "brief" as const, label: "Detail Brief", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )},
    { id: "assets" as const, label: "Bahan Konten", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
    )},
    { id: "performance" as const, label: "Analitik Performa", icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )},
  ];

  return (
    <div className="panel overflow-hidden">
      {/* Dynamic Tab Switch Header */}
      <div className="p-4 border-b border-border-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/40">
        <div className="flex flex-wrap bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-border-soft w-full sm:w-auto">
          {workspaceTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-text-muted hover:text-text-secondary hover:bg-neutral-50"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[10px] font-extrabold text-primary bg-primary-soft/10 px-3 py-1.5 rounded-xl self-start sm:self-center uppercase tracking-wider border border-primary-100/30">
          Campaign Workspace
        </span>
      </div>

      <div className="p-6">
        
        {/* Tab 1: Brief Details */}
        {activeTab === "brief" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Brief Guidelines */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
                    Brief & Panduan Konten
                  </span>
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-line bg-neutral-50/50 p-4 rounded-xl border border-border-soft/60 max-h-[170px] overflow-y-auto shadow-inner">
                    {campaign.brief}
                  </p>
                </div>

                {/* Warning Note */}
                <div className="bg-primary-50 text-primary border border-primary-100/60 rounded-xl p-3.5 flex gap-2.5 text-[11px] leading-normal">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-extrabold block mb-0.5">Panduan Produksi Konten</span>
                    Brief ini merupakan acuan resmi kreator. Perubahan brief tidak dapat dilakukan setelah status aktif.
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Target & Klasifikasi
                </span>
                
                <div className="grid grid-cols-2 gap-3.5 bg-neutral-50/40 p-4 rounded-xl border border-border-soft/60 h-full">
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Niche Kategori
                    </span>
                    <span className="text-xs font-bold text-text-primary capitalize truncate">
                      {campaign.niche}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Bayaran / 1K Views
                    </span>
                    <span className="text-xs font-bold text-primary truncate">
                      {formatCurrency(campaign.pricePerThousandViews)}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Kuota Kreator
                    </span>
                    <span className="text-xs font-bold text-text-primary truncate">
                      {campaign.creatorQuota} Slot
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Estimasi Target Views
                    </span>
                    <span className="text-xs font-bold text-text-primary truncate">
                      {estimatedViews !== null ? `${formatCompactNumber(estimatedViews)} Views` : "—"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Assets Media */}
        {activeTab === "assets" && (
          <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300 max-w-2xl mx-auto py-2">
            <div>
              <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
                Aset Mentah / Media Produk
              </span>
              
              {/* Copyable link input */}
              <div className="flex items-center gap-2.5 mb-3 min-w-0">
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none min-w-0 truncate font-mono"
                  value={campaign.externalAssetUrl}
                  readOnly
                />
                <DashboardButton
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-[38px] px-4 shrink-0 text-xs font-extrabold"
                >
                  {copied ? "Tersalin!" : "Salin Link"}
                </DashboardButton>
              </div>

              {/* Direct Open Button */}
              <DashboardButton
                variant="primary"
                size="md"
                href={campaign.externalAssetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-10 flex items-center justify-center gap-2 text-xs font-bold"
              >
                <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Buka Tautan Aset Eksternal</span>
              </DashboardButton>
            </div>

            {/* Warning Banner */}
            <div className="bg-warning-soft text-warning-strong border border-warning-soft/60 rounded-xl p-3.5 flex gap-2.5 text-[11px] leading-normal">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="min-w-0">
                <span className="font-extrabold block mb-0.5">Konsep Berbagi Aset</span>
                Marketiv hanya menyimpan link aset eksternal (Google Drive/Dropbox). Video bahan mentah tidak disimpan langsung di server Marketiv untuk menjaga efisiensi space.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Performance Analytics */}
        {activeTab === "performance" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex flex-row items-center justify-between border-b border-border-soft/60 pb-3">
              <div>
                <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Analitik Kinerja
                </span>
                <span className="text-[10px] text-text-muted mt-0.5 block">
                  Ringkasan performa dari submission yang sudah masuk.
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-700 text-[.7rem] font-[800] tracking-tight uppercase shrink-0">
                Segera Hadir
              </span>
            </div>

            {/*
              Grafik tren harian dibuang, bukan disembunyikan di balik flag.
              Isinya tujuh baris angka hardcode ("Senin 12000, Selasa 18000, …")
              yang sama untuk SETIAP campaign — tidak ada sumber datanya:
              `campaign_submissions` hanya menyimpan `views` kumulatif per
              submission, tanpa dimensi waktu. Sejalan dengan s1-analytics-soon,
              yang lebih dulu menandai halaman Analitik sebagai "Segera Hadir".

              Tiga kartu di bawah TETAP: ketiganya dihitung dari submission dan
              budget yang nyata.
            */}
            <div className="rounded-xl border border-dashed border-border-soft bg-neutral-50/40 p-5 text-center">
              <span className="block text-xs font-extrabold text-text-secondary">
                Tren harian belum tersedia
              </span>
              <span className="block text-[10px] text-text-muted font-semibold mt-1 leading-relaxed">
                Submission baru mencatat total views, belum per tanggal. Grafik aktif setelah
                pipeline data campaign siap.
              </span>
            </div>

            {/* Analytics Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold text-text-secondary">
              <div className="bg-neutral-50/50 p-4 rounded-xl border border-border-soft/60 min-w-0 shadow-2xs hover:bg-neutral-50 transition-colors">
                <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate font-extrabold">
                  Rata-rata Views / Kreator
                </span>
                <span className="text-sm font-extrabold text-text-primary block truncate">
                  {formatCompactNumber(averageViews)} Views
                </span>
              </div>

              <div className="bg-neutral-50/50 p-4 rounded-xl border border-border-soft/60 min-w-0 shadow-2xs hover:bg-neutral-50 transition-colors">
                <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate font-extrabold">
                  Konten Performa Terbaik
                </span>
                <span className="text-sm font-extrabold text-primary truncate block">
                  {bestSubmission ? bestSubmission.creatorName : "Belum ada"}
                </span>
                {bestSubmission && (
                  <span className="text-[9px] text-text-muted block mt-0.5 font-bold truncate">
                    {formatCompactNumber(bestSubmission.actualViews)} Views
                  </span>
                )}
              </div>

              <div className="bg-neutral-50/50 p-4 rounded-xl border border-border-soft/60 min-w-0 shadow-2xs hover:bg-neutral-50 transition-colors">
                <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate font-extrabold">
                  Sisa Budget Escrow
                </span>
                <span className="text-sm font-extrabold text-success block truncate">
                  {formatCurrency(campaign.totalBudgetEscrow - campaign.usedBudget)}
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
