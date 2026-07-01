# Users — API (Profile Service)

## Get Profile

```typescript
getProfile(userId)
```

Mengembalikan profil sesuai role (umkm/creator).

## Update Profile

```typescript
updateProfile()
```

Memperbarui field profil (deskripsi, kota, logo/avatar, dll.).

## Social Accounts (Creator)

```typescript
addSocialAccount()
removeSocialAccount()
```

Mengelola entri `creator_social_accounts` (satu creator banyak akun).

## Search Creators

```typescript
searchCreators(filter)
```

Contoh filter:

```json
{
  "platform": "tiktok",
  "city": "sukabumi"
}
```

Memakai index pada `creator_profiles` (city, rating, totalFollowers) dan `creator_social_accounts` (platform, followers).

## Lihat Juga

- [50_Database.md](50_Database.md) — skema & index yang mendukung query ini.
- [30_Business_Rules.md](30_Business_Rules.md) — aturan profil.
