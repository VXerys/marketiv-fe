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
| 🔐 **Phase 6: Auth & OTP Integration** | 12 | 8 | 0 | 4 | **66.7%** |
| 📊 **Phase 7: Admin Operations & P2MW Reports** | 10 | 1.5 | 0.5 | 8 | **15.0%** |
| **TOTAL KESELURUHAN SE-PROJECT** | **92** | **76** | **4** | **12** | **82.6%** |

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

## 4. BUGS YANG SUDAH DIPERBAIKI (FIX HISTORY)

| # | Bug | Root Cause | Fix | Commit |
|---|---|---|---|---|
| 1 | `profileProvisioned` early exit memblokir OTP | Frontend early return sebelum requestEmailOtp | Hapus pengecekan profileProvisioned | `c2a169b` |
| 2 | OTP screen tidak pernah muncul (redirect race) | `refresh()` mengisi AuthProvider.user → RedirectIfAuthenticated unmount form | Hapus `refresh()` sebelum OTP; tambah `emailVerified` gate di RedirectIfAuthenticated | `d805c44` |
| 3 | `userId` bisa `""` di fallback | `getSession()` gagal → fallback hardcode `""` | Tangkap `authId` langsung dari `account.create().$id` | `d805c44` |
| 4 | `requestEmailOtp` error diabaikan | Tidak ada error handling, `setVerificationSent(true)` tetap jalan | Tambah `if (!otpRes.success)` check + banner error | `d805c44` |
