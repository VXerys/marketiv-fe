"use client";

import { useState } from "react";
import { DashboardButton } from "../../shared";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface CancelCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  onConfirm: () => void;
}

/**
 * "Jeda Campaign" — bukan pembatalan+refund. CampaignStatus tidak punya nilai
 * "cancelled" dan tak ada Function refund escrow; status hanya berpindah ke
 * "paused". Pembatalan sejati + refund diusulkan ke backend sebagai konsep
 * terpisah (lihat handoff Sprint 3). Reason dihapus — campaigns tak punya
 * kolomnya, field yang membuang input diam-diam lebih buruk daripada tak ada.
 */
export function CancelCampaignModal({
  isOpen,
  onClose,
  campaignTitle,
  onConfirm,
}: CancelCampaignModalProps) {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirm();
    onClose();
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6">
        <ResponsiveModalHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-warning-soft text-warning mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <ResponsiveModalTitle className="text-lg font-bold text-text-primary">
            Jeda Campaign?
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-sm text-text-secondary leading-relaxed">
            Campaign <span className="font-semibold text-text-primary">&quot;{campaignTitle}&quot;</span> akan dijeda: kreator tidak bisa mengajukan klaim baru, tetapi dana escrow tetap tersimpan aman. Anda bisa mengaktifkannya kembali kapan saja.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <div className="mt-4 mb-5 rounded-xl border border-border-soft bg-neutral-50 p-3.5 text-[11px] text-text-muted leading-relaxed">
          Pembatalan permanen beserta pengembalian dana (refund) escrow belum tersedia dan sedang disiapkan bersama tim. Untuk saat ini campaign hanya bisa dijeda.
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 mb-6 cursor-pointer select-none">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-border-strong text-primary focus:ring-primary accent-primary cursor-pointer border"
            checked={isConfirmed}
            onChange={(e) => setIsConfirmed(e.target.checked)}
          />
          <span className="text-xs text-text-secondary leading-normal">
            Saya mengerti campaign akan dijeda dan dana escrow tetap tersimpan.
          </span>
        </label>

        {/* Buttons */}
        <ResponsiveModalFooter className="flex items-center justify-end gap-3">
          <DashboardButton variant="secondary" size="md" onClick={onClose} className="text-xs">
            Kembali
          </DashboardButton>
          <DashboardButton variant="primary" size="md" disabled={!isConfirmed} onClick={handleConfirm} className="text-xs">
            Jeda Campaign
          </DashboardButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
