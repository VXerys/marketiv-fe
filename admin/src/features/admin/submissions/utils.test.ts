import { describe, expect, it } from "vitest";
import {
  VIEW_VALIDATION_DELAY_HOURS,
  getViewValidationEligibility,
} from "./utils";

const NOW = new Date("2026-08-22T10:00:00.000Z");

describe("getViewValidationEligibility", () => {
  it("blocks finalization before 72 full hours", () => {
    const result = getViewValidationEligibility(
      "2026-08-19T10:01:00.000Z",
      NOW
    );

    expect(VIEW_VALIDATION_DELAY_HOURS).toBe(72);
    expect(result).toEqual({
      isEligible: false,
      eligibleAt: new Date("2026-08-22T10:01:00.000Z"),
      remainingMs: 60_000,
    });
  });

  it("allows finalization at exactly 72 hours", () => {
    expect(
      getViewValidationEligibility("2026-08-19T10:00:00.000Z", NOW)
    ).toMatchObject({ isEligible: true, remainingMs: 0 });
  });

  it("allows finalization after 72 hours without a maximum window", () => {
    expect(
      getViewValidationEligibility("2026-08-19T09:00:00.000Z", NOW)
    ).toMatchObject({ isEligible: true, remainingMs: 0 });
  });

  it("fails closed for an invalid submission timestamp", () => {
    expect(getViewValidationEligibility("invalid", NOW)).toEqual({
      isEligible: false,
      eligibleAt: null,
      remainingMs: 0,
    });
  });

  it("fails closed when adding 72 hours exceeds the Date range", () => {
    expect(
      getViewValidationEligibility("+275760-09-12T23:59:59.999Z", NOW)
    ).toEqual({ isEligible: false, eligibleAt: null, remainingMs: 0 });
  });
});
