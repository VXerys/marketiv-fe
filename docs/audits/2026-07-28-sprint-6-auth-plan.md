# Sprint 6 — Autentikasi

| | |
|---|---|
| **Tanggal** | 2026-07-28 |
| **Cakupan** | Register, Login, Google OAuth, Forgot/Reset Password, guard sesi, logout |
| **Sumber kebenaran** | `00_BACKEND/docs/02_Modules/Authentication/` (10–90) + `00_BACKEND/appwrite.config.json` |
| **Prasyarat** | Sprint 5 selesai. Sprint 6 **harus** selesai sebelum demo 2 akun — lihat `2026-07-28-validasi-sidebar-integrasi.md` §B1 |
| **Definisi selesai** | Dua akun nyata (1 UMKM, 1 Kreator) bisa didaftarkan lewat UI, login, dan membuka dashboard masing-masing dengan `NEXT_PUBLIC_USE_MOCK_DATA=false` |

---

## 0. Kondisi Awal

- `src/app/` **tidak punya** route auth apa pun. Navbar landing menautkan `Masuk Kreator` / `Masuk UMKM` langsung ke `/dashboard/*`.
- `AuthProvider` + `useAuth` + `RoleGuard` **sudah ada** dan benar (Sprint 0). Yang belum ada adalah tujuan redirect-nya.
- `session.service.ts` sudah punya `getSession()` dan `logout()`. **Belum ada** `register`, `login`, `forgotPassword`, `resetPassword`.
- Function `create-user-profile` dan `create-user-wallet` sudah ada di backend, keduanya terpasang di event `users.*.create`.

---

## A. Dua Cacat yang Harus Diperbaiki Duluan

Keduanya tidak akan terlihat sampai halaman login ada, dan keduanya membuat login yang "berhasil" tetap berakhir di layar kosong.

### A-1 🔴 `getSession()` mencari kunci yang salah

```ts
// src/services/auth/session.service.ts:87-91
databases.listDocuments(DB, "users", [
  Query.equal("$id", authUser.$id),   // ← tidak akan pernah cocok
  Query.limit(1),
])
```

`create-user-profile` menulis baris `users` dengan `ID.unique()` dan menaruh id Auth di **kolom** `userId`:

```js
// 00_BACKEND/functions/create-user-profile/src/main.js:84-96
databases.createDocument(db, usersCollectionId, ID.unique(), {
  userId, role, status: "active", email, phone, createdAt
}, [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]);
```

Fungsi pembantunya sendiri, `findByUserId()`, mencari `Query.equal("userId", userId)` — jadi sisi backend konsisten. Yang salah hanya sisi frontend.

**Akibat:** setiap login sukses tetap menghasilkan `code: "not_found"` → `RoleGuard` melihat `user == null` → `router.replace("/")`. Dashboard tidak pernah terbuka, dan pesannya ("Profil pengguna belum tersedia. Hubungi admin.") mengarahkan ke diagnosis yang salah.

**Perbaikan:** `Query.equal("userId", authUser.$id)`. Satu baris. Kolom `userId` sudah ada di `appwrite.config.json`.

### A-2 🔴 Event `users.*.create` menyala sebelum `prefs` ada

Ini kontradiksi antara dokumen dan konfigurasi, dan menentukan bentuk alur register.

`create-user-profile` mengambil role dari `user.role || user.prefs?.role || user.labels?.find(...)` lalu **menolak 400** kalau tidak ketemu, dan membaca `businessName`/`category`/`phone`/`displayName` dari `prefs` juga.

Tapi `prefs` baru bisa diisi lewat `account.updatePrefs()`, yang **butuh sesi aktif** — jadi urutannya pasti:

```text
account.create()                    → event users.*.create MENYALA di sini
account.createEmailPasswordSession()
account.updatePrefs({ role, ... })  → prefs baru ada di sini
```

Saat Function dieksekusi oleh event, `prefs` masih kosong → tidak ada role → **400, tidak ada baris `users`, tidak ada profil**. Hanya `create-user-wallet` yang berhasil, karena ia cuma butuh `$id`.

Dokumen `60_API.md` sudah menggambarkan maksud yang benar — "Profil dan storage usage dibuat **sinkron** oleh function `create-user-profile`" — hanya `appwrite.config.json` yang memasangnya sebagai event.

**Perbaikan yang dipilih: eksekusi sinkron dari klien setelah prefs terpasang.**

```text
account.create(ID.unique(), email, password, name)
account.createEmailPasswordSession(email, password)
account.updatePrefs({ role, businessName?, category?, phone?, displayName? })
executeFunction("create-user-profile", { $id, role, prefs })   ← ditunggu
refresh() AuthProvider → redirect ke dashboard sesuai role
```

Function-nya sudah idempoten (`ensureUserMirror`, `ensureUmkmProfile`, `ensureCreatorProfile`, `ensureStorageUsage` semuanya cek-dulu-baru-tulis), jadi trigger event boleh **tetap terpasang** sebagai jaring pengaman tanpa risiko duplikat.

**Yang perlu dari tim backend:** `execute` permission untuk role `users` pada `create-user-profile`, dan pastikan Function membaca `$id` dari body eksekusi manual — bukan hanya dari payload event. Ini masuk handoff, bukan dikerjakan sendiri (lihat memori `feedback_function_deploy_is_backend_team`).

---

## B. Daftar Task

| Key | Judul | Bergantung pada |
|---|---|---|
| `s6-session-fix` | Perbaiki `getSession()` — query `userId`, bukan `$id` | — |
| `s6-auth-service` | Buat `src/services/auth/auth.service.ts` — register/login/OAuth/recovery, pola `ServiceResult` + cabang mock | `s6-session-fix` |
| `s6-zod-auth` | Skema Zod `src/lib/validations/auth.schema.ts` — login, register UMKM, register Kreator, forgot, reset | — |
| `s6-route-group` | Route group `src/app/(auth)/` + layout + `loading.tsx`, redirect ke dashboard bila sudah punya sesi | — |
| `s6-login` | Halaman `/login` — email + password, "Login dengan Google", tautan lupa password, hormati `?next=` | `s6-auth-service`, `s6-zod-auth`, `s6-route-group` |
| `s6-register` | Halaman `/register` — form dinamis dari `?role=umkm\|creator`, plus alur sinkron §A-2 | sda |
| `s6-forgot` | Halaman `/lupa-password` — `createRecovery()` + layar konfirmasi "cek email" | sda |
| `s6-reset` | Halaman `/reset-password` — baca `userId` & `secret` dari query, `updateRecovery()` | `s6-forgot` |
| `s6-oauth-google` | `createOAuth2Session` + halaman callback; UMKM diarahkan melengkapi Nama Usaha/Kategori/No. HP, Kreator langsung masuk | `s6-register` |
| `s6-guard-redirect` | `RoleGuard` redirect ke `/login?next=<path>` (bukan `/`); hapus bypass mock supaya guard benar-benar teruji | `s6-login` |
| `s6-logout` | Sambungkan modal logout kedua sidebar ke `logout()` + redirect `/login` | `s6-login` |
| `s6-navbar-cta` | Navbar & landing: `Masuk` → `/login`, `Daftar UMKM` → `/register?role=umkm`, `Daftar Kreator` → `/register?role=creator` | `s6-login`, `s6-register` |
| `s6-status-suspended` | Tolak login akun `suspended` dengan pesan eksplisit, sejalan dengan cabang yang sudah ada di `RoleGuard` | `s6-auth-service` |
| `s6-backend-handoff` | Handoff ke tim backend: execute permission `create-user-profile`, verifikasi `users.*.create` tetap idempoten, konfigurasi OAuth Google + URL recovery per environment | `s6-register` |
| `s6-e2e-2akun` | E2E: daftar 1 UMKM + 1 Kreator dari nol dengan mock OFF, keduanya masuk dashboard yang benar, lalu jalankan §E handoff Alur B | semua |

---

## C. Keputusan Desain

### C-1 Role ditentukan lewat query string, bukan dropdown

`?role=umkm` / `?role=creator` sesuai `30_Business_Rules.md`. Landing punya dua CTA terpisah, jadi role sudah diketahui sebelum form dibuka. Tanpa query param yang valid, `/register` menampilkan pilihan role, bukan menebak.

### C-2 Halaman login tidak butuh role

Role sudah ada di `users`. `RoleGuard` yang mengarahkan ke dashboard yang benar setelah sesi terbaca — jalur ini sudah bekerja hari ini, tinggal dipakai.

### C-3 Field register mengikuti dokumen, tanpa penambahan

- **UMKM:** Nama Usaha, Kategori Usaha, Email, **Nomor HP (wajib)**, Password.
- **Kreator:** Nama Lengkap, Email, Password.

Nomor HP wajib untuk UMKM dan tidak untuk Kreator — itu aturan bisnis, bukan preferensi UI.

### C-4 Onboarding wizard tidak masuk Sprint 6

`40_User_Flow.md` menyebut "Lengkapi Profil (Onboarding Wizard)" setelah login pertama. Halaman pengaturan UMKM dan profil Kreator sudah bisa mengedit seluruh field itu sejak Sprint 3, dan `umkm_profiles.isProfileCompleted` sudah ditulis `false` oleh Function. Wizard-nya adalah pembungkus UX, bukan kapabilitas baru — dan menahannya berarti demo tidak perlu menunggunya.

### C-5 Mode mock tetap ada, tapi tidak lagi mem-bypass guard

`s6-guard-redirect` mencabut `if (bypass) return <>{children}</>`. Sesudahnya, mock ON berarti `getSession()` mengembalikan `MOCK_USERS.umkm` dan guard tetap dievaluasi. Dashboard Kreator jadi tidak terbuka di mode mock kecuali `getMockSessionUser` dipilih per-role — konsekuensi yang disengaja: guard yang tidak pernah dieksekusi adalah guard yang tidak pernah teruji, dan Sprint 6 adalah satu-satunya sprint yang benar-benar mengujinya.

### C-6 Google OAuth ikut, tapi belakangan

Terikat konfigurasi OAuth provider di konsol Appwrite dan URL callback per environment — keduanya wewenang tim backend (`s6-backend-handoff`). Kalau konfigurasinya belum siap saat demo, tombol Google disembunyikan lewat flag dan **register manual sudah cukup** untuk membuat 2 akun.

---

## D. Yang Perlu Dikonfirmasi ke Tim Backend

1. **Execute permission** `create-user-profile` untuk role `users`, dan verifikasi Function menerima `$id` + `role` + `prefs` dari body eksekusi manual (§A-2).
2. **Trigger event `users.*.create` tetap dipertahankan?** Rekomendasi kami: ya, sebagai jaring pengaman — idempoten, jadi aman.
3. **Provider Google OAuth** + URL redirect success/failure per environment.
4. **URL recovery password** — `createRecovery()` butuh URL absolut yang terdaftar sebagai platform di project Appwrite.
5. **Welcome notification** — `90_Events.md` menugaskannya ke `create-user-wallet`, tapi `main.js` Function itu tidak menulis notifikasi apa pun. Dokumen atau implementasinya perlu disamakan.

---

## E. Verifikasi Sebelum Sprint Ditutup

1. `NEXT_PUBLIC_USE_MOCK_DATA=false`. Daftar UMKM baru dari `/register?role=umkm` → baris `users` (`role: umkm`, `status: active`), `umkm_profiles`, `wallets`, `user_storage_usage` semuanya terbentuk.
2. Daftar Kreator baru dari `/register?role=creator` → `creator_profiles` terbentuk, `umkm_profiles` **tidak**.
3. Logout, lalu login ulang keduanya → masing-masing mendarat di dashboard yang benar.
4. Login sebagai UMKM lalu buka `/dashboard/kreator` → diarahkan balik ke `/dashboard/umkm`.
5. Buka `/dashboard/umkm` tanpa sesi → `/login?next=/dashboard/umkm`; setelah login, mendarat di `/dashboard/umkm`, bukan di beranda.
6. Lupa password → email masuk → reset → login dengan password baru.
7. Set `users.status = "suspended"` lewat konsol → login ditolak dengan pesan penangguhan, bukan layar kosong.
8. Daftar dengan email yang sudah terpakai → pesan jelas, bukan error mentah Appwrite.
9. Register gagal di tengah (matikan jaringan setelah `account.create`) → akun tidak tertinggal tanpa profil, atau ada jalur pemulihan saat login berikutnya.
