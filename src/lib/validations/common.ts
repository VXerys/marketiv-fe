/**
 * Common Validation Schemas & Helpers
 *
 * Reusable Zod primitives shared across campaign wizard, profile forms,
 * rate card forms, and finance forms.
 *
 * Do NOT add feature-specific schemas here.
 * Feature schemas (e.g., campaign wizard) belong in their own validation files.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Maximum allowed file size for direct Appwrite Storage uploads (100 MB). */
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

/** Minimum campaign / rate card price in Rupiah. */
export const MIN_CURRENCY_IDR = 1000;

// ---------------------------------------------------------------------------
// Primitive Helpers
// ---------------------------------------------------------------------------

/**
 * Required non-empty string.
 * Use for names, titles, descriptions, and any mandatory text field.
 */
export const requiredString = (fieldName = "Field ini") =>
  z
    .string({ error: `${fieldName} wajib diisi.` })
    .min(1, `${fieldName} tidak boleh kosong.`);

/**
 * Optional URL string.
 * Accepts empty string or a valid URL. Returns undefined when empty.
 */
export const optionalUrl = z
  .string()
  .url("URL tidak valid. Pastikan diawali dengan https://.")
  .optional()
  .or(z.literal(""));

/**
 * Required HTTPS URL.
 * Enforces HTTPS scheme — no plain HTTP or bare paths.
 */
export const requiredHttpsUrl = (fieldName = "URL") =>
  z
    .string({ error: `${fieldName} wajib diisi.` })
    .url(`${fieldName} tidak valid.`)
    .refine((url) => url.startsWith("https://"), {
      message: `${fieldName} harus menggunakan HTTPS.`,
    });

/**
 * Indonesian / WhatsApp phone number.
 * Accepts formats: 08xxx, +628xxx, 628xxx.
 * Minimum 9, maximum 15 digits (after stripping formatting chars).
 */
export const indonesianPhone = z
  .string()
  .min(9, "Nomor WhatsApp terlalu pendek.")
  .max(20, "Nomor WhatsApp terlalu panjang.")
  .regex(
    /^(\+62|62|0)[0-9]{8,14}$/,
    "Format nomor tidak valid. Gunakan format: 08xx, +628xx, atau 628xx."
  );

/**
 * Currency amount in Rupiah (integer, stored as IDR cents-equivalent).
 * Must be a positive integer — no decimals, no negatives.
 */
export const currencyAmountIDR = (min = MIN_CURRENCY_IDR) =>
  z
    .number({
      error: "Nominal harga wajib diisi atau harus berupa angka.",
    })
    .int("Nominal harus berupa bilangan bulat tanpa desimal.")
    .positive("Nominal harus lebih dari nol.")
    .min(min, `Nominal minimal adalah Rp ${min.toLocaleString("id-ID")}.`);


/**
 * External asset URL validation.
 * Used for raw video assets (Google Drive, Dropbox, OneDrive).
 * Must be HTTPS. Raw video files must NOT be uploaded to Appwrite Storage.
 */
export const externalAssetUrl = requiredHttpsUrl("Link aset eksternal");

/**
 * File size validation helper.
 * Used before uploading to Appwrite Storage.
 * Rejects files exceeding MAX_FILE_SIZE_BYTES (100 MB).
 */
export function validateFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE_BYTES;
}
