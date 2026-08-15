# P3 — Secure Admin Read DTO Functions

## Objective
Replace invalid cross-user browser reads.

## First
Search for an equivalent secure Function. Do not duplicate.

## Recommended Functions

### `get-admin-submission-queue`
- authenticated caller;
- verify `users.role === "admin"` and active;
- server SDK reads submissions + minimal related Campaign/Creator/UMKM data;
- bounded status/limit;
- read-only;
- minimal DTO;
- 401/403/5xx explicit.

### `get-admin-dashboard-summary`
- same role/status guard;
- factual pending/reviewed/active Campaign counts;
- read-only;
- no fake “today”.

## Register
Follow current `00_BACKEND/appwrite.config.json` / generator convention.
Use minimum scopes, normally document reads only.

## Admin frontend
- use Function DTOs;
- real error → error;
- real empty → empty;
- no fixtures as real fallback.

## Tests
- Admin success;
- non-admin 403;
- suspended 403;
- unauth 401;
- empty;
- malformed/5xx;
- DTO mapping.

## Verify
Backend config checks + Admin test/lint/typecheck/build.

STOP.
