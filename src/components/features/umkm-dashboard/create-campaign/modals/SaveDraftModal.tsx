"use client";

import { Button } from "@/components/ui/button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function SaveDraftModal({ isOpen, onClose, onConfirm }: SaveDraftModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-sm w-full p-6 sm:p-8 text-center">
        <ResponsiveModalHeader className="flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-primary-50 text-primary border border-primary-100 flex items-center justify-center mx-auto shadow-2xs mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </div>
          <ResponsiveModalTitle className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider text-center">
            Simpan sebagai Draft?
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-2">
            Apakah Anda ingin menyimpan data kampanye ini sebagai draft? Anda dapat melanjutkannya kembali kapan saja melalui dashboard.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalFooter className="flex items-center gap-3 w-full pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-10 text-xs bg-white border border-border-soft hover:bg-neutral-50 text-text-primary"
          >
            Batal
          </Button>
          <Button
            variant="default"
            onClick={onConfirm}
            className="flex-1 h-10 text-xs bg-primary text-white hover:bg-primary/90"
          >
            Simpan Draft
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
