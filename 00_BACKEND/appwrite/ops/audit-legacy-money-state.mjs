#!/usr/bin/env node

import { fileURLToPath } from "node:url";

const RELEVANT_FUNCTION_IDS = new Set([
  "mature-pending-balance",
  "withdrawal-callback",
  "midtrans-webhook",
  "calculate-campaign-reward",
  "request-withdrawal",
  "get-admin-withdrawal-queue",
  "review-withdrawal",
]);

const groupByStatus = (rows) =>
  rows.reduce((counts, row) => {
    const status = row.status ?? "null";
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});

export function summarizeLegacyMoneyState(input) {
  const pendingWallets = input.wallets.filter(
    (wallet) => (Number(wallet.pendingBalance) || 0) > 0,
  );
  const unmaturedReleases = input.campaignReleases.filter(
    (transaction) => transaction.status === "completed",
  );
  const pendingMatureLedgers = input.matureLedgers.filter(
    (transaction) => transaction.status === "pending",
  );
  const processingWithdrawals = input.withdrawals.filter(
    (withdrawal) => withdrawal.status === "processing",
  );
  const irisWithdrawals = input.withdrawals.filter(
    (withdrawal) =>
      typeof withdrawal.iris_reference === "string" &&
      withdrawal.iris_reference.trim() !== "",
  );

  return {
    auditedAt: input.auditedAt,
    databaseId: input.databaseId,
    wallets: {
      pendingPositive: pendingWallets.length,
      pendingAmount: pendingWallets.reduce(
        (sum, wallet) => sum + (Number(wallet.pendingBalance) || 0),
        0,
      ),
    },
    campaignRelease: {
      total: input.campaignReleases.length,
      byStatus: groupByStatus(input.campaignReleases),
      unmaturedAmount: unmaturedReleases.reduce(
        (sum, transaction) => sum + (Number(transaction.amount) || 0),
        0,
      ),
    },
    matureLedger: {
      total: input.matureLedgers.length,
      byStatus: groupByStatus(input.matureLedgers),
      pendingAmount: pendingMatureLedgers.reduce(
        (sum, transaction) => sum + (Number(transaction.amount) || 0),
        0,
      ),
    },
    withdrawals: {
      total: input.withdrawals.length,
      byStatus: groupByStatus(input.withdrawals),
      processing: processingWithdrawals.length,
      processingWithIris: processingWithdrawals.filter(
        (withdrawal) =>
          typeof withdrawal.iris_reference === "string" &&
          withdrawal.iris_reference.trim() !== "",
      ).length,
      irisReferenced: irisWithdrawals.length,
      irisByStatus: groupByStatus(irisWithdrawals),
    },
    functions: input.functions
      .filter((fn) => RELEVANT_FUNCTION_IDS.has(fn.$id))
      .map((fn) => ({
        id: fn.$id,
        enabled: fn.enabled,
        schedule: fn.schedule || "",
        execute: fn.execute || [],
        events: fn.events || [],
        deploymentId: fn.deploymentId || fn.deployment || null,
        updatedAt: fn.$updatedAt,
      })),
  };
}

const query = (method, attribute, values = []) => ({ method, attribute, values });

async function listAllRows(aw, databaseId, tableId, filters, selectedFields) {
  const rows = [];
  let offset = 0;

  for (;;) {
    const queries = [
      ...filters,
      query("limit", undefined, [100]),
      query("offset", undefined, [offset]),
      ...selectedFields.map((field) => query("select", undefined, [field])),
    ];
    const result = await aw(
      `/tablesdb/${databaseId}/tables/${tableId}/rows`,
      { queries },
    );
    const batch = result.rows || result.documents || [];
    rows.push(...batch);

    if (batch.length === 0 || rows.length >= (result.total ?? rows.length)) {
      return rows;
    }
    offset += batch.length;
  }
}

export async function auditLegacyMoneyState() {
  const { aw, DB } = await import("./client.mjs");
  const [wallets, campaignReleases, matureLedgers, withdrawals, functions] =
    await Promise.all([
      listAllRows(
        aw,
        DB,
        "wallets",
        [query("greaterThan", "pendingBalance", [0])],
        ["pendingBalance"],
      ),
      listAllRows(
        aw,
        DB,
        "transactions",
        [
          query("equal", "type", ["release"]),
          query("equal", "referenceType", ["campaign_submission"]),
        ],
        ["amount", "status", "$createdAt"],
      ),
      listAllRows(
        aw,
        DB,
        "transactions",
        [query("equal", "type", ["mature"])],
        ["amount", "status"],
      ),
      listAllRows(
        aw,
        DB,
        "withdrawals",
        [],
        ["status", "amount", "iris_reference", "$createdAt"],
      ),
      aw("/functions", { queries: [query("limit", undefined, [100])] }),
    ]);

  return summarizeLegacyMoneyState({
    auditedAt: new Date().toISOString(),
    databaseId: DB,
    wallets,
    campaignReleases,
    matureLedgers,
    withdrawals,
    functions: functions.functions || [],
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const summary = await auditLegacyMoneyState();
  console.log(JSON.stringify(summary, null, 2));
}
