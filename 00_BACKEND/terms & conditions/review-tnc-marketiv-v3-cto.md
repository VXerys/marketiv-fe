# Halaman 1

Review Syarat & Ketentuan Marketiv — Versi 3
Perspektif: Chief Technology Officer (Tech + Legal Engineering)
Dokumen
ditinjau
syarat-dan-ketentuan-marketiv-v3.pdf  (Draf Gabungan, 17 Juli 2026)
Reviewer
CTO — Marketiv
Scope
review
Pasal 5 (Akun Pengguna), Pasal 7.1 (Campaign/PPV), Pasal 7.2–7.3 (Rate Card &
Custom Offer), Pasal 8–9 (Pembayaran & Biaya), Pasal 10 (Wallet), Pasal 11
(Withdrawal), Pasal 8.2–8.4 (Escrow)
Fokus
validasi
Alur sistem, proses transaksi, mekanisme pembayaran, dan keterterapan teknis —
konsisten antara T&C ⇄ backend docs ⇄ kode ⇄ UI
Di luar
scope saya
Pasal 12 (larangan umum), 13 (fraud), 14 (dispute), 16 (HKI), 17 (privasi), 18–22 —
kecuali di titik yang bersinggungan langsung dengan escrow/wallet, yang saya
tandai sebagai interface issue
Verdict
⛔ BELUM LAYAK PUBLIKASI. 7 blocker (P0) harus ditutup. Struktur dokumen
sudah baik dan Lampiran 2 menunjukkan disiplin verifikasi yang bagus, tetapi
dokumen ini masih mendeskripsikan mekanisme yang parameternya belum ada
di sistem.
0. Ringkasan Eksekutif
Yang sudah benar dan saya konfirmasi:
Pemisahan fee 5% per-modul (Campaign = buyer side, Rate Card = seller side) sudah
konsisten dengan payment.service.ts  dan ADR-008. Ini keputusan yang tepat dan
enforceable.
Zero-chat rule di Campaign Mode (Pasal 7.1.h) tertulis sebagai larangan perilaku,
bukan sekadar deskripsi fitur. Itu penting — kita bisa menindak pencantuman nomor
WA di caption/brief.
Pasal 8.5 (status pembayaran hanya berubah lewat webhook Midtrans terverifikasi)
melindungi kita dari sengketa "sudah transfer kok". Ini pasal terkuat di dokumen.
Pasal 8.7 & 10.3 (saldo hanya berubah oleh sistem) sejalan dengan arsitektur kita:
escrow/wallet hanya boleh ditulis Appwrite Function ber-API-key.
Masalah struktural terbesar:
Dokumen ini menjanjikan tiga hal yang belum punya definisi teknis: (1) bagaimana views
dihitung, (2) kapan escrow rilis kalau UMKM diam, dan (3) bagaimana uang keluar dari


---

# Halaman 2

wallet UMKM. Ketiganya adalah titik di mana uang berhenti bergerak. Setiap T&C
marketplace yang gagal biasanya gagal di titik yang persis sama.
7 Blocker (P0):
ID
Ringkas
Pasal
CTO-
01
Mekanisme perhitungan views tidak didefinisikan sama sekali
7.1.f
CTO-
02
Tidak ada batas waktu review UMKM di Rate Card → escrow bisa
ditahan selamanya
7.2.e–f, 8.4.b
CTO-
03
Saldo Wallet UMKM terkunci: refund masuk wallet, tapi withdrawal
hanya untuk Kreator
15.1.c vs 11.1
CTO-
04
Model wallet + escrow berpotensi masuk kategori jasa pembayaran
teregulasi (BI/PJP)
8, 10
CTO-
05
Withdrawal instan tanpa jalur reversal + disclaimer sepihak = klausula
baku berisiko batal
11.4, 11.6, 8.7
CTO-
06
Tidak ada klausul "catatan sistem sebagai alat bukti" dan tidak ada
zona waktu resmi
seluruh
dokumen
CTO-
07
Urutan Collab Post vs pelepasan escrow bertentangan dengan
implementasi backend
7.2.g vs 8.4.b
BAGIAN A — TEMUAN BLOCKER (P0)
CTO-01 — Perhitungan views tidak punya definisi teknis apa pun
Pasal 7.1.e, 7.1.f · Severity: P0 · Owner: CTO + CAIO
Temuan
Pasal 7.1.f menyebut "jumlah views tervalidasi" sebagai basis seluruh kompensasi
Campaign Mode, tetapi dokumen tidak pernah menjawab:
1. Kapan views diukur? Saat submit? Saat approve? Snapshot akhir periode?
2. Dari mana angkanya? Scraping halaman publik, API resmi platform, atau input
manual admin?
3. Apa yang terjadi kalau views naik setelah approval? Reward direvisi atau final?
4. Berapa lama konten wajib tetap tayang? Pasal 7.1.e hanya bilang "selama masa
verifikasi" — istilah yang tidak didefinisikan di Pasal 4.
5. Toleransi selisih antara angka di sistem kita vs angka yang dilihat Kreator di aplikasi
TikTok.


---

# Halaman 3

Risiko
Ini bukan risiko teoritis. Skenario nyata: Kreator submit di 4.900 views, sistem snapshot di
4.850 → reward 4 × tarif, bukan 4 × tarif dari 4.900. Kreator screenshot layar HP-nya dan
mengajukan sengketa. Kita tidak punya dasar kontraktual untuk menolak, karena T&C
tidak pernah bilang angka sistem yang mengikat. Kalikan ini dengan 500 Kreator dan ini
menjadi beban operasional admin yang tidak scalable.
Tambahan: reward floor(views/1000) × tarif  berarti views di bawah 1.000 = Rp0.
Kreator yang mengerjakan konten penuh lalu dibayar nol tanpa pernah diberitahu di muka
adalah keluhan konsumen yang sah dan sangat merusak reputasi.
Rekomendasi redaksi (sisipkan sebagai Pasal 7.1.f baru, geser yang lama)
7.1.f — Pengukuran Views (1) Jumlah views yang menjadi dasar perhitungan reward
adalah jumlah views yang tercatat pada sistem Marketiv pada saat proses verifikasi
Bukti Tayang dilakukan, yang diambil dari data publik konten pada platform media
sosial terkait. (2) Pengukuran bersifat final pada saat Bukti Tayang disetujui.
Kenaikan maupun penurunan jumlah views setelah persetujuan tidak mengubah
besaran reward. (3) Apabila terdapat selisih antara angka pada sistem Marketiv dan
angka yang ditampilkan platform media sosial, angka pada sistem Marketiv yang
berlaku, sepanjang tidak terdapat kekeliruan nyata (manifest error) yang dapat
dibuktikan. (4) Kreator wajib menjaga konten tetap publik dan tidak menghapusnya
sekurang-kurangnya [X] hari kalender sejak Bukti Tayang disetujui. Penghapusan
atau pemrivatan konten sebelum jangka waktu tersebut dapat menyebabkan
pembatalan reward dan/atau penarikan kembali dana sesuai Pasal [chargeback].
7.1.g — Pembulatan dan Batas Reward Reward = (views tervalidasi ÷ 1.000) × tarif per
1.000 views, dibulatkan ke bawah ke satuan Rupiah penuh dan dibatasi sisa budget
campaign. Apabila jumlah views tervalidasi kurang dari 1.000, reward bernilai Rp0.
Ketentuan ini ditampilkan secara jelas kepada Kreator sebelum melakukan Claim.


---

# Halaman 4

Dampak implementasi
Item
Aksi
Collection
submissions
Tambah atribut: views_count  (int), views_captured_at  (datetime),
views_source  (enum: api  | scrape  | manual_admin ), views_final
(bool)
Appwrite Function
verify-submission  wajib menulis ketiga field di atas dalam transaksi yang
sama dengan perubahan status — tidak boleh dua langkah terpisah
audit_logs
Entry wajib: action=views_captured , payload berisi raw response sumber
data
UI Kreator
Banner di halaman Claim: "Reward dihitung per 1.000 views. Di bawah 1.000
views, reward Rp0." — wajib, bukan opsional
UI Kreator
Di detail submission tampilkan views_count  + views_captured_at
supaya Kreator lihat angka yang sama dengan kita
Test (Vitest)
calculateReward(999, 10000) === 0 ; calculateReward(4850, 10000) 
=== 40000 ; cap sisa budget
CTO-02 — Rate Card tidak punya batas waktu review UMKM → escrow bisa
ditahan tanpa batas
Pasal 7.2.e, 7.2.f, 8.4.b · Severity: P0 · Owner: CTO
Temuan
Alur Rate Card yang tertulis: Kreator submit deliverable → UMKM tinjau → UMKM setujui
→ escrow rilis. Tidak ada satu pun batas waktu pada langkah "UMKM tinjau".
Artinya secara kontraktual, UMKM yang diam (bukan menolak, hanya tidak membuka
dashboard) menahan uang Kreator selamanya. Kreator tidak punya jalan keluar selain
Pasal 14 (WhatsApp admin) — yang berarti setiap UMKM pasif menjadi tiket manual untuk
admin. Pada 50 order/hari ini langsung tidak scalable.
Pasal 7.2.f juga tidak mendefinisikan apa yang dihitung sebagai satu revisi. "Ini kurang
cerah, tolong perbaiki" lalu 2 jam kemudian "warnanya juga" — satu revisi atau dua?
Rekomendasi redaksi
7.2.f — Peninjauan Hasil Kerja (1) UMKM wajib meninjau deliverable dalam waktu [3]
hari kalender sejak deliverable diserahkan Kreator melalui Platform. (2) Apabila dalam
jangka waktu tersebut UMKM tidak menyetujui, menolak, maupun mengajukan revisi,
sistem secara otomatis menyetujui hasil kerja dan escrow dirilis kepada Kreator sesuai
Pasal 8. Marketiv memberitahukan UMKM melalui email dan notifikasi dashboard
sekurang-kurangnya [1] hari sebelum persetujuan otomatis berlaku. (3) Satu


---

# Halaman 5

permintaan revisi dihitung sebagai satu kali revisi, terhitung sejak dikirim melalui
Platform, terlepas dari jumlah butir perbaikan di dalamnya. Permintaan revisi wajib
disampaikan sekaligus. (4) Jangka waktu peninjauan berhenti berjalan (pause) selama
order berstatus sengketa sesuai Pasal 14.
Dampak implementasi
Item
Aksi
Collection
orders
Tambah: review_deadline_at  (datetime), auto_approved  (bool),
revision_count  (int), revision_limit  (int)
Appwrite
Function
Fungsi terjadwal auto-approve-orders  (cron harian) — pola sama dengan
expire-stale-claims  yang sudah ada. Wajib idempoten: cek status === 
'delivered'  sebelum bertindak
Appwrite
Function
auto-approve-orders  memanggil orchestrator escrow yang sama dengan
approval manual — jangan duplikasi logika release
Notifikasi
Reminder H-1 wajib terkirim; simpan reminder_sent_at  agar tidak dobel
audit_logs
action=order_auto_approved , actor=system
Test
(Playwright)
e2e: deliverable submitted → majukan waktu → status completed , wallet Kreator
bertambah harga - floor(harga × 0.05)
CTO-03 — Saldo Wallet UMKM terkunci di dalam platform
Pasal 15.1.c vs Pasal 11.1 · Severity: P0 · Owner: CTO + Ketua Tim
Temuan
Konflik langsung di dalam dokumen yang sama:
Pasal 15.1.c: refund dikembalikan ke Wallet UMKM.
Pasal 11.1: "Penarikan dana hanya tersedia bagi Kreator."
Pasal 15.2.b: sisa budget campaign dikembalikan ke UMKM (mekanisme masih
placeholder).
Hasilnya: uang UMKM masuk, tidak bisa keluar. Ini bukan sekadar gap fitur — ini klausula
yang merugikan konsumen dan sangat mungkin dinilai tidak sah berdasarkan Pasal 18
UU No. 8/1999 tentang Perlindungan Konsumen. Ditambah, ini secara aktif memperkuat
argumen bahwa Wallet kita adalah produk simpanan (lihat CTO-04).


---

# Halaman 6

Tiga opsi, dan rekomendasi saya
Opsi
Deskripsi
Effort
Risiko
A
Refund dikembalikan ke metode
pembayaran asal via Midtrans refund
API
Sedang
Refund partial e-wallet/VA tidak
selalu didukung; ada window waktu
Midtrans
B
✅
Refund ke Wallet UMKM + bangun
fitur withdrawal untuk UMKM (reuse
alur Kreator)
Rendah–
Sedang
Menambah permukaan regulasi
(CTO-04)
C
Refund ke Wallet, saldo hanya bisa
dipakai untuk transaksi berikutnya
(store credit)
Rendah
Wajib disclosure super eksplisit;
tetap berisiko dinilai tidak adil
untuk nominal besar
Rekomendasi: Opsi B untuk MVP. Alur withdrawal Kreator sudah ada; membedakan role
di withdrawal.service  jauh lebih murah daripada integrasi refund Midtrans, dan menutup
risiko konsumen. Opsi C hanya boleh dipakai kalau disertai kebijakan "store credit dapat
ditarik atas permintaan tertulis" — yang secara operasional sama saja dengan B, tapi lebih
lambat.
Redaksi
11.1 (revisi) — Penarikan dana tersedia bagi Kreator atas saldo tersedia, dan bagi
UMKM atas saldo tersedia yang berasal dari pengembalian dana (refund) atau sisa
budget campaign. Saldo tertunda dan dana escrow tidak dapat ditarik oleh pihak mana
pun.
Dampak implementasi
withdrawal.service.ts : hapus guard role === 'KREATOR' , ganti dengan validasi
sumber saldo.
Collection withdrawals : tambah requester_role .
UI: halaman wallet UMKM butuh tombol tarik dana + empty state + form rekening
(komponen bisa di-reuse dari Kreator).
Update technical-guidelines/11  yang menyatakan withdrawal khusus Kreator.
CTO-04 — Model Wallet + Escrow berpotensi masuk rezim jasa pembayaran
teregulasi
Pasal 8, 10 · Severity: P0 · Owner: CTO + CAIO + penasihat hukum
Temuan
Dokumen menggunakan istilah "escrow" dan "Wallet" dengan menahan dana pengguna
dalam jangka waktu tidak tertentu, mencatat saldo per pengguna, dan memfasilitasi
pemindahan dana antar pengguna. Kombinasi ini adalah deskripsi tekstual dari aktivitas


---

# Halaman 7

jasa pembayaran. Di Indonesia, penyelenggaraan dompet elektronik / penampungan dana
pihak ketiga tunduk pada perizinan Bank Indonesia (rezim PJP, PBI 22/23/2020 dan
turunannya). Istilah "escrow" sendiri secara hukum merujuk pada penitipan oleh pihak
ketiga berlisensi.
Pasal 10.2 ("bukan produk simpanan perbankan dan tidak memberikan bunga") adalah
mitigasi yang benar tapi tidak cukup — disclaimer tidak mengubah substansi aktivitas.
Saya mengangkat ini sebagai CTO dan bukan hanya isu legal karena jawabannya
menentukan arsitektur uang kita, dan mengubahnya setelah MVP jalan berarti migrasi
ledger yang menyakitkan.
Yang perlu diputuskan sebelum go-live
1. Apakah ada fitur top-up? Lampiran menyebut "top-up/deposit tercatat di wallet" dan
memori produk menyebut layar top-up. Jika pengguna bisa menyetor dana tanpa
transaksi spesifik, argumen "uang elektronik" menjadi sangat kuat. Rekomendasi
saya: hapus top-up dari MVP. Setiap pembayaran harus terikat ke satu
campaign/order tertentu.
2. Di rekening siapa dana escrow berada? Kalau di rekening operasional Marketiv yang
tercampur dengan kas perusahaan, kita punya eksposur besar saat ada masalah
likuiditas. Minimum: rekening bank terpisah khusus dana pengguna, dengan
rekonsiliasi harian antara saldo bank dan total ledger.
3. Apakah disbursement pakai Midtrans Iris atau transfer manual? Ini juga
menentukan CTO-05.
Redaksi tambahan yang saya minta
10.4 (baru) — Dana Pengguna yang ditahan sistem ditempatkan pada rekening yang
dipisahkan dari dana operasional Marketiv, dan dicatat dalam pembukuan terpisah per
Pengguna. Marketiv tidak menggunakan dana tersebut untuk kepentingan
operasionalnya. 10.5 (baru) — Wallet bukan alat pembayaran yang dapat digunakan di
luar Platform, tidak dapat dipindahbukukan antar Pengguna, dan tidak dapat
digunakan untuk menyimpan dana di luar konteks transaksi pada Platform.
Pasal 10.5 justru memperkuat posisi kita secara regulasi: menegaskan wallet adalah
pencatatan transaksional, bukan instrumen pembayaran.
Dampak implementasi
Hapus/tunda endpoint & UI top-up dari MVP.
wallets  collection: pastikan tidak ada operasi transfer  antar user.
Buat Function terjadwal reconcile-ledger  (harian): SUM(wallet.available + 
wallet.pending + escrow.held)  dibandingkan dengan mutasi bank. Selisih → alert
admin. Ini juga fondasi audit.
CTO-05 — Withdrawal instan tanpa jalur reversal, dengan disclaimer sepihak
Pasal 11.4, 11.6, 8.7 · Severity: P0 · Owner: CTO


---

# Halaman 8

Temuan
Tiga pasal bertabrakan:
11.4: permintaan yang lolos validasi "diproses secara langsung, dan saldo tersedia
berkurang saat itu juga", status langsung processed .
11.6: kegagalan transfer akibat kesalahan data Kreator "di luar tanggung jawab
Marketiv".
8.7: "Saldo tidak dapat bernilai negatif."
Masalah teknisnya: status processed  di sistem kita ≠ uang sampai di rekening. Kalau
disbursement gagal (nomor rekening salah, rekening tutup, bank down), dana
dikembalikan oleh bank ke rekening kita — tapi menurut 11.4 saldo Kreator sudah
dipotong, dan menurut 11.6 itu bukan urusan kita. Secara hukum, kita menahan uang yang
tidak pernah sampai ke pemiliknya dan menolak bertanggung jawab. Klausul semacam ini
masuk kategori klausula baku yang dilarang Pasal 18 UU 8/1999 dan hampir pasti gugur di
sengketa mana pun.
Ini juga masalah desain data: satu status boolean tidak cukup untuk merepresentasikan
proses yang punya kegagalan asinkron.
Rekomendasi redaksi
11.4 (revisi) — Permintaan penarikan yang lolos validasi sistem mengurangi saldo
tersedia Kreator pada saat permintaan dibuat, dan diteruskan ke penyedia jasa transfer.
Status penarikan terdiri dari: diminta, diproses, berhasil, dan gagal. Dana diperkirakan
diterima dalam [1×24 jam kerja], tunduk pada waktu proses bank/e-wallet penerima.
11.6 (revisi) — Apabila transfer gagal dan dana dikembalikan kepada Marketiv oleh
bank/e-wallet penerima — termasuk karena ketidaksesuaian data yang diberikan
Kreator — dana tersebut dikembalikan ke saldo tersedia Kreator selambat-lambatnya
[3] hari kerja sejak dana diterima kembali, dikurangi biaya yang secara nyata
dibebankan pihak ketiga (jika ada). Marketiv tidak bertanggung jawab atas
keterlambatan atau kerugian yang timbul dari kesalahan data tujuan yang diberikan
Kreator, namun tidak menahan dana yang gagal ditransfer.


---

# Halaman 9

Dampak implementasi
Item
Aksi
withdrawals.status
Enum: requested  → processing  → succeeded  | failed  |
reversed . Jangan langsung processed
Appwrite Function
withdrawal-callback  untuk menerima status dari penyedia
disbursement; kalau MVP transfernya manual, admin butuh aksi
eksplisit "tandai gagal & kembalikan saldo"
Ledger
Reversal wajib dicatat sebagai entry baru
( type=withdrawal_reversal ), bukan update entry lama — sejalan
dengan Pasal 8.8
Anti-fraud
Tambah rate limit: maks [3] permintaan withdrawal per hari per akun,
dan cooling period setelah perubahan data rekening
Test
Unit: available  kembali persis semula setelah reversal; e2e: gagal →
saldo pulih
Catatan tambahan (P1, digabung di sini karena satu alur): tidak ada klausul KYC sama
sekali. Kita mengirim uang ke rekening bank atas dasar data yang diketik sendiri oleh
pengguna, tanpa hak kontraktual untuk meminta identitas. Ini masalah AML dan juga
masalah operasional (mismatch nama rekening). Tambahkan:
11.8 (baru) — Marketiv dapat meminta dokumen identitas dan/atau bukti kepemilikan
rekening tujuan sebelum memproses penarikan, khususnya apabila terdapat indikasi
risiko, nominal tidak wajar, atau ketidaksesuaian nama pemilik rekening dengan data
akun. Penarikan dapat ditahan sampai verifikasi selesai.
CTO-06 — Tidak ada klausul alat bukti sistem dan tidak ada zona waktu
resmi
Seluruh dokumen · Severity: P0 · Owner: CTO
Temuan
Dokumen ini bergantung pada waktu di banyak tempat — kedaluwarsa Claim (7.1.d),
estimasi hari pengerjaan (7.2.a), batas pengajuan sengketa (14.7), SLA refund (15.1.c) —
tetapi tidak pernah menyebut zona waktu, dan tidak pernah menyebut hari kalender vs
hari kerja untuk estimasi pengerjaan Rate Card.
Lebih fundamental: tidak ada klausul yang menyatakan catatan sistem Marketiv adalah
alat bukti yang mengikat. Padahal seluruh mekanisme kita — urutan Claim first-come-
first-served, jumlah views, saldo wallet, waktu submit — bersandar pada timestamp server
kita.


---

# Halaman 10

Rekomendasi redaksi (tambahkan ke Pasal 21 — Ketentuan Lain-lain)
21.4 (baru) — Catatan Sistem Seluruh catatan elektronik pada sistem Marketiv —
termasuk namun tidak terbatas pada waktu Claim, waktu penyerahan Bukti Tayang,
jumlah views tercatat, mutasi saldo, status escrow, dan riwayat komunikasi pada Rate
Card Mode — merupakan alat bukti yang sah dan mengikat para pihak sepanjang tidak
dibuktikan sebaliknya, sesuai Undang-Undang Nomor 11 Tahun 2008 sebagaimana
telah diubah. Urutan Claim ditentukan berdasarkan waktu pencatatan pada server
Marketiv, bukan waktu pada perangkat Pengguna.
21.5 (baru) — Waktu dan Perhitungan Hari Seluruh waktu yang dirujuk dalam Syarat
& Ketentuan ini menggunakan Waktu Indonesia Barat (WIB, UTC+7). Kecuali
dinyatakan lain, "hari" berarti hari kalender. Proses otomatis sistem (antara lain
kedaluwarsa Claim dan persetujuan otomatis) dijalankan secara berkala, sehingga
dapat terjadi selisih waktu wajar antara berakhirnya suatu batas waktu dan pencatatan
perubahan status oleh sistem.
Kalimat terakhir itu kecil tapi penting: kita menjalankan expire-stale-claims  sebagai
cron, bukan realtime. Tanpa klausul ini, Kreator yang submit 10 menit setelah deadline tapi
sebelum cron jalan punya argumen — dan sebaliknya.
Dampak implementasi
Seluruh datetime disimpan UTC di Appwrite, dirender WIB di UI. Buat util
formatWIB()  tunggal, jangan tersebar.
estimasi hari pengerjaan  di form Rate Card: label UI wajib "hari kalender".
Frekuensi cron didokumentasikan di backend docs (kalau tiap 1 jam, "selisih wajar" =
≤1 jam).
CTO-07 — Collab Post vs pelepasan escrow: T&C tidak sama dengan
implementasi
Pasal 7.2.g vs 8.4.b · Severity: P0 · Owner: CTO
Temuan
T&C 8.4.b: escrow rilis apabila UMKM menyetujui hasil akhir, "termasuk kewajiban
Collab Post pada Pasal 7.2.g".
Backend ( Orders/30_Business_Rules.md , dicatat sendiri di Lampiran 3.C.10): escrow
rilis saat UMKM approve deliverable. Validasi URL Collab Post hanya ada di lapisan
docs lama.
Jadi T&C menjanjikan gate yang tidak ada di kode. Kalau UMKM menuntut karena Collab
Post tidak pernah tayang padahal dana sudah rilis, dokumen kita sendiri yang
memberatkan kita.
Ada juga masalah teknis yang belum dipikirkan: Collab Post butuh UMKM menerima
undangan collab di akun sosialnya. Kreator bisa sudah melakukan segalanya dengan
benar dan tetap terblokir karena UMKM tidak menekan "accept" di Instagram/TikTok.


---

# Halaman 11

Kalau kita jadikan Collab Post sebagai syarat release, kita menciptakan sandera baru yang
persis seperti CTO-02.
Rekomendasi
Pilih satu, lalu sinkronkan T&C + backend docs + kode:
Opsi 1 (rekomendasi saya untuk MVP): Escrow rilis saat deliverable disetujui. Collab Post
tetap kewajiban kontraktual Kreator, tapi ditegakkan lewat sanksi (Pasal 12/18), bukan
lewat penahanan dana. Alasan: mengurangi state machine, menghilangkan risiko sandera,
dan sesuai kode yang sudah jalan.
8.4.b (revisi) — pada Rate Card Mode, UMKM menyetujui deliverable atau berlaku
persetujuan otomatis sesuai Pasal 7.2.f. Kewajiban Kreator menyerahkan URL Collab
Post sesuai Pasal 7.2.g tetap melekat setelah pelepasan dana; kelalaian atas kewajiban
tersebut dikenai sanksi sesuai Pasal 18.
Opsi 2: Collab Post jadi syarat release → butuh state awaiting_collab_url , timeout, dan
klausul "apabila UMKM tidak menerima undangan kolaborasi dalam [X] hari, kewajiban
Kreator dianggap terpenuhi". Effort lebih besar; tunda ke post-MVP.


---

# Halaman 12

BAGIAN B — TEMUAN MAJOR (P1), PER DOMAIN
B.1 — Akun Pengguna (Pasal 5)
ID
Temuan
Rekomendasi
CTO-
08
5.1.a "satu akun satu peran" tidak menjelaskan
apakah peran bisa diubah. Secara teknis
profiles.role  bisa di-update; tanpa aturan,
ini celah (UMKM ganti jadi Kreator untuk
klaim campaign sendiri).
Tambahkan: "Peran akun tidak dapat
diubah setelah pendaftaran. Pengguna
yang ingin menggunakan peran lain wajib
mendaftar dengan alamat email berbeda."
Enforce: role  immutable via document
permission + validasi Function.
CTO-
09
5.1.g akun ditangguhkan → tidak dijelaskan
nasib escrow transaksi berjalan. Pasal 18.2
hanya menyebut Claim & submission jadi
tidak berlaku. Kalau Kreator di-suspend saat
dana UMKM ada di escrow, dokumen tidak
menjawab siapa yang dapat uangnya.
Tambahkan ke 18.2: "Dana escrow atas
transaksi yang terdampak penangguhan
dibekukan dan diselesaikan melalui
mekanisme Pasal 14; apabila pelanggaran
terbukti, dana dikembalikan kepada
UMKM."
CTO-
10
5.1.e / 5.3.c — verifikasi email & kode
MARKETIV-XXXX  sengaja dilunakkan karena
belum ada di backend (K-11, K-12). Redaksi
permisif ("dapat mensyaratkan") secara
hukum aman, tapi fitur finansial tanpa gate
verifikasi email adalah risiko fraud nyata
(akun sekali pakai untuk claim + withdraw).
Keputusan produk: saya rekomendasikan
email verification wajib sebelum
withdrawal pertama. Murah (Appwrite
Auth native), langsung menutup vektor
abuse. Kalau setuju, kembalikan redaksi
spesifik.
CTO-
11
Tidak ada pencatatan versi T&C yang
disetujui pengguna. Pasal 3.3 menyatakan
penggunaan berlanjut = persetujuan, tapi
tanpa bukti per-pengguna, Pasal 3 sulit
ditegakkan.
profiles : tambah tos_version
(string), tos_accepted_at  (datetime).
Checkbox saat registrasi menyimpan
versi. Saat versi berubah → interstitial re-
consent.


---

# Halaman 13

B.2 — Campaign Mode / PPV (Pasal 7.1)
ID
Temuan
Rekomendasi
CTO-
12
7.1.c first-come-first-served
tanpa aturan race condition.
Dua Kreator claim slot terakhir
bersamaan.
Ditutup sebagian oleh CTO-06 (timestamp server).
Teknis: claim wajib lewat satu Function dengan
pengecekan kuota + penulisan claim dalam satu operasi;
jangan baca-lalu-tulis di client. Test: 10 claim paralel
pada kuota 1 → tepat 1 sukses.
CTO-
13
7.1.i aset UMKM via link
eksternal, tapi tidak ada
ketentuan kalau link
mati/tidak bisa diakses.
Kreator sudah claim, tidak bisa
kerja, lalu claim-nya expired
dan dia yang rugi.
Tambahkan: "UMKM wajib menjaga tautan aset tetap
dapat diakses selama campaign aktif. Apabila aset tidak
dapat diakses, Kreator dapat membatalkan Claim tanpa
konsekuensi melalui Platform, dan slot kembali ke kuota."
Implementasi: tombol "Batalkan Claim — aset tidak bisa
diakses" + alasan tercatat + counter per campaign untuk
deteksi UMKM bermasalah.
CTO-
14
7.1.j pause/stop hanya
mengatur submission yang
sudah masuk. Claim aktif yang
belum submit tidak diatur —
Kreator mungkin sudah selesai
syuting.
Tambahkan: "Claim yang sudah berjalan pada saat
campaign dijeda/dihentikan tetap berlaku sampai batas
waktu pengerjaannya, dan budget untuk Claim tersebut
tetap ditahan." Implementasi: kalkulasi sisa budget yang
dapat direfund harus mengurangi komitmen claim
aktif, bukan hanya submission approved.
CTO-
15
7.1.f alokasi budget saat
beberapa submission disetujui
hampir bersamaan → potensi
over-allocation melebihi
budget.
Tambahkan: "Alokasi budget mengikuti urutan waktu
persetujuan Bukti Tayang. Reward dibatasi sisa budget
pada saat persetujuan." Implementasi: pengurangan
remaining_budget  dan penulisan reward wajib satu
Function; jangan sekali pun hitung sisa budget di client.
CTO-
16
7.1.g peralihan saldo tertunda
→ tersedia tidak punya
mekanisme maupun durasi
(Lampiran 3.C.8 mengakuinya).
"24 jam" di mock UI bukan
aturan.
Putuskan sekarang. Rekomendasi: "Reward menjadi
saldo tersedia bersamaan dengan pelepasan escrow,
kecuali terdapat pemeriksaan tambahan sesuai Pasal 13,
maksimal [7] hari." UI wajib menampilkan estimasi
tanggal cair — ini pertanyaan #1 support Kreator.
CTO-
17
K-8: T&C bilang "platform yang
didukung", backend hanya
TikTok. Redaksi netral itu
benar, tapi UI dan validasi Zod
harus sama persis dengan
yang didukung.
Sumber kebenaran tunggal: SUPPORTED_PLATFORMS  di
shared config, dipakai Zod schema + UI helper text +
halaman bantuan. Kalau Instagram belum ada, jangan
muncul di mana pun.


---

# Halaman 14

ID
Temuan
Rekomendasi
CTO-
18
7.1.a minimum budget
Rp50.000 + fee 5% → total
Rp52.500. Perlu dipastikan
konsisten dengan minimum
amount Midtrans per channel
pembayaran (beberapa VA
punya minimum sendiri).
Verifikasi ke dokumentasi channel Midtrans yang
diaktifkan; kalau ada channel dengan minimum lebih
tinggi, sembunyikan channel tersebut untuk nominal
kecil.


---

# Halaman 15

B.3 — Rate Card & Custom Offer (Pasal 7.2, 7.3)
ID
Temuan
Rekomendasi
CTO-
19
7.3 Custom Offer tidak punya masa berlaku.
Harga terkunci selamanya; Kreator bisa
menerima offer 3 bulan kemudian.
Tambahkan: "Custom Offer berlaku [7]
hari kalender sejak dikirim dan otomatis
kedaluwarsa apabila tidak diterima."
Implementasi:
custom_offers.expires_at  + cron
expiry + status expired .
CTO-
20
7.2.d order mulai setelah pembayaran, tapi
titik awal hitungan estimasi hari pengerjaan
tidak ditegaskan.
"Estimasi hari pengerjaan dihitung sejak
dana masuk escrow (pembayaran
terverifikasi)." Implementasi:
orders.work_started_at  = timestamp
webhook sukses, bukan waktu create
order.
CTO-
21
7.2.e deliverable boleh via pengelola berkas
Platform "tunduk pada kuota penyimpanan" —
kuota 100MB/akun. Untuk video, ini praktis
tidak mungkin. T&C menawarkan jalur yang
sistemnya tidak sanggup.
Tegaskan: "Deliverable berupa video
wajib diserahkan melalui tautan eksternal
HTTPS. Pengelola berkas Platform hanya
untuk berkas ringan." Sejalan dengan
aturan storage kita.
CTO-
22
K-13 limit 3 paket aktif ada di T&C tapi tidak
ada di RateCards/30_Business_Rules.md .
Aturan yang hanya hidup di T&C tidak
ditegakkan sistem.
Tambahkan ke backend docs + validasi di
Function saat publish (bukan hanya UI
disable). Definisikan "aktif" = status 
=== 'published' . Test: publish paket
ke-4 → ditolak Function.
CTO-
23
7.2.b chat hanya di Rate Card. Perlu
ditegaskan kapan chat ditutup (setelah order
selesai? selamanya?) — implikasi retensi data
& PDP.
"Akses chat tersedia selama order berjalan
dan [30] hari setelah order selesai untuk
keperluan rujukan; setelahnya bersifat
hanya-baca/diarsipkan." Implementasi:
conversations.archived_at ,
subscribe realtime hanya untuk order
aktif.


---

# Halaman 16

B.4 — Pembayaran, Biaya, Escrow (Pasal 8, 9)
ID
Temuan
Rekomendasi
CTO-
24
Tidak ada klausul chargeback /
pembatalan oleh penerbit kartu
setelah escrow dirilis.
Kombinasikan dengan 8.7 (saldo
tidak boleh negatif) → kita tidak
punya jalur pemulihan dana sama
sekali.
Tambahkan 8.9: "Apabila pembayaran dibatalkan,
ditarik kembali, atau dinyatakan tidak sah oleh
penyedia pembayaran atau penerbit instrumen
setelah dana dirilis, Marketiv berhak menahan atau
menarik kembali dana terkait dari Wallet Pengguna.
Apabila saldo tidak mencukupi, kekurangan tersebut
tetap menjadi kewajiban Pengguna kepada Marketiv."
Ini pengecualian sah terhadap 8.7 dan harus disebut
eksplisit di sana.
CTO-
25
8.5 verifikasi signature webhook
sudah benar, tapi idempotensi
tidak disebut dan tidak ada
aturan status tidak mundur.
Midtrans mengirim notifikasi
berulang.
Bukan isu redaksi T&C, tapi wajib di backend docs:
unique index pada order_id + 
transaction_status , state machine satu arah, tolak
transisi mundur, semua ke audit_logs . Ini
penyebab bug duplikasi escrow paling umum.
CTO-
26
Pasal 9: fee Campaign dipungut
di muka dari total budget,
sementara reward dibayar per
views. Kalau budget tidak habis,
kita sudah memungut fee atas
dana yang direfund. Pasal 15.3.a
masih placeholder.
Putuskan. Rekomendasi: fee dikembalikan
proporsional terhadap budget yang direfund — lebih
adil, lebih mudah dipertahankan, dan mudah dihitung
( refund_fee = floor(refund_budget × 0.05) ).
Kalau tidak dikembalikan, wajib disclosure eksplisit
sebelum bayar.
CTO-
27
Biaya Midtrans (MDR) tidak
disebut di mana pun. Di Rate
Card, UMKM bayar persis harga
paket, fee 5% dipotong dari
Kreator — tetapi MDR (±2–3%
untuk kartu) ditanggung
Marketiv dari fee tersebut. Margin
bersih bisa mendekati nol atau
negatif per transaksi kartu.
Isu unit economics, bukan hanya legal. Opsi: (a) batasi
channel pembayaran untuk MVP ke QRIS/VA yang
MDR-nya rendah, atau (b) bebankan biaya kanal ke
UMKM secara transparan. Perlu keputusan bersama
sebelum tarif dikunci di T&C, karena Pasal 3
membuat perubahan tarif jadi merepotkan.
CTO-
28
Aspek pajak tidak disinggung
sama sekali — PPN atas jasa
platform, dan status penghasilan
Kreator.
Minimal tambahkan klausul netral: "Harga yang
ditampilkan belum termasuk pajak yang mungkin
berlaku. Kewajiban perpajakan atas penghasilan
masing-masing Pengguna menjadi tanggung jawab
Pengguna." Implikasi teknis: siapkan field npwp
(opsional) dan struktur invoice sejak awal — retrofit
ke ledger yang sudah berisi data jauh lebih mahal.


---

# Halaman 17

ID
Temuan
Rekomendasi
CTO-
29
Istilah "escrow" dipakai bebas
padahal secara hukum merujuk
penitipan oleh pihak berlisensi.
Pertahankan di UI (mudah dipahami), tapi definisikan
di Pasal 4 sebagai "mekanisme penahanan dana oleh
sistem Marketiv" — yang sudah dilakukan dokumen
ini dengan benar. Cukup pastikan tidak ada copy UI
yang menyebut "escrow bank" atau "dijamin bank".
B.5 — Wallet & Withdrawal (Pasal 10, 11)
ID
Temuan
Rekomendasi
CTO-
30
10.1.c "pencatatan dana escrow ...
bila relevan" — frasa kabur, tidak
bisa diterjemahkan ke skema.
Definisikan tiga angka saja: available , pending ,
in_escrow . Ketiganya ditampilkan di UI dengan
penjelasan satu baris. Jangan ada angka keempat.
CTO-
31
8.8 koreksi via pencatatan
pembalikan — benar secara
akuntansi, tapi butuh penegasan
bahwa ledger append-only.
Backend docs: transactions  tidak pernah di-
update/delete; koreksi = entry baru dengan
reverses_transaction_id . Permission: tidak ada
role yang punya update / delete  pada koleksi ini,
termasuk admin.
CTO-
32
Tidak ada limit dan anti-abuse
withdrawal (frekuensi, nominal
harian).
Tambahkan ke 11: "Marketiv dapat menetapkan batas
jumlah dan frekuensi penarikan demi keamanan."
Implementasi: rate limit di Function, bukan di UI.
CTO-
33
K-4 biaya admin Rp2.500 ada di
KeuanganView.tsx  tapi tidak
ada di alur backend.
Blocker kecil tapi nyata: UI memotong biaya yang
tidak dipotong sistem = salah tampil ke pengguna.
Kalau tidak resmi, hapus ADMIN_FEE  dari UI minggu
ini. Kalau resmi, masukkan ke Function + Pasal 11.7.


---

# Halaman 18

BAGIAN C — KLAUSUL YANG HILANG DAN HARUS
DITAMBAHKAN
#
Klausul
Alasan (sudut CTO)
1
Catatan sistem
sebagai alat bukti
(CTO-06)
Fondasi seluruh penegakan mekanisme kita
2
Zona waktu &
definisi hari (CTO-
06)
Setiap deadline tidak bermakna tanpa ini
3
Chargeback &
penarikan kembali
dana (CTO-24)
Satu-satunya jalur pemulihan dana pasca-release
4
KYC / verifikasi
penerima dana
(CTO-05)
AML + syarat praktis penyedia disbursement
5
Pemeliharaan &
ketersediaan
layanan
Belum ada. Tambahkan: "Marketiv dapat melakukan pemeliharaan
terjadwal dengan pemberitahuan wajar; batas waktu yang jatuh saat
pemeliharaan diperpanjang selama durasi gangguan." Melindungi kita
saat deadline Claim jatuh bersamaan dengan downtime.
6
Force majeure
Pasal 19.4 hanya menutup kegagalan pihak ketiga, bukan
bencana/gangguan jaringan/regulasi
7
Retensi data &
interaksi dengan hak
penghapusan (UU
PDP)
Pasal 8.8 bilang catatan keuangan tidak dihapus; Pasal 17 merujuk UU
PDP yang memberi hak penghapusan. Bertentangan di permukaan.
Tambahkan: "Data transaksi keuangan disimpan sekurang-kurangnya
[10] tahun sesuai kewajiban hukum; penghapusan akun dilakukan
dengan menganonimkan data pribadi tanpa menghapus catatan
keuangan."
8
Batas ukuran berkas
per unggahan
K-15 menegaskan 100MB adalah kuota per akun, sementara validasi
nyata 20MB/berkas & 100 berkas. Pasal 7.1.i menyebut "batas ukuran
yang ditetapkan Platform" — cukup, asalkan ada halaman bantuan
yang memuat angkanya dan angka itu = konstanta di kode
BAGIAN D — MATRIKS KONSISTENSI (T&C ⇄ Docs ⇄ Kode
⇄ UI)
Ini daftar sinkronisasi yang saya minta dieksekusi. Sumber kebenaran: backend docs, lalu
T&C mengikuti, lalu kode, lalu UI.


---

# Halaman 19

Topik
T&C v3
Backend
docs
Kode
UI
Aksi
Fee
platform
5% per-
modul ✅
5% ✅
PLATFORM_FEE_RATE=5%
✅
menampilkan
10%/15% ❌
Perbaiki seluruh copy
UI + 06-business-
rules  + 05-
dashboard-umkm-
guidelines  + 02-
collections-schema
Min.
withdrawal
Rp50.000
✅
Rp50.000
✅
MINIMUM_WITHDRAW=50000
✅
—
Perbaiki 06-business-
rules  par.15
(Rp10.000)
Alur
withdrawal
instan ✅
instan ✅
instan ✅
teks "ditinjau
admin" ❓
Audit copy UI; ubah
status jadi 4-state (CTO-
05)
Biaya
admin
withdraw
placeholder
tidak ada
tidak ada
ADMIN_FEE
Rp2.500 ❌
Hapus dari UI atau
resmikan
Platform
Bukti
Tayang
netral
TikTok
saja
validasi TikTok
?
Satu konstanta
SUPPORTED_PLATFORMS
untuk semua lapisan
Limit 3
paket
ada ✅
tidak ada
❌
?
?
Tambah ke backend
docs + validasi Function
Collab Post
vs release
jadi syarat
❌
bukan
syarat
bukan syarat
?
Putuskan CTO-07,
sinkronkan tiga arah
Refund ke
Wallet
UMKM
ya
ya
—
tidak ada fitur
tarik ❌
Bangun withdrawal
UMKM (CTO-03)
Pending →
available
tidak diatur
❌
"masuk
pending"
?
mock "24
jam" ❌
Putuskan CTO-16
BAGIAN E — CHECKLIST IMPLEMENTASI TEKNIS
Kalau seluruh rekomendasi di atas diterima, ini yang berubah di sistem:
Collections / atribut baru
submissions : views_count , views_captured_at , views_source , views_final


---

# Halaman 20

orders : review_deadline_at , auto_approved , revision_count , revision_limit ,
work_started_at
custom_offers : expires_at
withdrawals : status  (4-state), requester_role , failure_reason , reversed_at
profiles : tos_version , tos_accepted_at , email_verified_at , npwp  (opsional)
transactions : reverses_transaction_id
conversations : archived_at
campaigns : committed_budget  (budget yang terikat claim aktif, terpisah dari
spent_budget )
Appwrite Functions
auto-approve-orders  (cron) — CTO-02
expire-custom-offers  (cron) — CTO-19
reconcile-ledger  (cron harian) — CTO-04
withdrawal-callback  / aksi admin "tandai gagal & kembalikan saldo" — CTO-05
claim-campaign  — pastikan atomik, kuota dicek & ditulis dalam satu Function —
CTO-12
midtrans-webhook  — idempotensi + state machine satu arah — CTO-25
Validasi bersama (Zod)
SUPPORTED_PLATFORMS  sebagai sumber tunggal untuk validasi URL Bukti Tayang
Semua URL eksternal: wajib https: , host allowlist untuk Drive/Dropbox
Batas berkas: 20MB/berkas, kuota 100MB/akun — divalidasi di frontend dan Function
Testing prioritas
Vitest: calculateReward  (0 views, <1000 views, cap sisa budget, pembulatan ke
bawah), calculateFee  kedua modul, reversal withdrawal mengembalikan saldo
persis
Playwright: auto-approve order; claim paralel pada kuota 1; withdrawal gagal → saldo
pulih; refund UMKM → bisa ditarik


---

# Halaman 21

BAGIAN F — KEPUTUSAN YANG SAYA MINTA (SEBELUM
SIGN-OFF CTO)
#
Keputusan
Owner
Dampak jika ditunda
1
Sumber & waktu pengukuran views
CTO + CAIO
Campaign Mode tidak bisa
dioperasikan secara adil
2
Auto-approve Rate Card: ya/tidak,
berapa hari
CTO + Ketua
Tim
Escrow macet, beban admin manual
3
Withdrawal UMKM: bangun atau
refund ke sumber
Ketua Tim
Risiko konsumen + regulasi
4
Fitur top-up wallet: hapus dari MVP?
Ketua Tim +
CTO
Menentukan eksposur regulasi PJP
5
Rekening terpisah untuk dana
pengguna
Ketua Tim
Risiko likuiditas & audit
6
Collab Post sebagai syarat release:
ya/tidak
CTO + CMO
T&C dan kode saling bertentangan
7
Fee dikembalikan proporsional saat
refund?
Ketua Tim
Pasal 15.3 tidak bisa difinalkan
8
Channel pembayaran Midtrans yang
diaktifkan (MDR)
CTO + Ketua
Tim
Margin per transaksi bisa negatif
9
Verifikasi email wajib sebelum
withdrawal pertama
CTO
Vektor fraud akun sekali pakai
10
Durasi pending → available
CTO
Pertanyaan support #1, tidak
terjawab
BAGIAN G — KRITERIA SIGN-OFF CTO
Saya menandatangani bagian saya apabila:
1. ✅ CTO-01 s.d. CTO-07 tertutup dengan redaksi final.
2. ✅ Seluruh baris Bagian D berstatus konsisten di empat lapisan (T&C, docs, kode, UI).
3. ✅ Tidak ada angka di T&C yang tidak punya konstanta padanan di kode, dan
sebaliknya.
4. ✅ Setiap mekanisme otomatis yang disebut T&C (kedaluwarsa Claim, auto-approve,
kedaluwarsa offer) punya Function yang benar-benar ada dan tertes.
5. ✅ audit_logs  menulis entry untuk setiap perubahan status escrow, wallet, dan
withdrawal — tanpa pengecualian.


---

# Halaman 22

6. ✅ Lampiran 3.C (keputusan produk terbuka) tinggal nol item yang bersinggungan
dengan uang.
Catatan penutup untuk tim: dokumen ini jauh lebih baik dari kebanyakan draf T&C
startup tahap ini — terutama disiplin Lampiran 2 yang memetakan konflik ke file
sumbernya. Blocker yang saya angkat hampir semuanya bertipe sama: T&C
mendeskripsikan proses, tetapi tidak menetapkan siapa yang menang ketika proses itu
berhenti. Setiap kali uang berhenti bergerak, harus ada pasal yang menentukan ke mana ia
bergerak berikutnya, dan cron yang menjalankannya.
Disusun oleh CTO Marketiv · Review terhadap S&K v3 (Draf Gabungan) · Untuk dibahas
pada review akhir seluruh tim.
