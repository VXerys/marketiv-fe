# Rate Cards — Overview

Rate card adalah etalase layanan creator. Setiap creator dapat mempublikasikan rate card berisi beberapa paket (umumnya **Basic / Standard / Premium**) yang bisa dipesan UMKM.

## Alur

1. **Create Rate Card** — Creator membuat rate card (`draft`) dan menambahkan paket-paketnya.
2. **Publish** — Rate card berstatus `published` agar muncul di profil & discovery.
3. **Discovery** — UMKM menelusuri creator (filter kota, range harga, sort by harga/rating/totalOrders) lalu melihat rate card-nya.
4. **Order** — UMKM memesan paket → masuk alur Order/Offer (lihat modul Orders/Offers).

## Aktor

- **Content Creator** — pemilik & pengelola rate card.
- **UMKM** — menelusuri dan memesan paket.

## Koleksi yang Dimiliki

`rate_cards`, `rate_card_packages`. Skema lengkap di `50_Database.md`.

> Discovery creator (`searchCreators`) bersama modul Users — lihat `60_API.md`.
