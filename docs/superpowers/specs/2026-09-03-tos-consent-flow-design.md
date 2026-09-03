# T&C Consent and Re-consent Flow Design

## Goal

Provide explicit, reusable T&C consent for authenticated Creator and UMKM users before backend-guarded financial mutations. Preserve `accept-tos`, `create-order`, and `request-withdrawal` as final authorities. Never update `users` directly from frontend.

## Current-state diagnosis

- `users` already stores `tos_version` and `tos_accepted_at`.
- `accept-tos` accepts a version, validates it against server-side `CURRENT_TOS_VERSION`, updates `users`, and is idempotent for an already accepted version.
- `create-order` requires current T&C from Creator before creating an order from an accepted offer.
- `request-withdrawal` requires current T&C from eligible Creator or UMKM users.
- No other current Function contains a T&C guard. Frontend consent wiring must therefore cover Rate Card offer acceptance and withdrawal only; no Campaign, payment, escrow, or settlement expansion.
- `SessionUser` omits both T&C fields, so UI cannot compare authoritative user state.
- Frontend has no `accept-tos` binding, status query, consent boundary, or financial-action preflight.
- `acceptOffer` updates offer to `accepted` immediately. `create-order` can then reject asynchronously, leaving `awaiting_order` stranded.
- Public `/syarat-ketentuan` is a placeholder.
- Two dashboard T&C copies conflict. UMKM copy was explicitly updated as approved v3.1/2% content in commit `f2b6b935`; Creator copy remains older v3.1/5% content from commit `9ca34452`. This conflict must be reported. Canonical legal text for this change is existing UMKM v3.1 chapter data; implementation must reuse it verbatim, not infer clauses from backend behavior.

## Chosen architecture

Use hybrid protection:

1. Dashboard consent boundary presents a blocking, non-dismissible interstitial when authoritative status says consent is missing or outdated.
2. Financial actions run a fresh authoritative preflight immediately before mutation. This protects long-lived browser tabs after server version changes.
3. Backend guards remain unchanged and authoritative.

One shared T&C consent provider serves Creator and UMKM dashboards. It owns status loading, recoverable status errors, consent dialog state, checkbox state, accept submission, session refresh, and financial preflight.

## Backend contract

Extend existing `accept-tos` Function only.

### Status

Request:

```json
{ "action": "status" }
```

Response:

```json
{
  "currentVersion": "v3.1",
  "acceptedVersion": "v3.0",
  "acceptedAt": "2026-08-01T10:00:00.000Z",
  "needsConsent": true
}
```

Rules:

- Requires authenticated Appwrite execution.
- Reads current user once.
- Performs no create, update, or delete operation.
- `acceptedVersion` and `acceptedAt` are nullable.
- `needsConsent` is true unless accepted version equals current version and accepted timestamp exists.
- Server-side `CURRENT_TOS_VERSION`, including its existing `v3.1` fallback, remains sole runtime source.

### Accept

Both payloads remain valid:

```json
{ "tos_version": "v3.1" }
```

```json
{ "action": "accept", "tos_version": "v3.1" }
```

Unknown actions return validation error. Existing idempotent accept behavior remains unchanged.

## Frontend state and service contract

Add `tosVersion?: string` and `tosAcceptedAt?: string` to `SessionUser`, populated from authoritative `users` document by `getSession()`.

Add `acceptTos` to `FUNCTION_IDS`. A shared consent service exposes:

- `getTosStatus(): Promise<ServiceResult<TosStatus>>`
- `acceptCurrentTos(version: string): Promise<ServiceResult<TosAcceptResult>>`

Mock mode returns internally consistent status and accept results without introducing a public production version constant. Mock-only fixture version may be fixed for deterministic local tests.

## Consent provider and UI

Provider responsibilities:

- Fetch status after authenticated session becomes available.
- Distinguish `loading`, `ready`, and `error`; never translate status errors into `needsConsent`.
- Expose `ensureCurrentConsent()` for mutation preflight.
- Force a new status request during each financial preflight.
- Open consent dialog only when successful status response says `needsConsent: true`.
- Fail closed and open a recoverable error state when status cannot be verified.
- Prevent duplicate status or accept submissions.

Dashboard boundary behavior:

- Applies to authenticated Creator and UMKM dashboards after existing role, suspension, and onboarding guards.
- Loading shows a neutral verification state.
- Status network/server failure shows explicit error and retry; it does not claim user has or has not consented.
- Missing/outdated consent shows blocking dialog.
- Current consent renders dashboard normally.

Consent dialog behavior:

- Shows backend-returned current version.
- Links to `/syarat-ketentuan` in a new tab so blocking dialog cannot hide document.
- Requires explicit checkbox.
- `Setujui & Lanjutkan` stays disabled until checked and while submitting.
- Calls `accept-tos` with version returned by status.
- On success, calls `AuthProvider.refresh()` and checks refreshed `tosVersion` plus `tosAcceptedAt` before closing.
- Function or refresh errors remain visible with retry available.

## Financial-action preflight

### Rate Card

Creator `Terima Offer` calls `ensureCurrentConsent()` before `acceptOffer`.

- Verified current: continue to existing accept behavior.
- Missing/outdated: open consent dialog; do not call `acceptOffer`. User may click `Terima Offer` again after consent.
- Status failure: show recoverable error; do not call `acceptOffer`.
- Backend `create-order` guard stays unchanged.

This prevents `pending` to `accepted` transition before consent verification.

### Withdrawal

Final confirmation calls same preflight before `requestWithdrawal`.

- Failed/unverified consent leaves withdrawal confirmation intact.
- No request key, balance, ledger, payout, or withdrawal business rule changes.
- Backend `request-withdrawal` guard stays unchanged.

## Legal document handling

Extract existing approved UMKM v3.1 chapter data into shared legal content without wording changes. Use that shared data in:

- public `/syarat-ketentuan` page;
- UMKM guide T&C tab;
- Creator guide T&C tab.

Role-specific rules and FAQ content remain role-specific. Only shared T&C chapters are consolidated. Existing Creator 5% copy conflict becomes resolved by consuming already-approved canonical v3.1 content, not by inventing new clauses.

Version displayed by consent UI comes from backend status response. Legal page does not define runtime current version.

## Error and concurrency behavior

- Status error: recoverable UI, retry, financial actions blocked.
- Accept error: dialog remains open, checkbox state retained, retry allowed.
- Session refresh error or stale refreshed state: dialog remains open and reports verification failure.
- Same-version acceptance: backend returns success without mutation; frontend still refreshes and verifies session.
- Double click: disabled while request runs.
- Version changes between status and accept: backend rejects stale version; UI reloads status before retry.

## Tests

Backend Function tests:

- status is read-only;
- never accepted state;
- current accepted state;
- outdated state;
- accepted version without timestamp still needs consent;
- existing payload acceptance updates version and timestamp;
- explicit accept action works;
- same-version acceptance remains idempotent;
- stale version rejected;
- unknown action rejected.

Frontend service/session tests:

- `SessionUser` receives T&C fields;
- status and accept use `accept-tos` contract;
- Function errors map to recoverable `ServiceResult`.

Frontend component tests:

- new user sees consent UI;
- unchecked submit disabled;
- successful acceptance refreshes authoritative user state and closes dialog;
- same-version success is safe;
- status, Function, and refresh errors show retry;
- `acceptOffer` never runs before successful preflight;
- `acceptOffer` works after verified consent;
- `requestWithdrawal` never runs before successful preflight;
- public legal page renders canonical chapters.

## Deployment

- `accept-tos` code changes require staging Function redeploy.
- Frontend changes require staging frontend redeploy.
- No production deployment occurs in this task.
- No schema, collection permission, payment, escrow, settlement, Campaign, or withdrawal business-logic deployment is required.
