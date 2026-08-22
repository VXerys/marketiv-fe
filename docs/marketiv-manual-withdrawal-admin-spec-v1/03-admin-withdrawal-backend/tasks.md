# Phase 03 — Tasks

## A. Audit
- [ ] Re-read admin auth patterns.
- [ ] Re-read withdrawal schema.
- [ ] Re-read transaction/reversal code.
- [ ] Identify canonical Appwrite generator.
- [ ] Inspect function registry/scopes conventions.
- [ ] Inspect Function test patterns.

## B. Schema
- [ ] Add `processing_at`.
- [ ] Add `processed_by`.
- [ ] Add `transfer_reference`.
- [ ] Add `admin_note`.
- [ ] Add status index if absent.
- [ ] Keep `iris_reference`.
- [ ] Regenerate Appwrite config.

## C. Admin Queue Function
- [ ] active-admin authorization.
- [ ] status filter validation.
- [ ] pagination/limit current conventions.
- [ ] operational DTO.
- [ ] no sensitive account logging.

## D. Review Function
- [ ] `start_processing`.
- [ ] `mark_succeeded`.
- [ ] `fail`.
- [ ] transition rules.
- [ ] transfer reference required on success.
- [ ] failure reason required.
- [ ] atomic idempotent reversal.
- [ ] update primary transaction.
- [ ] create reversal ledger.
- [ ] notification + processor audit.

## E. Registry
- [ ] generator entries.
- [ ] function scopes.
- [ ] generate config.
- [ ] verify inventory consistency.

## F. Tests
- [ ] non-admin read/mutation 403.
- [ ] requested → processing.
- [ ] double start handled safely.
- [ ] processing → succeeded.
- [ ] success without reference rejected.
- [ ] requested direct success rejected.
- [ ] requested fail + reversal.
- [ ] processing fail + reversal.
- [ ] repeated failure no double-credit.
- [ ] repeated success no duplicate mutation.
- [ ] terminal transition rejected.
- [ ] transaction status updated.

## Acceptance Gate
Do not start admin UI until Functions, DTO, schema, dan transition contract stabil dan tests pass.
