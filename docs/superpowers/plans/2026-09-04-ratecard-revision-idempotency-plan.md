# Rate Card Revision Idempotency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Make `request-ratecard-revision` retry-safe and concurrency-safe across its three document writes.

**Architecture:** Do not migrate legacy document collections to TablesDB transactions. `node-appwrite` 14.2.0 exposes no transaction API, while available Appwrite transaction endpoints target TablesDB rows rather than current document mutations. Key one logical request by `orderId + latestDeliverableId`; deterministic create conflict recovery resumes missing deliverable/order side effects.

**Tech Stack:** Appwrite Node Function, `node-appwrite`, Node test runner.

## Global Constraints

- Frontend sends only `{ orderId, message }`.
- Caller authority comes only from Appwrite execution context/header.
- Eligible order status remains `in_progress` or `revision`; latest deliverable must be `submitted` for a new logical request.
- A matching deterministic revision may recover when latest deliverable is `submitted` or `revision_requested`.
- Revision limit counts only newly created logical revision rows.
- No changes to `revision_count`, validation, escrow, wallet, or payment.
- No production deployment.

### Task 1: Add failure-path and concurrency regression tests

**Files:**
- Modify: `00_BACKEND/functions/request-ratecard-revision/src/main.test.js`

- [x] Add tests that inject failures after revision creation and after deliverable update, then retry and assert one row plus final desired state.
- [x] Add concurrent same-deliverable requests and assert one deterministic row and one revision-limit usage.
- [x] Add retry-safe second-cycle coverage after v2 submission and assert financial state remains untouched.
- [x] Run the focused test file and confirm new tests fail because current ID uses revision count and current handler rejects `revision_requested` recovery.

### Task 2: Implement deterministic idempotent recovery

**Files:**
- Modify: `00_BACKEND/functions/request-ratecard-revision/src/main.js`

- [x] Derive revision ID from `orderId + latest.$id`.
- [x] Read matching deterministic row before enforcing latest status/limit; validate matching row provenance.
- [x] For missing row, require latest `submitted`, enforce total-row limit, and create once.
- [x] Treat create `409` as concurrent operation discovery, load existing row, and resume.
- [x] Update deliverable only when `submitted`; accept `revision_requested` as completed side effect.
- [x] Always enforce order `revision` and timer fields null.
- [x] Run focused tests and confirm all recovery/concurrency cases pass.

### Task 3: Documentation and verification

**Files:**
- Modify: `00_BACKEND/docs/02_Modules/Orders/70_Backend.md`
- Modify: `00_BACKEND/docs/02_Modules/Orders/100_Testing.md`
- Modify: `docs/superpowers/specs/2026-09-04-ratecard-revision-command-design.md`

- [x] Document transaction audit result and idempotent recovery contract.
- [x] Run focused backend/frontend tests, typecheck, affected lint, build, function inventory/config checks, and `git diff --check`.
- [x] Commit and push only `staging`; do not deploy production.
