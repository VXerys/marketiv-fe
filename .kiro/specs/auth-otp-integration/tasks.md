# 🔐 TASKS: AUDIT AUTHENTICATION & OTP SYSTEM

Status Task Terbaru setelah fix OTP redirect race condition.

---

## 👥 ROLE ASSIGNMENTS

### 🎨 ROLE A: FRONTEND / LEAD DEV (USER) — 100% DONE (6/6 Tasks)
- [x] **AUTH-FE-01** [Done]: Refactor Register ke Inline 6-digit OTP Email Token & Session Recovery.
- [x] **AUTH-FE-02** [Done]: Upgrade UI `EmailVerificationPending` ke komponen `<InputOTP>` 6-slot visual + auto-submit.
- [x] **AUTH-FE-03** [Done]: Tambahkan Countdown Timer 60 detik cooldown pada tombol Kirim Ulang OTP.
- [x] **AUTH-FE-04** [Done]: Refactor `ForgotPasswordForm` & `ResetPasswordForm` ke alur Kode OTP 6-digit.
- [x] **AUTH-FE-05** [Done]: Client-side numeric filtering & 6-digit validation schema untuk OTP.
- [x] **AUTH-FE-06** [Done]: Fix OTP redirect race — `emailVerified` gate di `SessionUser`, `RedirectIfAuthenticated`, hapus `refresh()` sebelum OTP screen, error handling `requestEmailOtp`, tangkap `userId` dari `account.create()`.

---

### ⚙️ ROLE B: BACKEND ENGINEER (TIM BACKEND) — 25% DONE (1/4 Tasks)
- [x] **AUTH-BE-01** [Done]: Integrasi Client SDK `createEmailToken` & `createSession` di `auth.service.ts`.
- [ ] **AUTH-BE-02** [Pending]: Buat Appwrite Function / Handler untuk Reset Password via Kode OTP 6-digit.
- [ ] **AUTH-BE-03** [Pending]: Server-side Rate Limiter Pengiriman OTP (Max 3x per 10 menit per Email/IP).
- [ ] **AUTH-BE-04** [Pending]: Verifikasi Cloud Function `user-email-verified` merespons event `emailVerification` untuk sync DB.

---

### 🧪 ROLE C: FULLSTACK & QA AUDITOR — 0% DONE (0/2 Tasks)
- [ ] **AUTH-QA-01** [Pending]: E2E Test Flow: Register -> Kirim OTP Email -> Input OTP -> Terverifikasi.
- [ ] **AUTH-QA-02** [Pending]: E2E Test Flow: Lupa Password -> OTP Email -> Input OTP + Pass Baru -> Success Login.
