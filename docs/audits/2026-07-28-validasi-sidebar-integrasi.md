# Validasi Ulang Integrasi Appwrite — Seluruh Item Sidebar

| | |
|---|---|
| **Tanggal** | 2026-07-28 |
| **Pemicu** | Rencana demo dengan 2 akun nyata (UMKM + Kreator) setelah Sprint 0–4 dinyatakan selesai |
| **Cakupan** | 6 item sidebar UMKM + 6 item sidebar Kreator, beserta sub-route-nya |
| **Metode** | Telusur route → komponen → facade service → cabang Appwrite → Function/collection |
| **Kesimpulan** | Sprint 0–4 **benar selesai di level penulisan kode**, tetapi **belum ada satu pun yang terverifikasi runtime**. Dengan `NEXT_PUBLIC_USE_MOCK_DATA=false`, **8 dari 12 route gagal** karena sebab struktural, bukan karena task Sprint 4 terlewat. |

> ## ⚠️ Status pengerjaan — diperbarui 2026-07-28 sore
>
> Dokumen ini merekam kondisi **sebelum** perbaikan. Seluruh temuan yang jadi
> wewenang frontend sudah dikerjakan hari yang sama:
>
> | Temuan | Task | Status |
> |---|---|---|
> | B2 — `getSession()` query `$id` | `s6-session-fix` | ✅ selesai |
> | B3 — 8 route Server Component | `s5-ssr-to-client` | ✅ selesai |
> | `getOverview()` tanpa cabang Appwrite | `s5-overview-dto` | ✅ selesai |
> | §3.1 dua panel sidebar hardcode | `s5-sidebar-fabrikasi` | ✅ selesai |
> | §3.2 halaman Notifikasi karangan | `s5-notifikasi-wire` | ✅ selesai |
> | §3.3 fallback `"Dapur Sehat Sukabumi"` | `s5-businessname-hardcode` | ✅ selesai |
> | §4 deploy Function & permission | `s5-deploy-alur-b` | 🚫 tim backend |
> | B1 — belum ada halaman auth | Sprint 6 | ⬜ berikutnya |
>
> Permintaan ke tim backend dikumpulkan di
> `00_BACKEND/integration-context/2026-07-28-handoff-auth-sprint6.md`.

---

## 0. Ringkasan 1 Menit

Yang tercatat "selesai" di tracker adalah **kode jalur Appwrite sudah ditulis untuk setiap fungsi service**. Itu memang benar dan bisa diverifikasi: `umkm-dashboard.service.ts` dan `creator-dashboard.service.ts` punya cabang `if (useMockData) … return …FromAppwrite()` untuk hampir setiap fungsi.

Yang **tidak** pernah diverifikasi adalah apakah jalur itu jalan. Seluruh Sprint 1–4 dikerjakan dengan `NEXT_PUBLIC_USE_MOCK_DATA=true` — header kedua file `*-appwrite.service.ts` sendiri menuliskannya sebagai "CATATAN JUJUR (belum bisa runtime-test)".

Tiga sebab struktural yang menghalangi demo 2 akun, dan tidak satu pun akan terlihat selama mock masih ON:

| # | Blocker | Dampak |
|---|---|---|
| **B1** | **Belum ada halaman login/register sama sekali.** `src/app/` tidak punya `/login`, `/register`, atau `/lupa-password`. Navbar landing menautkan langsung ke `/dashboard/umkm` dan `/dashboard/kreator`. | Tidak ada cara membuat atau memakai 2 akun. **Sprint 6 adalah prasyarat demo, bukan lanjutannya.** |
| **B2** | **`getSession()` tidak akan pernah menemukan profil.** `session.service.ts:90` mencari `Query.equal("$id", authUser.$id)`, sementara Function `create-user-profile` menulis dokumen dengan `ID.unique()` dan menyimpan id Auth di **kolom** `userId`. | Setiap login sukses tetap berakhir `not_found` → `RoleGuard` redirect ke `/` → seluruh dashboard tidak bisa dibuka. |
| **B3** | **8 route masih Server Component yang mengambil data.** Sesi Appwrite hidup di browser (Client SDK). Panggilan dari Server Component selalu 401 — pelajaran yang sudah didokumentasikan di `s3-ssr-session`, tapi baru diterapkan ke 4 route. | Overview UMKM, Analitik, Overview Kreator, Job Pool (+detail), Pekerjaan Aktif (+detail) gagal memuat. |

Ditambah satu lubang fungsional murni: **`getOverview()` tidak punya cabang Appwrite sama sekali** — ia mengembalikan `success: false` secara harfiah saat mock OFF (`umkm-dashboard.service.ts:104-109`), padahal Function `get-umkm-dashboard-summary` sudah ada di `00_BACKEND/functions/`.

---

## 1. Matriks Sidebar UMKM

| # | Item sidebar | Route | Jenis render | Facade service | Jalur Appwrite | Status demo |
|---|---|---|---|---|---|---|
| 1 | **Dashboard** | `/dashboard/umkm` | 🔴 Server Component | `getOverview()` + `getCampaigns()` | `getCampaigns` ✅ · **`getOverview` TIDAK ADA** | 🔴 **Gagal total** — halaman merender kotak error |
| 2 | **Campaign** | `/dashboard/umkm/campaign` | ✅ Client | `getCampaigns`, `updateCampaignStatus`, `duplicateCampaign`, `deleteCampaignDraft` | ✅ lengkap | 🟡 Jalan; `businessName` masih fallback hardcode `"Dapur Sehat Sukabumi"` |
| 2a | └ Detail campaign | `/campaign/[campaignId]` | ✅ Client | `getCampaignById`, `getCampaignSubmissions`, `reviewSubmission` | ✅ lengkap | ✅ |
| 2b | └ Buat campaign | `/campaign/buat` | ✅ Client | `createCampaignDraft` → `createCampaignPayment` → `publishCampaign` | ✅ lengkap | 🟡 `generateCampaignBrief` bergantung Function `ai-brief` yang belum lolos blocker API key |
| 3 | **Kreator** | `/dashboard/umkm/kreator` | ✅ Client | `getCreators` (Function `get-creator-directory`) | ✅ | ✅ |
| 3a | └ Detail kreator | `/kreator/[id]` | ✅ Client | `getCreatorById`, `getCreatorRateCards`, `createConversation`, `createOffer` | ✅ | ✅ |
| 4 | **Negosiasi** | `/dashboard/umkm/negosiasi` | ✅ Client | `getNegotiations` (Function `get-umkm-negotiations`) | ✅ kode ada | 🔴 Function-nya **baru** dan **belum di-deploy** (§B-2 handoff Alur B) |
| 4a | └ Ruang negosiasi | `/negosiasi/[id_conversation]` | 🟡 Server wrapper + Client room | Room ✅ Client. Wrapper `getUmkmProfile()` di server | ✅ room | 🟡 Nama usaha jatuh ke hardcode saat 401; isi ruang sendiri benar |
| 5 | **Keuangan** | `/dashboard/umkm/keuangan` | ✅ Client | `getFinanceOverview` (Function `get-umkm-finance-summary`), `getTransactions` | ✅ | ✅ |
| 6 | **Analitik** | `/dashboard/umkm/analitik` | 🔴 Server Component | `getUmkmProfile()` di server | Client-nya **nol integrasi** | ⬜ **Sengaja "Segera Hadir"** (`s1-analytics-soon`). `AnalitikClient.tsx` berisi 3 array hardcode (`VIEWS_DATA`, `TOP_CAMPAIGNS`, `KPI_CARDS`) di balik overlay |

---

## 2. Matriks Sidebar Kreator

| # | Item sidebar | Route | Jenis render | Facade service | Jalur Appwrite | Status demo |
|---|---|---|---|---|---|---|
| 1 | **Overview** | `/dashboard/kreator` | 🔴 Server Component (6 `await` paralel) | `getCreatorProfile`, `getCreatorMetrics`, `getCreatorActiveWorks`, `getCreatorNegotiations`, `getCreatorActivities`, `getCreatorJobs` | ✅ semua ada | 🔴 **401 → "Gagal Memuat Dashboard"** |
| 2 | **Job Pool** | `/job-pool` | 🔴 Server Component | `getCreatorJobs` | ✅ | 🔴 401 |
| 2a | └ Detail job | `/job-pool/[id]` | 🔴 Server Component | `getCreatorJobById` | ✅ | 🔴 401 (aksi `claimCampaign` sendiri di klien & benar) |
| 3 | **Pekerjaan Aktif** | `/pekerjaan-aktif` | 🔴 Server Component | `getCreatorActiveWorks` | ✅ | 🔴 401 |
| 3a | └ Detail pekerjaan | `/pekerjaan-aktif/[id]` | 🔴 Server Component | `getCreatorActiveWorkById` | ✅ | 🔴 401 pada baca; `submitProof` & `unclaimCampaign` di klien & benar |
| 4 | **Negosiasi** | `/negosiasi` | ✅ Client | `getCreatorNegotiations` (Function `get-creator-negotiations`) | ✅ | 🔴 Function **ditulis ulang**, kontrak berubah `{orderId}` → `{conversationId}`, **belum di-deploy** |
| 4a | └ Ruang negosiasi | `/negosiasi/[id_conversation]` | ✅ Client (sudah diperbaiki) | `getCreatorNegotiationById`, `acceptOffer`, `rejectOffer`, deliverable | ✅ | 🔴 sda — menunggu deploy |
| 5 | **Rate Card** | `/rate-card` | ✅ Client | CRUD lengkap + publish draft | ✅ | ✅ |
| 6 | **Keuangan** | `/keuangan` | ✅ Client | `getCreatorTransactions`, `requestWithdrawal` (Function `request-withdrawal`) | ✅ | ✅ |

---

## 3. Temuan Lintas-Halaman (terlihat di setiap layar demo)

### 3.1 🔴 Dua panel sidebar berisi data karangan

Bukan mock yang di-branch — array hardcode di dalam `useState`, tidak pernah tersentuh service apa pun:

- `DashboardSidebar.tsx:74-93` — panel "kreator aktif" berisi **Sulianto Indria Putra, Nadia Visuals, Budi Santoso** dengan foto Unsplash, semuanya di campaign "Rasa Nusantara Food Review".
- `CreatorDashboardSidebar.tsx:64-82` — panel "campaign aktif" berisi **Dapur Sehat Sukabumi** dan **Sambal Bu Rudi** dengan logo Unsplash.

Ini melekat di sidebar, jadi **tampil di setiap halaman** selama demo — termasuk di akun baru yang belum punya campaign apa pun.

### 3.2 🔴 Halaman Notifikasi 100% karangan (kedua role)

`src/components/features/shared/NotificationView.tsx:124-150` — `KREATOR_NOTIFS` (10 baris) dan `UMKM_NOTIFS` hardcode, lengkap dengan nominal rupiah dan nomor rekening `BCA ****4521`. Dipakai oleh `/dashboard/umkm/notifikasi` **dan** `/dashboard/kreator/notifikasi`.

Collection `notifications` sudah ada dan sudah ditulis oleh Function; sisi kreator bahkan sudah membacanya untuk widget "aktivitas" di Overview (`creator-appwrite.service.ts:634`). Hanya halaman notifikasinya yang tidak pernah disambungkan.

### 3.3 🟡 `businessName` fallback hardcode di 6 tempat

`"Dapur Sehat Sukabumi"` muncul sebagai nilai `||` fallback di `umkm/kreator/page.tsx:26`, `umkm/kreator/[id]/page.tsx:31`, `umkm/negosiasi/page.tsx:26`, `umkm/negosiasi/[id_conversation]/page.tsx:16`, `umkm/notifikasi/page.tsx:9`, dan `CampaignsPage.tsx:225`; plus `"Dapur Sehat"` di `HeroOverview.tsx:39`.

Saat demo dengan akun UMKM baru, kegagalan baca profil tidak tampak sebagai error — ia tampak sebagai **nama usaha orang lain**.

### 3.4 🟡 Tombol logout belum tersambung

Kedua sidebar punya `showLogoutModal`, tapi `logout()` dari `AuthProvider` belum dipanggil dari sana. Selama mock ON ini no-op, jadi tidak pernah ketahuan.

---

## 4. Dependensi Backend yang Masih Menggantung

Dari `00_BACKEND/integration-context/2026-07-28-sprint4-alur-b.md` §B — semuanya masih ⬜:

| Butuh | Yang terblokir |
|---|---|
| Deploy `get-umkm-negotiations` (baru) | Negosiasi UMKM |
| Deploy `get-creator-negotiations` (kontrak berubah) | Negosiasi Kreator |
| Deploy `notify-order-activity` (baru) | Notifikasi deliverable & revisi |
| Deploy `release-escrow` (fee 2%) | Angka di layar kreator ≠ saldo wallet |
| `harden-permissions.mjs` gelombang 3 & 4 | Kreator bisa approve deliverable-nya sendiri; bucket `user-files` terbaca semua user |
| Blocker `APPWRITE_FUNCTION_API_KEY` | `ai-brief` di wizard campaign |

**Demo 2 akun tidak bisa dijalankan sampai §B selesai** — separuh Alur B melewati Function-Function ini.

---

## 5. Jawaban atas Pertanyaan Awal

> "Apakah seluruh fitur di sidebar sudah terintegrasi dengan backend Appwrite?"

**Kode integrasinya: ya, hampir seluruhnya** — 1 lubang nyata (`getOverview`), sisanya lengkap.
**Terintegrasi dalam arti bisa dipakai: belum** — 8 dari 12 route gagal begitu mock dimatikan, dan tidak ada pintu masuk untuk login.

Sprint 4 tidak salah dinyatakan selesai; definisi "selesai"-nya memang penulisan kode, dan verifikasi runtime memang dijadwalkan di `s5-mock-off`. Yang perlu dikoreksi adalah **urutan rencana**: demo 2 akun tidak bisa terjadi sebelum Sprint 6.

### Urutan yang disarankan

```text
Sprint 5 (Hardening)  +  4 task baru di bawah
        ↓
Sprint 6 (Auth)       ← prasyarat demo, bukan lanjutannya
        ↓
Deploy §B backend
        ↓
Demo 2 akun  (= eksekusi E2E §E handoff Alur B)
```

### 4 task yang disarankan masuk Sprint 5

Non-auth, tapi memblokir demo. Belum saya masukkan ke tracker — menunggu keputusan.

| Key usulan | Isi |
|---|---|
| `s5-ssr-to-client` | Pindahkan 8 route Server Component ke klien (Overview UMKM, Analitik, Overview Kreator, Job Pool + detail, Pekerjaan Aktif + detail, wrapper ruang negosiasi UMKM) |
| `s5-overview-dto` | Sambungkan `getOverview()` ke Function `get-umkm-dashboard-summary` yang sudah ada |
| `s5-sidebar-fabrikasi` | Buang 2 panel hardcode di kedua sidebar — ganti data nyata atau empty state |
| `s5-notifikasi-wire` | Sambungkan `/notifikasi` kedua role ke collection `notifications` |

Sekalian: hapus 7 fallback `"Dapur Sehat Sukabumi"` supaya kegagalan baca profil tampil sebagai kegagalan, bukan sebagai identitas orang lain.
