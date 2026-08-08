# Prompt — Penyusunan Syarat & Ketentuan Marketiv V3.1 (Final)

> **Cara pakai:** salin seluruh isi file ini (dari `## PERAN` sampai akhir) dan tempel ke agen AI kamu sebagai satu prompt. Jangan potong.
>
> **Target file:** `00_BACKEND/terms & conditions/review/output/syarat-dan-ketentuan-marketiv-v3-1.md`
> **Tanggal:** 2026-08-05

---

## PERAN

Kamu adalah ahli hukum teknologi (Legal Tech) dan technical writer senior yang bertugas untuk merampungkan draf Syarat & Ketentuan (Terms & Conditions) untuk platform Marketiv. Tugasmu adalah membuat draf Syarat & Ketentuan versi Final (berdasarkan V3.1) yang secara akurat mencerminkan sistem yang sudah berjalan (Source of Truth), menghapus semua asumsi, dan membersihkan seluruh catatan internal.

---

## KONTEKS SISTEM (baca sebelum mulai)

Marketiv sebelumnya memiliki draf T&C v3.1 yang memuat banyak placeholder, asumsi, dan penanda `[BELUM TERKONFIRMASI DI BACKEND]`. Saat ini, seluruh sistem backend telah diimplementasikan secara aktual sesuai dengan `tasks-backend-alignment-tnc.md` dan berbagai laporan penyelesaian di direktori `result/`.

Draf awal T&C V3.1 memiliki "BAGIAN II — LAMPIRAN INTERNAL" yang berisi keraguan dari tim Backend/Legal. Semua keraguan tersebut KINI SUDAH TERJAWAB oleh implementasi nyata.

---

## FAKTA IMPLEMENTASI (Source of Truth)

Berikut adalah fakta-fakta sistem riil dari backend yang sudah selesai dikerjakan. Kamu WAJIB menggunakan fakta ini untuk memperbarui pasal-pasal terkait di draf V3.1:

1. **Biaya Platform (Pasal 9):** Biaya platform resmi sebesar 5% per modul (Campaign dibebankan ke UMKM di awal, Rate Card dipotong dari Kreator saat rilis escrow). Tarif ini bersifat tetap per transaksi (snapshot rate saat transaksi dibuat).
2. **Refund (Pasal 15):** Jika order dibatalkan, ada sengketa (dispute) yang memenangkan UMKM, atau ada sisa budget campaign, dana di-refund ke Wallet UMKM. Biaya platform (fee) TIDAK dikembalikan karena dianggap sebagai biaya layanan yang sudah terpakai.
3. **Withdrawal / Penarikan Dana (Pasal 11):**
   - Penarikan dana tersedia untuk Kreator (dari pendapatan) DAN UMKM (dari refund/sisa budget).
   - Batas penarikan: maksimal 3 penarikan per hari dan ada cooling period setelah ubah rekening.
   - Jika transfer gagal (misal dari sisi Midtrans/Bank), dana di-reverse (dikembalikan) ke wallet secara otomatis maksimal dalam 3 hari kerja.
   - KYC: Penarikan dengan nominal ≥ Rp 5.000.000 wajib melalui proses verifikasi manual via WhatsApp admin sebelum diproses.
4. **Penangguhan Akun & Banding (Pasal 18):**
   - Status akun: `active`, `suspended`, atau `terminated`.
   - Pengguna `suspended` / `terminated` diblokir dari klaim, submit, withdrawal, dan order baru. Tetap bisa menerima pencairan escrow dari pekerjaan yang sudah disetujui sebelumnya.
   - Hak banding (appeal) maksimal 14 hari sejak penangguhan. Admin memiliki SLA putusan maksimal 7 hari. Selama banding, akun tetap ditangguhkan.
5. **Perhitungan Views Campaign (Pasal 7.1):** Views divalidasi manual. UMKM menyetujui submission dengan angka views tertentu yang bersifat final (`views_final`). Reward Kreator dihitung pasti dari angka final tersebut (dibawah 1.000 views = Rp0, berlaku kelipatan lantai batas sisa budget). Angka ini terkunci setelah di-approve.
6. **Auto-Approve Rate Card (Pasal 7.2 & 8):** UMKM diberi waktu 3 hari kalender untuk mereview hasil kerja. Jika tidak ada aksi setelah 3 hari, memicu auto-approve dan escrow otomatis rilis ke Kreator.
7. **Persetujuan T&C (Pasal 3 & 5):** Sistem mencatat persetujuan versi T&C secara eksplisit. Pengguna diwajibkan menyetujui ulang saat ada pembaruan versi.
8. **Top-up Wallet (Pasal 10):** Fitur Top-up reguler telah DIHAPUS. Saldo Wallet UMKM hanya murni berasal dari refund atau sisa budget.
9. **Kreditasi & Metadata AI (Pasal 12 & 16):**
   - Kreator memiliki hak kreditasi yang merujuk pada username TikTok mereka. Kepemilikan beralih ke UMKM saat escrow dirilis.
   - Konten AI dapat (opsional) ditandai sebagai metadata transparansi dan tidak memblokir alur validasi.

---

## TUGAS EKSEKUSI

1. Baca draf `syarat-dan-ketentuan-marketiv-v3-1.md` (khususnya Bagian I).
2. Tulis ulang pasal-pasal yang relevan (khususnya Pasal 5, 7, 8, 9, 10, 11, 15, dan 18) agar selaras sempurna dengan fakta implementasi di atas.
3. HAPUS SEMUA teks dalam tanda kurung siku `[...]` yang sebelumnya berisi keraguan/placeholder. Ganti dengan fakta jika relevan, atau gunakan format kosong standar legal (misal: `PT Marketiv Digital Indonesia`).
4. HAPUS "BAGIAN II — LAMPIRAN INTERNAL" beserta seluruh isinya secara permanen.
5. Pertahankan gaya bahasa legal yang formal, tegas, rapi, dan lugas.
6. **SIMPAN HASIL AKHIR** sebagai file baru di `@/home/panjiangka1/Documents/dev/marketiv-web/00_BACKEND/terms & conditions/result/result-tnc/syarat-dan-ketentuan-marketiv-final-v3.1.md`. JANGAN menimpa file aslinya. Jika folder tersebut belum ada, buat foldernya terlebih dahulu.

---

## CONSTRAINT — jangan lakukan ini

- JANGAN menyisakan tanda `[BELUM TERKONFIRMASI]` atau placeholder teknis lainnya.
- JANGAN mengarang asumsi di luar fakta implementasi yang diberikan.
- JANGAN menyertakan penjelasan teknis ke dalam dokumen hukum, cukup tuangkan menjadi klausal yang tegas.
- JANGAN menyertakan BAGIAN II dari draf asli ke dalam hasil akhir.
- JANGAN menimpa (overwrite) file draf T&C lama.

---

## DEFINISI SELESAI

- [ ] Seluruh asumsi teknis di T&C sudah diganti menjadi fakta sistem.
- [ ] Tidak ada lagi tanda kurung siku placeholder keraguan dari draf sebelumnya.
- [ ] Pasal 11 (Withdrawal) sudah mencakup UMKM, rate limit, KYC, dan reversal.
- [ ] Pasal 18 (Penangguhan) sudah memuat durasi banding 14 hari dan SLA 7 hari.
- [ ] Lampiran Internal (Bagian II) sudah dihapus bersih.
- [ ] Dokumen akhir berformat Markdown dan siap dipublikasikan (Production Ready).
- [ ] Hasil akhir disimpan di file dan folder baru (`result/result-tnc`), file lama aman.
