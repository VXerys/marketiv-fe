import assert from "node:assert/strict";
import test from "node:test";

import { runWithdrawalTransitionAtomically } from "./withdrawal-transition.js";

const ENV = {
  appwriteEndpoint: "https://appwrite.test/v1",
  appwriteProjectId: "marketiv-test",
  appwriteApiKey: "test-key",
  databaseId: "marketiv-db",
  walletsCollectionId: "wallets",
  withdrawalsCollectionId: "withdrawals",
  transactionsCollectionId: "transactions",
};

function jsonResponse(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() { return body === undefined ? "" : JSON.stringify(body); },
  };
}

test("reversal transaction stages deterministic ledger before wallet credit and commits all writes", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return jsonResponse(201, { $id: "dbtx-1" });
    }
    return jsonResponse(200, {});
  };

  await runWithdrawalTransitionAtomically(ENV, {
    kind: "reverse",
    withdrawalId: "wd-1",
    withdrawalData: { status: "reversed" },
    primaryTransactionId: "tx-primary",
    primaryTransactionStatus: "failed",
    walletId: "wallet-1",
    amount: 250000,
    userId: "creator-1",
    reversalLedgerId: "tx-reversal",
  }, fetchImpl);

  assert.equal(calls.length, 6);
  assert.match(calls[1].url, /tables\/transactions\/rows$/);
  assert.equal(calls[1].body.rowId, "tx-reversal");
  assert.deepEqual(calls[1].body.data, {
    userId: "creator-1",
    amount: 250000,
    type: "withdrawal_reversal",
    referenceId: "wd-1",
    referenceType: "withdrawal",
    status: "completed",
  });
  assert.match(calls[2].url, /wallets\/rows\/wallet-1\/balance\/increment$/);
  assert.deepEqual(calls[2].body, { value: 250000, transactionId: "dbtx-1" });
  assert.equal(calls[3].body.data.status, "failed");
  assert.equal(calls[4].body.data.status, "reversed");
  assert.deepEqual(calls[5].body, { commit: true });
});

test("existing reversal ledger aborts before wallet credit", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return jsonResponse(201, { $id: "dbtx-2" });
    }
    if (url.endsWith("/tables/transactions/rows")) {
      return jsonResponse(409, { message: "Row already exists" });
    }
    return jsonResponse(200, {});
  };

  await assert.rejects(
    runWithdrawalTransitionAtomically(ENV, {
      kind: "reverse",
      withdrawalId: "wd-1",
      withdrawalData: { status: "reversed" },
      primaryTransactionId: "tx-primary",
      primaryTransactionStatus: "failed",
      walletId: "wallet-1",
      amount: 250000,
      userId: "creator-1",
      reversalLedgerId: "tx-reversal",
    }, fetchImpl),
    (error) => error.status === 409 && error.transactionPhase === "stage",
  );

  assert.equal(calls.some((call) => call.url.includes("/balance/increment")), false);
  assert.deepEqual(calls.at(-1).body, { rollback: true });
});

test("HTTP 500 commit error is marked ambiguous and is not rolled back", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, method: options.method, body });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return jsonResponse(201, { $id: "dbtx-ambiguous" });
    }
    if (body.commit === true) return jsonResponse(500, { message: "response lost" });
    return jsonResponse(200, {});
  };

  await assert.rejects(
    runWithdrawalTransitionAtomically(ENV, {
      kind: "succeed",
      withdrawalId: "wd-1",
      withdrawalData: { status: "succeeded", transfer_reference: "TRX-1" },
      primaryTransactionId: "tx-primary",
      primaryTransactionStatus: "completed",
    }, fetchImpl),
    (error) => error.status === 500
      && error.transactionPhase === "commit"
      && error.commitOutcome === "ambiguous",
  );

  assert.equal(calls.some((call) => call.body.rollback === true), false);
});

test("network failure during commit is ambiguous and is not rolled back", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, method: options.method, body });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return jsonResponse(201, { $id: "dbtx-network" });
    }
    if (body.commit === true) throw new TypeError("fetch failed");
    return jsonResponse(200, {});
  };

  await assert.rejects(
    runWithdrawalTransitionAtomically(ENV, {
      kind: "state",
      withdrawalId: "wd-1",
      withdrawalData: { status: "processing" },
    }, fetchImpl),
    (error) => error.transactionPhase === "commit"
      && error.commitOutcome === "ambiguous",
  );

  assert.equal(calls.some((call) => call.body.rollback === true), false);
});

test("transaction creation failure is identified as create phase", async () => {
  const fetchImpl = async () => jsonResponse(503, { message: "unavailable" });

  await assert.rejects(
    runWithdrawalTransitionAtomically(ENV, {
      kind: "state",
      withdrawalId: "wd-1",
      withdrawalData: { status: "processing" },
    }, fetchImpl),
    (error) => error.status === 503 && error.transactionPhase === "create",
  );
});

test("HTTP 409 commit conflict is definitive and rolls back", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    const body = JSON.parse(options.body);
    calls.push({ url, method: options.method, body });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return jsonResponse(201, { $id: "dbtx-conflict" });
    }
    if (body.commit === true) return jsonResponse(409, { message: "transaction conflict" });
    return jsonResponse(200, {});
  };

  await assert.rejects(
    runWithdrawalTransitionAtomically(ENV, {
      kind: "state",
      withdrawalId: "wd-1",
      withdrawalData: { status: "processing" },
    }, fetchImpl),
    (error) => error.status === 409
      && error.transactionPhase === "commit"
      && error.commitOutcome === "definitive",
  );

  assert.deepEqual(calls.at(-1).body, { rollback: true });
});

test("success transaction updates primary ledger and withdrawal together", async () => {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method, body: JSON.parse(options.body) });
    if (url.endsWith("/tablesdb/transactions") && options.method === "POST") {
      return jsonResponse(201, { $id: "dbtx-3" });
    }
    return jsonResponse(200, {});
  };

  await runWithdrawalTransitionAtomically(ENV, {
    kind: "succeed",
    withdrawalId: "wd-1",
    withdrawalData: { status: "succeeded", transfer_reference: "TRX-1" },
    primaryTransactionId: "tx-primary",
    primaryTransactionStatus: "completed",
  }, fetchImpl);

  assert.equal(calls.length, 4);
  assert.equal(calls[1].body.data.status, "completed");
  assert.equal(calls[2].body.data.status, "succeeded");
  assert.deepEqual(calls[3].body, { commit: true });
});
