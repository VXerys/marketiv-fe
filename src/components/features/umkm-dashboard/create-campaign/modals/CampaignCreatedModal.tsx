"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { CheckCircle2 } from "lucide-react";

interface CampaignCreatedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReset: () => void;
}

export function CampaignCreatedModal({ isOpen, onConfirm, onReset }: CampaignCreatedModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onConfirm()}>
      <ResponsiveModalContent className="max-w-sm w-full p-6 sm:p-7 text-center rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/80 flex items-center justify-center mx-auto shadow-2xs mb-3">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <ResponsiveModalTitle className="text-base font-extrabold text-ink-950 text-center">
            Kampanye Berhasil Dibuat!
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-1.5">
            Kampanye Anda telah berhasil disimpan dan siap menerima pendaftaran kreator setelah pembayaran dikonfirmasi sistem.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="flex flex-col gap-2.5 w-full pt-4">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full min-h-[44px] px-5 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap"
          >
            Lihat Kampanye Saya
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full min-h-[44px] px-5 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer"
          >
            Buat Kampanye Baru Lagi
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
