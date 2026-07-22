# Design & Rules Gabungan — Integrasi Backend Appwrite untuk UMKM & Kreator Dashboard

Static date: 2026-07-19

Dokumen ini adalah **panduan desain + aturan gabungan** untuk mengintegrasikan kedua dashboard (UMKM dan Kreator) ke backend Appwrite secara aman dan berurutan. Kedua fitur saling berkaitan (campaign yang dibuat UMKM diklaim Kreator; offer yang dikirim UMKM di-accept Kreator; escrow yang dibayar UMKM dicairkan ke Kreator), sehingga integrasi tidak boleh dikerjakan terisolasi per dashboard.

Dokumen ini merangkum dan menyatukan temuan dari dua audit terpisah — baca keduanya untuk detail per modul:

```txt
docs/audits/umkm-dashboard-appwrite-integration-readiness.md
docs/audits/kreator-dashboard-appwrite-integration-readiness.md
```

---

## 1. Hierarki Source of Truth

Saat ada konflik informasi, urutan otoritasnya:

1. **Kode backend nyata** — `00_BACKEND/src/services/*.ts` (file `.js` adalah stub kosong, abaikan) + `00_BACKEND/appwrite.config.json` (nama attribute collection yang sebenarnya) + `00_BACKEND/functions/*/src/main.js` (16 function terimplementasi).
2. **Docs backend** — `00_BACKEND/docs/02_Modules/**` (enum di `20_Concepts.md`, aturan di `30_Business_Rules.md`, schema di `50_Database.md`, kontrak UI di `80_Frontend.md`), `03_Workflows/**`, `01_Global/**`, `04_Decisions/**`.
3. **Skill proyek** — `.claude/skills/marketiv-data-contracts/` dan `.claude/skills/marketiv-appwrite-integration/` (referensi cepat; ada drift kecil vs kode — kode menang; lihat §9).
4. ~~`docs/marketiv-md/**`~~ — **DEPRECATED untuk kontrak backend.** Jangan dirujuk untuk schema, enum, fee, atau DTO. (Konsekuensi: `src/types/status.ts` yang mengklaim match Appwrite justru match spec lama ini — hapus.)

Aturan emas (`00_Project/50_Project_Rules.md`): implementasi yang tidak terdokumentasi tidak boleh ada; satu fakta satu lokasi.

---

## 2. Arsitektur Integrasi Target

```txt
Page / View (server atau client component)
   │  hanya memanggil facade — TIDAK pernah menyentuh SDK Appwrite langsung
   ▼
Facade service          src/services/umkm/umkm-dashboard.service.ts
                        src/services/creator/creator-dashboard.service.ts
   │  branch DATA_SOURCE_CONFIG.useMockData → mock | appwrite
   ▼
Appwrite service        src/services/umkm/umkm-appwrite.service.ts
                        src/services/creator/creator-appwrite.service.ts   ← belum ada, buat
   │  mapper $id→id, Query, try/catch → ServiceResult<T> + code
   ▼
SDK wrappers            src/lib/appwrite/{client,account,databases,functions,realtime,storage}.ts
                        (hanya NEXT_PUBLIC_*; tanpa API key — sudah benar, tinggal dipakai)
```

Aturan arsitektur:

- **R1 — Service layer wajib.** Komponen/page tidak boleh mengimport `appwrite` SDK, `databases`, `Query`, atau `account` secara langsung (`01_Global/20_Coding_Standards.md`).
- **R2 — `00_BACKEND` tidak diimport langsung oleh frontend.** `tsconfig.json:33` meng-exclude folder itu. Mekanisme berbagi: **port** tipe domain + logika query ke `src/` (tipe ke `src/types/`, query ke `*-appwrite.service.ts`). Jangan ubah exclude tanpa keputusan sadar — `00_BACKEND` punya test/tooling sendiri.
- **R3 — Facade mengembalikan `ServiceResult<T> = { success, data, error?, code? }`.** Service backend melempar typed error `{ code: validation|auth|not_found|forbidden|server|unknown, message (Bahasa Indonesia), cause? }` (`01_Global/60_Error_Handling.md`) — layer appwrite frontend yang menangkap dan membungkusnya. UI memetakan `code` → perilaku (auth→login, forbidden/not_found→state khusus, validation→field, server→toast+retry), **tidak pernah** mem-parse teks `message`.
- **R4 — Mutasi sensitif hanya via Cloud Functions.** Frontend tidak pernah menulis langsung ke: `wallets`, `transactions`, `escrows`, `payments` (status), `campaigns.remainingBudget/spentAmount/totalClaims`, status validasi submission. Function terkait: `create-payment`, `midtrans-webhook` (satu-satunya jalur `paid`), `create-order`, `create-escrow`, `release-escrow`, `calculate-campaign-reward`, `ai-fraud-precheck`, `ai-brief`, `campaign-claimed`, `campaign-published`, `expire-stale-claims`, `create-user-profile`, `create-user-wallet`, `validate-and-upload`, `delete-file`, `send-chat-notification`.
- **R5 — Mock switch tunggal.** `src/config/data-source.config.ts` (`NEXT_PUBLIC_USE_MOCK_DATA`; default mock ON saat undefined — dokumentasikan di `.env.example`). Tidak boleh ada jalur data lain: **`src/data/umkmDashboard.ts` dan `src/data/creators.ts` dihapus**, semua mock hanya di `src/mocks/**`.

---

## 3. Fondasi Bersama (dikerjakan SEKALI, sebelum integrasi per dashboard)

Ini union blocker dari kedua audit — semuanya P0:

1. **Auth & session context (satu untuk kedua role).** `AuthProvider` global: `account.get()` → baca `users` (`role: umkm|creator|admin`, `status: active|suspended`) → context `{ userId, email, role, profile }`. Guard di layout boundary: buat `src/app/dashboard/umkm/layout.tsx` (belum ada!) dan pakai `src/app/dashboard/kreator/layout.tsx` yang sudah ada; role salah → redirect; `suspended` → blokir dengan pesan. Login rejects non-`active` (docs `Authentication`).
2. **Environment.** Isi `.env`: `NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sgp.cloud.appwrite.io/v1`, `NEXT_PUBLIC_APPWRITE_PROJECT_ID=69f9d45b00315cb0ec2f`, `NEXT_PUBLIC_APPWRITE_DATABASE_ID=6a4c8598001da3b0d7f0`; lengkapi `.env.example` termasuk `NEXT_PUBLIC_USE_MOCK_DATA`. Tidak ada API key/secret di frontend.
3. **Kanon tipe & status tunggal** (lihat §4) — dipakai kedua dashboard. Hapus `src/types/status.ts` dan `src/types/umkmDashboard.ts`; perbaiki `src/types/umkm-dashboard.types.ts` dan `src/types/creator-dashboard.ts` agar match backend.
4. **Method backend yang hilang** (union kedua audit) — tambah di `00_BACKEND/src/services/` dengan pola yang sama (typed error + mapper):
   - Chat: `getConversations()` (inbox kedua role)
   - Offers: `getOffers()` / `getOfferById()`
   - Orders: `getOrderById()`, `getDeliverables(orderId)`, `getRevisions(orderId)`
   - Claims: `getMyClaims()` (kreator)
   - Rate cards: `getRateCardById()`, list-own-drafts (kreator), `deleteRateCard()`
   - Submissions: `getSubmissionsByCampaign(campaignId)` (UMKM review)
   - Campaign assets: service `add/list/removeCampaignAsset` (collection `campaign_assets` sudah ada)
   - Opsional: helper `topUpCampaign()` (atau standardisasi `payment.service.createPayment({purpose:'campaign'})`)
5. **`loading.tsx` per route** di kedua segment + hapus semua flag `*Simulated` dan `setTimeout` artifisial saat wiring.

---

## 4. Kanon Data & Status (berlaku untuk KEDUA dashboard)

Data layer **selalu** memakai nilai backend (English lowercase). Label Bahasa Indonesia hanya di layer presentasi via map status→label. Jangan pernah menyimpan/membandingkan `"Aktif"`, `"Selesai"`, `"MenungguPembayaran"` di state/data.

| Domain (collection) | Enum resmi |
|---|---|
| `campaigns.status` | `draft \| active \| paused \| completed` |
| `campaigns.type` | `ugc \| clipping`; `platforms` MVP: `["tiktok"]` |
| `campaign_claims.status` | `claimed \| submitted \| approved \| rejected \| expired` |
| `campaign_submissions.status` | `pending \| approved \| rejected` |
| `campaign_submissions.fraudStatus` | `safe \| review \| rejected` (field terpisah, bukan bagian status) |
| `rate_cards.status` | `draft \| published` (bukan `isActive`) |
| `offers.status` | `pending \| accepted \| rejected` |
| `orders.status` | `pending_payment \| escrow \| in_progress \| revision \| approved \| completed \| cancelled` |
| `deliverables.status` | `submitted \| revision_requested \| approved`; `source: storage \| external_url` |
| `revisions.status` | `open \| resolved` |
| `payments.status` | `pending \| paid \| failed \| expired \| cancelled`; `purpose: order \| topup \| campaign` |
| `escrows.status` | `held \| released \| refunded` |
| `withdrawals.status` | `processed` (direct — tanpa review admin) |
| `transactions.type` | `deposit \| withdrawal \| payment \| refund \| release \| fee` |
| `messages.message_type` | `text \| offer \| system` |
| `users.role` / `users.status` | `umkm \| creator \| admin` / `active \| suspended` |

Aturan mapping dokumen (skill `marketiv-data-contracts`):

- `$id` → `id`; `$createdAt`/`$updatedAt` → `createdAt`/`updatedAt`; `null` → `undefined` (numerik → `?? 0`).
- **Casing attribute per collection ikuti `00_BACKEND/appwrite.config.json`**: `payments`, `conversations`, `messages` snake_case (`user_id`, `conversation_id`, `sender_id`, `last_message_at`); mayoritas lainnya camelCase (`umkmId`, `creatorId`, `rewardPer1000Views`). Jangan digeneralisasi.

Konstanta bisnis (dari `wallet.service.ts` + ADR-008 — jangan hardcode ulang di komponen):

```ts
PLATFORM_FEE_RATE       = 0.05     // 5% flat
MINIMUM_WITHDRAW        = 50_000   // Rp 50.000
MINIMUM_CAMPAIGN_BUDGET = 50_000   // Rp 50.000 (frontend wizard saat ini salah pakai 100.000)
// Fee campaign top-up = buyer-side : UMKM bayar budget + floor(budget*5%)
// Fee rate card order = seller-side: kreator terima amount - floor(amount*5%) saat release
// Reward PPV = floor((views/1000) * rewardPer1000Views), dibatasi remainingBudget
```

---

## 5. Matriks RBAC & Jalur Aksi

Frontend tidak merender CTA yang tidak diizinkan role; kegagalan permission ditampilkan eksplisit (bukan disamarkan jadi empty state).

| Aksi | UMKM | Kreator | Jalur |
|---|---|---|---|
| Create/publish/pause campaign | ✅ owner | ❌ | `campaign.service` (publish butuh `remainingBudget > 0`) |
| Top-up campaign | ✅ | ❌ | `payment.service.createPayment({purpose:'campaign'})` → Midtrans Snap → `midtrans-webhook` |
| Lihat Job Pool (campaign `active`) | ✅ (own) | ✅ | `campaign.service.getCampaigns` |
| Klaim campaign | ❌ | ✅ (butuh `isProfileCompleted`) | `claim.service.claimCampaign` → Function `campaign-claimed` |
| Submit bukti tayang (URL TikTok) | ❌ | ✅ owner klaim | `submission.service.createSubmission` → `ai-fraud-precheck` |
| Review submission (approve/reject) | ✅ owner campaign, hanya status `pending` | ❌ | `submission.service.approve/rejectSubmission` → approve memicu `calculate-campaign-reward` |
| CRUD rate card | ❌ (read-only published) | ✅ owner | `creator.service` |
| Mulai chat / kirim Custom Offer | ✅ (UMKM inisiator offer) | ❌ kirim offer | `chat.service.createConversation`, `offer.service.createOffer` |
| Accept/Reject Custom Offer | ❌ | ✅ | `offer.service.accept/rejectOffer` → accept memicu Function `create-order` |
| Bayar order | ✅ | ❌ | `createPayment({purpose:'order'})` → webhook → `create-escrow` |
| Upload deliverable | ❌ | ✅ | `order.service.uploadDeliverable` |
| Approve deliverable / minta revisi | ✅ owner order (revisi ≤ `revisionLimit`) | ❌ | `order.service.approveDeliverable` → `release-escrow`; `requestRevision` |
| Lihat wallet + transaksi sendiri | ✅ read-only | ✅ read-only | `wallet.service` — **UI tidak pernah memutasi saldo** |
| Tarik dana | ❌ (MVP: withdrawal = kreator) | ✅ | `wallet.service.requestWithdraw` — langsung `processed` |
| Dispute | via WA admin | via WA admin | Tidak ada sistem dispute in-app (`60_Dispute.md`) — deep-link `ADMIN_WHATSAPP_NUMBER` |

Aturan tampilan terkait:

- **Campaign Mode = zero chat.** Tidak ada komponen chat/kontak di Job Pool, detail campaign, dan pekerjaan aktif berbasis campaign. Chat hanya di jalur Rate Card/Negosiasi.
- Bukti tayang = **URL TikTok** (`https`, pola platform valid) — bukan upload video ke Marketiv; aset besar via URL eksternal.
- CTA disabled harus menjelaskan alasannya (kuota penuh, profil belum lengkap, saldo kurang).

---

## 6. Urutan Integrasi Lintas-Fitur yang Aman

Kerjakan berfase; tiap fase punya definisi selesai (§7). Jangan lompat ke fase berikut sebelum fase sebelumnya hijau.

**Fase 0 — Fondasi bersama** (§3): auth+guard, env, kanon tipe, method backend yang hilang, `loading.tsx`. *Output: login sebagai UMKM dan Kreator masing-masing mendarat di dashboard yang benar, masih data mock.*

**Fase 1 — Read-only per dashboard** (boleh paralel karena tidak saling menunggu):
- UMKM: Settings → Overview → Creators (hapus bypass `src/data/*`) → Campaign list/detail → Finance (read).
- Kreator: Profil → Rate Card (read) → Job Pool (read) → Pekerjaan Aktif (read) → Keuangan (read).
- Prinsip: read dulu, write belakangan — read tidak merusak data.

**Fase 2 — Write satu-sisi** (tidak butuh lawan role):
- UMKM: create/publish campaign + top-up (wizard → `createCampaign` → `createPayment` → webhook → `publishCampaign`; `ai-brief` menggantikan simulasi), update profil.
- Kreator: CRUD rate card, update profil, `requestWithdraw`.

**Fase 3 — Alur lintas-role** (butuh kedua dashboard live; ini alasan dokumen gabungan ini ada):
1. **Alur Campaign PPV** (`20_Campaign_PPV.md`): UMKM buat+top-up+publish → Kreator lihat di Job Pool → klaim → submit bukti → `ai-fraud-precheck` → UMKM review approve → `calculate-campaign-reward` → pendingBalance kreator bertambah → cek `expire-stale-claims`.
2. **Alur Rate Card Order** (`30_RateCard_Order.md`): UMKM browse kreator → chat → Custom Offer → Kreator accept → `create-order` → UMKM bayar → `create-escrow` → Kreator upload deliverable → UMKM approve → `release-escrow` (fee 5% seller-side) → saldo kreator bertambah → Kreator withdraw.
- Uji dua akun nyata (satu UMKM, satu Kreator) di project Appwrite yang sama; verifikasi saldo/escrow/status di kedua dashboard konsisten setelah tiap langkah.

**Fase 4 — Pengerasan**: realtime (chat, notifikasi badge — konfirmasi state final via read, bukan payload realtime), validasi Zod per modul, empty/error 401/403 eksplisit, konsolidasi primitive UI, matikan mock (`NEXT_PUBLIC_USE_MOCK_DATA=false` default di staging).

---

## 7. Definition of Done per Fase + Checklist Keamanan

Per fase, semua ini terpenuhi:

- [ ] Tidak ada komponen yang mengimport SDK Appwrite langsung (R1)
- [ ] Tidak ada data hardcoded/fabrikasi tersisa di modul yang di-wire (grep `mock|dummy|setTimeout` di modul terkait)
- [ ] Status di state/data hanya nilai kanon §4; label Indonesia hanya di presentasi
- [ ] Loading/error/empty nyata (bukan flag simulasi/timer)
- [ ] `ServiceResult.code` dipetakan ke perilaku UI; tidak ada parsing teks error
- [ ] Uji dengan `NEXT_PUBLIC_USE_MOCK_DATA=false` DAN `=true` (mock harus tetap jalan untuk dev)

Keamanan (setiap PR integrasi):

- [ ] Tidak ada API key/secret/`APPWRITE_API_KEY` di kode frontend atau `NEXT_PUBLIC_*`
- [ ] Tidak ada write langsung ke collection finansial/kuota/validasi dari client (R4)
- [ ] Permission dokumen saat `createDocument` mengikuti pola owner (`Permission.read/update(Role.user(userId))`; publik hanya untuk data discovery)
- [ ] Query list selalu difilter kepemilikan (`Query.equal('userId'|'umkmId'|'creatorId', session.userId)`) kecuali data publik (campaign active, rate card published, profil kreator)
- [ ] Role guard di layout tidak bisa dilewati dengan navigasi langsung URL

---

## 8. Pembagian Kepemilikan Kolaborasi UMKM ↔ Kreator

Modul yang datanya dibaca kedua role — perubahan shape/mapper harus dicek terhadap kedua dashboard:

| Data | Ditulis oleh | Dibaca oleh | Titik sensitif |
|---|---|---|---|
| `campaigns` | UMKM | Kreator (Job Pool), UMKM | counter `totalClaims/remainingBudget` hanya via Function |
| `campaign_claims` | Kreator (via Function) | keduanya | uniqueness `campaignId+creatorId`, expiry 6 jam-an |
| `campaign_submissions` | Kreator | UMKM (review) | `fraudStatus` & routing otomatis; UMKM hanya memutuskan sisa `pending` |
| `offers` | UMKM (create) / Kreator (accept-reject) | keduanya | accept memicu `create-order` — jangan double-trigger dari UI |
| `orders`+`deliverables`+`revisions` | keduanya (peran berbeda) | keduanya | `approveDeliverable` tidak mengubah status order — `release-escrow` yang menuntaskan; UI jangan optimistis menandai `completed` |
| `conversations`+`messages` | keduanya | keduanya | snake_case; participant-only; `last_message` denormalized |
| `wallets`/`transactions`/`escrows` | Functions saja | keduanya (read-only) | tampilan saldo vs pending harus konsisten dua sisi |

---

## 9. Catatan Drift & Peringatan

- **Skill vs kode** (kode menang): `RateCard.isActive/platform/contentType` (skill) vs `status draft|published` (kode); `DeliverableStatus` skill `pending_review|rejected` vs kode `submitted|revision_requested|approved`; `OfferStatus` skill `expired|countered` vs kode `pending|accepted|rejected`. Update skill setelah fase 1 agar tidak menyesatkan pekerjaan berikutnya.
- **Docs backend yang perlu dikonfirmasi**: komponen `AdminWithdrawReview` di `Payments/80_Frontend.md` vs aturan withdrawal direct; state `funded` di diagram PPV yang tidak ada di enum; Function `notify-client-review` dirujuk workflow tapi tidak ada.
- **`src/types/status.ts`** — hapus; klaimnya ("match Appwrite schema") salah, isinya dari spec deprecated.
- **Standar coding** `01_Global/20_Coding_Standards.md` menyebut Zustand (`src/stores/`) + Zod (`src/validations/`) + custom hooks — frontend saat ini belum memakai Zustand; keputusan adopsi state manager boleh ditunda, tapi Zod per modul wajib sebelum fase 2 (write).
- Frontend boleh menghitung nilai turunan tampilan (sisa kuota, progress), tapi **tidak pernah** menghitung payout/reward final — itu milik `calculate-campaign-reward`/`release-escrow`.
