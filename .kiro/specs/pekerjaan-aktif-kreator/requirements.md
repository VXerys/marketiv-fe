# Requirements — Pekerjaan Aktif Kreator Revamp

## Introduction

Dokumen ini mendokumentasikan spesifikasi kebutuhan (requirements) untuk melakukan pembenahan (revamp) visual dan alur UX pada halaman **Pekerjaan Aktif** (List dan Detail) bagi mitra Konten Kreator di platform Marketiv. Revamp ini bertujuan menyelaraskan gaya desain agar konsisten dengan halaman Job Pool (warna violet premium, bebas dari warna cream, dan layout modern), mematuhi standar database, serta memastikan alur pengajuan bukti postingan yang intuitif dan profesional.

---

## Requirements

### 1. Visual & Theme Consistency (List & Detail)

**User Story:** As a **Kreator**, I want a **clean, modern UI with violet accents and true-neutral card colors**, so that **the dashboard feels premium and matches the rest of my workspace**.

#### Acceptance Criteria

1. WHERE halaman atau sub-komponen Pekerjaan Aktif dirender, THE SYSTEM SHALL menggunakan palette violet (`bg-primary`, `text-primary`) untuk aksen visual utama dan melarang keras warna cream (`#fafaf7`, `#eee8dd`).
2. WHERE card-card atau panel-panel pada halaman Pekerjaan Aktif dirender, THE SYSTEM SHALL menggunakan warna solid putih (`#ffffff`) atau abu-abu dingin (`#f9fafb`) dengan border abu-abu halus (`#e5e7eb`).
3. WHERE teks status atau tenggat waktu (deadline) terlewati, THE SYSTEM SHALL mewarnai teks secara dinamis dengan merah (`text-red-500`) untuk penanda kritis.

---

### 2. Active Jobs Directory Page (List View)

**User Story:** As a **Kreator**, I want to **view and filter my active claimed jobs in a clear structured layout**, so that **I can easily track what jobs need submission and which ones are validated/in audit**.

#### Acceptance Criteria

1. WHERE halaman utama Pekerjaan Aktif dibuka, THE SYSTEM SHALL menyajikan ringkasan metrik status pengerjaan (Belum Submit, Menunggu Validasi, Valid/Selesai, Perlu Review/Fraud) dengan ikon representatif dan teks keterangan di bagian atas.
2. WHERE daftar pekerjaan dirender, THE SYSTEM SHALL menampilkan card kampanye aktif dengan detail:
   - Thumbnail cover kampanye di sisi kiri/atas card.
   - Nama pengiklan (brand) dan judul pekerjaan.
   - Status badge (e.g. Belum Submit, Menunggu Validasi, Valid, Fraud).
   - Indikator deadline dinamis ("Melewati batas" atau sisa hari).
   - Nilai estimasi pendapatan atau pendapatan yang dirilis (jika status Valid/Selesai).
3. IF kampanye aktif dideteksi mengalami anomali atau fraud (status `Fraud`), THEN the system SHALL menampilkan kotak peringatan berwarna merah di bagian bawah card pekerjaan dengan teks detail penyebab fraud/anomali.
4. WHERE tombol aksi di masing-masing card dirender:
   - IF pekerjaan belum dikirim bukti postingnya, THEN the system SHALL menampilkan tombol `Submit Bukti Tayang` (violet fill) dan `Lihat Detail` (outline).
   - IF pekerjaan sudah dikirim, THEN the system SHALL menampilkan indikator teks non-interaktif `Sudah Dikirim` dan tombol `Lihat Detail`.

---

### 3. Active Job Detail & Submission Page (Detail View)

**User Story:** As a **Kreator**, I want to **view the complete brief, submit my public posting URL, and track validation progress**, so that **I have a clear path of action matching standard pay-per-view best practices**.

#### Acceptance Criteria

1. WHERE halaman detail pekerjaan aktif dibuka, THE SYSTEM SHALL menampilkan **Hero Banner gelap premium** (`#0c172b`) yang menampilkan:
   - Tombol kembali (`Kembali ke Pekerjaan Aktif`).
   - Informasi brand (nama, avatar), niche badge, dan status badge.
   - Judul pekerjaan/kampanye besar berwarna putih.
   - CPM rate (`Rp X.XXX / 1K views`) dan detail metadata platform.
   - Foto thumbnail kampanye besar di sebelah kanan.
2. WHERE area tab navigasi dirender di bawah Hero Banner, THE SYSTEM SHALL menyediakan tab `Detail` (aktif) dan `Video Kamu` (untuk riwayat tayangan).
3. IF Kreator belum mengirimkan bukti posting, THEN the system SHALL menampilkan formulir pengajuan link bukti tayang dengan spesifikasi:
   - Tombol pilihan platform (TikTok Video / Instagram Reels).
   - Input teks untuk URL postingan publik.
   - Textarea opsional untuk catatan pengiriman.
   - Teks panduan yang menegaskan: "Dilarang mengunggah video final langsung ke platform Marketiv. Cukup cantumkan URL postingan publik Anda."
4. IF Kreator sudah mengirimkan bukti posting, THEN the system SHALL menyembunyikan formulir pengajuan dan menampilkan detail bukti tayang diajukan (Platform, URL postingan dengan tautan eksternal aktif, catatan, estimasi data views, serta reward riil yang dirilis jika valid).
5. WHERE panel samping kanan dirender, THE SYSTEM SHALL menampilkan:
   - **Timeline Progres Bukti**: pelacakan vertikal dari status `Di-klaim` -> `Bukti Video Di-submit` -> `Audit Validasi Admin` dengan warna ikon status dinamis (e.g. hijau jika sukses, kuning jika pending, merah jika fraud).
   - **Aturan Pembayaran Campaign**: ringkasan kebijakan verifikasi views dan escrow platform.

---

## Success Metrics

- **100% Konsistensi Visual**: Tidak ada kebocoran warna cream atau oranye khas UMKM di halaman Pekerjaan Aktif Kreator.
- **Validasi URL Real-time**: Formulir validasi mencegah submit jika skema URL tidak valid (diawali `http://` / `https://` dan tidak mengandung nama platform yang bersangkutan) dalam waktu < 200ms di frontend.

## Constraints

- Mobile-first mulai dari resolusi 375px.
- Semua instruksi teks dan form menggunakan Bahasa Indonesia yang formal dan mudah dipahami.
- Tidak boleh ada modul chat, WhatsApp redirection, atau revisi/loop approval manual antara UMKM dan Kreator di Campaign Mode.

## Out of Scope

- Pembayaran saldo / pencairan dana riil ke rekening bank (hanya mock reward cair di level UI/escrow).
- Integrasi real-time API sosmed (views di-mock di level UI atau disimulasikan).
