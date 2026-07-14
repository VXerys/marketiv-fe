"use client";

import { DashboardButton } from "../../shared/DashboardButton";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface FinanceActionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  details?: string;
  actionLabel?: string;
}

export function FinanceActionSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  details,
  actionLabel = "Selesai",
}: FinanceActionSuccessModalProps) {
  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-sm w-full p-6 text-center">
        <ResponsiveModalHeader className="flex flex-col items-center">
          {/* Animated Success Icon */}
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.1)] mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <ResponsiveModalTitle className="text-base font-extrabold text-text-primary tracking-tight text-center">
            {title}
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-2">
            {message}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {details && (
          <p className="text-[10px] font-mono bg-neutral-50 border border-neutral-200/30 p-2 rounded-lg text-text-secondary truncate my-4">
            {details}
          </p>
        )}

        {/* CTA Action Button */}
        <ResponsiveModalFooter className="pt-2">
          <DashboardButton variant="primary" size="sm" onClick={onClose} className="w-full">
            {actionLabel}
          </DashboardButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
