# Backlog Reconciliation Procedure

## Goal

Avoid wasting time on stale Trello cards.

Before coding, Codex must create a concise reconciliation of Trello against current local `staging`.

Do not perform a broad repository audit unrelated to the listed cards.

---

## A. Candidate bug cards

### 1. Admin verified views

Card:

`[BUG-P0] Admin verified views menerima angka tidak masuk akal`

Trello:
https://trello.com/c/He2XLOuR/35-bug-p0-admin-verified-views-menerima-angka-tidak-masuk-akal

Expected starting classification:

`OPEN` unless current local code has changed after spec creation.

---

### 2. Rate Card Collab Post settlement

Card:

`[BUG-P0] Settlement Rate Card belum memverifikasi bukti Collab Post`

Trello:
https://trello.com/c/NbzNDTWa/19-bug-p0-settlement-rate-card-belum-memverifikasi-bukti-collab-post

Expected starting classification:

`OPEN` unless current code now has trusted validation.

---

### 3. Fee disclosure drift

Card:

`[BUG-P1] Copy fee escrow 15%/10% tidak sesuai implementasi kanon 2%`

Trello:
https://trello.com/c/rB3n3PKZ/24-bug-p1-copy-fee-escrow-15-10-tidak-sesuai-implementasi-kanon-2

Expected:

`RE-AUDIT`.

Old exact percentages may already be gone.

Fix only current remaining inconsistencies.

---

### 4. SVG typecheck

Card:

`[BUG-P1] Typecheck staging gagal pada import logo SVG`

Trello:
https://trello.com/c/gC7iXIjQ/22-bug-p1-typecheck-staging-gagal-pada-import-logo-svg

Expected:

`VERIFY_ONLY` first.

---

### 5. Rate Card room sync

Card:

`[BUG-P0] Rate Card room tidak sinkron untuk offer/order/payment/escrow`

Trello:
https://trello.com/c/RQFxA0Ty/37-bug-p0-rate-card-room-tidak-sinkron-untuk-offer-order-payment-escrow

Expected:

`VERIFY_ONLY`.

Spec 02 reported complete.

---

### 6. Rate Card package context

Card:

`[BUG-P1] Konteks paket Rate Card hilang saat masuk negosiasi`

Trello:
https://trello.com/c/FlGhAoK0/38-bug-p1-konteks-paket-rate-card-hilang-saat-masuk-negosiasi

Expected:

`VERIFY_ONLY`.

Recent commit contains package provenance implementation.

---

### 7. Rate Card payment duplication

Card:

`[BUG-P0] Rate Card dapat membuat lebih dari satu payment untuk satu order`

Trello:
https://trello.com/c/3fQwVdRS/39-bug-p0-rate-card-dapat-membuat-lebih-dari-satu-payment-untuk-satu-order

Expected:

`VERIFY_ONLY`.

Spec 01 reported complete.

---

### 8. Withdrawal UI bug

Card:

`[BUG-P0] Withdrawal Kreator UI masih menandai transaksi completed terlalu dini`

Trello:
https://trello.com/c/qqgZY0SD/36-bug-p0-withdrawal-kreator-ui-masih-menandai-transaksi-completed-terlalu-dini

Classification:

`OUT_OF_SCOPE_WITHDRAWAL`

No edit.

---

## B. UAT cards

UAT is not synonymous with bug.

Use these as acceptance matrices:

### Auth
- AUTH-01
- AUTH-03

AUTH-02 is already Done but may receive smoke regression only.

### UMKM
- UMKM-01 Overview
- UMKM-02 Campaign lifecycle
- UMKM-03 Creator directory/profile/rate card
- UMKM-04 Rate Card negotiation
- UMKM-05 payment/deliverable/revision/escrow
- UMKM-06 finance/analytics/notification/help/settings excluding withdrawal

### Creator
- KREATOR-01 Overview
- KREATOR-02 Campaign Job Pool/claim
- KREATOR-03 active work/submission/fraud state
- KREATOR-04 Rate Card CRUD
- KREATOR-05 negotiation/deliverable

### E2E
- E2E-01 Campaign core
- E2E-02 Rate Card + Midtrans

### Explicitly exclude
- KREATOR-06 withdrawal parts

---

## C. Reconciliation method

For each candidate:

1. Read current local relevant implementation.
2. Read related current tests.
3. Compare to Trello acceptance.
4. Classify:
   - OPEN
   - ALREADY_FIXED
   - VERIFY_ONLY
   - BLOCKED
   - OUT_OF_SCOPE_WITHDRAWAL
5. Identify exact files only if OPEN.
6. Identify schema/Function impact.
7. Proceed.

---

## D. Required reconciliation output

Before edits print:

```text
Current branch:
Current HEAD:
Dirty files:

Card | Classification | Current evidence | Action
```

Keep this output concise.

The goal is to start implementation quickly, not write another 50-page audit.
