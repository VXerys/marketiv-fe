# 06 — Dashboard Kreator Guidelines

> Dokumen ini mendefinisikan UI/UX dashboard untuk role Kreator.

## 1. Tujuan Dashboard Kreator

Dashboard Kreator membantu kreator menemukan campaign, klaim job, submit bukti tayang, mengelola rate card, dan menarik saldo.
Dashboard harus terasa cepat, rewarding, dan jelas.
Kreator perlu melihat peluang kerja dan potensi pendapatan secepat mungkin.
Visual boleh sedikit lebih energetic dibanding dashboard UMKM, tetapi tetap memakai Marketiv Light OS.

## 2. Personality Dashboard Kreator

- Energetic.
- Opportunity-driven.
- Fast scanning.
- Rewarding.
- Creator-friendly.
- Still professional.

## 3. Struktur Navigasi Kreator

```txt
/dashboard/kreator
├── Ringkasan
├── Job Pool
├── Pekerjaan Aktif
├── Negosiasi
├── Profil
├── Rate Card
└── Keuangan
```

Job Pool adalah fitur utama untuk Campaign Mode.
Negosiasi hanya untuk Rate Card Mode.
Keuangan menampilkan saldo dan withdrawal.

## 4. Dashboard Home Kreator

Home kreator harus menonjolkan saldo, pekerjaan aktif, campaign tersedia, dan submission pending.
CTA utama: `Lihat Job Pool`.
CTA sekunder: `Kelola Rate Card`.
Dashboard harus memberi motivasi tanpa membuat klaim earning berlebihan.

### Metric Cards

```txt
Saldo Tersedia
Pekerjaan Aktif
Submission Pending
Campaign Tersedia
```

Saldo harus memakai format Rupiah.
Pending submission harus punya link ke halaman pekerjaan aktif.
Campaign tersedia harus menampilkan jumlah campaign aktif yang bisa diklaim.

## 5. Job Pool

Job Pool adalah feed campaign aktif yang bisa diklaim kreator.
Layout utama adalah card-based feed.
Mobile harus sangat nyaman untuk scroll dan scan.
Desktop boleh grid 2–3 kolom tergantung density data.

### Job Pool Card Data

- Thumbnail produk atau placeholder.
- Judul campaign.
- Niche badge.
- Bayaran per 1.000 views.
- Sisa kuota kreator.
- Total budget atau estimasi earning jika valid.
- CTA `Klaim Job Ini`.

## 6. Job Pool Filters

Filter harus membantu kreator menemukan campaign relevan.
Filter mobile boleh menggunakan bottom sheet.
Filter desktop boleh sidebar atau horizontal filter bar.

### Filter Minimum

- Search judul campaign.
- Filter niche.
- Filter bayaran per 1.000 views.
- Sort terbaru.
- Sort bayaran tertinggi.
- Sort hampir penuh.

## 7. Campaign Detail untuk Kreator

Detail campaign harus menampilkan brief, aset, bayaran, kuota, dan instruksi klaim.
CTA utama adalah `Klaim Job Ini`.
Jika kuota penuh, CTA disabled dengan teks `Kuota Penuh`.
Tidak boleh ada tombol chat, WhatsApp, email, komentar, atau kontak UMKM.

## 8. Klaim Job Flow

Saat kreator klik Klaim Job Ini, sistem harus menampilkan loading state.
Jika berhasil, arahkan ke detail pekerjaan aktif atau tampilkan success state.
Jika gagal karena kuota penuh, tampilkan error yang jelas.
Jika sudah pernah klaim campaign yang sama, tampilkan pesan bahwa job sudah ada di pekerjaan aktif.

## 9. Pekerjaan Aktif

Halaman pekerjaan aktif menampilkan campaign yang sudah diklaim.
Gunakan tabs: Semua, Belum Submit, Menunggu Validasi, Valid, Fraud/Dispute, Selesai.
Mobile memakai card list.
Desktop boleh table dengan status badge.

## 10. Submit Bukti Tayang

Submit bukti tayang harus sangat sederhana.
Hanya ada satu input utama: URL TikTok atau Instagram Reels.
Tidak boleh ada upload video langsung ke server Marketiv.
Helper text harus menjelaskan bahwa video harus sudah diposting di akun kreator.
CTA utama: `Submit Bukti Tayang`.

## 11. Submission Status

Status submission harus jelas.
Pending berarti sedang menunggu validasi.
Valid berarti bukti diterima dan dana dapat diproses.
Fraud berarti perlu review atau ada indikasi tidak valid.
Dispute berarti admin akan memeriksa kasus.
Selesai berarti proses selesai dan dana dicatat.

## 12. Rate Card Management

Kreator dapat membuat maksimal 3 rate card package.
Jika sudah mencapai 3 paket aktif, tombol tambah harus disabled.
Pesan harus jelas: `Anda sudah mencapai maksimal 3 paket. Hapus satu paket untuk menambah baru.`
Form rate card harus sederhana.

### Rate Card Fields

- Nama paket.
- Deskripsi paket.
- Harga paket.
- Deliverable.
- Estimasi hari.
- Status aktif/nonaktif.

## 13. Profil Kreator

Profil kreator harus membantu UMKM menilai kecocokan.
Field penting: foto profil, nama, bio, niche, link sosial media, dan portofolio.
Jangan memaksa kreator mengisi data terlalu banyak di awal.
Gunakan progressive completion jika dibutuhkan.

## 14. Negosiasi Rate Card Kreator

Kreator menerima chat dari UMKM pada Rate Card Mode.
Kreator dapat menerima atau menolak Custom Offer.
Custom Offer harus tampil sebagai widget khusus.
Warning Collab Post wajib tampil di atas chat.

## 15. Keuangan Kreator

Halaman keuangan kreator menampilkan saldo tersedia, dana pending, dan riwayat pencairan.
CTA utama: `Tarik Dana` jika saldo tersedia.
Jika saldo kosong, tampilkan empty state yang mengarah ke Job Pool.
Withdrawal form harus meminta nominal, bank, nomor rekening, dan nama pemilik rekening.

## 16. Copywriting Kreator

Gunakan bahasa yang cepat dan jelas.
Contoh: `Klaim Job Ini`, `Submit Bukti Tayang`, `Lihat Campaign`, `Tarik Dana`.
Boleh menggunakan tone lebih energetic, tetapi jangan berlebihan.
Jangan menjanjikan pendapatan pasti.

## 17. Empty States Kreator

Belum ada pekerjaan aktif: arahkan ke Job Pool.
Belum ada rate card: arahkan buat paket pertama.
Belum ada saldo: jelaskan saldo muncul setelah submission valid.
Belum ada negosiasi: jelaskan UMKM akan muncul saat menghubungi kreator.

## 18. Implementation Priority Kreator

Prioritas pertama: dashboard home, Job Pool, detail campaign, klaim job, pekerjaan aktif, submit bukti tayang.
Prioritas kedua: rate card management, profil kreator, negosiasi.
Prioritas ketiga: analytics performa dan portofolio lanjutan.
