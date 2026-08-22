# Phase 05 — Design

## Expected Files
Primary:
- `src/types/domain.ts`
- `src/services/creator/creator-appwrite.service.ts`
- `src/services/creator/creator-dashboard.service.ts`
- `src/components/features/creator-dashboard/KeuanganView.tsx`

Possible only if needed:
- `src/components/ui/creator-states.tsx`
- creator finance tests/mocks
- `src/lib/validations/withdrawal.schema.ts`
- `src/lib/appwrite/functions.ts`

## UX State
```text
request accepted
→ apply balanceAfter
→ local pending transaction row
→ modal “menunggu diproses admin”
```
Jangan buat source of truth kedua untuk withdrawal status.

## Copy Guidance
Recommended:
> Pengajuan penarikan telah diterima. Tim Marketiv umumnya memproses penarikan dalam 1–2 hari kerja.

Avoid:
- “maksimal 2 hari”,
- “dana sudah masuk”,
- “bank sedang memproses” immediately after request,
- “Selesai” sebelum admin final confirmation.

## Transaction Mapping
Current `transactions` tetap authoritative financial history. `referenceType = withdrawal` tetap sumber Withdrawal. Jika backend memakai `pending → completed/failed`, UI harus bisa merender status tersebut.

## No New Realtime Requirement
MVP boleh mengandalkan refresh/re-fetch. Jangan menambah broad private realtime hanya untuk fitur ini.
