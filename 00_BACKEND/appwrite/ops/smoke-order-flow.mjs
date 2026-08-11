/**
 * Smoke test live untuk jalur order pasca-remediasi UMKM-OPS-01.
 *
 * Kenapa 2 cabang, bukan 1 urutan lurus:
 * - `create-escrow` mengubah `orders.status` -> `in_progress`
 * - `cancel-order` HANYA menerima `pending_payment`
 * Jadi satu order tidak bisa melewati `create-escrow` lalu `cancel-order`.
 * Smoke yang benar:
 *   A. paid path   = create-order -> create-payment -> create-escrow
 *   B. cancel path = create-order -> cancel-order
 *
 * Pakai:
 *   node 00_BACKEND/appwrite/ops/smoke-order-flow.mjs
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { aw, DB, q } from "./client.mjs";

const CURRENT_TOS_VERSION = "v3.1";
const CREATOR_HINT = "test-user-001";
const AMOUNT = 10000;

function resolveKey() {
  if (process.env.APPWRITE_API_KEY) return process.env.APPWRITE_API_KEY;
  const prefsPath = path.join(os.homedir(), ".appwrite", "prefs.json");
  if (!fs.existsSync(prefsPath)) {
    throw new Error(`APPWRITE_API_KEY tidak diset dan ${prefsPath} tidak ada.`);
  }
  const prefs = JSON.parse(fs.readFileSync(prefsPath, "utf8"));
  const profile = prefs.current && prefs[prefs.current];
  if (!profile?.key) {
    throw new Error(`Profil Appwrite aktif di ${prefsPath} tidak punya key.`);
  }
  return profile.key;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseJson(text) {
  if (typeof text !== "string" || text === "") return text;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function makeRes() {
  return {
    body: null,
    status: 200,
    json(body, statusCode = 200) {
      this.body = body;
      this.status = statusCode;
      return { body, status: statusCode };
    },
  };
}

async function runLocal(modulePath, { payload = {}, headers = {}, method = "POST" } = {}) {
  const mod = await import(modulePath);
  const main = mod.default;
  const res = makeRes();
  const result = await main({
    req: {
      method,
      headers,
      bodyJson: payload,
      bodyText: JSON.stringify(payload),
    },
    res,
    log: () => {},
    error: () => {},
  });
  const final = result || { body: res.body, status: res.status };
  return {
    responseStatusCode: final.status ?? res.status,
    responseBody: final.body ?? res.body,
  };
}

async function waitExecution(functionId, executionId) {
  for (let i = 0; i < 20; i += 1) {
    const ex = await aw(`/functions/${functionId}/executions/${executionId}`);
    if (["completed", "failed", "crashed", "timeout"].includes(String(ex.status))) {
      return ex;
    }
    await sleep(1500);
  }
  throw new Error(`Execution ${functionId}/${executionId} tidak selesai dalam batas tunggu.`);
}

async function runFunction(functionId, payload, { headers = {}, method = "POST" } = {}) {
  const started = await aw(`/functions/${functionId}/executions`, {
    method: "POST",
    body: {
      body: JSON.stringify(payload ?? {}),
      async: false,
      method,
      path: "/",
      headers,
    },
  });
  const done =
    ["completed", "failed", "crashed", "timeout"].includes(String(started.status))
      ? started
      : await waitExecution(functionId, started.$id);
  return {
    executionId: done.$id,
    status: done.status,
    responseStatusCode: done.responseStatusCode,
    responseBody: parseJson(done.responseBody),
    logs: done.logs,
    errors: done.errors,
  };
}

async function getUsers() {
  const res = await aw(`/tablesdb/${DB}/tables/users/rows`, { queries: [q.limit(200)] });
  return res.rows || res.documents || [];
}

async function getRow(table, rowId) {
  return aw(`/tablesdb/${DB}/tables/${table}/rows/${rowId}`);
}

async function listRows(table, queries) {
  const res = await aw(`/tablesdb/${DB}/tables/${table}/rows`, { queries });
  return res.rows || res.documents || [];
}

function must(value, message) {
  if (!value) throw new Error(message);
  return value;
}

const users = await getUsers();
const creator = users.find((u) => u.userId === CREATOR_HINT && u.role === "creator" && u.status === "active")
  || users.find((u) => u.role === "creator" && u.status === "active");
const umkm = users.find((u) => u.role === "umkm" && u.status === "active");

must(creator, "Creator aktif tidak ditemukan.");
must(umkm, "UMKM aktif tidak ditemukan.");
const key = resolveKey();
process.env.APPWRITE_FUNCTION_API_ENDPOINT = process.env.APPWRITE_FUNCTION_API_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
process.env.APPWRITE_FUNCTION_PROJECT_ID = process.env.APPWRITE_FUNCTION_PROJECT_ID || "69f9d45b00315cb0ec2f";
process.env.APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || key;
process.env.APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || DB;
process.env.USERS_COLLECTION_ID = process.env.USERS_COLLECTION_ID || "users";
process.env.ORDERS_COLLECTION_ID = process.env.ORDERS_COLLECTION_ID || "orders";

console.log("\n=== SMOKE ORDER FLOW ===\n");
console.log(`Creator : ${creator.userId}`);
console.log(`UMKM    : ${umkm.userId}`);
console.log(`Amount  : ${AMOUNT}`);

const tosResult = await runLocal("../../functions/accept-tos/src/main.js", {
  payload: { tos_version: CURRENT_TOS_VERSION },
  headers: { "x-appwrite-user-id": creator.userId, "x-appwrite-key": key },
});
if (tosResult.responseStatusCode >= 400) {
  throw new Error(`accept-tos gagal: ${JSON.stringify(tosResult.responseBody)}`);
}

const stamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);

// Cabang A: paid path
const offerPaidId = `smokeordpay${stamp}`;
const createOrderPaid = await runFunction("create-order", {
  $id: offerPaidId,
  status: "accepted",
  creatorId: creator.userId,
  umkmId: umkm.userId,
  price: AMOUNT,
  title: `Smoke paid ${stamp}`,
});
if (createOrderPaid.responseStatusCode >= 400 || !createOrderPaid.responseBody?.orderId) {
  throw new Error(`create-order paid path gagal: ${JSON.stringify(createOrderPaid.responseBody)}`);
}
const paidOrderId = createOrderPaid.responseBody.orderId;

const paymentId = `smokepay${stamp}`;

await aw(`/tablesdb/${DB}/tables/payments/rows`, {
  method: "POST",
  body: {
    rowId: paymentId,
    permissions: [`read("user:${umkm.userId}")`],
    data: {
      user_id: umkm.userId,
      order_id: paidOrderId,
      campaign_id: null,
      amount: AMOUNT,
      total_amount: AMOUNT,
      fee_amount: 0,
      purpose: "order",
      gateway: "manual-smoke",
      gateway_reference: `smoke-ord-${stamp}`,
      snap_token: null,
      redirect_url: null,
      status: "paid",
      paid_at: new Date().toISOString(),
    },
  },
});

const createEscrow = await runFunction("create-escrow", {
  $id: paymentId,
  status: "paid",
  purpose: "order",
  order_id: paidOrderId,
  user_id: umkm.userId,
  amount: AMOUNT,
}, {});
if (createEscrow.responseStatusCode >= 400) {
  throw new Error(`create-escrow gagal: ${JSON.stringify(createEscrow.responseBody)}`);
}

const paidOrder = await getRow("orders", paidOrderId);
const escrows = await listRows("escrows", [q.equal("orderId", paidOrderId), q.limit(1)]);
const escrow = escrows[0] || null;
if (paidOrder.status !== "in_progress") {
  throw new Error(`Order paid path status expected "in_progress", got "${paidOrder.status}".`);
}
if (!escrow?.$id) {
  throw new Error(`Escrow untuk order ${paidOrderId} tidak ditemukan.`);
}

// Cabang B: cancel path
const offerCancelId = `smokeordcan${stamp}`;
const createOrderCancel = await runFunction("create-order", {
  $id: offerCancelId,
  status: "accepted",
  creatorId: creator.userId,
  umkmId: umkm.userId,
  price: AMOUNT,
  title: `Smoke cancel ${stamp}`,
});
if (createOrderCancel.responseStatusCode >= 400 || !createOrderCancel.responseBody?.orderId) {
  throw new Error(`create-order cancel path gagal: ${JSON.stringify(createOrderCancel.responseBody)}`);
}
const cancelOrderId = createOrderCancel.responseBody.orderId;

const cancelOrder = await runLocal("../../functions/cancel-order/src/main.js", {
  payload: { orderId: cancelOrderId },
  headers: { "x-appwrite-user-id": umkm.userId, "x-appwrite-key": key },
});
if (cancelOrder.responseStatusCode >= 400) {
  throw new Error(`cancel-order gagal: ${JSON.stringify(cancelOrder.responseBody)}`);
}

const cancelledOrder = await getRow("orders", cancelOrderId);
if (cancelledOrder.status !== "cancelled") {
  throw new Error(`Order cancel path status expected "cancelled", got "${cancelledOrder.status}".`);
}

const summary = {
  date: new Date().toISOString(),
  note: "cancel-order diverifikasi di order terpisah karena create-escrow mengubah status jadi in_progress.",
  actors: {
    creator: creator.userId,
    umkm: umkm.userId,
  },
  acceptTos: {
    mode: "local-invoke",
    responseStatusCode: tosResult.responseStatusCode,
    responseBody: tosResult.responseBody,
  },
  paidPath: {
    offerId: offerPaidId,
    orderId: paidOrderId,
    paymentId,
    escrowId: escrow.$id,
    createOrderExecutionId: createOrderPaid.executionId,
    paymentSetupMode: "admin-row-create",
    createEscrowExecutionId: createEscrow.executionId,
    orderStatus: paidOrder.status,
  },
  cancelPath: {
    offerId: offerCancelId,
    orderId: cancelOrderId,
    cancelOrderMode: "local-invoke",
    orderStatus: cancelledOrder.status,
  },
};

console.log("\n=== HASIL ===\n");
console.log(JSON.stringify(summary, null, 2));
