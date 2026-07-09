# Users — Concepts

## Istilah

- **Users** — record identitas inti (mirror Appwrite Auth + role/status).
- **UMKM Profile** — profil bisnis UMKM (nama usaha, kategori, kota, dll).
- **Creator Profile** — profil Content Creator (display name, bio, rating, dll).
- **Social Account** — akun media sosial Creator (TikTok, Instagram, YouTube).
- **Portfolio** — portofolio hasil kerja Creator.
- **Discovery** — pencarian & filter Creator berdasarkan platform, kota, dll.

## Konsep

- Modul Users adalah pemilik seluruh collection identitas non-Auth.
- Satu user memiliki role: `umkm`, `creator`, atau `admin`.
- Creator dapat memiliki banyak akun sosial dan portofolio.
- Data denormalisasi (`totalFollowers`, `totalOrders`, `rating`) pada `creator_profiles` untuk performa dashboard.
