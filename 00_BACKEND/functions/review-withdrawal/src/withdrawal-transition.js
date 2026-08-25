/**
 * Commits withdrawal state and ledger mutations in one Appwrite database
 * transaction. Reversal creates its deterministic ledger before wallet credit,
 * so duplicate or concurrent attempts cannot commit a second credit.
 */

function endpoint(env, path) {
  return `${env.appwriteEndpoint.replace(/\/$/, "")}${path}`;
}

async function request(env, path, method, body, fetchImpl) {
  const response = await fetchImpl(endpoint(env, path), {
    method,
    headers: {
      "content-type": "application/json",
      "X-Appwrite-Project": env.appwriteProjectId,
      "X-Appwrite-Key": env.appwriteApiKey,
    },
    body: JSON.stringify(body),
  });
  let text;
  try {
    text = await response.text();
  } catch (err) {
    err.status = response.status;
    throw err;
  }
  if (!response.ok) {
    const err = new Error(`${method} ${path} gagal: ${response.status} ${text.slice(0, 300)}`);
    err.status = response.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

async function rollback(env, transactionId, fetchImpl) {
  try {
    await request(
      env,
      `/tablesdb/transactions/${transactionId}`,
      "PATCH",
      { rollback: true },
      fetchImpl,
    );
  } catch {
    // Commit response can be lost after commit. Caller re-reads canonical state.
  }
}

function updateRow(env, tableId, rowId, data, transactionId, fetchImpl) {
  return request(
    env,
    `/tablesdb/${env.databaseId}/tables/${tableId}/rows/${rowId}`,
    "PATCH",
    { data, transactionId },
    fetchImpl,
  );
}

export async function runWithdrawalTransitionAtomically(env, transition, fetchImpl = fetch) {
  let transactionId;
  try {
    const transaction = await request(
      env,
      "/tablesdb/transactions",
      "POST",
      { ttl: 60 },
      fetchImpl,
    );
    transactionId = transaction?.$id;
    if (!transactionId) throw new Error("Appwrite transaction id tidak tersedia");
  } catch (err) {
    err.transactionPhase = "create";
    throw err;
  }

  let transactionPhase = "stage";
  try {
    if (transition.kind === "reverse") {
      await request(
        env,
        `/tablesdb/${env.databaseId}/tables/${env.transactionsCollectionId}/rows`,
        "POST",
        {
          rowId: transition.reversalLedgerId,
          data: {
            userId: transition.userId,
            amount: transition.amount,
            type: "withdrawal_reversal",
            referenceId: transition.withdrawalId,
            referenceType: "withdrawal",
            status: "completed",
          },
          permissions: [`read(\"user:${transition.userId}\")`],
          transactionId,
        },
        fetchImpl,
      );
      await request(
        env,
        `/tablesdb/${env.databaseId}/tables/${env.walletsCollectionId}/rows/${transition.walletId}/balance/increment`,
        "PATCH",
        { value: transition.amount, transactionId },
        fetchImpl,
      );
    }

    if (transition.primaryTransactionId) {
      await updateRow(
        env,
        env.transactionsCollectionId,
        transition.primaryTransactionId,
        { status: transition.primaryTransactionStatus },
        transactionId,
        fetchImpl,
      );
    }

    await updateRow(
      env,
      env.withdrawalsCollectionId,
      transition.withdrawalId,
      transition.withdrawalData,
      transactionId,
      fetchImpl,
    );
    transactionPhase = "commit";
    await request(
      env,
      `/tablesdb/transactions/${transactionId}`,
      "PATCH",
      { commit: true },
      fetchImpl,
    );
  } catch (err) {
    err.transactionPhase = transactionPhase;
    if (transactionPhase === "commit") {
      err.commitOutcome = isAmbiguousCommitError(err) ? "ambiguous" : "definitive";
      if (err.commitOutcome === "ambiguous") throw err;
    }
    await rollback(env, transactionId, fetchImpl);
    throw err;
  }
}

function isAmbiguousCommitError(err) {
  return !Number.isInteger(err?.status) || err.status >= 500;
}
