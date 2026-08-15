# P4 — Creator Detail Unclaim Parity

**Trello:** `[BUG-P1] Detail Pekerjaan Aktif tidak punya aksi unclaim`

## Objective

Make active-work detail behavior match the existing list action.

## Inspect first

- `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`
- `src/components/features/creator-dashboard/PekerjaanAktifView.tsx`
- `src/services/creator/creator-dashboard.service.ts`
- `src/services/creator/creator-appwrite.service.ts`
- `src/lib/constants/routes.ts`
- existing `ConfirmDialog` / responsive modal primitives used by Creator UI

## Canonical eligibility

Match existing list behavior:

```ts
canUnclaim = work.status === "claimed" && !hasSubmitted
```

Be stricter only if current model exposes an explicit submission object/status that proves a submission exists.

## Required implementation

1. Add `Batalkan pekerjaan ini` as a secondary/destructive-safe action in detail.
2. Only show it before submission.
3. Use an accessible confirmation dialog.
4. Disable duplicate clicks while request is pending.
5. Call existing `unclaimCampaign(work.id)` facade.
6. Success:
   - toast/feedback;
   - navigate with Next router to `routes.kreatorActiveWorks` (or current canonical equivalent);
   - refresh if needed.
7. Failure:
   - keep current detail;
   - show returned service error;
   - allow retry.
8. Do not locally decrement Campaign quota or delete Appwrite documents from the component.

## States where CTA must be absent

- submitted;
- pending validation;
- approved;
- rejected;
- expired;
- any state with proof URL already present.

## Tests

At minimum:

- claimed/no proof → CTA visible;
- submitted → hidden;
- approved/rejected/expired → hidden;
- confirm cancel → no service call;
- confirm success → one service call + navigation;
- service failure → error + stays on page;
- double submit prevented.

## Constraints

- Campaign only.
- No changes to Rate Card.
- Backend service contract should not be rewritten; it already enforces owner + claimed status.

## Verification

Run targeted Creator tests and standard repository gates.

## Done when

List and detail offer the same safe unclaim capability before proof submission.
