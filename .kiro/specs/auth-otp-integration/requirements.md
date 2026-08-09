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
| 🔐 **Phase 6: Auth & OTP Integration** | 11 | 6 | 0 | 5 | **54.5%** |
| 📊 **Phase 7: Admin Operations & P2MW Reports** | 10 | 1.5 | 0.5 | 8 | **15.0%** |
| **TOTAL KESELURUHAN SE-PROJECT** | **91** | **74** | **4** | **13** | **81.3%** |

---

## 2. DETAIL PROGRESS MODUL AUTH & OTP (PHASE 6: 54.5% COMPLETE)

### 2.1 Yang Sudah Selesai (Done — 6 Tasks)
1. ✅ **AUTH-FE-01**: Refactor Register ke Inline 6-digit OTP Email Token & Session Recovery.
2. ✅ **AUTH-FE-02**: Upgrade UI `EmailVerificationPending` ke visual 6-slot `<InputOTP>` component (`InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`) + auto-submit.
3. ✅ **AUTH-FE-03**: Countdown Timer 60s cooldown pada tombol Kirim Ulang Kode OTP.
4. ✅ **AUTH-FE-04**: Refactor `ForgotPasswordForm` & `ResetPasswordForm` ke alur Kode OTP 6-digit (dengan `completePasswordRecoveryWithOtp`).
5. ✅ **AUTH-FE-05**: Client Zod Validation & numeric filtering schema untuk 6-digit OTP angka murni.
6. ✅ **AUTH-BE-01**: Integrasi Appwrite Client SDK `createEmailToken` & `createSession` di `auth.service.ts`.

---

### 2.2 Yang Masih Belum Dikerjakan (Pending Backend & QA — 5 Tasks)
1. 🔴 **AUTH-BE-02**: Appwrite Function / Handler Reset Password via Kode OTP 6-digit server-side.
2. 🔴 **AUTH-BE-03**: Server-side Rate Limiting pengiriman OTP (Max 3x per 10 menit per IP/Email).
3. 🔴 **AUTH-BE-04**: Verifikasi Cloud Function `user-email-verified` merespons event `emailVerification` untuk sync DB.
4. 🔴 **AUTH-QA-01**: E2E Test Register -> Email OTP Verification -> Auto Login.
5. 🔴 **AUTH-QA-02**: E2E Test Reset Password via OTP 6-digit.
