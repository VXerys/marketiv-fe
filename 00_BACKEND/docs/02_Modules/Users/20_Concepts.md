# Users — Concepts

## Istilah

- **Users** — record identitas inti (mirror Appwrite Auth + role/status).
- **UMKM Profile** — profil bisnis UMKM (nama usaha, kategori, kota, dll).
- **Creator Profile** — profil Content Creator (display name, bio, rating, dll).
- **Social Account** — akun media sosial Creator. Untuk MVP hanya **TikTok**; Instagram, Facebook, YouTube, dan platform lain berada di luar MVP namun tetap menjadi rencana ekspansi.
- **Portfolio** — portofolio hasil kerja Creator.
- **Discovery** — pencarian & filter Creator berdasarkan kota, range harga, dan sort by harga/rating/totalOrders.

## Konsep

- Modul Users adalah pemilik seluruh collection identitas non-Auth.
- Satu user memiliki role: `umkm`, `creator`, atau `admin`.
- Untuk MVP, Creator hanya dapat menambahkan akun TikTok sebagai akun sosial aktif.
- Struktur data tetap dibuat extensible agar platform lain dapat ditambahkan setelah MVP tanpa redesign besar.
- Data denormalisasi (`totalFollowers`, `totalOrders`, `rating`) pada `creator_profiles` untuk performa dashboard.
