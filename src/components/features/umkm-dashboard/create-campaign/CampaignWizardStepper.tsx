import { cn } from "@/lib/utils";

interface CampaignWizardStepperProps {
  currentStep: number;
  stepsCount: number;
  productInfoValid: boolean;
  briefValid: boolean;
  assetValid: boolean;
  budgetValid: boolean;
  reviewValid: boolean;
  stepValidationTried?: Record<number, boolean>;
}

export function CampaignWizardStepper({
  currentStep,
  stepsCount,
  productInfoValid,
  briefValid,
  assetValid,
  budgetValid,
  reviewValid,
  stepValidationTried = {},
}: CampaignWizardStepperProps) {
  
  const stepTitles = [
    "Produk",
    "Brief",
    "Aset",
    "Budget",
    "Review",
  ];

  // Helper mapping validity
  const getStepState = (stepNum: number) => {
    const tried = stepValidationTried[stepNum];
    let isValid = false;
    if (stepNum === 1) isValid = productInfoValid;
    else if (stepNum === 2) isValid = briefValid;
    else if (stepNum === 3) isValid = assetValid;
    else if (stepNum === 4) isValid = budgetValid;
    else if (stepNum === 5) isValid = reviewValid;

    if (currentStep === stepNum) {
      return tried && !isValid ? "invalid" : "active";
    }
    if (isValid) return "completed";
    if (tried) return "invalid";
    return "pending";
  };

  return (
    <div className="mb-6">
      
      {/* Desktop Stepper */}
      <div className="hidden md:flex items-center justify-between bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4.5 rounded-2xl shadow-[0_4px_12px_-5px_rgba(0,0,0,0.015),_inset_0_1px_0_rgba(255,255,255,0.95)]">
        {stepTitles.map((title, index) => {
          const stepNum = index + 1;
          const state = getStepState(stepNum);
          
          const isCompleted = state === "completed";
          const isActive = state === "active";
          const isInvalid = state === "invalid";

          return (
            <div key={stepNum} className="flex-1 flex items-center group last:flex-initial">
              {/* Step Circle */}
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-extrabold transition-all border duration-300 shadow-2xs",
                    isCompleted
                      ? "bg-success text-white border-success"
                      : isInvalid
                      ? "bg-danger text-white border-danger"
                      : isActive
                      ? "bg-primary text-white border-primary"
                      : "bg-neutral-50 border-neutral-200 text-text-muted"
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : isInvalid ? (
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </div>
                
                <span
                  className={cn(
                    "text-xs font-extrabold tracking-wider transition-colors",
                    isActive
                      ? "text-primary"
                      : isCompleted
                      ? "text-text-primary"
                      : isInvalid
                      ? "text-danger"
                      : "text-text-muted"
                  )}
                >
                  {title}
                </span>
              </div>

              {/* Connector line */}
              {stepNum < stepsCount && (
                <div className="flex-1 mx-4 h-0.5 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full bg-primary transition-all duration-500",
                      isCompleted ? "bg-success w-full" : isInvalid ? "bg-danger w-full" : isActive ? "w-1/2" : "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper Progress Bar */}
      <div className="md:hidden bg-white/70 backdrop-blur-md border border-neutral-200/50 p-4 rounded-xl shadow-[0_4px_12px_-5px_rgba(0,0,0,0.015),_inset_0_1px_0_rgba(255,255,255,0.95)] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-extrabold">
          <span className="text-primary uppercase tracking-wider">
            Step {currentStep}: {stepTitles[currentStep - 1]}
          </span>
          <span className="text-text-muted">
            {currentStep} dari {stepsCount}
          </span>
        </div>
        <div className="h-1.5 w-full bg-neutral-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / stepsCount) * 100}%` }}
          />
        </div>
      </div>

    </div>
  );
}
