# Phase 03 — Design

## Files to Add
Recommended:
- `00_BACKEND/functions/get-admin-withdrawal-queue/src/main.js`
- `00_BACKEND/functions/get-admin-withdrawal-queue/package.json`
- tests queue
- `00_BACKEND/functions/review-withdrawal/src/main.js`
- `00_BACKEND/functions/review-withdrawal/src/atomic.js` bila packaging current membutuhkan local helper
- `00_BACKEND/functions/review-withdrawal/package.json`
- tests mutation

## Files to Change
- `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- `00_BACKEND/appwrite/function-scopes.json`
- regenerated `00_BACKEND/appwrite.config.json`

Do not hand-edit generated config sebagai divergent source.

## Schema
Existing status enum sudah mencakup requested/processing/succeeded/failed/reversed.

Recommended fields:
- `processing_at`: datetime optional
- `processed_by`: string 255 optional
- `transfer_reference`: string 255 optional
- `admin_note`: string 1000 optional
- status index

## Queue Security
Read sensitive withdrawal rows lewat server Function DTO setelah admin auth. Jangan grant collection-wide sensitive browser read.

## Mutation State Machine
```text
requested
  ├─ start_processing → processing
  └─ fail → failed → reversed

processing
  ├─ mark_succeeded → succeeded
  └─ fail → failed → reversed
```
Terminal: succeeded, reversed.

## Primary Ledger
Lookup transaction dengan `referenceId = withdrawalId`, `referenceType = withdrawal`, `type = withdrawal`.

Success: status → `completed`.
Reversal: original status → `failed`, append deterministic `withdrawal_reversal` completed.

## Reversal Idempotency
Reuse proven deterministic ledger pattern based on SHA-256 of withdrawal ID + reversal kind. Sebelum credit, pastikan reversal ledger belum completed/existing. Gunakan atomic increment; jangan read-modify-write balance.

## Admin Success Semantics
`mark_succeeded` berarti admin mengonfirmasi transfer manual benar-benar telah dilakukan di luar Marketiv. Tidak ada bank API call. Transfer reference diwajibkan untuk mengurangi accidental success.

## Notifications
Processing: optional “sedang diproses tim Marketiv”.
Succeeded: “berhasil ditransfer”.
Reversed: “tidak dapat diproses dan saldo dikembalikan”.
