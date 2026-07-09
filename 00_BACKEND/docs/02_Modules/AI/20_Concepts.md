# AI — Concepts

## Istilah

- **Brief Generator** — fitur AI yang menghasilkan brief campaign terstruktur dari input produk UMKM.
- **Fraud Detection** — fitur AI yang menganalisis submission konten creator untuk mendeteksi indikasi kecurangan (URL tidak valid, duplikat, dll).
- **fraudScore** — angka 0–100 yang merepresentasikan tingkat risiko kecurangan.
- **Landing Assistant** — fitur opsional untuk membantu konten landing page UMKM.
- **ai_requests** — log seluruh permintaan AI yang tercatat di sistem.

## Konsep

- Semua pemanggilan AI berjalan server-side via Appwrite Functions; API key OpenAI tidak pernah terekspos ke client.
- Hasil fraud detection disimpan di modul Campaigns (`fraud_checks`), bukan di modul AI.
