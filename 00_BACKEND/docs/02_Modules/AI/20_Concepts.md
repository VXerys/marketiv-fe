# AI — Concepts

## Istilah

- **Brief Generator** — fitur AI yang menghasilkan brief campaign terstruktur dari input produk UMKM.
- **Fraud Detection** — fitur AI yang menganalisis submission konten creator untuk mendeteksi indikasi kecurangan (URL tidak valid, duplikat, ketidaksesuaian caption dengan brief).
- **Content Analysis (text-based)** — analisis caption & hashtag via Gemini API tanpa memproses video.
- **Content Analysis (visual)** — [Future Scope] analisis video untuk logo detection, product matching, engagement anomaly. Tidak termasuk MVP karena biaya token & latency tinggi.
- **fraudScore** — angka 0–100 yang merepresentasikan tingkat risiko kecurangan.
- **Landing Assistant** — fitur opsional untuk membantu konten landing page UMKM.
- **ai_requests** — log seluruh permintaan AI yang tercatat di sistem.

## Konsep

- Semua pemanggilan AI berjalan server-side via Appwrite Functions; API key Gemini tidak pernah terekspos ke client.
- Hasil fraud detection disimpan di modul Campaigns (`fraud_checks`), bukan di modul AI.
