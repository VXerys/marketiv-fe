# Test Matrix

## Auth

| Case | Expected |
|---|---|
| UMKM on UMKM tab | login → UMKM dashboard |
| Creator on Creator tab | login → Creator dashboard |
| Creator on UMKM tab | explicit mismatch, session cleared, no bounce |
| UMKM on Creator tab | explicit mismatch, session cleared, no bounce |
| Admin login | Admin remains able to reach `/admin` |
| UMKM `next=/dashboard/kreator/...` | ignore next |
| Creator `next=/dashboard/umkm/...` | ignore next |
| any `next=https://...` or `//...` | ignore next |

## Admin authorization

| Session | Expected |
|---|---|
| none | no protected data/render; login |
| UMKM | no Admin data; UMKM destination |
| Creator | no Admin data; Creator destination |
| suspended Admin | block |
| active Admin | dashboard/submissions work |

## Admin review mutation

| Condition | Expected |
|---|---|
| Function 2xx | backend success, then authoritative refresh |
| Function 401 | visible auth error, no local status change |
| Function 403 | visible forbidden error, no local status change |
| Function 409 | already reviewed conflict, no duplicate success |
| Function 5xx/failed | error, no local success |
| read error in real mode | error state, no fixtures |
| real collection empty | empty queue |
| explicit mock mode | fixtures allowed |

## Creator Unclaim

| State | CTA |
|---|---|
| claimed + no proof | visible |
| submitted/pending | hidden |
| approved | hidden |
| rejected | hidden |
| expired | hidden |

Mutation:

- cancel confirm → no call;
- success → one call + leave stale detail route;
- failure → remain + error;
- pending → no duplicate call.

## Admin metrics

- zero real records → 0 / valid empty;
- Appwrite error → explicit error;
- no real-mode fallback 15;
- no unsupported 12%, 99.8%, SLA;
- “today” means today or is renamed.

## Campaign regressions

- Stop action only active.
- Submit proof goes through trusted Function and has no direct submission write.
- Claim/unclaim permission remains owner-safe.
- UMKM Campaign submission remains observer-only.
- Fraud remains advisory, not status authority.
