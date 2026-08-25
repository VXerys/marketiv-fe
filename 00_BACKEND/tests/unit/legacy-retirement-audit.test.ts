import { describe, expect, it } from "vitest";
import { summarizeLegacyMoneyState } from "../../appwrite/ops/audit-legacy-money-state.mjs";

describe("legacy money state audit summary", () => {
  it("reports dependency counts without exposing user or payout data", () => {
    const summary = summarizeLegacyMoneyState({
      auditedAt: "2026-08-25T09:24:35.204Z",
      databaseId: "db",
      wallets: [
        { userId: "creator-secret", pendingBalance: 125_000 },
        { userId: "creator-zero", pendingBalance: 0 },
      ],
      campaignReleases: [
        { amount: 125_000, status: "completed", referenceId: "submission-secret" },
        { amount: 50_000, status: "matured", referenceId: "submission-other" },
      ],
      matureLedgers: [{ amount: 125_000, status: "pending", referenceId: "tx-secret" }],
      withdrawals: [
        {
          status: "processing",
          iris_reference: "iris-secret",
          accountNumber: "1234567890",
        },
        { status: "succeeded", iris_reference: null },
      ],
      functions: [
        {
          $id: "withdrawal-callback",
          enabled: true,
          schedule: "",
          execute: ["any"],
          deploymentId: "deployment-1",
        },
      ],
    });

    expect(summary.wallets).toEqual({ pendingPositive: 1, pendingAmount: 125_000 });
    expect(summary.campaignRelease).toEqual({
      total: 2,
      byStatus: { completed: 1, matured: 1 },
      unmaturedAmount: 125_000,
    });
    expect(summary.matureLedger.pendingAmount).toBe(125_000);
    expect(summary.withdrawals).toMatchObject({
      total: 2,
      processing: 1,
      processingWithIris: 1,
      irisReferenced: 1,
    });
    expect(JSON.stringify(summary)).not.toContain("creator-secret");
    expect(JSON.stringify(summary)).not.toContain("iris-secret");
    expect(JSON.stringify(summary)).not.toContain("1234567890");
  });
});
