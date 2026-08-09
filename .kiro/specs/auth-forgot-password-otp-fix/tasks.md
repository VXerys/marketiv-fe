# 🔐 TASKS: FORGOT PASSWORD OTP CONTRACT & SECURITY FIX

---

## 👥 ROLE ASSIGNMENTS & TASKS

### 🎨 ROLE A: FRONTEND / LEAD DEV — 100% DONE (5/5 Tasks)
- [x] **FORGOT-FE-01** [Done]: Ubah `requestPasswordRecovery` mengembalikan `ServiceResult<null>` tanpa membocorkan `userId` / status akun.
- [x] **FORGOT-FE-02** [Done]: Ubah `completePasswordRecoveryWithOtp` menggunakan `email` menggantikan `userId`.
- [x] **FORGOT-FE-03** [Done]: Preserve pesan error `FunctionExecutionError` agar error asli backend Appwrite Function tidak tertimpa fallback.
- [x] **FORGOT-FE-04** [Done]: Panggil `await logoutSession()` saat reset password sukses agar sesi lama dibersihkan sebelum navigasi ke `/login`.
- [x] **FORGOT-FE-05** [Done]: Update copy UI & URL params (hapus `userId` dari query string `/reset-password?email=...`).
