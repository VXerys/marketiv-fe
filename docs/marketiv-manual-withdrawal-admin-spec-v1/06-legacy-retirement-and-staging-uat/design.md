# Phase 06 — Design

## Files Likely Changed
- `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- generated `00_BACKEND/appwrite.config.json`
- `00_BACKEND/appwrite/function-scopes.json` hanya jika registration benar-benar diubah sesuai inventory rules
- current withdrawal/wallet docs

Jangan delete function source folders sembarangan karena generator current melakukan function-directory inventory consistency checks.

## Recommended Retirement Strategy

### mature-pending-balance
Prefer:
- keep source folder,
- remove cron schedule / disable function sesuai supported config,
- preserve source untuk audit sampai cleanup terpisah.

### withdrawal-callback
Prefer:
- keep source folder initially,
- disable public execution/function setelah tidak ada legacy processing rows,
- keep `iris_reference` nullable untuk historical rows.

## Runtime Evidence
Capture/report:
- test withdrawal IDs,
- pre/post wallet balances,
- transaction IDs,
- reversal transaction ID untuk failure case,
- statuses/timestamps,
- deployed commit/Function versions.

Jangan commit secrets atau full bank account numbers ke evidence.

## Documentation State
Current flow:
```text
Campaign approval
→ available balance
→ withdrawal request
→ requested
→ admin processing
→ manual transfer
→ succeeded
```

Legacy 7-day maturation dan Iris payout ditandai superseded untuk new flow.

## Cleanup Deferred
Physical deletion of mature function, callback function, Iris legacy fields, atau historical docs adalah cleanup terpisah setelah production confidence. Fase ini fokus safe retirement.
