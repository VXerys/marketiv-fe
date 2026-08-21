# Spec 01 — Design: Payment Idempotency

## Current Relevant Files

Primary:
- `00_BACKEND/functions/create-payment/src/main.js`
- `00_BACKEND/functions/midtrans-webhook/src/main.js`
- `00_BACKEND/functions/cancel-payment/src/main.js` (audit current implementation before edit)
- Appwrite schema/config source of truth
- integration/unit tests untuk payment Functions

Frontend touch only if response contract needs small adaptation:
- `src/services/umkm/umkm-appwrite.service.ts`
- `src/services/umkm/umkm-dashboard.service.ts`
- payment modal / negotiation room

## Proposed Invariant

For Rate Card order:

`one orderId → at most one non-retryable payment lock`

Recommended data concept:

`order_payment_key = "order:<orderId>"`

Properties:
- optional / nullable field on `payments`,
- unique index,
- set on new order payment,
- retained for `pending` and `paid`,
- cleared when payment becomes retryable terminal: `failed`, `expired`, `cancelled`.

Name may be adjusted to existing naming conventions, but semantics must stay explicit.

### Why not unique(order_id)?
Because audit history must remain and failed/expired attempts need to allow a new payment row.

### Why not query-only?
Two concurrent requests can both read “no payment” before either inserts. The database must arbitrate.

## Create Payment Algorithm

For `purpose = order`:

1. Load + validate order ownership/status/amount exactly as current.
2. Compute server-side order payment key.
3. Search payment by key.
4. If found:
   - `paid` → return conflict/already-paid.
   - `pending` + usable `redirect_url` or supported token → return existing intent with `reused: true`.
   - `pending` without usable gateway intent → return “payment sedang dipersiapkan”, do not create another.
5. If not found:
   - create payment row with unique order payment key.
6. If insert loses unique race:
   - fetch winner by key,
   - return winner intent/state,
   - do not create a second Midtrans transaction.
7. Create Midtrans transaction only for the winning new payment row.
8. Persist token/redirect URL.
9. If gateway creation fails:
   - mark row `failed`,
   - clear retry lock/key in the same recovery path if schema semantics require it.
10. Return `status: pending`.

## Webhook Algorithm

Current terminal set:
- paid
- failed
- expired
- cancelled

When authoritative webhook moves to:
- `paid`: keep order payment key.
- `failed|expired|cancelled`: clear retry lock/key.
- `pending`: keep key.

Do not clear lock based on client redirect.

## Cancel Payment

Audit current `cancel-payment`.

If cancellation authoritatively reaches a retryable cancelled state:
- clear order payment key.
- preserve row for audit.

## Schema Source of Truth

Codex must identify which file is canonical for Appwrite schema generation in current repo.

Rules:
- update canonical schema definition,
- regenerate derived `appwrite.json` / config if repository workflow expects generation,
- do not manually edit multiple generated copies inconsistently,
- document required staging schema deployment.

## Response Contract

Recommended extension, backward-compatible:

```ts
type PaymentIntent = {
  paymentId: string;
  gateway: "midtrans";
  status: "pending";
  snapToken?: string;
  redirectUrl?: string;
  reused?: boolean;
}
```

`reused` is informative only; business authority remains server state.

## Observability

Log:
- payment-created
- payment-reused
- unique-race-recovered
- payment-retry-unlocked
- already-paid-rejected

Never log keys/secrets/card data.

## Non-goals

- No redesign of Rate Card chat.
- No withdrawal changes.
- No Campaign payment redesign.
- No new payment provider.
