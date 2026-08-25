# Trello Status Proposal

Codex must prepare proposal, not automatically mutate Trello.

## Current candidate cards

| Card | Expected initial treatment |
|---|---|
| Admin verified views absurd | FIX |
| Rate Card Collab Post settlement | FIX or explicit BLOCKED |
| Fee disclosure drift | RE-AUDIT / FIX |
| SVG typecheck | VERIFY |
| Rate Card payment duplicate | VERIFY Spec 01 |
| Rate Card room sync | VERIFY Spec 02 |
| Rate Card package context | VERIFY Spec 03 |
| Withdrawal UI | OUT OF SCOPE |

## UAT cards

Do not move UAT to Done based only on unit/build.

Use:
- runtime verified;
- automated verified where scenario genuinely covered;
- runtime pending.

## Suggested final output

```text
Card:
Previous Trello state:
Current classification:
Evidence:
Code changed:
Automated verification:
Runtime verification:
Recommended Trello list/status:
```

## Do not mutate

Trello changes require explicit user instruction after review.
