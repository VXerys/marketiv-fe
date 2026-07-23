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
  umkmDashboardSummary: "get-umkm-dashboard-summary",
  umkmFinanceSummary: "get-umkm-finance-summary",
  umkmProfile: "get-umkm-profile",
  creatorDirectory: "get-creator-directory",
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
  if (statusCode === 400 || statusCode === 422) return "validation";
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
