# 🔐 TASKS: AUDIT AUTHENTICATION & OTP SYSTEM

Status Task Terbaru setelah Refactor Register Email OTP Token.

---

## 👥 ROLE ASSIGNMENTS

### 🎨 ROLE A: FRONTEND / LEAD DEV (USER)
- [x] **AUTH-FE-01** [Done]: Refactor Register ke Inline 6-digit OTP Email Token & Session Recovery.
- [ ] **AUTH-FE-02** [Pending]: Upgrade UI `EmailVerificationPending` ke komponen `<InputOTP>` 6-slot visual + auto-submit.
- [ ] **AUTH-FE-03** [Pending]: Tambahkan Countdown Timer 60 detik cooldown pada tombol Kirim Ulang OTP.
- [ ] **AUTH-FE-04** [Pending]: Refactor `ForgotPasswordForm` & `ResetPasswordForm` ke alur Kode OTP 6-digit (menggantikan link URL recovery).
- [ ] **AUTH-FE-05** [Pending]: Client-side Zod validation schema untuk 6-digit angka OTP murni (`/^\d{6}$/`).

---

### ⚙️ ROLE B: BACKEND ENGINEER (TIM BACKEND)
- [x] **AUTH-BE-01** [Done]: Integrasi Client SDK `createEmailToken` & `createSession` di `auth.service.ts`.
- [ ] **AUTH-BE-02** [Pending]: Buat Appwrite Function / Handler untuk Reset Password via Kode OTP 6-digit.
- [ ] **AUTH-BE-03** [Pending]: Server-side Rate Limiter Pengiriman OTP (Max 3x per 10 menit per Email/IP).
- [ ] **AUTH-BE-04** [Pending]: Verifikasi Cloud Function `user-email-verified` merespons event `emailVerification` untuk sync DB.

---

### 🧪 ROLE C: FULLSTACK & QA AUDITOR
- [ ] **AUTH-QA-01** [Pending]: E2E Test Flow: Register -> Kirim OTP Email -> Input OTP -> Terverifikasi.
- [ ] **AUTH-QA-02** [Pending]: E2E Test Flow: Lupa Password -> OTP Email -> Input OTP + Pass Baru -> Success Login.
