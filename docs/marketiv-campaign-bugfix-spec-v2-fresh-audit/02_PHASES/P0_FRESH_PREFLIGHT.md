# P0 — Fresh Preflight & Drift Audit

## Goal
Read-only revalidation against current checked-out `staging`.

## Commands
```bash
git status --short
git branch --show-current
git log -1 --oneline
```

Never reset/stash/discard.

## Reconfirm
1. Admin config staging fallback.
2. Synthetic Admin fallback.
3. Protected Admin reads before auth.
4. Admin review false-success/direct write.
5. Secure Admin read Functions absent/present.
6. Browser claim increments `totalClaims`.
7. `campaign-claimed` also increments.
8. Browser unclaim delete/decrement.
9. expired reclaim drift.
10. login role mismatch.
11. detail Unclaim missing.
12. stop Campaign / submit proof code-fixed paths.

## Output
Return:
```text
finding | OPEN/FIXED/CHANGED/BLOCKED | current files | phase impact
```

No implementation. STOP.
