"use client";

import { useState } from "react";
import Image from "next/image";
import { CampaignSubmission, SubmissionStatus } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardCard, DashboardButton, DashboardBadge } from "../../shared";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: CampaignSubmission;
  onConfirm: (status: SubmissionStatus, notes: string) => void;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  submission,
  onConfirm,
}: ReviewSubmissionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>(submission.validationStatus);
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedStatus, notes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <DashboardCard variant="default" className="max-w-lg w-full p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-text-primary mb-4">Review Bukti Tayang</h3>

        {/* Creator Info */}
        <div className="flex items-center gap-3.5 mb-6 p-4 bg-neutral-50 rounded-xl border border-border-soft">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-border-soft bg-neutral-200">
            {submission.creatorAvatarUrl ? (
              <Image
                src={submission.creatorAvatarUrl}
                alt={submission.creatorName}
                fill
                sizes="48px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-neutral-500 bg-neutral-100">
                {submission.creatorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary truncate">{submission.creatorName}</span>
              <DashboardBadge type="tone" tone="slate" className="h-4 px-1.5 text-[8px] py-0">
                {submission.platform}
              </DashboardBadge>
            </div>
            <p className="text-xs text-text-muted truncate mt-0.5">Submitted ID: {submission.id}</p>
          </div>
        </div>

        {/* Content & Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="col-span-2">
            <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">
              Link Postingan Sosial Media
            </span>
            <a
              href={submission.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline"
            >
              <span>Buka Tautan Postingan</span>
              <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-border-soft">
            <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">
              Views Terkumpul
            </span>
            <span className="text-base font-extrabold text-text-primary">
              {formatCompactNumber(submission.actualViews)} Views
            </span>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-border-soft">
            <span className="block text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-0.5">
              Estimasi Pencairan
            </span>
            <span className="text-base font-extrabold text-success">
              {formatCurrency(submission.releasedFund)}
            </span>
          </div>
        </div>

        {/* Validation Status Controls */}
        <div className="mb-6">
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">
            Keputusan Validasi
          </span>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedStatus === "valid"
                  ? "bg-success-soft text-success-strong border-success shadow-sm"
                  : "bg-white text-text-secondary border-border-soft hover:bg-neutral-50"
              }`}
              onClick={() => setSelectedStatus("valid")}
            >
              Setujui (Valid)
            </button>
            <button
              type="button"
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedStatus === "fraud"
                  ? "bg-danger-soft text-danger-strong border-danger shadow-sm"
                  : "bg-white text-text-secondary border-border-soft hover:bg-neutral-50"
              }`}
              onClick={() => setSelectedStatus("fraud")}
            >
              Tandai Fraud
            </button>
            <button
              type="button"
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                selectedStatus === "dispute"
                  ? "bg-warning-soft text-warning-strong border-warning shadow-sm"
                  : "bg-white text-text-secondary border-border-soft hover:bg-neutral-50"
              }`}
              onClick={() => setSelectedStatus("dispute")}
            >
              Ajukan Dispute
            </button>
          </div>
        </div>

        {/* Notes Textarea */}
        <div className="mb-6">
          <label htmlFor="review-notes" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Catatan Validator (Opsional)
          </label>
          <textarea
            id="review-notes"
            className="w-full min-h-[70px] px-3.5 py-2.5 bg-neutral-50 text-sm text-text-primary border border-border-strong rounded-xl focus:outline-none focus:border-primary transition-colors resize-none"
            placeholder="Tambahkan catatan pendukung mengenai status validasi konten..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <DashboardButton variant="secondary" size="md" onClick={onClose} className="text-xs">
            Kembali
          </DashboardButton>
          <DashboardButton variant="primary" size="md" onClick={handleConfirm} className="text-xs">
            Simpan Validasi
          </DashboardButton>
        </div>
      </DashboardCard>
    </div>
  );
}
