"use client";

import { DashboardCard } from "../../shared/DashboardCard";
import { DashboardButton } from "../../shared/DashboardButton";

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-sm z-10 transition-all duration-300 transform scale-100">
        <DashboardCard variant="elevated" className="p-6 text-center space-y-5">
          {/* Animated Success Icon */}
          <div className="w-16 h-16 rounded-full bg-success/10 border border-success/20 text-success flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Description */}
          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-text-primary tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              {message}
            </p>
            {details && (
              <p className="text-[10px] font-mono bg-neutral-50 border border-neutral-200/30 p-2 rounded-lg text-text-secondary truncate mt-1">
                {details}
              </p>
            )}
          </div>

          {/* CTA Action Button */}
          <div className="pt-2">
            <DashboardButton variant="primary" size="sm" onClick={onClose} className="w-full">
              {actionLabel}
            </DashboardButton>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
