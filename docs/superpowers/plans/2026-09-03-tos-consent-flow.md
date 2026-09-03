# T&C Consent and Re-consent Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authoritative T&C status, blocking dashboard consent, and fail-closed preflight before currently guarded Rate Card acceptance and withdrawal mutations.

**Architecture:** Existing `accept-tos` gains read-only `action: "status"` while retaining legacy accept payload. Shared frontend service and provider fetch server version, render global dashboard gate, refresh `SessionUser` after acceptance, and expose fresh financial preflight to guarded actions.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Appwrite Web SDK 25, Appwrite Node SDK 14, Vitest 4, Radix UI.

## Global Constraints

- Backend remains source of truth for current T&C version and financial guards.
- Never update `users` directly from frontend or widen collection permissions.
- Cover only current backend evidence: Creator Rate Card acceptance and eligible Creator/UMKM withdrawal.
- Status failures mean unknown state; financial mutations fail closed.
- Preserve legacy `{ "tos_version": "v3.1" }` acceptance.
- Do not change `create-order` or `request-withdrawal` guards or business logic.
- Reuse approved UMKM v3.1 legal chapters verbatim; report older Creator v3.1/5% conflict.
- Do not deploy production.

---

### Task 1: Extend `accept-tos` with read-only status

**Files:**
- Modify: `00_BACKEND/functions/accept-tos/src/main.js`
- Modify: `00_BACKEND/tests/integration/functions.test.ts`

**Interfaces:**
- Consumes: authenticated request headers and server `CURRENT_TOS_VERSION`.
- Produces: status JSON and backward-compatible accept JSON.

- [ ] **Step 1: Write failing backend tests**

Add absent/current/outdated/missing-timestamp status cases. Assert status never increments `updateCalls`. Add legacy accept, explicit accept, same-version idempotency, stale-version, and unknown-action cases.

```ts
it('returns read-only outdated TOS status', async () => {
  process.env.CURRENT_TOS_VERSION = 'v3.1';
  seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.0', tos_accepted_at: '2026-08-01T00:00:00.000Z' }]);
  const main = (await import('../../functions/accept-tos/src/main.js')).default;
  const res = makeRes();
  await main({
    req: makeReq({ headers: { 'x-appwrite-user-id': 'c1' }, bodyJson: { action: 'status' } }),
    res,
    log: () => {},
    error: () => {},
  });
  expect(res.calls[0]).toMatchObject({ status: 200, body: {
    currentVersion: 'v3.1', acceptedVersion: 'v3.0',
    acceptedAt: '2026-08-01T00:00:00.000Z', needsConsent: true,
  }});
  expect(updateCalls).toHaveLength(0);
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm --prefix 00_BACKEND run test:integration`

Expected: status cases fail with missing `tos_version`.

- [ ] **Step 3: Implement minimal routing**

```js
const action = typeof body.action === "string" ? body.action.trim() : "accept";
if (action !== "status" && action !== "accept") {
  return json(res, { error: "Action tidak didukung." }, 400);
}
const user = await findByUserId(databases, env.databaseId, env.usersCollectionId, userId);
if (!user) return json(res, { error: "Profil pengguna tidak ditemukan." }, 404);
if (action === "status") {
  const acceptedVersion = user.tos_version || null;
  const acceptedAt = user.tos_accepted_at || null;
  return json(res, {
    currentVersion: env.currentTosVersion,
    acceptedVersion,
    acceptedAt,
    needsConsent: acceptedVersion !== env.currentTosVersion || !acceptedAt,
  });
}
```

- [ ] **Step 4: Run backend integration tests**

Run: `npm --prefix 00_BACKEND run test:integration`

Expected: all tests pass; status cases record zero mutations.

- [ ] **Step 5: Commit**

```bash
git add 00_BACKEND/functions/accept-tos/src/main.js 00_BACKEND/tests/integration/functions.test.ts
git commit -m "feat(tos): expose authoritative consent status"
```

### Task 2: Add frontend service and authoritative session fields

**Files:**
- Modify: `src/lib/appwrite/functions.ts`
- Modify: `src/services/auth/session.service.ts`
- Create: `src/services/auth/tos.service.ts`
- Create: `src/services/auth/__tests__/tos.service.test.ts`
- Create: `src/services/auth/__tests__/session-tos.integration.test.ts`

**Interfaces:**
- Produces: `TosStatus`, `TosAcceptResult`, `getTosStatus()`, `acceptCurrentTos()`, `SessionUser.tosVersion`, and `SessionUser.tosAcceptedAt`.

- [ ] **Step 1: Write failing tests**

```ts
it('requests status from accept-tos', async () => {
  mocks.executeFunction.mockResolvedValue({ currentVersion: 'v3.1', acceptedVersion: null, acceptedAt: null, needsConsent: true });
  const result = await getTosStatus();
  expect(mocks.executeFunction).toHaveBeenCalledWith('accept-tos', { action: 'status' });
  expect(result.data?.needsConsent).toBe(true);
});

it('accepts backend-returned version', async () => {
  mocks.executeFunction.mockResolvedValue({ success: true, alreadyAccepted: false, tos_version: 'v3.1' });
  await acceptCurrentTos('v3.1');
  expect(mocks.executeFunction).toHaveBeenCalledWith('accept-tos', { action: 'accept', tos_version: 'v3.1' });
});
```

Session test asserts mappings from `doc.tos_version` and `doc.tos_accepted_at`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/services/auth/__tests__/tos.service.test.ts src/services/auth/__tests__/session-tos.integration.test.ts`

Expected: module and session fields missing.

- [ ] **Step 3: Implement service and session mapping**

```ts
export interface TosStatus {
  currentVersion: string;
  acceptedVersion: string | null;
  acceptedAt: string | null;
  needsConsent: boolean;
}

export async function getTosStatus(): Promise<ServiceResult<TosStatus>> {
  try {
    return ok(await executeFunction<TosStatus>(FUNCTION_IDS.acceptTos, { action: "status" }));
  } catch (error) {
    return failFromError(error, noData<TosStatus>(), "tos.status");
  }
}

export async function acceptCurrentTos(version: string): Promise<ServiceResult<TosAcceptResult>> {
  try {
    return ok(await executeFunction<TosAcceptResult>(FUNCTION_IDS.acceptTos, { action: "accept", tos_version: version }));
  } catch (error) {
    return failFromWriteError(error, noData<TosAcceptResult>(), undefined, "tos.accept");
  }
}
```

Add `acceptTos: "accept-tos"`; map only non-empty session strings. Mock version stays mock-only.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `npm test -- src/services/auth/__tests__/tos.service.test.ts src/services/auth/__tests__/session-tos.integration.test.ts`

Expected: both files pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/appwrite/functions.ts src/services/auth/session.service.ts src/services/auth/tos.service.ts src/services/auth/__tests__/tos.service.test.ts src/services/auth/__tests__/session-tos.integration.test.ts
git commit -m "feat(tos): add frontend consent service"
```

### Task 3: Build dashboard gate and consent dialog

**Files:**
- Create: `src/components/features/legal/TosConsentDialog.tsx`
- Create: `src/components/providers/TosConsentProvider.tsx`
- Modify: `src/components/auth/RoleGuard.tsx`
- Create: `src/components/features/legal/__tests__/tos-consent-flow.integration.test.tsx`

**Interfaces:**
- Consumes: T&C service and `useAuth().refresh`.
- Produces: `TosConsentGate` and `useTosConsent().ensureCurrentConsent()`.

- [ ] **Step 1: Write failing component tests**

Cover new/outdated user dialog, unchecked button, successful accept plus refresh, already-current pass-through, status retry, accept retry, and stale refresh.

```tsx
expect(button('Setujui & Lanjutkan').disabled).toBe(true);
await click(document.querySelector('[role="checkbox"]') as HTMLElement);
await click(button('Setujui & Lanjutkan'));
expect(mocks.acceptCurrentTos).toHaveBeenCalledWith('v3.1');
expect(mocks.refresh).toHaveBeenCalledOnce();
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/components/features/legal/__tests__/tos-consent-flow.integration.test.tsx`

Expected: provider/dialog modules missing.

- [ ] **Step 3: Implement controlled dialog**

```ts
export interface TosConsentDialogProps {
  open: boolean;
  currentVersion: string | null;
  error: string | null;
  submitting: boolean;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  onAccept: () => void;
  onRetryStatus: () => void;
}
```

Use `ResponsiveModal`, `Checkbox`, `/syarat-ketentuan` target `_blank`, no close button, controlled open state, and disabled submit until checked/version-ready/not-submitting.

- [ ] **Step 4: Implement provider and RoleGuard wrapping**

```ts
interface TosConsentContextValue {
  ensureCurrentConsent: () => Promise<boolean>;
}

export function useTosConsent(): TosConsentContextValue {
  const value = useContext(TosConsentContext);
  if (!value) throw new Error("useTosConsent harus dipakai di dalam <TosConsentGate>.");
  return value;
}
```

Initial status loading/error blocks children. Ready status renders children plus non-dismissible dialog. Acceptance refreshes session and verifies both current version and timestamp.

```tsx
return <TosConsentGate>{children}</TosConsentGate>;
```

- [ ] **Step 5: Run component tests**

Run: `npm test -- src/components/features/legal/__tests__/tos-consent-flow.integration.test.tsx`

Expected: all gate scenarios pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/features/legal/TosConsentDialog.tsx src/components/providers/TosConsentProvider.tsx src/components/auth/RoleGuard.tsx src/components/features/legal/__tests__/tos-consent-flow.integration.test.tsx
git commit -m "feat(tos): gate dashboards on explicit consent"
```

### Task 4: Wire financial preflight

**Files:**
- Modify: `src/components/features/creator-dashboard/NegosiasiRoomView.tsx`
- Modify: `src/components/features/creator-dashboard/KeuanganView.tsx`
- Create: `src/components/features/creator-dashboard/__tests__/rate-card-tos-preflight.integration.test.tsx`
- Modify: `src/components/features/creator-dashboard/__tests__/creator-finance-withdrawal.integration.test.tsx`

**Interfaces:**
- Consumes: `ensureCurrentConsent(): Promise<boolean>`.
- Produces: no offer or withdrawal mutation until preflight succeeds.

- [ ] **Step 1: Write failing tests**

```tsx
mocks.ensureCurrentConsent.mockResolvedValue(false);
await click(button('Terima Penawaran'));
expect(mocks.acceptOffer).not.toHaveBeenCalled();

mocks.ensureCurrentConsent.mockResolvedValue(true);
await click(button('Terima Penawaran'));
expect(mocks.acceptOffer).toHaveBeenCalledWith('offer-1');
```

Withdrawal false preflight must keep confirmation intact and skip `requestWithdrawal`; true preflight must retain existing request-key behavior.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/components/features/creator-dashboard/__tests__/rate-card-tos-preflight.integration.test.tsx src/components/features/creator-dashboard/__tests__/creator-finance-withdrawal.integration.test.tsx`

Expected: mutations run without preflight.

- [ ] **Step 3: Add minimal wiring**

```ts
const { ensureCurrentConsent } = useTosConsent();
if (accept && !(await ensureCurrentConsent())) {
  setAnswering(false);
  return;
}
```

Withdrawal performs same check after local validation but before `requestWithdrawal`. Leave mutation services and backend logic unchanged.

- [ ] **Step 4: Run tests and verify GREEN**

Run same focused command. Expected: both suites pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/features/creator-dashboard/NegosiasiRoomView.tsx src/components/features/creator-dashboard/KeuanganView.tsx src/components/features/creator-dashboard/__tests__/rate-card-tos-preflight.integration.test.tsx src/components/features/creator-dashboard/__tests__/creator-finance-withdrawal.integration.test.tsx
git commit -m "fix(tos): preflight guarded financial actions"
```

### Task 5: Publish canonical legal document

**Files:**
- Create: `src/content/terms.ts`
- Modify: `src/app/syarat-ketentuan/page.tsx`
- Modify: `src/app/dashboard/umkm/panduan/page.tsx`
- Modify: `src/app/dashboard/kreator/panduan/page.tsx`
- Create: `src/content/__tests__/terms.test.ts`

**Interfaces:**
- Consumes: exact approved UMKM v3.1 `CHAPTERS_DATA` wording from commit `f2b6b935`.
- Produces: `TERMS_CHAPTERS` shared by public and role pages.

- [ ] **Step 1: Write failing content test**

```ts
it('exports approved v3.1 legal chapters', () => {
  expect(TERMS_CHAPTERS.map((chapter) => chapter.id)).toEqual(['bab-1', 'bab-2', 'bab-3', 'bab-4', 'bab-5']);
  expect(TERMS_CHAPTERS.flatMap((chapter) => chapter.pasalList)).toHaveLength(22);
  expect(JSON.stringify(TERMS_CHAPTERS)).toContain('Biaya Platform Resmi (2%)');
  expect(JSON.stringify(TERMS_CHAPTERS)).not.toContain('Biaya Platform Resmi (5%)');
});
```

- [ ] **Step 2: Run test and verify RED**

Run: `npm test -- src/content/__tests__/terms.test.ts`

Expected: shared module missing.

- [ ] **Step 3: Extract without wording changes**

Move UMKM `ChapterGroup` and `CHAPTERS_DATA` to `src/content/terms.ts`. Import `TERMS_CHAPTERS` in both guides. Keep role-specific rules and FAQs untouched.

- [ ] **Step 4: Render public terms**

Render shared chapters with semantic headings and lists inside existing Navbar/Footer. Label artifact “Versi 3.1 (Agustus 2026)” but do not use that label as runtime consent source.

- [ ] **Step 5: Run content test**

Run: `npm test -- src/content/__tests__/terms.test.ts`

Expected: five chapters and 22 articles match canonical data.

- [ ] **Step 6: Commit**

```bash
git add src/content/terms.ts src/content/__tests__/terms.test.ts src/app/syarat-ketentuan/page.tsx src/app/dashboard/umkm/panduan/page.tsx src/app/dashboard/kreator/panduan/page.tsx
git commit -m "fix(legal): publish canonical T&C document"
```

### Task 6: Review and verification

**Files:**
- Review: all files changed since design-spec commit.

**Interfaces:**
- Produces: verified implementation and deployment/UAT report.

- [ ] **Step 1: Run relevant tests**

```bash
npm --prefix 00_BACKEND run test:integration
npm test -- src/services/auth/__tests__/tos.service.test.ts src/services/auth/__tests__/session-tos.integration.test.ts src/components/features/legal/__tests__/tos-consent-flow.integration.test.tsx src/components/features/creator-dashboard/__tests__/rate-card-tos-preflight.integration.test.tsx src/components/features/creator-dashboard/__tests__/creator-finance-withdrawal.integration.test.tsx src/content/__tests__/terms.test.ts
```

- [ ] **Step 2: Run required project checks**

```bash
npm run typecheck
npm run lint
npm test -- --run
npm run build
git diff --check 108a402^..HEAD
```

- [ ] **Step 3: Audit scope and security**

Confirm no frontend `updateDocument` on `users`, no permission edits, no payment/escrow/settlement/Campaign changes, and unchanged financial guards.

- [ ] **Step 4: Request code review**

Dispatch reviewer against design spec and full diff. Fix Critical/Important findings; rerun affected and full verification.

- [ ] **Step 5: Prepare handoff**

Report diagnosis, architecture, changed files, legal conflict, staging redeploy needs, manual UAT, verification results, and remaining risks. Do not deploy.
