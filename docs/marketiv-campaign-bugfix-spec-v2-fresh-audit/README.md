# Marketiv Campaign Bugfix — Fresh Audit Spec v2

**Repository:** `marketiv-id/marketiv-web`  
**Branch:** `staging`  
**Fresh audit anchor:** `ecb034858f6ad75079df5ff49a7bf1c7db3d2b2d`  
**Executor:** Codex — GPT-5.6 Terra Medium

## Purpose

This pack supersedes the previous Campaign bugfix v1 for execution.

Reason: the Admin frontend has already been extracted into a standalone Next.js app at repository root `admin/`, and a fresh audit of current `staging` found additional wiring/security problems that were not fully represented by v1.

## Current topology

```text
marketiv-web/
├── src/          # Marketiv user app
├── admin/        # standalone Admin app
└── 00_BACKEND/  # shared Appwrite backend/functions
```

Admin and user app remain on the **same Appwrite project within the same environment**.

## Canonical Campaign authority

```text
UMKM creates/funds/publishes Campaign
→ Creator claims Campaign
→ Creator publishes content and submits public TikTok/Instagram URL
→ submission = pending
→ fraud precheck = advisory signal
→ Admin Marketiv securely reads review queue
→ Admin locks final views and approves/rejects through trusted Function
→ backend reward/wallet/ledger
→ Creator sees outcome
→ UMKM sees read-only outcome
```

Campaign remains **zero-chat / no negotiation**.

## Fresh audit findings

### Admin
- Appwrite config can silently fall back to hardcoded staging IDs.
- Main user app Admin destination can also default to staging when env is incomplete.
- Admin layout/dashboard loads protected data before an effective role gate.
- Admin session helper fails open to a synthetic active Admin.
- Admin direct browser reads are not a valid cross-user queue strategy.
- Submission service can swallow `review-submission` failure, mutate local fixture state, directly update DB, then return success.
- Dashboard/header/sidebar contain dummy operational facts that look live.
- Admin contains Vitest tests, but `admin/package.json` does not declare a test script/Vitest dependency.

### Campaign claim/unclaim
- Browser claim increments `totalClaims`.
- `campaign-claimed` Function also increments `totalClaims`.
- Browser unclaim deletes claim and attempts direct counter decrement; decrement failure is swallowed.
- Frontend blocks reclaim after `expired`, while current backend service allows expired claims to be reclaimed.
- Active Work list has Unclaim, detail does not.

### Auth
- Login portal role mismatch remains open.
- `next` is not role-compatible validated.

### Code-fixed, runtime still pending
- stop/pause Campaign state gate;
- trusted `submit-campaign-proof`;
- Creator claim row permission fix.

## New execution order

| Phase | Scope |
|---|---|
| P0 | Fresh baseline / drift audit |
| P1 | Admin config fail-closed + standalone test gate |
| P2 | Admin auth/session boundary |
| P3 | Admin-only secure read DTO Functions |
| P4 | Admin review mutation fail-closed |
| P5 | Claim/unclaim counter consistency |
| P6 | Login portal-role mismatch + safe destination |
| P7 | Creator detail Unclaim parity |
| P8 | Truthful metrics/copy + focused Campaign UI polish |
| P9 | Regression + 3-role Campaign E2E readiness |

## Low-token Codex rule

For each phase, read only:

1. this `README.md`;
2. `00_SOT/SOURCE_PRECEDENCE.md`;
3. the single phase file under `02_PHASES/`.

Then inspect only files named by that phase and direct dependencies.

**One phase per session. Stop after every phase.**

## Global constraints

- Current checked-out `staging` is implementation source of truth.
- Preserve unrelated user changes.
- Never reset/stash/discard automatically.
- No Rate Card changes.
- No unrelated architecture migration.
- No broad Appwrite permission widening for Admin.
- No server/API key in browser.
- No direct browser authority for final submission status/views/reward/ledger.
- Fixture/mock data may exist only behind explicit mock/test behavior.
- Empty data ≠ backend failure.
- Do not claim runtime/E2E PASS without runtime evidence.
