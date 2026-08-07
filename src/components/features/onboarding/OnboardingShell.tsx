"use client";

import { Check } from "lucide-react";
import { AuthBrand } from "@/components/auth/AuthCard";
import { cn } from "@/lib/utils";

/**
 * Bingkai + stepper wizard onboarding ultra-premium, dipakai kedua role.
 */
export function OnboardingShell({
  title,
  description,
  steps,
  currentStep,
  children,
  footer,
}: {
  title: string;
  description: string;
  steps: readonly string[];
  /** 1-based. */
  currentStep: number;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-orange-50/20 px-4 py-8 sm:py-12">
      <div className="mb-4">
        <AuthBrand />
      </div>

      <div className="w-full max-w-lg rounded-[2.5rem] border border-neutral-200/90 bg-white p-6 sm:p-9 shadow-2xl transition-all duration-300">
        <div className="mb-5 space-y-1.5 text-center sm:text-left">
          <h1 className="font-display text-xl sm:text-2xl font-black leading-tight tracking-tight text-ink-950">
            {title}
          </h1>
          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-text-muted">
            {description}
          </p>
        </div>

        <Stepper steps={steps} currentStep={currentStep} />

        <div className="mt-6">{children}</div>

        <div className="mt-7 border-t border-neutral-200/60 pt-5">{footer}</div>
      </div>
    </main>
  );
}

function Stepper({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  return (
    <div className="my-2">
      {/* Progress Bars */}
      <ol
        className="flex items-center gap-2"
        aria-label={`Langkah ${currentStep} dari ${steps.length}`}
      >
        {steps.map((label, i) => {
          const stepNumber = i + 1;
          const done = stepNumber < currentStep;
          const active = stepNumber === currentStep;

          return (
            <li key={label} className="flex flex-1 flex-col gap-1.5">
              <div
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  done
                    ? "bg-emerald-500"
                    : active
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                    : "bg-neutral-100"
                )}
              />
              <span
                className={cn(
                  "flex items-center gap-1 text-[0.68rem] sm:text-xs font-extrabold leading-tight select-none",
                  active
                    ? "text-orange-600"
                    : done
                    ? "text-emerald-700"
                    : "text-text-muted"
                )}
              >
                {done ? (
                  <Check size={13} strokeWidth={3} className="text-emerald-600 shrink-0" aria-hidden />
                ) : (
                  <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-200/70 text-[9px] font-black text-ink-950 shrink-0">
                    {stepNumber}
                  </span>
                )}
                <span className="truncate">{label}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Tombol utama wizard — Marketiv Signature Pill Button. */
export function OnboardingPrimaryButton({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="min-h-[46px] w-full rounded-full border-0 bg-gradient-to-b from-[#fb7a18] to-primary-600 px-6 text-xs sm:text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}

/** Tombol sekunder (Kembali / Lewati dulu). */
export function OnboardingSecondaryButton({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="min-h-[46px] w-full rounded-full border border-neutral-200/80 bg-white px-6 text-xs sm:text-sm font-extrabold text-ink-950 shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}
