# Authentication — API

## Service Layer (Client SDK)

Fungsi-fungsi berikut dipanggil langsung dari frontend Next.js via **Appwrite Client SDK (Auth)**. Berjalan di browser user.

---

### `registerUMKM()` — [Client SDK]

Input:

```json
{
  "businessName": "",
  "category": "",
  "email": "",
  "phone": "",
  "password": ""
}
```

### `registerCreator()` — [Client SDK]

Input:

```json
{
  "name": "",
  "email": "",
  "password": ""
}
```

Catatan: input `name` disimpan sebagai `displayName` di `creator_profiles` — lihat alur data di bawah.

### `registerUser(data)` — [Client SDK]

Gabungan `registerUMKM` dan `registerCreator` dengan parameter `role`.

Input:

```json
{
  "role": "umkm | creator",
  "businessName": "",    // jika role = umkm
  "category": "",        // jika role = umkm
  "phone": "",           // jika role = umkm
  "name": "",            // jika role = creator
  "email": "",
  "password": ""
}
```

### Register Process (kedua role)

```text
Create Appwrite Auth User   (kedua role boleh via Google OAuth)
↓ account.create()
↓ account.updatePrefs()      # simpan data registrasi ke prefs
↓
Create Profile              (umkm_profiles / creator_profiles)
↓ create-user-profile        # baca data dari Appwrite user + prefs
↓
Create Storage Usage        (user_storage_usage)
↓
┌─ Event: users.create ─────────────────────────┐
│ → create-user-wallet      # async, oleh Payments │
│ → Send Welcome Notification # async              │
└─────────────────────────────────────────────────┘
```

Profil dan storage usage dibuat **sinkron** oleh function `create-user-profile`. Wallet dibuat **async** via event `users.create` — lihat [90_Events.md](90_Events.md).

Data registrasi (`businessName`, `category`, `phone`, `displayName`) dialirkan melalui `account.updatePrefs()` dan dibaca oleh `create-user-profile` function.

---

### `loginUser(email, password, role?)` — [Client SDK]

Login dengan email + password. Parameter `role` bersifat opsional — jika diberikan, sistem memvalidasi bahwa role user cocok dan status akun aktif.

Return data login:

```json
{
  "user": {},
  "profile": {},
  "wallet": {}
}
```

### `loginWithGoogle(role?)` — [Client SDK via Appwrite SDK]

Login via Google OAuth menggunakan `account.createOAuth2Session()` dari Appwrite SDK. Tidak ada service function khusus — panggil langsung dari komponen frontend.

- UMKM: setelah redirect, user harus mengisi data tambahan (Nama Usaha, Kategori, Nomor HP)
- Creator: langsung jadi tanpa isi data tambahan

### `logoutUser()` — [Client SDK]

Hapus session aktif via `account.deleteSession('current')`.

### `getCurrentUser()` — [Client SDK]

Mengembalikan data user dari Appwrite Auth (`account.get()`) atau `null` jika tidak login.

---

### `forgotPassword(email, redirectUrl?)` — [Client SDK]

Kirim link reset password ke email. `redirectUrl` opsional (default: `/reset-password`).

### `resetPassword(userId, secret, newPassword)` — [Client SDK]

Setel password baru menggunakan token dari email reset password. Parameter `userId` dan `secret` diperoleh dari URL redirect.

---

## Appwrite Functions (Server-side)

Module ini tidak memiliki REST API publik sendiri. Operasi server-side yang diperlukan module Authentication dijalankan lewat Appwrite Functions dan didokumentasikan di [70_Backend.md](70_Backend.md).

---

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan validasi input.
- Skema profil: [Users/50_Database.md](../Users/50_Database.md).
