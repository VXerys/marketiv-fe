# Audit Kreator Dashboard — Kesiapan Integrasi Appwrite

Static audit date: 2026-07-19

Audit ini bersifat **documentation-only** — tidak ada refactor UI, perubahan logika bisnis, integrasi backend, atau perubahan route yang dilakukan. Dokumen ini terpisah dari audit UMKM Dashboard (`docs/audits/umkm-dashboard-appwrite-integration-readiness.md`).

Source of truth kontrak backend adalah `00_BACKEND` (kode `.ts` + docs modul). `docs/marketiv-md/` **tidak dipakai** sebagai acuan dalam audit ini.

```txt
00_BACKEND/src/services/*.ts
00_BACKEND/src/lib/appwrite/*
00_BACKEND/docs/02_Modules/{Campaigns,Offers,Orders,Payments,RateCards,Users,Authentication,Chat,Notifications,AI}/**
00_BACKEND/docs/03_Workflows/{20_Campaign_PPV,30_RateCard_Order,40_Submission_Fraud,50_Withdrawal,60_Dispute}.md
00_BACKEND/docs/01_Global/{20_Coding_Standards,60_Error_Handling}.md
.claude/skills/marketiv-data-contracts/SKILL.md
.claude/skills/marketiv-appwrite-integration/SKILL.md
```

Priority legend:

- P0 = memblokir integrasi backend / menyebabkan data salah
- P1 = inkonsistensi teknis yang harus dibereskan sebelum replace mock
- P2 = perlu dikerjakan selama proses integrasi per fitur
- P3 = polish / lanjutan setelah integrasi berjalan

---

## 1. Ringkasan Eksekutif

- **UI slicing Kreator Dashboard 100% selesai** untuk seluruh fitur (Overview, Profil/Settings, Rate Card, Negosiasi, Job Pool, Pekerjaan Aktif, Keuangan, Panduan, Notifikasi) — tidak ada layar stub/"coming soon". Semua render penuh dari mock.
- **Integrasi backend 0%.** `src/services/creator-dashboard.service.ts` (11 fungsi) selalu mengembalikan mock; branch non-mock mengembalikan `"Appwrite integration not implemented yet"`. Tidak ada `creator-appwrite.service.ts`. Wrapper SDK `src/lib/appwrite/*` ada tapi tidak dipakai satu query pun.
- **Blocker fondasi**: (a) tidak ada auth/session context atau role guard sama sekali — service fetch satu kreator hardcoded (`creator_002`); (b) `tsconfig.json:33` meng-`exclude` `00_BACKEND` sehingga tipe/service backend tidak bisa diimpor langsung; (c) tipe frontend `src/types/creator-dashboard.ts` memakai status Indonesia PascalCase (mis. `Escrow|Negosiasi|MenungguPembayaran|Selesai`) yang tidak match enum backend English lowercase.
- **Backend siap sebagian**: Profil, Job Pool (browse+claim), dan Keuangan tercakup penuh oleh `00_BACKEND/src/services/*.ts`; Rate Card, Negosiasi, dan Pekerjaan Aktif punya gap read method yang harus ditambah (`getMyClaims`, `getMyConversations`, read offers, `getRateCardById`/delete, `getDeliverables`).
- **Loading/error state semu**: skeleton dan error state secara struktural ada di hampir semua view, tapi di-gate flag dev-only `isLoadingSimulated`/`isErrorSimulated` yang hardcoded `false`; ditambah tidak adanya `loading.tsx` di route mana pun, state tersebut tidak akan pernah tampil pada fetch nyata.

---

## 2. Status Progress per Fitur

| Fitur | Status | File terkait (utama) |
|---|---|---|
| Overview / Home | UI selesai | `src/app/dashboard/kreator/page.tsx`; `creator-dashboard/CreatorDashboardView.tsx` (932 baris — hero, 8 KPI, quick actions, rekomendasi campaign, active works, timeline, modal Tarik Dana & Submit Bukti) |
| Profil | UI selesai — **duplikat orphan** | `profil/page.tsx` hanya `redirect()` ke settings; `ProfilView.tsx` (923) ter-export di barrel `index.ts:17` tapi tidak pernah dirender; yang hidup adalah `SettingsView.tsx` |
| Settings | UI selesai | `settings/page.tsx`; `SettingsView.tsx` (1439 — tab Profil/Portofolio/Notifikasi/Keamanan). Ganti password & upload avatar/banner masih toast "akan segera tersedia" (`SettingsView.tsx:946`, simulasi upload baris 417, 438) |
| Rate Card | UI selesai | `rate-card/page.tsx`; `RateCardView.tsx` (659 — 4 metric, katalog maks 3 paket, modal create/edit/delete, toggle aktif) |
| Negosiasi | UI selesai | `negosiasi/page.tsx` + `[id_order]/page.tsx`; `NegosiasiView.tsx`, `NegosiasiRoomView.tsx` (list + chat room lengkap) |
| Job Pool | UI selesai | `job-pool/page.tsx` + `[id]/page.tsx`; `JobPoolView.tsx`, `JobDetailView.tsx` (filter, grid, detail brief/materi, klaim dengan gating checkbox aturan) |
| Pekerjaan Aktif | UI selesai | `pekerjaan-aktif/page.tsx` + `[id]/page.tsx`; `PekerjaanAktifView.tsx`, `ActiveWorkDetailView.tsx` (list + detail + alur submit bukti) |
| Keuangan | UI selesai | `keuangan/page.tsx`; `KeuanganView.tsx` (~1050 — summary, tabel transaksi, modal detail) |
| Panduan | UI selesai (statis) | `panduan/page.tsx` (Rules/FAQ/Terms hardcoded in-file — acceptable) |
| Notifikasi | UI selesai (shared) | `notifikasi/page.tsx` → `features/shared/NotificationView` `theme="kreator"` |
| Chrome | UI selesai | `CreatorDashboardChrome/Sidebar/Topbar.tsx`, `layout.tsx`, `error.tsx` (top-level) |

Catatan route-level: tidak ada `loading.tsx` di satu pun route kreator; `error.tsx` hanya di level segment atas; tiap `page.tsx` juga punya fallback error inline teks merah (mis. `job-pool/page.tsx:7-14`).

---

## 3. Inventarisasi Mock Data

### 3a. Store mock terpusat — `src/mocks/creator-dashboard.mock.ts` (471 baris)

Dikonsumsi via `src/services/creator-dashboard.service.ts`; switch di `src/config/data-source.config.ts` (mock default ON saat `NEXT_PUBLIC_USE_MOCK_DATA` tidak diset); delay fake `src/lib/mock-delay.ts`.

| Dataset | Lokasi | Isi |
|---|---|---|
| `mockCreatorProfile` | baris 15–37 | 1 kreator "Nadia Visuals" |
| `mockCreatorPortfolioItems` | 39–60 | 2 item portofolio |
| `mockCreatorMetrics` | 62–76 | KPI/wallet statis (saldo 1,25 jt, escrow 600 rb) |
| `mockCreatorJobs` | 78–177 | 3 campaign job (brief/do-dont/audience lengkap) |
| `mockCreatorActiveWorks` | 179–249 | 4 klaim aktif (termasuk status Dispute/Fraud) |
| `mockCreatorSubmissions` | 251–264 | 1 submission |
| `mockCreatorNegotiations` | 266–344 | 4 thread negosiasi (Escrow/Negosiasi/MenungguPembayaran/Selesai) |
| `mockCreatorRateCardPackages` | 346–380 | 3 paket |
| `mockCreatorTransactions` | 382–436 | 5 transaksi |
| `mockCreatorActivities` | 438–470 | 4 item activity feed |

### 3b. Mock/fabrikasi inline di komponen

| File | Lokasi | Jenis data |
|---|---|---|
| `JobDetailView.tsx` | baris 46–90 (render 467–633) | `MOCK_BRIEF` — objek brief besar hardcoded (syarat/aturan/materialLinks/footageWajib), **tidak diderivasi dari prop `job`** |
| `ActiveWorkDetailView.tsx` | baris 170 (tampil 305, 594, 807) | `dummyViews = work.actualViews \|\| (isSubmitted ? 12500 : 0)` — views fabrikasi, dipakai untuk estimasi earnings |
| `ActiveWorkDetailView.tsx` | baris 330, 424 | URL asset hardcoded `https://drive.google.com/drive/folders/mock-assets` |
| `PekerjaanAktifView.tsx` | baris 123 (dipakai 126, 243) | `mockViews = work.actualViews ?? (hasSubmitted ? 12500 : 50000)` |
| `RateCardView.tsx` | baris 297–298 (render 453) | `mockOrdersCount = 14` untuk metric "Order Jasa Masuk" + fallback `mostPopularPkg` |
| `SettingsView.tsx` / `ProfilView.tsx` | `SettingsView.tsx:29,264`; `ProfilView.tsx:11,29` | import `mockCreatorPortfolioItems` langsung ke component state (bukan via props/service) |
| `SettingsView.tsx` | baris 895, 966 | email `kreator@example.com` & sesi "Chrome · Windows · Jakarta" hardcoded |
| `ProfilView.tsx` / `SettingsView.tsx` | `ProfilView.tsx:21-25`, `SettingsView.tsx:242-248` | URL gambar `unsplash.com` hardcoded sebagai fallback state |
| `panduan/page.tsx` | baris 22–119 | `RULES_DATA` (7) + `FAQ_DATA` (6) — acceptable, konten kebijakan statis |

### 3c. Flag simulasi (scaffolding demo)

`isLoadingSimulated`/`isEmptySimulated`/`isErrorSimulated` tersebar di `CreatorDashboardView`, `ProfilView`, `RateCardView`, `JobPoolView`, `NegosiasiView`, `JobDetailView`, `NegosiasiRoomView` — semuanya diinisialisasi `false` dan tidak pernah di-toggle data nyata (di `NegosiasiView.tsx:176-178` bahkan tanpa setter).

---

## 4. Audit Konsistensi Komponen

### 4a. Duplikat lokal vs primitive yang sudah ada

| Komponen kreator lokal | Duplikat dari | Catatan |
|---|---|---|
| `CreatorEmptyState.tsx` | `DashboardStateCard kind="empty"` / `ui/empty-state.tsx` | |
| `CreatorErrorState.tsx` | `DashboardStateCard kind="error"` | |
| `CreatorSkeleton.tsx` (`CreatorMetricSkeleton`/`CardSkeleton`/`ListSkeleton`) | `ui/skeleton.tsx` | |
| `CreatorStatusBadge.tsx` | `DashboardBadge` | map status→warna sendiri (baris 22–94) |
| `CreatorMetricCard.tsx` | `DashboardMetricCard` | hampir tak terpakai (hanya `ProfilView.tsx:7` — yang orphan) |

### 4b. Inkonsistensi internal kreator

- **Tiga implementasi metric card** hidup berdampingan: `CreatorMetricCard.tsx`, `MetricTile` inline (`CreatorDashboardView.tsx:89-116`), `MetricInfoCard` inline (`RateCardView.tsx:25-55`).
- **Modal campur**: `CreatorDashboardView`/`JobDetailView`/`ActiveWorkDetailView` pakai `DashboardModal`; `RateCardView` (501+), `ProfilView` (625+), `SettingsView` hand-roll `fixed inset-0`.
- `SettingsView.tsx` mendefinisikan primitives lokal sendiri: `CreatorBtn`, `GhostBtn`, `ToggleSwitch`, `SettingsCard`, `CardSectionHeader`, `StatRow`, `ModalFrame` (baris 49–226, 987).
- **Tema tidak ter-tokenisasi**: gradien biru→violet `#2563eb→#7c3aed` (`SettingsView.tsx:33`, `panduan/page.tsx:18`) vs orange `bg-primary`/`primary-600` di `RateCardView` vs violet `#7c3aed` di `CreatorDashboardView`/`JobPool`.

### 4c. Reuse yang sudah benar

`CreatorDashboardView` (import `DashboardBadge/Modal/Button/StateCard`, baris 42–46), `JobDetailView` (32–35), `ActiveWorkDetailView` (23), `PekerjaanAktifView` (10); Sidebar/Topbar memakai `ui/sidebar`. Arah konsolidasi mengikuti deprecation `dashboard/shared` → `components/ui/*`; tidak perlu primitive baru.

---

## 5. Gap Analysis Teknis

Legend: ✅ memadai · ⚠️ sebagian · ❌ tidak ada

- **Service/API layer**: ⚠️ Facade `creator-dashboard.service.ts` ada dan berpola `ServiceResult<T>` sesuai skill — tapi ❌ tidak ada `creator-appwrite.service.ts` (UMKM punya `umkm-appwrite.service.ts` sebagai pola stub ber-RBAC; kreator belum), dan ❌ tidak ada fungsi write (klaim, submit bukti, CRUD rate card, accept/reject offer, withdraw, update profil — semuanya simulasi lokal di view).
- **Types vs kontrak backend**: ❌ `src/types/creator-dashboard.ts` memakai status Indonesia PascalCase; backend memakai English lowercase (`claims: claimed|submitted|approved|rejected|expired`; `orders: pending_payment|escrow|in_progress|revision|approved|completed|cancelled`; `offers: pending|accepted|rejected`; `submissions: pending|approved|rejected` + `fraudStatus safe|review|rejected`; `rate_cards: draft|published`). Mapper + tipe kanon (skill `marketiv-data-contracts`) wajib sebelum integrasi.
- **Loading/error/empty**: ⚠️ Struktur ada di semua view tapi loading/error di-gate flag `*Simulated` hardcoded `false`; data di-fetch di server component lalu dikirim sebagai props sehingga skeleton klien tak pernah tampil; ❌ tidak ada `loading.tsx`. ✅ Empty state driven data nyata (`.length === 0` / `!data`) di hampir semua view.
- **Validasi input**: ❌ Belum ada skema Zod kreator (proof URL TikTok `https`, withdraw ≥ `MINIMUM_WITHDRAW` Rp50.000 & ≤ saldo, maks paket rate card); baru ada primitives `src/lib/validations/common.ts`.
- **Env/config Appwrite**: ⚠️ `src/lib/appwrite/{client,config,account,databases,storage,functions,realtime}.ts` sudah benar secara boundary (hanya `NEXT_PUBLIC_*`, tanpa API key) tapi belum dipakai; `NEXT_PUBLIC_APPWRITE_*` blank di `.env.example`; `NEXT_PUBLIC_USE_MOCK_DATA` tidak terdokumentasi padahal mengendalikan seluruh data source.
- **Role/permission**: ❌ Tidak ada AuthProvider/`useAuth`/`account.get()`/role guard di mana pun; RBAC per `30_Business_Rules.md` (kreator tidak bisa membuat campaign/offer; hanya accept/reject offer; klaim butuh `isProfileCompleted`; wallet read-only; mutasi finansial via Functions) belum ter-enforce.
- **Berbagi kode dengan backend**: ❌ `tsconfig.json:33` `exclude: ["00_BACKEND"]` — mekanisme berbagi tipe/service harus diputuskan (port ke `src/`), karena `00_BACKEND/src/services` didesain berjalan di browser dengan session user (`00_BACKEND/package.json` hanya depend `appwrite` client SDK).

---

## 6. Kesiapan Backend per Fitur

Catatan: file `.js` di `00_BACKEND/src/services/` adalah stub kosong; implementasi nyata di `.ts` (validasi + SDK call + typed error `*ServiceError {code,message,cause}` per `01_Global/60_Error_Handling.md` — service **throw**, bukan return envelope).

| Fitur Kreator | Service & doc terkait | Status kesiapan |
|---|---|---|
| Profil | `user.service.ts` — `getProfile(userId,'creator')`, `updateProfile` (whitelist `displayName/bio/city/avatarUrl/isProfileCompleted`), `addSocialAccount`, `removeSocialAccount`, `uploadFile`; docs `Users/**` | ✅ Siap |
| Rate Card | `creator.service.ts` — `createRateCard`, `updateRateCard` (replace-all packages), `getRateCards({creatorId})`; docs `RateCards/**` | ⚠️ `getRateCards` **published-only** — kreator tak bisa list draft miliknya; tidak ada `getRateCardById` & `deleteRateCard`. Model `status draft\|published` + `rate_card_packages` terpisah (bukan `isActive` seperti di skill — drift, kode menang) |
| Negosiasi | `chat.service.ts` — `createConversation` (idempotent), `sendMessage`, `getMessages`, `markConversationAsRead`; `offer.service.ts` — `acceptOffer` (creator-only, trigger Function `create-order`), `rejectOffer`; docs `Chat/**`, `Offers/**`, workflow `30_RateCard_Order.md` | ⚠️ Tulis ✅; **tidak ada `getMyConversations()`** (inbox) dan **tidak ada read offers** (hanya private `getOfferOrThrow`). Field chat snake_case (`conversation_id`, `sender_id`) |
| Job Pool | `campaign.service.ts` — `getCampaigns({status:'active'})`, `getCampaignById`; `claim.service.ts` — `claimCampaign` (validasi active + `isProfileCompleted` + expire stale + kuota + uniqueness + increment `totalClaims`); Function `campaign-claimed`, `expire-stale-claims`; workflow `20_Campaign_PPV.md` | ✅ Siap. UI perlu menghitung sendiri flag `sudah diklaim`/`bisa klaim` |
| Pekerjaan Aktif | `order.service.ts` — `getOrders`, `uploadDeliverable` (versioning, `storage\|external_url`); `submission.service.ts` — `createSubmission` (TikTok-only), `getMySubmissions`; Functions `ai-fraud-precheck`, `calculate-campaign-reward`; workflow `40_Submission_Fraud.md` | ⚠️ **Tidak ada `getMyClaims()`** — list klaim aktif campaign tak punya read method; tidak ada `getOrderById`, `getDeliverables(orderId)`, `getRevisions(orderId)` |
| Keuangan | `wallet.service.ts` — `getWallet`, `getBalance`, `getPendingBalance`, `getTransactions`, `getWithdrawals`, `requestWithdraw` (validasi saldo, min Rp50.000, langsung `processed` tanpa review admin, tulis `transactions`); konstanta `PLATFORM_FEE_RATE=0.05`; workflow `50_Withdrawal.md` | ✅ Siap. UI "Tarik Dana" harus mengikuti perilaku direct-processed |
| Overview | agregasi `getWallet` + `getOrders` + `getMySubmissions` + `getCampaigns` | ⚠️ Tidak ada aggregate summary — dirakit dari beberapa call |
| Notifikasi | `notification.service.ts` — `getNotifications`, `markAsRead`, `markAllAsRead`; docs `Notifications/**` | ✅ Siap |

Method backend yang harus **ditambah** sebelum kreator dashboard penuh: `getMyClaims()`, `getMyConversations()`, `getOffers()/getOfferById()`, `getRateCardById()`/list-own-drafts/`deleteRateCard()`, `getOrderById()`, `getDeliverables(orderId)`, `getRevisions(orderId)`.

---

## 7. Rencana Kerja Bertahap Sebelum Integrasi Appwrite

1. **(P0) Tetapkan mekanisme berbagi tipe & service dengan `00_BACKEND`** (`tsconfig.json:33` exclude) — rekomendasi: port tipe domain resmi (skill `marketiv-data-contracts`) ke `src/types/`, tulis query frontend di `src/services/creator/creator-appwrite.service.ts` mengikuti pola skill `marketiv-appwrite-integration` (mapper `$id→id`, `Query`, permission).
2. **(P0) Bangun auth/session context**: login → `account.get()` → role check via `COLLECTIONS.users` → guard `creator` di `layout.tsx` boundary; isi `NEXT_PUBLIC_APPWRITE_*` di `.env`; dokumentasikan `NEXT_PUBLIC_USE_MOCK_DATA` di `.env.example`.
3. **(P0) Tambah method backend yang hilang** di `00_BACKEND/src/services/` (daftar §6).
4. **(P1) Selaraskan `src/types/creator-dashboard.ts`** ke tipe domain resmi: status enum English lowercase di data layer, label Indonesia hanya di presentasi (map status→label untuk badge/filter).
5. **(P1) Implement `creator-appwrite.service.ts`** untuk 11 fungsi facade yang ada + fungsi write baru (klaim, submit bukti, CRUD rate card, accept/reject offer, `requestWithdraw`, `updateProfile`) — `ServiceResult<T>` dengan propagasi `code` dari `*ServiceError` (facade wajib try/catch karena service backend throw).
6. **(P1) Perbaiki state handling**: tambah `loading.tsx` per route, ganti flag `*Simulated` dengan state fetch nyata, konsolidasi `Creator*` duplicates ke `dashboard/shared`/`components/ui`.
7. **(P1) Hapus mock inline komponen** (`MOCK_BRIEF`, `dummyViews`, `mockViews`, `mockOrdersCount`, import mock ke state) — semua data lewat service layer; resolusi `ProfilView` vs `SettingsView` (hapus/merge orphan).
8. **(P2) Replace mock per fitur**, urutan risiko rendah→tinggi: Profil → Rate Card → Job Pool → Pekerjaan Aktif → Negosiasi → Keuangan.
9. **(P2) Validasi input** di `src/lib/validations/` selaras validasi backend: proof URL TikTok `https`, withdraw ≥ Rp50.000 & ≤ saldo, batas paket rate card.
10. **(P3) Testing** per fitur + smoke test `NEXT_PUBLIC_USE_MOCK_DATA=false`; uji alur lintas-role bersama UMKM (lihat `docs/audits/umkm-kreator-integration-design-and-rules.md`).

---

## 8. Risiko & Catatan Tambahan

- **`docs/marketiv-md` deprecated untuk kontrak** — mock kreator saat ini justru ditulis mengikuti gaya spec lama itu (status Indonesia PascalCase, `KreatorDashboardSummaryDTO`, dsb.), sehingga remap ke tipe backend adalah pekerjaan nyata, bukan sekadar rename.
- **Drift skill vs kode backend** (kode `.ts` menang): skill `marketiv-data-contracts` menulis `RateCard.isActive/platform/contentType` — kode memakai `status draft|published` tanpa field itu; `DeliverableStatus` di skill punya `pending_review|rejected`, kode `submitted|revision_requested|approved`; `OfferStatus` skill punya `expired|countered`, kode hanya `pending|accepted|rejected`. Pertimbangkan update skill setelah integrasi.
- **Casing field campur di backend** (camelCase di campaign/order/creator/claim/submission/wallet vs snake_case di chat/payment/offer-conversation) — konfirmasi ke `00_BACKEND/appwrite.config.json` per collection saat menulis mapper.
- **Withdraw langsung `processed`** tanpa review admin — UI Keuangan tidak boleh menampilkan status "menunggu persetujuan".
- **`.js` stubs menyesatkan** di `00_BACKEND/src/services/` — pastikan import resolve ke `.ts`.
- **Error contract**: service backend **throw** `*ServiceError {code,message,cause}` dan mengembalikan objek domain langsung (tanpa envelope `{success}`) — facade frontend yang bertugas membungkus jadi `ServiceResult<T>`.
- `submissionDays`, kuota klaim, dan reward per 1.000 views dihitung backend (`calculate-campaign-reward`); UI hanya menampilkan — `dummyViews`/estimasi earnings fabrikasi di UI harus diganti data `views` submission nyata.
- Fitur upload avatar/banner/portofolio saat ini simulasi toast; jalur resminya Function `validate-and-upload` + `user.service.uploadFile` (perhatikan aturan: bukti tayang berupa URL TikTok, bukan upload video).

---

## 9. Lampiran — Daftar File yang Diaudit

### Routes kreator
- `src/app/dashboard/kreator/{page,layout,error}.tsx`
- `src/app/dashboard/kreator/{job-pool,job-pool/[id],negosiasi,negosiasi/[id_order],pekerjaan-aktif,pekerjaan-aktif/[id],keuangan,rate-card,settings,profil,panduan,notifikasi}/page.tsx`

### Komponen fitur
- `src/components/features/creator-dashboard/**` — `CreatorDashboardView.tsx`, `ProfilView.tsx`, `SettingsView.tsx`, `RateCardView.tsx`, `NegosiasiView.tsx`, `NegosiasiRoomView.tsx`, `JobPoolView.tsx`, `JobDetailView.tsx`, `PekerjaanAktifView.tsx`, `ActiveWorkDetailView.tsx`, `KeuanganView.tsx`, `CreatorDashboardChrome/Sidebar/Topbar.tsx`, `CreatorPageHeader.tsx`, `CreatorActionCard.tsx`, `CreatorFilterToolbar.tsx`, `CreatorEmptyState.tsx`, `CreatorErrorState.tsx`, `CreatorSkeleton.tsx`, `CreatorStatusBadge.tsx`, `CreatorMetricCard.tsx`, `index.ts`
- `src/components/features/dashboard/shared/**`, `src/components/ui/**` (pembanding primitive)
- `src/components/features/umkm-dashboard/**` (pembanding pola, read-only; a.l. `creators/detail/RateCardPackageCard.tsx`, `RateCardPackagesSection.tsx`)

### Data layer frontend
- `src/services/creator-dashboard.service.ts`, `src/services/umkm/umkm-appwrite.service.ts` (pola referensi)
- `src/mocks/creator-dashboard.mock.ts`, `src/types/creator-dashboard.ts`, `src/types/api.ts`
- `src/lib/appwrite/**`, `src/lib/validations/common.ts`, `src/lib/mock-delay.ts`, `src/config/data-source.config.ts`
- `.env.example`, `tsconfig.json`

### Backend (source of truth)
- `00_BACKEND/src/services/{creator,campaign,claim,submission,offer,order,chat,wallet,payment,notification,user,auth}.service.ts`
- `00_BACKEND/src/lib/appwrite/{client,collections,index}.ts`, `00_BACKEND/appwrite.config.json`, `00_BACKEND/package.json`
- `00_BACKEND/functions/*` (16 function)
- `00_BACKEND/docs/02_Modules/**`, `docs/03_Workflows/**`, `docs/01_Global/**`
