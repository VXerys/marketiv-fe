# Completion Report — Appwrite Session Isolation (Staging)

**Prepared:** 2026-08-29  
**Branch:** `staging`  
**Implementation commit:** `d15c177`  
**Scope:** `staging.marketiv.id` and `admin-staging.marketiv.id`

## 1. Diagnosis confirmed

```text
Main deployed Appwrite endpoint: https://api-staging.marketiv.id/v1
Admin deployed Appwrite endpoint before: https://api-staging.marketiv.id/v1
Admin deployed Appwrite endpoint after: https://api-admin-staging.marketiv.id/v1
Same staging project ID confirmed: YES
Browser storage collision before change: Reported; shared endpoint confirmed by deployed bundle audit
```

Manual staging evidence confirms the approved architecture isolates Main and
Admin browser sessions while retaining the shared staging backend.

## 2. Implementation summary

- Kept the same Appwrite staging project and database.
- Kept Main on `https://api-staging.marketiv.id/v1`.
- Configured Admin deployment to use `https://api-admin-staging.marketiv.id/v1`.
- Preserved environment-driven Appwrite clients in both applications.
- Preserved fail-closed Admin authorization.
- Left Google OAuth code/config unchanged because the Main API hostname did not change.
- Added deployment endpoint guidance to root and Admin `.env.example` files.

No auth provider, SSR auth, user, data, Function, bucket, or production migration
was performed.

## 3. Changed files

| File | Change | Reason |
|---|---|---|
| `.env.example` | Documented Main staging Appwrite endpoint and shared-project contract. | Prevent Main/Admin endpoint confusion. |
| `admin/.env.example` | Documented isolated Admin staging Appwrite endpoint. | Make required deployment boundary explicit. |
| `docs/marketiv-appwrite-session-isolation-spec/**` | Added diagnosis, implementation, verification, rollback, and handoff material. | Preserve execution contract and evidence. |

No production authentication code change was required.

## 4. Manual infrastructure changes

### Appwrite

```text
Custom domain added: api-admin-staging.marketiv.id
Verification: PASS — successful browser Appwrite session requests reported
TLS: PASS — successful HTTPS browser session requests reported
Web platforms/allowed origins: PASS — both deployed applications authenticated without reported origin errors
```

### DNS

```text
Record hostname: api-admin-staging.marketiv.id
Record type: Not supplied
Target: Not supplied
Status: PASS — hostname served successful Appwrite session requests
```

### Site environment

```text
Main NEXT_PUBLIC_APPWRITE_ENDPOINT: https://api-staging.marketiv.id/v1
Admin NEXT_PUBLIC_APPWRITE_ENDPOINT: https://api-admin-staging.marketiv.id/v1
```

## 5. Google OAuth

```text
Google OAuth enabled on staging: YES
Main API hostname changed: NO
Appwrite callback verified: BLOCKED — evidence not supplied
Google Authorized Redirect URI verified: BLOCKED — evidence not supplied
Google OAuth config modified: NO
Reason: Main API endpoint remained https://api-staging.marketiv.id/v1
```

## 6. Verification results

### Main

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 errors, 50 pre-existing warnings |
| `npm test -- --run` | PASS — 140/140 tests |
| `npm run build` | PASS |

### Admin

| Command | Result |
|---|---|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — 0 errors, 6 pre-existing warnings |
| `npm test -- --run` | PASS — 77/77 tests |
| `npm run build` | PASS — workspace-root warning only |

Focused Admin auth/config verification: 16/16 tests passed, covering anonymous,
non-Admin, suspended Admin, active Admin, invalid credentials, rejected-session
cleanup, and logout behavior.

## 7. Browser regression matrix

| Scenario | Result | Notes |
|---|---|---|
| Main then Admin login | PASS | Both remained authenticated. |
| Admin then Main login | PASS | Both remained authenticated. |
| Refresh both | PASS | Both sessions persisted. |
| Main logout only | PASS | Admin remained authenticated. |
| Admin logout only | PASS | Main remained authenticated. |
| Appwrite session cookie on requests | PASS | Cookie observed on deployed browser requests. |
| Main API origin | PASS | `https://api-staging.marketiv.id/v1` |
| Admin API origin | PASS | `https://api-admin-staging.marketiv.id/v1` |
| Invalid Admin login while Main logged in | BLOCKED | Deployed evidence not supplied. |
| Non-Admin rejected while Main logged in | BLOCKED | Deployed evidence not supplied; unit authorization passes. |
| Suspended Admin rejection | BLOCKED | Safe deployed fixture/evidence not supplied; unit authorization passes. |
| Google Main plus Admin | BLOCKED | Deployed evidence not supplied. |

## 8. Acceptance criteria

| Criterion | Status |
|---|---|
| AC-01 — Same backend project | PASS |
| AC-02 — Separate Appwrite API origins | PASS |
| AC-03 — Simultaneous login | PASS |
| AC-04 — Refresh persistence | PASS |
| AC-05 — Independent Main logout | PASS |
| AC-06 — Independent Admin logout | PASS |
| AC-07 — Invalid Admin attempt isolation | BLOCKED |
| AC-08 — Admin authorization preserved | BLOCKED — unit PASS; deployed evidence missing |
| AC-09 — No data migration | PASS |
| AC-10 — Google OAuth preserved | BLOCKED — config unchanged; deployed verification missing |
| AC-11 — No secrets | PASS |
| AC-12 — Production untouched | PASS |
| AC-13 — Verification green | PASS |
| AC-14 — Browser storage proof | PASS |

## 9. Remaining risks/blockers

- Execute deployed invalid-password isolation while Main is authenticated.
- Execute deployed UMKM/Creator rejection on Admin while Main is authenticated.
- Execute suspended-Admin rejection if a safe staging fixture exists.
- Verify Appwrite-provided Google callback against Google Cloud Authorized Redirect URI.
- Execute Google Main plus Admin coexistence because Google OAuth is enabled on staging.

Do not modify production or choose another auth architecture for these checks.

## 10. Git status

```text
Branch: staging
Implementation commit: d15c177 docs(auth): document session isolation
Report/acceptance update: uncommitted at report generation time
```

## Final status

Core session-isolation objective is **PASS on staging**: simultaneous login,
refresh persistence, independent logout, cookie transmission, and separate API
origins are verified.

Full specification is **not yet complete** because required deployed evidence for
AC-07, AC-08, and AC-10 has not been supplied.
