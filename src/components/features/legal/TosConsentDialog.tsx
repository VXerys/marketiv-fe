"use client";

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";
import { Checkbox } from "@/components/ui/checkbox";

export interface TosConsentDialogProps {
  open: boolean;
  currentVersion: string | null;
  error: string | null;
  submitting: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onAccept: () => void;
  onRetryStatus: () => void;
}

export function TosConsentDialog({
  open,
  currentVersion,
  error,
  submitting,
  checked,
  onCheckedChange,
  onAccept,
  onRetryStatus,
}: TosConsentDialogProps) {
  const statusUnavailable = currentVersion == null;
  const acceptDisabled = statusUnavailable || !checked || submitting;

  return (
    <ResponsiveModal open={open} onOpenChange={() => undefined}>
      <ResponsiveModalContent showCloseButton={false} className="max-w-md rounded-2xl p-6">
        <ResponsiveModalHeader className="space-y-2 text-left">
          <ResponsiveModalTitle>Persetujuan Syarat & Ketentuan</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            {statusUnavailable
              ? "Persetujuan belum dapat diverifikasi. Dashboard tetap terkunci sampai status tersedia."
              : `Baca dan setujui Syarat & Ketentuan Marketiv versi ${currentVersion} untuk melanjutkan.`}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {error && <p role="alert" className="mt-4 text-sm text-danger-strong">{error}</p>}

        {statusUnavailable ? (
          <ResponsiveModalFooter className="mt-6">
            <button type="button" onClick={onRetryStatus} disabled={submitting} className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-60">
              Coba Lagi
            </button>
          </ResponsiveModalFooter>
        ) : (
          <>
            <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-text-secondary">
              <Checkbox
                checked={checked}
                onCheckedChange={(next) => onCheckedChange(next === true)}
                aria-label="Saya menyetujui Syarat dan Ketentuan"
                disabled={submitting}
              />
              <span>
                Saya sudah membaca dan menyetujui{" "}
                <a href="/syarat-ketentuan" target="_blank" rel="noreferrer" className="font-bold text-primary underline">
                  Syarat & Ketentuan
                </a>{" "}
                versi {currentVersion}.
              </span>
            </label>

            <ResponsiveModalFooter className="mt-6">
              <button
                type="button"
                onClick={onAccept}
                disabled={acceptDisabled}
                className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Menyimpan…" : "Setujui & Lanjutkan"}
              </button>
            </ResponsiveModalFooter>
          </>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
