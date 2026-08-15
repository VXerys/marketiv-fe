# Non-Negotiable Invariants

## Campaign product rules

1. Campaign and Rate Card are separate domains.
2. Campaign has no chat or negotiation.
3. Creator submits a public social post URL.
4. Fraud metadata is advisory; it does not independently finalize payout.
5. UMKM observes submission status but does not approve/reject or input final views.
6. Admin Marketiv is the user-facing validation authority.
7. Trusted backend state is the authority for status, final views, reward, wallet, and ledger.

## Security / mutation rules

1. Browser code SHALL NOT directly mutate:
   - `campaign_submissions.status`
   - locked/final views
   - Campaign reward outcome
   - wallet balance
   - financial ledger
2. Admin approval/rejection SHALL execute through the trusted Function.
3. Function failure SHALL surface as failure; no local success simulation.
4. Admin route protection SHALL prevent protected content/data load for anonymous, UMKM, Creator, and suspended Admin sessions.
5. No server API key or Appwrite admin credential may be added to `NEXT_PUBLIC_*`.

## UX rules

1. Empty data and failed data are different states.
2. No dummy metric may look like live data.
3. Wrong-role login must give explicit feedback.
4. Unclaim must only exist before submission.
5. Mutation UI must have disabled/loading/error handling.
6. Changed mobile surfaces must work at 375px without horizontal overflow.
7. Status meaning must use text, not color alone.

## Scope rules

- Do not fix Rate Card in this pack.
- Do not migrate architecture broadly.
- Do not add a new auth system.
- Reuse the current `AuthProvider`, `RoleGuard`, shared Appwrite function wrapper, route constants, and service facade patterns.
