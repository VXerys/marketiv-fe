# Campaigns — Views Tracking & Verifikasi Tayangan

> **Status**: Arsitektur aktif. MVP sudah diputuskan dan terkunci (T-04). Phase 2 menunggu milestone 1.000 transaksi.
>
> **Sumber keputusan**: `tasks-backend-alignment-tnc.md` (T-04), `review-tnc-marketiv-v3-cto.md` (CTO-01)

---

## Kondisi Saat Ini — MVP (Locked)

### Keputusan T-04

| Item | Keputusan |
|---|---|
| Mekanisme MVP | **Verifikasi manual oleh UMKM** dengan jejak tercatat |
| API TikTok resmi | **Ditunda** — dipicu setelah 1.000 transaksi `completed` terpenuhi |
| Scraping | **DITOLAK** permanen — anti-bot TikTok, ToS, bukti tidak sah di sengketa |
| Instagram API | Future scope, setelah TikTok Phase 2 stabil |

### Alur MVP

```text
Creator submit postUrl (tanpa input views — views diisi UMKM)
       ↓
ai-fraud-precheck: validasi URL, accessibility, dedup, caption/hashtag
       ↓
UMKM buka ReviewSubmissionModal → buka link → lihat angka views manual
       ↓
UMKM input views_count + pilih approve/reject
       ↓
review-submission Function tulis 4 field dalam 1 transaksi:
  views_count, views_captured_at, views_source = "manual_admin", views_final = true
       ↓
calculate-campaign-reward baca views_final ? views_count : doc.views
       ↓
Reward = floor(views_count / 1000) × rewardPer1000Views
Views < 1000 = Rp0 (wajib ditampilkan di UI sebelum creator submit)
```

### Skema Field — Sudah Diputuskan (T-04)

Tambahan pada `campaign_submissions`:

| Field | Type | Keterangan |
|---|---|---|
| `views_count` | integer | Angka views yang diverifikasi. Ditulis UMKM saat approve. |
| `views_captured_at` | datetime | Timestamp saat UMKM mencatat angka views. |
| `views_source` | enum `api\|scrape\|manual_admin` | MVP selalu `manual_admin`. `scrape` ada di enum tapi TIDAK boleh dipakai. |
| `views_final` | boolean | `true` = angka dikunci, tidak berubah meski ada edit pasca-approve. |

> **Penting**: `calculate-campaign-reward` harus membaca `views_final ? views_count : doc.views`. Reward tidak boleh berubah setelah views_final = true.

### Aturan Bisnis Views (CTO-01, Pasal 7.1.f–g)

1. Views diukur **saat UMKM approve** — kenaikan/penurunan setelah itu tidak mengubah reward.
2. Jika ada selisih antara angka sistem vs angka di TikTok, **angka sistem yang berlaku** (kecuali manifest error terbukti).
3. Reward dibulatkan ke bawah: `floor(views_count / 1000) × rewardPer1000Views`.
4. **Views < 1.000 = Rp0** — wajib ada banner di UI sebelum creator submit claim.
5. Creator wajib menjaga konten tetap publik minimal 30 hari pasca approval.

### Audit Log (T-04)

Setiap write `views_count` harus menghasilkan entry `audit_logs`:
```json
{
  "action": "views_captured",
  "payload": {
    "submissionId": "...",
    "views_count": 15000,
    "views_source": "manual_admin",
    "capturedBy": "<umkmUserId>"
  }
}
```

---

## UI — Apa yang Wajib Ditampilkan

### Sisi Creator

| Lokasi | Konten Wajib |
|---|---|
| Sebelum/saat submit (Tab Detail) | Banner: "Reward dihitung per 1.000 views. Di bawah 1.000 views, reward Rp0." |
| Tab "Video Kamu" — setelah submit | Views dari `views_count` (bukan `actualViews` lama), label sumber: "Diverifikasi UMKM" |
| Tab "Video Kamu" — `views_captured_at` | Tampilkan tanggal/waktu verifikasi, bukan klaim "ditarik otomatis" |
| Teks Laporan Audit Views | Wajib dikoreksi — MVP bukan sistem otomatis 24 jam; verifikasi manual UMKM |

**Teks yang harus DIHAPUS dari UI creator:**
- ~~"Data tayangan (views) ditarik otomatis dari media sosial"~~ (belum ada)
- ~~"Audit views disinkronisasikan langsung melalui API publik media sosial"~~ (belum ada)
- ~~"Sistem pemantau views beroperasi 24 jam untuk melacak performa konten"~~ (belum ada — MVP manual)

### Sisi UMKM

| Lokasi | Konten Wajib |
|---|---|
| ReviewSubmissionModal — input views | Label jelas: "Jumlah Views saat ini (buka link, lalu catat angkanya)" |
| ReviewSubmissionModal — setelah input | Tampilkan preview reward: `floor(views/1000) × tarif` |
| ReviewSubmissionModal — warning | Jika views < 1.000: tampilkan "Reward = Rp0 karena di bawah 1.000 views" |
| CampaignSubmissionCard — kolom Views | Tampilkan `views_count` + badge sumber (`manual_admin`) |
| SubmissionDetailModal | Tampilkan `views_captured_at` + `views_source` |

---

## Phase 2 — TikTok Research API (Setelah 1.000 Transaksi)

### Trigger

Milestone `transactions.status = completed` ≥ 1.000 → flip ke Phase 2:
- Aktifkan `fetch-content-views` Function
- `views_source` mulai terisi `api` untuk submission baru
- Lama (sebelum flip) tetap `manual_admin`

### API yang Digunakan

**TikTok Research API** — direkomendasikan (machine-to-machine, tidak perlu creator link akun):
- Endpoint: `POST https://open.tiktokapis.com/v2/research/video/query/`
- Data: `view_count`, `like_count`, `comment_count`, `share_count`
- Syarat: Daftar sebagai Research API partner di TikTok Developer Portal (review 1–2 minggu)
- Auth: Client Credentials (bukan OAuth creator)

```json
// Request
{
  "query": {
    "and": [{ "operation": "IN", "field_name": "id", "field_values": ["<video_id>"] }]
  },
  "fields": "id,view_count,like_count,comment_count,share_count,create_time"
}
```

**Cara ekstrak video ID dari URL TikTok**:
```
https://www.tiktok.com/@username/video/7234567890123456789
                                        ^^^^^^^^^^^^^^^^^^^ video_id
```

### Skema Tambahan (Phase 2)

Tabel baru `content_view_snapshots` — riwayat snapshot per submission:

| Attribute | Type | Keterangan |
|---|---|---|
| submissionId | string | FK → campaign_submissions |
| platform | enum | `tiktok\|instagram` |
| snapshotAt | datetime | Waktu pengambilan data |
| views | integer | View count saat snapshot |
| likes | integer | opsional |
| comments | integer | opsional |
| shares | integer | opsional |
| source | enum | `api\|manual_admin` |
| rawResponse | string | JSON response mentah (untuk audit) |

### Snapshot Schedule (Phase 2)

| Waktu setelah submit | Tujuan |
|---|---|
| H+0 | Baseline awal |
| H+1 | Deteksi lonjakan mencurigakan |
| H+24 | Performa 24 jam |
| H+72 | Performa 3 hari |
| **H+168 (H+7)** | **Snapshot final untuk reward** |

### Cloud Functions Baru (Phase 2)

- `fetch-content-views` — dipanggil cron atau dipicu event, ambil data dari TikTok Research API
- `schedule-views-snapshot` — cron tiap jam, fetch submission yang perlu update

### Fraud Enhancement (Phase 2B)

Setelah snapshot data tersedia, tambah deteksi:

| Anomali | Indikator | Aksi |
|---|---|---|
| View velocity ekstrem | Views naik >50.000/jam di H+1 | fraudScore +20 |
| Views turun drastis | Views H+7 < Views H+1 (bot clawback) | Flag review |
| Engagement ratio rendah | likes/views < 0.1% dengan views tinggi | Flag review |

---

## Phase 3 — Instagram + OAuth Flow

Instagram wajib OAuth creator (tidak ada machine-to-machine API):
- Creator hubungkan akun Instagram Business di profil
- Akun harus Business/Creator (Personal = tidak bisa diakses API)
- Token expire 60 hari → perlu auto-refresh
- Implementasi setelah infrastruktur OAuth TikTok (Phase 2) stabil

Tabel `creator_platform_tokens` (Phase 3):

| Field | Type | Keterangan |
|---|---|---|
| creatorId | string | FK → users |
| platform | enum | `tiktok\|instagram` |
| accessToken | string | **Wajib dienkripsi sebelum simpan** |
| refreshToken | string | **Wajib dienkripsi sebelum simpan** |
| expiresAt | datetime | Untuk auto-refresh |
| platformUserId | string | ID akun di platform |

> Token TIDAK boleh disimpan plaintext. Enkripsi di Cloud Function sebelum `createDocument`.

---

## Roadmap Ringkas

| Phase | Trigger | Lingkup |
|---|---|---|
| **MVP** (sekarang) | — | Manual UMKM, 4 field baru di `campaign_submissions`, banner UI, teks koreksi |
| **2A** | 1.000 transaksi | TikTok Research API, `content_view_snapshots`, cron fetch |
| **2B** | Setelah 2A stabil | Fraud velocity detection, engagement ratio check |
| **3** | Keputusan produk | Instagram OAuth, `creator_platform_tokens` |

---

## Links

- [Campaign PPV Workflow](../../03_Workflows/20_Campaign_PPV.md)
- [Submission Fraud Check](../../03_Workflows/40_Submission_Fraud.md)
- [AI Business Rules](../AI/30_Business_Rules.md)
- [Campaigns Database](50_Database.md)
- [T-04 Backend Task](../../../../terms%20&%20conditions/roadmap/tasks-backend-alignment-tnc.md)
- [CTO-01 Review](../../../../terms%20&%20conditions/review/review-tnc-marketiv-v3-cto.md)

---

*Diperbarui 2026-08-05. Selaraskan dengan T-04 (locked) dan CTO-01.*
