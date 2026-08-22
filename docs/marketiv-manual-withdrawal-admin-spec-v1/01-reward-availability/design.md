# Phase 01 — Design

## Primary File
- `00_BACKEND/functions/calculate-campaign-reward/src/main.js`

## Read-only References
- `00_BACKEND/functions/review-submission/src/main.js`
- `00_BACKEND/functions/mature-pending-balance/src/main.js`
- `00_BACKEND/functions/release-escrow/src/main.js`
- existing reward tests

## Minimal Code Change
Current:
```js
incrementColumn(..., "pendingBalance", reward)
```
Target:
```js
incrementColumn(..., "balance", reward)
```
Update comments/logs/notification text.

Do not add merchant-settlement logic because no authoritative settlement state exists in current repo.

## Transaction Semantics
Keep existing Campaign earning ledger semantics (`type = release`, `referenceType = campaign_submission`) unless current HEAD has changed.

## Legacy Strategy
`mature-pending-balance` tetap active sementara untuk legacy rows sampai Phase 06. New rewards tidak masuk pending balance sehingga tidak memerlukan maturation.

## Failure Ordering
Codex wajib audit ordering wallet credit, ledger create, dan campaign budget updates. Jangan membuat broad transaction-system refactor di fase ini. Jika ditemukan bug finansial serius yang memperluas scope, report before expansion.

## Schema
Tidak ada schema change yang diharapkan.
