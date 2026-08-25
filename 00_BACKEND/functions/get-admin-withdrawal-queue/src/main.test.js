import assert from "node:assert/strict";
import test from "node:test";

import { createGetAdminWithdrawalQueueHandler } from "./main.js";

const ORIGINAL_ENV = { ...process.env };

function setEnv() {
  Object.assign(process.env, {
    APPWRITE_FUNCTION_API_ENDPOINT: "https://appwrite.test/v1",
    APPWRITE_FUNCTION_PROJECT_ID: "marketiv-test",
    APPWRITE_API_KEY: "test-key",
    APPWRITE_DATABASE_ID: "marketiv-db",
  });
}

function responseRecorder() {
  return {
    value: null,
    json(body, statusCode = 200) {
      this.value = { body, statusCode };
      return this.value;
    },
  };
}

function request(body = {}, userId = "admin-1") {
  return {
    method: "POST",
    headers: { "x-appwrite-user-id": userId },
    bodyJson: body,
  };
}

test.afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test("non-admin cannot read sensitive withdrawal rows", async () => {
  setEnv();
  let withdrawalReads = 0;
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") {
        return { total: 1, documents: [{ userId: "creator-1", role: "creator", status: "active" }] };
      }
      if (collectionId === "withdrawals") withdrawalReads += 1;
      return { total: 0, documents: [] };
    },
  };
  const handler = createGetAdminWithdrawalQueueHandler({
    createDatabases: () => databases,
    createUsers: () => ({ get: async () => ({ status: true, labels: [], prefs: {} }) }),
  });
  const res = responseRecorder();

  await handler({ req: request({}, "creator-1"), res, log() {}, error() {} });

  assert.equal(res.value.statusCode, 403);
  assert.equal(withdrawalReads, 0);
});

test("self-assigned admin preference cannot authorize queue access", async () => {
  setEnv();
  let withdrawalReads = 0;
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") return { total: 0, documents: [] };
      if (collectionId === "withdrawals") withdrawalReads += 1;
      return { total: 0, documents: [] };
    },
  };
  const handler = createGetAdminWithdrawalQueueHandler({
    createDatabases: () => databases,
    createUsers: () => ({
      get: async () => ({ status: true, labels: [], prefs: { role: "admin" } }),
    }),
  });
  const res = responseRecorder();

  await handler({ req: request({}, "creator-1"), res, log() {}, error() {} });

  assert.equal(res.value.statusCode, 403);
  assert.equal(withdrawalReads, 0);
});

test("server admin label cannot bypass inactive app profile", async () => {
  setEnv();
  let withdrawalReads = 0;
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") {
        return { total: 1, documents: [{ userId: "admin-1", role: "creator", status: "suspended" }] };
      }
      if (collectionId === "withdrawals") withdrawalReads += 1;
      return { total: 0, documents: [] };
    },
  };
  const handler = createGetAdminWithdrawalQueueHandler({
    createDatabases: () => databases,
    createUsers: () => ({
      get: async () => ({ status: true, labels: ["admin"], prefs: {} }),
    }),
  });
  const res = responseRecorder();

  await handler({ req: request(), res, log() {}, error() {} });

  assert.equal(res.value.statusCode, 403);
  assert.equal(withdrawalReads, 0);
});

test("admin authorization fails closed when app profile lookup fails", async () => {
  setEnv();
  const handler = createGetAdminWithdrawalQueueHandler({
    createDatabases: () => ({
      async listDocuments() { throw new Error("database unavailable"); },
    }),
    createUsers: () => ({
      get: async () => ({ status: true, labels: ["admin"], prefs: {} }),
    }),
  });
  const res = responseRecorder();

  await handler({ req: request(), res, log() {}, error() {} });

  assert.equal(res.value.statusCode, 403);
});

test("active admin receives operational withdrawal DTO and pagination", async () => {
  setEnv();
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") {
        return { total: 1, documents: [{ userId: "admin-1", role: "admin", status: "active" }] };
      }
      if (collectionId === "withdrawals") {
        return {
          total: 1,
          documents: [{
            $id: "wd-1",
            $createdAt: "2026-08-25T01:00:00.000Z",
            userId: "creator-1",
            amount: 250000,
            payoutMethod: "bank",
            providerName: "BCA",
            accountNumber: "1234567890",
            accountName: "Creator Satu",
            status: "processing",
            processing_at: "2026-08-25T02:00:00.000Z",
            processedAt: null,
            failure_reason: null,
            transfer_reference: null,
            admin_note: "Sedang dicek",
          }],
        };
      }
      if (collectionId === "creator_profiles") {
        return {
          total: 1,
          documents: [{
            userId: "creator-1",
            displayName: "Kreator Satu",
            username: "@kreatorsatu",
            avatarUrl: "https://cdn.test/avatar.jpg",
          }],
        };
      }
      throw new Error(`Unexpected collection ${collectionId}`);
    },
  };
  const handler = createGetAdminWithdrawalQueueHandler({
    createDatabases: () => databases,
    createUsers: () => ({ get: async () => null }),
  });
  const res = responseRecorder();

  await handler({
    req: request({ status: "processing", limit: 25, offset: 50 }),
    res,
    log() {},
    error(error) { throw error; },
  });

  assert.equal(res.value.statusCode, 200);
  assert.deepEqual(res.value.body, {
    items: [{
      id: "wd-1",
      userId: "creator-1",
      creator: {
        name: "Kreator Satu",
        username: "@kreatorsatu",
        avatarUrl: "https://cdn.test/avatar.jpg",
      },
      amount: 250000,
      payoutMethod: "bank",
      providerName: "BCA",
      accountNumber: "1234567890",
      accountName: "Creator Satu",
      status: "processing",
      requestedAt: "2026-08-25T01:00:00.000Z",
      processingAt: "2026-08-25T02:00:00.000Z",
      processedAt: null,
      failureReason: null,
      transferReference: null,
      adminNote: "Sedang dicek",
      processedBy: null,
    }],
    total: 1,
    limit: 25,
    offset: 50,
  });
});

test("invalid status is rejected before queue query", async () => {
  setEnv();
  let reads = 0;
  const handler = createGetAdminWithdrawalQueueHandler({
    createDatabases: () => ({
      async listDocuments() {
        reads += 1;
        return { total: 0, documents: [] };
      },
    }),
    createUsers: () => ({ get: async () => null }),
  });
  const res = responseRecorder();

  await handler({ req: request({ status: "pending" }), res, log() {}, error() {} });

  assert.equal(res.value.statusCode, 400);
  assert.equal(reads, 0);
});
