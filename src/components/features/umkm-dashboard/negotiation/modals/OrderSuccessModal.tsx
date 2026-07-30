"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function OrderSuccessModal({ isOpen, onClose, onConfirm }: OrderSuccessModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6 sm:p-8 text-center">
        <ResponsiveModalHeader className="flex flex-col items-center">
          {/* Success Icon */}
          <div className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto text-xl shadow-xs border border-white mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <ResponsiveModalTitle className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider text-center">
            Pembayaran Berhasil Dikirim!
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-secondary leading-relaxed font-medium text-center mt-2">
            Pembayaran Anda sedang diverifikasi. Dana escrow akan dikunci secara otomatis setelah konfirmasi dari gateway pembayaran diterima. Kreator akan diberi tahu segera setelah escrow aktif.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Buttons */}
        <ResponsiveModalFooter className="flex flex-col sm:flex-row gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-text-secondary text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer border border-primary hover:border-primary-600 shadow-xs text-center select-none"
          >
            Pantau Pekerjaan
          </button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
