"use client";

import { useState } from "react";
import Image from "next/image";
import { CampaignSubmission, SubmissionStatus } from "@/types/umkm-dashboard.types";
import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardBadge } from "../../shared";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";

interface ReviewSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submission: CampaignSubmission;
  ratePerThousandViews: number;
  onConfirm: (status: SubmissionStatus, views: number, notes?: string) => void | Promise<void>;
}

export function ReviewSubmissionModal({
  isOpen,
  onClose,
  submission,
  ratePerThousandViews,
  onConfirm,
}: ReviewSubmissionModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<SubmissionStatus>(submission.validationStatus);
  const [viewsInput, setViewsInput] = useState(
    submission.actualViews > 0 ? String(submission.actualViews) : ""
  );
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const views = Number(viewsInput.replace(/\D/g, ""));
  const viewsValid = Number.isInteger(views) && views > 0;
  const rewardPreview = Math.floor(views / 1000) * ratePerThousandViews;
  const canConfirm = selectedStatus === "rejected" || (selectedStatus === "approved" && viewsValid);

  const handleConfirm = async () => {
    if (!canConfirm || busy) return;
    setBusy(true);
    try {
      await onConfirm(selectedStatus, selectedStatus === "approved" ? views : 0, notes.trim() || undefined);
      onClose();
    } catch {
      // Keep modal open on error
    } finally {
      setBusy(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-lg w-full p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="border-b border-neutral-200/50 pb-3 mb-4">
          <ResponsiveModalTitle className="text-base sm:text-lg font-extrabold text-ink-950">
            Periksa Bukti Konten Video
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted mt-0.5">
            Periksa hasil video kreator dan tentukan persetujuan pembayarannya.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Creator Info */}
        <div className="flex items-center gap-3.5 mb-5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/60">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border border-neutral-200 bg-neutral-200">
            {submission.creatorAvatarUrl ? (
              <Image
                src={submission.creatorAvatarUrl}
                alt={submission.creatorName}
                fill
                sizes="44px"
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
              <span className="font-extrabold text-ink-950 truncate text-xs sm:text-sm">{submission.creatorName}</span>
              <DashboardBadge type="tone" tone="slate" className="h-4 px-1.5 text-[9px] py-0">
                {submission.platform}
              </DashboardBadge>
            </div>
            <p className="text-[11px] text-text-muted truncate mt-0.5">ID Konten: {submission.id}</p>
          </div>
        </div>

        {/* Content & Metrics */}
        <div className="grid grid-cols-2 gap-3.5 mb-5">
          <div className="col-span-2">
            <span className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-1">
              Tautan Postingan Video Sosial Media
            </span>
            <a
              href={submission.contentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-orange-600 font-extrabold hover:underline"
            >
              <span>Buka Video Kreator (TikTok / Instagram) ↗</span>
            </a>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Tayangan Terkumpul
            </span>
            <span className="text-sm font-black text-text-primary font-display">
              {submission.actualViews > 0 ? `${formatCompactNumber(submission.actualViews)} Views` : "—"}
            </span>
          </div>

          <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/60">
            <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
              Pencairan Pembayaran
            </span>
            <span className="text-sm font-black text-emerald-700 font-display">
              {formatCurrency(submission.releasedFund)}
            </span>
          </div>
        </div>

        {/* Validation Status Controls */}
        <div className="mb-5">
          <span className="block text-xs font-extrabold text-text-primary uppercase tracking-wide mb-2">
            Keputusan Anda
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              className={`py-2.5 px-4 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                selectedStatus === "approved"
                  ? "bg-emerald-500 text-white border-emerald-600 shadow-2xs"
                  : "bg-white text-text-secondary border-neutral-200/80 hover:bg-neutral-50"
              }`}
              onClick={() => setSelectedStatus("approved")}
            >
              ✓ Setujui Pembayaran
            </button>
            <button
              type="button"
              className={`py-2.5 px-4 rounded-full text-xs font-extrabold border transition-all cursor-pointer ${
                selectedStatus === "rejected"
                  ? "bg-red-600 text-white border-red-700 shadow-2xs"
                  : "bg-white text-text-secondary border-neutral-200/80 hover:bg-neutral-50"
              }`}
              onClick={() => setSelectedStatus("rejected")}
            >
              ✕ Tolak Konten
            </button>
          </div>
        </div>

        {selectedStatus === "approved" && (
          <div className="mb-5">
            <label htmlFor="review-views" className="block text-xs font-extrabold text-text-primary mb-1.5 uppercase tracking-wide">
              Jumlah Tayangan Video (Views)
            </label>
            <input
              id="review-views"
              inputMode="numeric"
              className="w-full px-3.5 py-2.5 bg-neutral-50 text-xs text-text-primary border border-neutral-200/80 rounded-xl focus:outline-none focus:border-orange-500 transition-colors"
              placeholder="Masukkan angka views, contoh: 15000"
              value={viewsInput}
              onChange={(e) => setViewsInput(e.target.value)}
              disabled={busy}
            />
            {viewsValid && views >= 1000 && (
              <div className="mt-2 flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl px-3 py-2">
                <span className="text-xs font-bold text-emerald-900">Perkiraan bayaran untuk kreator</span>
                <span className="text-sm font-black text-emerald-700 font-display">{formatCurrency(rewardPreview)}</span>
              </div>
            )}
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="review-notes" className="block text-xs font-extrabold text-text-primary mb-1.5 uppercase tracking-wide">
            Catatan Tambahan <span className="font-normal text-text-muted normal-case">(opsional)</span>
          </label>
          <textarea
            id="review-notes"
            className="w-full min-h-[72px] px-3.5 py-2.5 bg-neutral-50 text-xs text-text-primary border border-neutral-200/80 rounded-xl resize-none focus:outline-none focus:border-orange-500 transition-colors"
            placeholder={selectedStatus === "rejected" ? "Tuliskan alasan penolakan untuk kreator…" : "Tuliskan pesan apresiasi untuk kreator…"}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={1000}
            disabled={busy}
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full pt-2 border-t border-neutral-200/50">
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
            disabled={!canConfirm || busy}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {busy ? "Menyimpan…" : "Simpan Hasil Periksa"}
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
