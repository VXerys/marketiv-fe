# Completion Report Template

## 1. Diagnosis confirmed

```text
Main deployed Appwrite endpoint:
Admin deployed Appwrite endpoint before:
Admin deployed Appwrite endpoint after:
Same staging project ID confirmed: YES/NO
Browser storage collision before change:
```

## 2. Implementation summary

Explain only what was actually changed.

## 3. Changed files

| File | Change | Reason |
|---|---|---|
| | | |

If no code changes were needed, explicitly state that the fix was infrastructure/environment-only.

## 4. Manual infrastructure changes

### Appwrite
```text
Custom domain added:
Verification:
TLS:
Web platforms/allowed origins:
```

### DNS
```text
Record hostname:
Record type:
Target:
Status:
```

Do not expose secret values.

### Site environment
```text
Main NEXT_PUBLIC_APPWRITE_ENDPOINT:
Admin NEXT_PUBLIC_APPWRITE_ENDPOINT:
```

## 5. Google OAuth

```text
Google OAuth enabled on staging: YES/NO
Main API hostname changed: YES/NO
Appwrite callback verified: YES/NO/N/A
Google Authorized Redirect URI verified: YES/NO/N/A
Google OAuth config modified: YES/NO
Reason:
```

Expected for approved architecture:
`Google OAuth config modified: NO` if `api-staging.marketiv.id` was already the main endpoint.

## 6. Verification results

### Main

| Command | Result |
|---|---|
| `npm run typecheck` | |
| `npm run lint` | |
| `npm test -- --run` | |
| `npm run build` | |

### Admin

| Command | Result |
|---|---|
| `npm run typecheck` | |
| `npm run lint` | |
| `npm test -- --run` | |
| `npm run build` | |

## 7. Browser regression matrix

| Scenario | Result | Notes |
|---|---|---|
| Main then Admin login | |
| Admin then Main login | |
| refresh both | |
| Main logout only | |
| Admin logout only | |
| invalid Admin login | |
| non-Admin rejected by Admin | |
| Google main + Admin, if enabled | |

## 8. Acceptance criteria

List each AC from `05-acceptance/acceptance-criteria.md` as PASS/FAIL/BLOCKED.

## 9. Remaining risks/blockers

Do not hide incomplete manual configuration or untested deployed behavior.

## 10. Git status

```text
Branch:
Commit(s):
Uncommitted changes:
```
