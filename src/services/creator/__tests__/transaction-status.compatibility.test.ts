import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CreatorStatusBadge } from "@/components/ui/creator-states";
import {
  getCreatorTransactionStatusLabel,
  matchesCreatorTransactionStatusFilter,
} from "@/lib/creator-status";
import type { TransactionStatus } from "@/types/domain";

describe("Campaign reward transaction status compatibility", () => {
  it("presents matured as a successful completed transaction", () => {
    const status: TransactionStatus = "matured";

    expect(getCreatorTransactionStatusLabel(status)).toBe("Selesai");
    expect(matchesCreatorTransactionStatusFilter(status, "success")).toBe(true);

    const badge = renderToStaticMarkup(
      createElement(CreatorStatusBadge, { status, type: "transaction" })
    );
    expect(badge).toContain("Selesai");
    expect(badge).toContain("text-emerald-700");
    expect(badge).not.toContain("matured");
  });
});

describe("Manual withdrawal status compatibility", () => {
  it.each([
    ["pending", "Menunggu Diproses", "text-amber-700"],
    ["requested", "Menunggu Diproses", "text-amber-700"],
    ["processing", "Sedang Diproses", "text-amber-700"],
    ["succeeded", "Berhasil", "text-emerald-700"],
    ["failed", "Gagal", "text-rose-700"],
    ["reversed", "Saldo Dikembalikan", "text-rose-700"],
  ])("presents %s without changing canonical status", (status, label, tone) => {
    const badge = renderToStaticMarkup(
      createElement(CreatorStatusBadge, { status, type: "transaction" })
    );

    expect(badge).toContain(label);
    expect(badge).toContain(tone);
  });

  it("keeps existing transaction filters compatible", () => {
    expect(matchesCreatorTransactionStatusFilter("pending", "pending")).toBe(true);
    expect(matchesCreatorTransactionStatusFilter("completed", "success")).toBe(true);
    expect(matchesCreatorTransactionStatusFilter("failed", "failed")).toBe(true);
    expect(matchesCreatorTransactionStatusFilter("matured", "success")).toBe(true);
  });
});
