import type { ServiceResult, ServiceErrorCode } from "@/types/domain";
import { FunctionExecutionError } from "@/lib/appwrite/functions";
import { getSession } from "@/services/auth/session.service";

/**
 * Helper ServiceResult bersama untuk lapisan Appwrite (baca & tulis).
 *
 * Sebelumnya `Doc`/`str`/`num`/`mapErrorCode`/`failFromError`/`requireUserId`
 * diduplikasi persis di umkm-appwrite.service.ts dan creator-appwrite.service.ts.
 * Sprint 3 menambah jalur tulis (fail write, validasi klien) yang HARUS identik
 * di kedua domain, jadi satu sumber kebenaran di sini.
 *
 * Aturan pesan (jangan diubah tanpa alasan):
 * - Baca gagal  → "Gagal memuat data. Coba lagi."   (perilaku Sprint 1/2)
 * - Tulis gagal → "Gagal menyimpan data. Coba lagi." (kecuali validation/Function)
 * UI bercabang di `code`, TIDAK pernah mem-parse teks `error`.
 */

export type Doc = Record<string, unknown>;

export const str = (v: unknown): string => (typeof v === "string" ? v : "");
export const num = (v: unknown): number => (typeof v === "number" ? v : 0);

/** `null as unknown as T` di satu tempat, bukan tersebar di 20 pemanggil. */
export const noData = <T>(): T => null as unknown as T;

/**
 * BACA. Tidak pernah menghasilkan "validation" — perilaku identik Sprint 1/2.
 * Function DTO sudah memetakan HTTP status → ServiceErrorCode sendiri.
 */
export const mapErrorCode = (err: unknown): ServiceErrorCode => {
  if (err instanceof FunctionExecutionError) return err.code;

  const code = (err as { code?: number })?.code;
  if (code === 401) return "auth";
  if (code === 403) return "forbidden";
  if (code === 404) return "not_found";
  if (typeof code === "number" && code >= 500) return "server";
  return "unknown";
};

/**
 * TULIS. Sama dengan mapErrorCode, PLUS 400/409 → "validation" untuk error SDK
 * langsung (createDocument/updateDocument menolak payload / konflik) supaya UI
 * bisa menampilkannya sebagai kesalahan input, bukan "server error".
 */
export const mapWriteErrorCode = (err: unknown): ServiceErrorCode => {
  if (err instanceof FunctionExecutionError) return err.code;

  const code = (err as { code?: number })?.code;
  if (code === 400 || code === 409 || code === 422) return "validation";
  if (code === 401) return "auth";
  if (code === 403) return "forbidden";
  if (code === 404) return "not_found";
  if (typeof code === "number" && code >= 500) return "server";
  return "unknown";
};

export const ok = <T>(data: T): ServiceResult<T> => ({ success: true, data });

export const fail = <T>(
  message: string,
  code: ServiceErrorCode,
  empty: T
): ServiceResult<T> => ({ success: false, data: empty, error: message, code });

/**
 * Hasil validasi klien (Zod) — dipanggil SEBELUM SDK. Satu-satunya sumber
 * "validation" yang andal di sisi klien karena error SDK baca tidak memetakannya.
 */
export const failValidation = <T>(message: string, empty: T): ServiceResult<T> =>
  fail(message, "validation", empty);

/** BACA gagal — pesan generik Sprint 1/2. */
export const failFromError = <T>(err: unknown, empty: T): ServiceResult<T> => ({
  success: false,
  data: empty,
  error: "Gagal memuat data. Coba lagi.",
  code: mapErrorCode(err),
});

/**
 * TULIS gagal. Untuk error validation, pakai `validationMessage` bila diberikan;
 * bila `err` adalah FunctionExecutionError, teruskan pesan Function (sudah ditulis
 * manusia di backend). Selain itu pesan generik "Gagal menyimpan data.".
 */
export const failFromWriteError = <T>(
  err: unknown,
  empty: T,
  validationMessage?: string
): ServiceResult<T> => {
  const code = mapWriteErrorCode(err);
  let error = "Gagal menyimpan data. Coba lagi.";
  if (err instanceof FunctionExecutionError && err.message) {
    error = err.message;
  } else if (code === "validation" && validationMessage) {
    error = validationMessage;
  }
  return { success: false, data: empty, error, code };
};

/** Ambil userId sesi aktif, atau ServiceResult error yang siap dikembalikan. */
export async function requireUserId<T>(
  empty: T
): Promise<{ ok: true; userId: string } | { ok: false; result: ServiceResult<T> }> {
  const session = await getSession();
  if (!session.success || !session.data) {
    return {
      ok: false,
      result: {
        success: false,
        data: empty,
        error: session.error ?? "Sesi tidak ditemukan. Silakan login.",
        code: session.code ?? "auth",
      },
    };
  }
  return { ok: true, userId: session.data.userId };
}
