# Trybuzzer.com

## Authentication

### Register Campaign Creator
**Input:**
* Kode Undangan (Opsional)
* Nama Perusahaan / Brand *
* Posisi / Jabatan *
* Instagram Brand *
* Tiktok Brand (Opsional)
* Website (Opsional)
* Deskripsi Bisnis (Opsional)

*Note: Perlu persetujuan admin untuk daftar, kemudian kode undangan (jika memiliki untuk akses langsung).*

### Register Content Creator
**Input:**
* Nama lengkap *
* Email *
* Nomor Whatsapp *
* Instagram Username (Opsional)
* Tiktok Username (Opsional)
* Kode referral (Opsional) 2 -> ?

*Note: Button daftarnya dengan oauth Google. Ada radio button syarat & ketentuan.*

---

## Campaign (sisi Kliper Saja)

### Card Campaign
* Tag (Produk, finance, dsb)
* Gambar Campaign

**Data:**
* Judul Campaign
* Rate (Ex: Rp 4.000 / 1K views)
* Min Views (Ex: 10.000)
* Budget (Presentase budget digunakan)
* Button Instruksi
* Button Claim (apabila ditekan, maka modal POP UP card detail campaign akan muncul)

### Detail Campaign
**Data:**
* Gambar produk
* Tag
* Judul Campaign
* Budget terpakai (Presentase)
* Rate / 1K views (Ex: 10.000)
* Min. Views (Ex: 10.000)
* Max. Views (Ex: 500.000)
* Hashtag (Ex: #Vidio)
* Mention (Ex: @User)
* Button "Claim Sekarang"
* Button "Lihat materi & panduan"

*Note:*
* *Ketika klik button klaim apabila belum melengkapi profil, maka akan muncul modal lengkapi profil terlebih dahulu.*
* *Ketika klik button lihat materi, maka akan langsung diarahkan ke google docs panduan.*
* *Setelah Profil lengkap, ketika klik button klaim akan muncul modal persyaratan & persetujuan.*

### Modal Lengkapi Profil
**Data:**
* List data yang belum lengkap
* Button batal
* Button lengkapi Profil

*Note: Ketika button lengkapi diklik, diarahkan ke dashboard tab profil.*

---

## Modal Pernyataan & Persetujuan (Step 1)
**Data:**
* Bread Crumbs (Ex: Step 1 / Step 2)
* Judul Campaign yang dipilih
* Radio buttons (Notes: Harus dicentang semua radio buttonnya):
    * Video link milik sendiri
    * Tidak menggunakan AI seperti OPUS AI
    * Views 100% organic / Tidak nyuntik
    * View count sudah menyentuh 10.000 views
    * Kami akan Ban Akun anda jika melanggar pikir dengan baik-baik karena akan ada banyak sekali peluang dapat penghasilan di platform ini ke depannya.
* Button batal
* Button Lanjut ke form submission.

---

## Modal Submit Konten (Masih dengan modal yang sama, tapi Step 2)
**Data:**
* Button Baca Panduan lengkap
* Dropdown Platform * (Tiktok, Instagram, dsb)
* Dropdown Akun Platform * (Nama platform sesuai dengan dropdown platform yang dipilihnya)
* Copy Caption lengkap (Kode + Hashtags + mention)
* Button copy semua untuk caption
* Tiktok Video * (Input)
* Caption video anda * (Input)
* Jumlah Views saat ini * (Input angka)
* Video analytics Dashboard * (Input Video Maks 50MB)
* Button kembali
* Button Batal
* Button Kirim Submission.

---

## Dasboard Content Creator
**Data:**
* Submission
* Total penghasilan
* Saldo Tersedia
* Saldo Pending
* 3 tab navigation:
    * Profil
    * Penghasilan
    * Submission saya

### Tab Profil
**Data (Informasi Personal):**
* Nama lengkap * (Input)
* Email (disabled, tidak dapat berubah)
* Tanggal lahir *
* Jenis kelamin * (drop down)
* Provinsi * (drop down)
* Kota/kabupaten * (drop down)
* Nomor Whatsapp *
* Button simpan perubahan

**Data (Verifikasi akun):**
* Kode untuk di bio atau deskripsi video
* Button salin

**Data (Akun Sosial Media) auto save:**
* Instagram
* Tiktok
* YouTube
* Discord

*Note: masing-masing ikon sosial media memiliki button tambah akun dan ketika diklik input username akunnya.*

**Data (Zona Bahaya):**
* Button Hapus akun saya

### Tab Penghasilan
**Data:**
* Saldo tersedia
* Riwayat Penarikan
* Informasi penting: Ketentuan transfer

*Note: Saldo hanya bisa ditarik min Rp 50.000.*

### Tab Submission Saya
**Data:**
* Tag (Ex: total, menunggu, disetujui)
* Input Cari Kampanye
* List submission (belum tau apa saja yang ada)
