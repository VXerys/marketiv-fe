"use client";

import { useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { Copy } from "lucide-react";

interface DuplicateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTitle: string;
  onConfirm: (newTitle: string, options: { copyBrief: boolean; copyBudget: boolean; copyAssets: boolean }) => Promise<void>;
}

export function DuplicateCampaignModal({
  isOpen,
  onClose,
  originalTitle,
  onConfirm,
}: DuplicateCampaignModalProps) {
  const [newTitle, setNewTitle] = useState(`${originalTitle} (Salinan)`);
  const [options, setOptions] = useState({
    copyBrief: true,
    copyBudget: true,
    copyAssets: true,
  });
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!newTitle.trim() || busy) return;
    setBusy(true);
    try {
      await onConfirm(newTitle, options);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center mx-auto shadow-2xs mb-3">
            <Copy className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <ResponsiveModalTitle className="text-base sm:text-lg font-extrabold text-ink-950 text-center">
            Duplikasi Kampanye
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-1">
            Salin kampanye ini untuk membuat kampanye baru dengan pengaturan yang sama secara cepat.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Input New Title */}
        <div className="my-4">
          <label htmlFor="new-title" className="block text-xs font-extrabold text-text-primary mb-1.5 uppercase tracking-wide">
            Nama Kampanye Baru
          </label>
          <input
            type="text"
            id="new-title"
            className="w-full px-3.5 py-2.5 bg-neutral-50 text-xs text-text-primary border border-neutral-200/80 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </div>

        {/* Configuration Checkboxes */}
        <div className="space-y-3 mb-5 bg-neutral-50 p-4 rounded-xl border border-neutral-200/60">
          <span className="block text-xs font-extrabold text-text-primary uppercase tracking-wide mb-1">
            Pengaturan Salinan
          </span>
          
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              checked={options.copyBrief}
              onChange={(e) => setOptions({ ...options, copyBrief: e.target.checked })}
            />
            <span className="text-xs text-text-secondary font-medium">Salin detail arahan & petunjuk produk</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              checked={options.copyBudget}
              onChange={(e) => setOptions({ ...options, copyBudget: e.target.checked })}
            />
            <span className="text-xs text-text-secondary font-medium">Salin kuota & bayaran per 1.000 tayangan</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
              checked={options.copyAssets}
              onChange={(e) => setOptions({ ...options, copyAssets: e.target.checked })}
            />
            <span className="text-xs text-text-secondary font-medium">Salin tautan folder foto & video</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!newTitle.trim() || busy}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {busy ? "Menduplikasi…" : "Duplikasi Sekarang"}
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
