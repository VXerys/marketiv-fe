# AI — User Flow

## Brief Generator

```text
UMKM buka halaman Create Campaign
↓
Klik "Generate Brief dengan AI"
↓
Input: Nama Produk, Deskripsi, Target Market, Goal
↓
AI Function menghasilkan brief terstruktur
↓
UMKM edit brief (opsional)
↓
Simpan ke campaign_briefs
```

## Fraud Detection

```text
Creator submit konten campaign
↓
Trigger otomatis: campaign_submissions.create
↓
AI Fraud Detection menganalisis submission
↓
Hasil: fraudScore + status (safe/review/rejected)
↓
Tulis fraud_checks + update submission
↓
safe → auto-approve
review → manual review oleh UMKM
rejected → auto-reject
```
