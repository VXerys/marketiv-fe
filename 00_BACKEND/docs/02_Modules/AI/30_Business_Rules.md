# AI — Business Rules

## Brief Generator

**Input** (dari UMKM):

- Nama produk
- Deskripsi produk
- Target market
- Goal / tujuan campaign

**Output** (brief terstruktur):

- Objective
- Content angle
- CTA (call to action)
- Brief detail
- Do & Don't

Hasil bersifat **editable + savable** — UMKM dapat mengedit lalu menyimpan ke `campaign_briefs` (lihat `../Campaigns/50_Database.md`).

---

## Fraud Detection

**Validasi yang dijalankan** terhadap submission:

- URL valid (format benar).
- URL tersedia / dapat diakses (tidak 404).
- Tidak private.
- Tidak duplikat.
- Cocok dengan platform yang diklaim.

**Output**: `fraudScore` (0–100) + level risiko.

### Threshold

| Skor   | Risiko | Status     | Aksi          |
| ------ | ------ | ---------- | ------------- |
| 0–30   | Low    | `safe`     | Auto-approve  |
| 31–70  | Medium | `review`   | Manual review |
| 71–100 | High   | `rejected` | Auto-reject   |

> Field hasil fraud (`score`, `result`, `reason`) disimpan di `../Campaigns/50_Database.md` (`fraud_checks`); ringkasan (`fraudScore`, `fraudStatus`) ada di `campaign_submissions`. Modul AI menautkan, tidak mendefinisikan ulang.
