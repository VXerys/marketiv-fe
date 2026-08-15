# Requirements — Campaign E2E Blocker Hardening

Requirement keywords: **SHALL** mandatory, **SHALL NOT** prohibited.

## R1 — Authoritative Admin submission mutation

**As Admin Marketiv, I want review actions to reflect trusted backend state so that a browser cannot fabricate a financial decision.**

1. WHEN Admin approves/rejects a pending submission, THE SYSTEM SHALL use the trusted `review-submission` Function.
2. WHEN Function execution returns non-2xx/failed, THE SYSTEM SHALL surface failure and SHALL NOT mutate local state into a success result.
3. THE browser SHALL NOT directly update submission status/final views.
4. Real/staging mode SHALL NOT fall back to fixture/in-memory results after a read failure.
5. Empty real data SHALL return an empty state, not fixture data.
6. Fixture/in-memory behavior MAY exist only behind the explicit mock/test switch.
7. AFTER trusted mutation success, UI state SHALL be refreshed from authoritative data rather than invented client-side.

## R2 — Admin authorization boundary

**As the platform owner, I want `/admin/*` protected before protected data is loaded.**

1. WHERE the user is anonymous, THE SYSTEM SHALL not render/fetch protected Admin content and SHALL route to login.
2. WHERE the session role is UMKM or Creator, THE SYSTEM SHALL not render protected Admin content.
3. WHERE Admin status is suspended, THE SYSTEM SHALL block access.
4. WHERE an active Admin session exists, THE SYSTEM SHALL allow Admin surfaces.
5. THE implementation SHALL reuse the current auth/role architecture unless a newer current repository mechanism supersedes it.
6. THE implementation SHALL NOT add browser-exposed admin/server secrets.
7. Protected Admin reads SHALL occur only after the authorization boundary in the architecture actually used.

## R3 — Login portal-role mismatch

**As a UMKM/Creator user, I want a clear message when I use the wrong login portal so that I do not experience a redirect bounce.**

1. WHEN a Creator account is submitted from the UMKM tab, THE SYSTEM SHALL show explicit role-mismatch feedback.
2. WHEN a UMKM account is submitted from the Creator tab, THE SYSTEM SHALL show explicit role-mismatch feedback.
3. A wrong-portal success from Appwrite SHALL NOT leave an authenticated session that immediately bounces through role guards.
4. Correct-role login SHALL remain unchanged.
5. Admin login SHALL remain possible even though the current login tabs only model UMKM/Creator.
6. A `next` parameter SHALL only be honored when it is an internal destination compatible with the authenticated role.
7. Incompatible/unsafe `next` SHALL be ignored in favor of the canonical dashboard route.

## R4 — Creator Unclaim parity

**As a Creator, I want to cancel an unsubmitted claimed Campaign from its detail page.**

1. IF active work is `claimed` and no submission exists, THE detail SHALL expose `Batalkan pekerjaan ini`.
2. IF work is submitted/approved/rejected/expired, THE action SHALL NOT be shown.
3. WHEN clicked, THE SYSTEM SHALL require confirmation.
4. WHILE mutation is pending, THE SYSTEM SHALL prevent duplicate actions.
5. THE action SHALL use the existing Creator service facade.
6. ON success, THE SYSTEM SHALL leave the stale detail route and refresh/navigate to a valid Creator Campaign surface.
7. ON failure, THE SYSTEM SHALL preserve the current detail and show an actionable error.

## R5 — Truthful Admin metrics

1. Real Admin screens SHALL NOT display fixture counts as operational facts.
2. Unsupported `+12%`, `99.8%`, SLA, or fixed progress percentages SHALL NOT be presented as live metrics.
3. Metrics named `...Hari Ini` SHALL actually be scoped to today; otherwise the label SHALL be changed to match the data.
4. Empty SHALL be distinguishable from load failure.
5. Mock metrics MAY be used only in explicit mock/test mode.

## R6 — Campaign authority language

1. Campaign copy SHALL identify Marketiv/Admin as validator when an actor is mentioned.
2. Campaign copy SHALL NOT tell Creator that UMKM is the final submission reviewer.
3. UMKM Campaign submission UI SHALL remain read-only.
4. Fraud wording SHALL remain separate from final review status.

## R7 — Preserve reported code fixes

The implementation SHALL NOT regress:

1. Stop Campaign action only being available for valid active state.
2. Creator proof submission through trusted `submit-campaign-proof` without direct submission writes.
3. Creator claim/unclaim permission behavior currently fixed in code.

## R8 — UI resilience

All changed interactive surfaces SHALL cover relevant loading, error, empty, disabled, and success states and remain usable at 375px.

## R9 — Scope isolation

This batch SHALL NOT implement or refactor Rate Card flow.

## R10 — Verification integrity

1. Codex SHALL run phase-specific tests and available repository gates.
2. Pre-existing failures SHALL be reported separately.
3. Runtime staging/E2E SHALL NOT be claimed as passed when only code/tests were inspected.
