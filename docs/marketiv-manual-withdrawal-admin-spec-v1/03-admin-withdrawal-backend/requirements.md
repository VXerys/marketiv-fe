# Phase 03 — Requirements: Admin Withdrawal Backend

## Objective
Membuat trusted backend untuk Admin Marketiv agar dapat membaca withdrawal queue, memulai proses manual, menandai transfer berhasil, dan menangani reject/failure + reversal idempotent.

## New Functions
Recommended:
- `get-admin-withdrawal-queue`
- `review-withdrawal`

Jika current repo punya naming convention yang lebih kuat, boleh menyesuaikan tetapi laporkan mapping final.

## Admin Authorization
Reuse current authority pattern dari:
- `get-admin-submission-queue`
- `review-submission`

Wajib authenticated Appwrite user + active admin. Jangan percaya role dari payload.

## Queue Requirements
Support status:
- `requested`
- `processing`
- `succeeded`
- `failed`
- `reversed`
- `all`

DTO minimal:
- withdrawal id,
- user/creator display info bila tersedia,
- amount,
- payout method/provider,
- account number,
- account name,
- status,
- requested timestamp,
- processing timestamp,
- processed timestamp,
- failure reason,
- transfer reference,
- admin note.

Jangan log sensitive destination data.

## Mutation Actions
Recommended explicit actions:
- `start_processing`
- `mark_succeeded`
- `fail`

### start_processing
Allowed: `requested → processing`.
Write `processing_at`, `processed_by`.

### mark_succeeded
Allowed: `processing → succeeded`.
Wajib non-empty `transfer_reference` dan active admin.
Write `processedAt`, `processed_by`, `transfer_reference`, optional `admin_note`.
Update primary withdrawal transaction `pending → completed` dan kirim notification.

### fail
Allowed dari `requested` atau `processing`.
Wajib failure reason.
Flow: `failed → idempotent reversal → reversed`.
Primary withdrawal transaction menjadi failed; append `withdrawal_reversal` completed; write `reversed_at` dan processor audit.

## Schema Requirements
Tambahkan optional fields ke canonical `withdrawals` schema:
- `processing_at`
- `processed_by`
- `transfer_reference`
- `admin_note`

Keep `iris_reference` untuk legacy.
Tambahkan index `status` bila belum ada.

## Function Registry
Update canonical Appwrite generator + function scopes, lalu regenerate derived config.

## Acceptance Criteria
- Non-admin queue/mutation → 403.
- `requested → processing` valid sekali.
- `processing → succeeded` wajib transfer reference.
- Direct client tidak dapat mark success.
- Invalid transition returns conflict.
- Success mengubah primary transaction ke completed.
- Failure/reject credit balance tepat sekali.
- Repeated failure tidak double-credit.
- Reversal append-only deterministic ledger.
- Queue DTO cukup untuk operasional admin.
- No payout provider API.
- Schema berasal dari canonical generator.
