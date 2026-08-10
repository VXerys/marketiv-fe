# 03 — Campaign
Routes: campaign list/create/edit/detail/review.

Findings order:
1. `UMKM-OPS-01`
2. `UMKM-SEC-02`
3. `UMKM-FIN-02`
4. `UMKM-CAM-01`
5. `UMKM-UX-01`
6. `UMKM-PERF-01`

Primary source:
- `CreateCampaignWizard.tsx`
- `src/services/umkm/umkm-appwrite.service.ts`
- `patch-campaign-draft/src/main.js`
- `patch-campaign-status/src/main.js`
- `review-submission/src/main.js`

Invariants:
- draft private;
- publish only if funding target satisfied;
- reject restores exactly 1 slot;
- payment state server-controlled.

Verify:
create -> save -> edit -> pay -> webhook -> publish; pause/resume; reject+retry; anonymous draft read denied; delayed/duplicate webhook.
