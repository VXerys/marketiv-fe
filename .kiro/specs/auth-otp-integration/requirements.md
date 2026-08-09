# 📋 AUDIT & REQUIREMENTS: AUTHENTICATION & OTP SYSTEM

> **Dokumen Audit Spesifikasi & Kebutuhan Fitur Auth & OTP (Sprint Phase 6)**  
> **Lokasi Project**: Marketiv — Next.js 16 (App Router) + Appwrite Backend  
> **Tanggal Audit**: 9 Agustus 2026

---

## 1. EXECUTIVE SUMMARY

Hasil audit komprehensif terhadap alur Otentikasi dan Sistem OTP (Register, Email Verification, & Password Reset) di platform Marketiv menunjukkan progress keseluruhan **~40%**. 

Meskipun komponen dasar UI (`input-otp.tsx`) dan fungsi Appwrite Client SDK (`auth.service.ts`) sudah tersedia, terdapat **beberapa celah arsitektur kritis (critical gaps)** yang membuat alur OTP dan Reset Password belum berjalan sesuai standar keamanan dan *user experience* terbaik.

---

## 2. TEMUAN AUDIT DETAIL (DETAILED AUDIT FINDINGS)

### 2.1 Sisi Frontend & User Interface (Progress: ~45%)

| Komponen / Route | Status | Temuan Audit & Celah (Gaps) | Best Practice Recommendation |
|---|---|---|---|
| **Primitive Input OTP** (`src/components/ui/input-otp.tsx`) | ✅ Ready | Sudah tersedia berbasis paket `input-otp`, namun belum diimpor atau digunakan pada halaman mana pun. | Integrasikan `InputOTP` dengan 6 slot terpisah (`InputOTPSlot`) + auto-focus & paste support. |
| **Email Verification UI** (`EmailVerificationPending.tsx`) | 🟡 50% | Menggunakan `<input type="text">` biasa dengan `maxLength={6}`. Tidak ada *countdown timer* 60 detik saat resend OTP, memungkinkan user menekan tombol resend secara bertubi-tubi. | Ganti dengan `InputOTP` 6-digit slot, tambahkan timer 60 detik (*cooldown period*), dan mekanisme auto-submit ketika digit ke-6 terisi. |
| **Forgot Password Form** (`ForgotPasswordForm.tsx`) | 🔴 0% OTP | Masih menggunakan alur bawaan URL token (`account.createRecovery`). Meminta email lalu mengirim link pemulihan panjang, bukan kode OTP 6-digit. | Sediakan toggle / mode form input 6-digit OTP sehingga pengguna bisa memilih reset password via kode OTP langsung dari halaman. |
| **Reset Password Form** (`ResetPasswordForm.tsx`) | 🔴 0% OTP | Hanya menerima `userId` & `secret` dari query URL (`?userId=...&secret=...`). | Izinkan eksekusi reset password menggunakan kombinasi `email` + `otp_code` + `new_password`. |

---

### 2.2 Sisi Backend & Appwrite Integration (Progress: ~35%)

| Modul / Function | Status | Temuan Audit & Celah (Gaps) | Best Practice Recommendation |
|---|---|---|---|
| **Email OTP Token Service** (`requestEmailOtp` & `confirmEmailOtp`) | 🟡 60% | Fungsi `confirmEmailOtp` di `auth.service.ts` memanggil `account.deleteSession({ sessionId: "current" })` sebelum `account.createSession`. **Bahaya Kritis**: Jika OTP salah/expired atau tab ditutup, sesi login terputus dan pengguna ter-logout otomatis. | Pertahankan sesi aktif selama verifikasi OTP. Gunakan session token sementara atau panggil `createEmailToken` tanpa merusak sesi login pengguna yang sedang berlangsung. |
| **Reset Password OTP Handler** | 🔴 0% | Belum ada Appwrite Function / Server Action khusus untuk menerima token OTP 6-digit dan mengupdate password akun tanpa URL secret token. | Buat Appwrite Function / Secure Server Action `resetPasswordWithOtp(email, otpCode, newPassword)` dengan Appwrite Server SDK. |
| **Rate Limiting & Anti-Spam** | 🔴 0% | Belum ada batasan frekuensi pengiriman OTP di tingkat backend (Server-side Rate Limiting). | Batasi permintaan OTP maksimal 3 kali per 10 menit per IP / Alamat Email untuk mencegah biaya SMS/Email membengkak dan brute-force attack. |
| **Database Event Sync** | 🔴 0% | Event trigger Appwrite `emailVerification` untuk meng-update kolom `users.email_verified_at` belum teruji penuh secara terotomatisasi. | Pastikan webhook/event trigger Appwrite Function aktif saat `account.updateVerification` / `createSession` berhasil. |

---

## 3. PEMBAGIAN PERAN & SCOPE OF WORK (ROLE-BASED BOUNDARY)

Guna memastikan kolaborasi yang efektif antara **Frontend Developer (Anda)** dan **Backend Engineer (Tim Backend)**, seluruh task dibagi menjadi 3 peran yang terisolasi ketat:

### 🎨 ROLE A: FRONTEND / LEAD DEV (USER)
> **Tujuan**: Membangun UI OTP modern, mengintegrasikan `InputOTP` 6-digit, mengelola state form, countdown timer, dan validasi Zod.

1. **AUTH-FE-01**: Integrasi komponen `InputOTP` 6-digit ke `EmailVerificationPending.tsx` dengan auto-focus & auto-submit pada digit ke-6.
2. **AUTH-FE-02**: Tambahkan countdown timer 60 detik pada tombol "Kirim Ulang Kode OTP" untuk mencegah spamming client-side.
3. **AUTH-FE-03**: Refactor UI `/forgot-password` dan `/reset-password` agar mendukung input 6-digit OTP code menggantikan tautan URL token.
4. **AUTH-FE-04**: Buat banner & toast feedback error terstruktur (OTP salah, expired, rate-limit reached).
5. **AUTH-FE-05**: Implementasi skema validasi Zod untuk 6-digit OTP angka murni (`/^\d{6}$/`).

---

### ⚙️ ROLE B: BACKEND ENGINEER (TIM BACKEND)
> **Tujuan**: Menyiapkan Appwrite Server SDK, OTP token provider, Appwrite Function untuk Reset PW OTP, dan Rate Limiter.

1. **AUTH-BE-01**: Audit & konfigurasi Appwrite Email Token Service (`account.createEmailToken`) agar menghasilkan 6-digit numeric token.
2. **AUTH-BE-02**: Buat Appwrite Function / Server Action `resetPasswordWithOtp` untuk verifikasi OTP & update password pengguna secara aman.
3. **AUTH-BE-03**: Implementasi Rate Limiting pengiriman OTP di server-side (Max 3 request per 10 menit per IP/Email).
4. **AUTH-BE-04**: Konfigurasi Event Trigger Appwrite `emailVerification` untuk update otomatis kolom `email_verified_at` di collection database.
5. **AUTH-BE-05**: Fix Boundary Session Invalidation saat penukaran token OTP agar sesi login tidak terputus jika pertukaran OTP gagal.

---

### 🧪 ROLE C: FULLSTACK & QA AUDITOR
> **Tujuan**: Menjamin keamanan token, keandalan alur, dan pengujian terintegrasi (E2E).

1. **AUTH-QA-01**: E2E Testing Alur Register → OTP Email Verification → Auto Redirect Dashboard.
2. **AUTH-QA-02**: E2E Testing Alur Lupa Password → Input OTP 6-digit → Set Password Baru → Login Berhasil.
3. **AUTH-QA-03**: Audit Keamanan Payload: Pastikan kode OTP raw value tidak bocor di network payload log / Client State.
