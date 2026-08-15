import { beforeEach, describe, expect, it } from "vitest";
import { createGetAdminSubmissionQueueHandler } from "../../functions/get-admin-submission-queue/src/main.js";
import { createGetAdminDashboardSummaryHandler } from "../../functions/get-admin-dashboard-summary/src/main.js";

const env = {
  APPWRITE_FUNCTION_API_ENDPOINT: "https://api.example.test/v1",
  APPWRITE_FUNCTION_PROJECT_ID: "project-test",
  APPWRITE_API_KEY: "server-test-key",
  APPWRITE_DATABASE_ID: "database-test",
};

Object.assign(process.env, env);

function response() {
  let result: { body: unknown; statusCode: number } | undefined;
  return { res: { json: (body: unknown, statusCode: number) => (result = { body, statusCode }) }, get: () => result };
}

function request(userId?: string) { return { method: "POST", headers: userId ? { "x-appwrite-user-id": userId } : {}, bodyJson: {} }; }

describe("Admin read Function authorization", () => {
  let documents: Record<string, unknown>[];
  let calls: string[];

  beforeEach(() => { documents = []; calls = []; });

  function databases() {
    return {
      listDocuments: async (_databaseId: string, collectionId: string) => {
        calls.push(collectionId);
        if (collectionId === "users") return { total: documents.length, documents };
        if (collectionId === "campaign_submissions") return { total: 3, documents: [] };
        if (collectionId === "campaigns") return { total: 2, documents: [] };
        return { total: 0, documents: [] };
      },
    };
  }

  it("returns 401 without trusted caller identity", async () => {
    const capture = response();
    await createGetAdminSubmissionQueueHandler({ createDatabases: databases })({ req: request(), res: capture.res, log: () => {}, error: () => {} });
    expect(capture.get()).toMatchObject({ statusCode: 401 });
    expect(calls).toEqual([]);
  });

  it.each(["umkm", "creator", "admin"])('returns 403 for non-active role %s', async (role) => {
    documents = [{ userId: "user-1", role, status: role === "admin" ? "suspended" : "active" }];
    const capture = response();
    await createGetAdminSubmissionQueueHandler({ createDatabases: databases })({ req: request("user-1"), res: capture.res, log: () => {}, error: () => {} });
    expect(capture.get()).toMatchObject({ statusCode: 403 });
  });

  it("allows active admin and returns minimal queue DTO", async () => {
    documents = [{ userId: "admin-1", role: "admin", status: "active" }];
    const capture = response();
    await createGetAdminSubmissionQueueHandler({ createDatabases: databases })({ req: request("admin-1"), res: capture.res, log: () => {}, error: () => {} });
    expect(capture.get()).toMatchObject({ statusCode: 200, body: { items: [], total: 3 } });
  });

  it("uses same active-admin gate for dashboard summary", async () => {
    documents = [{ userId: "creator-1", role: "creator", status: "active" }];
    const capture = response();
    await createGetAdminDashboardSummaryHandler({ createDatabases: databases })({ req: request("creator-1"), res: capture.res, log: () => {}, error: () => {} });
    expect(capture.get()).toMatchObject({ statusCode: 403 });
  });

  it("returns factual dashboard counts for active admin", async () => {
    documents = [{ userId: "admin-1", role: "admin", status: "active" }];
    const capture = response();
    await createGetAdminDashboardSummaryHandler({ createDatabases: databases })({ req: request("admin-1"), res: capture.res, log: () => {}, error: () => {} });
    expect(capture.get()).toMatchObject({
      statusCode: 200,
      body: { pendingSubmissionsCount: 3, reviewedSubmissionsCount: 3, activeCampaignsCount: 2 },
    });
  });
});
