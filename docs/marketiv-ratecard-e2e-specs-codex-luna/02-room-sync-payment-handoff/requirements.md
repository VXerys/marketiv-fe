# Spec 02 — Requirements: Negotiation Room Sync & Payment Handoff

## Problem Statement

Current Rate Card room has correct business stages, but the UI can become stale.

Current room realtime behavior primarily reloads when `messages` changes, while the E2E state machine changes through:
- `offers`,
- `orders`,
- `payments`,
- `escrows`,
- `deliverables`,
- `revisions`.

Critical example:
- Kreator accepts offer.
- `create-order` asynchronously creates order `pending_payment`.
- UMKM room can remain on old stage.
- CTA `Bayar` only appears after authoritative DTO reports `pending_payment`.
- User may need refresh and perceives flow as “deal sudah selesai tapi bayarnya di mana?”

## Functional Requirements

### R1 — Authoritative room refresh
UMKM and Kreator room must refresh business state without manual page reload while the room is active.

### R2 — Do not add broad private realtime subscriptions
Current realtime helper explicitly forbids broad private collection subscription.

Preferred solution:
- preserve realtime for message UX,
- add bounded authoritative polling / focus refresh for negotiation state,
- or use proven per-document scoped channel only if current Appwrite deployment supports and repository can verify it.

### R3 — Adaptive synchronization
At minimum handle:
- `offer_pending` → accepted/rejected,
- `awaiting_order` → `pending_payment`,
- `pending_payment` → `in_progress` after Midtrans webhook + escrow,
- `in_progress` ↔ `revision`,
- deliverable submitted/updated,
- `completed`,
- `cancelled`.

### R4 — Payment CTA clarity
When authoritative stage is `pending_payment`, UMKM must see one obvious primary CTA:
**Bayar dengan Midtrans**

It must not depend on scrolling to an old chat message or opening the `+` quick menu.

Existing secondary surfaces may remain only if they do not create confusing duplicate primary actions.

### R5 — Midtrans return is not payment success
Returning to Marketiv from Midtrans means:
**“user kembali dari payment gateway”**, not “paid”.

Frontend must:
1. enter verification state,
2. reload/poll authoritative room state,
3. show success only when backend state proves payment/escrow progression.

### R6 — No false success fallback
If `create-payment` returns no usable redirect URL and there is no implemented in-page Snap flow:
- do not open success modal,
- show error/actionable state.

### R7 — Visible payment verification state
Recommended copy:
- `Memeriksa pembayaran...`
- `Kami menunggu konfirmasi dari Midtrans. Jangan melakukan pembayaran ulang.`

If verification times out:
- `Pembayaran belum terkonfirmasi`
- action: `Periksa lagi`
- payment retry only follows Spec 01 server idempotency.

### R8 — Re-sync on focus
If user returns to tab/app, reload room state.

### R9 — No request storm
Polling must:
- stop/suspend when tab hidden,
- stop on terminal states,
- avoid overlapping request,
- clean up on unmount,
- use bounded/fallback intervals.

## Non-functional Requirements

- Server DTO remains source of truth.
- Do not invent a new DB order status only for presentation.
- Local UI state may use `verifying_payment` as view state only.
- Existing chat send/realtime behavior must remain intact.
- Preserve role authorization.
- Mobile and desktop CTA must remain visible and usable.
