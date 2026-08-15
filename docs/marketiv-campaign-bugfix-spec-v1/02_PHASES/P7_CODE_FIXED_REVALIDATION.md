# P7 — Revalidate Reported Code Fixes #2 / #4 / #5

## Objective

Confirm the fixes reported by backend/code are still intact after P1–P6. Do not proactively rewrite working code.

## A. QA #2 — Stop active Campaign

Inspect:

- `src/components/features/umkm-dashboard/campaign/detail/CampaignDetailHeader.tsx`
- the status mutation handler/service used by Campaign detail
- existing related tests.

Expected:

- `Hentikan Kampanye` only appears for `active`;
- invalid/non-active state does not expose stop action;
- backend error is surfaced;
- success refreshes server state.

Patch only if regression is reproduced.

## B. QA #4 — Submit proof

Inspect/run:

- `src/services/creator/__tests__/creator-appwrite.service.submit-proof.test.ts`
- `src/services/creator/creator-appwrite.service.ts`
- `src/lib/appwrite/functions.ts`
- `submit-campaign-proof` Function registration/config if needed.

Expected:

- valid owned claim → trusted Function;
- no direct `createDocument/updateDocument` submission write from browser;
- backend error remains visible;
- no fabricated success.

## C. QA #5 — Claim 401 / permissions

Inspect:

- current Creator claim path;
- current backend claim service/function permission creation;
- existing permission/backfill logic.

Expected:

- new claim has the permissions required by the current flow, including pre-submit unclaim;
- owner/status guards remain intact;
- duplicate/quota checks preserved.

Do not broaden collection-level permissions.

## Tests

Run targeted tests first. Add missing regression tests only where local deterministic coverage is possible.

## Runtime note

This phase can conclude **CODE VERIFIED** without claiming **STAGING E2E PASS**.

If live staging credentials/environment are unavailable, explicitly leave runtime revalidation for P8/UAT.

## Done when

P1–P6 did not regress #2/#4/#5 and any reproduced code regression is fixed with tests.
