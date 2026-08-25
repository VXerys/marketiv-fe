# Design — Playwright Critical Flows

## Test layering

### Layer 1 UI deterministic
Stub controlled backend only when test goal is UI state transition.

### Layer 2 integration
Use test Appwrite project/data with real Functions if environment supports.

### Layer 3 staging smoke
Real provider sandbox/manual run.

Do not pretend Layer 1 proves Layer 3.

## Fixtures

Create reusable fixtures:
- UMKM
- Creator
- Admin
- published package
- Campaign
- pending submission
- wallet balances

Fixture IDs should be unique per run.

Cleanup should be deterministic.

## Idempotency tests

Rate Card:
- rapid payment retry;
- duplicate webhook;
- duplicate approval/release.

Campaign:
- duplicate review attempt;
- already-reviewed rejected;
- invalid final views.

## Auth

Use stored state only for test accounts.
Never commit session files/secrets.
