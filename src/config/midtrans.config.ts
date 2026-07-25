/**
 * Konfigurasi publik Midtrans Snap (client-side).
 *
 * BUKAN bagian appwriteConfig — ini gateway pembayaran, bukan Appwrite.
 * Hanya client key yang boleh ada di sini; server key tinggal di Function
 * (MIDTRANS_SERVER_KEY) dan tidak pernah menyentuh browser.
 */
export const midtransConfig = {
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "",
  /** "sandbox" | "production" — menentukan URL snap.js. */
  env: process.env.NEXT_PUBLIC_MIDTRANS_ENV ?? "sandbox",
} as const;

export const isMidtransConfigured = (): boolean => midtransConfig.clientKey.length > 0;
