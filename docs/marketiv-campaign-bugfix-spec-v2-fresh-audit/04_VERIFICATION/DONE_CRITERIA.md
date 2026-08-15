# Definition of Done

- [ ] Admin config cannot silently use staging if env is missing.
- [ ] Admin test gate is standalone.
- [ ] Synthetic Admin fallback removed.
- [ ] Protected Admin reads only after active Admin authorization.
- [ ] Secure Admin submission queue Function/DTO.
- [ ] Secure Admin dashboard summary Function/DTO.
- [ ] Real read errors never become fixtures.
- [ ] Review Function failure never becomes local success.
- [ ] No browser direct final review write.
- [ ] Browser claim no longer increments in parallel with server Function.
- [ ] Unclaim is trusted/server-authoritative.
- [ ] Expired reclaim rule consistent.
- [ ] Wrong portal role explicit.
- [ ] Unsafe/cross-role `next` rejected.
- [ ] Detail Unclaim parity complete.
- [ ] No fake Admin 15/12/+12%/99.8%/SLA as measured facts.
- [ ] No fake environment/health/identity runtime facts.
- [ ] Reject copy no longer names UMKM as reviewer.
- [ ] Stop/pause Campaign revalidated.
- [ ] Submit proof revalidated.
- [ ] Claim permission/counter revalidated.
- [ ] User app quality gates executed.
- [ ] Admin quality gates executed.
- [ ] No Rate Card unrelated changes.
- [ ] Runtime E2E PASS only with actual evidence.

If code is green but live staging E2E was not executed:
`READY_FOR_STAGING_E2E`.
