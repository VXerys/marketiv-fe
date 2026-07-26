"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

/**
 * Konfirmasi aksi merusak — dipakai dashboard UMKM maupun Kreator.
 *
 * Satu komponen untuk semua "Hapus"/"Batalkan" Sprint 3.5, bukan lima modal
 * hampir identik. Modal per-tujuan yang sudah ada (CancelCampaignModal dll)
 * dibiarkan; s5-modal-unify yang akan menyatukannya.
 *
 * Kontraknya menegakkan tiga hal yang mudah lupa saat ditulis ulang tiap kali:
 * - `onConfirm` ditunggu, tombol terkunci selama berjalan → tidak ada klik ganda
 *   yang mengirim dua permintaan hapus.
 * - Modal hanya menutup bila `onConfirm` selesai tanpa melempar; kegagalan
 *   membiarkan modal terbuka supaya pesan errornya terlihat.
 * - `acknowledgement` memaksa centang untuk aksi yang tidak bisa dibatalkan.
 */

export type ConfirmDialogTone = "danger" | "warning";

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: React.ReactNode;
  /** Konsekuensi yang perlu dibaca sebelum lanjut — muncul sebagai blok abu. */
  note?: React.ReactNode;
  /** Bila diisi, tombol konfirmasi terkunci sampai kotaknya dicentang. */
  acknowledgement?: string;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: ConfirmDialogTone;
  onConfirm: () => void | Promise<void>;
}

const TONE_STYLES: Record<ConfirmDialogTone, { bubble: string; confirm: string }> = {
  danger: {
    bubble: "bg-danger-soft text-danger",
    confirm: "bg-danger text-white hover:bg-danger/90",
  },
  warning: {
    bubble: "bg-warning-soft text-warning",
    confirm: "bg-warning text-white hover:bg-warning/90",
  },
};

export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  note,
  acknowledgement,
  confirmLabel,
  cancelLabel = "Kembali",
  tone = "danger",
  onConfirm,
}: ConfirmDialogProps) {
  const [acknowledged, setAcknowledged] = useState(false);
  const [busy, setBusy] = useState(false);

  const styles = TONE_STYLES[tone];
  const blocked = busy || (!!acknowledgement && !acknowledged);

  const handleClose = () => {
    if (busy) return; // jangan tutup di tengah permintaan yang sedang jalan
    setAcknowledged(false);
    onClose();
  };

  const handleConfirm = async () => {
    if (blocked) return;
    setBusy(true);
    try {
      await onConfirm();
      setAcknowledged(false);
      onClose();
    } catch {
      // Pemanggil yang menampilkan pesannya; modal tetap terbuka.
    } finally {
      setBusy(false);
    }
  };

  return (
    <ResponsiveModal open={open} onOpenChange={(next) => !next && handleClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6">
        <ResponsiveModalHeader>
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full mb-4 ${styles.bubble}`}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
          </div>
          <ResponsiveModalTitle className="text-lg font-bold text-text-primary">
            {title}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-sm text-text-secondary leading-relaxed">
            {description}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {note && (
          <div className="mt-4 rounded-xl border border-border-soft bg-neutral-50 p-3.5 text-[11px] text-text-muted leading-relaxed">
            {note}
          </div>
        )}

        {acknowledgement && (
          <label className="flex items-start gap-2.5 mt-4 cursor-pointer select-none">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border border-border-strong text-primary focus:ring-primary accent-primary cursor-pointer"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              disabled={busy}
            />
            <span className="text-xs text-text-secondary leading-normal">{acknowledgement}</span>
          </label>
        )}

        <ResponsiveModalFooter className="mt-6 flex items-center justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            className={styles.confirm}
            disabled={blocked}
            onClick={handleConfirm}
          >
            {busy ? "Memproses…" : confirmLabel}
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
