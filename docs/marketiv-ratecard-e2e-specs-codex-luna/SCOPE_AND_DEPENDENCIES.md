# Scope & Dependency Map

## Why these three tasks were chosen

### 1. Payment idempotency — P0
Highest severity because it protects real financial integrity. It also enables safe retry UX.

### 2. Room sync + payment handoff — P0
Highest product/E2E blocker. It solves the exact “sudah deal tapi UMKM bingung bayar di mana” problem without changing the underlying Rate Card state machine.

### 3. Package context persistence — P1
Fixes conceptual/UX continuity and audit provenance. Important, but safer after payment and room-state reliability are stable.

## Dependency Graph

```text
Spec 01 Payment Idempotency
        ↓
Spec 02 Room Sync + Payment Return
        ↓
Spec 03 Package Context
        ↓
Staging Midtrans E2E UAT
        ↓
Remaining settlement validation / polish
```

## Explicitly Out of Scope for This Pack

- Campaign verified-views admin bug.
- Campaign pendingBalance maturation.
- Creator withdrawal UI state.
- Collab Post semantic validation for Rate Card settlement.
- Direct Order path implementation.
- Dispute/refund redesign.
- Large visual redesign.
- Appwrite/Supabase migration.
- Midtrans provider migration.

The existing Collab Post settlement P0 remains a separate blocker for a fully production-ready settlement path and must still be handled before production release.
