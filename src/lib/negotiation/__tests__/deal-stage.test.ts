import { describe, expect, it } from "vitest";

import { canStartNewDeal } from "../deal-stage";

describe("canStartNewDeal", () => {
  it.each(["chatting", "offer_rejected", "completed", "cancelled"] as const)(
    "allows a new offer from %s",
    (stage) => {
      expect(canStartNewDeal(stage)).toBe(true);
    }
  );

  it.each([
    "offer_pending",
    "awaiting_order",
    "pending_payment",
    "escrow",
    "in_progress",
    "revision",
    "approved",
  ] as const)("blocks a new offer from active stage %s", (stage) => {
    expect(canStartNewDeal(stage)).toBe(false);
  });

  it("blocks when stage is unavailable", () => {
    expect(canStartNewDeal(undefined)).toBe(false);
  });
});
