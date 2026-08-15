import { ExecutionMethod } from "appwrite";
import { functions, FUNCTION_IDS } from "@/lib/admin/appwrite";

export interface DashboardMetrics {
  pendingSubmissionsCount: number;
  reviewedSubmissionsCount: number;
  activeCampaignsCount: number;
}

export class AdminReadError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = "AdminReadError";
  }
}

export async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  const execution = await functions.createExecution(
    FUNCTION_IDS.getAdminDashboardSummary,
    "{}",
    false,
    "/",
    ExecutionMethod.POST,
    { "content-type": "application/json" },
  );
  const body = parseExecutionBody(execution.responseBody, execution.responseStatusCode);
  if (execution.status === "failed" || execution.responseStatusCode >= 400) {
    throw new AdminReadError(execution.responseStatusCode || 500, responseError(body) || "Gagal memuat ringkasan Admin.");
  }
  if (!isMetrics(body)) throw new AdminReadError(502, "Respons ringkasan Admin tidak valid.");
  return body;
}

function parseExecutionBody(responseBody: string, statusCode: number): unknown {
  try { return responseBody ? JSON.parse(responseBody) : {}; } catch {
    throw new AdminReadError(statusCode || 502, "Respons ringkasan Admin bukan JSON valid.");
  }
}

function isMetrics(value: unknown): value is DashboardMetrics {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return ["pendingSubmissionsCount", "reviewedSubmissionsCount", "activeCampaignsCount"].every(
    (key) => typeof body[key] === "number" && Number.isFinite(body[key]),
  );
}

function responseError(value: unknown): string | undefined {
  return value && typeof value === "object" && typeof (value as Record<string, unknown>).error === "string"
    ? (value as Record<string, string>).error
    : undefined;
}
