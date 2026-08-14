# Proposed Source-of-Truth Patches

This folder contains **proposed canonical content** to apply to `marketiv-id/marketiv-web@staging` before/alongside UI slicing.

## Why this is required

`00_BACKEND/docs/README.md` declares the docs tree the single source of truth. At present, Campaign documents still encode the superseded concept that UMKM validates submissions and captures views. If UI alone changes, future AI agents will reintroduce the old flow.

## Apply Order

1. `04_Decisions/ADR-010.md`
2. `04_Decisions/00_Index.__PATCH__.md`
3. `02_Modules/Campaigns/00_Index.md`
4. `10_Overview.md`
5. `20_Concepts.md`
6. `30_Business_Rules.md`
7. `40_User_Flow.md`
8. `50_Database.__PATCH__.md`
9. `60_API.md`
10. `70_Backend.md`
11. `80_Frontend.md`
12. `90_Events.md`
13. `95_Views_Tracking.md`
14. `96_Views_Sprint_Plan.md`
15. `100_Testing.md`
16. `03_Workflows/20_Campaign_PPV.md`
17. `03_Workflows/40_Submission_Fraud.md`

## Important distinction

Some backend implementation is **not yet aligned** with this target documentation, specifically `review-submission` authorization. Documents must explicitly mark that part as **Target / Wiring Pending**, not falsely claim deployed completion.

Canonical product rule may be decided now while implementation status is recorded honestly:

```text
DECISION/CURRENT PRODUCT CONTRACT: Admin validates.
CURRENT IMPLEMENTATION BLOCKER: review-submission still checks UMKM ownership.
```

This prevents the old concept from remaining “truth” merely because migration has not been deployed yet.
