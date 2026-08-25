import { describe, expect, it } from "vitest";
import {
  getAvailableWithdrawalActions,
  maskAccountNumber,
  matchesWithdrawalFilter,
} from "./utils";

describe("withdrawal presentation rules", () => {
  it("masks account numbers in queue views", () => {
    expect(maskAccountNumber("1234567890")).toBe("****7890");
    expect(maskAccountNumber("123")).toBe("****");
    expect(maskAccountNumber("  ")).toBe("****");
  });

  it("shows only start processing for requested withdrawals", () => {
    expect(getAvailableWithdrawalActions("requested")).toEqual(["start_processing"]);
  });

  it("shows success and failure actions only while processing", () => {
    expect(getAvailableWithdrawalActions("processing")).toEqual([
      "mark_succeeded",
      "fail",
    ]);
  });

  it.each(["succeeded", "failed", "reversed"] as const)(
    "hides mutations for %s withdrawals",
    (status) => {
      expect(getAvailableWithdrawalActions(status)).toEqual([]);
    },
  );

  it("treats requested and processing as operational", () => {
    expect(matchesWithdrawalFilter("requested", "operational")).toBe(true);
    expect(matchesWithdrawalFilter("processing", "operational")).toBe(true);
    expect(matchesWithdrawalFilter("succeeded", "operational")).toBe(false);
    expect(matchesWithdrawalFilter("reversed", "operational")).toBe(false);
  });

  it("matches explicit and all filters", () => {
    expect(matchesWithdrawalFilter("succeeded", "succeeded")).toBe(true);
    expect(matchesWithdrawalFilter("requested", "succeeded")).toBe(false);
    expect(matchesWithdrawalFilter("failed", "all")).toBe(true);
  });
});
