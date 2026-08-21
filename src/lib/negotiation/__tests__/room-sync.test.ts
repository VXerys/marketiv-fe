import { describe, expect, it } from "vitest";
import {
  buildPaymentReturnUrl,
  getNegotiationPollDelay,
  isPaymentConfirmedStage,
  isTerminalNegotiationStage,
} from "../room-sync";

describe("negotiation room synchronization policy", () => {
  it("uses fast bounded-state polling and stops terminal rooms", () => {
    expect(getNegotiationPollDelay("awaiting_order")).toBe(2_000);
    expect(getNegotiationPollDelay("pending_payment")).toBe(2_000);
    expect(getNegotiationPollDelay("in_progress")).toBe(5_000);
    expect(getNegotiationPollDelay("completed")).toBeNull();
    expect(isTerminalNegotiationStage("cancelled")).toBe(true);
  });

  it("marks Midtrans return only after server-owned post-payment stage", () => {
    expect(isPaymentConfirmedStage("pending_payment")).toBe(false);
    expect(isPaymentConfirmedStage("escrow")).toBe(false);
    expect(isPaymentConfirmedStage("in_progress")).toBe(true);
    expect(isPaymentConfirmedStage("completed")).toBe(true);
  });

  it("adds payment return marker without dropping existing route parameters", () => {
    expect(buildPaymentReturnUrl("https://marketiv.test/dashboard/umkm/negosiasi/room?tab=chat"))
      .toBe("https://marketiv.test/dashboard/umkm/negosiasi/room?tab=chat&payment_return=1");
  });
});
