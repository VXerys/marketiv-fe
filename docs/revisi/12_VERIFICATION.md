# 12 — Minimal Verification

Use targeted tests; full suite after batch.

## Security matrix
- anonymous denied
- wrong role denied
- suspended denied
- other tenant denied
- owner succeeds
- repeated request safe

## Campaign
- create/save/edit
- draft private
- pay/webhook/publish
- reject restores 1 slot
- duplicate event safe

## Rate Card
chat -> offer -> accept -> order -> payment -> deliverable/revision -> approve -> settlement.

Direct SDK tests:
- order mutation denied
- message mutation denied
- conversation participant mutation denied

## Finance invariants
- campaign total = base + fee
- Rate Card buyer total = agreed price
- released escrow => ledger + credited balance
- duplicate webhook => no duplicate money
- partial failure retry converges

## Scale
- creators >100
- notifications >100
- aggregate >5000 explicit, not silent

## Commands
Prefer repo scripts:
```bash
npm run typecheck
npm run lint
npm run test
npm run build
```
Targeted test first; jangan full build setelah tiap edit.
