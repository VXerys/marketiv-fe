# 📋 AUDIT & REQUIREMENTS: AUTHENTICATION & OTP SYSTEM

> **Dokumen Audit Spesifikasi & Kebutuhan Fitur Auth & OTP (Sprint Phase 6)**  
> **Lokasi Project**: Marketiv — Next.js 16 (App Router) + Appwrite Backend  
> **Catatan History Commit**: Refactor Verifikasi Email ke OTP 6-Digit (`createEmailToken` & `createSession`) telah diterapkan.

---

## 1. REKAPITULASI COMMIT TERPENUHI (COMPLETED REFACTOR)

Commit terdahulu (`refactor(auth): replace magic link email verification with 6-digit OTP`) telah menyelesaikan fondasi utama verifikasi register:

- ✅ **Appwrite Native OTP**: Menggantikan `createVerification` magic link dengan `createEmailToken` & `createSession`.
- ✅ **Inline OTP Input Register**: Form `EmailVerificationPending.tsx` dengan filter digit, font tracking, & note 15 menit.
- ✅ **Session Recovery**: Flow register UMKM & Kreator memanggil `requestEmailOtp` & mengoper `userId` + `password` ke layar verifikasi.
- ✅ **Fallback Session Protection**: Pada `confirmEmailOtp`, jika OTP salah, sesi dipulihkan via `createEmailPasswordSession`.
- ✅ **Cleanup**: Halaman `/verify-email` & konstanta `routes.verifyEmail` telah dihapus.

---

## 2. SISANYA / CELEH YANG MASIH HARUS DIKERJAKAN (REMAINING GAPS)

Meskipun verifikasi register dasar sudah menggunakan OTP, terdapat 4 poin utama yang **belum dikerjakan**:

### 2.1 UI / Frontend Gaps

1. **Komponen Slot `InputOTP` (`src/components/ui/input-otp.tsx`)**:
   - `EmailVerificationPending.tsx` saat ini masih menggunakan `<input type="text">` biasa dengan font tracking. Belum beralih ke slot visual `<InputOTP>` 6-digit (`src/components/ui/input-otp.tsx`).
2. **Countdown Timer Cooldown (60s)**:
   - Tombol "Kirim Ulang Kode" belum memiliki timer hitung mundur 60 detik (*cooldown period*) setelah ditekan untuk mencegah spamming client-side.
3. **Lupa & Reset Password via OTP 6-Digit**:
   - `ForgotPasswordForm.tsx` dan `ResetPasswordForm.tsx` **masih memakai magic link URL token** Appwrite (`account.createRecovery`). Belum mendukung input 6-digit OTP untuk Lupa/Reset Password.

---

### 2.2 Backend & Infrastructure Gaps

1. **Reset Password OTP Function**:
   - Belum ada Appwrite Function / Server Action untuk menerima token OTP 6-digit untuk Reset Password tanpa URL secret link.
2. **Server-side Rate Limiting**:
   - Belum ada rate limiter di backend untuk membatasi pengiriman token OTP (Max 3 request / 10 min per IP/Email).
3. **Pengetesan Event Trigger `user-email-verified`**:
   - Perlu memastikan Appwrite Cloud Function `user-email-verified` merespons event `emailVerification` untuk meng-update database `users.email_verified_at`.

---

## 3. UPDATED TASK BREAKDOWN PER ROLE

### 🎨 ROLE A: FRONTEND / LEAD DEV (USER)
- [x] **AUTH-FE-01** [Done]: Refactor Register ke Inline 6-digit OTP Email Token & Session Recovery.
- [ ] **AUTH-FE-02** [Pending]: Upgrade UI `EmailVerificationPending` ke komponen `<InputOTP>` 6-slot visual + auto-submit.
- [ ] **AUTH-FE-03** [Pending]: Tambahkan Countdown Timer 60 detik cooldown pada tombol Kirim Ulang OTP.
- [ ] **AUTH-FE-04** [Pending]: Refactor `ForgotPasswordForm` & `ResetPasswordForm` ke alur Kode OTP 6-digit.
- [ ] **AUTH-FE-05** [Pending]: Zod Validation Schema untuk 6-digit OTP angka murni (`/^\d{6}$/`).

---

### ⚙️ ROLE B: BACKEND ENGINEER (TIM BACKEND)
- [x] **AUTH-BE-01** [Done]: Integrasi Client SDK `createEmailToken` & `createSession` di `auth.service.ts`.
- [ ] **AUTH-BE-02** [Pending]: Appwrite Function / Handler Reset Password via Kode OTP 6-digit.
- [ ] **AUTH-BE-03** [Pending]: Server-side Rate Limiter Pengiriman OTP (Max 3x per 10 menit).
- [ ] **AUTH-BE-04** [Pending]: Verifikasi Cloud Function `user-email-verified` merespons event `emailVerification`.

---

### 🧪 ROLE C: FULLSTACK & QA AUDITOR
- [ ] **AUTH-QA-01** [Pending]: E2E Test Register -> Email OTP Token -> Verification.
- [ ] **AUTH-QA-02** [Pending]: E2E Test Reset Password via OTP 6-digit.
