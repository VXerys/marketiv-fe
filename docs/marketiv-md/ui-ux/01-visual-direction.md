# 01 — Visual Direction Marketiv

> Dokumen ini mendefinisikan arah visual baru Marketiv berbasis light mode.
> Referensi utama: Konten.com untuk energi creator marketplace dan Acctual untuk clean SaaS financial trust.

## 1. Tujuan Dokumen

Dokumen ini menjadi fondasi semua keputusan UI/UX Marketiv.
Arah desain ini mengganti total gaya visual lama menjadi light mode yang lebih bersih, hangat, dan kredibel.
Dokumen ini harus dibaca sebelum membuat halaman dashboard, landing page, atau komponen UI baru.
Fokus utama proyek saat ini adalah dashboard MVP, bukan landing page.
Landing page tetap dibahas, tetapi prioritas implementasi tetap dashboard UMKM dan dashboard Kreator.

## 2. Design Thesis

Marketiv harus terasa seperti SaaS marketplace modern untuk UMKM dan kreator mikro.
Marketiv tidak boleh terlihat terlalu corporate karena perlu menarik bagi kreator muda.
Marketiv juga tidak boleh terlalu playful karena menangani uang, escrow, campaign, dan validasi kerja.
Arah terbaik adalah gabungan antara clean SaaS dan creator marketplace.
Konsep utama: **Warm SaaS Marketplace for UMKM Growth and Creator Monetization**.

## 3. Karakter Brand Visual

1. Warm — terasa ramah dan approachable untuk UMKM lokal.
2. Clean — layout bersih, tidak ramai, mudah dipahami.
3. Trustworthy — cocok untuk fitur escrow, pembayaran, dan validasi.
4. Energetic — tetap punya energi kreator, campaign, dan monetisasi.
5. Practical — semua UI harus membantu user menyelesaikan aksi utama dengan cepat.

## 4. Prinsip Utama

- Light mode menjadi default visual system.
- Orange digunakan sebagai warna aksi utama, bukan warna background dominan.
- Background memakai warm off-white agar tidak terasa kaku.
- Card menjadi struktur utama untuk dashboard, campaign, rate card, payout, dan transaksi.
- Semua halaman harus punya satu CTA utama yang paling jelas.
- Bahasa UI harus sederhana, terutama untuk UMKM.
- Komponen penting tidak boleh icon-only.
- Dashboard mobile-first tetap menjadi standar awal.
- Visual tidak boleh mengorbankan readability data.
- UI harus siap dipakai untuk MVP, bukan hanya terlihat bagus di mockup.

## 5. Breakdown Referensi Konten.com

Konten.com kuat sebagai referensi untuk sisi kreator dan campaign marketplace.
Website tersebut menggunakan komunikasi yang sangat langsung tentang brand, posting konten, views, dan earning.
Arah visualnya cocok untuk menjelaskan bahwa kreator bisa mendapat peluang monetisasi dari campaign.
Marketiv dapat mengambil pola campaign card, payout summary, view-based metric, dan workflow submission.
Marketiv tidak perlu meniru tone yang terlalu santai di semua tempat.
Tone energik boleh digunakan di dashboard Kreator dan Job Pool.
Tone UMKM harus tetap jelas, tenang, dan meyakinkan.

### Elemen yang Diambil dari Konten.com

- Campaign card yang ringkas.
- Metric views dan payout yang mudah dipindai.
- Status approval seperti Pending, Approved, Rejected.
- Progress campaign atau kuota kreator.
- CTA yang sangat jelas.
- Copy pendek dan direct.
- Energy visual untuk creator dashboard.

### Elemen yang Tidak Diambil dari Konten.com

- Visual yang terlalu ramai.
- Slang berlebihan untuk area UMKM.
- Warna gelap sebagai basis utama.
- Komunikasi yang terlalu fokus pada earning tanpa trust system.

## 6. Breakdown Referensi Acctual

Acctual kuat sebagai referensi untuk clean SaaS dan financial trust.
Website tersebut memakai whitespace besar, typography tegas, dan card yang rapi.
Arah ini cocok untuk Marketiv karena ada pembayaran, escrow, komisi, transaksi, dan saldo kreator.
Marketiv dapat mengambil pendekatan clean dashboard, payment clarity, dan visual trust dari Acctual.
Acctual juga relevan untuk halaman keuangan, admin report, withdrawal, dan transaksi.

### Elemen yang Diambil dari Acctual

- Light background yang luas.
- Product preview yang clean.
- Financial card yang readable.
- Section yang punya hierarchy kuat.
- Typography besar dan yakin.
- Border halus dan shadow minimal.
- Layout yang terasa premium tanpa dekorasi berlebihan.

### Elemen yang Tidak Diambil dari Acctual

- Kesan yang terlalu fintech internasional.
- Copy yang terlalu abstrak untuk UMKM lokal.
- Layout desktop-first yang terlalu luas jika tidak diadaptasi ke mobile.

## 7. Visual Formula Marketiv

Marketiv = Acctual sebagai fondasi dashboard + Konten.com sebagai energi marketplace.
Dashboard UMKM mengikuti Acctual lebih banyak.
Dashboard Kreator mengikuti Konten.com lebih banyak.
Halaman keuangan mengikuti Acctual hampir penuh.
Halaman Job Pool mengikuti Konten.com dengan struktur card feed.
Halaman Landing menggabungkan keduanya.

## 8. Visual Moodboard dalam Kata

Bayangkan background cream lembut, card putih, CTA orange, teks navy gelap, dan badge pastel.
Komponen terasa rounded, modern, dan tidak tajam.
Setiap data penting berada di card yang clean.
Area uang dan escrow terlihat aman, bukan spekulatif.
Area kreator terlihat aktif, rewarding, dan cepat dipahami.
Area UMKM terlihat guided, simple, dan tidak intimidating.

## 9. Layout Personality

- Dashboard: structured, calm, efficient.
- Campaign Mode: task-based, clear, no-chat, performance-driven.
- Rate Card Mode: consultative, conversational, premium.
- Admin Panel: dense but readable, data-first.
- Landing Page: persuasive, visual, benefit-first.

## 10. UX Priority

Prioritas pertama adalah user paham apa yang harus dilakukan.
Prioritas kedua adalah user percaya dana dan pekerjaan aman.
Prioritas ketiga adalah UI terlihat modern dan kompetitif.
Visual aesthetic tidak boleh mengalahkan clarity.
Semua flow utama harus bisa dipahami tanpa penjelasan panjang.

## 11. Target User Interpretation

UMKM membutuhkan UI yang jelas, tidak teknis, dan tidak membingungkan.
Kreator membutuhkan UI yang cepat, informatif, dan terasa memberi peluang.
Admin membutuhkan UI yang padat, filterable, dan siap untuk validasi manual.
Semua role membutuhkan status yang eksplisit.

## 12. Do

- Gunakan whitespace yang cukup.
- Gunakan card putih di atas background warm.
- Gunakan orange hanya untuk aksi dan highlight.
- Gunakan status badge untuk semua kondisi penting.
- Gunakan copy pendek dan actionable.
- Gunakan wizard untuk form panjang.
- Gunakan empty state dengan instruksi berikutnya.
- Gunakan skeleton loading untuk data dashboard.
- Gunakan responsive pattern sejak awal.
- Gunakan design token, bukan hardcoded style.

## 13. Don't

- Jangan membuat background orange full-screen untuk dashboard.
- Jangan memakai dark mode sebagai default.
- Jangan memakai terlalu banyak gradient.
- Jangan membuat button terlalu banyak dalam satu section.
- Jangan memakai icon-only untuk aksi penting.
- Jangan membuat form campaign satu halaman panjang.
- Jangan menaruh chat di Campaign Mode.
- Jangan menyembunyikan status pembayaran atau escrow.
- Jangan membuat card terlalu dekoratif sampai data sulit dibaca.
- Jangan memakai jargon teknis untuk UMKM.

## 14. Page-Level Visual Direction

Landing page harus persuasive dan visual.
Dashboard home harus summary-first.
Campaign builder harus guided wizard.
Job Pool harus card-feed-based.
Rate Card directory harus searchable grid.
Chat Rate Card harus clear dan transactional.
Keuangan harus trust-first dan audit-friendly.
Admin report harus compact dan export-oriented.

## 15. Final Visual Decision

Gunakan nama sistem visual: **Marketiv Light OS**.
Marketiv Light OS adalah sistem visual light mode untuk dashboard SaaS marketplace.
Sistem ini memprioritaskan clarity, trust, dan campaign velocity.
Semua dokumen UI/UX berikutnya harus mengacu ke dokumen ini.

## 16. Implementation Note

Ketika membuat UI di Stitch, Cursor, atau AI UI generator, selalu sebutkan bahwa Marketiv memakai light mode warm SaaS marketplace.
Sebutkan primary orange, secondary deep navy, warm off-white background, white cards, dan rounded modern components.
Jangan biarkan AI generator membuat dark dashboard, neon style, atau landing page yang terlalu abstrak.
