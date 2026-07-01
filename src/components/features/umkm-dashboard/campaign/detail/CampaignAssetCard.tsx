"use client";

import { useState } from "react";
import { DashboardCard, DashboardButton } from "../../shared";

interface CampaignAssetCardProps {
  assetUrl: string;
}

export function CampaignAssetCard({ assetUrl }: CampaignAssetCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(assetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardCard variant="default">
      <div className="p-6 border-b border-border-soft">
        <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
          Aset Mentah / Media Produk
        </h3>
      </div>
      <div className="p-6 space-y-4">
        
        {/* Link Box */}
        <div className="flex flex-col gap-2">
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Tautan Folder Aset
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-3.5 py-2 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none truncate"
              value={assetUrl}
              readOnly
            />
            <DashboardButton
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-[36px] px-4 shrink-0 text-xs"
            >
              {copied ? "Tersalin!" : "Salin Link"}
            </DashboardButton>
          </div>
        </div>

        {/* Buttons to view */}
        <div className="pt-2">
          <DashboardButton
            variant="primary"
            size="md"
            href={assetUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full h-10 flex items-center justify-center gap-2 text-xs"
          >
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span>Buka Link Aset Eksternal</span>
          </DashboardButton>
        </div>

        {/* Warning message */}
        <div className="bg-warning-soft text-warning-strong border border-warning-soft rounded-xl p-3.5 flex gap-2.5 text-xs leading-normal">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-bold block mb-0.5">Konsep Berbagi Aset Mentah</span>
            Untuk mengunggah video bahan mentah berukuran besar, Marketiv hanya menyimpan link eksternal seperti Google Drive/Dropbox. Hal ini menjaga kinerja hosting dan performa browser klien tetap kencang.
          </div>
        </div>

      </div>
    </DashboardCard>
  );
}
