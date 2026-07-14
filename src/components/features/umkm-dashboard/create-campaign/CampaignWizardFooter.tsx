"use client";

import { ArrowLeft, ArrowRight, CreditCard, Loader2 } from "lucide-react";

interface CampaignWizardFooterProps {
  currentStep: number;
  stepsCount: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  isSubmitting?: boolean;
}

export function CampaignWizardFooter({
  currentStep,
  stepsCount,
  onBack,
  onNext,
  nextDisabled = false,
  isSubmitting = false,
}: CampaignWizardFooterProps) {
  const isLastStep = currentStep === stepsCount;

  return (
    <div
      className="mt-8 pt-5 flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-between gap-3"
      style={{ borderTop: "1px solid rgba(17,24,39,.08)" }}
    >
      {/* Step dots indicator */}
      <div className="hidden sm:flex items-center gap-1.5">
        {Array.from({ length: stepsCount }).map((_, i) => (
          <span
            key={i}
            className={
              i + 1 === currentStep
                ? "w-5 h-1.5 rounded-full bg-orange-500"
                : i + 1 < currentStep
                ? "w-1.5 h-1.5 rounded-full bg-emerald-400"
                : "w-1.5 h-1.5 rounded-full bg-neutral-200"
            }
          />
        ))}
        <span className="text-[.72rem] text-ink-400 font-[650] ml-1.5 tabular-nums">
          {currentStep}/{stepsCount}
        </span>
      </div>

      {/* Navigation buttons */}
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2.5 sm:ml-auto">
        {/* Back button */}
        {currentStep > 1 && (
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 min-h-[42px] px-5 rounded-xl border border-neutral-200/80 bg-white text-ink-700 text-[.84rem] font-[700] shadow-3xs hover:bg-neutral-50 hover:-translate-y-px active:scale-[.98] transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            <ArrowLeft size={15} strokeWidth={2.5} />
            Kembali
          </button>
        )}

        {/* Next / Submit button */}
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || isSubmitting}
          className="inline-flex items-center justify-center gap-2 min-h-[42px] px-6 rounded-xl border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-[.88rem] font-[800] tracking-[-0.01em] shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:pointer-events-none disabled:shadow-none"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={15} className="animate-spin" />
              Memproses...
            </>
          ) : isLastStep ? (
            <>
              <CreditCard size={15} strokeWidth={2.5} />
              Lanjut ke Pembayaran
            </>
          ) : (
            <>
              Langkah Berikutnya
              <ArrowRight size={15} strokeWidth={2.5} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
