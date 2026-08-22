# Phase 04 — Tasks

## A. Audit
- [ ] Re-read admin submission feature structure.
- [ ] Re-read admin Appwrite wrapper.
- [ ] Re-read executeAdminFunction error handling.
- [ ] Re-read sidebar responsive behavior.
- [ ] Confirm Phase 03 Function contracts.

## B. Wiring
- [ ] Add function identifiers.
- [ ] Add withdrawal DTO types.
- [ ] Add queue service.
- [ ] Add review mutation service.

## C. UI
- [ ] Add `/withdrawals`.
- [ ] Add sidebar link.
- [ ] List + status filter.
- [ ] Mask account in list.
- [ ] Detail full transfer data.
- [ ] Requested → start processing.
- [ ] Processing → success with transfer reference.
- [ ] Failure action with reason.
- [ ] Confirmation for financial actions.
- [ ] Loading/error/empty/mutation states.

## D. Tests
- [ ] DTO guard tests.
- [ ] queue service success/error.
- [ ] transfer reference validation.
- [ ] failure reason validation.
- [ ] action visibility by status.
- [ ] account masking.
- [ ] refresh after mutation.
- [ ] stale conflict actionable error.

## E. Verification
- [ ] admin typecheck.
- [ ] admin lint.
- [ ] admin tests.
- [ ] admin build.
- [ ] exact output report.

## Acceptance Gate
Do not continue until admin dapat mengoperasikan manual queue tanpa direct financial DB mutation dari browser.
