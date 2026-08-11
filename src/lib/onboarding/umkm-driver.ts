"use client";

import { driver, type DriveStep, type Driver, type Popover } from "driver.js";

/** Stable dashboard targets introduced by T01. */
export type UmkmOnboardingAnchor =
  | "dashboard-overview"
  | "campaign-nav"
  | "create-campaign";

export interface UmkmOnboardingStep {
  id: string;
  anchor: UmkmOnboardingAnchor;
  title: string;
  description: string;
  side?: Popover["side"];
  align?: Popover["align"];
}

export interface StartUmkmOnboardingTourOptions {
  onDestroyed?: () => void;
}

let activeDriver: Driver | undefined;

export function getOnboardingSelector(anchor: UmkmOnboardingAnchor): string {
  return `[data-onboarding="${anchor}"]`;
}

function toDriverStep(step: UmkmOnboardingStep): DriveStep | null {
  const selector = getOnboardingSelector(step.anchor);

  if (!document.querySelector(selector)) return null;

  return {
    element: selector,
    popover: {
      title: step.title,
      description: step.description,
      side: step.side,
      align: step.align,
    },
  };
}

/** Remove current Driver.js overlay before another tour is created or on unmount. */
export function destroyUmkmOnboardingTour(): void {
  const currentDriver = activeDriver;
  activeDriver = undefined;

  if (currentDriver?.isActive()) currentDriver.destroy();
}

/**
 * Explicit presentation-only entry point. Persistence and first-run rules stay
 * with future onboarding flow code, not Driver.js.
 */
export function startUmkmOnboardingTour(
  steps: UmkmOnboardingStep[],
  options: StartUmkmOnboardingTourOptions = {}
): Driver | null {
  if (typeof window === "undefined") return null;

  destroyUmkmOnboardingTour();

  const driverSteps = steps
    .map(toDriverStep)
    .filter((step): step is DriveStep => step !== null);

  if (driverSteps.length === 0) return null;

  const tour = driver({
    steps: driverSteps,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    allowKeyboardControl: true,
    showProgress: true,
    progressText: "{{current}} dari {{total}}",
    nextBtnText: "Lanjut",
    prevBtnText: "Kembali",
    doneBtnText: "Selesai",
    popoverClass: "marketiv-onboarding-popover",
    skipMissingElement: true,
    onPopoverRender: (popover) => {
      const skipButton = document.createElement("button");
      skipButton.type = "button";
      skipButton.className = "driver-popover-skip-btn";
      skipButton.textContent = "Lewati";
      skipButton.addEventListener("click", () => tour.destroy());
      popover.footerButtons.prepend(skipButton);
    },
    onDestroyed: () => {
      if (activeDriver === tour) activeDriver = undefined;
      options.onDestroyed?.();
    },
  });

  activeDriver = tour;
  tour.drive();
  return tour;
}
