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
