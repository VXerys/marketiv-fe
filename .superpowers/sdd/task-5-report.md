# Task 5 — Canonical legal document

## Delivered

- Extracted approved UMKM v3.1 `CHAPTERS_DATA` from commit `f2b6b935` into `src/content/terms.ts` as `TERMS_CHAPTERS`.
- Replaced local legal chapter data/types in UMKM and Kreator Panduan pages with that shared import. Role rules and FAQs unchanged.
- Published public `/syarat-ketentuan` as semantic chapter, article, and list content inside existing Navbar/Footer.
- Added `src/content` to Vitest discovery and content regression tests for structure, fee/escrow clauses, and full-document SHA-256 identity.

## TDD evidence

- RED: `npm test -- src/content/__tests__/terms.test.ts` failed with `Cannot find module '../terms'` after adding source-content test discovery.
- GREEN: same command passes 4 tests.
- Canonical equivalence check: extracted `TERMS_CHAPTERS` serialized identically to `f2b6b935:src/app/dashboard/umkm/panduan/page.tsx`.

## Verification

- `npm test -- src/content/__tests__/terms.test.ts` — 4 passed.
- `npm run typecheck` — passed.
- `npm exec eslint -- src/content/terms.ts src/content/__tests__/terms.test.ts src/app/syarat-ketentuan/page.tsx src/app/dashboard/umkm/panduan/page.tsx src/app/dashboard/kreator/panduan/page.tsx` — passed.
- `git diff --check` — passed.
