"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { CheckCircle2 } from "lucide-react";

interface FinanceActionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
  actionLabel?: string;
}

export function FinanceActionSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  details,
  actionLabel = "Selesai",
}: FinanceActionSuccessModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-sm w-full p-6 text-center rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs mb-3">
            <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} />
          </div>
          <ResponsiveModalTitle className="text-base font-extrabold text-ink-950 text-center">
            {title}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-1.5">
            {message}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {details && (
          <p className="text-[11px] font-mono bg-neutral-50 border border-neutral-200/60 p-2.5 rounded-xl text-ink-950 truncate my-3">
            {details}
          </p>
        )}

        <div className="pt-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] px-6 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer"
          >
            {actionLabel}
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
