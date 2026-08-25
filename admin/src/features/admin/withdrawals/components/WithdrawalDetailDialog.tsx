"use client";

import { useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime, formatRupiah } from "@/lib/admin/formatters";
import {
  AdminWithdrawalConflictError,
  failWithdrawal,
  markWithdrawalSucceeded,
  startWithdrawalProcessing,
  WithdrawalMutationResult,
} from "../services/withdrawal.service";
import { AdminWithdrawal, AdminWithdrawalQueue } from "../types";
import { getAvailableWithdrawalActions } from "../utils";
import { WithdrawalStatusBadge } from "./WithdrawalStatusBadge";

type ActionMode = "start" | "success" | "fail" | null;

interface WithdrawalDetailDialogProps {
  withdrawal: AdminWithdrawal;
  isOpen: boolean;
  onClose: () => void;
  onAuthoritativeRefresh: (queue: AdminWithdrawalQueue) => void;
  onStale: (message: string) => void;
}

export function WithdrawalDetailDialog({
  withdrawal,
  isOpen,
  onClose,
  onAuthoritativeRefresh,
  onStale,
}: WithdrawalDetailDialogProps) {
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [transferReference, setTransferReference] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [successConfirmed, setSuccessConfirmed] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitLockRef = useRef(false);
  const actions = getAvailableWithdrawalActions(withdrawal.status);

  const resetAction = () => {
    setActionMode(null);
    setTransferReference("");
    setFailureReason("");
    setAdminNote("");
    setSuccessConfirmed(false);
    setValidationError(null);
  };

  const finishMutation = (result: WithdrawalMutationResult) => {
    toast.success(result.message);
    if (result.refresh.status === "refreshed") {
      onAuthoritativeRefresh(result.refresh.queue);
      resetAction();
      return;
    }
    onStale("Perubahan tersimpan, tetapi data terbaru gagal dimuat. Segarkan antrean sebelum tindakan berikutnya.");
    toast.warning("Perubahan tersimpan. Segarkan antrean sebelum tindakan berikutnya.");
    onClose();
  };

  const handleError = (error: unknown) => {
    if (error instanceof AdminWithdrawalConflictError) {
      if (error.refresh.status === "refreshed") {
        onAuthoritativeRefresh(error.refresh.queue);
        resetAction();
        toast.error(`${error.message} Data antrean telah disegarkan.`);
      } else {
        onStale("Data penarikan berubah dan antrean terbaru gagal dimuat. Segarkan data sebelum mencoba lagi.");
        toast.error(`${error.message} Segarkan antrean sebelum mencoba lagi.`);
        onClose();
      }
      return;
    }
    toast.error(error instanceof Error ? error.message : "Gagal memperbarui penarikan.");
  };

  const submitStart = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      finishMutation(await startWithdrawalProcessing(withdrawal.id));
    } catch (error) {
      handleError(error);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const submitSuccess = async () => {
    if (submitLockRef.current) return;
    if (!transferReference.trim()) {
      setValidationError("Referensi transfer wajib diisi.");
      return;
    }
    if (!successConfirmed) {
      setValidationError("Konfirmasi transfer manual wajib dicentang.");
      return;
    }
    setValidationError(null);
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      finishMutation(await markWithdrawalSucceeded({
        withdrawalId: withdrawal.id,
        transferReference,
        adminNote,
      }));
    } catch (error) {
      handleError(error);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  const submitFailure = async () => {
    if (submitLockRef.current) return;
    if (!failureReason.trim()) {
      setValidationError("Alasan kegagalan wajib diisi.");
      return;
    }
    setValidationError(null);
    submitLockRef.current = true;
    setIsSubmitting(true);
    try {
      finishMutation(await failWithdrawal({
        withdrawalId: withdrawal.id,
        failureReason,
        adminNote,
      }));
    } catch (error) {
      handleError(error);
    } finally {
      submitLockRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isSubmitting && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-2xl border-stone-200/90 bg-[#fffdf8] p-4 shadow-2xl sm:p-6">
        <DialogHeader className="border-b border-stone-200/70 pb-4 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <DialogTitle className="text-lg font-extrabold text-[#0c172b]">Detail Penarikan Dana</DialogTitle>
            <WithdrawalStatusBadge status={withdrawal.status} />
          </div>
          <DialogDescription className="text-xs leading-relaxed text-stone-500">
            Tujuan lengkap bersifat sensitif. Gunakan hanya untuk transfer manual terverifikasi.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-xs">
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail label="Withdrawal ID" value={withdrawal.id} mono />
            <Detail label="Kreator" value={`${withdrawal.creator.name}${withdrawal.creator.username ? ` (${withdrawal.creator.username})` : ""}`} />
            <Detail label="Nominal" value={formatRupiah(withdrawal.amount)} strong />
            <Detail label="Diminta" value={formatDateTime(withdrawal.requestedAt || "")} />
          </section>

          <section className="rounded-xl border border-orange-200/90 bg-orange-50/50 p-4">
            <h3 className="font-extrabold text-stone-900">Tujuan Transfer Lengkap</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Detail label="Metode" value={withdrawal.payoutMethod || "-"} />
              <Detail label="Provider" value={withdrawal.providerName || "-"} />
              <Detail label="Nomor Rekening / Akun" value={withdrawal.accountNumber || "-"} mono strong />
              <Detail label="Nama Pemilik" value={withdrawal.accountName || "-"} strong />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-3 rounded-xl border border-stone-200/80 bg-white p-4 sm:grid-cols-2">
            <Detail label="Mulai Diproses" value={formatDateTime(withdrawal.processingAt || "")} />
            <Detail label="Diproses Oleh" value={withdrawal.processedBy || "-"} mono />
            <Detail label="Selesai" value={formatDateTime(withdrawal.processedAt || "")} />
            <Detail label="Referensi Transfer" value={withdrawal.transferReference || "-"} mono />
            <Detail label="Alasan Gagal" value={withdrawal.failureReason || "-"} />
            <Detail label="Catatan Admin" value={withdrawal.adminNote || "-"} />
          </section>

          {actions.length > 0 && !actionMode && (
            <section className="flex flex-col gap-2 border-t border-stone-200 pt-4 sm:flex-row sm:justify-end">
              {actions.includes("start_processing") && (
                <Button onClick={() => setActionMode("start")} className="h-11 rounded-xl bg-[#0c172b] px-5 text-xs font-extrabold text-white hover:bg-[#12213a]">
                  <Clock3 className="h-4 w-4 text-orange-400" />
                  Mulai Proses
                </Button>
              )}
              {actions.includes("mark_succeeded") && (
                <Button onClick={() => setActionMode("success")} className="h-11 rounded-xl bg-emerald-600 px-5 text-xs font-extrabold text-white hover:bg-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Tandai Berhasil
                </Button>
              )}
              {actions.includes("fail") && (
                <Button variant="destructive" onClick={() => setActionMode("fail")} className="h-11 rounded-xl px-5 text-xs font-extrabold">
                  <RotateCcw className="h-4 w-4" />
                  Gagal / Tolak
                </Button>
              )}
            </section>
          )}

          {actionMode === "start" && (
            <ActionPanel title="Mulai proses penarikan">
              <p className="text-stone-600">Status akan berubah menjadi Diproses. Lakukan transfer manual di luar Marketiv setelah perubahan berhasil.</p>
              <ActionButtons isSubmitting={isSubmitting} onCancel={resetAction} onConfirm={submitStart} confirmLabel="Ya, Mulai Proses" />
            </ActionPanel>
          )}

          {actionMode === "success" && (
            <ActionPanel title="Konfirmasi transfer berhasil" tone="success">
              <Input
                id="withdrawal-transfer-reference"
                label="Referensi transfer"
                value={transferReference}
                onChange={(event) => setTransferReference(event.target.value)}
                maxLength={255}
                required
                disabled={isSubmitting}
                placeholder="Contoh: TRX-2026-001"
                error={validationError?.includes("Referensi") ? validationError : undefined}
              />
              <Textarea
                id="withdrawal-success-note"
                label="Catatan admin (opsional)"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                maxLength={1000}
                disabled={isSubmitting}
                className="resize-y"
              />
              <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900">
                <input
                  type="checkbox"
                  checked={successConfirmed}
                  onChange={(event) => setSuccessConfirmed(event.target.checked)}
                  disabled={isSubmitting}
                  className="mt-0.5 h-4 w-4 accent-emerald-600"
                />
                <span className="font-bold">Saya mengonfirmasi transfer manual sudah berhasil ke tujuan di atas.</span>
              </label>
              {validationError && !validationError.includes("Referensi") && <p role="alert" className="font-bold text-red-600">{validationError}</p>}
              <ActionButtons isSubmitting={isSubmitting} onCancel={resetAction} onConfirm={submitSuccess} confirmLabel="Konfirmasi Berhasil" confirmClassName="bg-emerald-600 hover:bg-emerald-700" />
            </ActionPanel>
          )}

          {actionMode === "fail" && (
            <ActionPanel title="Gagalkan dan kembalikan saldo" tone="danger">
              <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="font-bold">Tindakan ini memicu reversal trusted Function. Saldo {formatRupiah(withdrawal.amount)} akan dikembalikan tepat sekali ke creator.</p>
              </div>
              <Textarea
                id="withdrawal-failure-reason"
                label="Alasan gagal / ditolak"
                value={failureReason}
                onChange={(event) => setFailureReason(event.target.value)}
                maxLength={500}
                required
                disabled={isSubmitting}
                className="resize-y"
                error={validationError || undefined}
                placeholder="Jelaskan alasan operasional"
              />
              <Textarea
                id="withdrawal-failure-note"
                label="Catatan admin (opsional)"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                maxLength={1000}
                disabled={isSubmitting}
                className="resize-y"
              />
              <ActionButtons isSubmitting={isSubmitting} onCancel={resetAction} onConfirm={submitFailure} confirmLabel="Gagalkan & Kembalikan Saldo" confirmClassName="bg-red-600 hover:bg-red-700" />
            </ActionPanel>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Detail({ label, value, mono = false, strong = false }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">{label}</p>
      <p className={`mt-1 break-words text-xs text-stone-800 ${mono ? "font-mono" : ""} ${strong ? "font-extrabold" : "font-semibold"}`}>{value}</p>
    </div>
  );
}

function ActionPanel({ title, tone = "neutral", children }: { title: string; tone?: "neutral" | "success" | "danger"; children: React.ReactNode }) {
  const toneClass = tone === "success"
    ? "border-emerald-200 bg-emerald-50/40"
    : tone === "danger"
      ? "border-red-200 bg-red-50/30"
      : "border-blue-200 bg-blue-50/40";
  return (
    <section className={`space-y-3 rounded-xl border p-4 ${toneClass}`}>
      <h3 className="text-sm font-extrabold text-stone-900">{title}</h3>
      {children}
    </section>
  );
}

function ActionButtons({ isSubmitting, onCancel, onConfirm, confirmLabel, confirmClassName = "bg-[#0c172b] hover:bg-[#12213a]" }: {
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel: string;
  confirmClassName?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-11 rounded-xl border-stone-300 text-xs font-extrabold">Batal</Button>
      <Button onClick={onConfirm} disabled={isSubmitting} className={`h-11 rounded-xl px-5 text-xs font-extrabold text-white ${confirmClassName}`}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Menyimpan..." : confirmLabel}
      </Button>
    </div>
  );
}
