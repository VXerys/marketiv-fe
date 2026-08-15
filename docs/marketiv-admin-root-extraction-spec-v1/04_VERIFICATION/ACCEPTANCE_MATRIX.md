# Acceptance Matrix

| ID | Acceptance |
|---|---|
| AC-01 | `admin/` exists as standalone Next.js app |
| AC-02 | `admin/package.json` owns all Admin runtime/build dependencies |
| AC-03 | Admin `@/*` resolves to `admin/src/*` |
| AC-04 | no Admin source import reaches `../src` |
| AC-05 | `/` redirects to `/dashboard` inside Admin |
| AC-06 | `/dashboard` works |
| AC-07 | `/submissions` works |
| AC-08 | Admin internal navigation has no `/admin` prefix |
| AC-09 | main `src/app/admin` removed after verification |
| AC-10 | main Admin-owned component/feature/lib paths removed when unused |
| AC-11 | root user app still builds |
| AC-12 | standalone Admin app builds |
| AC-13 | user-app Admin role destination uses Admin app origin, not local `/admin` |
| AC-14 | staging Admin uses Appwrite Staging |
| AC-15 | production Admin uses Appwrite Production |
| AC-16 | no duplicate domain collections introduced |
| AC-17 | no duplicate Function introduced solely for subdomain separation |
| AC-18 | no server secret exposed to Admin browser |
| AC-19 | Admin UI visual structure remains equivalent |
| AC-20 | known behavior defects are explicitly carried forward to bugfix phase |
