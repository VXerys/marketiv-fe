"use client";

import Image from "next/image";
import { CampaignSubmission } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/formatters";
import { DashboardCard, DashboardButton, DashboardBadge } from "../../shared";

interface SubmissionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: CampaignSubmission;
}

export function SubmissionDetailModal({
  isOpen,
  onClose,
  submission,
}: SubmissionDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <DashboardCard variant="default" className="max-w-lg w-full p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-text-primary mb-4">Detail Submission</h3>

        {/* Creator Info Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-border-soft bg-neutral-200">
            {submission.creatorAvatarUrl ? (
              <Image
                src={submission.creatorAvatarUrl}
                alt={submission.creatorName}
                fill
                sizes="40px"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center font-bold text-neutral-500 bg-neutral-100">
                {submission.creatorName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <h4 className="font-bold text-text-primary text-sm leading-none">{submission.creatorName}</h4>
            <span className="text-[10px] text-text-muted mt-1 inline-block">Platform: {submission.platform}</span>
          </div>
          <div className="ml-auto">
            <DashboardBadge type="status" value={submission.validationStatus} />
          </div>
        </div>

        {/* Grid Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-neutral-50 p-3 rounded-xl border border-border-soft">
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Views Terkumpul
            </span>
            <span className="text-base font-extrabold text-text-primary">
              {submission.actualViews.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-border-soft">
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Target Views
            </span>
            <span className="text-base font-extrabold text-text-primary">
              {submission.targetViews.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-border-soft">
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Dana Dicairkan
            </span>
            <span className="text-base font-extrabold text-success-strong">
              {formatCurrency(submission.releasedFund)}
            </span>
          </div>
          <div className="bg-neutral-50 p-3 rounded-xl border border-border-soft">
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Tanggal Submit
            </span>
            <span className="text-xs font-semibold text-text-primary mt-1 block">
              {formatDate(submission.submittedAt)}
            </span>
          </div>
        </div>

        {/* Post Link */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
            Tautan Konten Publik
          </span>
          <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-border-soft gap-2 min-w-0">
            <span className="text-xs text-text-primary truncate font-medium flex-1 min-w-0">
              {submission.contentUrl}
            </span>
            <a
              href={submission.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-primary font-bold hover:underline shrink-0"
            >
              Kunjungi Postingan
            </a>
          </div>
        </div>

        {/* Timeline of Submission */}
        <div className="mb-6">
          <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
            Riwayat Aktivitas
          </span>
          <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200">
            {/* Step 1: Submit */}
            <div className="flex gap-4 relative">
              <div className="h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center text-primary z-10 border border-primary-200">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-text-primary">Konten disubmit oleh Kreator</p>
                <p className="text-[10px] text-text-muted mt-0.5">{formatRelativeTime(submission.submittedAt)}</p>
              </div>
            </div>

            {/* Step 2: Validation */}
            {submission.validationStatus !== "pending" && (
              <div className="flex gap-4 relative">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center z-10 border ${
                  submission.validationStatus === "valid" ? "bg-success-soft text-success border-success/30" : "bg-danger-soft text-danger border-danger/30"
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">
                    {submission.validationStatus === "valid" 
                      ? "Konten disetujui & dana dicairkan" 
                      : submission.validationStatus === "fraud"
                        ? "Konten ditandai sebagai fraud"
                        : "Sengketa/dispute konten dilaporkan"
                    }
                  </p>
                  {submission.validatedAt && (
                    <p className="text-[10px] text-text-muted mt-0.5">{formatRelativeTime(submission.validatedAt)}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
          <DashboardButton variant="secondary" size="md" onClick={onClose} className="text-xs">
            Tutup
          </DashboardButton>
        </div>
      </DashboardCard>
    </div>
  );
}
