import assert from "node:assert/strict";
import test from "node:test";
import {
  VIEW_VALIDATION_DELAY_HOURS,
  getViewValidationEligibility,
} from "./observation-window.js";

const NOW_MS = Date.parse("2026-08-22T10:00:00.000Z");

test("approval remains blocked at 71 hours 59 minutes", () => {
  const result = getViewValidationEligibility(
    { $createdAt: "2026-08-19T10:01:00.000Z" },
    NOW_MS
  );

  assert.equal(VIEW_VALIDATION_DELAY_HOURS, 72);
  assert.deepEqual(result, {
    isEligible: false,
    eligibleAt: "2026-08-22T10:01:00.000Z",
  });
});

test("approval becomes eligible at exactly 72 hours", () => {
  assert.equal(
    getViewValidationEligibility(
      { $createdAt: "2026-08-19T10:00:00.000Z" },
      NOW_MS
    ).isEligible,
    true
  );
});

test("approval remains eligible after 72 hours", () => {
  assert.equal(
    getViewValidationEligibility(
      { $createdAt: "2026-08-19T09:00:00.000Z" },
      NOW_MS
    ).isEligible,
    true
  );
});

test("invalid submission timestamp fails closed", () => {
  assert.deepEqual(
    getViewValidationEligibility({ $createdAt: "invalid" }, NOW_MS),
    { isEligible: false, eligibleAt: null }
  );
});

test("timestamp overflow after adding 72 hours fails closed", () => {
  assert.deepEqual(
    getViewValidationEligibility(
      { $createdAt: "+275760-09-12T23:59:59.999Z" },
      NOW_MS
    ),
    { isEligible: false, eligibleAt: null }
  );
});

test("Appwrite creation time takes precedence over legacy submittedAt", () => {
  assert.equal(
    getViewValidationEligibility(
      {
        $createdAt: "2026-08-19T10:00:00.000Z",
        submittedAt: "2026-08-22T09:00:00.000Z",
      },
      NOW_MS
    ).isEligible,
    true
  );
});

test("legacy submittedAt remains supported when $createdAt is missing", () => {
  assert.equal(
    getViewValidationEligibility(
      { submittedAt: "2026-08-19T10:00:00.000Z" },
      NOW_MS
    ).isEligible,
    true
  );
});
