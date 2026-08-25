# Requirements — P0 Admin Verified Views Validation

## Problem

Admin submission review currently allows a manually verified view count to become final financial authority.

The current visible server check accepts approved views when they are:
- integer;
- non-negative.

That is insufficient for malformed/unsafe/absurd numeric input.

The reward may have additional caps, but final locked views themselves are still business and financial evidence.

## Objective

Create one canonical verified-views validation policy enforced server-side and mirrored in Admin UI.

## Functional requirements

### R1 Server authority

`review-submission` is final enforcement.

Client validation is UX only.

No direct browser mutation may bypass it.

### R2 Reject objectively invalid values

At minimum reject:

- null/undefined when approval requires views;
- negative;
- decimal;
- NaN;
- Infinity;
- unsafe integer;
- overflow outside storage/runtime-safe representation;
- malformed numeric string when Function expects number;
- scientific notation in UI if UI input policy is plain digit count;
- mixed text;
- whitespace-only;
- signs/format inconsistent with allowed UX.

### R3 Canonical maximum policy

Do not invent maximum views.

Search current:
- Campaign business rule;
- current T&C;
- schema max;
- admin review docs;
- observation-window policy.

If a maximum is clearly defined:
- centralize it;
- enforce server-side;
- mirror UI;
- test boundary.

If no business maximum exists:
- implement safe integer/storage constraints;
- document:
  `maximum business plausibility policy not defined`;
- classify that portion `BLOCKED_BY_BUSINESS_RULE`.

### R4 Confirmation integrity

Before Admin confirms approval:
- UI displays exact final parsed view count;
- no silent coercion;
- server response error is surfaced;
- no success modal on reject.

### R5 Observation window preserved

Existing 72h/current observation rule must remain untouched unless current source says otherwise.

### R6 Reward formula untouched

Do not change:
- reward formula;
- remaining budget protection;
- Admin authority;
- Campaign claim/submission ownership.

### R7 Rejection flow unaffected

Rejecting a submission must not require verified views.

## Security requirements

- only authorized Admin can finalize;
- server validates body shape;
- no client-only max;
- no arbitrary HTML `max` as sole control.

## Backward compatibility

Existing already-finalized submissions are not rewritten.

## Tests

Cover:
- zero if zero is allowed by current policy;
- one;
- normal value;
- boundary max if policy exists;
- max+1;
- negative;
- decimal;
- unsafe integer;
- huge value;
- malformed string;
- scientific notation UI;
- pending-only review rule;
- non-admin denial.
