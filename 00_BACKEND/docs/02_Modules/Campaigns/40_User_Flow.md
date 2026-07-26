# Campaigns — User Flow

## Alur UMKM

```text
Buat Campaign (draft)
  ├─ Pilih Tipe Campaign (UGC / Clipping)
  ├─ Basic Info (judul, kategori, platform TikTok, deskripsi)
  ├─ Upload Asset
  │    ├─ Internal (storage) — upload via File Manager, terikat kuota 100 MB
  │    └─ External URL — link Google Drive / Dropbox / CDN, bebas kuota
  ├─ Generate Brief via AI (opsional)
  └─ Atur Reward: budget ≥ Rp50.000, jumlah kreator, tarif/1.000 views (radio Rp1.000–Rp5.000)
↓
Top-Up Budget — bayar budget + fee 2% via Midtrans
↓
Publish Campaign → active
↓
Tunggu Creator Claim
↓
Review Submission
  ├─ Approve → Reward dihitung → pending balance creator
  └─ Reject → submission ditolak
```

## Alur Creator

```text
Browse Job Board (campaign active)
↓
Pilih Campaign → Claim
↓
Validasi: profil lengkap, belum claim, claim limit tersedia
↓
Buat Konten TikTok → Submit URL TikTok
  (waktu terbatas: submissionDays hari sejak claim)
  ↓ jika lewat batas ↓
  Claim otomatis expired → slot kembali ke pool
↓
Fraud Check (otomatis)
↓
Tunggu Approve / Reject dari UMKM
```
