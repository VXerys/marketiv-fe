"use client";

import { Check } from "lucide-react";
import { AuthBrand } from "@/components/auth/AuthCard";
import { cn } from "@/lib/utils";

/**
 * Bingkai + stepper wizard onboarding, dipakai kedua role.
 *
 * Sengaja BUKAN modal dashboard: onboarding adalah halaman penuh yang dicapai
 * lewat pemantulan RoleGuard, bukan dialog di atas dashboard — dashboard-nya
 * justru belum boleh terlihat.
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4 py-10">
      <AuthBrand />

      <div className="w-full max-w-xl rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-3xs sm:p-8">
        <div className="mb-6 space-y-1.5">
          <h1 className="font-[var(--font-sora)] text-[1.35rem] font-[900] leading-tight tracking-tight text-ink-900">
            {title}
          </h1>
          <p className="text-[0.82rem] font-medium leading-relaxed text-ink-500">
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
                "h-1.5 rounded-full transition-colors",
                done || active ? "bg-orange-500" : "bg-neutral-200"
              )}
            />
            <span
              className={cn(
                "flex items-center gap-1 text-[0.68rem] font-[800] leading-tight",
                active ? "text-orange-600" : done ? "text-ink-600" : "text-ink-400"
              )}
            >
              {done && <Check size={12} strokeWidth={3} aria-hidden />}
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Tombol utama wizard — sama dengan tombol submit form auth. */
export function OnboardingPrimaryButton({
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="min-h-[44px] w-full rounded-xl bg-orange-500 px-6 text-sm font-[800] text-white transition-all hover:-translate-y-0.5 hover:bg-orange-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60 active:translate-y-0"
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
      className="min-h-[44px] w-full rounded-xl border border-neutral-200 px-6 text-sm font-[800] text-ink-600 transition-all hover:bg-neutral-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500/40 disabled:pointer-events-none disabled:opacity-60"
    >
      {children}
    </button>
  );
}
