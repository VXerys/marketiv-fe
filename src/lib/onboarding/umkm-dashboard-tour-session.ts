const SESSION_KEY_PREFIX = "marketiv.onboarding.umkm-dashboard-tour.started.";

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

  window.sessionStorage.setItem(key, "started");
  return true;
}

/** No overlay was shown, so a later mount may retry after targets render. */
export function abandonUmkmDashboardTourSession(userId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(getSessionKey(userId));
}

/** Test-only reset; production flows never reopen a started session. */
export function resetUmkmDashboardTourSessionForTest(userId: string): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(getSessionKey(userId));
}
