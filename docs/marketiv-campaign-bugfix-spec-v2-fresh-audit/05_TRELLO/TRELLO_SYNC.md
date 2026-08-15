# Trello Sync — Fresh Audit

Trello Campaign SOT was refreshed to current Admin standalone architecture and `staging` audit.

## Important changes
1. QA #5 is now **PARTIAL**, not simply “fixed”.
   - claim row permission fix exists;
   - claim/unclaim counter authority is still broken/inconsistent.
2. New P0 defect created:
   - `Campaign claim/unclaim counter authority masih split client + Function`.
3. Admin config card expanded to include:
   - Admin Appwrite staging fallback;
   - user-app Admin-origin staging fallback;
   - hardcoded environment/health/identity.
4. Fresh execution order is:
```text
Admin config/test gate
→ Admin auth boundary
→ Admin-only read DTO/summary
→ authoritative review mutation
→ claim/unclaim consistency
→ login mismatch
→ Creator detail Unclaim
→ metrics/copy/UI polish
→ regression
→ Campaign E2E
```

Rate Card remains after Campaign.
