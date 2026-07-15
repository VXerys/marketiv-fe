# Users — Database

Modul Users memiliki seluruh collection identitas non-Auth. Inilah satu-satunya lokasi skema untuk collection di bawah.

## Relasi Ringkas

```text
users (1) ──── (1) umkm_profiles
users (1) ──── (1) creator_profiles
creator_profiles (1) ──── (N) creator_social_accounts
creator_profiles (1) ──── (N) creator_portfolios
```

---

## 1. `users`

Mirror identitas inti. Appwrite Auth menyimpan kredensial; collection ini menyimpan role & status untuk query.

### Attributes

| Attribute | Type | Required | Catatan |
| --- | --- | --- | --- |
| `userId` | string | yes | `$id` Appwrite Auth user |
| `role` | enum | yes | `umkm` \| `creator` \| `admin` |
| `status` | enum | yes | mis. `active`, `suspended` |
| `email` | string | yes | |
| `phone` | string | no | Wajib diisi saat Register UMKM (validasi aplikatif) |
| `createdAt` | datetime | — | |

### Index

```text
userId (unique)
email  (unique)
role
status
```

### Permission

```text
User : read own
Admin: read/write all
```

---

## 2. `umkm_profiles`

Relasi: `users` 1 ── 1 `umkm_profiles`.

### Attributes

```text
userId
businessName        # diisi saat Register
category            # diisi saat Register
description
city
address
tiktok
logoUrl
isProfileCompleted
```

`tiktok` bersifat opsional dan tidak menentukan `isProfileCompleted`. Website tidak disimpan sebagai field profil UMKM pada MVP.
`logoUrl` bersifat opsional saat onboarding dan dapat diisi dari halaman profil.

### Index

```text
userId (unique)
city
category
isProfileCompleted
```

(Mendukung query: cari UMKM, filter kota, filter kategori.)

### Permission

```text
Owner : read/write
Public: read     # agar creator dapat melihat profil UMKM
```

---

## 3. `creator_profiles`

Relasi: `users` 1 ── 1 `creator_profiles`.

### Attributes

```text
userId
displayName
bio
city
avatarUrl
totalFollowers      # denormalisasi
totalOrders         # denormalisasi
rating              # denormalisasi
isProfileCompleted
```

### Index

```text
userId (unique)
displayName
city
rating
totalFollowers
isProfileCompleted
```

(Halaman browse creator sangat sering memakai index ini.)

### Permission

```text
Owner : read/write
Public: read
```

---

## 4. `creator_social_accounts`

Relasi: `creator_profiles` 1 ── N `creator_social_accounts`. Untuk MVP hanya akun TikTok yang valid. Struktur N dipertahankan agar ekspansi Instagram, Facebook, YouTube, dan platform lain dapat ditambahkan setelah MVP tanpa redesign skema.

### Attributes

```text
creatorId
platform            # MVP: tiktok only; future: instagram | facebook | youtube | ...
username
followers
engagementRate
```

### Index

```text
creatorId
platform
followers
```

### Permission

```text
Owner : write
Public: read
```

---

## 5. `creator_portfolios`

Relasi: `creator_profiles` 1 ── N `creator_portfolios`.

### Attributes

```text
creatorId
title
description
thumbnailUrl
portfolioUrl
```

Portfolio creator bersifat opsional saat onboarding. Creator dapat memiliki nol atau banyak portfolio, dan menambahkannya nanti dari halaman profil.

### Index

```text
creatorId
```

### Permission

```text
Owner : write
Public: read
```

---

## 6. `user_storage_usage` ⚠️ DORMANT (post-MVP)

Relasi: `users` 1 ── 1 `user_storage_usage`. Tidak digunakan di MVP — semua aset pakai external URL. Infrastruktur siap diaktifkan jika feedback demo minggu pertama meminta file manager internal.

### Attributes

```text
userId            # FK → users, unique
usedBytes         # total ukuran file aktif milik user
quotaBytes        # default 104857600 (100 MB)
fileCount         # jumlah file aktif
```

### Index

```text
userId (unique)
```

### Permission

```text
Owner : read
System: write
```

---

## 7. `user_files` ⚠️ DORMANT (post-MVP)

Riwayat metadata setiap file yang diupload user ke Appwrite Storage. Relasi: `users` 1 ── N `user_files`. Tidak digunakan di MVP — semua aset pakai external URL. Infrastruktur siap diaktifkan jika feedback demo minggu pertama meminta file manager internal.

### Attributes

```text
userId            # FK → users
storageFileId     # Appwrite Storage file ID
bucketId          # bucket Appwrite penyimpanan
fileName          # nama file asli
mimeType          # tipe file
sizeBytes         # ukuran file dalam byte
status            # active | deleted
createdAt
deletedAt         # null jika masih aktif
```

### Index

```text
userId, status
storageFileId (unique)
status, createdAt DESC
```

### Permission

```text
Owner : read
System: write
Admin : read
```

---

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan kelengkapan profil, denormalisasi, & storage kuota.
- [60_API.md](60_API.md) — operasi terhadap collection ini.
