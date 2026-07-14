# Dashboard Route Audit Matrix

Static audit date: 2026-06-15

Source of truth:

```txt
docs/design-system/marketiv-studio-system-v5-8.html
```

Priority legend:

- P0 = blocks usability or causes serious layout break
- P1 = visible inconsistency affecting quality
- P2 = polish issue
- P3 = optional enhancement

| Role | Route | Status | Main UI Issues | Responsive Issues | Component Issues | Priority | Recommended Fix |
|---|---|---|---|---|---|---|---|
| UMKM | `/dashboard/umkm` | Exists, static audited | Visually closest to warm/navy/orange direction but uses a separate `features/dashboard` primitive set | Low current risk; keeps `overflow-x-hidden`, `min-w-0`, and corrected desktop width | `DashboardCard`, `StatusBadge`, `ProgressBar` duplicate richer UMKM shared primitives | P1 | Reconcile overview primitives with final shared dashboard primitive API without changing appearance |
| UMKM | `/dashboard/umkm/campaign` | Exists, static audited | Card view is good, table mode is less aligned with UI kit mobile-first rules | Table mode uses `min-w-[900px]` and horizontal scroll | Uses shared primitives, but `CampaignTable` uses raw `<img>` and desktop table anatomy | P0 | Replace campaign table mode with `ResponsiveDataRow`/mobile cards or hide table mode on mobile |
| UMKM | `/dashboard/umkm/campaign/buat` | Exists, static audited | Wizard generally aligns with campaign/escrow flow; page wrapper fetches profile client-side | Needs live mobile check for wizard stepper/footer/modal height | Uses wizard-specific cards and shared buttons, but modal API is not centralized | P1 | Keep flow, normalize modal/footer/card surfaces after shared primitives are finalized |
| UMKM | `/dashboard/umkm/campaign/[id]` | Exists as `[campaignId]`, static audited | Detail route has good states and campaign-specific cards | Submission rows are mostly responsive, but proof URL rows and modal content need 375px check | Strong shared primitive usage; raw `<img>` remains in submission card/modals | P1 | Convert raw images, review modal scroll behavior, keep Campaign Mode zero-chat |
| UMKM | `/dashboard/umkm/kreator` | Exists, static audited | Creator marketplace needs tighter alignment with UI kit marketplace card anatomy | Toolbar/card grid needs 375px/430px validation for long creator names and chips | Many creator-directory components are client-marked and use local cards | P1 | Normalize creator cards/toolbars to shared MarketplaceCard and DashboardToolbar patterns |
| UMKM | `/dashboard/umkm/kreator/[id]` | Exists, static audited | Profile/detail is Rate Card discovery and domain-aligned | Rate card package grid and portfolio cards need small-screen validation | Uses local profile/package components and StartNegotiationModal | P1 | Normalize profile hero, package card, social links, and negotiation modal primitives |
| UMKM | `/dashboard/umkm/negosiasi` | Exists, static audited | Correct Rate Card list concept; visual style differs from campaign/finance pages | Toolbar and room cards need mobile wrapping validation | Uses negotiation-specific cards plus shared metrics | P1 | Normalize negotiation summary cards, toolbar, and room cards to shared API |
| UMKM | `/dashboard/umkm/negosiasi/[id_order]` | Exists, static audited | Correct chat/custom offer/Collab Post domain; browser `alert()` remains in header | Chat workspace and composer need 375px height/scroll validation | Chat, custom offer, order summary, and modals are bespoke | P1 | Replace `alert()`, normalize chat/order card primitives, enforce mobile-safe chat layout |
| UMKM | `/dashboard/umkm/keuangan` | Exists, static audited | Finance is strong overall but escrow diagram is a horizontal scroller | `EscrowOverviewCard` uses `min-w-[640px]` inside `overflow-x-auto` | Good transaction table-to-card split; finance primitives remain feature-local | P0 | Replace escrow diagram with stacked mobile steps; keep desktop timeline for larger screens |
| Kreator | `/dashboard/kreator` | Exists, static audited | Overview is feature-rich but too much local card/modal/alert styling | Dense overview sections and modals need 375px validation | Uses `CreatorMetricCard`, `CreatorEmptyState`, local modals, browser `alert()` | P1 | Move overview metrics/actions/states/modals onto shared dashboard primitives |
| Kreator | `/dashboard/kreator/job-pool` | Exists, static audited | Campaign Mode job cards are domain-correct but manually styled | Filter toolbar and CTA rows may crowd on mobile | Raw `<img>`, manual cards, manual badges/progress/buttons | P1 | Build shared Job/Campaign marketplace card and shared filter toolbar |
| Kreator | `/dashboard/kreator/job-pool/[id]` | Exists, static audited | Detail tiles and claim modal are manually styled | 5-metric grid and claim modal need 375px/430px validation | Raw `<img>`, local metric tiles, local modal buttons | P1 | Normalize detail metric cards, external asset card, and claim modal |
| Kreator | `/dashboard/kreator/pekerjaan-aktif` | Exists, static audited | Active work list uses creator-specific primitives | Card CTAs and long titles need mobile validation | Parallel creator state/card primitives | P2 | Normalize list cards and states after shared creator/UMKM primitive merge |
| Kreator | `/dashboard/kreator/pekerjaan-aktif/[id]` | Exists, static audited | Proof URL flow is correct; "Upload Video" label is confusing for Campaign Mode | Submission form and confirmation modals need height validation | Raw `<img>`, local form/card/modal styling | P1 | Rename confusing label in Phase 2, normalize proof submission card and modal primitives |
| Kreator | `/dashboard/kreator/negosiasi` | Exists, static audited | Rate Card list is domain-allowed; style differs from UMKM negotiation | Search/filter/list rows need 375px validation | Creator-specific metrics, states, and manual cards | P2 | Normalize negotiation list cards and status badge mapping |
| Kreator | `/dashboard/kreator/negosiasi/[id_order]` | Exists, static audited | Correct chat/custom offer/Collab Post warning | Chat pane, composer, and side summary are high mobile-height risk | Large bespoke chat room and modal implementation | P1 | Create shared rate-card chat room layout and scroll-safe composer/modal primitives |
| Kreator | `/dashboard/kreator/profil` | Exists, static audited | Profile editor and portfolio management are heavily bespoke | Portfolio modals and upload areas need mobile height validation | Multiple raw `<img>` tags, local upload cards, local CRUD modals | P1 | Normalize profile cards, upload-card primitive, portfolio card, and CRUD modal API |
| Kreator | `/dashboard/kreator/rate-card` | Exists, static audited | Package CRUD is domain-valid but visually manual | Create/edit/delete modals need 375px scroll validation | Local package cards, forms, modals, status buttons | P1 | Normalize RateCardPackageCard, modal form layout, and Collab Post guidance |
| Kreator | `/dashboard/kreator/keuangan` | Exists, static audited | Rich states exist but use creator-only card and transaction patterns | Currency/action rows need mobile validation | Creator finance cards duplicate UMKM finance concepts | P1 | Normalize finance metric cards, transaction cards, withdrawal modal, and currency formatting |

## Route Coverage Notes

- All requested UMKM routes exist.
- All requested Konten Kreator routes exist.
- Dynamic UMKM campaign detail uses `[campaignId]` in the filesystem but maps to the requested `/dashboard/umkm/campaign/[id]` concept.
- This matrix is based on static source inspection, not live viewport screenshots.
