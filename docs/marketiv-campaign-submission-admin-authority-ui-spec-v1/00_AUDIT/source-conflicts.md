# Source Conflict Resolution

## Rule Used

`00_BACKEND/docs/README.md` declares `00_BACKEND/docs` as the project single source of truth, but many Campaign pages in that tree are stale. Current code is therefore used to identify implementation reality, while this package proposes the documentation update that restores a single coherent truth.

## Conflict Matrix

| Topic | Source A | Source B | Resolution in this spec |
|---|---|---|---|
| Validation authority | Canonical Campaign docs: UMKM approves/rejects | `docs/marketiv-md/features/08` + permissions matrix: Admin validates | **Admin Marketiv** becomes canonical authority; UMKM read-only. |
| Backend reviewer authorization | `review-submission`: parent `umkmId` must equal caller | Admin dashboard expects Admin calling review Function | Current code is legacy blocker. Change later in BE phase; UI removes UMKM action now. |
| Fraud final status | Old docs: score auto-approves/auto-rejects | Actual `ai-fraud-precheck`: only writes fraud score/status | Fraud becomes **advisory risk signal**. Admin performs final pending→approved/rejected. |
| Campaign platform | Domain/canonical docs: TikTok MVP | submit Function + Creator UI accept Instagram too | Product UI follows campaign-owned platform; current MVP TikTok. Function capability is not treated as product availability. |
| Views verifier | `95_Views_Tracking`: UMKM manual | New desired authority + admin dashboard: Admin manual | **Admin** captures and locks final views. `views_source=manual_admin` remains semantically valid. |
| Creator reward fee | ADR-008: Campaign creator gets full reward | UMKM mapper deducts `PLATFORM_FEE_RATE` | ADR/backend wins. Mapper is a bug/risk to correct in read layer. |
| Submission status enums | `src/types/domain.ts`: lowercase backend enums | `docs/marketiv-md/features/18`: PascalCase/translated lifecycle | `src/types/domain.ts` + Appwrite schema are current enum truth. Do not add translated status values. |
| Admin repo platform | admin types include YouTube | Marketiv Campaign MVP TikTok | Do not copy admin type union as production contract. |

## Documentation Ownership After Migration

To avoid repeating this conflict:

- **Campaign role/authority rules:** `00_BACKEND/docs/02_Modules/Campaigns/30_Business_Rules.md`
- **Role-specific flow:** `Campaigns/40_User_Flow.md`
- **Frontend/backend command boundary:** `Campaigns/60_API.md` + `70_Backend.md`
- **Views semantics:** `Campaigns/95_Views_Tracking.md`
- **Cross-module E2E:** `03_Workflows/20_Campaign_PPV.md`
- **Fraud behavior:** `03_Workflows/40_Submission_Fraud.md`
- **WHY authority changed:** `04_Decisions/ADR-010.md`
- **Status enum values:** actual domain/schema; canonical docs should mirror them, never create translated DB values.

`docs/marketiv-md/features/*` should be demoted to supporting/reference documentation or replaced with pointers to these canonical files where duplicated.
