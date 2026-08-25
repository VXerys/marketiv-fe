# Requirements — Campaign UI/UX Correctness Polish

Lower priority.

Only work after P0/P1 correctness and UAT blockers are stable.

## Scope UMKM

- campaign list/detail hierarchy;
- correct status badges;
- lifecycle CTA only for valid state;
- submission area observer/read-only;
- loading/empty/error/not-found;
- backend errors actionable;
- no false success.

## Scope Creator

- Job Pool/detail parity;
- active work list/detail parity;
- unclaim only when eligible;
- submit proof form states;
- waiting Admin review copy;
- approved/rejected/expired copy.

## Constraints

- preserve Campaign zero-chat;
- use existing design tokens;
- no large redesign;
- no dummy operational numbers;
- 375px mobile to desktop;
- no overflow;
- no financial behavior changes;
- no withdrawal.

## Defer rule

If time is tight:
defer visual polish rather than leaving P0 or tests incomplete.
