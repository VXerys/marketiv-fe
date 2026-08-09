# 📋 REQUIREMENTS: AUDIT & INTEGRASI SYSTEM AUTHENTICATION & OTP

## 1. REKAPITULASI PROSESH & MASALAH AUTHENTICATION

### A. Reset Password via OTP
- **Masalah Saat Ini**: Reset password bawaan Appwrite menggunakan URL link token panjang (`account.createRecovery`), bukan 6-digit OTP code yang bisa diketik langsung di layar.
- **Kebutuhan**: Menyediakan flow 6-digit OTP untuk Reset Password (Input Email -> Kirim Kode OTP -> Input Kode OTP + Password Baru -> Selesai).

### B. Verifikasi Email OTP saat Register
- **Masalah Saat Ini**: `confirmEmailOtp` menghapus sesi aktif (`deleteSession('current')`) sebelum membuat sesi baru dengan OTP token (`createSession`). Jika OTP gagal/salah, user bisa kehilangan sesi login.
- **Kebutuhan**: Pertukaran token OTP yang aman, penanganan fallback login jika OTP gagal, dan UI countdown 60 detik untuk resend OTP.

---

## 2. PEMBAGIAN PERAN (ROLE-BASED TASK BOUNDARY)

| Role | Tanggung Jawab Utama | Target Deliverables |
|---|---|---|
| 🎨 **Frontend / Lead Dev (Anda)** | UI Form, Input OTP 6-digit, Timer, State handling, Reset Password OTP UI | Component `InputOTP`, UI Reset PW OTP, Error Feedback, Zod Schema |
| ⚙️ **Backend Engineer** | Server SDK, Appwrite Functions, Rate Limiting, OTP Service Provider | Email Token Provider, Reset PW OTP Function, Rate Limiter, Verification Trigger |
| 🧪 **QA & Auditor** | Testing E2E, Penetration/Security Check | Test Suite Register OTP & Reset Password OTP |
