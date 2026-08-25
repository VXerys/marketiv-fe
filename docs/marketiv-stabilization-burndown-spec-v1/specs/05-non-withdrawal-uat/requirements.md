# Requirements — Non-Withdrawal UAT Bug Pass

## Philosophy

UAT cards are acceptance specifications, not implementation tickets.

For each UAT:

PASS scenario → no code change.

FAIL scenario:
1. reproduce;
2. find root cause;
3. fix minimally;
4. add regression test;
5. re-run scenario.

## In-scope UAT

### Authentication

AUTH-01:
- login;
- session;
- role boundary;
- safe next redirect;
- logout;
- suspended user.

AUTH-03:
- forgot password;
- reset;
- OAuth flag/callback if enabled;
- onboarding;
- missing/incomplete profile;
- no redirect loop.

### UMKM

UMKM-01:
- dashboard loading/empty/error;
- navigation;
- no role data leak;
- refresh/deep-link.

UMKM-02:
- Campaign draft/edit/fund/publish;
- payment server authority;
- campaign stop state;
- actionable Function errors.

UMKM-03:
- creator discovery;
- profile;
- published package only;
- package context enters negotiation.

UMKM-04:
- messages;
- custom offer;
- state transitions;
- accept/reject;
- no duplicate order;
- package provenance.

UMKM-05:
- Rate Card payment;
- escrow;
- deliverable;
- revision;
- approval;
- Collab settlement safety;
- release idempotency.

UMKM-06:
- finance summary;
- analytics;
- notifications;
- help/settings;
- profile/logo;
- **exclude withdrawal actions**.

### Creator

KREATOR-01:
- overview/navigation/loading/error.

KREATOR-02:
- Campaign Job Pool;
- eligible claim;
- idempotent claim;
- current server-side counter authority;
- expired behavior according to current code.

KREATOR-03:
- active work;
- unclaim eligibility;
- submit public URL;
- waiting Admin review;
- fraud as signal, not authority;
- reward outcome.

KREATOR-04:
- Rate Card CRUD;
- draft/publish;
- boundary validation;
- directory visibility.

KREATOR-05:
- negotiation;
- accept/reject;
- chat;
- deliverable;
- revision;
- Collab evidence.

### Core E2E

E2E-01 Campaign:
core flow regression only.

E2E-02 Rate Card:
full non-withdrawal golden path.

## Explicit exclusion

Do not test or modify withdrawal.

If clicking finance UI could trigger withdrawal:
skip that action.

## Evidence

For runtime UAT collect:
- role/account alias only;
- timestamp;
- browser;
- route;
- screenshot/video;
- Function execution ID if safe;
- sanitized request/response;
- state before/after.

Never record:
- password;
- OTP;
- API key;
- server key;
- full bank data;
- session cookie.
