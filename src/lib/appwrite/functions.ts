/**
 * Appwrite Functions Service Wrapper
 *
 * Exposes Functions SDK for triggering trusted backend execution.
 * All sensitive mutations (claim campaign, escrow, withdrawal, payout)
 * must be triggered via Functions — never directly from frontend state.
 *
 * Agregasi/join baca yang tidak bisa dipetakan setia dari satu collection juga
 * lewat sini — lihat FUNCTION_IDS. Kontrak DTO: 00_BACKEND/functions/<id>/src/main.js.
 */
import { Functions, ExecutionMethod, AppwriteException } from "appwrite";
import { client } from "./client";
import type { ServiceErrorCode } from "@/types/domain";

export const functions = new Functions(client);

/** ID Function harus sama persis dengan `$id` di 00_BACKEND/appwrite.config.json. */
export const FUNCTION_IDS = {
  // ── Baca (DTO agregasi) ──────────────────────────────────────────────────
  umkmDashboardSummary: "get-umkm-dashboard-summary",
  umkmFinanceSummary: "get-umkm-finance-summary",
  umkmProfile: "get-umkm-profile",
  creatorDirectory: "get-creator-directory",
  creatorProfile: "get-creator-profile",
  creatorDashboardSummary: "get-creator-dashboard-summary",
  // Pasangan DTO ruang negosiasi. Keduanya di-key conversationId dan menjoin
  // offers → orders → escrows; yang berbeda hanya sisi peserta dan semantik fee
  // (seller-side, ADR-008). Lihat header masing-masing Function.
  creatorNegotiations: "get-creator-negotiations",
  umkmNegotiations: "get-umkm-negotiations",
  // ── Tulis / aksi (Sprint 3) ──────────────────────────────────────────────
  aiBrief: "ai-brief",
  createPayment: "create-payment",
  cancelPayment: "cancel-payment",
  requestWithdrawal: "request-withdrawal",
  validateAndUpload: "validate-and-upload",
  // ── Auth (Sprint 6) ──────────────────────────────────────────────────────
  /**
   * Dieksekusi SINKRON dari klien setelah account.updatePrefs, bukan lewat event
   * users.*.create: Function membaca role dari prefs, dan prefs baru ada setelah
   * sesi hidup — jadi saat event menyala prefs masih kosong dan Function menolak
   * 400. Lihat handoff-auth-sprint6.md §A-1.
   *
   * Butuh `execute` untuk role `users`; belum diberikan, jadi 401 sampai tim
   * backend bertindak. Kegagalannya sengaja tidak menggagalkan register.
   */
  createUserProfile: "create-user-profile",
} as const;

export type FunctionId = (typeof FUNCTION_IDS)[keyof typeof FUNCTION_IDS];

/** Error eksekusi Function dengan `code` siap dipetakan ke ServiceResult. */
export class FunctionExecutionError extends Error {
  readonly code: ServiceErrorCode;
  readonly statusCode: number;

  constructor(message: string, statusCode: number, code: ServiceErrorCode) {
    super(message);
    this.name = "FunctionExecutionError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

const statusToCode = (statusCode: number): ServiceErrorCode => {
  if (statusCode === 401) return "auth";
  if (statusCode === 403) return "forbidden";
  if (statusCode === 404) return "not_found";
  // 409 = konflik yang bisa diperbaiki user (amount mismatch create-payment,
  // kuota penuh validate-and-upload, permintaan withdrawal duplikat).
  if (statusCode === 400 || statusCode === 409 || statusCode === 422) return "validation";
  if (statusCode >= 500) return "server";
  return "unknown";
};

/**
 * Eksekusi Function secara sinkron dan parse body JSON-nya.
 *
 * Function mengembalikan HTTP status di dalam `responseStatusCode` — bukan
 * sebagai exception SDK — jadi status non-2xx harus diperiksa manual.
 *
 * @throws FunctionExecutionError bila eksekusi gagal atau body bukan JSON valid.
 */
export async function executeFunction<T>(
  functionId: FunctionId,
  body?: unknown
): Promise<T> {
  let execution;
  try {
    execution = await functions.createExecution({
      functionId,
      body: body === undefined ? undefined : JSON.stringify(body),
      async: false,
      method: ExecutionMethod.POST,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    const statusCode = err instanceof AppwriteException ? err.code : 0;
    throw new FunctionExecutionError(
      `Gagal menjalankan Function ${functionId}`,
      statusCode,
      statusCode ? statusToCode(statusCode) : "server"
    );
  }

  if (execution.status === "failed") {
    throw new FunctionExecutionError(`Function ${functionId} gagal dieksekusi`, 500, "server");
  }

  const statusCode = execution.responseStatusCode;
  let payload: unknown;
  try {
    payload = execution.responseBody ? JSON.parse(execution.responseBody) : null;
  } catch {
    throw new FunctionExecutionError(
      `Function ${functionId} mengembalikan respons non-JSON`,
      statusCode,
      "server"
    );
  }

  if (statusCode < 200 || statusCode >= 300) {
    const message =
      (payload as { error?: string } | null)?.error ?? `Function ${functionId} mengembalikan ${statusCode}`;
    throw new FunctionExecutionError(message, statusCode, statusToCode(statusCode));
  }

  return payload as T;
}
