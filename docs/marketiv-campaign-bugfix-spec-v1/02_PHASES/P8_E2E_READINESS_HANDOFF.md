# P8 — Campaign E2E Readiness Handoff

**Trello:** `[UAT-E2E-01] Campaign PPV end-to-end UMKM ↔ Kreator ↔ Admin`

## Objective

Produce a trustworthy handoff for live staging verification after code blockers are closed.

This phase does **not** require claiming that live E2E ran if the environment/accounts are unavailable.

## Preconditions

- P1 Admin mutation fail-closed complete.
- P2 Admin route auth complete.
- P3 login mismatch complete.
- P4 detail Unclaim complete.
- P5 no fake Admin metrics.
- P6 authority copy aligned.
- P7 code-fixed items revalidated.

## Golden path

```text
UMKM
→ login/onboarding
→ create/fund/publish active Campaign

Creator
→ login
→ discover Campaign
→ claim
→ active-work detail
→ optional Unclaim test on disposable claim
→ claim again if needed
→ submit valid public post URL
→ pending

Admin
→ authenticated Admin route
→ load real pending queue
→ review submission
→ enter final views
→ approve through trusted Function

Backend
→ locked views
→ claim sync
→ reward/ledger path

Creator
→ sees approved outcome/reward state

UMKM
→ sees read-only validated submission
```

## Negative path matrix

1. Creator login from UMKM tab → explicit mismatch.
2. UMKM login from Creator tab → explicit mismatch.
3. UMKM/Creator direct `/admin` → denied.
4. Creator unclaim before submit → succeeds.
5. Creator unclaim after submit → impossible/denied.
6. duplicate submit → conflict/no duplicate.
7. Admin Function 403/409/5xx → no local false success.
8. rejected submission → no Creator payout + quota/state consistency.
9. refresh/deep-link after every major transition shows backend state.

## Evidence to collect

- timestamp;
- test role/account identifier without password/OTP;
- browser + viewport;
- before/after screenshots or short video;
- sanitized network response;
- Appwrite Function execution/status;
- relevant submission/claim/campaign IDs;
- wallet/transaction/ledger evidence if validating payout.

## Exit labels

Use only one:

- `READY_FOR_STAGING_E2E`
- `STAGING_E2E_PASS`
- `STAGING_E2E_FAIL`
- `BLOCKED_BY_ENVIRONMENT`

Never convert `READY_FOR_STAGING_E2E` into `PASS`.

## Optional Playwright work

Do not expand into the broader QA-debt Playwright project in this phase unless explicitly requested. If a small deterministic test is already supported by current fixtures, add it only when it materially protects the fixed Campaign blocker.
