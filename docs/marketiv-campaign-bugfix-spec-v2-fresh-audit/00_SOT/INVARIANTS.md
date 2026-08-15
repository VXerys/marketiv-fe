# Invariants

## Campaign
- Creator submits a public TikTok/Instagram URL.
- No chat/negotiation in Campaign.
- Fraud signal is advisory.
- UMKM does not approve/reject Campaign submissions.
- Admin Marketiv is final user-facing submission validator.
- Trusted backend state owns final views/reward/ledger.

## Admin
- Admin stays standalone under `admin/`.
- Same Appwrite project as user app in matching environment.
- No synthetic Admin fallback in real runtime.
- No broad browser cross-user collection access.
- Sensitive mutation is revalidated server-side.
- Function failure cannot become local success.
- Runtime identity/health/metrics cannot be fabricated.

## Claim
- Exactly one authority owns `totalClaims` increment/decrement.
- One effective claim adds one slot usage.
- One successful unclaim returns one slot.
- Retry/double-click cannot duplicate state.
- Expired reclaim rule is consistent client/server.

## Auth
- UMKM/Creator portal role must match account role.
- Admin login remains possible even without an Admin tab.
- `next` cannot cross role boundaries or redirect to arbitrary external origins.

## Security
- No server/API secret in browser.
- Do not widen collection permissions merely to enable Admin.
