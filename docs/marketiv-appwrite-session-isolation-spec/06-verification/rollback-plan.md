# Rollback Plan

## Trigger rollback when

- Admin cannot connect through `api-admin-staging.marketiv.id`;
- TLS/custom domain is invalid;
- Appwrite origin checks fail;
- Admin authentication regresses;
- session isolation does not work;
- unexpected Google OAuth regression appears.

## Rollback sequence

1. Do not delete user data.
2. Revert only repository changes from this task if code caused regression.
3. Restore Admin staging `NEXT_PUBLIC_APPWRITE_ENDPOINT` to its exact previous value recorded in Task 01.
4. Redeploy Admin.
5. Re-run basic Admin auth.
6. Keep the newly created DNS/custom domain only if harmless; otherwise remove it through the same controlled Appwrite/DNS process.
7. Do not alter `api-staging.marketiv.id` or Google OAuth unless those were actually changed.

## Required rollback record

```text
Rollback reason:
Previous Admin endpoint:
Restored endpoint:
Commit reverted:
Deployment ID/date:
Admin login result:
Main login result:
Remaining issue:
```

Never solve rollback by deleting Auth users, sessions globally, database data, or the staging Appwrite project.
