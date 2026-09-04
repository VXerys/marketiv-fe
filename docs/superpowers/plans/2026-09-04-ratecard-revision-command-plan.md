# Rate Card Revision Command Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task with review checkpoints.

**Goal:** Make Rate Card revision requests a trusted synchronous Appwrite command with least-privilege revision rows and no active event race.

**Architecture:** Add `request-ratecard-revision` using server API key and authoritative caller/order data. Frontend delegates only `{ orderId, message }`; `sync-order-revision` remains source-only but disabled and without revision-create event. Existing escrow/review functions stay authoritative for validation and payout.

**Tech Stack:** Next.js/React/TypeScript, Appwrite Web SDK, Appwrite Node SDK, Node test runner, Vitest.

## Global Constraints

- Caller authority comes only from Appwrite execution header.
- Frontend sends only `orderId` and `message`.
- Eligible order status is `in_progress` or `revision`; latest deliverable must be `submitted`.
- Revision row permissions are `read(UMKM)` and `read(Creator)` only.
- Do not change `revision_count`, escrow, wallet, payment, or validation state.
- `sync-order-revision` has no active event trigger and is disabled.
- Do not deploy production.

### Task 1: Trusted revision Function

**Files:**
- Create: `00_BACKEND/functions/request-ratecard-revision/src/main.js`
- Create: `00_BACKEND/functions/request-ratecard-revision/src/main.test.js`
- Create: `00_BACKEND/functions/request-ratecard-revision/package.json`

Write failing tests first for authenticated active UMKM owner, Creator 403, foreign UMKM 404, eligible states/latest submitted, duplicate latest guard, limit, row permissions, order/deliverable/timer mutations, and unchanged financial collections. Implement dependency-injected handler with server-side caller/role/order/latest/revision-limit checks and deterministic revision ID. Run `node --test src/main.test.js`.

### Task 2: Frontend and registry wiring

**Files:**
- Modify: `src/lib/appwrite/functions.ts`
- Modify: `src/services/shared/deliverable-appwrite.service.ts`
- Modify: `src/services/shared/__tests__/deliverable-appwrite.service.test.ts`
- Modify: `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- Modify: `00_BACKEND/appwrite/function-scopes.json`
- Modify: `00_BACKEND/appwrite/ops/harden-permissions.mjs`
- Regenerate: `00_BACKEND/appwrite.config.json`

Change request wrapper to validate then call `executeFunction` only. Register Function with `execute: ["users"]`, document scopes, and close `revisions` collection permissions. Retire `sync-order-revision` event and disable it. Add tests asserting no browser database mutation and config hardening.

### Task 3: Version and lifecycle regressions

**Files:**
- Modify: `00_BACKEND/functions/release-escrow/src/main.js`
- Modify: `00_BACKEND/functions/review-ratecard-deliverable/src/main.js`
- Modify: affected tests under `00_BACKEND/functions/` and `00_BACKEND/tests/`

Add focused regression coverage proving v1 validation cannot authorize v2 and escrow/wallet remain unchanged until matching latest validation plus UMKM approval. Avoid unrelated financial changes; preserve current source/version snapshot guards.

### Task 4: Documentation and verification

**Files:**
- Modify: `00_BACKEND/docs/02_Modules/Orders/60_API.md`
- Modify: `00_BACKEND/docs/02_Modules/Orders/100_Testing.md`
- Modify: `00_BACKEND/docs/02_Modules/Orders/70_Backend.md`

Document synchronous command, retired event, row permissions, lifecycle, and staging migration order. Run focused tests, typecheck, affected lint, build, inventory/config audit, and `git diff --check`.
