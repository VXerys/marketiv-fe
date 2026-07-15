# Workflow: Submission Fraud Check

## Purpose

Saat submission campaign masuk, `ai-fraud-precheck` menghitung risk score dan merutekan submission ke salah satu jalur: auto-approve (low risk), antrian review manual admin (medium risk), atau auto-reject (high risk) — sebelum UMKM mengambil keputusan akhir.

## Modules Involved

- [Campaigns](../02_Modules/Campaigns/00_Index.md) — submission & status update.
- [AI](../02_Modules/AI/00_Index.md) — analisis fraud & risk score.
- [Notifications](../02_Modules/Notifications/00_Index.md) — notifikasi hasil fraud ke UMKM & creator.
- Admin — review antrian risk medium.

## Trigger

Event `campaign_submissions.create` — terpicu saat creator submit hasil campaign (lihat [20_Campaign_PPV.md](20_Campaign_PPV.md) langkah 19).

## Data Model — Collection yang Terlibat

| Collection | Modul | Aksi |
|---|---|---|
| `campaign_submissions` | Campaigns | update `fraudScore`, `fraudStatus`, `status` |
| `fraud_checks` | Campaigns | insert hasil tiap pengecekan |
| `ai_requests` | AI | insert log request |
| `notifications` | Notifications | insert notifikasi hasil |

## Step-by-step Flow

### Tahap 1: Trigger Fraud Check

1. **Campaigns** — Creator `createSubmission()` → buat `campaign_submissions` dengan `status: pending`.
2. **Event `campaign_submissions.create`** memicu function **`ai-fraud-precheck`**.
3. Function membaca submission: `{ postUrl, platform, claimId, campaignId, creatorId }`.

### Tahap 2: AI Fraud Detection

4. **AI** — Function `ai-fraud-precheck` menjalankan serangkaian validasi terhadap submission:
   - **URL validation**: format URL valid, tidak kosong.
   - **Accessibility**: URL dapat diakses (tidak 404, tidak private/requires login).
   - **Platform match**: untuk MVP, domain URL harus cocok dengan TikTok (mis. tiktok.com atau vm.tiktok.com → platform: tiktok).
   - **Deduplication**: URL belum pernah disubmit untuk campaign yang sama (cek `campaign_submissions.postUrl`).
   - **Content analysis** — Analisis caption/hashtag via Gemini API (detail input/output & aturan di `../02_Modules/AI/30_Business_Rules.md`):
     - Input: caption, hashtags, brief (objective, contentAngle, cta, briefDetail, doAndDont)
     - Output: captionRelevance, hashtagRelevance, fraudSignal, overallScore, reason
     - > **Catatan:** Analisis visual video (logo detection, product matching, engagement anomaly) adalah **future scope**. Saat ini content analysis hanya memproses teks (caption + hashtag).
5. **AI** — Hitung `fraudScore` (0–100) berdasarkan bobot tiap validasi.
6. **AI** — Tulis hasil ke `fraud_checks`:
   ```
   { submissionId, score, result, reason: ["reason1", "reason2"] }
   ```
7. **AI** — Update `campaign_submissions`:
   ```
   { fraudScore, fraudStatus: safe|review|rejected }
   ```

### Tahap 3: Routing Berdasarkan Score

| Skor | Risiko | fraudStatus | Aksi Otomatis |
|---|---|---|---|
| 0–30 | Low | `safe` | Auto-approve: `submission.status → approved` |
| 31–70 | Medium | `review` | Manual review: submission tetap `pending`, masuk Fraud Queue Admin |
| 71–100 | High | `rejected` | Auto-reject: `submission.status → rejected` |

8. **Jika Auto-Approve (0–30):**
   - `submission.status: pending → approved`.
   - **Notifications** — Notifikasi ke creator: "Submission {campaignTitle} lolos fraud check & disetujui".
   - **Notifications** — Notifikasi ke UMKM: "Submission {creatorName} sudah di-approve otomatis".
   - **Event `submissions.status (pending→approved)`** terpicu → memicu `calculate-campaign-reward` (lihat [20_Campaign_PPV.md](20_Campaign_PPV.md) langkah 26).

9. **Jika Auto-Reject (71–100):**
   - `submission.status: pending → rejected`.
   - **Notifications** — Notifikasi ke creator: "Submission {campaignTitle} ditolak oleh sistem fraud — {reason}".
   - Creator dapat menghubungi admin via WhatsApp untuk appeal (lihat [60_Dispute.md](60_Dispute.md)).

10. **Jika Manual Review (31–70):**
    - Submission tetap `pending` dengan `fraudStatus: review`.
    - **Notifications** — Notifikasi ke UMKM: "Submission {creatorName} butuh review — cek Fraud Queue".
    - Submission muncul di **Fraud Queue Admin**.

### Tahap 4: Admin Review (untuk Medium Risk)

11. **Admin** — Buka Fraud Queue → lihat daftar submission `fraudStatus: review`.
12. **Admin** — Review detail: submission data, hasil fraud check (`fraud_checks`), riwayat creator.
13. **Admin** — Ambil keputusan:
    - **Approve**: `submission.status: pending → approved`. Sama seperti auto-approve (langkah 8).
    - **Reject**: `submission.status: pending → rejected`. Sama seperti auto-reject (langkah 9).
    - **Ban Creator**: reject submission + suspend akun creator (`users.status → suspended`).

### Tahap 5: UMKM Final Decision

14. **Campaigns** — Terlepas dari hasil fraud (auto/admin), UMKM tetap dapat `approveSubmission()` / `rejectSubmission()` untuk submission yang masih berstatus `pending`.
15. Approval oleh UMKM juga memicu **`submissions.status (pending→approved)`** → `calculate-campaign-reward`.

## State Transitions

```text
submission.create (pending)
        ↓
ai-fraud-precheck
        ↓
  ┌────┼────┐
  │    │    │
safe  review rejected
  │    │    │
auto- admin auto-
approve review reject
  │    │    │
  ↓    ↓    ↓
approved approved rejected
(pending (pending (pending
→approved)→approved)→rejected)
```

## Events / Functions

| Trigger | Function | Aksi |
|---|---|---|
| `campaign_submissions.create` | `ai-fraud-precheck` | Jalankan AI fraud detection, routing |
| `campaign_submissions.status (pending→approved)` | `calculate-campaign-reward` | Hitung reward (downstream, di Campaign PPV) |

## Validation Rules per Langkah

| Langkah | Validasi | Gagal → |
|---|---|---|
| URL validation | URL format valid | Score += 30 |
| URL accessibility | URL dapat diakses (200 OK) | Score += 25 |
| Platform match | Domain cocok platform | Score += 20 |
| Platform MVP | Platform harus `tiktok`; platform lain belum didukung MVP | Score += 20 / reject sesuai rule |
| Deduplication | URL belum pernah submit | Score += 25 (langsung flag) |
| Content analysis (text) | Caption & hashtag sesuai brief | Score += 20 |
| Content analysis (visual) | Logo/produk sesuai brief (future scope) | Score += TBD |
| Admin approve/reject | Submission harus `fraudStatus: review` | Error status |
| UMKM approve/reject | Submission harus `pending` status | Error status |

## Notifikasi

| Titik | Notifikasi | Penerima |
|---|---|---|
| Auto-approve (low risk) | "Submission lolos fraud check & disetujui" | Creator |
| Auto-approve (low risk) | "Submission di-approve otomatis" | UMKM |
| Manual review (medium risk) | "Submission butuh review" | UMKM + Admin |
| Auto-reject (high risk) | "Submission ditolak oleh sistem: {reason}" | Creator |
| Admin approve | "Submission disetujui admin" | Creator + UMKM |
| Admin reject | "Submission ditolak admin" | Creator |
| Creator banned | "Akun disuspend karena fraud" | Creator |

## Edge Cases

- **URL tidak valid / 404** — fraud check tidak bisa lanjut → auto-flag sebagai high risk (score > 70). Creator bisa upload ulang.
- **Submission duplikat (URL sama)** — langsung flag high risk. Mencegah creator submit konten yang sama ke campaign berbeda atau berkali-kali.
- **Creator di-ban dari antrian fraud** — submission reject + `users.status = suspended`. Semua claim/submission aktif milik creator jadi invalid.
- **Creator appeal atas auto-reject** — hubungi admin via WhatsApp. Proses appeal di luar platform.
- **AI function timeout/gagal** — submission tetap `pending`. Admin harus review manual. Sistem memberi flag `fraud_check_failed` di submission.
- **Fraud check byokas** — jika AI tidak dapat mengakses URL (private account), validasi accessibility gagal, score tinggi. Creator harus memastikan akun publik saat submit.
- **UMKM approve submission yang auto-reject** — tidak bisa; submission sudah `rejected`. Hanya admin yang bisa override.
- **Reward dihitung double** — tidak mungkin karena `calculate-campaign-reward` hanya terpicu saat `pending→approved` (sekali transisi).

## Links

- [Campaigns](../02_Modules/Campaigns/00_Index.md)
- [AI](../02_Modules/AI/00_Index.md)
- [Campaign PPV workflow](20_Campaign_PPV.md)
- [Dispute workflow](60_Dispute.md) — hubungi admin untuk appeal
