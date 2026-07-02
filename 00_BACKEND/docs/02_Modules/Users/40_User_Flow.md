# Users — User Flow

## Onboarding UMKM

```text
Register → Verifikasi Email → Login
↓
Onboarding Wizard
  ├─ Nama Usaha, Kategori (pre-filled dari register)
  ├─ Deskripsi, Kota, Alamat
  ├─ Social Media (Instagram, TikTok, Website)
  └─ Upload Logo
↓
isProfileCompleted = true
↓
Dashboard UMKM
```

## Onboarding Creator

```text
Register → Verifikasi Email → Login
↓
Onboarding Wizard
  ├─ Display Name, Bio, Kota
  ├─ Avatar
  ├─ Tambah Akun Sosial (platform, username, followers)
  └─ Tambah Portfolio
↓
isProfileCompleted = true
↓
Dashboard Creator
```

## Discovery Creator

```text
UMKM buka halaman Browse Creator
↓
Filter: platform, kota
↓
Hasil: card Creator (avatar, name, city, rating, followers)
↓
Klik profil → lihat detail + rate card
```
