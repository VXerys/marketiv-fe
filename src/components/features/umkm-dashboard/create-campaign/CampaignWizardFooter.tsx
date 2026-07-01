import { DashboardButton } from "../shared/DashboardButton";

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
    <div className="mt-8 border-t border-border-soft/60 pt-5 flex items-center justify-between gap-4">
      {/* Back button */}
      <div>
        {currentStep > 1 ? (
          <DashboardButton
            variant="secondary"
            size="md"
            onClick={onBack}
            className="h-10 px-5 text-xs bg-white border border-border-soft hover:bg-neutral-50"
            disabled={isSubmitting}
          >
            Kembali
          </DashboardButton>
        ) : (
          <div /> // Spacing placeholder
        )}
      </div>

      {/* Next/Submit button */}
      <DashboardButton
        variant="primary"
        size="md"
        onClick={onNext}
        disabled={nextDisabled || isSubmitting}
        className="h-10 px-6 text-xs flex items-center gap-1.5 shadow-md shadow-primary/10"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Memproses...</span>
          </>
        ) : isLastStep ? (
          <>
            <span>Lanjut ke Pembayaran</span>
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        ) : (
          <>
            <span>Langkah Berikutnya</span>
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </>
        )}
      </DashboardButton>
    </div>
  );
}
