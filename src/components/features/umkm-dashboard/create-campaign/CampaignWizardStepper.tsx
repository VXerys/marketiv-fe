"use client";

import { cn } from "@/lib/utils";
import { Check, AlertTriangle } from "lucide-react";

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

const STEP_TITLES = ["Produk", "Arahan", "Bahan", "Anggaran", "Ringkasan"];
const STEP_SUBTITLES = ["Info & Kategori", "Gaya & Pesan", "Foto & Video", "Biaya & Kuota", "Cek & Bayar"];

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
  const getStepState = (stepNum: number) => {
    const tried = stepValidationTried[stepNum];
    let isValid = false;
    if (stepNum === 1) isValid = productInfoValid;
    else if (stepNum === 2) isValid = briefValid;
    else if (stepNum === 3) isValid = assetValid;
    else if (stepNum === 4) isValid = budgetValid;
    else if (stepNum === 5) isValid = reviewValid;

    if (currentStep === stepNum) return tried && !isValid ? "invalid" : "active";
    if (isValid) return "completed";
    if (tried) return "invalid";
    return "pending";
  };

  return (
    <div className="mb-6">

      {/* ── Desktop Stepper ──────────────────────────────────── */}
      <div
        className="hidden md:flex items-center px-5 py-4 rounded-2xl sm:rounded-[22px] shadow-3xs"
        style={{
          background: "rgba(255,253,249,0.90)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(17,24,39,.07)",
        }}
      >
        {STEP_TITLES.map((title, index) => {
          const stepNum = index + 1;
          const state = getStepState(stepNum);
          const isCompleted = state === "completed";
          const isActive    = state === "active";
          const isInvalid   = state === "invalid";
          const isPending   = state === "pending";

          return (
            <div key={stepNum} className="flex-1 flex items-center last:flex-initial">
              {/* Step node */}
              <div className="flex items-center gap-2.5 shrink-0">
                {/* Circle */}
                <div className="relative">
                  {/* Pulse ring for active step */}
                  {isActive && (
                    <span className="absolute inset-0 rounded-full animate-ping opacity-20 bg-orange-400 scale-125" />
                  )}
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center font-[800] text-[.78rem] transition-all duration-300 relative z-10",
                      isCompleted && "bg-emerald-500 text-white shadow-[0_4px_12px_rgba(16,185,129,.30)]",
                      isActive    && "bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white shadow-[0_6px_16px_rgba(234,88,12,.30)]",
                      isInvalid   && "bg-red-500 text-white shadow-[0_4px_12px_rgba(239,68,68,.25)]",
                      isPending   && "bg-white border border-neutral-200 text-ink-400 shadow-3xs",
                    )}
                  >
                    {isCompleted ? <Check size={14} strokeWidth={3} /> :
                     isInvalid   ? <AlertTriangle size={13} strokeWidth={2.5} /> :
                     stepNum}
                  </div>
                </div>

                {/* Label */}
                <div className="hidden lg:flex flex-col">
                  <span className={cn(
                    "text-[.78rem] font-[760] leading-none transition-colors",
                    isActive    && "text-orange-600",
                    isCompleted && "text-emerald-600",
                    isInvalid   && "text-red-500",
                    isPending   && "text-ink-400",
                  )}>
                    {title}
                  </span>
                  <span className="text-[.66rem] text-ink-400 font-[550] mt-0.5 leading-none">
                    {STEP_SUBTITLES[index]}
                  </span>
                </div>

                {/* Mobile-only short label */}
                <span className={cn(
                  "lg:hidden text-[.76rem] font-[760] transition-colors",
                  isActive    && "text-orange-600",
                  isCompleted && "text-emerald-600",
                  isInvalid   && "text-red-500",
                  isPending   && "text-ink-400",
                )}>
                  {title}
                </span>
              </div>

              {/* Connector line */}
              {stepNum < stepsCount && (
                <div className="flex-1 mx-3 h-[2px] rounded-full overflow-hidden bg-neutral-200/70">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      isCompleted ? "w-full bg-emerald-400" :
                      isInvalid   ? "w-full bg-red-400" :
                      isActive    ? "w-1/2 bg-gradient-to-r from-orange-400 to-orange-200" :
                      "w-0"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Mobile Stepper ──────────────────────────────────── */}
      <div
        className="md:hidden rounded-2xl px-4 py-3.5 shadow-3xs"
        style={{
          background: "rgba(255,253,249,0.90)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(17,24,39,.07)",
        }}
      >
        {/* Row: step name + counter */}
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <span className="text-[.72rem] font-[900] text-orange-600 uppercase tracking-[.10em]">
              Langkah {currentStep}
            </span>
            <span className="text-[.88rem] font-[760] text-ink-900 ml-2 font-display">
              {STEP_TITLES[currentStep - 1]}
            </span>
          </div>
          <span className="text-[.72rem] font-[700] text-ink-400 tabular-nums">
            {currentStep}/{stepsCount}
          </span>
        </div>

        {/* Dot progress */}
        <div className="flex items-center gap-1.5">
          {STEP_TITLES.map((_, i) => {
            const s = i + 1;
            const state = getStepState(s);
            return (
              <div
                key={s}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  state === "completed" ? "bg-emerald-400 flex-1" :
                  state === "active"    ? "bg-orange-500 flex-[2]" :
                  state === "invalid"   ? "bg-red-400 flex-1" :
                  "bg-neutral-200 flex-1"
                )}
              />
            );
          })}
        </div>

        {/* Subtitle */}
        <p className="text-[.72rem] text-ink-400 font-[600] mt-1.5 leading-none">
          {STEP_SUBTITLES[currentStep - 1]}
        </p>
      </div>

    </div>
  );
}
