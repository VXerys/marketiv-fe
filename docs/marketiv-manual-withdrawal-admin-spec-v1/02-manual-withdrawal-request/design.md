# Phase 02 — Design

## Primary File
- `00_BACKEND/functions/request-withdrawal/src/main.js`
- tests for request-withdrawal

Contract references boleh dibaca, tetapi full creator UI adaptation adalah Phase 05.

## Target Algorithm
```text
POST request-withdrawal
→ authenticate
→ validate role/status/TOS/email/KYC
→ validate amount/rate/cooling/duplicate
→ find wallet
→ create deterministic withdrawal(requested)
→ atomically decrement wallet.balance
→ create transaction(withdrawal, pending)
→ notify user
→ return requested receipt
```

## Removed New-Request Path
```text
createIrisPayout(...)
→ processing
→ iris_reference
```
Jangan replace dengan provider lain.

## Idempotency
Preserve current deterministic withdrawal ID dari `userId + requestKey` dan duplicate guards.

## Transaction State
Request acceptance bukan final money transfer. Gunakan `pending` bila current transaction status contract mendukungnya. Phase 03 akan update ke `completed` pada success atau `failed` pada reversal.

## Error Recovery
Preserve atomic decrement. Jika debit gagal setelah withdrawal row creation, cleanup/fail safely. Jika transaction write gagal setelah debit, audit current pattern dan gunakan recoverable approach; jangan melakukan unsafe double-credit rollback.

## Legacy Iris
Keep callback source, legacy `iris_reference`, dan existing processing rows sampai Phase 06.

## Schema
Tidak ada schema change yang diharapkan pada Phase 02.
