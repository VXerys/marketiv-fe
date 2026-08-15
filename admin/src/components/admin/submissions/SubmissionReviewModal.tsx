"use client";

import React, { useState, useEffect } from "react";
import { CampaignSubmissionDomain as CampaignSubmission } from "@/features/admin/submissions/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmissionStatusBadge as StatusBadge } from "@/features/admin/submissions/components/SubmissionStatusBadge";
import {
  formatRupiah,
  formatViews,
  formatDateTime,
  calculateEstimatedReward,
} from "@/lib/admin/formatters";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
  Store,
  User,
  Megaphone,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface SubmissionReviewModalProps {
  submission: CampaignSubmission | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSuccess: (submissions: CampaignSubmission[]) => void;
}

export function SubmissionReviewModal({
  submission,
  isOpen,
  onClose,
  onReviewSuccess,
}: SubmissionReviewModalProps) {
  const [viewsInput, setViewsInput] = useState<string>("");
  const [rejectionNotes, setRejectionNotes] = useState<string>("");
  const [isConfirmingApprove, setIsConfirmingApprove] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (submission) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset local review form for selected submission.
      setViewsInput(
        submission.verifiedViews !== undefined ? String(submission.verifiedViews) : ""
      );
      setRejectionNotes(submission.rejectionReason || "");
      setIsConfirmingApprove(false);
    }
  }, [submission]);

  if (!submission) return null;

  const parsedViews = parseInt(viewsInput.replace(/\D/g, ""), 10) || 0;
  const estimatedReward = calculateEstimatedReward(
    parsedViews,
    submission.campaign.rewardPer1000Views
  );

  const handleApprove = async () => {
    if (isSubmitting) return;
    if (parsedViews <= 0) {
      toast.error("Wajib menginputkan Jumlah Views Saat Ini (> 0).");
      return;
    }

    if (!isConfirmingApprove) {
      setIsConfirmingApprove(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const { approveCampaignSubmission } = await import("@/features/admin/submissions/services/submission.service");
      const res = await approveCampaignSubmission({
        submissionId: submission.id,
        verifiedViews: parsedViews,
      });

      toast.success(res.message);
      if (res.refresh.status === "refreshed") {
        onReviewSuccess(res.refresh.submissions);
      } else {
        toast.warning("Review tersimpan, tetapi antrean terbaru gagal dimuat. Segarkan data.");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyetujui submission.");
    } finally {
      setIsSubmitting(false);
      setIsConfirmingApprove(false);
    }
  };

  const handleReject = async () => {
    if (isSubmitting) return;
    if (!rejectionNotes.trim()) {
      toast.error("Alasan penolakan wajib diisi sebelum menolak submission.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { rejectCampaignSubmission } = await import("@/features/admin/submissions/services/submission.service");
      const res = await rejectCampaignSubmission({
        submissionId: submission.id,
        rejectionReason: rejectionNotes.trim(),
      });

      toast.success(res.message);
      if (res.refresh.status === "refreshed") {
        onReviewSuccess(res.refresh.submissions);
      } else {
        toast.warning("Review tersimpan, tetapi antrean terbaru gagal dimuat. Segarkan data.");
      }
      onClose();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menolak submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPending = submission.status === "pending";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 bg-[#fffdf8]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-[#0c172b]">
              Periksa Submission Content
            </DialogTitle>
            <StatusBadge status={submission.status} />
          </div>
          <DialogDescription>
            Validasi postingan TikTok dari Content Creator secara manual sebelum reward dikreditkan oleh backend.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 my-2 text-xs">
          {/* Metadata Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Creator */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-500 text-[10px] uppercase">
                <User className="h-3.5 w-3.5 text-[#f97316]" />
                <span>Creator</span>
              </div>
              <p className="font-bold text-stone-900 text-sm truncate">
                {submission.creator.name}
              </p>
              <p className="text-stone-500 font-mono text-[11px] truncate">
                {submission.creator.username}
              </p>
            </div>

            {/* Campaign */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-500 text-[10px] uppercase">
                <Megaphone className="h-3.5 w-3.5 text-[#f97316]" />
                <span>Campaign</span>
              </div>
              <p className="font-bold text-stone-900 text-xs line-clamp-1">
                {submission.campaign.title}
              </p>
              <p className="text-orange-700 font-semibold text-[11px]">
                {formatRupiah(submission.campaign.rewardPer1000Views)} / 1.000 views
              </p>
            </div>

            {/* UMKM */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-500 text-[10px] uppercase">
                <Store className="h-3.5 w-3.5 text-[#f97316]" />
                <span>UMKM Owner</span>
              </div>
              <p className="font-bold text-stone-900 text-xs truncate">
                {submission.umkm.name}
              </p>
              <p className="text-stone-500 text-[11px] truncate">
                {submission.umkm.ownerName || "Marketiv Client"}
              </p>
            </div>
          </div>

          {/* Social Media Link Action Section */}
          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800 text-xs">
                Post URL ({submission.platform})
              </span>
              <span className="text-[11px] text-stone-400">
                Submitted: {formatDateTime(submission.submittedAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 rounded-lg border border-stone-100 bg-stone-50/80 p-2.5">
              <span className="font-mono text-xs text-stone-600 truncate max-w-sm select-all">
                {submission.postUrl}
              </span>
              <a
                href={submission.postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0c172b] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#12213a] shrink-0 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-orange-400" />
                <span>Buka Postingan</span>
              </a>
            </div>
          </div>

          {/* Manual View Verification Input Section */}
          <div className="rounded-xl border border-orange-200/80 bg-orange-50/40 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="views-input"
                className="font-bold text-stone-900 text-xs flex items-center gap-1.5"
              >
                <Eye className="h-4 w-4 text-[#f97316]" />
                <span>Jumlah Views Saat Ini (Manual Verification)</span>
              </label>
              {isPending && (
                <span className="text-[11px] font-semibold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
                  Required for Approval
                </span>
              )}
            </div>

            {isPending ? (
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="views-input"
                    type="number"
                    min="0"
                    placeholder="Contoh: 15800"
                    value={viewsInput}
                    onChange={(e) => setViewsInput(e.target.value)}
                    className="h-11 border-orange-300 bg-white font-mono text-base font-bold text-stone-900 pl-3 pr-24 focus:ring-orange-500"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500">
                    views
                  </div>
                </div>

                {/* UX Realtime Estimated Reward Preview */}
                {parsedViews > 0 && (
                  <div className="flex items-center justify-between rounded-lg bg-white border border-stone-200 p-2.5 text-xs">
                    <span className="text-stone-600 font-medium">
                      Estimasi Reward ({formatViews(parsedViews)} views ×{" "}
                      {formatRupiah(submission.campaign.rewardPer1000Views)}/1k):
                    </span>
                    <span className="font-bold text-emerald-600 text-sm">
                      {formatRupiah(estimatedReward)}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg bg-white border border-stone-200 p-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Verified Views:</span>
                  <span className="font-bold text-stone-900 font-mono text-sm">
                    {formatViews(submission.verifiedViews || 0)} views
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-500">Reward Dikreditkan:</span>
                  <span className="font-bold text-emerald-600 text-sm">
                    {formatRupiah(submission.finalReward || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Rejection Notes Section */}
          <div className="space-y-1.5">
            <label
              htmlFor="rejection-notes"
              className="font-bold text-stone-800 text-xs"
            >
              Catatan Internal / Alasan Penolakan
            </label>
            <Textarea
              id="rejection-notes"
              placeholder={
                isPending
                  ? "Wajib diisi jika menolak submission (misal: Postingan private, bukan tentang produk, dll)..."
                  : "Tidak ada catatan."
              }
              value={rejectionNotes}
              onChange={(e) => setRejectionNotes(e.target.value)}
              disabled={!isPending}
              className="min-h-[70px] text-xs"
            />
          </div>

          {/* Confirmation Warning if clicking Approve */}
          {isConfirmingApprove && (
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 animate-in fade-in-50">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-900">
                  Konfirmasi Approval Final Views
                </p>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Anda akan mengunci <strong className="font-mono">{formatViews(parsedViews)} views</strong> dengan reward{" "}
                  <strong>{formatRupiah(estimatedReward)}</strong> ke pending balance creator. Klik <strong>Konfirmasi Setujui</strong> untuk melanjutkan.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {isPending ? (
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs"
            >
              Batal
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleReject}
              disabled={isSubmitting}
              className="text-xs gap-1.5"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>Tolak Submission</span>
            </Button>

            <Button
              type="button"
              onClick={handleApprove}
              disabled={isSubmitting || parsedViews <= 0}
              className="text-xs gap-1.5 bg-[#f97316] text-white hover:bg-[#ea580c]"
            >
              {isSubmitting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle className="h-3.5 w-3.5" />
              )}
              <span>
                {isConfirmingApprove ? "Konfirmasi Setujui" : "Setujui Submission"}
              </span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-end pt-3 border-t border-stone-200">
            <Button variant="outline" onClick={onClose} className="text-xs">
              Tutup
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
