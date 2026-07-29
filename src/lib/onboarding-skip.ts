/**
 * Penanda "lewati dulu" untuk wizard onboarding.
 *
 * `03_Workflows/10_Registration.md` §110 mengizinkan onboarding dilewati: user
 * tetap boleh masuk dashboard dengan `isProfileCompleted = false`, hanya fitur
 * tertentu yang terkunci (klaim campaign, tampil di direktori kreator).
 *
 * Disimpan di sessionStorage, bukan localStorage: melewati onboarding adalah
 * keputusan untuk sesi ini, bukan selamanya. Login berikutnya menawarkannya lagi
 * — dan itu memang yang diinginkan, karena profil yang belum lengkap membuat
 * kreator tidak pernah terlihat oleh UMKM.
 */
const SKIP_KEY = "marketiv.onboarding.skipped";

export function isOnboardingSkipped(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(SKIP_KEY) === "1";
  } catch {
    // Mode privasi ketat bisa melempar di sessionStorage. Anggap belum dilewati:
    // menawarkan wizard sekali lagi jauh lebih ringan daripada mengunci akses.
    return false;
  }
}

export function markOnboardingSkipped(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SKIP_KEY, "1");
  } catch {
    /* diabaikan — konsekuensinya hanya pemantulan sekali lagi */
  }
}

export function clearOnboardingSkip(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(SKIP_KEY);
  } catch {
    /* diabaikan */
  }
}
