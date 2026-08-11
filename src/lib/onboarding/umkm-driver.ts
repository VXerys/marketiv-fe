"use client";

import { driver, type DriveStep, type Driver, type Popover } from "driver.js";

/** Stable dashboard targets introduced by T01. */
export type UmkmOnboardingAnchor =
  | "dashboard-overview"
  | "campaign-nav"
  | "create-campaign"
  | "campaign-create-heading";

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
  onSkipped?: () => void;
  onCompleted?: () => void;
}

let activeDriver: Driver | undefined;
let activeTargetObserver: MutationObserver | undefined;
let activeFocusRestoreTarget: HTMLElement | undefined;

export function getOnboardingSelector(anchor: UmkmOnboardingAnchor): string {
  return `[data-onboarding="${anchor}"]`;
}

function getOnboardingElements(selector: string): Element[] {
  if (typeof document === "undefined") return [];

  if (typeof document.querySelectorAll === "function") {
    return Array.from(document.querySelectorAll(selector));
  }

  // Keeps the adapter compatible with the minimal DOM seam used by existing
  // integration tests while browsers always take the querySelectorAll path.
  return document.querySelector(selector) ? [{} as Element] : [];
}

function toDriverStep(step: UmkmOnboardingStep): DriveStep | null {
  const selector = getOnboardingSelector(step.anchor);

  // A missing anchor remains skippable per T02. An ambiguous anchor is not:
  // never attach a tour to an arbitrary duplicate element.
  if (getOnboardingElements(selector).length !== 1) return null;

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
  destroyActiveTour(true);
}

function destroyActiveTour(restoreFocus: boolean): void {
  const currentDriver = activeDriver;
  activeDriver = undefined;
  activeTargetObserver?.disconnect();
  activeTargetObserver = undefined;

  if (!restoreFocus) activeFocusRestoreTarget = undefined;
  if (currentDriver?.isActive()) currentDriver.destroy();
}

function restoreFocusAfterDestroy(): void {
  const target = activeFocusRestoreTarget;
  activeFocusRestoreTarget = undefined;

  queueMicrotask(() => {
    if (target?.isConnected) target.focus();
  });
}

function observeActiveTarget(tour: Driver): void {
  if (typeof MutationObserver === "undefined" || !document.body) return;

  activeTargetObserver = new MutationObserver(() => {
    if (activeDriver !== tour || !tour.isActive()) return;

    const element = tour.getActiveStep()?.element;
    if (typeof element !== "string") return;

    // Current target removed or made ambiguous during a React rerender.
    // Destroy is technical cleanup only; flow persistence remains unchanged.
    if (getOnboardingElements(element).length !== 1) destroyUmkmOnboardingTour();
  });
  activeTargetObserver.observe(document.body, { childList: true, subtree: true });
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined"
    && typeof window.matchMedia === "function"
    && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

  destroyActiveTour(false);

  const driverSteps = steps
    .map(toDriverStep)
    .filter((step): step is DriveStep => step !== null);

  if (driverSteps.length === 0) return null;

  const previousFocus = document.activeElement;
  activeFocusRestoreTarget = typeof HTMLElement !== "undefined" && previousFocus instanceof HTMLElement
    ? previousFocus
    : undefined;

  const tour = driver({
    steps: driverSteps,
    animate: !prefersReducedMotion(),
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
      popover.closeButton?.setAttribute("aria-label", "Tutup panduan");
      const skipButton = document.createElement("button");
      skipButton.type = "button";
      skipButton.className = "driver-popover-skip-btn";
      skipButton.textContent = "Lewati";
      skipButton.setAttribute?.("aria-label", "Lewati panduan");
      skipButton.addEventListener("click", () => {
        options.onSkipped?.();
        tour.destroy();
      });
      popover.footerButtons.prepend(skipButton);
    },
    onDoneClick: (_element, _step, opts) => {
      options.onCompleted?.();
      opts.driver.destroy();
    },
    onDestroyed: () => {
      activeTargetObserver?.disconnect();
      activeTargetObserver = undefined;
      if (activeDriver === tour) activeDriver = undefined;
      restoreFocusAfterDestroy();
      options.onDestroyed?.();
    },
  });

  activeDriver = tour;
  tour.drive();
  observeActiveTarget(tour);
  return tour;
}
