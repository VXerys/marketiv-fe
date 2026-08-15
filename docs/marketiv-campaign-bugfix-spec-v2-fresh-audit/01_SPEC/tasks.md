# Master Tasks

## P0
- Fresh baseline/drift audit only.

## P1
- Fail-closed Admin Appwrite config.
- Fail-safe user→Admin origin.
- Standalone Admin Vitest/test script/config.

## P2
- Remove synthetic Admin fallback.
- Centralized Admin auth/session gate.
- No protected reads before auth.
- Real identity/logout.

## P3
- Admin-only submission queue read Function.
- Admin-only dashboard summary Function.
- Wire Admin reads; remove real fixture fallback.

## P4
- Typed Admin Function execution wrapper.
- No swallowed review errors.
- No direct final-state DB write.
- No local false-success.
- Authoritative refresh.

## P5
- Remove client `totalClaims` increment.
- Align expired reclaim rule.
- Trusted `unclaim-campaign`.
- Remove browser delete/decrement authority.

## P6
- UMKM↔Creator wrong portal handling.
- Session cleanup.
- Admin exception.
- Safe role-compatible `next`.

## P7
- Creator detail Unclaim parity.

## P8
- Remove fake Admin metrics/health/identity.
- Fix stale reviewer copy.
- Focused Campaign UI state polish.

## P9
- Both app quality gates.
- Revalidate QA #1–#5 + new claim counter issue.
- Campaign 3-role E2E readiness/runtime evidence.
