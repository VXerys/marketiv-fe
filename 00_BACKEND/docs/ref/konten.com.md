# Konten.com Data Flow Referensi.

## Authentication

### Register Brand 
Input:
- Company Name*
- Industry (Dropdown)*, Ex: E-commerce, food beverage, finance, technology, dsb.
- Email*
- Nomor HP*
- Password*
- Checklist syarat dan ketentuan dan kebijakan privasi konten.com
- Button daftar akun
- Teks "Sudah punya akun?Login"

Note:
- Daftar bisa ditekan ketika semua field telah terisi dan centang syarat & ketentuan
- Teks login ketika diklik maka diarahkan ke halaman form login

### Login Brand
Data:
- Button oauth google dengan teks "Lanjutkan dengan Google"
- Input Email
- Teks "lupa password"
- Input Password
- Button login
- Teks "belum punya akun?Daftar Sekarang!"

Note: 
- Teks daftar sekarang ketika diklik maka akan diarahkan ke halaman Register brand
- Teks "Lupa password?" ketika diklik maka akan diarahkan ke halaman lupa password


### Register Content Creator
Data:
- Button oauth google dengan teks "Lanjutkan dengan Google"
- Input Nama Lengkap
- Input mail
- Input password
- Checklist Syarat & Ketentuan dan Kebijakan Privasi konten.com.
- Button daftar akun
- Teks "Sudah punya akun?Login"

Note:
- Ketika teks login diklik maka akan diarahkan ke halaman form login content creator

### Login Content Creator
Data:
- Button oauth google dengan teks "Lanjutkan dengan Google"
- Input Email
- Teks "lupa password"
- Input Password
- Button login
- Teks "belum punya akun?Daftar Sekarang!"

Note: 
- Teks daftar sekarang ketika diklik maka akan diarahkan ke halaman Register brand
- Teks "Lupa password?" ketika diklik maka akan diarahkan ke halaman lupa password

**P.S: Untuk halaman register atau login sebagai brand atau content creator itu tetap menggunakan komponen yang sama, hanya **

### Lupa Password
Data:
- Input Email
- Button "Kirim Link Reset Passwrd"
- Teks "Ingat password kamu? Kembali ke Login"

Note:
- Ketika klik "kembali login" maka akan diarahkan kembali login content creator


## Dashboard Brand

### Dashboard
Data:
- Tab Approved, All videos
- Button Add campaign
- Total Views
- Need to Review
- Total Submissions
- Budget Spent
- Total Campaign: Tab semua, active, paused, ended. Ada filter urutkan dari: terbaru, terlama, budget tertinggi, budget terendah, spent tertinggi
- List approved video: kolom date posted, username, link, social media. Ada filter platform mulai dari semua, tiktok, instagram, dan youtube, kemudian ada urutkan dari: views, likes, comments, terbaru

#### Modal Add Campaign
Data:
- gambar default ikon konten.com (16:9)
- Nama brand
- Tipe Konten
- Harga per views (Ex: Rp0/1k Views)
- Kategori platform
- Min view to claim
- Max view to claim
- CPM (Rate/1k views)
- Tab 1, 2, 3
- button kembali (pindah tab)
- button selanjutnya (pindah tab)

##### Tab 1 Profile Campaign
Data:
- Judul campaign (input)
- Tipe Konten (Dropdown, isinya ada UGC dan Clipping)
- Kategori (Dropdown, music, gaming, entertainment, sports, education, lifestyle, dan technology)
- Thumbnail, choose a file or drag and drop

Note:
- Ketika diklik selanjutnya pada tab 1, maka akan muncul modal edit thumbnail.

##### Modal Edit thumbnail
data:
- thumbnail yang telah dipilih (bisa digeser)
- slider zoom (1.0x sampai 3.0x)
- button ganti gambar
- button kembali
- button selesai

Note:
- Ketika diklik selesai maka gambar yang sebelumnya default menjadi gambar thumbnail yang telah dimasukkan sebelumnya.

##### Tab 2 Detail Campaign
Data:
- Checklist platform Instagram, tiktok, dan youtube. (bisa pilih lebih dari satu)
- CPM/Reward per 1000 views (Input dalam rupiah)
- Min views (input dalam rupiah)
- max views (input dalam rupiah)
- budget campaign (input dalam rupiah)
- checklist tampilkan budget ke clipper (Saat aktif, clipper bisa lihat total budget & sisa budget di halaman campaign. Kalau di-off, hanya tarif (CPM, Min/Max payout) yang tampil.)

##### Tab 3 Brief Campaign
Data:
- Button set up brief (Trigger modal)

##### Modal Set Up Brief
Data:
- Judul File 
- Minimum Followers
- Niche akun yang diperbolehkan
- Penjelasan singkat mengenai brand 
- Target Audiens utama (rentang umur): Checklist: semua umur, 13-17, 18-24, 25-34, 35-44, 45+.
- Tujuan utama campaign (dropdown dan checklist): brand awareness, traffic, sign-up/download, sales, education, lainnya
- CTA (ajakan di akhir video)
- Tipe Konten?
- Narasi wajib yang harus smapai ke penonton
- kesan yang diinginkan: checklist (serius, edukatif, casual, lucu, entertaining, inspiratif, casual, dan lainnya).
- Tag Social media max 5 platform (opsional) (radio button yes)
- Material links (logo, footage, fotor produk, dll) 
- Apakah clipper wajib menggunakan seluruh material ini? (wajib dan tidak)
- Apakah terdapat footage atau mmomen spesifik yang wajib ditampilkan di video? ("ada, wajib", dan "tidak")
- footage opsional dari brand 
- Elemend wajib di clip
- Caption wajib
- Durasi minimum
- Durasi Maksimum
- Hashtag Wajib max 5
- Boleh dilakukan 
- Dilarang dilakukan 

### Analitik Brand
Data:
- Tanggal hari ini
- Filter hari: default 7 hari terakhir. ada lagi 28 hari terakhir dan pilih tanggal (kalender).
- Filter semua campaigns (hanya ada itu di dropdown nya)
- Button Export CSV
- Total budget (Rp0)
- Spent (Rp0)
- Rp0 Remaining (sisa)
- Views (ada tab filter: all, approved) (ex: 0 views)
- Spent (Rp0)
- CPM (Effective CPM dan original CPM)
- Submissions (Ex: 0 Video)
- Statistik: ada filter platform: semua, tiktok, instagram, dan youtube, kemudian ada tab total dan kenaikan. data: views, likes, comments, engagement rate%, Table dengan sumbu x (Tanggal dengan format: "tanggal/bulan" sampai tanggal yang telah difilter sebelumnya), kemudian sumbu y itu data views nya mulai dari 200, 400, sampai 1k (menyesuaikan dengan banyaknya views).
- Distribusi video: Total views, total video Tiktok, Instagram, dan Youtube.
- Efesiensi Budget: Original CPM, Budget Spent, dan Effective CPM
- status submission: filter platform: semua, tiktok, instagram, dan youtube. Data total video approved, pending, dan rejected, masing-masing ada presentasenya
- List approved video: kolom date posted, username, link, social media. Ada filter platform mulai dari semua, tiktok, instagram, dan youtube, kemudian ada urutkan dari: views, likes, comments, terbaru, terakhir ada status: semua status, approved, pending dan rejected

### Budget
Data:
- Balance Available: angka yang tersedia, button refund, dan button request top up
- Dialokasi ke campaign (Terkunci di - campaign aktif)
- Total saldo brand
- Total saldo brand (Saldo tersedia + dialokasi)
- History: tab completed dan on process
- table dengan kolom date, amount ,status, dan campaign.




