# Prompt — Perbaikan Google OAuth Redirect ke Form/Login vs Onboarding

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong — urutan diagnosis, phase, dan constraint di dalamnya saling terkait.
>
> **Target repo:** root repo frontend + `00_BACKEND/` (Next.js frontend, Appwrite Auth, Appwrite Functions).
> **Tanggal:** 2026-08-07

---

## PERAN

Kamu adalah full-stack engineer senior di repo Marketiv. Tugasmu menganalisis dan memperbaiki bug Google OAuth:

- Kondisi A: user login/register via Google, pilih akun, lalu masuk ke `/onboarding`.
- Kondisi B: user login/register via Google, pilih akun, lalu kembali ke form login/register atau tidak masuk onboarding.

Kerjakan secara sistematis. Jangan menebak. Buktikan dulu komponen yang gagal: Google OAuth provider, Appwrite Auth session, Function `create-user-profile`, database mirror `users`, profil role, atau frontend redirect guard.

Aturan kerja repo berlaku. Baca dulu:

- `AGENTS.md`
- `00_BACKEND/AGENTS.md`
- `00_BACKEND/docs/02_Modules/Authentication/30_Business_Rules.md`
- `00_BACKEND/docs/02_Modules/Authentication/40_User_Flow.md`
- `00_BACKEND/docs/02_Modules/Authentication/60_API.md`
- `00_BACKEND/docs/02_Modules/Authentication/70_Backend.md`
- `00_BACKEND/docs/02_Modules/Authentication/90_Events.md`
- `00_BACKEND/docs/02_Modules/Users/50_Database.md`
- `00_BACKEND/docs/02_Modules/Users/70_Backend.md`

Semua jawaban/komentar kode boleh Bahasa Indonesia.

---

## AKSES CONSOLE APPWRITE — WAJIB VIA MCP

Semua interaksi dengan Appwrite Console dijalankan lewat MCP Appwrite. Jangan mengandalkan asumsi dari file repo saja.

1. Alur MCP: `appwrite_get_context` ambil `project_id` -> `appwrite_search_tools` cari tool -> `appwrite_call_tool` eksekusi.
2. SEBELUM implementasi, bandingkan kondisi LIVE console vs repo:
   - OAuth Google provider: enabled, Client ID/Secret tersimpan, redirect callback Appwrite benar.
   - Platform Web: domain frontend yang dipakai user terdaftar.
   - Function `create-user-profile`: enabled, deployment aktif, runtime, entrypoint, `execute`, events, scopes, env.
   - Database: collection `users`, `umkm_profiles`, `creator_profiles`, `user_storage_usage`; atribut `userId`, `role`, `status`, `isProfileCompleted`; index `userId`.
3. Drift yang menyentuh scope tugas ini wajib dilaporkan dan diperbaiki dalam phase terkait.
4. JANGAN menyatakan selesai sebelum validasi LIVE membuktikan kondisi Appwrite sesuai repo.

---

## KONTEKS SISTEM

Flow OAuth saat ini:

```text
Login/Register page
↓
GoogleButton
↓
startGoogleOAuth(role, next)
↓
account.createOAuth2Session({
  provider: Google,
  success: <origin>/auth/callback?role=<role>&next=<next>,
  failure: <origin>/login?error=oauth
})
↓
Appwrite Auth + Google
↓
/auth/callback
↓
OAuthCallback.refresh()
↓
getSession()
↓
account.get() + query collection users by userId
↓
route decision
```

File kunci:

- `src/components/features/auth/GoogleButton.tsx`
- `src/services/auth/auth.service.ts`
- `src/components/features/auth/OAuthCallback.tsx`
- `src/services/auth/session.service.ts`
- `src/components/providers/AuthProvider.tsx`
- `src/components/auth/RedirectIfAuthenticated.tsx`
- `src/components/auth/RoleGuard.tsx`
- `src/components/features/onboarding/OnboardingPage.tsx`
- `src/components/features/auth/OAuthUmkmDataForm.tsx`
- `src/lib/appwrite/functions.ts`
- `00_BACKEND/functions/create-user-profile/src/main.js`
- `00_BACKEND/appwrite.json`
- `00_BACKEND/appwrite/function-scopes.json`

Keputusan penting:

- Appwrite Auth session saja belum cukup dianggap login di UI.
- `getSession()` wajib menemukan dokumen mirror di collection `users`.
- Dokumen mirror `users` + profil role dibuat oleh Function `create-user-profile`.
- Google OAuth untuk UMKM butuh form tambahan `/auth/oauth-complete` sebelum provisioning.
- Google OAuth untuk Creator bisa langsung set prefs + provisioning.
- `isProfileCompleted=false` adalah kondisi normal setelah akun/profil terbentuk; user harus ke `/onboarding`.

---

## ANALISIS KEMUNGKINAN ROOT CAUSE

### 1. OAuth provider atau platform Appwrite salah

Gejala:

- User memilih akun Google lalu langsung ke `/login?error=oauth`.
- Callback `/auth/callback` tidak pernah terbuka.
- Network menunjukkan Appwrite OAuth failure URL.

Kemungkinan:

- `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true` di frontend, tapi provider Google belum enabled di Appwrite.
- Client ID/Secret Google salah atau expired.
- Domain frontend belum terdaftar sebagai Web Platform di Appwrite.
- Authorized redirect URI Google tidak cocok dengan callback Appwrite:

```text
<APPWRITE_ENDPOINT>/account/sessions/oauth2/callback/google/<PROJECT_ID>
```

Validasi:

- Jalankan audit provider via `00_BACKEND/appwrite/ops/audit-google-oauth.mjs` jika env/API key tersedia.
- Cek Appwrite Console via MCP.
- Cek browser Network: apakah redirect berakhir ke `failure=/login?error=oauth`.

### 2. Appwrite Auth session sukses, tapi dokumen `users` belum ada

Gejala:

- Setelah Google selesai, UI balik ke form login/register atau stuck di auth page.
- `account.get()` sukses, tapi `getSession()` return `code: "not_found"`.
- Appwrite Auth user ada di Console, tapi collection `users` tidak punya dokumen dengan `userId=<authUser.$id>`.

Kemungkinan:

- Function `create-user-profile` gagal dieksekusi dari browser karena `execute` tidak berisi `users`.
- Function deployment tidak aktif atau env kurang.
- Function punya scopes kurang: minimal `documents.read`, `documents.write`.
- Function event `users.*.create` berjalan terlalu awal saat `prefs.role` belum ada lalu 400; ini normal, tapi eksekusi sinkron setelah `updatePrefs` harus sukses.
- Query index `users.userId` tidak ada atau rusak.

Validasi:

- Login Google pakai akun baru.
- Di callback, cek hasil `account.get()`.
- Cek collection `users` by `userId`.
- Cek execution log `create-user-profile`.
- Cek error frontend pada `functions.createExecution("create-user-profile")`.

### 3. Role tidak terbawa ke callback

Gejala:

- OAuth berhasil, tapi callback redirect ke `/register`.
- `errorCode === "not_found"` dan `role` undefined di `/auth/callback`.

Kemungkinan:

- Tombol Google dipakai dari page tanpa `role`.
- Query `role` hilang saat build success URL.
- User membuka `/auth/callback` manual atau dari URL lama.

Validasi:

- Pastikan URL Google OAuth start membawa success URL berisi `role=umkm` atau `role=creator`.
- Cek `LoginForm` mengirim `activeRole` ke `GoogleButton`.
- Cek `RegisterCreatorForm` dan `RegisterUmkmForm` mengirim role eksplisit.

### 4. Race condition di `OAuthCallback` / `AuthProvider`

Gejala:

- Kadang sukses, kadang balik form untuk akun/proses sama.
- Callback mengambil state `errorCode` lama atau `loading` berubah saat `refresh()` masih berjalan.

Kemungkinan:

- `AuthProvider` initial fetch dan `OAuthCallback.refresh()` berjalan berdekatan.
- `OAuthCallback` bercabang dari state context yang belum pasti setelah refresh.
- `ranRef` mencegah retry walau first refresh kena timing sebelum cookie/session Appwrite siap.

Validasi:

- Tambahkan diagnostic sementara di dev untuk urutan:
  - callback mounted
  - refresh start/end
  - `account.get()` result
  - `getSession()` result
  - route decision
- Reproduksi 5 kali dengan akun baru dan akun lama.

### 5. Provisioning Creator gagal setelah `setOAuthAccountPrefs("creator")`

Gejala:

- Creator via Google masuk callback, lalu redirect ke `/register`.
- Appwrite Auth user punya `prefs.role=creator`, tapi dokumen `users`/`creator_profiles` belum ada.

Kemungkinan:

- `setOAuthAccountPrefs` sukses, tapi `provisionUserProfile()` gagal.
- Function `create-user-profile` 401/403/500.
- Function env `APPWRITE_DATABASE_ID`, endpoint, project, API key hilang.

Validasi:

- Cek Appwrite user prefs.
- Cek Function execution response.
- Cek stderr Function.

### 6. UMKM OAuth masuk form tambahan, tapi gagal lanjut onboarding

Gejala:

- Setelah Google, user diarahkan ke `/auth/oauth-complete`.
- Submit data tambahan gagal atau balik login/register.

Kemungkinan:

- `setOAuthAccountPrefs("umkm", data)` gagal karena session hilang.
- `provisionUserProfile()` gagal.
- Field `phone`/`category` tidak sesuai schema.

Validasi:

- Cek banner error di `OAuthUmkmDataForm`.
- Cek user prefs setelah submit.
- Cek Function execution log.

### 7. User lama tanpa mirror/profile karena data legacy

Gejala:

- Akun Google lama bisa login Auth, tapi selalu balik form.
- User Auth dibuat dari Console atau flow lama sebelum provisioning aktif.

Kemungkinan:

- Tidak ada dokumen `users`.
- Tidak ada dokumen `umkm_profiles`/`creator_profiles`.
- Role hanya ada di `prefs`, bukan di mirror.

Validasi:

- Query collection `users` by Auth `$id`.
- Cek Appwrite Auth prefs/labels.
- Jalankan retry provisioning dari UI atau Function manual dengan payload benar.

---

## REKOMENDASI SOLUSI

Solusi harus dibuat bertahap, dengan diagnosis dulu.

1. Pastikan Appwrite live benar:
   - Google OAuth provider enabled.
   - Platform Web domain benar.
   - `create-user-profile` punya `execute: ["users"]`, scopes `documents.read/write`, env lengkap, deployment aktif.
2. Tambahkan jalur recovery frontend untuk kondisi `account.get()` sukses tapi `users` belum ada:
   - Jangan langsung tampilkan form login/register sebagai fallback diam-diam.
   - Tampilkan state "profil sedang dibuat" + retry provisioning.
   - Untuk Creator dengan `role=creator`, retry `setOAuthAccountPrefs` + `provisionUserProfile`.
   - Untuk UMKM dengan `role=umkm`, arahkan ke `/auth/oauth-complete`.
3. Buat helper session/provisioning yang eksplisit:
   - Bedakan `auth_missing` vs `profile_missing`.
   - Jangan membuat `not_found` terlihat seperti user belum login.
4. Tambahkan test untuk semua cabang OAuth:
   - OAuth success + user mirror ada.
   - OAuth success + mirror belum ada + role creator.
   - OAuth success + mirror belum ada + role umkm.
   - OAuth failure.
   - Legacy Auth user tanpa mirror.
5. Update docs auth agar alur Google OAuth sesuai implementasi.

---

## PHASE 0 — Diagnosis Live + Reproduksi

Kerjakan dulu. Jangan ubah kode sebelum phase ini selesai.

### 1. Cek env frontend

File:

- `.env.local` atau env deployment
- `.env.example`
- `src/config/auth.config.ts`
- `src/lib/appwrite/config.ts`

Cek:

```text
NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true
NEXT_PUBLIC_APPWRITE_ENDPOINT=<endpoint benar>
NEXT_PUBLIC_APPWRITE_PROJECT_ID=<project benar>
NEXT_PUBLIC_APPWRITE_DATABASE_ID=<database benar>
```

### 2. Cek Appwrite OAuth

Via MCP Appwrite, validasi:

- Google OAuth provider enabled.
- Web platform memuat origin frontend aktif, contoh `http://localhost:3000` atau domain staging/prod.
- Google Cloud Authorized redirect URI cocok dengan:

```text
<APPWRITE_ENDPOINT>/account/sessions/oauth2/callback/google/<PROJECT_ID>
```

### 3. Cek Function `create-user-profile`

Via MCP Appwrite, validasi LIVE:

```json
{
  "functionId": "create-user-profile",
  "enabled": true,
  "execute": ["users"],
  "events": ["users.*.create"],
  "scopes": ["documents.read", "documents.write"],
  "runtime": "node-22",
  "entrypoint": "src/main.js"
}
```

Env wajib:

```text
APPWRITE_FUNCTION_API_ENDPOINT atau APPWRITE_ENDPOINT
APPWRITE_FUNCTION_PROJECT_ID atau APPWRITE_PROJECT_ID
APPWRITE_API_KEY
APPWRITE_DATABASE_ID
```

### 4. Reproduksi manual terukur

Jalankan app lokal:

```bash
npm run dev
```

Skenario:

1. Login Google akun lama yang sudah pernah onboarding.
2. Login Google akun lama yang belum lengkap profilnya.
3. Register/Login Google akun Creator baru.
4. Register/Login Google akun UMKM baru.
5. Klik Google dari login role UMKM dan role Creator.

Untuk setiap skenario catat:

```text
URL awal:
URL setelah Google:
URL final:
account.get(): sukses/gagal
getSession(): success/code
users document exists: yes/no
profile document exists: yes/no
create-user-profile execution status:
browser console error:
```

Lapor hasil Phase 0 sebelum implementasi.

---

## PHASE 1 — Perbaiki Appwrite Config Jika Drift

Kerjakan hanya bila Phase 0 membuktikan config live salah.

### 1. Sinkronkan repo dan console

File:

- `00_BACKEND/appwrite.json`
- `00_BACKEND/appwrite/function-scopes.json`
- `00_BACKEND/appwrite/generate_appwrite_json.cjs` jika generator menjadi sumber config function.

Pastikan `create-user-profile`:

```json
{
  "$id": "create-user-profile",
  "execute": ["users"],
  "events": ["users.*.create"],
  "scopes": ["documents.read", "documents.write"]
}
```

### 2. Deploy/aktifkan Function

Via MCP Appwrite:

- Update execute permission ke `users`.
- Set env yang hilang.
- Pastikan deployment aktif.
- Jangan ubah function lain di luar scope.

### 3. Validasi Phase 1

Uji manual:

1. Jalankan Google OAuth Creator baru.
2. Pastikan Function execution sinkron sukses.
3. Pastikan dokumen muncul:

```text
users.userId = <authUser.$id>
creator_profiles.userId = <authUser.$id>
user_storage_usage.userId = <authUser.$id>
```

Expected:

- Final URL `/onboarding`.
- `getSession().success === true`.
- `isProfileCompleted === false`.

Berhenti dan lapor kalau Phase 1 saja sudah menyelesaikan bug.

---

## PHASE 2 — Perbaiki Frontend OAuth Recovery

Kerjakan bila Phase 0/1 menunjukkan Appwrite benar, tapi UI masih bisa balik form tanpa pesan jelas.

### 1. Tambah state eksplisit untuk OAuth callback

File:

- `src/components/features/auth/OAuthCallback.tsx`
- `src/services/auth/auth.service.ts`
- `src/services/auth/session.service.ts` jika perlu tipe/hasil khusus.

Tujuan:

- `not_found` setelah OAuth jangan langsung dianggap gagal login.
- Callback harus mencoba recovery sesuai role:
  - `role=creator`: set prefs creator -> provision -> refresh -> onboarding.
  - `role=umkm`: redirect `/auth/oauth-complete?role=umkm`.
  - role kosong: tampilkan pilihan role atau redirect register dengan pesan eksplisit.

Perilaku target:

```text
OAuth Auth session sukses + users missing + role=creator
↓
setOAuthAccountPrefs("creator")
↓
provisionUserProfile()
↓
refresh()
↓
/onboarding
```

```text
OAuth Auth session sukses + users missing + role=umkm
↓
/auth/oauth-complete?role=umkm
↓
submit businessName/category/phone
↓
setOAuthAccountPrefs("umkm", data)
↓
provisionUserProfile()
↓
refresh()
↓
/onboarding
```

### 2. Tambah error UX yang tidak menyesatkan

File:

- `src/components/features/auth/OAuthCallback.tsx`
- `src/components/features/auth/OAuthUmkmDataForm.tsx`
- Opsional: `src/components/features/auth/ProfileProvisionNotice.tsx`

Target:

- Jika provisioning gagal karena 401/403/500, tampilkan pesan:

```text
Akun Google sudah terhubung, tetapi profil Marketiv belum bisa dibuat. Coba lagi atau hubungi admin.
```

- Jangan redirect diam-diam ke form login/register tanpa konteks.
- Beri tombol:
  - "Coba lagi buat profil"
  - "Keluar dan pakai akun lain"

### 3. Kurangi race callback

File:

- `src/components/features/auth/OAuthCallback.tsx`
- `src/components/providers/AuthProvider.tsx` bila perlu.

Target:

- Callback mengambil hasil `refresh()` yang baru, bukan state lama.
- Bila perlu buat fungsi service `resolveOAuthSession()` yang return hasil langsung:

```ts
type OAuthResolution =
  | { status: "ready"; user: SessionUser }
  | { status: "profile_missing" }
  | { status: "auth_missing"; error?: string }
  | { status: "error"; code: ServiceErrorCode; error?: string };
```

Constraint:

- Jangan memindahkan panggilan Appwrite SDK langsung ke component selain pola yang sudah ada.
- Tetap lewat service layer untuk `account`, `databases`, dan `functions`.

---

## PHASE 3 — Tests

### 1. Unit test auth service/session

File:

- `00_BACKEND/tests/unit/auth.service.test.ts` bila sudah mencakup frontend service auth.
- Jika test frontend belum ada, buat test paling kecil di lokasi test repo yang mengikuti pola existing.

Kasus wajib:

1. `getSession()` return `not_found` saat `account.get()` sukses tapi `users` kosong.
2. `provisionUserProfile()` map 401/403 ke error yang jelas.
3. `setOAuthAccountPrefs("creator")` menulis prefs role.

### 2. Component/flow test OAuth callback

Jika tooling component test tersedia, test:

1. `user` ada -> redirect `next || dashboardByRole[user.role]`.
2. `errorCode="not_found"` + `role="umkm"` -> redirect `/auth/oauth-complete?role=umkm`.
3. `errorCode="not_found"` + `role="creator"` + provision sukses -> redirect `/onboarding`.
4. `errorCode="not_found"` + `role="creator"` + provision gagal -> tampilkan recovery UI, bukan redirect diam-diam ke `/register`.
5. error selain `not_found` -> `/login?error=oauth`.

### 3. E2E smoke

File:

- `00_BACKEND/tests/e2e/critical-flows.spec.ts` atau test e2e yang sesuai.

Jika Google OAuth real sulit diotomasi, lakukan manual test terstruktur dari Phase 0 dan simpan hasil di laporan.

---

## PHASE 4 — Docs

Update docs setelah implementasi:

- `00_BACKEND/docs/02_Modules/Authentication/40_User_Flow.md`
- `00_BACKEND/docs/02_Modules/Authentication/60_API.md`
- `00_BACKEND/docs/02_Modules/Authentication/90_Events.md`
- `00_BACKEND/docs/02_Modules/Users/70_Backend.md` bila behavior `create-user-profile` berubah.

Docs harus menjelaskan:

- OAuth Auth session sukses belum berarti Marketiv session siap.
- Mirror `users` wajib ada.
- `not_found` berarti profile provisioning belum selesai, bukan credential salah.
- Recovery flow untuk akun legacy/tanpa mirror.

---

## CONSTRAINT — JANGAN LAKUKAN INI

- JANGAN menghapus kewajiban dokumen `users`; role/status tetap sumber dari collection itu.
- JANGAN menganggap `account.get()` saja cukup untuk masuk dashboard.
- JANGAN menulis role hanya di localStorage/sessionStorage untuk user real.
- JANGAN bypass `RoleGuard`.
- JANGAN membuat user langsung dashboard jika `isProfileCompleted=false`.
- JANGAN mengubah schema besar di luar auth/users.
- JANGAN menyimpan Google token di frontend.
- JANGAN membuat Appwrite API key masuk `NEXT_PUBLIC_*`.
- JANGAN lanjut implementasi sebelum Phase 0 menghasilkan bukti.
- JANGAN menyatakan bug selesai tanpa reproduksi manual minimal Creator baru + UMKM baru.

---

## VERIFIKASI

Wajib:

```bash
npm run lint
npm test
```

Jika test repo terpisah:

```bash
cd 00_BACKEND
npm test
npm run test:integration
```

Manual verification:

```text
Creator Google OAuth baru:
- Google pilih akun
- final /onboarding
- users row exists
- creator_profiles row exists
- isProfileCompleted=false

UMKM Google OAuth baru:
- Google pilih akun
- final /auth/oauth-complete
- submit data tambahan
- final /onboarding
- users row exists
- umkm_profiles row exists
- isProfileCompleted=false

OAuth failure:
- provider/domain salah di test env atau simulated failure
- final /login?error=oauth
- tidak ada loop dashboard-login

Legacy Auth user tanpa users mirror:
- tampil recovery atau provisioning retry
- tidak redirect diam-diam ke form tanpa pesan
```

---

## LAPORAN (format output)

Setelah Phase 0:

1. Tabel hasil reproduksi per skenario.
2. Bukti Appwrite live: OAuth provider, platform, Function `create-user-profile`, env, database.
3. Kesimpulan root cause paling mungkin.
4. Rekomendasi phase mana yang perlu dikerjakan.

Setelah implementasi:

1. File berubah + ringkasan behavior.
2. Bukti Function/Console Appwrite live sinkron repo.
3. Hasil test command, tempel output ringkas.
4. Hasil manual verification Creator baru + UMKM baru.
5. Risiko tersisa.

---

## DEFINISI SELESAI

- [ ] Root cause terbukti, bukan asumsi.
- [ ] Google OAuth provider/platform valid di Appwrite live.
- [ ] `create-user-profile` bisa dieksekusi user login dan punya env/scopes benar.
- [ ] OAuth Creator baru selalu berakhir `/onboarding` setelah profil dibuat.
- [ ] OAuth UMKM baru selalu berakhir `/auth/oauth-complete`, lalu `/onboarding` setelah submit.
- [ ] Akun lama tanpa mirror punya recovery jelas, bukan balik form diam-diam.
- [ ] Tidak ada loop login-dashboard-onboarding.
- [ ] Test otomatis relevan hijau atau manual test dicatat bila OAuth real tidak bisa diotomasi.
- [ ] Docs auth/users sinkron dengan behavior final.
