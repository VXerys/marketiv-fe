export const UMKM_ONBOARDING_VERSION = 1;

const STORAGE_KEY_PREFIX = "marketiv:onboarding:umkm:";

export type UmkmOnboardingStatus = "in-progress" | "completed" | "skipped";
export type UmkmOnboardingPhase = "dashboard" | "campaign";

export interface PersistedUmkmOnboarding {
  version: number;
  status: UmkmOnboardingStatus;
  phase: UmkmOnboardingPhase;
}

function getStorageKey(userId: string): string {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function isPersistedUmkmOnboarding(value: unknown): value is PersistedUmkmOnboarding {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const record = value as Record<string, unknown>;
  return record.version === UMKM_ONBOARDING_VERSION
    && (record.status === "in-progress" || record.status === "completed" || record.status === "skipped")
    && (record.phase === "dashboard" || record.phase === "campaign");
}

/** Returns only valid state for the current onboarding experience revision. */
export function readUmkmOnboardingPersistence(userId: string): PersistedUmkmOnboarding | null {
  if (typeof window === "undefined" || !userId) return null;

  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isPersistedUmkmOnboarding(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Best-effort durable boundary. Storage availability never gates onboarding UI. */
export function writeUmkmOnboardingPersistence(
  userId: string,
  status: UmkmOnboardingStatus,
  phase: UmkmOnboardingPhase
): void {
  if (typeof window === "undefined" || !userId) return;

  const next: PersistedUmkmOnboarding = {
    version: UMKM_ONBOARDING_VERSION,
    status,
    phase,
  };

  try {
    const existing = window.localStorage.getItem(getStorageKey(userId));
    if (existing === JSON.stringify(next)) return;
    window.localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
  } catch {
    // Privacy modes and quota failures must leave runtime onboarding usable.
  }
}

/** Test seam; no production flow clears durable onboarding history. */
export function resetUmkmOnboardingPersistenceForTest(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  try {
    window.localStorage.removeItem(getStorageKey(userId));
  } catch {
    // Test cleanup remains best effort under a deliberately failing storage mock.
  }
}

export function getUmkmOnboardingStorageKeyForTest(userId: string): string {
  return getStorageKey(userId);
}
