# 09 — Settings
Route: `/dashboard/umkm/pengaturan`

Findings: `UMKM-SET-01`, `UMKM-SET-02`, `UMKM-FILE-01`, `UMKM-PRIV-01`, `UMKM-SUP-01`.

Source:
- `PengaturanClient.tsx`
- `DashboardSidebar.tsx`
- `profile.schema.ts`
- `storage.ts`
- `appwrite.config.json`

Do:
- real verification state;
- hydrate phone;
- raster-only logo for beta or sanitize SVG;
- private exact address;
- real support CTA.

Do not: build notification-preference backend in this batch.

Verify: own/other profile, unauthenticated read, verified state, phone, file policy.
