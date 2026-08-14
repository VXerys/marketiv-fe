import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatRupiah, formatViews } from "@/lib/admin/formatters";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface ApproveSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  viewsToLock: number;
  estimatedReward: number;
  isSubmitting: boolean;
}

export function ApproveSubmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  viewsToLock,
  estimatedReward,
  isSubmitting,
}: ApproveSubmissionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md bg-[#fffdf8]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-emerald-700 font-bold">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <DialogTitle>Setujui Submission?</DialogTitle>
          </div>
          <DialogDescription>
            Setelah disetujui, jumlah views ini akan menjadi nilai final untuk perhitungan reward Creator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 my-2 text-xs">
          {/* Highlight locked values */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-stone-600 font-medium">Views yang akan dikunci:</span>
              <span className="font-bold text-stone-900 font-mono text-sm">
                {formatViews(viewsToLock)} views
              </span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-emerald-200/60">
              <span className="text-stone-600 font-medium">Estimasi reward:</span>
              <span className="font-bold text-emerald-700 text-base">
                {formatRupiah(estimatedReward)}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-[11px] text-amber-900 border border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Perhatian: Tindakan ini mengunci views secara permanen. Pastikan postingan TikTok telah diperiksa dengan benar.
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-[#16a34a] text-white hover:bg-[#15803d] text-xs gap-1.5"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCircle className="h-3.5 w-3.5" />
            )}
            <span>Setujui Submission</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
