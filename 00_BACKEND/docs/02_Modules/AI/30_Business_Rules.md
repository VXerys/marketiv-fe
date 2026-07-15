# AI — Business Rules

## Brief Generator

**Input** (dari UMKM & Sistem):

- `type`: Tipe campaign (`ugc` atau `clipping`)
- `materials`: Daftar atau link aset referensi produk (`campaign_assets`)
- Nama produk
- Deskripsi produk
- Target market
- Goal / tujuan campaign

**Output terstruktur** (disimpan ke `campaign_briefs` di modul Campaigns):

- `objective`: string
- `contentAngle`: string (disesuaikan tipe: *Green Screen/Voiceover/Slideshow* untuk `ugc`, atau *Highlight/Repurposing/Editing* untuk `clipping`)
- `cta`: string
- `briefDetail`: string (arah kreatif, visual, pesan kunci, arahan penggunaan aset produk/link)
- `doAndDont`: { do: string[], dont: string[] }

**Aturan**:

- **Kustomisasi Tipe & Aset Digital**: AI wajib membedakan instruksi berdasarkan tipe campaign dan aset digital yang dilampirkan (tanpa pengiriman sampel produk fisik):
  - Jika `ugc`: arahkan creator untuk membuat video TikTok dari 0 menggunakan aset foto/video produk (mis. efek Green Screen, Voiceover, atau Slideshow Montage).
  - Jika `clipping`: arahkan creator untuk memotong/mengedit ulang video panjang dari link sumber yang dilampirkan dengan *dynamic subtitle* dan *hook*.
- AI hanya menghasilkan *draft* brief. UMKM dapat mengedit sebelum menyimpan.
- Brief disimpan di database Campaigns (`../Campaigns/50_Database.md`).

---

## Fraud Detection

**Validasi yang dijalankan** terhadap submission:

- URL valid (format benar).
- URL tersedia / dapat diakses (tidak 404).
- Tidak private.
- Tidak duplikat.
- Cocok dengan platform yang diklaim.
- **Content analysis (text-based)** — Caption & hashtag diperiksa via Gemini API apakah sesuai dengan brief campaign.

> **Scope MVP:** Content analysis hanya memproses teks (caption + hashtag). Analisis visual video (logo detection, product matching, engagement anomaly) adalah **future scope** karena biaya token dan latency yang tinggi.

### Content Analysis — Input & Output Gemini API

**Input ke Gemini API** (diambil dari database submission & brief):

```json
{
  "caption": "string — caption dari campaign_submissions",
  "hashtags": "string[] — hashtag yang diekstrak dari caption",
  "brief": {
    "objective": "string — campaign_briefs.objective",
    "contentAngle": "string — campaign_briefs.contentAngle",
    "cta": "string — campaign_briefs.cta",
    "briefDetail": "string — campaign_briefs.briefDetail",
    "doAndDont": {
      "do": ["string"],
      "dont": ["string"]
    }
  }
}
```

**Output dari Gemini API** (structured JSON):

```json
{
  "captionRelevance": "number 0–100 — seberapa relevan caption dengan brief",
  "hashtagRelevance": "number 0–100 — seberapa relevan hashtag dengan brief",
  "fraudSignal": "string | null — indikasi fraud jika terdeteksi (mis. link mencurigakan, klaim palsu), null jika aman",
  "overallScore": "number 0–100 — skor keseluruhan content analysis (semakin tinggi = semakin tidak sesuai)",
  "reason": "string — penjelasan singkat hasil analisis"
}
```

**Aturan**:

- `captionRelevance` dan `hashtagRelevance` dihitung berdasarkan kesesuaian dengan `brief.objective`, `brief.contentAngle`, `brief.cta`, dan `brief.briefDetail`.
- `fraudSignal` diisi jika ada indikasi kecurangan tekstual (promosi link eksternal tidak relevan, klaim palsu, spam).
- `overallScore` adalah agregasi (bobot caption 60% + hashtag 20% + fraud signal 20%). Semakin tinggi = semakin tidak sesuai brief.
- Output dari Gemini dicatat ke `ai_requests` dengan `feature: "fraud"`.
- `overallScore` dari Gemini (0–100) dimapping ke bobot content analysis (0–20) dengan formula: `floor(overallScore * 20 / 100)`.

### Bobot Skor Validasi

| Validasi | Bobot |
|---|---|
| URL valid | +30 |
| URL accessibility | +25 |
| Platform match | +20 |
| Deduplikasi | +25 |
| Content analysis text | +20 |
| Content analysis visual (future) | +TBD |

**Output**: `fraudScore` (0–100) + level risiko.

### Threshold

| Skor   | Risiko | Status     | Aksi          |
| ------ | ------ | ---------- | ------------- |
| 0–30   | Low    | `safe`     | Auto-approve  |
| 31–70  | Medium | `review`   | Manual review |
| 71–100 | High   | `rejected` | Auto-reject   |

> Field hasil fraud (`score`, `result`, `reason`) disimpan di `../Campaigns/50_Database.md` (`fraud_checks`); ringkasan (`fraudScore`, `fraudStatus`) ada di `campaign_submissions`. Modul AI menautkan, tidak mendefinisikan ulang.
