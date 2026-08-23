import assert from "node:assert/strict";
import test from "node:test";

const NOW_MS = Date.parse("2026-08-22T10:00:00.000Z");
const ORIGINAL_DELAY = process.env.VIEW_VALIDATION_DELAY_HOURS;

async function importObservationWindow(delay, caseName) {
  if (delay === undefined) {
    delete process.env.VIEW_VALIDATION_DELAY_HOURS;
  } else {
    process.env.VIEW_VALIDATION_DELAY_HOURS = delay;
  }

  try {
    return await import(`./observation-window.js?case=${caseName}`);
  } finally {
    if (ORIGINAL_DELAY === undefined) {
      delete process.env.VIEW_VALIDATION_DELAY_HOURS;
    } else {
      process.env.VIEW_VALIDATION_DELAY_HOURS = ORIGINAL_DELAY;
    }
  }
}

const {
  VIEW_VALIDATION_DELAY_HOURS,
  getViewValidationEligibility,
} = await importObservationWindow(undefined, "default");

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

test("missing delay environment variable defaults to 72 hours", () => {
  assert.equal(VIEW_VALIDATION_DELAY_HOURS, 72);
});

test("zero-hour delay makes a new submission immediately eligible", async () => {
  const configured = await importObservationWindow("0", "zero");

  assert.equal(configured.VIEW_VALIDATION_DELAY_HOURS, 0);
  assert.deepEqual(
    configured.getViewValidationEligibility(
      { $createdAt: "2026-08-22T10:00:00.000Z" },
      NOW_MS
    ),
    {
      isEligible: true,
      eligibleAt: "2026-08-22T10:00:00.000Z",
    }
  );
});

test("valid positive delay controls eligibleAt", async () => {
  const configured = await importObservationWindow("24", "positive");

  assert.equal(configured.VIEW_VALIDATION_DELAY_HOURS, 24);
  assert.deepEqual(
    configured.getViewValidationEligibility(
      { $createdAt: "2026-08-21T10:00:00.000Z" },
      NOW_MS
    ),
    {
      isEligible: true,
      eligibleAt: "2026-08-22T10:00:00.000Z",
    }
  );
});

test("invalid delay falls back to 72 hours", async () => {
  const configured = await importObservationWindow("not-a-number", "invalid");

  assert.equal(configured.VIEW_VALIDATION_DELAY_HOURS, 72);
});

test("negative delay falls back to 72 hours", async () => {
  const configured = await importObservationWindow("-1", "negative");

  assert.equal(configured.VIEW_VALIDATION_DELAY_HOURS, 72);
});

test("invalid timestamp still fails closed with zero-hour delay", async () => {
  const configured = await importObservationWindow("0", "zero-invalid-timestamp");

  assert.deepEqual(
    configured.getViewValidationEligibility({ $createdAt: "invalid" }, NOW_MS),
    { isEligible: false, eligibleAt: null }
  );
});
