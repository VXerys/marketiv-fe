# P7 — Creator Active Work Detail Unclaim

## Dependency
P5 must be complete.

## Inspect
```text
src/components/features/creator-dashboard/ActiveWorkDetailView.tsx
src/components/features/creator-dashboard/PekerjaanAktifView.tsx
src/services/creator/creator-dashboard.service.ts
src/lib/constants/routes.ts
```

## Eligibility
```text
work.status === "claimed"
AND no submitted content/proof
```

## Implement
- secondary/destructive-safe `Batalkan pekerjaan ini`;
- accessible confirmation;
- pending disables repeated request;
- call facade only;
- success toast;
- navigate/refresh to valid Creator Campaign surface;
- failure keeps detail and shows actionable error.

Hide for submitted/pending/approved/rejected/expired/any proof URL.

## Tests
visibility, cancel, success, failure, duplicate-click prevention.

## Verify
Targeted tests + root lint/typecheck/build.

STOP.
