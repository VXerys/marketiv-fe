"use client";

import { useState } from "react";
import { Campaign, CampaignSubmission } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardButton } from "../../shared";
import { Copy, ExternalLink, FileText, FolderGit2, BarChart3, Info } from "lucide-react";

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

  const estimatedViews =
    campaign.pricePerThousandViews > 0
      ? Math.floor((campaign.totalBudgetEscrow / campaign.pricePerThousandViews) * 1000)
      : null;

  const workspaceTabs = [
    { id: "brief" as const, label: "Arahan Konten", icon: <FileText className="w-4 h-4 shrink-0" /> },
    { id: "assets" as const, label: "Foto & Video Produk", icon: <FolderGit2 className="w-4 h-4 shrink-0" /> },
    { id: "performance" as const, label: "Laporan Tayangan", icon: <BarChart3 className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white shadow-2xs overflow-hidden">
      {/* Dynamic Tab Switch Header */}
      <div className="p-4 border-b border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-50/50">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {workspaceTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-xs"
                    : "bg-white text-ink-700 hover:text-ink-950 hover:bg-neutral-100 border border-neutral-200/80"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-[11px] font-extrabold text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200/80 uppercase tracking-wide self-start sm:self-center">
          INFORMASI KAMPANYE
        </span>
      </div>

      <div className="p-5 sm:p-6">
        
        {/* Tab 1: Brief Details */}
        {activeTab === "brief" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Brief Guidelines */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <span className="block text-xs font-extrabold text-text-primary uppercase tracking-wide mb-2.5">
                    Arahan & Petunjuk untuk Kreator
                  </span>
                  <div className="text-xs sm:text-sm text-ink-950 font-medium leading-relaxed whitespace-pre-line bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 max-h-[220px] overflow-y-auto">
                    {campaign.brief || "Tidak ada arahan khusus. Kreator memposting konten sesuai informasi produk."}
                  </div>
                </div>

                {/* Warning Note */}
                <div className="bg-orange-50/80 text-orange-950 border border-orange-200/90 rounded-xl p-3.5 flex gap-3 text-xs leading-normal">
                  <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block mb-0.5">Panduan Pembuatan Konten</span>
                    Arahan ini menjadi acuan resmi bagi kreator saat membuat video. Petunjuk tidak dapat diubah setelah kampanye berjalan.
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                <span className="block text-xs font-extrabold text-text-primary uppercase tracking-wide">
                  Pengaturan Kampanye
                </span>
                
                <div className="grid grid-cols-2 gap-3.5 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60 h-full">
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Kategori Usaha
                    </span>
                    <span className="text-xs font-extrabold text-text-primary capitalize truncate">
                      {campaign.niche}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Bayaran / 1.000 Tayangan
                    </span>
                    <span className="text-xs font-extrabold text-orange-600 font-display truncate">
                      {formatCurrency(campaign.pricePerThousandViews)}
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Jumlah Kreator
                    </span>
                    <span className="text-xs font-extrabold text-text-primary truncate">
                      {campaign.creatorQuota} Kreator
                    </span>
                  </div>
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5 truncate">
                      Perkiraan Total Tayangan
                    </span>
                    <span className="text-xs font-extrabold text-emerald-700 font-display truncate">
                      {estimatedViews !== null ? `± ${formatCompactNumber(estimatedViews)} Tayangan` : "—"}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: Assets Media */}
        {activeTab === "assets" && (
          <div className="space-y-5 animate-in fade-in duration-200 max-w-2xl mx-auto py-2">
            <div>
              <span className="block text-xs font-extrabold text-text-primary uppercase tracking-wide mb-3">
                Tautan Folder Foto & Video Produk
              </span>
              
              {/* Copyable link input */}
              <div className="flex items-center gap-2.5 mb-3 min-w-0">
                <input
                  type="text"
                  className="flex-1 px-4 py-2.5 bg-neutral-50 text-xs text-text-primary border border-neutral-200/80 rounded-xl focus:outline-none min-w-0 truncate font-mono"
                  value={campaign.externalAssetUrl}
                  readOnly
                />
                <DashboardButton
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="h-[42px] px-4 shrink-0 text-xs font-extrabold cursor-pointer"
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                >
                  {copied ? "Tersalin!" : "Salin Tautan"}
                </DashboardButton>
              </div>

              {/* Direct Open Button */}
              <DashboardButton
                variant="primary"
                size="md"
                href={campaign.externalAssetUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full h-11 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold cursor-pointer"
                leftIcon={<ExternalLink className="w-4 h-4 text-white shrink-0" />}
              >
                <span>Buka Folder Google Drive / OneDrive</span>
              </DashboardButton>
            </div>

            {/* Warning Banner */}
            <div className="bg-orange-50/80 text-orange-950 border border-orange-200/90 rounded-xl p-3.5 flex gap-3 text-xs leading-normal">
              <Info className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-extrabold block mb-0.5">Petunjuk Folder Foto & Video</span>
                Foto dan video disimpan di Google Drive atau OneDrive Anda. Pastikan folder dapat dibuka oleh siapa pun yang memiliki tautannya.
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Performance Analytics */}
        {activeTab === "performance" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-row items-center justify-between border-b border-neutral-200/50 pb-3">
              <div>
                <span className="block text-xs font-extrabold text-text-primary uppercase tracking-wide">
                  Laporan Hasil Penonton (Tayangan)
                </span>
                <span className="text-xs text-text-muted mt-0.5 block">
                  Ringkasan hasil video yang telah diposting oleh para kreator.
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide shrink-0">
                Data Kampanye
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Total Tayangan Video
                </span>
                <span className="text-lg font-black text-emerald-700 font-display">
                  {campaign.totalViews === undefined ? "—" : `${formatCompactNumber(campaign.totalViews)} Penonton`}
                </span>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Video Terkirim
                </span>
                <span className="text-lg font-black text-text-primary font-display">
                  {submissions.length} Video
                </span>
              </div>
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
                <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">
                  Sisa Dana Kampanye
                </span>
                <span className="text-lg font-black text-orange-600 font-display">
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
