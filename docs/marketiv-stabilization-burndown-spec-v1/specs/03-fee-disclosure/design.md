# Design — Fee Disclosure

## Audit surface

Search:
- `15%`
- `10%`
- `2%`
- `PLATFORM_FEE_RATE`
- `fee_rate`
- `feeAmount`
- invoice
- export
- escrow copy
- mock transactions
- T&C UI

Classify each occurrence:

1. financial calculation
2. display derived from canonical current config
3. historical snapshot
4. legal text
5. stale mock/test
6. comment/docs

Do not mass replace text blindly.

## Display helper

Prefer reusable formatter:

`formatPlatformFeePercent(rate)`

or existing equivalent.

For dynamic transaction display:
use snapshot first.

For general “current fee” educational copy:
use canonical current config.

## Legal text

If active T&C explicitly defines a fixed fee:
do not alter automatically unless current legal source agrees.

If code copy conflicts with legal current:
report conflict.

## Non-goal

No pricing redesign.
