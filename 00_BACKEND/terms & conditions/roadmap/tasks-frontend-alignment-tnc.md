# Tugas Frontend — Penyelarasan UI/UX dengan Implementasi T&C Backend

**Tujuan:** Menutup kesenjangan antara antarmuka pengguna (Frontend) dengan fungsi backend yang baru diimplementasikan terkait Syarat & Ketentuan (T&C).
**Prioritas:** P0 = Blocker Publikasi (Wajib sebelum rilis) · P1 = Penting untuk kelengkapan fitur UX.
**Dasar Audit:** `../review/audit-frontend-tnc.md`

---

## P0 — Blocker Publikasi / Arsitektur Inti

### F-01: Global Account Status Blocker (Suspended State)
**Kaitan Backend:** T-03 (Status Akun & Mekanisme Banding)
**Lokasi UI:** Seluruh Dashboard (`/dashboard/*`)
**Aksi:**
1. Buat layout checker atau *Higher Order Component/Hook* (misal `useAccountStatus`) yang mengecek `user.status`.
2. Jika `status === 'suspended'` atau `terminated`, redirect paksa user ke `/dashboard/suspended` (halaman baru).
3. Halaman `/dashboard/suspended` menampilkan peringatan akun ditangguhkan dan tombol "Ajukan Banding".
4. Buat Modal/Form Pengajuan Banding yang memanggil API/Function `create-appeal`. Tampilkan riwayat/status banding jika sudah diajukan (diambil dari koleksi `appeals`).

### F-02: Dashboard Keuangan & Withdrawal UMKM
**Kaitan Backend:** T-02 (Refund UMKM) & T-06 (Withdrawal UMKM)
**Lokasi UI:** `/dashboard/umkm/keuangan` (Halaman Baru)
**Aksi:**
1. Buat halaman Keuangan di area UMKM (struktur serupa dengan milik Kreator, tapi pastikan tidak cross-import *domain logic* sesuai aturan).
2. Tampilkan komponen Metrik Saldo Dompet (`wallets.balance`).
3. Buat tabel Riwayat Transaksi khusus UMKM (menampilkan masuknya dana `refund` dan keluarnya dana `withdrawal`).
4. Implementasikan komponen/form Penarikan Saldo (Withdrawal) untuk UMKM. 

### F-03: Penyesuaian UI Form Approval Submission Campaign
**Kaitan Backend:** T-04 (Locked Views)
**Lokasi UI:** `/dashboard/umkm/campaign/[campaignId]` (Modal Approval)
**Aksi:**
1. Ubah desain form approval bukti tayang (submission) untuk menekankan bahwa input *Views* adalah final.
2. Tambahkan perhitungan *live preview* reward di UI form tersebut: `Math.floor(inputViews / 1000) * rate`.
3. Tampilkan peringatan teks merah jika input < 1000: "Views di bawah 1.000 tidak akan mendapatkan bayaran (Rp 0)."

---

## P1 — Penting (Penyempurnaan UX & Feedback)

### F-04: UI Hitung Mundur Auto-Approve Rate Card
**Kaitan Backend:** T-05 (Auto-Approve Order)
**Lokasi UI:** `/dashboard/umkm/negosiasi/[orderId]` dan `/dashboard/kreator/pekerjaan-aktif`
**Aksi:**
1. UMKM: Tampilkan banner/alert di atas detail deliverable yang menunjukkan countdown ke `review_deadline_at`. Teks: "Batas review otomatis: [Countdown]. Order akan disetujui otomatis jika waktu habis."
2. Tampilkan sisa kuota revisi (berdasarkan `revision_count` vs `revision_limit`).
3. Modal Minta Revisi: Tambahkan teks peringatan agar mengumpulkan semua masukan sekaligus karena memotong 1 kuota revisi utuh.
4. Kreator: Tampilkan status badge "Auto-Approved" pada order yang di-approve oleh sistem.

### F-05: UI Riwayat Withdrawal 4-State & Info KYC
**Kaitan Backend:** T-06 (Withdrawal 4-State & KYC)
**Lokasi UI:** `/dashboard/kreator/keuangan` dan `/dashboard/umkm/keuangan`
**Aksi:**
1. Update komponen `StatusBadge` pada tabel withdrawal untuk mendukung warna status baru: `processing` (kuning/biru), `failed` (merah), `reversed` (abu-abu).
2. Tambahkan *Tooltip* atau teks detail (expandable row) pada status `failed`/`reversed` untuk menampilkan field `failure_reason` dari backend.
3. Form Withdrawal: Tambahkan teks info limit penarikan (Maks 3x/hari).
4. Form Withdrawal: Jika user mengetikkan nominal >= Rp 5.000.000, munculkan peringatan kuning: "Penarikan nominal besar memerlukan verifikasi KYC Admin via WhatsApp. Status akan tertunda."

### F-06: Penyesuaian Kalkulasi Fee Platform
**Kaitan Backend:** T-01 (Fee Platform via Env)
**Lokasi UI:** Form Pembayaran UMKM (Rate Card & Campaign)
**Aksi:**
1. Ganti hardcode angka 2% di seluruh komponen UI kalkulator harga dengan angka yang diambil dari konfigurasi backend (atau tampilkan secara generik "Biaya Layanan Platform" tanpa hardcode persentase jika rate ditarik langsung dari response API).
2. Pastikan halaman struk/invoice membaca `fee_rate` atau nominal pasti dari objek `escrows`/`payments` alih-alih menghitung ulang di client-side.

### F-07: Transparansi AI & Kreditasi Kreator
**Kaitan Backend:** T-12 & T-13
**Lokasi UI:** Form Submit Deliverables (Kreator)
**Aksi:**
1. Tambahkan Checkbox opsional: "Konten ini dibuat dengan bantuan Generative AI" (`aiDisclosed`).
2. Tampilkan badge "AI Generated" pada halaman review milik UMKM jika kreator mencentang opsi tersebut.
3. Tidak diperlukan input atribusi kredit karena backend akan menggunakan username TikTok secara otomatis, namun pastikan term "Hak Cipta dengan Atribusi" tertulis di layar serah terima order.
