# Spec 02 — Design: Authoritative Room Synchronization

## Current Relevant Files

UMKM:
- `src/components/features/umkm-dashboard/negotiation/detail/NegotiationRoomPage.tsx`
- `src/components/features/umkm-dashboard/negotiation/detail/MessageComposer.tsx`
- `src/components/features/umkm-dashboard/negotiation/detail/CustomOfferCard.tsx`
- `src/components/features/umkm-dashboard/negotiation/modals/PaymentSimulationModal.tsx`

Kreator:
- `src/components/features/creator-dashboard/NegosiasiRoomView.tsx`

Shared:
- `src/lib/appwrite/realtime.ts`
- service DTO readers:
  - `get-umkm-negotiations`
  - `get-creator-negotiations`

## Architecture

### Keep
- Realtime `messages` subscription for chat responsiveness.
- Existing `loadData/loadRoom` authoritative Function/service call.
- Current order/payment/escrow state machine.

### Add
A small shared synchronization mechanism for Rate Card room state.

Prefer a reusable hook/helper following existing repository conventions, e.g.:

`useNegotiationRoomSync(...)`

Do not force this exact path/name if repo has a different hook architecture.

Inputs:
- current `stage`,
- `conversationId`,
- optional `orderId`,
- `reloadAuthoritativeState`,
- enabled/visibility status.

Behavior:
- fast polling for transient transitions,
- slower polling for active work,
- focus/visibility refresh,
- no overlapping loads,
- cleanup on unmount.

## Suggested Adaptive Timing

These are implementation defaults, not business constants:

- `awaiting_order`: ~1.5–2s, bounded ~20s.
- payment return / `pending_payment`: ~2s, bounded initial verification ~30–60s.
- active room `in_progress|revision`: ~5s if needed for cross-role deliverable state.
- terminal `completed|cancelled`: stop recurring polling.
- hidden tab: pause.

Codex may tune values, but must avoid aggressive global polling.

## Midtrans Return Flow

### Before redirect
Build a safe finish URL preserving conversation route and adding a local marker:

`?payment_return=1`

The marker means only:
“browser came back from payment gateway”.

### On return
1. Detect marker.
2. Set local `paymentVerification = verifying`.
3. Reload authoritative negotiation DTO.
4. If stage becomes `in_progress` / escrow-confirmed equivalent:
   - show confirmed success UX,
   - remove return marker using replace navigation.
5. If stage remains `pending_payment` within bounded window:
   - continue polling.
6. If timeout:
   - show unresolved state,
   - provide `Periksa lagi`.
7. Never mutate payment/order status from client.

## Payment CTA

Recommended primary banner/card when `pending_payment`:

**Kesepakatan diterima**
Kreator telah menyetujui penawaran **RpX**.
Selesaikan pembayaran agar pengerjaan dapat dimulai.

`[ Bayar dengan Midtrans ]`

Supporting text:
`Dana akan diamankan melalui escrow Marketiv sampai hasil kerja disetujui.`

Do not create a full UI redesign. Reuse current tokens/components.

## Payment Modal

Current `PaymentSimulationModal` is no longer a simulation in behavior.

Recommended rename:
- `EscrowPaymentModal`
or
- `OrderPaymentModal`

Only rename if it stays focused and references are manageable.

Modal must state:
- harga kesepakatan,
- UMKM pays exact deal amount,
- seller-side platform fee is not added to buyer bill,
- payment method chosen at Midtrans,
- confirmation action creates/opens payment intent, not finalizes payment.

## create-payment Response Handling

- `redirectUrl` → redirect.
- `reused pending redirectUrl` from Spec 01 → redirect to existing intent.
- no redirect and no implemented Snap embed → error, not success.
- backend conflict/already-paid → reload authoritative room state.

## Why Polling Instead of Broad Realtime

`src/lib/appwrite/realtime.ts` explicitly states broad private collection subscriptions are forbidden and realtime must not become authorization authority.

A trusted DTO poll:
- respects Function authorization/join logic,
- works even when client cannot read escrow/payment table events,
- centralizes stage derivation.

## Non-goals

- No package context schema change here.
- No Collab Post validation change.
- No payment provider migration.
