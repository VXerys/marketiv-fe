"use client";

import { useState } from "react";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { PauseCircle } from "lucide-react";

interface CancelCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  onConfirm: () => Promise<void>;
}

export function CancelCampaignModal({
  isOpen,
  onClose,
  campaignTitle,
  onConfirm,
}: CancelCampaignModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (!isConfirmed || busy) return;
    setBusy(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-600 border border-amber-200/80 flex items-center justify-center mx-auto shadow-2xs mb-3">
            <PauseCircle className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <ResponsiveModalTitle className="text-base sm:text-lg font-extrabold text-ink-950 text-center">
            Hentikan Sementara Kampanye?
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-1">
            Kampanye <strong className="text-ink-950">&quot;{campaignTitle}&quot;</strong> akan dihentikan sementara. Kreator baru tidak bisa mendaftar, namun sisa dana Anda tetap tersimpan aman di Marketiv.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="my-4 rounded-xl border border-neutral-200/60 bg-neutral-50 p-3.5 text-xs text-text-muted leading-relaxed">
          Kampanye yang dihentikan sementara dapat diaktifkan kembali kapan saja melalui halaman detail kampanye.
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 mb-5 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
          />
          <span className="text-xs font-medium text-text-secondary leading-snug">
            Saya mengerti kampanye ini akan dihentikan sementara dan dana saya tetap aman.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full">
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
            disabled={!isConfirmed || busy}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {busy ? "Memproses…" : "Hentikan Sementara"}
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
