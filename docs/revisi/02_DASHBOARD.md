# 02 — Dashboard
Route: `/dashboard/umkm`

Findings: `UMKM-SET-01`, `UMKM-SUP-01`, `UMKM-DATA-03`.

Source:
- `UmkmOverviewClient.tsx`
- `DashboardSidebar.tsx`
- `get-umkm-dashboard-summary/src/main.js`

Do:
- verification badge from backend state;
- real support CTA;
- explicit aggregate truncation.

Do not: redesign overview/KPI semantics.

Verify: empty/error/retry, verified/unverified, support CTA, >5000 behavior.
