# Scope and Dependencies

## Dependency Graph

```text
Phase 01 Reward Availability
        ↓
Phase 02 Manual Withdrawal Request
        ↓
Phase 03 Admin Withdrawal Backend
        ↓
Phase 04 Admin Withdrawal UI
        ↓
Phase 05 Creator Finance UI Contract
        ↓
Phase 06 Legacy Retirement + Staging UAT
```

Phase 04 tidak boleh dimulai sebelum admin backend contract Phase 03 stabil.
Phase 05 dijalankan setelah response contract Phase 02 dan status transitions Phase 03 final.

## Withdrawal Guard Policy — Current MVP vs Future

### Current MVP Guards

Selalu aktif: Appwrite auth, eligible role + UMKM ledger provenance, active account, latest T&C, minimum amount, valid payout destination, wallet + sufficient balance, deterministic idempotency/reconciliation, unresolved recovery + canonical concurrency protection, recent 60-second duplicate protection, atomic reserve, pending ledger, commit-ambiguity reconciliation, dan no-negative-balance protection.

### Future Advanced Guards

First-withdraw email verification, KYC threshold hard gate, daily withdrawal limit, dan changed-account cooling tidak hard-block default manual-admin MVP. Policy lama tetap re-enableable dengan `WITHDRAWAL_ADVANCED_GUARDS_ENABLED=true`; env absent atau bukan `true` berarti disabled. Default mode juga tidak memutasi `kyc_status` menjadi `pending_wa` saat withdrawal diminta.

## Current Relevant Source of Truth

### Backend
- `00_BACKEND/functions/calculate-campaign-reward/src/main.js`
- `00_BACKEND/functions/mature-pending-balance/src/main.js`
- `00_BACKEND/functions/request-withdrawal/src/main.js`
- `00_BACKEND/functions/withdrawal-callback/src/main.js`
- `00_BACKEND/functions/review-submission/src/main.js`
- `00_BACKEND/functions/get-admin-submission-queue/src/main.js`
- `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- `00_BACKEND/appwrite/function-scopes.json`
- generated `00_BACKEND/appwrite.config.json`

### Creator web
- `src/types/domain.ts`
- `src/services/creator/creator-appwrite.service.ts`
- `src/services/creator/creator-dashboard.service.ts`
- `src/components/features/creator-dashboard/KeuanganView.tsx`
- `src/components/ui/creator-states.tsx`
- `src/lib/appwrite/functions.ts`
- `src/lib/validations/withdrawal.schema.ts`

### Admin web
- `admin/src/lib/admin/appwrite.ts`
- `admin/src/lib/admin/execute-function.ts`
- `admin/src/components/admin/AdminSidebar.tsx`
- `admin/src/features/admin/submissions/**` sebagai pattern
- `admin/src/app/submissions/page.tsx` sebagai pattern

## Collections In Scope

- `campaigns`
- `campaign_submissions`
- `wallets`
- `transactions`
- `withdrawals`
- `notifications`
- `users`
- creator profile hanya untuk display DTO admin bila dibutuhkan

Tidak ada collection baru yang wajib untuk MVP ini.

## External Dependencies

### Tetap digunakan
- Midtrans payment / Snap untuk UMKM payment flow.
- Appwrite Functions/Database/Auth.

### Dihapus dari withdrawal baru
- Midtrans Iris automated payout.

## Deployment Dependencies

Fase yang menyentuh schema/function registry memerlukan:
1. regenerate Appwrite config sesuai workflow repo,
2. deploy schema terlebih dahulu jika Function membutuhkan field baru,
3. deploy Functions,
4. deploy admin/frontend setelah backend contract tersedia.

Commit code bukan bukti Appwrite runtime sudah terdeploy.
