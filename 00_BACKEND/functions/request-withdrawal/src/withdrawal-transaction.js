/**
 * Commit wallet reserve, pending ledger, and requested state as one Appwrite
 * database transaction. No partial financial state may escape this boundary.
 */

function endpoint(env, path) {
  return `${env.appwriteEndpoint.replace(/\/$/, "")}${path}`;
}

async function request(env, path, method, body) {
  const response = await fetch(endpoint(env, path), {
    method,
    headers: {
      "content-type": "application/json",
      "X-Appwrite-Project": env.appwriteProjectId,
      "X-Appwrite-Key": env.appwriteApiKey
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  if (!response.ok) {
    const err = new Error(`${method} ${path} gagal: ${response.status} ${text.slice(0, 300)}`);
    err.status = response.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

async function rollback(env, transactionId) {
  try {
    await request(env, `/tablesdb/transactions/${transactionId}`, "PATCH", { rollback: true });
  } catch {
    // Commit response may have been lost after server committed. Caller must
    // reconcile persisted withdrawal + deterministic ledger instead.
  }
}

export async function reserveWithdrawalAtomically(env, {
  walletId,
  withdrawalId,
  ledgerId,
  userId,
  amount
}) {
  const transaction = await request(env, "/tablesdb/transactions", "POST", { ttl: 60 });
  const transactionId = transaction?.$id;
  if (!transactionId) throw new Error("Appwrite transaction id tidak tersedia");

  let phase = "stage_debit";
  try {
    await request(
      env,
      `/tablesdb/${env.databaseId}/tables/${env.walletsCollectionId}/rows/${walletId}/balance/decrement`,
      "PATCH",
      { value: amount, min: 0, transactionId }
    );

    phase = "stage_ledger";
    await request(
      env,
      `/tablesdb/${env.databaseId}/tables/${env.transactionsCollectionId}/rows`,
      "POST",
      {
        rowId: ledgerId,
        data: {
          userId,
          amount,
          type: "withdrawal",
          referenceId: withdrawalId,
          referenceType: "withdrawal",
          status: "pending"
        },
        permissions: [`read(\"user:${userId}\")`],
        transactionId
      }
    );

    phase = "stage_requested";
    await request(
      env,
      `/tablesdb/${env.databaseId}/tables/${env.withdrawalsCollectionId}/rows/${withdrawalId}`,
      "PATCH",
      { data: { status: "requested", failure_reason: null }, transactionId }
    );

    phase = "commit";
    await request(env, `/tablesdb/transactions/${transactionId}`, "PATCH", { commit: true });
    return ledgerId;
  } catch (err) {
    err.transactionPhase = phase;
    await rollback(env, transactionId);
    throw err;
  }
}
