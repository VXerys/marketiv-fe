import { afterEach, describe, expect, it, vi } from "vitest";

const NOW = new Date("2026-08-22T10:00:00.000Z");

async function importUtilsWithDelay(delay: string | undefined) {
  vi.resetModules();
  if (delay === undefined) {
    vi.stubEnv("NEXT_PUBLIC_VIEW_VALIDATION_DELAY_HOURS", undefined);
  } else {
    vi.stubEnv("NEXT_PUBLIC_VIEW_VALIDATION_DELAY_HOURS", delay);
  }
  return import("./utils");
}

const {
  VIEW_VALIDATION_DELAY_HOURS,
  getViewValidationEligibility,
  validateViewsInput,
} = await importUtilsWithDelay(undefined);
vi.unstubAllEnvs();
vi.resetModules();

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

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

  it("defaults to 72 hours when configuration is absent", async () => {
    const configured = await importUtilsWithDelay(undefined);

    expect(configured.VIEW_VALIDATION_DELAY_HOURS).toBe(72);
  });

  it("allows immediate finalization when configured to zero hours", async () => {
    const configured = await importUtilsWithDelay("0");

    expect(configured.VIEW_VALIDATION_DELAY_HOURS).toBe(0);
    expect(
      configured.getViewValidationEligibility(
        "2026-08-22T10:00:00.000Z",
        NOW
      )
    ).toEqual({
      isEligible: true,
      eligibleAt: new Date("2026-08-22T10:00:00.000Z"),
      remainingMs: 0,
    });
  });

  it("uses a valid positive configured delay", async () => {
    const configured = await importUtilsWithDelay("24");

    expect(configured.VIEW_VALIDATION_DELAY_HOURS).toBe(24);
    expect(
      configured.getViewValidationEligibility(
        "2026-08-21T10:00:00.000Z",
        NOW
      )
    ).toEqual({
      isEligible: true,
      eligibleAt: new Date("2026-08-22T10:00:00.000Z"),
      remainingMs: 0,
    });
  });

  it.each(["invalid", "-1"])(
    "falls back to 72 hours for invalid configuration %s",
    async (delay) => {
      const configured = await importUtilsWithDelay(delay);

      expect(configured.VIEW_VALIDATION_DELAY_HOURS).toBe(72);
    }
  );
});

describe("validateViewsInput", () => {
  it.each(["1.5", "1e3", " 100", "+100", "100,000", "100.000"])("rejects non-plain-digit input %s", (value) => {
    expect(validateViewsInput(value)).toMatchObject({ isValid: false });
  });

  it("rejects unsafe integers without coercion", () => {
    expect(validateViewsInput("9007199254740992")).toMatchObject({ isValid: false, numericValue: 0 });
  });

  it("accepts safe plain-digit integers", () => {
    expect(validateViewsInput("9007199254740991")).toEqual({ isValid: true, numericValue: Number.MAX_SAFE_INTEGER });
  });
});
