"use client";

import { Button } from "@/components/ui/Button";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface CampaignCreatedModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReset: () => void;
}

export function CampaignCreatedModal({ isOpen, onConfirm, onReset }: CampaignCreatedModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onConfirm()}>
      <ResponsiveModalContent className="max-w-sm w-full p-6 sm:p-8 text-center">
        <ResponsiveModalHeader className="flex flex-col items-center">
          <div className="h-14 w-14 rounded-full bg-success-soft/20 text-success border border-success-soft/10 flex items-center justify-center mx-auto shadow-2xs mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <ResponsiveModalTitle className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider text-center">
            Campaign Berhasil Disiapkan!
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-2">
            Kampanye Anda berhasil dibuat secara simulasi dan dana escrow telah diamankan. Setelah integrasi backend selesai, data akan langsung tersimpan permanen.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        <ResponsiveModalFooter className="flex flex-col gap-2 w-full pt-4">
          <Button
            variant="default"
            onClick={onConfirm}
            className="w-full h-10 text-xs bg-primary text-white hover:bg-primary/90"
          >
            Lihat Campaign Saya
          </Button>
          <Button
            variant="outline"
            onClick={onReset}
            className="w-full h-10 text-xs bg-white border border-border-soft hover:bg-neutral-50 text-text-primary"
          >
            Buat Campaign Baru Lagi
          </Button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
