/**
 * Konfigurasi UI autentikasi.
 *
 * Terpisah dari appwriteConfig karena src/lib/appwrite/config.ts mencerminkan
 * 00_BACKEND/appwrite.config.json — flag UI tidak punya padanan di sana.
 */
export const AUTH_CONFIG = {
  /**
   * Google OAuth. Default MATI, kebalikan polaritas useMockData: provider yang
   * belum dikonfigurasi di konsol Appwrite harus gagal tertutup, supaya tombol
   * yang pasti error tidak pernah muncul di environment mana pun.
   * Blocker A-1..A-4: 00_BACKEND/integration-context/2026-07-28-handoff-auth-sprint6.md §A-3.
   */
  googleOAuthEnabled: process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === "true",

  /** Tujuan tautan pemulihan password. Origin-nya dihitung runtime di klien. */
  recoveryPath: "/reset-password",

  oauthSuccessPath: "/auth/callback",
  oauthFailurePath: "/login?error=oauth",
} as const;
