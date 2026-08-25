# Requirements — Verify Rate Card Spec 01–03

This spec is regression-only.

Do not refactor completed implementations unless a failing test/runtime scenario proves a regression.

## Spec 01 — Payment Idempotency

Verify:
- one active payment per order;
- pending intent reused;
- concurrent create requests have one winner;
- paid blocks retry;
- gateway failed/expired/cancelled permits retry;
- local cancel does not create a second externally payable path;
- ambiguous Snap/network error fails closed;
- duplicate webhook does not duplicate escrow/ledger;
- Campaign payment unaffected.

## Spec 02 — Room Sync / Payment Handoff

Verify:
- Creator accept leads UMKM to `pending_payment` without manual F5;
- primary `Bayar dengan Midtrans`;
- polling bounded;
- hidden tab pause;
- focus/visible refresh;
- no broad private realtime;
- `payment_return=1` is marker only;
- `payment_preparing` blocks repay;
- success waits for authoritative `in_progress`;
- Creator room also updates.

## Spec 03 — Package Provenance

Verify:
- selected package ID is preserved;
- existing conversation reused;
- package context survives refresh/deep link;
- Custom Offer prefilled;
- final fields remain editable;
- package validated server-side;
- offer stores package provenance;
- order copies immutable provenance;
- negotiated offer price remains `order.amount`;
- package edit after deal does not rewrite historical final terms;
- legacy rows still work.
