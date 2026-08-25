# Requirements — P1 Fee Disclosure Consistency

## Problem

Financial fee copy can drift from calculation.

Historical Trello finding referenced 15%/10% copy while canonical implementation uses current platform fee configuration/snapshots.

Current code appears partially fixed but still has literal percentage prose.

## Objective

Ensure all active financial disclosure uses canonical current fee semantics without changing correct financial math.

## Domain semantics to preserve

Campaign:
- buyer-side fee where current implementation says so.

Rate Card:
- seller-side fee deducted from creator settlement where current implementation says so.

Historical transaction:
- use transaction/escrow fee snapshot if available.

## Requirements

- remove stale 15%/10%;
- avoid hardcoded `2%` where configuration may change;
- derive display from canonical constant/config or immutable transaction snapshot;
- invoice/export must match ledger;
- mocks/fixtures should not teach incorrect percentages;
- T&C code references must match active canonical agreement, but do not casually rewrite legal text without current source;
- do not change financial formula merely to make copy match.

## Tests

- fee label derives from config;
- Rate Card buyer pays exact deal;
- creator net payout matches snapshot;
- Campaign buyer total if applicable;
- changed config test does not require copy edit;
- historical snapshot remains stable.
