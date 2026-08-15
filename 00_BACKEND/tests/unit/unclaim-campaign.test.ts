import { beforeEach, describe, expect, it, vi } from "vitest";
import { createUnclaimCampaignHandler } from "../../functions/unclaim-campaign/src/main.js";

Object.assign(process.env, {
  APPWRITE_FUNCTION_API_ENDPOINT: "https://api.example.test/v1",
  APPWRITE_FUNCTION_PROJECT_ID: "project-test",
  APPWRITE_API_KEY: "server-key",
  APPWRITE_DATABASE_ID: "db",
});

const baseClaim = { $id: "claim-1", campaignId: "campaign-1", creatorId: "creator-1", status: "claimed", claimedAt: "2026-08-15T00:00:00.000Z" };
let users: Record<string, unknown>[];
let claim: Record<string, unknown> | undefined;
let deleted = 0;
let restored = 0;
let decrementFails = false;

function response() {
  let value: { body: unknown; statusCode: number } | undefined;
  return { res: { json: (body: unknown, statusCode: number) => (value = { body, statusCode }) }, value: () => value };
}
function req(userId?: string, claimId = "claim-1") { return { method: "POST", headers: userId ? { "x-appwrite-user-id": userId } : {}, bodyJson: { claimId } }; }
function databases() {
  return {
    listDocuments: async (_db: string, collection: string) => ({ documents: collection === "users" ? users : [] }),
    getDocument: async (_db: string, _collection: string, id: string) => {
      if (!claim || id !== claim.$id) { const error = Object.assign(new Error("missing"), { code: 404 }); throw error; }
      return claim;
    },
    deleteDocument: async () => { deleted++; claim = undefined; },
    createDocument: async (_db: string, _collection: string, id: string, data: Record<string, unknown>) => { restored++; claim = { $id: id, ...data }; },
  };
}

describe("unclaim-campaign", () => {
  beforeEach(() => {
    users = [{ userId: "creator-1", role: "creator", status: "active" }];
    claim = { ...baseClaim }; deleted = 0; restored = 0; decrementFails = false;
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: !decrementFails, status: decrementFails ? 500 : 200 })));
  });

  const run = async (request = req("creator-1")) => {
    const capture = response();
    await createUnclaimCampaignHandler({ createDatabases: databases })({ req: request, res: capture.res, log: () => {}, error: () => {} });
    return capture.value();
  };

  it("returns 401 without caller", async () => expect(await run(req())).toMatchObject({ statusCode: 401 }));
  it.each(["umkm", "admin"])('rejects non-Creator %s', async (role) => { users = [{ userId: "creator-1", role, status: "active" }]; expect(await run()).toMatchObject({ statusCode: 403 }); });
  it("rejects suspended Creator", async () => { users = [{ userId: "creator-1", role: "creator", status: "suspended" }]; expect(await run()).toMatchObject({ statusCode: 403 }); });
  it("rejects wrong owner and missing claim", async () => {
    claim = { ...baseClaim, creatorId: "other" }; expect(await run()).toMatchObject({ statusCode: 403 });
    claim = undefined; expect(await run()).toMatchObject({ statusCode: 404 });
  });
  it.each(["submitted", "approved", "rejected", "expired"])('rejects non-claimed %s claim', async (status) => {
    claim = { ...baseClaim, status };
    expect(await run()).toMatchObject({ statusCode: 409 });
    expect(deleted).toBe(0);
  });
  it("hard-deletes owned claimed claim and decrements exactly once", async () => {
    expect(await run()).toMatchObject({ statusCode: 200, body: { success: true, claimId: "claim-1" } });
    expect(deleted).toBe(1);
    expect((globalThis.fetch as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
    expect(await run()).toMatchObject({ statusCode: 404 });
    expect((globalThis.fetch as ReturnType<typeof vi.fn>)).toHaveBeenCalledTimes(1);
  });
  it("returns failure and restores claim when atomic decrement fails", async () => {
    decrementFails = true;
    expect(await run()).toMatchObject({ statusCode: 500 });
    expect(deleted).toBe(1); expect(restored).toBe(1); expect(claim).toMatchObject({ status: "claimed", campaignId: "campaign-1" });
  });
});
