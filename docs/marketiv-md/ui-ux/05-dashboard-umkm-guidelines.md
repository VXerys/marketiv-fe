# 05 — Dashboard UMKM Guidelines

> Dokumen ini mendefinisikan UI/UX dashboard untuk role UMKM.

## 1. Tujuan Dashboard UMKM

Dashboard UMKM membantu pemilik usaha membuat campaign, mengelola budget, melihat performa, dan memantau escrow.
Dashboard harus terasa aman, jelas, dan tidak teknis.
Target user UMKM memiliki literasi digital menengah, sehingga instruksi harus sangat eksplisit.
Setiap halaman harus menjawab pertanyaan: apa status saya sekarang dan apa langkah berikutnya?

## 2. Personality Dashboard UMKM

- Calm.
- Guided.
- Trust-first.
- Business-oriented.
- Low jargon.
- Actionable.

## 3. Struktur Navigasi UMKM

```txt
/dashboard/umkm
├── Ringkasan
├── Campaign
├── Buat Campaign
├── Kreator
├── Negosiasi
└── Keuangan
```

Menu Campaign dan Buat Campaign boleh digabung secara visual tetapi route tetap jelas.
Menu Negosiasi hanya untuk Rate Card Mode.
Campaign Mode tidak boleh memiliki fitur chat.

## 4. Dashboard Home UMKM

Home dashboard harus summary-first.
Elemen utama adalah campaign aktif, total budget escrow, estimasi views, dan submission menunggu validasi.
CTA utama adalah `Buat Campaign Baru`.
CTA sekunder boleh berupa `Cari Kreator` untuk Rate Card Mode.

### Metric Cards

```txt
Campaign Aktif
Budget di Escrow
Submission Menunggu
Estimasi Total Views
```

Metric harus memakai format angka lokal Indonesia.
Nominal uang harus memakai format Rupiah.
Views harus memakai format singkat jika besar, misalnya 12.400 views.

## 5. Campaign List UMKM

Campaign list menampilkan semua campaign milik UMKM.
Gunakan tabs status: Semua, Draft, Aktif, Penuh, Selesai, Dibatalkan.
Desktop boleh table.
Mobile wajib card list.

### Data Campaign List

- Judul campaign.
- Niche.
- Status.
- Budget escrow.
- Kuota kreator.
- Submission masuk.
- Tanggal dibuat.
- Aksi lihat detail.

## 6. Campaign Detail UMKM

Campaign detail harus memperlihatkan status campaign secara jelas.
Bagian atas menampilkan status, budget, kuota, dan progress.
Bagian tengah menampilkan brief dan aset.
Bagian bawah menampilkan submission kreator.
Jangan menampilkan chat di halaman ini.

## 7. Campaign Builder Wizard

Campaign builder harus multi-step.
Jangan menggunakan form panjang satu halaman.
Wizard memberi rasa aman karena user tahu prosesnya bertahap.

### Step 1 — Informasi Produk

Fields wajib: nama produk atau judul campaign, deskripsi brief, niche.
Tombol AI Brief Assistant boleh muncul di textarea brief.
Helper text harus menjelaskan bahwa brief akan dibaca kreator.
Minimum karakter harus dijelaskan sebelum error terjadi.

### Step 2 — Aset Mentah

UMKM dapat upload foto/logo maksimal 100MB atau memasukkan URL Google Drive/Dropbox.
Untuk video mentah, arahkan user menggunakan URL eksternal.
Warning orange soft harus selalu tampil di step ini.
Error upload harus spesifik dan actionable.

### Step 3 — Budget dan Kuota

Input harga per 1.000 views harus memakai format Rupiah.
Tampilkan rekomendasi range Rp 2.000 sampai Rp 10.000.
Input kuota kreator harus jelas.
Total budget escrow harus memiliki helper text.
Ringkasan biaya wajib memperlihatkan komisi platform 15%.

### Step 4 — Review dan Pembayaran

Tampilkan seluruh data penting sebelum user membayar.
CTA utama: `Bayar Sekarang via Escrow`.
Jelaskan bahwa dana ditahan oleh sistem sampai pekerjaan tervalidasi.
Jangan memakai istilah teknis payment gateway tanpa penjelasan.

## 8. Keuangan UMKM

Halaman keuangan harus trust-first.
Tampilkan total deposit, dana escrow aktif, refund, dan transaksi terakhir.
Setiap transaksi harus punya status yang jelas.
Jika pembayaran gagal, tampilkan tombol ulangi pembayaran.

## 9. Direktori Kreator untuk UMKM

Direktori kreator digunakan untuk Rate Card Mode.
Gunakan grid card dengan filter niche, harga, dan sort.
CTA pada card adalah `Lihat Profil`.
Jangan langsung membuat order tanpa user melihat detail paket.

## 10. Profil Kreator dari Sisi UMKM

Profil kreator harus menampilkan bio, niche, portofolio, dan rate card maksimal 3 paket.
CTA utama: `Hubungi Kreator` atau `Mulai Negosiasi`.
CTA ini hanya berlaku untuk Rate Card Mode.
Jika user sedang di Campaign Mode, jangan arahkan ke chat.

## 11. Negosiasi Rate Card UMKM

Negosiasi memakai live chat hanya pada Rate Card Mode.
UMKM dapat mengirim Custom Offer.
Custom Offer harus berbentuk bubble khusus, bukan pesan teks biasa.
Warning Collab Post wajib tampil di atas chat.

## 12. Copywriting UMKM

Gunakan kata kerja jelas: Buat, Bayar, Lihat, Kirim, Batalkan.
Hindari jargon seperti GMV, conversion, creative asset jika tidak dijelaskan.
Gunakan istilah `Dana ditahan sementara` untuk menjelaskan escrow.
Gunakan istilah `Bukti Tayang` untuk URL hasil posting kreator.

## 13. Empty States UMKM

Belum ada campaign: arahkan buat campaign pertama.
Belum ada transaksi: jelaskan transaksi akan muncul setelah pembayaran.
Belum ada negosiasi: arahkan cari kreator.
Belum ada submission: jelaskan kreator belum mengirim bukti tayang.

## 14. Risk and Trust Messaging

Marketiv harus menonjolkan sistem escrow.
Jelaskan dana tidak langsung masuk ke kreator.
Jelaskan kreator dibayar setelah bukti tervalidasi.
Jelaskan refund jika campaign dibatalkan sesuai aturan.
Jangan membuat pesan yang menjanjikan hasil viral pasti.

## 15. Implementation Priority UMKM

Prioritas pertama: dashboard home, campaign builder, campaign list, campaign detail, keuangan.
Prioritas kedua: direktori kreator, profil kreator, negosiasi Rate Card.
Prioritas ketiga: report lanjutan dan analytics visual.
