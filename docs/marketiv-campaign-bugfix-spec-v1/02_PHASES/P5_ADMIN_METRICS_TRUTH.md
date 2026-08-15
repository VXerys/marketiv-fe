# P5 — Admin Metric Truthfulness

**Trello:** `[BUG-P1] Admin dashboard menampilkan fallback/static metrics sebagai data nyata`

## Objective

Make Admin dashboard factual in real/staging mode.

## Inspect first

- `src/features/admin/dashboard/fixtures/dashboard.fixtures.ts`
- `src/app/admin/dashboard/page.tsx`
- real Campaign/submission fields and query helpers used by current code
- `src/config/data-source.config.ts`

## Problems to remove

- `activeCampaignsCount: 15` real-mode fallback.
- “Diverifikasi Hari Ini” if the query actually counts all non-pending records.
- `+12% vs Kemarin` without a source.
- `99.8%` accuracy without a source.
- `SLA Validasi < 2 Jam` without measured SLA.
- fixed progress widths that look data-driven.

## Required implementation

### Real mode

- Query real counts only.
- Appwrite failure → explicit dashboard error/degraded state.
- zero records → numeric zero, not fixture.
- if “today” cannot be computed reliably with current indexed/queryable fields, rename the metric to its actual meaning instead of guessing.

### Mock mode

Mock metrics may remain only behind explicit `DATA_SOURCE_CONFIG.useMockData`.

### UI

Prefer 3 truthful cards over 4 fabricated cards.

Acceptable replacements for unsupported metric cards:

- neutral operational guidance;
- no metric card at all;
- `Tidak tersedia` with clear explanation if genuinely useful.

Do not display a target as a measured result. If product wants a target such as “target SLA <2 jam”, label it explicitly as **Target**, not current performance.

## Tests

- real empty → 0/empty, no 15.
- read error → error state, not fake values.
- mock switch → mock data allowed.
- any “today” metric obeys current-day boundary or has corrected label.

## Constraints

- No analytics platform addition.
- No schema migration just to restore decorative metrics.
- No invented P2MW evidence.

## Verification

Targeted metric tests + lint/typecheck/build.

## Done when

Every number on the Admin dashboard can be traced to a real query or is explicitly identified as a non-measured target.
