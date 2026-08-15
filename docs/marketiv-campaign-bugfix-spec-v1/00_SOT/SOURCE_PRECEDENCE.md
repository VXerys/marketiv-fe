# Source Precedence

Codex must resolve conflicts in this order.

## 1. Current checked-out `staging` code

Inspect the actual repository before editing. The audit anchor is only a snapshot:

`878d48e2db1d25e8154176719c95b8d216c641be`

If current `staging` differs, current implementation wins unless it violates an accepted domain decision below.

## 2. Accepted current domain decisions + trusted backend behavior

Highest-value references for this change:

- `00_BACKEND/docs/04_Decisions/ADR-010.md`
- `00_BACKEND/functions/review-submission/src/main.js`
- `src/types/domain.ts`
- `src/lib/appwrite/functions.ts`

Canonical Campaign authority:

```text
Creator public URL
→ campaign_submissions.pending
→ fraud precheck (advisory)
→ Admin Marketiv review
→ locked final views + approved/rejected
→ backend reward/ledger
```

The browser must never become the final mutation authority.

## 3. Trello Campaign SOT + current defect cards

Operational state and priorities come from:

- `[SOT-CAMPAIGN-2026-08-15]`
- BUG login role mismatch
- BUG creator unclaim detail
- BUG Admin false-success/direct-write
- SEC Admin route guard
- BUG Admin metrics truthfulness
- BUG stale Admin/UMKM wording
- Campaign polish card
- Campaign E2E UAT card

See `manifest.json` for URLs.

## 4. This spec pack

This pack translates the current repository + Trello audit into executable phases. It does not override newer current code.

## 5. Older docs/agent instructions

Use old docs only as supporting context.

**Known stale references exist in the repository**, including agent/workflow files that still describe obsolete stack, routing, fees, or service status. Examples include older Marketiv Kiro/agent instructions. Do not let them override current package/code/Appwrite implementation.

If a stale instruction materially conflicts with current repository behavior, note the conflict and follow sources 1–4.

## Conflict rule

If Codex discovers a new change that makes a phase unsafe or obsolete:

1. stop editing that part;
2. describe the drift;
3. preserve existing newer behavior;
4. implement only the still-valid subset;
5. report the blocker instead of forcing the old plan.
