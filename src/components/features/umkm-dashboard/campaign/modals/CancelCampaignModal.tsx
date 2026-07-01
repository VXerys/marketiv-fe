"use client";

import { useState } from "react";
import { DashboardCard, DashboardButton } from "../../shared";

interface CancelCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  onConfirm: (reason: string) => void;
}

export function CancelCampaignModal({
  isOpen,
  onClose,
  campaignTitle,
  onConfirm,
}: CancelCampaignModalProps) {
  const [reason, setReason] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!isConfirmed) return;
    onConfirm(reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <DashboardCard variant="default" className="max-w-md w-full p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
        {/* Warning Icon */}
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-danger-soft text-danger mb-4">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2">Batalkan Campaign?</h3>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          Apakah Anda yakin ingin membatalkan campaign <span className="font-semibold text-text-primary">"{campaignTitle}"</span>? Sisa budget di escrow akan dikembalikan setelah dikurangi biaya platform yang sudah berjalan. Aksi ini tidak dapat dibatalkan.
        </p>

        {/* Textarea Reason */}
        <div className="mb-4">
          <label htmlFor="cancel-reason" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Alasan Pembatalan (Opsional)
          </label>
          <textarea
            id="cancel-reason"
            className="w-full min-h-[80px] px-3.5 py-2.5 bg-neutral-50 text-sm text-text-primary border border-border-strong rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Tulis alasan mengapa Anda membatalkan campaign ini..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
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
            Saya mengerti konsekuensi pembatalan ini dan setuju dengan syarat pengembalian dana Marketiv.
          </span>
        </label>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <DashboardButton variant="secondary" size="md" onClick={onClose} className="text-xs">
            Kembali
          </DashboardButton>
          <DashboardButton variant="danger" size="md" disabled={!isConfirmed} onClick={handleConfirm} className="text-xs">
            Batalkan Campaign
          </DashboardButton>
        </div>
      </DashboardCard>
    </div>
  );
}
