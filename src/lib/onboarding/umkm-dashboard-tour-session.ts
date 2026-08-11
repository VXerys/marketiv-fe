import {
  readUmkmOnboardingPersistence,
  writeUmkmOnboardingPersistence,
} from "./umkm-onboarding-persistence";

const SESSION_KEY_PREFIX = "marketiv.onboarding.umkm-dashboard-tour.started.";

export type UmkmDashboardTourPhase =
  | "dashboard"
  | "dashboard-replay"
  | "campaign-handoff"
  | "campaign-resumed"
  | "handled";

function getSessionKey(userId: string): string {
  return `${SESSION_KEY_PREFIX}${userId}`;
}

/**
 * Runtime duplicate guard. Durable eligibility and resume state live separately.
 */
export function beginUmkmDashboardTourSession(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false;

  if (readSessionPhase(userId) === "dashboard-replay") {
    setPhase(userId, "dashboard");
    return true;
  }
  if (readSessionPhase(userId)) return false;

  const persisted = readUmkmOnboardingPersistence(userId);
  if (persisted?.status === "completed" || persisted?.status === "skipped") return false;
  if (persisted?.status === "in-progress" && persisted.phase !== "dashboard") return false;

  setPhase(userId, "dashboard");
  if (!persisted) writeUmkmOnboardingPersistence(userId, "in-progress", "dashboard");
  return true;
}

/** No overlay was shown, so a later mount may retry after targets render. */
export function abandonUmkmDashboardTourSession(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(getSessionKey(userId));
  } catch {
    // Runtime retry remains optional when session storage is unavailable.
  }
}

/** Older T03 sessions used `started`; treat them as a Dashboard-only session. */
export function getUmkmDashboardTourPhase(userId: string): UmkmDashboardTourPhase | null {
  return readSessionPhase(userId);
}

function readSessionPhase(userId: string): UmkmDashboardTourPhase | null {
  if (typeof window === "undefined" || !userId) return null;
  try {
    const value = window.sessionStorage.getItem(getSessionKey(userId));
    return value === "started" ? "dashboard" : (value as UmkmDashboardTourPhase | null);
  } catch {
    return null;
  }
}

function setPhase(userId: string, phase: UmkmDashboardTourPhase): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.sessionStorage.setItem(getSessionKey(userId), phase);
  } catch {
    // Durable state is deliberately independent from this runtime guard.
  }
}

/**
 * Explicit T05 runtime replay request. This never touches future durable
 * onboarding progress; it only makes the next Dashboard mount eligible again.
 */
export function prepareUmkmDashboardTourReplay(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false;
  if (getUmkmDashboardTourPhase(userId) === "dashboard-replay") return false;

  setPhase(userId, "dashboard-replay");
  return true;
}

/** Explicit user-driven boundary before existing Dashboard navigation runs. */
export function beginUmkmCampaignHandoff(userId: string): boolean {
  if (getUmkmDashboardTourPhase(userId) !== "dashboard") return false;
  setPhase(userId, "campaign-handoff");
  writeUmkmOnboardingPersistence(userId, "in-progress", "campaign");
  return true;
}

export function hasPendingUmkmCampaignHandoff(userId: string): boolean {
  const runtimePhase = getUmkmDashboardTourPhase(userId);
  if (runtimePhase) return runtimePhase === "campaign-handoff";

  const persisted = readUmkmOnboardingPersistence(userId);
  return persisted?.status === "in-progress" && persisted.phase === "campaign";
}

/** Claim exactly once before constructing the Campaign Driver instance. */
export function claimUmkmCampaignTour(userId: string): boolean {
  if (!hasPendingUmkmCampaignHandoff(userId)) return false;
  if (getUmkmDashboardTourPhase(userId) !== "campaign-handoff") setPhase(userId, "campaign-handoff");
  setPhase(userId, "campaign-resumed");
  return true;
}

/** A failed target lookup remains retryable while the Campaign route renders. */
export function restoreUmkmCampaignHandoff(userId: string): void {
  if (getUmkmDashboardTourPhase(userId) === "campaign-resumed") {
    setPhase(userId, "campaign-handoff");
  }
}

export function markUmkmDashboardTourHandled(userId: string): void {
  if (getUmkmDashboardTourPhase(userId) === "dashboard") setPhase(userId, "handled");
}

export function markUmkmCampaignTourHandled(userId: string): void {
  if (getUmkmDashboardTourPhase(userId) === "campaign-resumed") setPhase(userId, "handled");
}

export function markUmkmDashboardTourSkipped(userId: string): void {
  if (getUmkmDashboardTourPhase(userId) !== "dashboard") return;
  writeUmkmOnboardingPersistence(userId, "skipped", "dashboard");
  setPhase(userId, "handled");
}

export function markUmkmCampaignTourSkipped(userId: string): void {
  if (getUmkmDashboardTourPhase(userId) !== "campaign-resumed") return;
  writeUmkmOnboardingPersistence(userId, "skipped", "campaign");
  setPhase(userId, "handled");
}

export function markUmkmCampaignTourCompleted(userId: string): void {
  if (getUmkmDashboardTourPhase(userId) !== "campaign-resumed") return;
  writeUmkmOnboardingPersistence(userId, "completed", "campaign");
  setPhase(userId, "handled");
}

/** Test-only reset; production flows never reopen a started session. */
export function resetUmkmDashboardTourSessionForTest(userId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(getSessionKey(userId));
  } catch {
    // Test cleanup remains best effort under a deliberately failing storage mock.
  }
}
