"use client";

import { ArrowLeft, ArrowRight, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CampaignWizardFooterProps {
  currentStep: number;
  stepsCount: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
  totalPaymentText?: string;
}

export function CampaignWizardFooter({
  currentStep,
  stepsCount,
  onBack,
  onNext,
  nextDisabled = false,
  isSubmitting = false,
  totalPaymentText,
}: CampaignWizardFooterProps) {
  const isLastStep = currentStep === stepsCount;

  return (
    <div
      className="mt-8 pt-5 border-t border-neutral-200/80 flex flex-col gap-3"
    >
      {/* Top security notice on last step */}
      {isLastStep && (
        <div className="flex items-center justify-center sm:justify-end gap-1.5 text-[11px] text-text-muted font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pembayaran diproses aman melalui <strong className="text-text-primary">Midtrans</strong></span>
        </div>
      )}

      <div className="flex flex-row items-center justify-between gap-3">
        {/* Step dots indicator (desktop) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {Array.from({ length: stepsCount }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i + 1 === currentStep
                  ? "w-6 bg-orange-500"
                  : i + 1 < currentStep
                  ? "w-2 bg-emerald-500"
                  : "w-2 bg-neutral-200"
              )}
            />
          ))}
          <span className="text-xs text-text-muted font-semibold ml-2 tabular-nums">
            Langkah {currentStep} dari {stepsCount}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto sm:ml-auto">
          {/* Back button */}
          {currentStep > 1 && (
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-5 sm:px-6 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs sm:text-sm font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none shrink-0"
            >
              <ArrowLeft className="w-4 h-4 shrink-0 text-ink-800" strokeWidth={2.5} />
              <span>Kembali</span>
            </button>
          )}

          {/* Next / Submit button */}
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || isSubmitting}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 min-h-[44px] px-6 sm:px-7 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs sm:text-sm font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Memproses...</span>
              </>
            ) : isLastStep ? (
              <>
                <CreditCard className="w-4.5 h-4.5 shrink-0" strokeWidth={2.5} />
                <span className="whitespace-nowrap">
                  {totalPaymentText ? `Bayar ${totalPaymentText}` : "Bayar Sekarang"}
                </span>
              </>
            ) : (
              <>
                <span className="whitespace-nowrap">Langkah Berikutnya</span>
                <ArrowRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
