# 📋 AUDIT & REQUIREMENTS: AUTHENTICATION & OTP SYSTEM

> **Dokumen Audit Spesifikasi & Kebutuhan Fitur Auth & OTP (Sprint Phase 6)**  
> **Lokasi Project**: Marketiv — Next.js 16 (App Router) + Appwrite Backend  
> **Tanggal Audit Terakhir**: 9 Agustus 2026

---

## 1. REKAPITULASI PROSES REAL SE-PROJECT (REAL PROJECT PROGRESS)

Audit teliti terhadap seluruh codebase Marketiv (Frontend, Services, & Appwrite Integration):

| Sprint Phase / Modul Utama | Total Task | Selesai (Completed) | Dalam Proses (In Progress) | Belum (Pending) | Real Progress (%) |
|---|---|---|---|---|---|
| **Phase 1: Foundation & Design System** | 12 | 12 | 0 | 0 | **100%** |
| **Phase 2: Dashboard UMKM & Campaign** | 18 | 17 | 1 | 0 | **94.4%** |
| **Phase 3: Dashboard Kreator & Job Pool** | 16 | 15 | 1 | 0 | **93.7%** |
| **Phase 4: Negosiasi Rate Card & Chat** | 14 | 14 | 0 | 0 | **100%** |
| **Phase 5: Midtrans Payment & Escrow** | 10 | 8.5 | 1.5 | 0 | **85.0%** |
| 🔐 **Phase 6: Auth & OTP Integration** | 12 | 10 | 0 | 2 | **83.3%** |
| 📊 **Phase 7: Admin Operations & P2MW Reports** | 10 | 1.5 | 0.5 | 8 | **15.0%** |
| **TOTAL KESELURUHAN SE-PROJECT** | **92** | **78** | **4** | **10** | **84.8%** |

---

## 2. CANONICAL AUTH STATE MACHINE (UPDATED & FIXED)

### Auth Precedence Guard (Urutan Prioritas)
```
1. No session             → /login
2. Suspended              → Blocked card
3. !emailVerified         → OTP screen (tetap di /register)
4. !isProfileCompleted    → /onboarding
5. Role mismatch          → correct dashboard
6. Otherwise              → /dashboard/{role}
```

### SessionUser Interface (Updated)
```typescript
interface SessionUser {
  userId: string;
  email: string;
  emailVerified: boolean;     // ← BARU: dari authUser.emailVerification
  role: UserRole;
  status: UserStatus;
  name?: string;
  phone?: string;
  isProfileCompleted: boolean;
}
```

---

## 3. REGISTER FLOW (FIXED — OTP REDIRECT RACE RESOLVED)

### A. Manual Register Flow (Email + Password)
```
User Submit Register (Email + Password)
  ➜ 1. account.create() → tangkap authId langsung
  ➜ 2. createEmailPasswordSession() → sesi aktif
  ➜ 3. updatePrefs() → role & metadata
  ➜ 4. provisionUserProfile() → baris DB
  ➜ 5. requestEmailOtp({ userId: authId }) → kirim kode 6-digit
  ➜ 6. setVerificationSent(true) → tampilkan layar OTP
       ⚠️ JANGAN panggil refresh() di sini!
       RedirectIfAuthenticated menahan user karena emailVerified: false
  ➜ 7. User input OTP 6-digit → confirmEmailOtp()
       deleteSession("current") → createSession(userId, secret)
       email terverifikasi di Appwrite
  ➜ 8. onContinue() → refresh() → emailVerified: true
  ➜ 9. RedirectIfAuthenticated → dashboard → RoleGuard → /onboarding
```

### B. Google OAuth Register Flow
```
User Klik "Daftar dengan Google"
  ➜ Google OAuth Callback → email otomatis terverifikasi
  ➜ emailVerified: true → direct redirect ke dashboard/onboarding [TANPA OTP]
```

---

## 4. RESET PASSWORD OTP (SERVER-SIDE)

```
User Input Email di /forgot-password
  ➜ request-password-otp Function
  ➜ rate limit server-side: max 3 request / 10 menit per email+IP
  ➜ account.createEmailToken(authUserId, email)
  ➜ user input OTP 6 digit + password baru
  ➜ reset-password-with-otp Function
  ➜ account.createSession(userId, otpCode) sebagai verifikasi OTP
  ➜ users.updatePassword(userId, password)
```

Security constraints:
- OTP mentah tidak pernah dikembalikan ke client.
- Client-side email/userId hanya selector, bukan trusted proof.
- Password hanya diubah setelah Appwrite memvalidasi OTP server-side.
- Email verification sync dilakukan oleh `user-email-verified` pada event `users.*.update` dengan `emailVerification === true`.

---

## 5. BUGS YANG SUDAH DIPERBAIKI (FIX HISTORY)

| # | Bug | Root Cause | Fix | Commit |
|---|---|---|---|---|
| 1 | `profileProvisioned` early exit memblokir OTP | Frontend early return sebelum requestEmailOtp | Hapus pengecekan profileProvisioned | `c2a169b` |
| 2 | OTP screen tidak pernah muncul (redirect race) | `refresh()` mengisi AuthProvider.user → RedirectIfAuthenticated unmount form | Hapus `refresh()` sebelum OTP; tambah `emailVerified` gate di RedirectIfAuthenticated | `d805c44` |
| 3 | `userId` bisa `""` di fallback | `getSession()` gagal → fallback hardcode `""` | Tangkap `authId` langsung dari `account.create().$id` | `d805c44` |
| 4 | `requestEmailOtp` error diabaikan | Tidak ada error handling, `setVerificationSent(true)` tetap jalan | Tambah `if (!otpRes.success)` check + banner error | `d805c44` |
| 5 | Reset password OTP memakai client-side `account.updateRecovery(email, otp)` | Email dari browser diperlakukan seperti trusted `userId` | Pindah reset OTP ke Function server-side | current |

---

## 6. DETAIL PROGRESS MODUL AUTH & OTP (PHASE 6: 83.3% COMPLETE)

### 6.1 Yang Sudah Selesai (Done — 10 Tasks)
1. ✅ **AUTH-FE-01**: Refactor Register ke Inline 6-digit OTP Email Token & Session Recovery.
2. ✅ **AUTH-FE-02**: Upgrade UI `EmailVerificationPending` ke visual 6-slot `<InputOTP>` component (`InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`) + auto-submit.
3. ✅ **AUTH-FE-03**: Countdown Timer 60s cooldown pada tombol Kirim Ulang Kode OTP.
4. ✅ **AUTH-FE-04**: Refactor `ForgotPasswordForm` & `ResetPasswordForm` ke alur Kode OTP 6-digit (dengan `completePasswordRecoveryWithOtp`).
5. ✅ **AUTH-FE-05**: Client Zod Validation & numeric filtering schema untuk 6-digit OTP angka murni.
6. ✅ **AUTH-FE-06**: Fix OTP redirect race — `emailVerified` gate, no pre-OTP `refresh()`, OTP send error handling, direct `authId` capture.
7. ✅ **AUTH-BE-01**: Integrasi Appwrite Client SDK `createEmailToken` & `createSession` di `auth.service.ts`.
8. ✅ **AUTH-BE-02**: Appwrite Function / Handler Reset Password via Kode OTP 6-digit server-side.
9. ✅ **AUTH-BE-03**: Server-side Rate Limiting pengiriman OTP (Max 3x per 10 menit per IP/Email).
10. ✅ **AUTH-BE-04**: Verifikasi Cloud Function `user-email-verified` merespons event `emailVerification` untuk sync DB.

---

### 6.2 Yang Masih Belum Dikerjakan (Pending QA Live — 2 Tasks)
1. 🔴 **AUTH-QA-01**: E2E Test Register -> Email OTP Verification -> Auto Login. Spec Playwright live-gated sudah ada; belum diverifikasi live karena butuh browser Playwright + OTP email.
2. 🔴 **AUTH-QA-02**: E2E Test Reset Password via OTP 6-digit. Spec Playwright live-gated sudah ada; belum diverifikasi live karena butuh browser Playwright + OTP email.
