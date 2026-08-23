const DEFAULT_VIEW_VALIDATION_DELAY_HOURS = 72;

function parseViewValidationDelayHours(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return DEFAULT_VIEW_VALIDATION_DELAY_HOURS;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0
    ? parsed
    : DEFAULT_VIEW_VALIDATION_DELAY_HOURS;
}

export const VIEW_VALIDATION_DELAY_HOURS = parseViewValidationDelayHours(
  process.env.VIEW_VALIDATION_DELAY_HOURS
);

const VIEW_VALIDATION_DELAY_MS = VIEW_VALIDATION_DELAY_HOURS * 60 * 60 * 1000;

export function getViewValidationEligibility(submission, nowMs = Date.now()) {
  const createdAt = typeof submission?.$createdAt === "string"
    ? submission.$createdAt
    : "";
  const legacySubmittedAt = typeof submission?.submittedAt === "string"
    ? submission.submittedAt
    : "";
  const submittedAtMs = Date.parse(createdAt || legacySubmittedAt);

  if (!Number.isFinite(submittedAtMs) || !Number.isFinite(nowMs)) {
    return { isEligible: false, eligibleAt: null };
  }

  const eligibleAtMs = submittedAtMs + VIEW_VALIDATION_DELAY_MS;
  const eligibleAt = new Date(eligibleAtMs);
  if (!Number.isFinite(eligibleAt.getTime())) {
    return { isEligible: false, eligibleAt: null };
  }

  return {
    isEligible: nowMs >= eligibleAtMs,
    eligibleAt: eligibleAt.toISOString(),
  };
}
