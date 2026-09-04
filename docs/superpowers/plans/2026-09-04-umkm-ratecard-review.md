# UMKM Dedicated Rate Card Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build authoritative order-centric Rate Card review list/detail UX for UMKM.

**Architecture:** New Appwrite Function queries UMKM-owned orders, batch-joins review context, and returns list or one detail DTO. Dedicated frontend feature consumes this DTO; existing trusted approval/revision mutations remain unchanged; Negotiation Room becomes contextual link only.

**Tech Stack:** Next.js App Router, React, TypeScript, Tailwind CSS, Appwrite Functions, node-appwrite, Vitest, Node test runner.

## Global Constraints

- Branch `staging`, baseline `4069616`.
- Never query Campaign collections from review Function.
- Never change payment, escrow, wallet, T&C, withdrawal, validation mutation, or revision mutation behavior.
- Use `orderId`, not `conversationId`, for detail route and Function detail input.
- No deployment; commit and push source only.

---

### Task 1: Trusted order-centric read Function

**Files:**
- Create: `00_BACKEND/functions/get-umkm-ratecard-reviews/package.json`
- Create: `00_BACKEND/functions/get-umkm-ratecard-reviews/.env.example`
- Create: `00_BACKEND/functions/get-umkm-ratecard-reviews/src/main.js`
- Create: `00_BACKEND/functions/get-umkm-ratecard-reviews/src/main.test.js`
- Modify: `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- Modify: `00_BACKEND/appwrite/function-scopes.json`
- Modify: `00_BACKEND/appwrite.config.json`
- Modify: `00_BACKEND/tests/integration/function-inventory.test.ts`

**Interfaces:**
- Consumes: `{ orderId?: string }`, authoritative `x-appwrite-user-id`.
- Produces: `RatecardReview[] | RatecardReview`, where deliverables are version-sorted and validation belongs to latest deliverable.

- [ ] Write handler tests for multiple same-conversation orders, completed retention, foreign 404, latest-version validation, and batch reads.
- [ ] Run `npm test` in Function directory; expect failures because handler does not exist.
- [ ] Implement paginated owner query, batched joins, DTO mapping, and 404 detail response.
- [ ] Run Function tests; expect pass.
- [ ] Register Function with `execute: ["users"]` and `documents.read`, regenerate config, then run inventory test.

### Task 2: Frontend review model and service

**Files:**
- Create: `src/types/ratecard-review.types.ts`
- Create: `src/services/umkm/ratecard-review.service.ts`
- Create: `src/services/umkm/__tests__/ratecard-review.service.test.ts`
- Modify: `src/lib/appwrite/functions.ts`

**Interfaces:**
- Produces: `getUmkmRatecardReviews()` and `getUmkmRatecardReview(orderId)` returning `ServiceResult`.
- Consumes: `FUNCTION_IDS.umkmRatecardReviews` and Function DTO without client-side joins.

- [ ] Write failing service tests for list and detail execution payloads.
- [ ] Add typed DTO and service calls.
- [ ] Run focused service tests; expect pass.

### Task 3: Review semantics and dedicated routes

**Files:**
- Create: `src/components/features/umkm-dashboard/ratecard-review/review-state.ts`
- Create: `src/components/features/umkm-dashboard/ratecard-review/RatecardReviewListPage.tsx`
- Create: `src/components/features/umkm-dashboard/ratecard-review/RatecardReviewDetailPage.tsx`
- Create: `src/components/features/umkm-dashboard/ratecard-review/RatecardReviewSkeleton.tsx`
- Create: `src/components/features/umkm-dashboard/ratecard-review/index.ts`
- Create: `src/app/dashboard/umkm/review-rate-card/page.tsx`
- Create: `src/app/dashboard/umkm/review-rate-card/loading.tsx`
- Create: `src/app/dashboard/umkm/review-rate-card/[orderId]/page.tsx`
- Create: `src/app/dashboard/umkm/review-rate-card/[orderId]/loading.tsx`
- Create: focused tests beside feature.

**Interfaces:**
- `getReviewState(review)` returns filter, labels, `canApprove`, and `canRequestRevision`.
- Detail mutations always pass `review.latestDeliverable.id`, disable while running, then call authoritative detail read again.

- [ ] Write failing pure state tests for pending, valid, invalid, revision, completed, and v1/v2 action ownership.
- [ ] Write failing render tests for loading, empty, error/retry, validation copy, action visibility, and mutation refetch.
- [ ] Implement responsive list/detail and skeletons using existing Marketiv design tokens/classes.
- [ ] Run focused feature tests; expect pass.

### Task 4: Navigation and Negotiation handoff

**Files:**
- Modify: `src/components/features/dashboard/DashboardSidebar.tsx`
- Modify: `src/components/features/dashboard/DashboardTopbar.tsx`
- Modify: `src/components/features/umkm-dashboard/negotiation/detail/DeliverableReviewCard.tsx`
- Modify: `src/components/features/umkm-dashboard/negotiation/detail/NegotiationRoomPage.tsx`
- Create/modify: focused navigation and Negotiation CTA tests.

**Interfaces:**
- Sidebar route: `/dashboard/umkm/review-rate-card`.
- Compact card route: `/dashboard/umkm/review-rate-card/{orderId}`.

- [ ] Write failing navigation and compact CTA tests.
- [ ] Add sidebar/topbar metadata and compact state-specific CTA.
- [ ] Remove Negotiation Room approval/revision handlers and dialogs while preserving deliverable status and chat.
- [ ] Run focused tests; expect pass.

### Task 5: Verification and delivery

- [ ] Run focused Function and frontend tests.
- [ ] Run frontend full tests, typecheck, affected lint, and build with staging-safe admin URL.
- [ ] Run Function inventory/config tests and `git diff --check`.
- [ ] Review responsive/state UI against Hallmark anti-slop gates using existing Marketiv system.
- [ ] Commit all files with a normal Conventional Commit message.
- [ ] Push commit to `origin/staging`; do not deploy.
