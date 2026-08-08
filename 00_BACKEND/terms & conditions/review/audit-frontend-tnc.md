# Audit Kebutuhan Frontend vs Implementasi T&C Backend

**Perspektif:** Frontend Developer
**Tujuan:** Mengidentifikasi kebutuhan perubahan, penambahan fitur, dan penyesuaian UI/UX pada sisi Frontend (Next.js) sebagai akibat dari perubahan arsitektur dan aturan bisnis di sisi Backend (Appwrite) untuk kepatuhan Terms & Conditions (T&C) V3.
**Tanggal audit:** 2026-08-05
**Sumber yang diaudit:** Laporan implementasi backend (T-01 hingga T-06, T-17, T-18, T-03) di folder `00_BACKEND/terms & conditions/result/`.

---

## Ringkasan Eksekutif

Implementasi backend telah memperkenalkan beberapa fitur krusial seperti: dompet untuk UMKM (refund & withdrawal), status akun tersuspensi dengan sistem banding, siklus auto-approve dengan batas waktu, serta perubahan struktur data pada penarikan dana (withdrawal 4-state). 

Frontend saat ini belum mendukung alur-alur baru tersebut. **Terdapat 6 area utama yang membutuhkan penyesuaian/pembuatan UI baru** agar fungsi-fungsi backend yang telah dibangun dapat diakses dan digunakan oleh user (UMKM & Kreator) sesuai dengan T&C yang berlaku.

---

## Rincian Temuan & Kebutuhan Frontend

### 1. F-01: Migrasi Fee Platform (T-01)
**Kondisi Backend:** Fee platform tidak lagi di-hardcode 2%, melainkan menggunakan environment variable `FEE_RATE` dan di-snapshot per transaksi (`fee_rate` di koleksi `escrows`).
**Kesenjangan Frontend:**
- UI pembayaran/checkout mungkin masih meng-hardcode perhitungan fee 2%.
- Halaman detail order/invoice belum membaca `fee_rate` dari data escrow.
**Rekomendasi Frontend:**
- Buat fetcher/hook untuk mengambil `PLATFORM_FEE_RATE` dari konfigurasi server/database untuk kalkulasi UI.
- Update UI Receipt/Invoice untuk menampilkan perhitungan fee berdasarkan snapshot `fee_rate` dari dokumen `escrows`.

### 2. F-02: Dompet & Withdrawal UMKM (T-02, T-06)
**Kondisi Backend:** UMKM sekarang dapat menerima refund sisa budget/pembatalan order ke dalam `wallets.balance`. UMKM juga diizinkan melakukan withdrawal.
**Kesenjangan Frontend:**
- Domain `dashboard/umkm` belum memiliki halaman/UI "Keuangan" atau "Dompet" untuk melihat saldo dan riwayat transaksi (refund).
- Tidak ada form withdrawal untuk UMKM.
**Rekomendasi Frontend:**
- Buat halaman `/dashboard/umkm/keuangan` yang menampilkan Saldo Aktif, Riwayat Transaksi (termasuk tipe refund).
- Re-use komponen form Withdrawal dari Kreator untuk digunakan di sisi UMKM, dengan memperhatikan *Dual-Ecosystem Isolation* (copy atau pindahkan komponen form ke shared `/components/features/finance/`).

### 3. F-03: Status Akun "Suspended" & Form Banding (T-03)
**Kondisi Backend:** User bisa berstatus `suspended` atau `terminated`. User tersuspensi tidak bisa melakukan aksi finansial/pembuatan data, tapi boleh mengajukan banding (appeal) sekali dalam 14 hari.
**Kesenjangan Frontend:**
- Tidak ada global state/interceptor yang mendeteksi status `suspended`.
- Tidak ada UI halaman "Akun Ditangguhkan" dan form pengajuan banding.
**Rekomendasi Frontend:**
- Tambahkan middleware / global layout check: Jika `status === 'suspended'`, block render halaman dashboard utama dan arahkan ke halaman khusus `/dashboard/suspended`.
- Buat UI Form Banding di halaman `/dashboard/suspended` yang memanggil endpoint/function `create-appeal` (input: alasan, bukti link/teks).
- Tampilkan status banding (Submitted, Under Review, dll) jika user sudah pernah submit.

### 4. F-04: Tampilan Auto-Approve & Limit Revisi (T-05)
**Kondisi Backend:** Order Rate Card memiliki `review_deadline_at`, `auto_approved` flag, dan `revision_count` vs `revision_limit`. Lewat deadline otomatis release escrow.
**Kesenjangan Frontend:**
- UMKM tidak melihat peringatan hitung mundur (countdown) batas waktu review.
- UI permintaan revisi belum memperingatkan aturan "1 permintaan = 1 kuota revisi".
**Rekomendasi Frontend:**
- Tampilkan Banner Countdown (misal: "Batas review: 2 Hari 4 Jam. Jika dilewati, sistem akan otomatis menyetujui hasil kerja.") di halaman detail order UMKM.
- Tambahkan validasi dan teks peringatan di Modal "Minta Revisi": "Sisa jatah revisi: X. Mohon kumpulkan semua masukan dalam satu permintaan revisi ini."
- Di dashboard Kreator, tampilkan label "Auto-Approved" jika order selesai karena auto approve.

### 5. F-05: Withdrawal 4-State & Aturan KYC (T-06)
**Kondisi Backend:** Withdrawal memiliki status `requested`, `processing`, `succeeded`, `failed`, `reversed`. Nominal >= Rp5.000.000 butuh KYC (status `pending_wa`). Maksimal 3x tarik per hari.
**Kesenjangan Frontend:**
- Riwayat penarikan belum memetakan status `processing`, `failed`, `reversed` (beserta `failure_reason`).
- Form penarikan tidak memberi tahu user tentang batas 3x per hari dan batas nominal KYC.
**Rekomendasi Frontend:**
- Update UI *Badge* status penarikan untuk mengakomodasi 5 status baru.
- Tampilkan *Tooltips* atau alert merah jika status `failed`/`reversed` dengan menampilkan `failure_reason`.
- Di form Withdrawal, tambahkan peringatan jika input >= Rp 5 Juta: "Penarikan di atas Rp 5.000.000 memerlukan verifikasi manual via WhatsApp Admin."
- Disable form jika limit harian (3x) sudah tercapai (berdasarkan data history hari ini).

### 6. F-06: Verifikasi Views & Kalkulasi Reward Final (T-04)
**Kondisi Backend:** Reward campaign dihitung final saat UMKM input views dan klik approve. Nilai di bawah 1.000 views = Rp 0.
**Kesenjangan Frontend:**
- UMKM butuh kejelasan saat verifikasi submission bahwa angka yang dimasukkan bersifat final.
**Rekomendasi Frontend:**
- Di form Approve Submission UMKM, tambahkan teks: "Angka views ini akan dikunci sebagai final dan digunakan untuk menghitung bayaran kreator."
- Tambahkan kalkulasi estimasi UI (*live preview*): "Bayaran = Rp X (Jika di bawah 1.000 views, bayaran = Rp 0)".

---

## Kesimpulan

Frontend perlu melakukan penyesuaian signifikan, terutama pembuatan **Dashboard Keuangan UMKM**, **Sistem Halaman Suspended**, dan **Penyesuaian State Order & Withdrawal**. Pekerjaan ini diestimasikan memakan waktu 1-2 minggu sprint Frontend untuk mengintegrasikan sepenuhnya dengan function Appwrite yang baru. Rincian tasks terdapat pada dokumen roadmap.
