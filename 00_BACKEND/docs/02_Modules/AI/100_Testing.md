# AI — Testing

## Brief Generator

- Input valid menghasilkan brief terstruktur dengan semua field wajib.
- Input kosong/null mendapat response error.
- Response time dalam batas wajar (< 10 detik).

## Fraud Detection

- Submission dengan URL valid & unik mendapat `fraudScore` rendah (0–30).
- Submission dengan URL tidak valid mendapat `fraudScore` tinggi (71–100).
- Submission duplikat (URL sama) terdeteksi sebagai duplikat.
- Submission dengan platform tidak cocok terdeteksi.
- Fraud check berjalan otomatis saat submission dibuat (event-driven).
