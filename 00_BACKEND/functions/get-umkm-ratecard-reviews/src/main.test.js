import assert from "node:assert/strict";
import test from "node:test";

import { createUmkmRatecardReviewsHandler } from "./main.js";

Object.assign(process.env, {
  APPWRITE_FUNCTION_API_ENDPOINT: "https://appwrite.test/v1",
  APPWRITE_FUNCTION_PROJECT_ID: "marketiv-test",
  APPWRITE_DATABASE_ID: "marketiv-db",
});

const baseCollections = () => ({
  orders: [],
  offers: [],
  conversations: [],
  creator_profiles: [],
  rate_card_packages: [],
  escrows: [],
  deliverables: [],
  ratecard_deliverable_validations: [],
  revisions: [],
  campaigns: [{ $id: "campaign-1", title: "Must never be read" }],
});

function createDatabase(seed = {}) {
  const collections = { ...baseCollections(), ...seed };
  const calls = [];

  return {
    calls,
    async listDocuments(_databaseId, collectionId, queries = []) {
      calls.push({ collectionId, queries });
      let documents = [...(collections[collectionId] || [])];

      for (const raw of queries) {
        const query = typeof raw === "string" ? JSON.parse(raw) : raw;
        if (query.method === "equal") {
          const allowed = new Set(query.values.map(String));
          documents = documents.filter((document) =>
            allowed.has(String(document[query.attribute]))
          );
        }
        if (query.method === "orderDesc") {
          const key = query.attribute;
          documents.sort((a, b) => String(b[key] || "").localeCompare(String(a[key] || "")));
        }
        if (query.method === "cursorAfter") {
          const index = documents.findIndex((document) => document.$id === query.values[0]);
          if (index >= 0) documents = documents.slice(index + 1);
        }
        if (query.method === "limit") documents = documents.slice(0, query.values[0]);
      }

      return { documents, total: documents.length };
    },
  };
}

function request(bodyJson = {}, userId = "umkm-1") {
  return {
    method: "POST",
    bodyJson,
    headers: {
      "x-appwrite-user-id": userId,
      "x-appwrite-key": "dynamic-key",
    },
  };
}

function response() {
  const calls = [];
  return {
    calls,
    json(body, statusCode = 200) {
      calls.push({ body, statusCode });
      return { body, statusCode };
    },
  };
}

function handlerFor(database) {
  return createUmkmRatecardReviewsHandler({
    createDatabases: () => database,
  });
}

test("lists every Rate Card order when one conversation has multiple orders", async () => {
  const database = createDatabase({
    orders: [
      {
        $id: "order-1",
        $createdAt: "2026-08-01T00:00:00.000Z",
        offerId: "offer-1",
        packageId: "package-1",
        packageNameSnapshot: "Video Starter",
        packagePriceSnapshot: 100_000,
        creatorId: "creator-1",
        umkmId: "umkm-1",
        amount: 100_000,
        status: "completed",
        revision_limit: 1,
      },
      {
        $id: "order-2",
        $createdAt: "2026-09-01T00:00:00.000Z",
        offerId: "offer-2",
        packageId: "package-2",
        packageNameSnapshot: "Video Plus",
        packagePriceSnapshot: 200_000,
        creatorId: "creator-1",
        umkmId: "umkm-1",
        amount: 200_000,
        status: "in_progress",
        revision_limit: 0,
      },
      {
        $id: "campaign-order",
        $createdAt: "2026-09-02T00:00:00.000Z",
        creatorId: "creator-1",
        umkmId: "umkm-1",
        amount: 300_000,
        status: "in_progress",
      },
    ],
    offers: [
      { $id: "offer-1", conversationId: "conversation-1", title: "Launch Lama", description: "1 video", revisionLimit: 1 },
      { $id: "offer-2", conversationId: "conversation-1", title: "Launch Baru", description: "2 video", revisionLimit: 2 },
    ],
    conversations: [
      { $id: "conversation-1", umkm_id: "umkm-1", creator_id: "creator-1" },
    ],
    creator_profiles: [
      { $id: "profile-1", userId: "creator-1", displayName: "Ayu", avatarUrl: "https://cdn.test/ayu.jpg" },
    ],
    rate_card_packages: [
      { $id: "package-1", name: "Video Starter", description: "Starter", output: "1 video", price: 100_000, revisionLimit: 1 },
      { $id: "package-2", name: "Video Plus", description: "Plus", output: "2 video", price: 200_000, revisionLimit: 2 },
    ],
    escrows: [
      { $id: "escrow-1", orderId: "order-1", status: "released", amount: 100_000 },
      { $id: "escrow-2", orderId: "order-2", status: "held", amount: 200_000 },
    ],
    deliverables: [
      { $id: "deliverable-1", orderId: "order-1", version: 1, status: "approved", source: "external_url", fileUrl: "https://work.test/v1", createdAt: "2026-08-02T00:00:00.000Z" },
      { $id: "deliverable-2", orderId: "order-2", version: 1, status: "submitted", source: "external_url", fileUrl: "https://work.test/v2", createdAt: "2026-09-02T00:00:00.000Z" },
    ],
    ratecard_deliverable_validations: [
      { $id: "validation-1", deliverableId: "deliverable-1", status: "valid", reviewedAt: "2026-08-03T00:00:00.000Z" },
      { $id: "validation-2", deliverableId: "deliverable-2", status: "valid", reviewedAt: "2026-09-03T00:00:00.000Z" },
    ],
    revisions: [{ $id: "revision-1", orderId: "order-2", status: "open", $createdAt: "2026-09-03T00:00:00.000Z" }],
  });
  const res = response();

  await handlerFor(database)({ req: request(), res, log: () => {}, error: () => {} });

  assert.equal(res.calls[0].statusCode, 200);
  assert.deepEqual(res.calls[0].body.map((item) => item.orderId), ["order-2", "order-1"]);
  assert.equal(res.calls[0].body[0].conversationId, "conversation-1");
  assert.equal(res.calls[0].body[1].orderStatus, "completed");
  assert.equal(res.calls[0].body[0].revisionCount, 1);
  assert.equal(res.calls[0].body[0].revisionLimit, 2);
  assert.equal(res.calls[0].body[0].latestDeliverable.id, "deliverable-2");
  assert.equal(res.calls[0].body[0].validation.status, "valid");
  assert.equal(database.calls.some((call) => call.collectionId.startsWith("campaign")), false);

  const callCounts = Object.groupBy(database.calls, (call) => call.collectionId);
  for (const calls of Object.values(callCounts)) assert.equal(calls.length, 1);
});

test("returns 404 for a foreign UMKM order detail", async () => {
  const database = createDatabase({
    orders: [{ $id: "foreign-order", umkmId: "umkm-2", creatorId: "creator-2", status: "in_progress" }],
  });
  const res = response();

  await handlerFor(database)({
    req: request({ orderId: "foreign-order" }, "umkm-1"),
    res,
    log: () => {},
    error: () => {},
  });

  assert.equal(res.calls[0].statusCode, 404);
  assert.deepEqual(res.calls[0].body, { error: "Review pekerjaan tidak ditemukan." });
});

test("excludes a caller-owned non-Rate-Card order and hides its detail", async () => {
  const database = createDatabase({
    orders: [{
      $id: "campaign-order",
      umkmId: "umkm-1",
      creatorId: "creator-1",
      amount: 500_000,
      status: "in_progress",
    }],
  });
  const listRes = response();
  const detailRes = response();

  await handlerFor(database)({ req: request(), res: listRes, log: () => {}, error: () => {} });
  await handlerFor(database)({
    req: request({ orderId: "campaign-order" }),
    res: detailRes,
    log: () => {},
    error: () => {},
  });

  assert.deepEqual(listRes.calls[0].body, []);
  assert.equal(detailRes.calls[0].statusCode, 404);
});

test("uses only highest deliverable version for current validation", async () => {
  const database = createDatabase({
    orders: [{
      $id: "order-1",
      $createdAt: "2026-09-01T00:00:00.000Z",
      offerId: "offer-1",
      packageId: "package-1",
      creatorId: "creator-1",
      umkmId: "umkm-1",
      amount: 100_000,
      status: "revision",
      revision_limit: 2,
    }],
    offers: [{ $id: "offer-1", conversationId: "conversation-1", title: "Project", revisionLimit: 2 }],
    conversations: [{ $id: "conversation-1", umkm_id: "umkm-1", creator_id: "creator-1" }],
    creator_profiles: [{ $id: "profile-1", userId: "creator-1", displayName: "Ayu" }],
    rate_card_packages: [{ $id: "package-1", name: "Paket", description: "Scope", output: "1 video", price: 100_000, revisionLimit: 2 }],
    deliverables: [
      { $id: "deliverable-v1", orderId: "order-1", version: 1, status: "revision_requested", source: "external_url", fileUrl: "https://work.test/v1", createdAt: "2026-09-02T00:00:00.000Z" },
      { $id: "deliverable-v2", orderId: "order-1", version: 2, status: "submitted", source: "external_url", fileUrl: "https://work.test/v2", createdAt: "2026-09-03T00:00:00.000Z" },
    ],
    ratecard_deliverable_validations: [
      { $id: "validation-v1", deliverableId: "deliverable-v1", status: "valid", reviewedAt: "2026-09-02T12:00:00.000Z", reviewNotes: "V1 valid" },
    ],
    revisions: [{ $id: "revision-1", orderId: "order-1", status: "open" }],
  });
  const res = response();

  await handlerFor(database)({
    req: request({ orderId: "order-1" }),
    res,
    log: () => {},
    error: () => {},
  });

  assert.equal(res.calls[0].statusCode, 200);
  assert.equal(res.calls[0].body.latestDeliverable.id, "deliverable-v2");
  assert.equal(res.calls[0].body.validation.status, "pending");
  assert.deepEqual(res.calls[0].body.deliverableHistory.map((item) => item.id), [
    "deliverable-v2",
    "deliverable-v1",
  ]);
});

test("rejects missing authoritative caller", async () => {
  const database = createDatabase();
  const res = response();
  const req = request();
  delete req.headers["x-appwrite-user-id"];

  await handlerFor(database)({ req, res, log: () => {}, error: () => {} });

  assert.equal(res.calls[0].statusCode, 401);
});
