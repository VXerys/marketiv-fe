# Rate Card E2E Verification Matrix

## Test Accounts

Use two independent sessions:
- UMKM A
- Kreator B

Never put password, OTP, session cookie, server key, or raw token in evidence.

## Pre-test Record

Record:
- branch + commit SHA,
- deployed Function version/time,
- browser + viewport,
- order/payment/escrow initial state,
- Creator wallet balance before release.

## Matrix

| ID | Scenario | Expected |
|---|---|---|
| RC-01 | UMKM chooses published package | Correct creator/package context visible |
| RC-02 | Open/reuse conversation | Same pair uses same conversation |
| RC-03 | UMKM sends custom offer | One pending offer, package provenance preserved |
| RC-04 | Creator rejects | UMKM sees rejected without manual full reload |
| RC-05 | UMKM sends replacement offer | Valid after previous reject/withdraw |
| RC-06 | Creator accepts | create-order produces exactly one order |
| RC-07 | Order creation delayed | UI shows transition and eventually pending_payment |
| RC-08 | UMKM sees pay CTA | CTA obvious without scrolling/reload |
| RC-09 | First create-payment | One pending payment + Midtrans redirect |
| RC-10 | Rapid double-click/request | Same active payment; no second Midtrans transaction |
| RC-11 | Refresh before webhook | Existing pending intent reused, no new payment |
| RC-12 | Midtrans cancel/expire | No false paid; retry becomes allowed |
| RC-13 | Return before webhook | UI says verifying, not success |
| RC-14 | Valid Midtrans success webhook | payment paid → one escrow held → order in_progress |
| RC-15 | Duplicate webhook | no duplicate escrow/payment ledger |
| RC-16 | Creator sees in_progress | no manual full reload required |
| RC-17 | Creator submits deliverable | UMKM sees new deliverable |
| RC-18 | UMKM requests revision | order revision; creator sees request |
| RC-19 | Creator resubmits | new version visible |
| RC-20 | UMKM approves | release escrow exactly once |
| RC-21 | Release reconciliation | Creator balance += amount - fee snapshot |
| RC-22 | Fee reconciliation | fee ledger equals expected seller-side fee |
| RC-23 | Completed state | both roles stable completed |
| RC-24 | Legacy negotiation without packageId | still works |
| RC-25 | Campaign smoke | Campaign create/payment/reward path unaffected |

## Midtrans Negative Tests

Must cover:
- cancel,
- expire,
- failure/deny if test mechanism available,
- return without authoritative webhook completion,
- duplicate webhook replay,
- duplicate create-payment request.

## Exit Rule

Do not mark `[UAT-E2E-02]` PASS until:
- all critical RC-06 through RC-22 pass,
- evidence is attached,
- no P0 defect remains on payment/escrow/release path.
