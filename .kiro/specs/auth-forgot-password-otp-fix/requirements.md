# 📋 AUDIT & REQUIREMENTS: FORGOT PASSWORD OTP SECURITY & CONTRACT FIX

> **Dokumen Audit Spesifikasi & Kebutuhan Fitur: Forgot Password & Reset Password OTP Fix**  
> **Lokasi Project**: Marketiv — Next.js 16 (App Router) + Appwrite Backend  
> **Tanggal Audit**: 9 Agustus 2026

---

## 1. REKAPITULASI PROBLEM & SECURITY FIX

### A. Account Enumeration via `userId` (HIGH SECURITY FIX)
- **Problem**: `request-password-otp` sebelumnya mengembalikan `{ userId }` untuk email terdaftar dan `{ userId: null }` untuk email tidak terdaftar, memicu akun enumeration.
- **Fix**: `requestPasswordRecovery` mengembalikan `ServiceResult<null>` tanpa membocorkan status keberadaan email atau `userId`.

### B. Field Email Dead Field di Reset Password Form (MEDIUM FIX)
- **Problem**: Previously `completePasswordRecoveryWithOtp` took `userId` instead of `email`, making the `Email` input field in `ResetPasswordForm` useless.
- **Fix**: Contract diubah menjadi `completePasswordRecoveryWithOtp({ email, otpCode, password, passwordConfirm })`. Field email aktif dan dikirimkan ke server backend.

### C. FunctionExecutionError Message Obfuscation (MEDIUM FIX)
- **Problem**: Error dari Appwrite Function ditimpa oleh generic fallback `authMessage` karena tidak mengecek `instanceof FunctionExecutionError`.
- **Fix**: Preserved `FunctionExecutionError.message` di `auth.service.ts`. Error asli backend (misal: rate limiting, OTP invalid) tampil langsung ke user.

### D. Session Invalidation / Post-Reset Navigation (MEDIUM FIX)
- **Problem**: User yang punya sesi aktif saat mereset password langsung dilempar ke `/login`, lalu `RedirectIfAuthenticated` melemparnya balik ke `/dashboard`.
- **Fix**: Dipanggil `await logoutSession()` setelah reset password sukses sebelum navigasi ke `/login`, menjamin pembersihan sesi dan navigasi yang bersih.

### E. Copy & Legacy Alignment (LOW FIX)
- Updated copy text di `ForgotPasswordForm.tsx` & `ResetPasswordForm.tsx` untuk secara spesifik menyebutkan "Kode OTP 6 Digit" dan menghapus kebingungan kata "tautan/link".
