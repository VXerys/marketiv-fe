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
instagram
tiktok
website
logoUrl
isProfileCompleted
```

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

Relasi: `creator_profiles` 1 ── N `creator_social_accounts`. Satu creator bisa punya banyak akun.

### Attributes

```text
creatorId
platform            # tiktok | instagram | youtube | ...
username
followers
engagementRate
isVerified
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

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — aturan kelengkapan profil & denormalisasi.
- [60_API.md](60_API.md) — operasi terhadap collection ini.
