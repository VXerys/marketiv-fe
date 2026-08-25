import assert from "node:assert/strict";
import test from "node:test";

import { createReviewWithdrawalHandler } from "./main.js";
import { runWithdrawalTransitionAtomically } from "./withdrawal-transition.js";

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

function request(body, userId = "admin-1") {
  return {
    method: "POST",
    headers: { "x-appwrite-user-id": userId },
    bodyJson: body,
  };
}

function makeDatabases(withdrawal) {
  const state = {
    withdrawal: { ...withdrawal },
    primaryTransaction: {
      $id: "tx-primary",
      userId: withdrawal.userId,
      amount: withdrawal.amount,
      type: "withdrawal",
      referenceId: withdrawal.$id,
      referenceType: "withdrawal",
      status: "pending",
    },
    reversalLedgers: new Map(),
    walletBalance: 500000,
    walletCredits: 0,
    notifications: [],
    reads: [],
    queries: [],
  };
  return {
    state,
    async listDocuments(_databaseId, collectionId, queries = []) {
      state.reads.push(collectionId);
      state.queries.push({ collectionId, queries });
      if (collectionId === "users") {
        return { total: 1, documents: [{ userId: "admin-1", role: "admin", status: "active" }] };
      }
      if (collectionId === "transactions") {
        const documents = [
          state.primaryTransaction,
          ...state.reversalLedgers.values(),
        ].filter((transaction) => transaction.referenceId === withdrawal.$id);
        return {
          total: documents.length,
          documents,
        };
      }
      if (collectionId === "wallets") {
        return {
          total: 1,
          documents: [{ $id: "wallet-1", userId: withdrawal.userId, balance: state.walletBalance }],
        };
      }
      return { total: 0, documents: [] };
    },
    async getDocument(_databaseId, collectionId, documentId) {
      if (collectionId === "withdrawals" && documentId === withdrawal.$id) return { ...state.withdrawal };
      if (collectionId === "transactions" && documentId === state.primaryTransaction.$id) {
        return { ...state.primaryTransaction };
      }
      if (collectionId === "transactions" && state.reversalLedgers.has(documentId)) {
        return { ...state.reversalLedgers.get(documentId) };
      }
      throw Object.assign(new Error("Not found"), { code: 404 });
    },
    async updateDocument(_databaseId, collectionId, _documentId, data) {
      if (collectionId === "withdrawals") {
        state.withdrawal = { ...state.withdrawal, ...data };
        return { ...state.withdrawal };
      }
      throw new Error(`Unexpected update ${collectionId}`);
    },
    async createDocument(_databaseId, collectionId, id, data) {
      if (collectionId === "notifications") {
        state.notifications.push({ id, ...data });
        return { $id: id, ...data };
      }
      throw new Error(`Unexpected create ${collectionId}`);
    },
  };
}

function makeAmbiguousCommitHandler(databases, transitionCalls, { commitApplied }) {
  const fetchCalls = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    fetchCalls.push({ url, method: options.method, body });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return httpResponse(201, { $id: "dbtx-ambiguous" });
    }
    if (body.commit === true) {
      if (commitApplied) applyCommittedTransition(databases.state, transitionCalls.at(-1));
      return httpResponse(500, { message: "commit response lost" });
    }
    return httpResponse(200, {});
  };

  return {
    fetchCalls,
    handler: createReviewWithdrawalHandler({
      createDatabases: () => databases,
      createUsers: () => ({ get: async () => null }),
      now: () => new Date("2026-08-25T03:00:00.000Z"),
      runTransitionAtomically: async (env, transition) => {
        transitionCalls.push(transition);
        return runWithdrawalTransitionAtomically(env, transition, fetchImpl);
      },
    }),
  };
}

function applyCommittedTransition(state, transition) {
  if (transition.kind === "reverse" && !state.reversalLedgers.has(transition.reversalLedgerId)) {
    state.reversalLedgers.set(transition.reversalLedgerId, {
      $id: transition.reversalLedgerId,
      userId: transition.userId,
      amount: transition.amount,
      type: "withdrawal_reversal",
      referenceId: transition.withdrawalId,
      referenceType: "withdrawal",
      status: "completed",
    });
    state.walletBalance += transition.amount;
    state.walletCredits += 1;
  }
  if (transition.primaryTransactionStatus) {
    state.primaryTransaction = {
      ...state.primaryTransaction,
      status: transition.primaryTransactionStatus,
    };
  }
  const withdrawalData = { ...transition.withdrawalData };
  if (withdrawalData.processing_at?.endsWith("Z")) {
    withdrawalData.processing_at = withdrawalData.processing_at.replace(/Z$/, "+00:00");
  }
  state.withdrawal = { ...state.withdrawal, ...withdrawalData };
}

function httpResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return JSON.stringify(body); },
  };
}

function makeHandler(databases, transitionCalls) {
  return createReviewWithdrawalHandler({
    createDatabases: () => databases,
    createUsers: () => ({ get: async () => null }),
    now: () => new Date("2026-08-25T03:00:00.000Z"),
    runTransitionAtomically: async (_env, transition) => {
      transitionCalls.push(transition);
      databases.state.withdrawal = {
        ...databases.state.withdrawal,
        ...transition.withdrawalData,
      };
    },
  });
}

function baseWithdrawal(status = "requested") {
  return {
    $id: "wd-1",
    userId: "creator-1",
    amount: 250000,
    status,
  };
}

test.afterEach(() => {
  process.env = { ...ORIGINAL_ENV };
});

test("non-admin mutation returns 403 before withdrawal read", async () => {
  setEnv();
  let withdrawalRead = false;
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") {
        return { total: 1, documents: [{ userId: "creator-1", role: "creator", status: "active" }] };
      }
      return { total: 0, documents: [] };
    },
    async getDocument() {
      withdrawalRead = true;
      throw new Error("must not read");
    },
  };
  const handler = createReviewWithdrawalHandler({
    createDatabases: () => databases,
    createUsers: () => ({ get: async () => ({ status: true, labels: [], prefs: {} }) }),
  });
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }, "creator-1"),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 403);
  assert.equal(withdrawalRead, false);
});

test("self-assigned admin preference cannot authorize withdrawal mutation", async () => {
  setEnv();
  let withdrawalRead = false;
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") return { total: 0, documents: [] };
      return { total: 0, documents: [] };
    },
    async getDocument() {
      withdrawalRead = true;
      throw new Error("must not read");
    },
  };
  const handler = createReviewWithdrawalHandler({
    createDatabases: () => databases,
    createUsers: () => ({
      get: async () => ({ status: true, labels: [], prefs: { role: "admin" } }),
    }),
  });
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }, "creator-1"),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 403);
  assert.equal(withdrawalRead, false);
});

test("server admin label cannot bypass inactive app profile for mutation", async () => {
  setEnv();
  let withdrawalRead = false;
  const databases = {
    async listDocuments(_databaseId, collectionId) {
      if (collectionId === "users") {
        return { total: 1, documents: [{ userId: "admin-1", role: "creator", status: "suspended" }] };
      }
      return { total: 0, documents: [] };
    },
    async getDocument() {
      withdrawalRead = true;
      throw new Error("must not read");
    },
  };
  const handler = createReviewWithdrawalHandler({
    createDatabases: () => databases,
    createUsers: () => ({
      get: async () => ({ status: true, labels: ["admin"], prefs: {} }),
    }),
  });
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 403);
  assert.equal(withdrawalRead, false);
});

test("mutation authorization fails closed when app profile lookup fails", async () => {
  setEnv();
  const handler = createReviewWithdrawalHandler({
    createDatabases: () => ({
      async listDocuments() { throw new Error("database unavailable"); },
    }),
    createUsers: () => ({
      get: async () => ({ status: true, labels: ["admin"], prefs: {} }),
    }),
  });
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 403);
});

test("requested withdrawal starts processing once with processor audit", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal());
  const transitions = [];
  const handler = makeHandler(databases, transitions);
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }),
    res,
    log() {},
    error(error) { throw error; },
  });

  assert.equal(res.value.statusCode, 200);
  assert.equal(res.value.body.status, "processing");
  assert.equal(transitions.length, 1);
  assert.deepEqual(transitions[0].withdrawalData, {
    status: "processing",
    processing_at: "2026-08-25T03:00:00.000Z",
    processed_by: "admin-1",
  });

  const second = responseRecorder();
  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }),
    res: second,
    log() {},
    error(error) { throw error; },
  });
  assert.equal(second.value.statusCode, 409);
  assert.equal(transitions.length, 1);
});

test("success requires transfer reference and processing state", async () => {
  setEnv();
  const requestedDb = makeDatabases(baseWithdrawal("requested"));
  const requestedHandler = makeHandler(requestedDb, []);
  const direct = responseRecorder();

  await requestedHandler({
    req: request({ withdrawalId: "wd-1", action: "mark_succeeded", transferReference: "TRX-1" }),
    res: direct,
    log() {},
    error(error) { throw error; },
  });
  assert.equal(direct.value.statusCode, 409);

  const processingDb = makeDatabases(baseWithdrawal("processing"));
  const processingHandler = makeHandler(processingDb, []);
  const missingReference = responseRecorder();
  await processingHandler({
    req: request({ withdrawalId: "wd-1", action: "mark_succeeded" }),
    res: missingReference,
    log() {},
    error(error) { throw error; },
  });
  assert.equal(missingReference.value.statusCode, 400);
});

test("processing withdrawal succeeds with completed primary ledger contract", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("processing"));
  const transitions = [];
  const handler = makeHandler(databases, transitions);
  const res = responseRecorder();

  await handler({
    req: request({
      withdrawalId: "wd-1",
      action: "mark_succeeded",
      transferReference: " TRX-2026-001 ",
      adminNote: " Transfer manual terverifikasi ",
    }),
    res,
    log() {},
    error(error) { throw error; },
  });

  assert.equal(res.value.statusCode, 200);
  assert.equal(res.value.body.status, "succeeded");
  assert.deepEqual(transitions[0], {
    kind: "succeed",
    withdrawalId: "wd-1",
    withdrawalData: {
      status: "succeeded",
      processedAt: "2026-08-25T03:00:00.000Z",
      processed_by: "admin-1",
      transfer_reference: "TRX-2026-001",
      admin_note: "Transfer manual terverifikasi",
    },
    primaryTransactionId: "tx-primary",
    primaryTransactionStatus: "completed",
  });
  assert.equal(databases.state.notifications.length, 1);
  const primaryLookup = databases.state.queries.find((entry) => entry.collectionId === "transactions");
  const serverFilterAttributes = primaryLookup.queries
    .map((query) => JSON.parse(query))
    .filter((query) => query.method === "equal")
    .map((query) => query.attribute);
  assert.deepEqual(serverFilterAttributes, ["referenceId"]);

  const repeated = responseRecorder();
  await handler({
    req: request({
      withdrawalId: "wd-1",
      action: "mark_succeeded",
      transferReference: "TRX-2026-001",
    }),
    res: repeated,
    log() {},
    error(error) { throw error; },
  });
  assert.equal(repeated.value.statusCode, 409);
  assert.equal(transitions.length, 1);
  assert.equal(databases.state.notifications.length, 1);
});

test("failure action requires a non-empty reason", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("requested"));
  const transitions = [];
  const handler = makeHandler(databases, transitions);
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "fail", failureReason: "   " }),
    res,
    log() {},
    error(error) { throw error; },
  });

  assert.equal(res.value.statusCode, 400);
  assert.equal(transitions.length, 0);
});

for (const status of ["requested", "processing"]) {
  test(`${status} withdrawal failure reverses balance with deterministic append ledger contract`, async () => {
    setEnv();
    const databases = makeDatabases(baseWithdrawal(status));
    const transitions = [];
    const handler = makeHandler(databases, transitions);
    const res = responseRecorder();

    await handler({
      req: request({
        withdrawalId: "wd-1",
        action: "fail",
        failureReason: "Rekening tujuan tidak valid",
        adminNote: "Konfirmasi manual gagal",
      }),
      res,
      log() {},
      error(error) { throw error; },
    });

    assert.equal(res.value.statusCode, 200);
    assert.equal(res.value.body.status, "reversed");
    assert.equal(transitions[0].kind, "reverse");
    assert.equal(transitions[0].walletId, "wallet-1");
    assert.equal(transitions[0].amount, 250000);
    assert.equal(transitions[0].reversalLedgerId, "tx102ab0d057a06bdfde53ac1b7b6d0700");
    assert.equal(transitions[0].primaryTransactionId, "tx-primary");
    assert.equal(transitions[0].primaryTransactionStatus, "failed");
    assert.deepEqual(transitions[0].withdrawalData, {
      status: "reversed",
      failure_reason: "Rekening tujuan tidak valid",
      reversed_at: "2026-08-25T03:00:00.000Z",
      processedAt: "2026-08-25T03:00:00.000Z",
      processed_by: "admin-1",
      admin_note: "Konfirmasi manual gagal",
    });
  });
}

test("repeated failure and terminal transition do not run second credit", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("requested"));
  const transitions = [];
  const handler = makeHandler(databases, transitions);

  const first = responseRecorder();
  await handler({
    req: request({ withdrawalId: "wd-1", action: "fail", failureReason: "Ditolak" }),
    res: first,
    log() {},
    error(error) { throw error; },
  });
  const second = responseRecorder();
  await handler({
    req: request({ withdrawalId: "wd-1", action: "fail", failureReason: "Ditolak" }),
    res: second,
    log() {},
    error(error) { throw error; },
  });
  const terminal = responseRecorder();
  await handler({
    req: request({ withdrawalId: "wd-1", action: "mark_succeeded", transferReference: "TRX-2" }),
    res: terminal,
    log() {},
    error(error) { throw error; },
  });

  assert.equal(first.value.statusCode, 200);
  assert.equal(second.value.statusCode, 409);
  assert.equal(terminal.value.statusCode, 409);
  assert.equal(transitions.length, 1);
});

test("lost success commit response reconciles canonical success and still notifies once", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("processing"));
  const transitions = [];
  const { handler, fetchCalls } = makeAmbiguousCommitHandler(
    databases,
    transitions,
    { commitApplied: true },
  );
  const res = responseRecorder();

  await handler({
    req: request({
      withdrawalId: "wd-1",
      action: "mark_succeeded",
      transferReference: "TRX-AMBIGUOUS-1",
    }),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 200);
  assert.equal(res.value.body.status, "succeeded");
  assert.equal(transitions.length, 1);
  assert.equal(databases.state.withdrawal.status, "succeeded");
  assert.equal(databases.state.primaryTransaction.status, "completed");
  assert.equal(databases.state.notifications.length, 1);
  assert.equal(fetchCalls.filter((call) => call.body.commit === true).length, 1);
  assert.equal(fetchCalls.some((call) => call.body.rollback === true), false);
});

test("lost reversal commit response proves one credit and still notifies once", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("processing"));
  const transitions = [];
  const { handler, fetchCalls } = makeAmbiguousCommitHandler(
    databases,
    transitions,
    { commitApplied: true },
  );
  const res = responseRecorder();

  await handler({
    req: request({
      withdrawalId: "wd-1",
      action: "fail",
      failureReason: "Transfer manual gagal",
    }),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 200);
  assert.equal(res.value.body.status, "reversed");
  assert.equal(transitions.length, 1);
  assert.equal(databases.state.walletCredits, 1);
  assert.equal(databases.state.walletBalance, 750000);
  assert.equal(databases.state.reversalLedgers.size, 1);
  assert.equal(databases.state.primaryTransaction.status, "failed");
  assert.equal(databases.state.withdrawal.status, "reversed");
  assert.equal(databases.state.notifications.length, 1);
  assert.equal(fetchCalls.filter((call) => call.body.commit === true).length, 1);
  assert.equal(fetchCalls.some((call) => call.body.rollback === true), false);
});

test("ambiguous reversal without canonical proof fails closed without second mutation", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("requested"));
  const transitions = [];
  const { handler } = makeAmbiguousCommitHandler(
    databases,
    transitions,
    { commitApplied: false },
  );
  const res = responseRecorder();

  await handler({
    req: request({
      withdrawalId: "wd-1",
      action: "fail",
      failureReason: "Ditolak admin",
    }),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 500);
  assert.match(res.value.body.error, /Muat ulang.*rekonsiliasi/i);
  assert.equal(transitions.length, 1);
  assert.equal(databases.state.walletCredits, 0);
  assert.equal(databases.state.walletBalance, 500000);
  assert.equal(databases.state.reversalLedgers.size, 0);
  assert.equal(databases.state.notifications.length, 0);
});

test("lost start-processing commit response reconciles expected processor audit", async () => {
  setEnv();
  const databases = makeDatabases(baseWithdrawal("requested"));
  const transitions = [];
  const { handler } = makeAmbiguousCommitHandler(
    databases,
    transitions,
    { commitApplied: true },
  );
  const res = responseRecorder();

  await handler({
    req: request({ withdrawalId: "wd-1", action: "start_processing" }),
    res,
    log() {},
    error() {},
  });

  assert.equal(res.value.statusCode, 200);
  assert.equal(res.value.body.status, "processing");
  assert.equal(transitions.length, 1);
  assert.equal(databases.state.withdrawal.processed_by, "admin-1");
  assert.equal(databases.state.notifications.length, 1);
});
