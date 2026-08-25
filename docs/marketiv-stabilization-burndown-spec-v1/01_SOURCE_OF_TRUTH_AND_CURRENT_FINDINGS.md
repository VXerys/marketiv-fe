# Source of Truth & Current Findings

## A. Current repository snapshot observed during spec creation

Latest observed remote `staging` commit:

`14fe080d89fb56050d878d6fd0fd0b0103a737a2`

`feat(negotiation): implement custom offer workflows and backend functions`

Recent history also includes:

- `2e6972d... fix(rate-card): enforce payment idempotency`
- `33af379... fix(rate-card): synchronize negotiation payment flow`
- current package provenance/custom-offer implementation in `14fe080...`

Therefore these Trello items are expected to be **verify-only**, not blindly reimplemented:

- `[BUG-P0] Rate Card dapat membuat lebih dari satu payment untuk satu order`
- `[BUG-P0] Rate Card room tidak sinkron untuk offer/order/payment/escrow`
- `[BUG-P1] Konteks paket Rate Card hilang saat masuk negosiasi`

Codex must verify current local code and tests before deciding status.

---

## B. Current package provenance implementation observed

Current recent implementation introduced package provenance such as:

- `offers.packageId`
- `offers.packageNameSnapshot`
- `offers.packagePriceSnapshot`
- order propagation of package provenance
- server-side package ownership/published validation
- package context in UMKM negotiation DTO
- package context in Creator negotiation DTO
- final `order.amount` remains negotiated offer price

This aligns with the intended Spec 03 model:

**Package = source/provenance/prefill**  
**Accepted Custom Offer = final contract**

Do not refactor it again without a failing test or confirmed runtime regression.

---

## C. Current Admin verified views finding

Current reviewed `review-submission` validation still effectively allows approved views when:

- value is an integer
- value is non-negative

The reviewed code does not show a canonical domain upper-bound validation.

This means the Trello card:

`[BUG-P0] Admin verified views menerima angka tidak masuk akal`

is likely still relevant.

Important:

Do not invent an arbitrary upper bound.

Resolve policy from:
- current Campaign business rule,
- current active T&C,
- current data schema if explicitly intended as domain policy,
- current admin review UX,
- current observation-window rules.

If no documented maximum exists, classify the maximum-policy part as `BLOCKED_BY_BUSINESS_RULE`, while still fixing objectively invalid number representations.

---

## D. Current Rate Card settlement finding

Current reviewed `release-escrow`:

- receives deliverable event;
- requires `deliverable.status === "approved"`;
- checks order is `in_progress` or `revision`;
- loads escrow;
- computes fee snapshot;
- creates deterministic release/fee ledger;
- credits creator wallet;
- marks order completed;
- marks escrow released.

The reviewed release path does **not visibly require a trusted Collab Post validation status before wallet credit**.

Therefore:

`[BUG-P0] Settlement Rate Card belum memverifikasi bukti Collab Post`

is likely still active.

Do not “solve” this by only checking that URL contains `instagram.com`, `tiktok.com`, or `https`.

That is formatting, not proof of Collab Post validity.

---

## E. Fee disclosure finding

Current `EscrowOverviewCard` already imports a canonical `PLATFORM_FEE_RATE` and uses it for a fee badge.

However prose still contains literal `2%`.

Therefore old Trello wording mentioning hardcoded `15%/10%` may be partially stale, but the broader issue—financial copy drifting from canonical fee—still requires current audit.

Fix only current drift.

Do not alter fee calculation if calculation itself is already correct.

---

## F. Typecheck SVG card

Trello still contains:

`[BUG-P1] Typecheck staging gagal pada import logo SVG`

But recent stabilization runs reported successful `npm run typecheck`.

Treat this as:

`VERIFY_FIRST`.

If current typecheck passes:
- no code change;
- classify `ALREADY_FIXED_VERIFIED`.

If the exact SVG import failure still exists:
- fix minimally;
- do not add global unsafe module suppression.

---

## G. Current test/tooling capabilities

Root `package.json` exposes:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run test:e2e`
- `npm run validate-data-contracts`

Backend exposes:

- `npm --prefix 00_BACKEND run test:unit`
- `npm --prefix 00_BACKEND run test:integration`
- `npm --prefix 00_BACKEND test`
- `npm --prefix 00_BACKEND run test:e2e`
- `npm --prefix 00_BACKEND run fn:inventory`
- `npm --prefix 00_BACKEND run fn:drift`
- `npm --prefix 00_BACKEND run fn:sync:dry`

Use repository scripts as discovered at execution time; do not assume this list is immutable.

---

## H. Known source conflicts

Several older Trello descriptions contain historical statements that may no longer reflect current code.

Examples:
- old Rate Card blockers may have been resolved by Spec 01–03;
- older Campaign finance interpretation may conflict with newer Campaign commits;
- withdrawal flow has active teammate changes and is excluded anyway.

Never use an old Trello description to overwrite newer implementation.

Document conflicts explicitly.
