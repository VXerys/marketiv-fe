# Tab 14 — Views Audit & UI Consistency Sprint Plan

**Tujuan:** Audit dan perbaiki seluruh UI terkait fitur views (tayangan video konten kreator) agar selaras dengan keputusan T-04 (MVP = manual UMKM, locked), CTO-01 (banner wajib, reward formula), dan desain sistem Marketiv v5.8.

**Referensi:** [`95_Views_Tracking.md`](95_Views_Tracking.md) — baca dulu sebelum mengambil task apapun di tab ini.

**Prinsip:** UI tidak boleh mengklaim fitur yang belum ada (API otomatis, 24 jam monitoring). Teks harus jujur tentang mekanisme MVP.

---

## Temuan Audit (Baseline)

### ❌ Creator Side — `ActiveWorkDetailView.tsx`

| # | Lokasi | Masalah | Tindakan |
|---|---|---|---|
| C1 | Baris 829 — `Campaign Mode rules` | `"Audit views disinkronisasikan langsung melalui API publik media sosial."` — SALAH untuk MVP | Ganti dengan teks manual verification |
| C2 | Baris 901–903 — `Laporan Audit Views` card | `"Sistem pemantau views beroperasi 24 jam untuk melacak performa konten."` — SALAH, MVP manual | Revisi menjadi penjelasan proses manual UMKM |
| C3 | Baris 881 — Video tab, setelah submit | `"Data tayangan (views) ditarik otomatis dari media sosial."` — SALAH | Ganti: verifikasi dilakukan UMKM saat approve |
| C4 | Baris 684 — Detail tab, card estimasi | `"Dana reward dihitung berkala berdasarkan data views video yang disinkronkan oleh sistem audit admin Marketiv."` — misleading | Klarifikasi: UMKM input manual saat approve |
| C5 | Tidak ada | **Banner "Di bawah 1.000 views = Rp0" TIDAK ADA** di form submit | Tambah wajib (CTO-01 + T-04) |
| C6 | Tab "Video Kamu" — sidebar kanan | `Laporan Audit Views` berisi klaim sistem 24 jam | Ubah jadi `Cara Kerja Verifikasi Views` yang jujur |
| C7 | Tab "Video Kamu" — tidak ada | Tidak tampilkan kapan views diverifikasi (`views_captured_at`) | Tambah setelah field tersedia |
| C8 | Tab "Video Kamu" — tidak ada | Tidak tampilkan sumber verifikasi (`views_source`) | Tambah badge "Diverifikasi UMKM" setelah field tersedia |

### ❌ UMKM Side — `ReviewSubmissionModal.tsx`

| # | Lokasi | Masalah | Tindakan |
|---|---|---|---|
| U1 | Baris 112–119 — "Views Terkumpul" | Menampilkan `submission.actualViews` yang bisa 0 sebelum diverifikasi — membingungkan | Label ulang jadi "Views Self-Reported Creator" atau sembunyikan jika 0 |
| U2 | Baris 169–193 — input views | **Tidak ada preview reward realtime** saat UMKM ketik angka | Tambah preview: `floor(views/1000) × tarif = Rp xxx` |
| U3 | Tidak ada | **Tidak ada warning views < 1.000 = Rp0** | Tambah inline warning saat views < 1000 |
| U4 | Tidak ada | Tidak ada konfirmasi bahwa angka ini **final** (views_final = true) | Tambah note: "Angka ini dikunci setelah disimpan" |
| U5 | Baris 168 — komentar | `views_count` tulis ke `campaign_submissions.views` (field lama) | Setelah schema BE update: tulis ke `views_count` + `views_source` + `views_captured_at` + `views_final` |

### ❌ `CampaignSubmissionCard.tsx`

| # | Lokasi | Masalah | Tindakan |
|---|---|---|---|
| S1 | Baris 71–75 — kolom Views | Tampilkan `submission.actualViews` — sudah benar, tapi tidak ada indikator sumber | Setelah schema: tambah badge kecil sumber (`manual_admin` / `api`) |

### ❌ Type `CreatorActiveWork` — `creator-dashboard.ts`

| # | Field | Masalah | Tindakan |
|---|---|---|---|
| T1 | `actualViews?: number` | Ada, tapi tidak ada `viewsSource`, `viewsCapturedAt`, `viewsFinal` | Tambah setelah schema BE tersedia |

---

## Task List

### ⬜ `views-audit` — Audit Lengkap
**Owner:** FE  
**Estimasi:** 1 sesi

Traversal manual seluruh halaman yang tampilkan data views:
- [ ] `/kreator/pekerjaan-aktif` — list card, views chip
- [ ] `/kreator/pekerjaan-aktif/[id]` — Tab Detail + Tab Video Kamu
- [ ] `/umkm/campaign/[id]` — CampaignSubmissionSection + CampaignSubmissionCard
- [ ] ReviewSubmissionModal — form approve dengan input views
- [ ] SubmissionDetailModal — tampilan detail submission yang sudah diproses

Dokumentasikan setiap teks yang mengklaim API/otomatis.

---

### ⬜ `views-copy-fix` — Koreksi Teks Misleading
**Owner:** FE  
**File:** `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`  
**Blocker:** Tidak ada — bisa dikerjakan langsung

**C1 — Baris 829:** Ganti:
```
❌ "Audit views disinkronisasikan langsung melalui API publik media sosial."
✅ "Verifikasi jumlah tayangan dilakukan oleh UMKM secara manual saat menyetujui bukti tayang."
```

**C2 — Baris 901–903:** Ganti seluruh blok `Laporan Audit Views`:
```
❌ "Sistem pemantau views beroperasi 24 jam untuk melacak performa konten. 
    Views yang dihitung hanya views riil (bukan bot)."

✅ JUDUL: "Cara Kerja Verifikasi Views"
   ISI:   "UMKM membuka link video kamu, mencatat jumlah tayangan yang terlihat, 
           dan memasukkannya saat menyetujui bukti tayang. Angka ini menjadi dasar 
           perhitungan reward dan dikunci setelah disetujui."
```

**C3 — Baris 881:** Ganti:
```
❌ "Data tayangan (views) ditarik otomatis dari media sosial. Harap tidak menghapus 
    video minimal 30 hari pasca audit agar reward tidak dibatalkan."

✅ "UMKM akan memverifikasi jumlah views video ini saat menyetujui bukti tayang. 
    Pastikan video tetap publik minimal 30 hari pasca persetujuan agar reward tidak dibatalkan."
```

**C4 — Baris 684:** Ganti:
```
❌ "Dana reward dihitung berkala berdasarkan data views video yang disinkronkan 
    oleh sistem audit admin Marketiv."

✅ "Reward dihitung dari jumlah views yang diverifikasi UMKM saat menyetujui bukti tayang: 
    floor(views / 1.000) × tarif per 1K views. Views di bawah 1.000 = Rp0."
```

---

### ⬜ `views-banner` — Banner Wajib Sebelum Submit
**Owner:** FE  
**File:** `src/components/features/creator-dashboard/ActiveWorkDetailView.tsx`  
**Blocker:** Tidak ada — bisa dikerjakan langsung

Tambah banner di dalam form submit (Tab Detail, sebelum input URL), **wajib selalu muncul** bukan hanya saat kondisi tertentu.

**Posisi:** Setelah heading "Submit Bukti Tayang (Link URL)", sebelum warning PASTIKAN.

**Desain:** Mengikuti Marketiv Studio System v5.8 — info banner (biru/purple tint), border soft, rounded-radius-2:

```tsx
{/* Banner wajib T-04 + CTO-01: views < 1000 = Rp0 */}
<div className="flex items-start gap-2.5 bg-violet-50/60 border border-violet-200/50 rounded-[16px] px-4 py-3">
  <Info className="w-4 h-4 shrink-0 text-violet-500 mt-0.5" />
  <div className="text-[11px] text-violet-900 font-semibold leading-relaxed">
    <span className="font-extrabold block mb-0.5">Cara Hitung Reward</span>
    Reward = (jumlah views ÷ 1.000) × tarif per 1K views, dibulatkan ke bawah.{" "}
    <span className="font-extrabold text-violet-700">Di bawah 1.000 views, reward = Rp0.</span>
  </div>
</div>
```

---

### ⬜ `views-review-modal` — Upgrade ReviewSubmissionModal
**Owner:** FE  
**File:** `src/components/features/umkm-dashboard/campaign/modals/ReviewSubmissionModal.tsx`  
**Blocker:** Tidak ada — bisa dikerjakan langsung

**U1 — Relabel "Views Terkumpul":**  
Jika `submission.actualViews === 0`, tampilkan `"—"` (bukan "0 Views") dengan label:  
`"Views Self-Reported"` (sebelum UMKM verifikasi) atau `"Views Terverifikasi"` (setelah).

**U2 — Preview Reward Realtime:**  
Tepat di bawah input views, tambah live preview yang update saat mengetik:

```tsx
{/* Preview reward — update live saat ketik */}
{selectedStatus === "approved" && viewsInput.trim() !== "" && (
  <div className="mt-2 flex items-center justify-between bg-neutral-50 border border-neutral-200/50 rounded-xl px-3.5 py-2.5">
    <span className="text-[11px] font-semibold text-text-secondary">Estimasi Reward Kreator</span>
    <span className={cn(
      "text-sm font-extrabold",
      views < 1000 ? "text-danger" : "text-success"
    )}>
      {views < 1000
        ? "Rp0 (di bawah 1.000 views)"
        : formatCurrency(Math.floor(views / 1000) * submission.ratePerThousandViews)
      }
    </span>
  </div>
)}
```

> `submission.ratePerThousandViews` perlu ditambah ke type `CampaignSubmission`.

**U3 — Warning views < 1.000:**
```tsx
{selectedStatus === "approved" && viewsValid && views < 1000 && (
  <p className="mt-1 text-[11px] font-semibold text-amber-700 flex items-center gap-1">
    <TriangleAlert className="w-3.5 h-3.5 shrink-0" />
    Views di bawah 1.000 — reward kreator akan Rp0. Pastikan angka sudah benar.
  </p>
)}
```

**U4 — Note angka dikunci:**
```tsx
<p className="mt-1.5 text-[11px] text-text-muted leading-relaxed">
  Buka tautan kontennya, lalu masukkan jumlah views yang Anda lihat.{" "}
  <span className="font-semibold text-text-secondary">
    Angka ini dikunci setelah disimpan dan menjadi dasar reward kreator.
  </span>
</p>
```

---

### ⬜ `views-metadata` — Tampilkan Metadata Verifikasi
**Owner:** FE  
**File:** `ActiveWorkDetailView.tsx`, `SubmissionDetailModal.tsx`  
**Blocker:** Menunggu `views-schema-be` — field `views_captured_at` dan `views_source` harus ada dulu di Appwrite

**Creator — Tab "Video Kamu" sidebar:**  
Setelah `views_captured_at` tersedia, ubah sidebar kanan dari teks statis menjadi:

```tsx
<div className="bg-neutral-50 border border-neutral-200/50 rounded-[22px] p-6 space-y-4">
  <h4 className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest">
    Detail Verifikasi
  </h4>
  <div className="space-y-3">
    <div>
      <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
        Diverifikasi Oleh
      </span>
      <span className="text-xs font-bold text-neutral-700">
        {work.viewsSource === "manual_admin" ? "UMKM (Manual)" : "Sistem API"}
      </span>
    </div>
    {work.viewsCapturedAt && (
      <div>
        <span className="block text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-0.5">
          Waktu Verifikasi
        </span>
        <span className="text-xs font-semibold text-neutral-600">
          {new Date(work.viewsCapturedAt).toLocaleDateString("id-ID", {
            day: "numeric", month: "long", year: "numeric",
            hour: "2-digit", minute: "2-digit"
          })} WIB
        </span>
      </div>
    )}
    {work.viewsFinal && (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 rounded-xl px-3 py-2">
        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
        Angka views sudah dikunci. Reward tidak akan berubah.
      </div>
    )}
  </div>
</div>
```

**Type update yang diperlukan di `CreatorActiveWork`:**
```ts
viewsSource?: "api" | "manual_admin";
viewsCapturedAt?: string;
viewsFinal?: boolean;
```

---

### ⬜ `views-schema-be` — Schema Backend
**Owner:** BE  
**File:** `campaign_submissions` collection di Appwrite

Tambah 4 field ke collection `campaign_submissions`:

| Field | Type | Required | Notes |
|---|---|---|---|
| `views_count` | Integer | No | Default null (0 bisa salah diinterpretasi) |
| `views_captured_at` | Datetime | No | |
| `views_source` | Enum: `api\|scrape\|manual_admin` | No | Default null |
| `views_final` | Boolean | No | Default false |

Update `review-submission` Function untuk menulis ke-4 field **dalam transaksi yang sama dengan perubahan status**.

Update `calculate-campaign-reward` Function:
```js
const viewsToUse = doc.views_final && doc.views_count != null
  ? doc.views_count
  : doc.views;
const reward = Math.floor(viewsToUse / 1000) * rewardPer1000Views;
```

Update service mapper di frontend (`umkm-appwrite.service.ts`) untuk map `views_count`, `views_captured_at`, `views_source`, `views_final`.

---

### ⬜ `views-verify` — Verifikasi Responsif
**Owner:** FE  
**Devices:** 375px (iPhone SE), 390px (iPhone 15), 768px (tablet), desktop

Checklist per screen:

**Creator `/kreator/pekerjaan-aktif/[id]`:**
- [ ] Banner "Di bawah 1.000 views = Rp0" terlihat jelas di 375px, tidak terpotong
- [ ] Tab "Video Kamu" — grid 2-kolom kolaps ke 1-kolom di mobile
- [ ] Sidebar detail verifikasi tidak overflow di mobile
- [ ] Semua tap target ≥ 44px

**UMKM ReviewSubmissionModal:**
- [ ] Modal di mobile menggunakan drawer bottom (ResponsiveModal sudah handle)
- [ ] Preview reward cukup ruang di 375px
- [ ] Warning views < 1000 tidak tertutup keyboard saat input

**UMKM CampaignSubmissionCard:**
- [ ] Kolom Views + badge sumber tidak overflow di mobile
- [ ] Collapse ke layout stacked (ResponsiveDataRow sudah handle)

---

## Urutan Pengerjaan yang Direkomendasikan

```
views-audit   →  views-copy-fix   →  views-banner   →  views-review-modal
                                                              ↓
                                   views-schema-be  →  views-metadata
                                                              ↓
                                                       views-verify
```

Task `views-copy-fix`, `views-banner`, dan `views-review-modal` tidak butuh backend — bisa langsung dikerjakan sekarang. `views-metadata` **menunggu** `views-schema-be` selesai.

---

## Desain Visual (Referensi v5.8)

### Banner informasi (info tone)
```
bg: violet-50/60   border: violet-200/50   text: violet-900
radius: rounded-[16px]   padding: px-4 py-3
icon: lucide Info w-4 h-4 text-violet-500
```

### Warning destructive (inline, bukan modal)
```
text: amber-700 (views < 1000, konteks warning bukan error)
text: danger / red (views 0, angka tidak valid)
icon: lucide TriangleAlert w-3.5 h-3.5
```

### Reward preview inline
```
container: bg-neutral-50 border-neutral-200/50 rounded-xl px-3.5 py-2.5
label: text-[11px] text-text-secondary
value (valid): text-sm font-extrabold text-success
value (< 1000): text-sm font-extrabold text-danger
```

### Badge sumber views
```
manual_admin: tone gray/slate   →  "Diverifikasi UMKM"
api:          tone blue         →  "Diverifikasi Sistem"
```

---

## Links

- [`95_Views_Tracking.md`](95_Views_Tracking.md) — arsitektur views lengkap
- [`tasks-backend-alignment-tnc.md`](../../../../terms%20&%20conditions/roadmap/tasks-backend-alignment-tnc.md) — T-04
- [`ActiveWorkDetailView.tsx`](../../../../../src/components/features/creator-dashboard/ActiveWorkDetailView.tsx)
- [`ReviewSubmissionModal.tsx`](../../../../../src/components/features/umkm-dashboard/campaign/modals/ReviewSubmissionModal.tsx)
- [`CampaignSubmissionCard.tsx`](../../../../../src/components/features/umkm-dashboard/campaign/detail/CampaignSubmissionCard.tsx)

---

*Dibuat 2026-08-05. Semua C1–C8 dan U1–U5 diidentifikasi dari audit kode langsung.*
