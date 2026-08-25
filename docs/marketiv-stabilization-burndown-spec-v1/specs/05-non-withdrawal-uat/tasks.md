# Tasks — UAT Pass

## Automated-first
- [ ] Run available unit/integration tests for each domain before manual work.
- [ ] Use Playwright where fixtures already exist.
- [ ] Avoid expensive manual test for behavior already deterministically automated unless runtime integration is specifically required.

## Runtime categories

### Can be automated locally
- role redirects
- validation
- state mapping
- mocks
- idempotency logic
- UI component state

### Requires staging/provider
- actual Midtrans Sandbox redirect/webhook
- Appwrite deployed Function wiring
- realtime/polling across independent sessions
- OAuth callback if configured
- real email OTP/recovery
- provider-based Collab verification if implemented externally

## Bug handling
For each failed UAT:
- [ ] write concise reproduction;
- [ ] identify root cause;
- [ ] fix only root cause;
- [ ] add regression;
- [ ] rerun targeted;
- [ ] add to final report.

## No scope explosion
Do not redesign pages merely because UAT reveals aesthetic preference.
Correctness first.
