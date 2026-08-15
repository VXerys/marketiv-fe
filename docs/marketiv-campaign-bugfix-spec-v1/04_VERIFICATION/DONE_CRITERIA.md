# Definition of Done

Campaign blocker batch is code-complete only if all statements are true:

- [ ] Admin review cannot return local/UI success after trusted Function failure.
- [ ] Browser has no direct submission final-status/final-views review mutation path.
- [ ] Real Admin data failure never falls back to fixtures.
- [ ] `/admin/*` is protected before protected data loads.
- [ ] Anonymous/UMKM/Creator/suspended Admin negative cases are handled.
- [ ] UMKM↔Creator wrong login portal produces explicit feedback and no bounce.
- [ ] Admin login still works.
- [ ] `next` cannot cross role boundaries.
- [ ] Creator detail supports Unclaim only before submission.
- [ ] Admin dashboard does not present dummy/static metrics as live facts.
- [ ] Campaign reviewer copy is consistent with Admin Marketiv authority.
- [ ] Stop Campaign code-fixed behavior remains intact.
- [ ] Submit proof trusted Function behavior remains intact.
- [ ] Claim permission fix remains intact.
- [ ] Relevant tests were added/updated and executed.
- [ ] Lint was executed.
- [ ] Typecheck was executed; known unrelated failures are separately documented.
- [ ] Build was executed.
- [ ] No Rate Card code was changed unless a direct shared dependency made it unavoidable and was documented.
- [ ] No secret/API key was introduced client-side.
- [ ] No runtime/E2E pass was claimed without actual runtime evidence.

## Final status

If code gates pass but staging E2E has not run:

`READY_FOR_STAGING_E2E`

That is the correct handoff state, not `DONE/E2E PASS`.
