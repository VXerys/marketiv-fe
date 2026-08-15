"use client";

import React, { useState, useEffect } from "react";
import { CampaignSubmissionDomain } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmissionStatusBadge } from "./SubmissionStatusBadge";
import { ApproveSubmissionDialog } from "./ApproveSubmissionDialog";
import { RejectSubmissionDialog } from "./RejectSubmissionDialog";
import {
  calculateEstimatedCampaignReward,
  validateViewsInput,
} from "../utils";
import {
  approveCampaignSubmission,
  rejectCampaignSubmission,
} from "../services/submission.service";
import {
  formatRupiah,
  formatViews,
  formatDateTime,
} from "@/lib/admin/formatters";
import {
  ExternalLink,
  CheckCircle,
  XCircle,
  Eye,
  Store,
  User,
  Megaphone,
  AlertCircle,
  Info,
  Calculator,
} from "lucide-react";
import { toast } from "sonner";

interface SubmissionReviewDialogProps {
  submission: CampaignSubmissionDomain | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: CampaignSubmissionDomain) => void;
}

export function SubmissionReviewDialog({
  submission,
  isOpen,
  onClose,
  onSuccess,
}: SubmissionReviewDialogProps) {
  const [viewsInputText, setViewsInputText] = useState<string>("");
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState<boolean>(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [inputErrorMsg, setInputErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (submission) {
      setViewsInputText(
        submission.verifiedViews !== undefined && submission.verifiedViews > 0
          ? formatViews(submission.verifiedViews)
          : ""
      );
      setInputErrorMsg(null);
      setIsApproveConfirmOpen(false);
      setIsRejectDialogOpen(false);
    }
  }, [submission]);

  if (!submission) return null;

  const isPending = submission.status === "pending";
  const validation = validateViewsInput(viewsInputText);
  const numericViews = validation.isValid ? validation.numericValue : 0;
  const fullThousands = Math.floor(numericViews / 1000);
  const estimatedReward = calculateEstimatedCampaignReward(
    numericViews,
    submission.campaign.rewardPer1000Views
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setViewsInputText(rawVal);
    const res = validateViewsInput(rawVal);
    if (!res.isValid && rawVal.trim() !== "") {
      setInputErrorMsg(res.errorMessage || "Input tidak valid");
    } else {
      setInputErrorMsg(null);
    }
  };

  const handleOpenApproveConfirm = () => {
    if (!viewsInputText || !validation.isValid || numericViews <= 0) {
      toast.error("Wajib menginputkan Jumlah Views Saat Ini yang valid (> 0).");
      setInputErrorMsg("Jumlah views harus diisi dengan angka positif.");
      return;
    }
    setIsApproveConfirmOpen(true);
  };

  const handleConfirmApprove = async () => {
    setIsSubmitting(true);
    try {
      const res = await approveCampaignSubmission({
        submissionId: submission.id,
        verifiedViews: numericViews,
        adminId: "Admin Ops 1",
      });
      toast.success(res.message);
      onSuccess(res.data);
      setIsApproveConfirmOpen(false);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal menyetujui submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReject = async (reason: string) => {
    setIsSubmitting(true);
    try {
      const res = await rejectCampaignSubmission({
        submissionId: submission.id,
        rejectionReason: reason,
        adminId: "Admin Ops 1",
      });
      toast.error(res.message);
      onSuccess(res.data);
      setIsRejectDialogOpen(false);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Gagal menolak submission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-2xl max-h-[92vh] flex flex-col p-4 sm:p-6 bg-[#fffdf8] border-stone-200/90 rounded-2xl shadow-2xl">
          {/* Dialog Header with pr-10 to prevent X close button overlap */}
          <DialogHeader className="pr-10 border-b border-stone-200/70 pb-3 shrink-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <DialogTitle className="text-base sm:text-lg font-extrabold text-[#0c172b] tracking-tight">
                Periksa Submission Content
              </DialogTitle>
              <SubmissionStatusBadge status={submission.status} />
            </div>
            <DialogDescription className="text-xs text-stone-500 leading-relaxed">
              Validasi manual postingan TikTok dari Content Creator untuk mengunci verified views dan pelepasan reward.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable Body Workspace */}
          <div className="flex-1 overflow-y-auto space-y-4 py-3 pr-1 text-xs">
            {/* Metadata Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Creator */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 font-extrabold text-stone-400 text-[10px] uppercase tracking-wider">
                  <User className="h-3.5 w-3.5 text-[#f97316] shrink-0" />
                  <span>Kreator</span>
                </div>
                <p className="font-extrabold text-stone-900 text-xs sm:text-sm truncate">
                  {submission.creator.name}
                </p>
                <p className="text-stone-500 font-mono text-[11px] truncate">
                  {submission.creator.username || submission.creator.tiktokHandle}
                </p>
              </div>

              {/* Campaign */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 font-extrabold text-stone-400 text-[10px] uppercase tracking-wider">
                  <Megaphone className="h-3.5 w-3.5 text-[#f97316] shrink-0" />
                  <span>Campaign</span>
                </div>
                <p className="font-extrabold text-stone-900 text-xs truncate" title={submission.campaign.title}>
                  {submission.campaign.title}
                </p>
                <p className="text-orange-700 font-bold text-[11px] truncate">
                  {formatRupiah(submission.campaign.rewardPer1000Views)} / 1.000 views
                </p>
              </div>

              {/* UMKM */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/80 p-3 space-y-1 min-w-0">
                <div className="flex items-center gap-1.5 font-extrabold text-stone-400 text-[10px] uppercase tracking-wider">
                  <Store className="h-3.5 w-3.5 text-[#f97316] shrink-0" />
                  <span>UMKM Partner</span>
                </div>
                <p className="font-extrabold text-stone-900 text-xs truncate">
                  {submission.umkm.name}
                </p>
                <p className="text-stone-500 text-[11px] truncate">
                  {submission.umkm.ownerName || "Marketiv Client"}
                </p>
              </div>
            </div>

            {/* Social Media Post URL Section */}
            <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-extrabold text-stone-800 text-xs uppercase tracking-wider">
                  Post URL ({submission.platform})
                </span>
                <span className="text-[11px] text-stone-400 font-medium">
                  Dikirim: {formatDateTime(submission.submittedAt)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-stone-200/70 bg-stone-50/80 p-2.5">
                <span className="font-mono text-xs text-stone-700 truncate select-all min-w-0 flex-1">
                  {submission.postUrl}
                </span>
                <a
                  href={submission.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0c172b] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#12213a] shrink-0 transition-colors shadow-2xs cursor-pointer"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                  <span>Buka Postingan</span>
                </a>
              </div>
              {submission.note && (
                <p className="text-[11px] text-stone-500 italic pt-0.5">
                  Catatan Kreator: &ldquo;{submission.note}&rdquo;
                </p>
              )}
            </div>

            {/* Manual View Verification Section */}
            <div className="rounded-xl border border-orange-200/90 bg-orange-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="views-input-field"
                  className="font-extrabold text-stone-900 text-xs flex items-center gap-1.5"
                >
                  <Eye className="h-4 w-4 text-[#f97316] shrink-0" />
                  <span>Jumlah Views Saat Ini</span>
                </label>
                {isPending && (
                  <span className="text-[10px] font-extrabold text-orange-800 bg-orange-100/90 border border-orange-200 px-2 py-0.5 rounded-md">
                    Wajib diisi Admin
                  </span>
                )}
              </div>

              {isPending ? (
                <div className="space-y-3">
                  <div className="relative">
                    <Input
                      id="views-input-field"
                      type="text"
                      placeholder="Contoh: 15.800"
                      value={viewsInputText}
                      onChange={handleInputChange}
                      className="h-12 border-orange-300 bg-white font-mono text-base sm:text-lg font-extrabold text-stone-900 pl-3.5 pr-24 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 rounded-xl"
                    />
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-stone-400 uppercase tracking-wider">
                      views
                    </div>
                  </div>

                  {inputErrorMsg && (
                    <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{inputErrorMsg}</span>
                    </div>
                  )}

                  {/* Reward Calculation Live Breakdown Preview */}
                  {numericViews >= 1000 && (
                    <div className="rounded-xl bg-white border border-stone-200/90 p-3.5 space-y-2.5 text-xs shadow-2xs">
                      <div className="flex items-center gap-1.5 font-extrabold text-[#0c172b] text-xs pb-1.5 border-b border-stone-100">
                        <Calculator className="h-4 w-4 text-[#f97316]" />
                        <span>Kalkulasi Estimasi Reward Backend</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                        <div>
                          <span className="text-stone-400 font-medium block">Views Input:</span>
                          <p className="font-extrabold text-stone-900 font-mono text-xs">
                            {formatViews(numericViews)}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium block">Rate Campaign:</span>
                          <p className="font-extrabold text-orange-700">
                            {formatRupiah(submission.campaign.rewardPer1000Views)}
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium block">Kelipatan 1k:</span>
                          <p className="font-bold text-stone-800 font-mono">
                            {fullThousands} × rate
                          </p>
                        </div>
                        <div>
                          <span className="text-stone-400 font-medium block">Estimasi Reward:</span>
                          <p className="font-extrabold text-emerald-600 text-sm font-mono">
                            {formatRupiah(estimatedReward)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Under 1,000 Views Business State Notice */}
                  {numericViews > 0 && numericViews < 1000 && (
                    <div className="flex items-start gap-2 rounded-xl bg-blue-50/80 p-3 text-xs text-blue-900 border border-blue-200">
                      <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-blue-900">
                          Views belum mencapai 1.000
                        </p>
                        <p className="text-[11px] text-blue-800 leading-relaxed">
                          Reward Campaign dihitung untuk setiap 1.000 views penuh. Estimasi reward saat ini: <strong>Rp0</strong>.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Finalized View State */
                <div className="rounded-xl bg-white border border-stone-200 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-medium">Views Terverifikasi:</span>
                    <span className="font-extrabold text-stone-900 font-mono text-sm">
                      {formatViews(submission.verifiedViews || 0)} views
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                    <span className="text-stone-500 font-medium">Reward Final Dikreditkan:</span>
                    <span className="font-extrabold text-emerald-600 font-mono text-base">
                      {formatRupiah(submission.finalReward || 0)}
                    </span>
                  </div>
                  {submission.verifiedAt && (
                    <p className="text-[10px] text-stone-400 font-mono pt-1">
                      Diverifikasi: {formatDateTime(submission.verifiedAt)} oleh {submission.verifiedBy || "Admin"}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Rejection Note Display */}
            {submission.status === "rejected" && submission.rejectionReason && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-3.5 space-y-1">
                <p className="font-extrabold text-red-900 text-xs">Alasan Penolakan:</p>
                <p className="text-xs text-red-800">&ldquo;{submission.rejectionReason}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="pt-3 border-t border-stone-200/80 shrink-0">
            {isPending ? (
              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-10 px-4 text-xs font-bold border-stone-200 text-stone-700 hover:bg-stone-100"
                >
                  Batal
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsRejectDialogOpen(true)}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto h-10 px-4 text-xs font-bold gap-1.5 bg-red-600 hover:bg-red-700 text-white"
                >
                  <XCircle className="h-4 w-4" />
                  <span>Tolak Submission</span>
                </Button>

                <Button
                  type="button"
                  onClick={handleOpenApproveConfirm}
                  disabled={isSubmitting || numericViews <= 0}
                  className="w-full sm:w-auto h-10 px-5 text-xs font-extrabold gap-1.5 bg-gradient-to-r from-[#f97316] to-[#ea580c] text-white hover:opacity-95 shadow-md cursor-pointer"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Setujui Submission</span>
                </Button>
              </div>
            ) : (
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full sm:w-auto h-10 px-5 text-xs font-bold"
                >
                  Tutup
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialogs */}
      <ApproveSubmissionDialog
        isOpen={isApproveConfirmOpen}
        onClose={() => setIsApproveConfirmOpen(false)}
        onConfirm={handleConfirmApprove}
        viewsToLock={numericViews}
        estimatedReward={estimatedReward}
        isSubmitting={isSubmitting}
      />

      <RejectSubmissionDialog
        isOpen={isRejectDialogOpen}
        onClose={() => setIsRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
