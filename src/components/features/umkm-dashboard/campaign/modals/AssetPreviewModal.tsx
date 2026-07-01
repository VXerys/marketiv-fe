"use client";

import { useState } from "react";
import { DashboardCard, DashboardButton } from "../../shared";

interface AssetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetUrl: string;
}

export function AssetPreviewModal({
  isOpen,
  onClose,
  assetUrl,
}: AssetPreviewModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(assetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <DashboardCard variant="default" className="max-w-md w-full p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-text-primary mb-2">Tautan Aset Campaign</h3>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          Tautan di bawah merujuk ke lokasi penyimpanan eksternal yang diunggah oleh UMKM (seperti Google Drive, Dropbox, dll.).
        </p>

        {/* Link Input Box */}
        <div className="flex items-center gap-2 mb-6">
          <input
            type="text"
            className="flex-1 px-3.5 py-2.5 bg-neutral-50 text-xs text-text-primary border border-border-strong rounded-xl focus:outline-none"
            value={assetUrl}
            readOnly
          />
          <DashboardButton variant="outline" size="sm" onClick={handleCopy} className="h-[38px] text-xs">
            {copied ? "Tersalin!" : "Salin Link"}
          </DashboardButton>
        </div>

        {/* Safety Banner */}
        <div className="bg-warning-soft text-warning-strong border border-warning-soft rounded-xl p-3.5 flex gap-2.5 mb-6 text-xs leading-normal">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-bold block mb-0.5">Catatan Penyimpanan Aset</span>
            Untuk menjaga kecepatan sistem, Marketiv hanya menyimpan tautan eksternal ke video mentah berukuran besar. Pastikan izin berbagi tautan sudah diatur ke "Siapa saja yang memiliki link".
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <DashboardButton variant="secondary" size="md" onClick={onClose} className="text-xs">
            Tutup
          </DashboardButton>
          <DashboardButton
            variant="primary"
            size="md"
            href={assetUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs h-10 px-6"
          >
            Buka Link Aset
          </DashboardButton>
        </div>
      </DashboardCard>
    </div>
  );
}
