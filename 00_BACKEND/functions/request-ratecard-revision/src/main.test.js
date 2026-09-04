import assert from "node:assert/strict";
import test from "node:test";

import { createRequestRatecardRevisionHandler } from "./main.js";

const NOW = "2026-09-04T03:00:00.000Z";

function responseRecorder() {
  return {
    value: null,
    json(body, statusCode = 200) {
      this.value = { body, statusCode };
      return this.value;
    },
  };
}

function request(body, userId = "umkm_1", method = "POST") {
  return {
    method,
    headers: userId ? { "x-appwrite-user-id": userId } : {},
    bodyJson: body,
  };
}

function makeDatabases({
  caller = { userId: "umkm_1", role: "umkm", status: "active" },
  order = {
    $id: "order_1",
    umkmId: "umkm_1",
    creatorId: "creator_1",
    status: "in_progress",
    revision_limit: 2,
    revision_count: 0,
    review_deadline_at: "2026-09-07T03:00:00.000Z",
    reminder_sent_at: "2026-09-05T03:00:00.000Z",
  },
  deliverables = [{
    $id: "deliverable_1",
    orderId: "order_1",
    version: 1,
    status: "submitted",
    source: "external_url",
    fileUrl: "https://drive.example.test/v1",
  }],
  revisions = [],
} = {}) {
  const state = {
    caller,
    order: { ...order },
    deliverables: deliverables.map((item) => ({ ...item })),
    revisions: revisions.map((item) => ({ ...item })),
    createCalls: [],
    updateCalls: [],
  };

  return {
    state,
    async listDocuments(_databaseId, collectionId, queries = []) {
      if (collectionId === "users") {
        return { total: state.caller ? 1 : 0, documents: state.caller ? [{ ...state.caller }] : [] };
      }
      if (collectionId === "revisions") {
        return { total: state.revisions.length, documents: state.revisions.map((item) => ({ ...item })) };
      }
      if (collectionId === "deliverables") {
        const sorted = [...state.deliverables].sort((a, b) => Number(b.version) - Number(a.version));
        return { total: sorted.length, documents: sorted.slice(0, 1) };
      }
      throw new Error(`Unexpected list collection: ${collectionId}`);
    },
    async getDocument(_databaseId, collectionId, documentId) {
      if (collectionId === "orders" && documentId === state.order.$id) return { ...state.order };
      const existing = state.revisions.find((item) => item.$id === documentId);
      if (collectionId === "revisions" && existing) return { ...existing };
      throw Object.assign(new Error("Not found"), { code: 404 });
    },
    async createDocument(databaseId, collectionId, documentId, data, permissions) {
      if (state.revisions.some((item) => item.$id === documentId)) {
        throw Object.assign(new Error("Already exists"), { code: 409 });
      }
      const document = { $id: documentId, $createdAt: NOW, ...data };
      state.revisions.push(document);
      state.createCalls.push({ databaseId, collectionId, documentId, data, permissions });
      return document;
    },
    async updateDocument(_databaseId, collectionId, documentId, data) {
      state.updateCalls.push({ collectionId, documentId, data });
      if (collectionId === "orders") {
        state.order = { ...state.order, ...data };
        return state.order;
      }
      if (collectionId === "deliverables") {
        const index = state.deliverables.findIndex((item) => item.$id === documentId);
        state.deliverables[index] = { ...state.deliverables[index], ...data };
        return state.deliverables[index];
      }
      throw new Error(`Unexpected update collection: ${collectionId}`);
    },
  };
}

async function run(databases, req) {
  const handler = createRequestRatecardRevisionHandler({
    createDatabases: () => databases,
    createRevisionId: (_orderId, count) => `revision_${count}`,
    getEnvironment: () => ({
      databaseId: "database_1",
      usersCollectionId: "users",
      ordersCollectionId: "orders",
      deliverablesCollectionId: "deliverables",
      revisionsCollectionId: "revisions",
      offersCollectionId: "offers",
      packagesCollectionId: "rate_card_packages",
    }),
    now: () => new Date(NOW),
  });
  const res = responseRecorder();
  await handler({ req, res, log() {}, error() {} });
  return res.value;
}

test("active UMKM owner requests revision and resets review timer without financial writes", async () => {
  const databases = makeDatabases();
  const result = await run(databases, request({
    orderId: "order_1",
    message: "Perbaiki hook pembuka.",
    umkmId: "forged_umkm",
    creatorId: "forged_creator",
    role: "creator",
  }));

  assert.equal(result.statusCode, 200);
  assert.equal(result.body.orderId, "order_1");
  assert.equal(result.body.requestedBy, "umkm_1");
  assert.deepEqual(databases.state.createCalls[0].permissions, [
    'read("user:umkm_1")',
    'read("user:creator_1")',
  ]);
  assert.deepEqual(databases.state.updateCalls, [
    { collectionId: "deliverables", documentId: "deliverable_1", data: { status: "revision_requested" } },
    {
      collectionId: "orders",
      documentId: "order_1",
      data: { status: "revision", review_deadline_at: null, reminder_sent_at: null },
    },
  ]);
  assert.equal(databases.state.order.revision_count, 0);
  assert.equal(databases.state.order.review_deadline_at, null);
  assert.equal(databases.state.order.reminder_sent_at, null);
  assert.equal(databases.state.deliverables[0].status, "revision_requested");
  assert.equal(databases.state.revisions.length, 1);
  assert.deepEqual(databases.state.createCalls.map((call) => call.collectionId), ["revisions"]);
  assert.deepEqual(databases.state.createCalls[0].data, {
    orderId: "order_1",
    requestedBy: "umkm_1",
    message: "Perbaiki hook pembuka.",
    status: "open",
  });
});

test("missing Appwrite caller is unauthorized", async () => {
  const databases = makeDatabases();
  const result = await run(databases, request({ orderId: "order_1", message: "no caller" }, ""));

  assert.equal(result.statusCode, 401);
  assert.equal(databases.state.revisions.length, 0);
});

test("Creator cannot request revision", async () => {
  const databases = makeDatabases({
    caller: { userId: "creator_1", role: "creator", status: "active" },
  });
  const result = await run(databases, request({ orderId: "order_1", message: "forge" }, "creator_1"));

  assert.equal(result.statusCode, 403);
  assert.equal(databases.state.revisions.length, 0);
  assert.equal(databases.state.updateCalls.length, 0);
});

test("UMKM from another order gets anti-enumeration 404 and cannot mutate it", async () => {
  const databases = makeDatabases();
  const result = await run(databases, request({ orderId: "order_1", message: "forge" }, "umkm_other"));

  assert.equal(result.statusCode, 404);
  assert.equal(databases.state.revisions.length, 0);
  assert.equal(databases.state.updateCalls.length, 0);
});

test("latest deliverable must be submitted, so duplicate request is rejected", async () => {
  const databases = makeDatabases({
    order: { ...makeDatabases().state.order, status: "revision" },
    deliverables: [{ $id: "deliverable_1", orderId: "order_1", version: 1, status: "revision_requested" }],
  });
  const result = await run(databases, request({ orderId: "order_1", message: "double click" }));

  assert.equal(result.statusCode, 409);
  assert.equal(databases.state.revisions.length, 0);
  assert.equal(databases.state.updateCalls.length, 0);
});

test("revision limit is enforced from total revision rows", async () => {
  const databases = makeDatabases({
    revisions: [{ $id: "revision_1", orderId: "order_1", status: "resolved" }, { $id: "revision_2", orderId: "order_1", status: "open" }],
  });
  const result = await run(databases, request({ orderId: "order_1", message: "over limit" }));

  assert.equal(result.statusCode, 409);
  assert.match(result.body.error, /Batas revisi/);
  assert.equal(databases.state.updateCalls.length, 0);
});

test("revision state allows second cycle after Creator submits v2 while order remains revision", async () => {
  const databases = makeDatabases({
    order: { ...makeDatabases().state.order, status: "revision", revision_count: 1 },
    deliverables: [{ $id: "deliverable_2", orderId: "order_1", version: 2, status: "submitted" }],
    revisions: [{ $id: "revision_1", orderId: "order_1", status: "open" }],
  });
  const result = await run(databases, request({ orderId: "order_1", message: "Perbaiki versi kedua." }));

  assert.equal(result.statusCode, 200);
  assert.equal(databases.state.revisions.length, 2);
  assert.equal(databases.state.deliverables[0].status, "revision_requested");
  assert.equal(databases.state.order.status, "revision");
  assert.equal(databases.state.order.revision_count, 1);
});

test("invalid message and ineligible order are rejected before writes", async () => {
  const invalidMessage = makeDatabases();
  const emptyResult = await run(invalidMessage, request({ orderId: "order_1", message: "   " }));
  assert.equal(emptyResult.statusCode, 400);
  assert.equal(invalidMessage.state.revisions.length, 0);

  const invalidState = makeDatabases({
    order: { ...makeDatabases().state.order, status: "completed" },
  });
  const stateResult = await run(invalidState, request({ orderId: "order_1", message: "too late" }));
  assert.equal(stateResult.statusCode, 409);
  assert.equal(invalidState.state.revisions.length, 0);
});
