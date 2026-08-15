# Requirements — Fresh Campaign/Admin Bugfix v2

## R1 Admin configuration
- Admin SHALL require explicit Appwrite public endpoint/project/database configuration.
- Missing required config SHALL fail closed/actionably, not choose staging.
- User app Admin destination SHALL not silently default production traffic to staging.
- No server/API key SHALL exist in public browser env.

## R2 Admin test gate
- Standalone `admin/` SHALL declare its own test script/tooling.
- Tests SHALL run independently of root package dependencies.
- Existing tests that bless local false-success SHALL be rewritten or explicitly deferred until P4.

## R3 Admin authorization
- Anonymous, UMKM, Creator, and suspended Admin SHALL not load protected Admin data.
- Active Admin SHALL be allowed.
- Auth/network failure SHALL fail closed.
- Synthetic Admin fallback SHALL be removed.
- Protected reads SHALL occur only after an effective auth boundary.
- Logout SHALL invalidate Appwrite session and redirect safely.

## R4 Secure Admin reads
- Admin SHALL NOT require broad browser read access to cross-user submissions.
- Submission queue SHALL come from authenticated Admin-only backend read Function/DTO.
- Dashboard summary SHALL use equivalent secure backend read path.
- Function SHALL validate user role/status.
- Real empty SHALL be empty; real failure SHALL be an error, never fixture fallback.
- Read Functions SHALL be read-only/minimal DTO.

## R5 Authoritative review
- Approve/reject SHALL use trusted `review-submission`.
- 401/403/409/5xx SHALL propagate.
- Function failure SHALL NOT mutate local success state.
- Browser SHALL NOT directly update final submission fields.
- Success SHALL be followed by authoritative refresh.
- Refresh failure after successful mutation SHALL be reported as refresh failure, not mutation failure.
- Client `adminId` SHALL NOT be authorization identity.

## R6 Claim/unclaim consistency
- Browser claim SHALL NOT increment `totalClaims` if server event owns it.
- One effective claim SHALL increment once.
- Unclaim SHALL be a trusted backend operation with owner/status validation.
- Counter failure SHALL NOT be silently swallowed.
- Expired reclaim SHALL match backend rule.
- No broad permission changes.

## R7 Login portal mismatch
- Creator via UMKM portal and UMKM via Creator portal SHALL receive explicit feedback.
- Wrong-role auth success SHALL not bounce/loop.
- Correct-role login remains normal.
- Admin login remains possible.
- `next` SHALL be role-compatible and safe.

## R8 Creator detail Unclaim
- Show only for `claimed` and unsubmitted work.
- Hide for submitted/approved/rejected/expired.
- Confirmation/loading/error/success SHALL be explicit.
- Use existing facade backed by trusted P5 operation.
- Success SHALL remove stale detail state.

## R9 Truthful UI
- No real-runtime fake 15/12 counts.
- “today” labels SHALL be date-scoped or renamed.
- Unsupported growth/accuracy/SLA SHALL be removed or explicitly labeled target.
- Hardcoded health/identity fixtures SHALL not look live.
- Reject copy SHALL identify Marketiv/Admin, not UMKM.
- UMKM submission UI remains observer-only.
- Changed UI SHALL work at 375px.

## R10 Verification
- Revalidate stop Campaign, submit proof, claim permission/counter, Admin read/review, Creator outcome, UMKM observer state.
- Do not claim E2E PASS without runtime evidence.

## R11 Scope
- No Rate Card implementation/refactor.
