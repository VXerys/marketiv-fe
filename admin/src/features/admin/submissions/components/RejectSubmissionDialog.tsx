import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface RejectSubmissionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isSubmitting: boolean;
}

const PREDEFINED_REASONS = [
  "Konten tidak sesuai brief",
  "Link tidak dapat diakses",
  "Postingan salah",
  "Konten sudah dihapus",
  "Lainnya",
];

export function RejectSubmissionDialog({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
}: RejectSubmissionDialogProps) {
  const [selectedReason, setSelectedReason] = useState<string>(PREDEFINED_REASONS[0]);
  const [customNotes, setCustomNotes] = useState<string>("");

  const handleConfirmReject = () => {
    let finalReason = selectedReason;
    if (selectedReason === "Lainnya" || customNotes.trim()) {
      finalReason = customNotes.trim() || selectedReason;
    }

    if (!finalReason) {
      toast.error("Alasan penolakan wajib dipilih/diisi.");
      return;
    }

    onConfirm(finalReason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-w-md bg-[#fffdf8]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-red-700 font-bold">
            <XCircle className="h-5 w-5 text-red-600" />
            <DialogTitle>Tolak Submission</DialogTitle>
          </div>
          <DialogDescription>
            Pilih alasan penolakan untuk memberitahukan kepada Content Creator.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2 text-xs">
          {/* Predefined reason options */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800">Pilih Alasan Penolakan</label>
            <div className="space-y-1.5">
              {PREDEFINED_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 rounded-xl border p-2.5 cursor-pointer transition-all ${
                    selectedReason === reason
                      ? "border-red-500 bg-red-50/60 font-semibold text-red-900"
                      : "border-stone-200 bg-white hover:bg-stone-50 text-stone-700"
                  }`}
                >
                  <input
                    type="radio"
                    name="rejection-reason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-red-600"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Optional notes textarea */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">
              Catatan Tambahan (Opsional)
            </label>
            <Textarea
              placeholder="Tuliskan catatan detail jika diperlukan..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="min-h-[70px] text-xs"
            />
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
            variant="destructive"
            onClick={handleConfirmReject}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
