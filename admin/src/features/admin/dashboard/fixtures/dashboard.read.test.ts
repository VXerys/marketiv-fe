import { beforeEach, describe, expect, it, vi } from "vitest";

const createExecution = vi.fn();
vi.mock("@/lib/admin/appwrite", () => ({
  functions: { createExecution },
  FUNCTION_IDS: { getAdminDashboardSummary: "get-admin-dashboard-summary" },
}));

const { fetchDashboardMetrics, AdminReadError } = await import("./dashboard.fixtures");
const valid = { pendingSubmissionsCount: 0, reviewedSubmissionsCount: 0, activeCampaignsCount: 3 };

describe("fetchDashboardMetrics secure read", () => {
  beforeEach(() => createExecution.mockReset());
  it("maps zero counts and reviewedSubmissionsCount", async () => {
    createExecution.mockResolvedValueOnce({ status: "completed", responseStatusCode: 200, responseBody: JSON.stringify(valid) });
    await expect(fetchDashboardMetrics()).resolves.toEqual(valid);
  });
  it.each([401, 403, 500])("throws Function HTTP %i instead of fabricated metrics", async (statusCode) => {
    createExecution.mockResolvedValueOnce({ status: "failed", responseStatusCode: statusCode, responseBody: JSON.stringify({ error: "failed" }) });
    await expect(fetchDashboardMetrics()).rejects.toBeInstanceOf(AdminReadError);
  });
  it("rejects malformed summary", async () => {
    createExecution.mockResolvedValueOnce({ status: "completed", responseStatusCode: 200, responseBody: JSON.stringify({ pendingSubmissionsCount: 0 }) });
    await expect(fetchDashboardMetrics()).rejects.toBeInstanceOf(AdminReadError);
  });
});
