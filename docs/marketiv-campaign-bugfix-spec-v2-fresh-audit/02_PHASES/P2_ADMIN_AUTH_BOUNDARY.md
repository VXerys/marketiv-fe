# P2 — Standalone Admin Auth/Session Boundary

## Trello
`[SEC-P0] Admin routes belum punya guard role yang terbukti`

## Inspect
```text
admin/src/app/layout.tsx
admin/src/app/dashboard/page.tsx
admin/src/app/submissions/page.tsx
admin/src/lib/admin/auth.ts
admin/src/lib/admin/appwrite.ts
admin/src/components/admin/DashboardLayoutShell.tsx
admin/src/components/admin/AdminSidebar.tsx
admin/src/components/admin/AdminHeader.tsx
```

## Implement
1. Remove synthetic active-Admin fallback.
2. Add centralized Admin auth state/gate using current Appwrite session.
3. Anonymous → safe user-app login destination; no protected read first.
4. UMKM/Creator → deny.
5. suspended Admin → deny.
6. active Admin → allow.
7. Appwrite/session errors → fail closed.
8. Remove protected metric fetch from root layout.
9. Move protected page reads behind effective authorization.
10. Wire real session identity into shell.
11. Wire logout to Appwrite session deletion + safe redirect.

Do not use browser server/API keys.
Do not solve cross-user data access by widening collection permission.

## Verify
Auth matrix tests + Admin test/lint/typecheck/build.

STOP.
