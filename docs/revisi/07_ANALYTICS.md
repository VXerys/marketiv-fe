# 07 — Analytics
Route: `/dashboard/umkm/analitik`

Findings: `UMKM-DATA-02`, `UMKM-DATA-03`.

Source: `AnalitikClient.tsx`, `get-umkm-dashboard-summary`.

Do now:
- section error for partial fetch failure;
- explicit truncation.

Do not build now:
- fake timeseries/trend;
- client-side large analytics joins.

Verify: no data, partial 500, mixed metrics, >5000 behavior.
