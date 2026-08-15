import {
  CampaignSubmissionDomain,
  ReviewApprovePayload,
  ReviewRejectPayload,
  SubmissionStatus,
} from "../types";
import { ExecutionMethod } from "appwrite";
import { functions, FUNCTION_IDS } from "@/lib/admin/appwrite";
import { executeAdminFunction } from "@/lib/admin/execute-function";

export class AdminSubmissionReadError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message);
    this.name = "AdminSubmissionReadError";
  }
}

export interface ReviewMutationResult {
  success: true;
  message: string;
  refresh: { status: "refreshed"; submissions: CampaignSubmissionDomain[] } | { status: "failed"; error: AdminSubmissionReadError };
}

interface ReviewFunctionResponse {
  success: true;
  campaignId: string;
  status: "approved" | "rejected";
}

export async function getCampaignSubmissions(statusFilter?: SubmissionStatus | "all", searchQuery?: string): Promise<CampaignSubmissionDomain[]> {
  const execution = await functions.createExecution(
    FUNCTION_IDS.getAdminSubmissionQueue, JSON.stringify({ status: statusFilter || "pending", limit: 50 }), false,
    "/", ExecutionMethod.POST, { "content-type": "application/json" },
  );
  const body = parseQueueBody(execution.responseBody, execution.responseStatusCode);
  if (execution.status === "failed" || execution.responseStatusCode >= 400) {
    throw new AdminSubmissionReadError(execution.responseStatusCode || 500, responseError(body) || "Gagal memuat antrean submission.");
  }
  if (!isQueueResponse(body)) throw new AdminSubmissionReadError(502, "Respons antrean submission tidak valid.");
  return filterSubmissions(body.items, searchQuery);
}

export async function getCampaignSubmissionById(id: string): Promise<CampaignSubmissionDomain | null> {
  const submissions = await getCampaignSubmissions("all");
  return submissions.find((item) => item.id === id) || null;
}

export async function approveCampaignSubmission(payload: ReviewApprovePayload): Promise<ReviewMutationResult> {
  if (!Number.isInteger(payload.verifiedViews) || payload.verifiedViews < 0) {
    throw new Error("Jumlah views terverifikasi harus bilangan bulat nol atau lebih.");
  }
  return reviewAndRefresh({ submissionId: payload.submissionId, status: "approved", views: payload.verifiedViews });
}

export async function rejectCampaignSubmission(payload: ReviewRejectPayload): Promise<ReviewMutationResult> {
  const notes = payload.rejectionReason.trim();
  if (!notes) throw new Error("Alasan penolakan wajib diisi.");
  return reviewAndRefresh({ submissionId: payload.submissionId, status: "rejected", notes });
}

async function reviewAndRefresh(payload: Record<string, unknown>): Promise<ReviewMutationResult> {
  const response = await executeAdminFunction(
    FUNCTION_IDS.reviewSubmission, payload, isReviewFunctionResponse, "Gagal menyimpan review submission.",
  );
  try {
    const submissions = await getCampaignSubmissions("all");
    return { success: true, message: reviewMessage(response.status), refresh: { status: "refreshed", submissions } };
  } catch (error) {
    const refreshError = error instanceof AdminSubmissionReadError
      ? error : new AdminSubmissionReadError(502, "Review tersimpan, tetapi antrean terbaru gagal dimuat.");
    return { success: true, message: reviewMessage(response.status), refresh: { status: "failed", error: refreshError } };
  }
}

function isReviewFunctionResponse(value: unknown): value is ReviewFunctionResponse {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return body.success === true && typeof body.campaignId === "string" &&
    (body.status === "approved" || body.status === "rejected");
}

function reviewMessage(status: ReviewFunctionResponse["status"]): string {
  return status === "approved" ? "Submission berhasil disetujui." : "Submission berhasil ditolak.";
}

function parseQueueBody(responseBody: string, statusCode: number): unknown {
  try { return responseBody ? JSON.parse(responseBody) : {}; } catch {
    throw new AdminSubmissionReadError(statusCode || 502, "Respons antrean submission bukan JSON valid.");
  }
}

function isQueueResponse(value: unknown): value is { items: CampaignSubmissionDomain[]; total: number } {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return Array.isArray(body.items) && typeof body.total === "number" && body.items.every(isSubmission);
}

function isSubmission(value: unknown): value is CampaignSubmissionDomain {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.campaignId === "string" && typeof item.status === "string" &&
    typeof item.submittedAt === "string" && isObject(item.creator) && isObject(item.campaign) && isObject(item.umkm);
}

function isObject(value: unknown): value is Record<string, unknown> { return Boolean(value) && typeof value === "object"; }
function responseError(value: unknown): string | undefined { return isObject(value) && typeof value.error === "string" ? value.error : undefined; }

function filterSubmissions(items: CampaignSubmissionDomain[], searchQuery?: string): CampaignSubmissionDomain[] {
  if (!searchQuery?.trim()) return items;
  const query = searchQuery.toLowerCase().trim();
  return items.filter((item) => item.creator.name.toLowerCase().includes(query) || item.creator.username.toLowerCase().includes(query) ||
    item.campaign.title.toLowerCase().includes(query) || item.umkm.name.toLowerCase().includes(query));
}
