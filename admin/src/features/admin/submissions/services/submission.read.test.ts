import { beforeEach, describe, expect, it, vi } from "vitest";

const createExecution = vi.fn();
vi.mock("@/lib/admin/appwrite", () => ({
  functions: { createExecution },
  FUNCTION_IDS: { getAdminSubmissionQueue: "get-admin-submission-queue" },
  databases: {}, databaseId: "db", COLLECTIONS: {},
}));

const { getCampaignSubmissions, AdminSubmissionReadError } = await import("./submission.service");

const item = {
  id: "sub-1", campaignId: "campaign-1", status: "pending", submittedAt: "2026-01-01T00:00:00.000Z",
  creator: { id: "creator-1", name: "Creator", username: "@creator" },
  campaign: { id: "campaign-1", title: "Campaign", rewardPer1000Views: 10000, platform: "tiktok" },
  umkm: { id: "umkm-1", name: "UMKM" }, platform: "tiktok", postUrl: "https://example.test/post",
};

describe("getCampaignSubmissions secure read", () => {
  beforeEach(() => createExecution.mockReset());
  it("maps successful queue and preserves real empty result", async () => {
    createExecution.mockResolvedValueOnce({ status: "completed", responseStatusCode: 200, responseBody: JSON.stringify({ items: [item], total: 1 }) });
    await expect(getCampaignSubmissions("pending")).resolves.toEqual([item]);
    createExecution.mockResolvedValueOnce({ status: "completed", responseStatusCode: 200, responseBody: JSON.stringify({ items: [], total: 0 }) });
    await expect(getCampaignSubmissions("pending")).resolves.toEqual([]);
  });
  it.each([401, 403, 500])("throws Function HTTP %i without fixture fallback", async (statusCode) => {
    createExecution.mockResolvedValueOnce({ status: "failed", responseStatusCode: statusCode, responseBody: JSON.stringify({ error: "denied" }) });
    await expect(getCampaignSubmissions("pending")).rejects.toMatchObject({ name: "AdminSubmissionReadError", statusCode });
  });
  it("rejects malformed Function response", async () => {
    createExecution.mockResolvedValueOnce({ status: "completed", responseStatusCode: 200, responseBody: "not-json" });
    await expect(getCampaignSubmissions("pending")).rejects.toBeInstanceOf(AdminSubmissionReadError);
  });
});
