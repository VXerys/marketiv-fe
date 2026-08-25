# Phase 04 — Tasks

## A. Audit
- [x] Re-read admin submission feature structure.
- [x] Re-read admin Appwrite wrapper.
- [x] Re-read executeAdminFunction error handling.
- [x] Re-read sidebar responsive behavior.
- [x] Confirm Phase 03 Function contracts.

## B. Wiring
- [x] Add function identifiers.
- [x] Add withdrawal DTO types.
- [x] Add queue service.
- [x] Add review mutation service.

## C. UI
- [x] Add `/withdrawals`.
- [x] Add sidebar link.
- [x] List + status filter.
- [x] Mask account in list.
- [x] Detail full transfer data.
- [x] Requested → start processing.
- [x] Processing → success with transfer reference.
- [x] Failure action with reason.
- [x] Confirmation for financial actions.
- [x] Loading/error/empty/mutation states.

## D. Tests
- [x] DTO guard tests.
- [x] queue service success/error.
- [x] transfer reference validation.
- [x] failure reason validation.
- [x] action visibility by status.
- [x] account masking.
- [x] refresh after mutation.
- [x] stale conflict actionable error.

## E. Verification
- [x] admin typecheck.
- [x] admin lint.
- [x] admin tests.
- [x] admin build.
- [x] exact output report.

## Acceptance Gate
Do not continue until admin dapat mengoperasikan manual queue tanpa direct financial DB mutation dari browser.
