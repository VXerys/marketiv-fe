"use client";

import { useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { FolderGit2, Copy, ExternalLink } from "lucide-react";

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

  const handleCopy = () => {
    navigator.clipboard.writeText(assetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center mx-auto shadow-2xs mb-3">
            <FolderGit2 className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <ResponsiveModalTitle className="text-base sm:text-lg font-extrabold text-ink-950 text-center">
            Tautan Folder Foto & Video
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-1">
            Tautan ini mengarah ke folder penyimpanan eksternal (Google Drive / OneDrive) yang berisi bahan foto atau video produk Anda.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Link Input Box */}
        <div className="flex items-center gap-2 mb-4 mt-4 min-w-0">
          <input
            type="text"
            className="flex-1 px-3.5 py-2.5 bg-neutral-50 text-xs text-text-primary border border-neutral-200/80 rounded-xl focus:outline-none font-mono min-w-0 truncate"
            value={assetUrl}
            readOnly
          />
          <button
            type="button"
            onClick={handleCopy}
            className="min-h-[42px] px-4 rounded-xl border border-neutral-200/80 bg-white text-ink-950 text-xs font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? "Tersalin!" : "Salin"}</span>
          </button>
        </div>

        {/* Safety Banner */}
        <div className="bg-orange-50/80 text-orange-950 border border-orange-200/90 rounded-xl p-3.5 text-xs leading-relaxed mb-5">
          <span className="font-extrabold block mb-0.5">Petunjuk Folder Foto & Video</span>
          Pastikan izin akses folder Google Drive atau OneDrive Anda telah diatur ke &quot;Siapa saja yang memiliki link&quot; agar dapat diakses kreator.
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer"
          >
            Tutup
          </button>
          <a
            href={assetUrl}
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-h-[44px] px-4 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-4 h-4 text-white shrink-0" />
            <span>Buka Folder ↗</span>
          </a>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
