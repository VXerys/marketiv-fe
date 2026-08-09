# 🔐 TASKS: AUDIT AUTHENTICATION & OTP SYSTEM

Spec & Task Breakdown untuk modul Otentikasi dan Sistem OTP (Register, Verification, & Reset Password).

---

## 👥 ROLE ASSIGNMENTS

### 🎨 ROLE A: FRONTEND / LEAD DEV (USER)
Fokus pada antarmuka pengguna, input OTP 6-digit, timer countdown, penanganan state register & reset password via OTP, serta pesan error intuitif.

- [ ] **AUTH-FE-01** [In Progress]: Utility UI Input OTP (`src/components/ui/input-otp.tsx`) dengan auto-focus, paste 6-digit, dan countdown timer 60 detik.
- [ ] **AUTH-FE-02** [Pending]: Refactor Form Reset Password (`/forgot-password` & `/reset-password`) agar mendukung input 6-digit OTP code menggantikan tautan URL token.
- [ ] **AUTH-FE-03** [Pending]: Perbaikan State Flow Verifikasi Email OTP saat Register (`/register`), cegah logout otomatis jika OTP kedaluwarsa.
- [ ] **AUTH-FE-04** [Pending]: UI Feedback Error (OTP salah, expired, resend limit) + tombol "Kirim Ulang Kode OTP".
- [ ] **AUTH-FE-05** [Pending]: Client-side Zod validation schema untuk 6-digit angka OTP murni (`/^\d{6}$/`).

---

### ⚙️ ROLE B: BACKEND ENGINEER (TIM BACKEND)
Fokus pada Appwrite Server SDK, token provider, Appwrite Functions, rate limiting, dan manajemen sesi server-side.

- [ ] **AUTH-BE-01** [Pending]: Audit & Konfigurasi Appwrite Email Token Service (`account.createEmailToken`) untuk token OTP 6-digit.
- [ ] **AUTH-BE-02** [Pending]: Buat Appwrite Function / Server Action untuk Reset Password berbasis OTP token.
- [ ] **AUTH-BE-03** [Pending]: Implementasi Rate Limiting Pengiriman OTP (Max 3x per 10 menit per Email/IP) guna mencegah spamming.
- [ ] **AUTH-BE-04** [Pending]: Event Trigger `emailVerification` untuk sync otomatis kolom `users.email_verified_at` di Appwrite Database.
- [ ] **AUTH-BE-05** [Pending]: Fix Session Invalidation boundary saat pertukaran OTP token (`createSession` vs `deleteSession`).

---

### 🧪 ROLE C: FULLSTACK & QA AUDITOR
Fokus pada integrasi end-to-end, keamanan token, dan pengujian keandalan sistem auth.

- [ ] **AUTH-QA-01** [Pending]: E2E Test Flow: Register -> Kirim OTP Email -> Input OTP -> Terverifikasi.
- [ ] **AUTH-QA-02** [Pending]: E2E Test Flow: Lupa Password -> OTP Email -> Input OTP + Pass Baru -> Success Login.
