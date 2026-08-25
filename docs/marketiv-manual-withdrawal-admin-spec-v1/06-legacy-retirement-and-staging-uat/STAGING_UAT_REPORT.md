# Phase 06 — Legacy Retirement and Staging UAT Report

## Status

- Legacy retirement: **PASS**.
- Runtime success/failure UAT: **PASS**.
- Manual Admin Withdrawal Phase 06 — Staging E2E: **PASS**.

*Historical note: Initial execution was blocked before manual staging UAT was completed. Runtime UAT originally needed authenticated staging Creator and active Admin sessions, proof that root/admin web deployments use the same revision, and an authorized manual-transfer test procedure. Final post-retirement staging UAT passed for both success and reversal paths.*

## Source and Environment

- Repository branch: `staging`
- Source HEAD before Phase 06 changes: `ec4dec35357db08b7fe11587e0acd69c5c5b8411`
- Appwrite project: `69f9d45b00315cb0ec2f`
- Database: `6a4c8598001da3b0d7f0`
- Audit command:

  ```bash
  cd 00_BACKEND
  node appwrite/ops/audit-legacy-money-state.mjs
  ```

The audit reports counts and amounts only. It does not print user IDs, bank accounts, Iris references, or other payout data.

## Pre-retirement Inventory

Captured `2026-08-25T09:24:35.204Z` from actual staging:

| Inventory | Result |
|---|---:|
| Wallets with `pendingBalance > 0` | 0 |
| Total legacy pending balance | Rp0 |
| Campaign release ledgers | 3 `matured`, 0 `completed` |
| Unmatured campaign release amount | Rp0 |
| Mature ledgers | 1 `completed`, 0 `pending` |
| Withdrawals | 3 `succeeded`, 3 `reversed` |
| Withdrawals `processing` | 0 |
| Withdrawals with `iris_reference` | 0 |

No balance row or ledger was edited, deleted, or zeroed during reconciliation.

## Retirement Applied

Applied with safe field-preserving ops client:

```bash
cd 00_BACKEND
node appwrite/generate_appwrite_json.cjs
npm run fn:inventory
node appwrite/ops/sync-functions.mjs --dry \
  --only mature-pending-balance,withdrawal-callback \
  --fields schedule,enabled,execute
node appwrite/ops/sync-functions.mjs \
  --only mature-pending-balance,withdrawal-callback \
  --fields schedule,enabled,execute
```

Post-write verification captured `2026-08-25T09:36:10.964Z`:

| Function | `enabled` | `schedule` | `execute` | Active deployment |
|---|---:|---|---|---|
| `mature-pending-balance` | false | empty | `[]` | `6a7d8b80047871b6d1dd` |
| `withdrawal-callback` | false | empty | `[]` | `6a7d8b7fa215e5ae8660` |
| `midtrans-webhook` | true | empty | `["any"]` | `6a8c4922c94bebec1bc4` |

Source folders and `iris_reference` schema remain for historical audit. No Phase 06 Function code deployment was needed; retirement fields apply directly to live Function configuration.

Final re-audit at `2026-08-25T11:19:52.287Z` returned the same zero dependency counts and the same three Function states.

Relevant active staging deployments observed:

| Function | Deployment |
|---|---|
| `calculate-campaign-reward` | `6a8c492c90268bc0b798` |
| `request-withdrawal` | `6a8d4743f0aaf40f62e6` |
| `get-admin-withdrawal-queue` | `6a8d17821e79e41b8682` |
| `review-withdrawal` | `6a8d17e9c1f1bdeb1df4` |

Appwrite deployment metadata does not prove which Git commit produced each deployment. Runtime UAT must not start until deployment provenance is confirmed.

## Verification Results

| Command/area | Result |
|---|---|
| Phase 01–02 targeted backend tests | 34 passed |
| Phase 03 queue/review/transaction tests | 28 passed |
| Phase 04 admin withdrawal tests | included in admin 77/77 pass |
| Phase 05 creator finance tests | included in root 140/140 pass |
| Legacy retirement config/audit tests | 4 passed |
| Function inventory | PASS; 63 folders/generator/scopes/config |
| Function syntax checks | PASS |
| Root typecheck | PASS |
| Root lint | PASS with 50 pre-existing warnings, 0 errors |
| Root tests | 140 passed |
| Admin typecheck | PASS |
| Admin lint | PASS with 6 pre-existing warnings, 0 errors |
| Admin tests | 77 passed |
| Admin build | PASS |
| Root build | BLOCKED / NOT RE-VERIFIED |
| Full backend legacy suite | 174 passed, 86 failed; failures are pre-existing stale service mock/export tests plus 3 unrelated integration failures |

Root build retry command:

```bash
NEXT_PUBLIC_ADMIN_APP_URL=https://admin-staging.marketiv.id npm run build
```

**Reason:** The previous verification environment failed fetching Google Fonts (Plus Jakarta Sans / Sora).
This is a verification-environment/network blocker, not a code error. It is not a blocker against final withdrawal staging E2E because the deployed staging application was tested directly. Do not state root build is PASS until there is actual command exit 0 evidence.

Global staging drift also remains outside Phase 06 scope:

- `release-escrow.events` misses the `ratecard_deliverable_validations` event present in config;
- `review-ratecard-deliverable` exists in config but not live;
- live table `ratecard_deliverable_validations` is missing.

These do not reverse the legacy retirement evidence, but they block a global “staging-ready” claim.

## Required Deployment Gate Before UAT

1. Commit/push Phase 06 files to `staging`.
2. Build root with staging env, including:

   ```bash
   NEXT_PUBLIC_ADMIN_APP_URL=https://admin-staging.marketiv.id npm run build
   ```

3. Build Admin:

   ```bash
   npm --prefix admin run build
   ```

4. Deploy root and Admin using staging hosting pipeline. Repository contains no authoritative hosting deploy command; record hosting deployment IDs and commit SHA in this report.
5. Re-run:

   ```bash
   cd 00_BACKEND
   node appwrite/ops/audit-legacy-money-state.mjs
   npm run fn:inventory
   npm run fn:drift
   node appwrite/ops/audit-live.mjs
   ```

6. Confirm retirement fields still match table above and `midtrans-webhook` remains active.

## Runtime UAT Checklist — Success

Use controlled staging users and approved test-transfer rail. Never mark success before operator confirms transfer.

1. Record deployed Git SHA, root hosting deployment ID, Admin hosting deployment ID, and four Function deployment IDs.
2. Use Campaign reward approved after current 72-hour observation rule. Record submission ID, reward transaction ID, reward amount, and wallet balance before/after reward.
3. Confirm reward increased `wallet.balance`, did not increase `pendingBalance`, and release ledger is `matured`.
4. From Creator UI, submit withdrawal amount `A`. Record request key, withdrawal ID, primary transaction ID, and pre-request balance `W0`.
5. Confirm receipt status `requested`, transaction status `pending`, and `balanceAfter = W0 - A`.
6. Reload Creator UI. Confirm copy says request accepted/pending, not transfer succeeded.
7. Open Admin `/withdrawals`. Confirm same row appears as `requested` and account is masked in list view.
8. Run `start_processing`. Record `processing_at` and `processed_by`; confirm status `processing`.
9. Perform authorized staging manual-transfer procedure outside Marketiv. Record masked destination and non-secret transfer reference.
10. Run `mark_succeeded` with transfer reference. Confirm status `succeeded`, `processedAt`, `processed_by`, and primary transaction `completed`.
11. Reload Creator UI. Confirm final success state and unchanged reserved balance.
12. Confirm no `withdrawal-callback` execution and no Iris network call/reference.
13. Add IDs, amounts, timestamps, and masked evidence below; never add full account number.

## Runtime UAT Checklist — Failure/Reversal

1. Record pre-request balance `F0` and controlled amount `B`.
2. Submit a new withdrawal. Confirm `requested`, primary transaction `pending`, and balance `F0 - B`.
3. From Admin, run `fail` with controlled reason.
4. Confirm withdrawal terminal state `reversed`, `reversed_at`, and failure reason.
5. Confirm wallet balance restored to exactly `F0`.
6. Confirm exactly one `withdrawal_reversal` ledger exists for the withdrawal with amount `B`.
7. Confirm primary withdrawal transaction status `failed`.
8. Repeat the same fail action. Confirm rejection/conflict, wallet remains `F0`, and reversal ledger count remains one.
9. Reload Creator UI and confirm reversed/refunded state.
10. Add IDs, amounts, timestamps, and masked evidence below.

## Runtime Evidence

No runtime withdrawal was created or mutated in the initial Phase 06 run. *Historical note: Success and failure evidence remained empty by design; UAT status stayed BLOCKED until an authorized operator completed both checklists.*

Latest post-UAT audit evidence (2026-08-25T13:10:13.713Z):
- Withdrawals: 8 total (4 succeeded, 4 reversed, 0 processing, 0 with Iris reference)
- Wallets: 0 pendingPositive, 0 pendingAmount
- Campaign Release: 4 total, 4 matured, 0 unmaturedAmount
- Mature Ledger: 1 total, 1 completed, 0 pendingAmount

Final post-retirement staging UAT passed for both success and reversal paths. UAT status is PASS.
