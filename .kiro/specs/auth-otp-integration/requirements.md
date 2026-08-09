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
| 🔐 **Phase 6: Auth & OTP Integration** | 12 | 6 | 2 | 4 | **50.0%** |
| 📊 **Phase 7: Admin Operations & P2MW Reports** | 10 | 1.5 | 0.5 | 8 | **15.0%** |
| **TOTAL KESELURUHAN SE-PROJECT** | **92** | **74** | **6** | **12** | **80.4%** |

---

## 2. DETAIL PROGRESS MODUL AUTH & OTP (PHASE 6: 50% COMPLETE)

### 2.1 Yang Sudah Selesai (Done — 6 Tasks)
1. ✅ **Appwrite Native OTP Engine**: Menggantikan magic link dengan `createEmailToken` & `createSession` di `auth.service.ts`.
2. ✅ **Inline OTP Register UI**: Form `EmailVerificationPending.tsx` dengan filter digit angka & note kedaluwarsa 15 menit.
3. ✅ **Session Recovery Fallback**: Sesi dipulihkan via `createEmailPasswordSession` jika OTP gagal agar user tidak ter-logout.
4. ✅ **Component Primitives `InputOTP`**: Komponen dasar UI `src/components/ui/input-otp.tsx` tersedia.
5. ✅ **Cleanup Route Verification**: Menghapus `/verify-email` & `routes.verifyEmail` yang usang.
6. ✅ **Centralized Route Constants**: Deklarasi `routes.kreatorSettings` & canonical routing.

---

### 2.2 Yang Sedang Dalam Proses (In Progress — 2 Tasks)
1. 🟡 **AUTH-FE-02**: Upgrade `EmailVerificationPending.tsx` dari `<input type="text">` biasa ke komponen visual slot `<InputOTP>` 6-digit.
2. 🟡 **AUTH-FE-03**: Countdown Timer Cooldown 60 detik pada tombol Kirim Ulang OTP untuk cegah spamming.

---

### 2.3 Yang Masih Belum Dikerjakan (Pending — 4 Tasks)
1. 🔴 **AUTH-FE-04 / BE-02**: Refactor Lupa & Reset Password (`/forgot-password` & `/reset-password`) dari URL link recovery ke Kode OTP 6-digit.
2. 🔴 **AUTH-FE-05**: Client Zod Validation Schema untuk 6-digit OTP angka murni (`/^\d{6}$/`).
3. 🔴 **AUTH-BE-03**: Server-side Rate Limiting pengiriman OTP (Max 3x per 10 menit per IP/Email).
4. 🔴 **AUTH-BE-04**: Event Trigger Verification Sync DB `users.email_verified_at`.
