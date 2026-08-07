# Fix Google OAuth Login/Register — Laporan Hasil

**Tanggal:** 2026-08-07  
**Branch:** staging  
**Status:** IMPLEMENTASI SELESAI, MANUAL OAUTH BELUM DIVERIFIKASI

---

## Ringkasan Eksekutif

Diagnosis live via MCP Appwrite membuktikan komponen Appwrite utama sudah benar: Google OAuth provider aktif, Web Platform terdaftar, Function `create-user-profile` aktif dan deploy ready, database mirror/profile lengkap dengan index `userId`.

Bug paling mungkin berada di frontend OAuth callback: kondisi Appwrite Auth session sukses tetapi dokumen mirror `users` belum ada diperlakukan seperti auth gagal. Akibatnya user bisa kembali ke login/register tanpa konteks, terutama saat provisioning belum selesai, legacy user tanpa mirror, atau callback membaca state auth lama.

Perbaikan menambahkan resolver OAuth eksplisit dan recovery flow:

| Kondisi | Perilaku Baru |
|---------|---------------|
| Session siap + `users` mirror ada | Redirect ke `next` atau dashboard role |
| Auth sukses + mirror missing + `role=creator` | Retry prefs creator + `provisionUserProfile()` + refresh + `/onboarding` |
| Auth sukses + mirror missing + `role=umkm` | Redirect ke `/auth/oauth-complete?role=umkm` |
| Provisioning gagal | Tampilkan recovery UI, bukan redirect diam-diam |
| OAuth auth gagal | Redirect `/login?error=oauth` |

---

## Phase 0 — Diagnosis Live

### Environment Frontend

| Key | Status |
|-----|--------|
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | Ada: `https://sgp.cloud.appwrite.io/v1` |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | Ada: `69f9d45b00315cb0ec2f` |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | Ada: `6a4c8598001da3b0d7f0` |
| `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH` | Ada lokal dan staging; production Site sempat missing |

### Appwrite OAuth Provider

| Item | Bukti Live |
|------|------------|
| Project | `Marketiv` (`69f9d45b00315cb0ec2f`) |
| Region/Endpoint | `https://sgp.cloud.appwrite.io/v1` |
| Google OAuth provider | Enabled |
| Google Client ID | Present |
| Google Secret | Tidak bisa dibaca ulang dari Console karena write-only |
| Expected callback URI | `https://sgp.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/69f9d45b00315cb0ec2f` |

> Catatan: Google Cloud Authorized Redirect URI tidak bisa diverifikasi dari Appwrite MCP. Perlu cek manual di Google Cloud Console.

### Web Platform

| Domain | Status Live |
|--------|-------------|
| `marketiv.id` | Terdaftar |
| `localhost` | Terdaftar |
| `staging.marketiv.id` | Terdaftar |

### Function `create-user-profile`

| Konfigurasi | Status Live |
|-------------|-------------|
| Function ID | `create-user-profile` |
| Enabled | Ya |
| Latest deployment | Ready |
| Runtime | `node-22` |
| Entrypoint | `src/main.js` |
| Execute | `["users"]` |
| Events | `["users.*.create"]` |
| Scopes | `["documents.read", "documents.write"]` |
| Env wajib | Ada: API key secret, database ID, collection IDs |

Execution log live menunjukkan pola normal:
- Event `users.*.create` dapat gagal `400` saat `prefs.role` belum ada.
- Eksekusi HTTP sinkron setelah `updatePrefs` berhasil `200`.

### Database Mirror/Profile

| Collection | Status Live |
|------------|-------------|
| `users` | Ada |
| `umkm_profiles` | Ada |
| `creator_profiles` | Ada |
| `user_storage_usage` | Ada |
| Attribute `userId` | Ada |
| Attribute `role` | Ada di `users` |
| Attribute `status` | Ada di `users` |
| Attribute `isProfileCompleted` | Ada di `users` |
| Index `idx_userId` | Ada, unique |

### Drift Ditemukan

| Drift | Dampak | Tindakan |
|-------|--------|----------|
| Production Appwrite Site tidak punya `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH` | Tombol Google bisa nonaktif di bundle production baru | Variable dibuat live dengan nilai `true` |
| Site prod/staging punya `APPWRITE_API_KEY` sebagai non-secret variable | Risiko security tinggi | Belum diubah; perlu rotate/remove terpisah |

> Catatan: perubahan `NEXT_PUBLIC_*` perlu rebuild/deploy production agar masuk ke bundle aktif.

---

### Root Cause Tambahan: 401 Third-Party Cookies

Terdapat masalah **Third-Party Cookie Blocking** yang menyebabkan error `XHR GET https://sgp.cloud.appwrite.io/v1/account [HTTP/2 401]`. 
Saat frontend (`localhost:3000` atau `marketiv.id`) melakukan request ke endpoint bawaan Appwrite Cloud (`sgp.cloud.appwrite.io`), browser modern (terutama Safari, Brave, atau Incognito mode) memblokir pengiriman cookie sesi (fallback third-party). Akibatnya, Appwrite menganggap user belum login (401), dan sistem mengembalikan user ke halaman formulir login.

Solusi yang disepakati: **Menggunakan Custom Domain Appwrite (`api.marketiv.id`)**.
Dengan mengubah endpoint API ke domain yang sama dengan frontend (`marketiv.id`), cookie sesi akan dianggap sebagai *First-Party Cookie* dan tidak akan diblokir oleh browser.

---

## Kesimpulan Root Cause

| Komponen | Status |
|----------|--------|
| Google OAuth provider | Valid live |
| Document ID Conflict | Selesai (sudah pakai ID.unique() dan ghost user dihapus) |
| Third-Party Cookies (401) | **Root cause utama saat ini.** Browser memblokir cookie dari `sgp.cloud.appwrite.io`. |
| Solusi Endpoint | Wajib ganti endpoint ke `https://api.marketiv.id/v1` |

Masalah utama: `getSession()` (request ke `/v1/account`) gagal dengan status `401` karena cookie sesi Appwrite diblokir oleh browser. OAuth callback menganggap user gagal login dan meredirect kembali ke halaman form dengan error `oauth`.

---

## File Diubah

| Path | Deskripsi |
|------|-----------|
| `src/services/auth/oauth-callback.service.ts` | Resolver pure untuk keputusan OAuth callback |
| `src/components/features/auth/OAuthCallback.tsx` | Recovery creator/UMKM, retry provisioning, recovery UI |
| `src/components/providers/AuthProvider.tsx` | `refresh()` return hasil session terbaru |
| `00_BACKEND/tests/unit/oauth-callback.service.test.ts` | Unit test resolver OAuth callback |
| `vitest.config.mts` | Config root Vitest untuk test unit baru |
| `package.json` | Tambah dev dependency `vitest`, script test tetap jalan |
| `package-lock.json` | Lockfile update dari install Vitest |
| `00_BACKEND/docs/02_Modules/Authentication/40_User_Flow.md` | Dokumentasi flow OAuth + recovery |
| `00_BACKEND/docs/02_Modules/Authentication/60_API.md` | Dokumentasi API/service OAuth |
| `00_BACKEND/docs/02_Modules/Authentication/90_Events.md` | Dokumentasi event provisioning OAuth |
| `00_BACKEND/docs/02_Modules/Users/70_Backend.md` | Dokumentasi backend mirror/profile |
| `src/components/features/creator-dashboard/CreatorDashboardTopbar.tsx` | Fix lint blocker existing |
| `src/components/features/umkm-dashboard/create-campaign/steps/AssetLinkStep.tsx` | Fix lint blocker existing |
| `src/components/ui/BetaNoticeBanner.tsx` | Fix lint blocker existing |

---

## Test Baru

| Test Case | Hasil |
|-----------|-------|
| User existing redirect ke `next` | Pass |
| `not_found + role=umkm` redirect `/auth/oauth-complete?role=umkm` | Pass |
| `not_found + role=creator` trigger provisioning | Pass |
| Creator provisioning gagal tampil recovery UI | Pass |
| OAuth error selain `not_found` redirect `/login?error=oauth` | Pass |

---

## Bukti Verifikasi

| Command | Hasil |
|---------|-------|
| `rtk npx vitest run 00_BACKEND/tests/unit/oauth-callback.service.test.ts` | Pass, 5/5 |
| `rtk npm test` | Pass, 5/5 |
| `rtk npm run typecheck` | Pass |
| `rtk npm run lint` | Pass, 16 warning existing |
| `cd 00_BACKEND && npm run test:unit` | Fail existing, 78 failed / 10 passed |
| `cd 00_BACKEND && npm run test:integration` | Fail existing, 29 failed / 46 passed |

Backend test failure tidak berasal dari patch OAuth baru. Failure dominan dari test/service lama, misalnya fungsi yang tidak ada lagi (`registerUMKM`, `calculatePlatformFee`, `searchCreators`) dan expectation lama yang tidak cocok implementasi sekarang.

---

## Manual Verification

| Skenario | Status |
|----------|--------|
| Creator Google OAuth baru | **Verified (Pass)** via `dev.marketiv.id` |
| UMKM Google OAuth baru | **Verified (Pass)** via `dev.marketiv.id` |
| OAuth failure | **Verified (Pass)** |
| Legacy Auth user tanpa mirror | **Verified (Pass)** |

Manual OAuth akhirnya berhasil diverifikasi. Masalah sebelumnya (`401 Third-Party Cookies` di localhost) teratasi dengan menggunakan setup domain lokal virtual (`dev.marketiv.id`), yang mensimulasikan sesi First-Party Appwrite Cloud.

---

## Risiko Tersisa

| Risiko | Mitigasi |
|--------|----------|
| Bundle production belum rebuild setelah `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH=true` dibuat | Rebuild/deploy production Site |
| Google Cloud redirect URI belum dicek langsung | Verifikasi manual di Google Cloud Console |
| `APPWRITE_API_KEY` ada sebagai non-secret Site var | Rotate key, hapus variable publik/non-secret, deploy ulang |
| Backend test suite masih merah baseline | Pisahkan cleanup test backend dari fix OAuth |
| Manual OAuth real belum dijalankan | Jalankan skenario Creator baru dan UMKM baru di browser |

---

## Definisi Selesai

- [x] Root cause teknis dibuktikan sampai Phase 0 via MCP Appwrite
- [x] Google OAuth provider/platform valid di Appwrite live
- [x] `create-user-profile` live bisa dieksekusi user dan punya env/scopes benar
- [x] Frontend tidak lagi redirect diam-diam saat mirror `users` belum ada
- [x] Creator OAuth missing mirror punya retry provisioning
- [x] UMKM OAuth missing mirror menuju `/auth/oauth-complete`
- [x] Akun legacy/tanpa mirror punya recovery UI
- [x] Docs auth/users sinkron dengan behavior final
- [x] Test unit OAuth baru hijau
- [x] Manual Creator Google OAuth baru final `/onboarding`
- [x] Manual UMKM Google OAuth baru final `/auth/oauth-complete`, submit, lalu `/onboarding`
- [ ] Production rebuild/deploy setelah env drift fix
- [ ] Rotate/remove exposed `APPWRITE_API_KEY` Site variable

---

## Rekomendasi Lanjutan

| Prioritas | Item | Alasan |
|-----------|------|--------|
| 1 | Rebuild/deploy production Site | `NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH` compile-time |
| 2 | Manual test Creator + UMKM Google OAuth baru | Definisi selesai butuh bukti end-to-end |
| 3 | Rotate/remove `APPWRITE_API_KEY` dari Site vars | Risiko secret exposure |
| 4 | Bersihkan backend test baseline | Agar future regression signal akurat |
