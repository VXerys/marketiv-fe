# Execution Strategy

## Batch 0 — Baseline

- record branch/HEAD/status;
- read this spec;
- reconcile candidate cards;
- verify protected withdrawal paths;
- identify Appwrite schema source;
- identify current admin implementation location;
- inspect package scripts.

No edits yet.

---

# Batch 1 — P0 Admin Verified Views

Use:

`specs/01-admin-verified-views/`

Complete code + targeted tests.

Do not run full repository suite yet.

---

# Batch 2 — P0 Rate Card Collab Settlement

Use:

`specs/02-ratecard-collab-settlement/`

This is financially sensitive.

If trustworthy Collab validation cannot be implemented from current product capabilities, do not fake it.

Implement safe guardrails that are justified and explicitly report blocker.

---

# Batch 3 — P1 Fee Disclosure

Use:

`specs/03-fee-disclosure/`

Current financial calculation should not be changed unless audit proves incorrect.

Goal is source-of-truth consistency.

---

# Batch 4 — Stale / Verify-only Bugs

Run:

- typecheck for SVG card;
- Rate Card Spec 01 regression;
- Rate Card Spec 02 regression;
- Rate Card Spec 03 regression.

Use:

`specs/04-ratecard-specs-regression/`

Only edit if a real regression is found.

---

# Batch 5 — UAT-driven bug pass

Use:

`specs/05-non-withdrawal-uat/`

Do not “implement UAT cards.”

Instead:

scenario fails → root cause → minimal fix → test.

If scenario requires deployed provider/staging:
classify runtime pending.

---

# Batch 6 — Campaign presentation correctness

Use:

`specs/06-campaign-polish/`

Only after correctness.

Lower priority than P0/P1.

---

# Batch 7 — Playwright critical automation

Use:

`specs/07-playwright-critical/`

Include:
- Campaign critical authority/fraud/review
- Rate Card payment/escrow/settlement

Exclude:
- withdrawal

---

# Batch 8 — Full final verification

Use:

`07_FINAL_VERIFICATION_MATRIX.md`

Run full gates once implementation stabilizes.

---

# Batch 9 — Deployment and Trello handoff

Generate:

- schema changes;
- functions to redeploy;
- frontend/admin deployment needs;
- runtime smoke matrix;
- Trello status proposal.

Do not automatically move Trello cards unless user explicitly asks.
