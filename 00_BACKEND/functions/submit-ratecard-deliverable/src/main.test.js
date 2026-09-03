import assert from "node:assert/strict";
import test from "node:test";

import {
  createSubmitRatecardDeliverableHandler,
  deliverableDocumentId,
} from "./main.js";

const NOW = "2026-09-02T03:00:00.000Z";

function responseRecorder() {
  return {
    value: null,
    json(body, statusCode = 200) {
      this.value = { body, statusCode };
      return this.value;
    },
  };
}

function request(body, userId = "creator_1", method = "POST") {
  return {
    method,
    headers: userId ? { "x-appwrite-user-id": userId } : {},
    bodyJson: body,
  };
}

function makeDatabases({
  order = {
    $id: "order_1",
    creatorId: "creator_1",
    umkmId: "umkm_1",
    status: "in_progress",
  },
  latest = null,
  file = {
    $id: "file_1",
    userId: "creator_1",
    status: "active",
    $permissions: ['read("user:creator_1")', 'read("user:umkm_1")'],
  },
} = {}) {
  const state = { createCalls: [] };
  return {
    state,
    async getDocument(_databaseId, collectionId, documentId) {
      if (collectionId === "orders" && documentId === order?.$id) return { ...order };
      if (collectionId === "user_files" && documentId === file?.$id) return { ...file };
      throw Object.assign(new Error("Not found"), { code: 404 });
    },
    async listDocuments(_databaseId, collectionId) {
      assert.equal(collectionId, "deliverables");
      return { total: latest ? 1 : 0, documents: latest ? [{ ...latest }] : [] };
    },
    async createDocument(databaseId, collectionId, documentId, data, permissions) {
      state.createCalls.push({ databaseId, collectionId, documentId, data, permissions });
      return {
        $id: documentId,
        $createdAt: NOW,
        ...data,
      };
    },
  };
}

async function run(databases, req) {
  const handler = createSubmitRatecardDeliverableHandler({
    createDatabases: () => databases,
    createId: () => "deliverable_2",
    getEnvironment: () => ({
      databaseId: "database_1",
      ordersCollectionId: "orders",
      deliverablesCollectionId: "deliverables",
      userFilesCollectionId: "user_files",
    }),
    now: () => new Date(NOW),
  });
  const res = responseRecorder();
  await handler({ req, res, log() {}, error() {} });
  return res.value;
}

const externalInput = {
  orderId: "order_1",
  source: "external_url",
  fileUrl: "https://drive.example.test/deliverable",
  notes: "Versi final",
};

test("owner Creator submits latest version with least-privilege permissions", async () => {
  const databases = makeDatabases({
    latest: { $id: "deliverable_1", version: 1 },
  });

  const result = await run(databases, request(externalInput));

  assert.equal(result.statusCode, 200);
  assert.deepEqual(result.body, {
    id: "deliverable_2",
    orderId: "order_1",
    source: "external_url",
    fileUrl: "https://drive.example.test/deliverable",
    notes: "Versi final",
    version: 2,
    status: "submitted",
    createdAt: NOW,
  });
  assert.equal(databases.state.createCalls.length, 1);
  assert.deepEqual(databases.state.createCalls[0].data, {
    orderId: "order_1",
    source: "external_url",
    fileUrl: "https://drive.example.test/deliverable",
    fileId: null,
    notes: "Versi final",
    version: 2,
    status: "submitted",
    createdAt: NOW,
  });
  assert.deepEqual(databases.state.createCalls[0].permissions, [
    'read("user:creator_1")',
    'read("user:umkm_1")',
    'update("user:umkm_1")',
  ]);
  assert.ok(!databases.state.createCalls[0].permissions.includes('update("user:creator_1")'));
  assert.ok(!databases.state.createCalls[0].permissions.includes('read("users")'));
  assert.ok(!databases.state.createCalls[0].permissions.includes('read("any")'));
});

test("other Creator cannot submit for owner Creator order", async () => {
  const databases = makeDatabases();

  const result = await run(databases, request(externalInput, "creator_2"));

  assert.equal(result.statusCode, 403);
  assert.equal(databases.state.createCalls.length, 0);
});

test("UMKM cannot submit Creator deliverable", async () => {
  const databases = makeDatabases();

  const result = await run(databases, request(externalInput, "umkm_1"));

  assert.equal(result.statusCode, 403);
  assert.equal(databases.state.createCalls.length, 0);
});

test("order outside in_progress or revision is rejected", async () => {
  const databases = makeDatabases({
    order: {
      $id: "order_1",
      creatorId: "creator_1",
      umkmId: "umkm_1",
      status: "completed",
    },
  });

  const result = await run(databases, request(externalInput));

  assert.equal(result.statusCode, 409);
  assert.equal(databases.state.createCalls.length, 0);
});

test("storage deliverable requires existing active caller-owned metadata", async () => {
  const missingFileDatabases = makeDatabases({ file: null });
  const storageInput = {
    orderId: "order_1",
    source: "storage",
    fileUrl: "https://appwrite.example.test/file",
    fileId: "file_missing",
  };

  const missing = await run(missingFileDatabases, request(storageInput));
  assert.equal(missing.statusCode, 404);

  const foreignFileDatabases = makeDatabases({
    file: { $id: "file_1", userId: "creator_2", status: "active" },
  });
  const foreign = await run(
    foreignFileDatabases,
    request({ ...storageInput, fileId: "file_1" })
  );
  assert.equal(foreign.statusCode, 403);

  const deletedFileDatabases = makeDatabases({
    file: { $id: "file_1", userId: "creator_1", status: "deleted" },
  });
  const deleted = await run(
    deletedFileDatabases,
    request({ ...storageInput, fileId: "file_1" })
  );
  assert.equal(deleted.statusCode, 409);
});

test("storage deliverable requires HTTPS URL and existing UMKM read grant", async () => {
  const unsharedDatabases = makeDatabases({
    file: {
      $id: "file_1",
      userId: "creator_1",
      status: "active",
      $permissions: ['read("user:creator_1")'],
    },
  });
  const storageInput = {
    orderId: "order_1",
    source: "storage",
    fileUrl: "https://appwrite.example.test/file",
    fileId: "file_1",
  };

  const unshared = await run(unsharedDatabases, request(storageInput));
  assert.equal(unshared.statusCode, 409);
  assert.equal(unsharedDatabases.state.createCalls.length, 0);

  const sharedDatabases = makeDatabases();
  const unsafeUrl = await run(
    sharedDatabases,
    request({ ...storageInput, fileUrl: "javascript:alert(document.domain)" })
  );
  assert.equal(unsafeUrl.statusCode, 400);
  assert.equal(sharedDatabases.state.createCalls.length, 0);

  const valid = await run(sharedDatabases, request(storageInput));
  assert.equal(valid.statusCode, 200);
  assert.equal(valid.body.fileId, "file_1");
});

test("deliverable document ID serializes concurrent version creation", () => {
  const first = deliverableDocumentId("order_1", 2);

  assert.equal(first, deliverableDocumentId("order_1", 2));
  assert.notEqual(first, deliverableDocumentId("order_1", 3));
  assert.notEqual(first, deliverableDocumentId("order_2", 2));
  assert.match(first, /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/);
});

test("unauthenticated, non-POST, missing order, and invalid URL return stable statuses", async () => {
  const databases = makeDatabases();

  assert.equal((await run(databases, request(externalInput, ""))).statusCode, 401);
  assert.equal((await run(databases, request(externalInput, "creator_1", "GET"))).statusCode, 405);
  assert.equal(
    (await run(makeDatabases({ order: null }), request(externalInput))).statusCode,
    404
  );
  assert.equal(
    (
      await run(
        databases,
        request({ ...externalInput, fileUrl: "http://insecure.example.test/file" })
      )
    ).statusCode,
    400
  );
});
