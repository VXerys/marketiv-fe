# 📋 AUDIT & REQUIREMENTS: AUTH OTP SESSION HANDOFF BUGFIX (BUGFIX #2)

> **Dokumen Audit Spesifikasi & Kebutuhan Fitur: Auth OTP Session Handoff Bugfix**  
> **Lokasi Project**: Marketiv — Next.js 16 (App Router) + Appwrite Backend  
> **Tanggal Audit**: 9 Agustus 2026

---

## 1. PROBLEM STATEMENT (BUGFIX #2)

 setlah verifikasi OTP 6-digit sukses, aplikasi justru terlempar kembali ke `/login?next=/onboarding` (seolah unauthenticated). Namun jika browser di-refresh manual, sesi ternyata sudah aktif dan aplikasi masuk ke `/onboarding`.

---

## 2. ROOT CAUSE ANALYSIS

### A. Concurrent OTP Submission & Destructive `deleteSession`
1. Di `EmailVerificationPending.tsx`, saat 6 digit terisi, `useEffect` memicu auto-submit `submitOtp()`.
2. Saat yang sama, tombol "Verifikasi Email" diklik / di-submit pengguna.
3. `confirmEmailOtp()` menghapus sesi lama via `deleteSession("current")` lalu membuat sesi baru via `createSession(userId, secret)`.
4. Request kedua (double submit) memanggil `deleteSession("current")` **SEGERA SETELAH** request pertama berhasil membuat sesi OTP baru! Sesi baru terhapus secara destruktif, dan token OTP hangus.

### B. Hasil `refresh()` Diabaikan
1. Di `RegisterUmkmForm.tsx` & `RegisterCreatorForm.tsx`, `onContinue` memanggil `await refresh(); router.replace(routes.onboarding);`.
2. Jika `refresh()` gagal karena session sedang terhapus oleh request kedua, `AuthProvider` menyetel `user = null`.
3. `/onboarding` menerima `user = null` dan melempar pengguna ke `/login?next=/onboarding`.

### C. Competing Navigation Owners
- `RedirectIfAuthenticated` mengarahkan `user.emailVerified === true` ke `/dashboard/{role}`.
- `RegisterForm` mengarahkan ke `/onboarding`.
- Terjadi navigation race antara dua komponen pengatur rute.

---

## 3. REQUIREMENTS & FIXES IMPLEMENTED

1. **Eliminasi Auto-Submit & Pasang Synchronous Ref Lock (`verifyingRef`)**:
   - Menghapus `useEffect` auto-submit di `EmailVerificationPending.tsx`.
   - Menggunakan `verifyingRef` (React `useRef(false)`) sebagai mutex synchronous lock agar `submitOtp` hanya bisa diproses 1x secara bersamaan.

2. **Validasi Hasil `refresh()` di `onContinue`**:
   - `onContinue` memeriksa `const sessionRes = await refresh()`.
   - Jika `!sessionRes.success || !sessionRes.data`, proses navigasi dibatalkan dan error banner ditampilkan, mencegah lemparan liar ke `/login`.

3. **Deterministic Navigation Owner (`RedirectIfAuthenticated`)**:
   - `RedirectIfAuthenticated` menjadi pengatur rute utama:
     - `!user.emailVerified` → Tetap di form register (render OTP screen).
     - `user.emailVerified` + `!user.isProfileCompleted` → Redirect ke `/onboarding`.
     - `user.emailVerified` + `user.isProfileCompleted` → Redirect ke `/dashboard/{role}`.
