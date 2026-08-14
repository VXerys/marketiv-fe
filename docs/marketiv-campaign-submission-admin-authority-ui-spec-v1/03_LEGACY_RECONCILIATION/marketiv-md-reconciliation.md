# Reconciliation — `docs/marketiv-md` vs Canonical `00_BACKEND/docs`

## Finding

The repository currently contains two overlapping documentation systems:

1. `00_BACKEND/docs` — explicitly declares itself the single source of truth.
2. `docs/marketiv-md` — contains useful newer feature contracts but also generated/repetitive/inconsistent status documentation.

This duplication is a major reason the Campaign validation authority drifted.

## Useful Supporting Documents

### `docs/marketiv-md/features/08-campaign-submission-and-validation.md`

This document already captures the desired direction:

- Creator submits URL;
- Admin validates;
- UMKM sees status without changing validation.

Keep it as supporting reference or convert it to a short pointer to canonical Campaign docs.

### `features/17-feature-permissions-matrix.md`

It also says `Validate submission` is Admin + Backend only. This supports ADR-010, but the file contains repeated generated sections and should not duplicate detailed Campaign business rules.

### `features/19-frontend-backend-contract.md`

Correct high-level principle: frontend must not validate submission; sensitive operations use backend Function. It may remain a global supporting contract, but Campaign-specific details belong in canonical Campaign docs.

## Document That Must Not Override Current Domain Truth

### `features/18-status-lifecycle-reference.md`

It contains translated/PascalCase status sets such as `Pending`, `Valid`, `Paid` that conflict with current runtime/domain enums:

```text
submission: pending | approved | rejected
fraud:      safe | review | rejected
```

Recommendation:

- do not use `18-status-lifecycle-reference.md` to generate database/frontend enum values;
- repair it later to mirror actual domain/schema or replace it with pointers to the canonical status owner;
- never introduce translated labels as persisted statuses.

## Recommended De-duplication Policy

For Campaign-specific material, `docs/marketiv-md/features/08` should eventually become:

```md
# Campaign Submission & Validation

Canonical documentation:
- ../../00_BACKEND/docs/02_Modules/Campaigns/30_Business_Rules.md
- ../../00_BACKEND/docs/02_Modules/Campaigns/40_User_Flow.md
- ../../00_BACKEND/docs/02_Modules/Campaigns/95_Views_Tracking.md
- ../../00_BACKEND/docs/03_Workflows/40_Submission_Fraud.md
- ../../00_BACKEND/docs/04_Decisions/ADR-010.md
```

Keep “one fact = one location”. Feature catalogs may index/cross-link but should not independently redefine authority, status values, reward formula, or permissions.
