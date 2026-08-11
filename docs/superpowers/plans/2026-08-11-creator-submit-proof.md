# Creator Submit Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Route creator proof submission through trusted backend Function and reject claim/campaign mismatches before any mutation.

**Architecture:** Keep UI contract unchanged while shifting mutation authority from browser `createDocument` to `executeFunction`. Frontend service remains responsible for ownership and cheap validation; backend Function remains single write surface for live schema translation.

**Tech Stack:** Next.js, TypeScript, Appwrite SDK, Vitest

## Global Constraints

- Keep public submit API `submitProof(input)` unchanged.
- No new direct browser writes to `campaign_submissions`.
- Validate `claim.campaignId === input.campaignId` before calling Function.
- Use TDD: failing test first, then minimal implementation.

---

### Task 1: Add failing tests for trusted submit path

**Files:**
- Create: `src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`
- Modify: none
- Test: `src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`

**Interfaces:**
- Consumes: `submitProofInAppwrite(input: SubmitProofInput): Promise<ServiceResult<null>>`
- Produces: regression coverage for function invocation and campaign mismatch rejection

- [ ] **Step 1: Write failing test**

```ts
it("calls submit-campaign-proof for valid owned claim", async () => {
  // mock session user, claim lookup, and executeFunction
});

it("rejects when claim campaign does not match payload", async () => {
  // expect validation error and no function call
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk npx vitest run src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`
Expected: FAIL because current implementation writes direct document and does not use Function/mismatch guard.

- [ ] **Step 3: Write minimal implementation**

```ts
// add function ID, switch submitProofInAppwrite to executeFunction, add mismatch guard
```

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk npx vitest run src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/specs/2026-08-11-creator-submit-proof-design.md docs/superpowers/plans/2026-08-11-creator-submit-proof.md src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts src/lib/appwrite/functions.ts src/services/creator/creator-appwrite.service.ts
git commit -m "fix: route creator proof submit via function"
```

### Task 2: Verify no caller contract regression

**Files:**
- Modify: `src/services/creator/creator-dashboard.service.ts` (only if typing/export needs adjustment)
- Test: `src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`

**Interfaces:**
- Consumes: existing `submitProof(input)`
- Produces: unchanged UI-facing contract

- [ ] **Step 1: Add or confirm regression assertion**

```ts
expect(typeof submitProof).toBe("function");
```

- [ ] **Step 2: Run targeted tests**

Run: `rtk npx vitest run src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`
Expected: PASS

- [ ] **Step 3: Run typecheck for touched files**

Run: `rtk npm run typecheck`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/services/creator/creator-dashboard.service.ts src/services/creator/creator-appwrite.service.ts src/lib/appwrite/functions.ts
git commit -m "test: lock creator proof submit contract"
```
