You are implementing the Marketiv Rate Card Manual Collab Validation MVP.

Repository:
`marketiv-id/marketiv-web`

Branch:
`staging`

Read completely:
`docs/marketiv-ratecard-manual-collab-validation-spec-v1/README.md`
`REQUIREMENTS.md`
`DESIGN.md`
`TASKS.md`
`VERIFICATION_MATRIX.md`

## Product decision

Admin Marketiv is the trusted manual validator for Rate Card Collab Post evidence in MVP.

Do NOT implement fake automated Instagram/TikTok verification.

## Mandatory invariant

Escrow can release only when:
- exact deliverable is latest;
- deliverable is approved;
- separate trusted Admin validation exists;
- validation is valid and matches exact evidence/version/order;
- order and escrow are releasable;
- existing idempotency checks pass.

## Important current architecture

Current UMKM browser may directly update deliverable status to approved.

Do not rely on client approval as validation.

Do not store trusted validation as a user-writable deliverable field.

Use server-controlled validation persistence.

## Ordering

Must work both:
1. Admin valid → UMKM approve
2. UMKM approve first → no release → Admin valid later → settlement re-evaluates automatically

No second manual approval required.

## Hard exclusion

Withdrawal is owned by another teammate.

Do not touch any withdrawal-specific:
- frontend
- backend
- Functions
- schema
- tests
- docs
- Midtrans Iris

## First action

Read-only audit first and print:
- branch
- HEAD
- dirty files
- current relevant data flow
- canonical Appwrite schema source
- existing Function triggers
- exact implementation plan

Then implement without waiting for deployment confirmation from other work.

## Verification

Run targeted tests during implementation.

At end run all applicable:
- backend targeted integration
- root tests relevant to touched flow
- Admin tests
- root/Admin typecheck
- root/Admin lint
- root/Admin build
- node --check for changed Functions
- git diff --check

Do not claim staging PASS until deployed runtime test occurs.

## Final report

Return:
1. baseline
2. diagnosis
3. final architecture
4. schema + permissions
5. new/changed Functions
6. event wiring
7. Admin UI
8. UMKM/Creator UX
9. exact release eligibility
10. Admin-first + UMKM-first behavior
11. changed files
12. tests and command results
13. withdrawal protection confirmation
14. deployment order
15. Functions to redeploy
16. frontend/Admin redeploy
17. runtime three-role test matrix
18. remaining risks

Do not mutate Trello.
Do not deploy destructive Appwrite changes automatically.
Stop after final report.
