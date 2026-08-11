const SESSION_KEY_PREFIX = "marketiv.onboarding.umkm-dashboard-tour.started.";

export type UmkmDashboardTourPhase =
  | "dashboard"
  | "campaign-handoff"
  | "campaign-resumed"
  | "handled";

function getSessionKey(userId: string): string {
  return `${SESSION_KEY_PREFIX}${userId}`;
}

/**
 * Temporary T03 guard. It is deliberately session-scoped so T06 can replace it
 * with durable, versioned onboarding progress without a schema migration here.
 */
export function beginUmkmDashboardTourSession(userId: string): boolean {
  if (typeof window === "undefined" || !userId) return false;

  const key = getSessionKey(userId);
  if (window.sessionStorage.getItem(key) === "started") return false;

  if (window.sessionStorage.getItem(key)) return false;
  window.sessionStorage.setItem(key, "dashboard");
  return true;
}

/** No overlay was shown, so a later mount may retry after targets render. */
export function abandonUmkmDashboardTourSession(userId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(getSessionKey(userId));
}

/** Older T03 sessions used `started`; treat them as a Dashboard-only session. */
export function getUmkmDashboardTourPhase(userId: string): UmkmDashboardTourPhase | null {
  if (typeof window === "undefined" || !userId) return null;

  const value = window.sessionStorage.getItem(getSessionKey(userId));
  return value === "started" ? "dashboard" : (value as UmkmDashboardTourPhase | null);
}

function setPhase(userId: string, phase: UmkmDashboardTourPhase): void {
  if (typeof window === "undefined" || !userId) return;
  window.sessionStorage.setItem(getSessionKey(userId), phase);
}

/** Explicit user-driven boundary before existing Dashboard navigation runs. */
export function beginUmkmCampaignHandoff(userId: string): boolean {
  if (getUmkmDashboardTourPhase(userId) !== "dashboard") return false;
  setPhase(userId, "campaign-handoff");
  return true;
}

export function hasPendingUmkmCampaignHandoff(userId: string): boolean {
  return getUmkmDashboardTourPhase(userId) === "campaign-handoff";
}

/** Claim exactly once before constructing the Campaign Driver instance. */
export function claimUmkmCampaignTour(userId: string): boolean {
  if (!hasPendingUmkmCampaignHandoff(userId)) return false;
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

/** Test-only reset; production flows never reopen a started session. */
export function resetUmkmDashboardTourSessionForTest(userId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(getSessionKey(userId));
}
