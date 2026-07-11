# Implementation Plan — Negosiasi Rate Card Kreator

## Task List

- [ ] 1. Refactor Negosiasi List View
  - File: `src/components/features/creator-dashboard/NegosiasiView.tsx`
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

  - [ ] 1.1 Update Metrics Overview Cards
    - Ubah background metric card dari warm cream/neutral menjadi solid putih atau slate-grey.
    - Ubah warna card "Menunggu Pembayaran" dari variant orange ke tone blue/indigo.
    - _Requirements: 1.1, 1.2_

  - [ ] 1.2 Update Listing Card Layout
    - Ubah border dan background card menjadi solid putih (`bg-white` dengan border `border-neutral-200/50`).
    - Rapikan susunan avatar brand, info project, unread message count badge, penawaran harga, dan status badge.
    - _Requirements: 2.1, 2.2_

- [ ] 2. Refactor Chat Negosiasi Room View
  - File: `src/components/features/creator-dashboard/NegosiasiRoomView.tsx`
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2_

  - [ ] 2.1 Redesign Split-Pane Layout
    - Atur letak area chat room (8 kolom) di sebelah kiri dan panel rincian kontrak/checklist (4 kolom) di sebelah kanan.
    - _Requirements: 4.1_

  - [ ] 2.2 Update Warning Banner & Chat Bubbles
    - Percantik banner "Collab Post" dengan warna kuning/amber yang halus.
    - Bedakan desain bubble chat UMKM (kiri, putih, avatar brand), Creator (kanan, slate-grey/hitam), dan System (tengah, badge violet).
    - _Requirements: 4.2, 4.3_

  - [ ] 2.3 Implement Custom Offer Form & Card Widget
    - Hubungkan tombol toolbar "Buat Custom Offer" ke modal popup pengisian penawaran.
    - Tulis fungsi kalkulasi biaya platform (3%) dan total tagihan penawaran.
    - Desain card custom offer yang dikirim ke feed chat lengkap dengan tombol konfirmasi/status.
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

  - [ ] 2.4 Implement Collab Post Link Submission & Validation
    - Hubungkan tombol "Submit Link Collab Post" ke modal pengisian URL video.
    - Tambahkan validasi tautan URL (harus memuat `http://` atau `https://`, dan memuat domain `tiktok.com` atau `instagram.com`).
    - Setelah link terkirim, ubah status kontrak menjadi "MenungguVerifikasi" dan render notifikasi sistem di chat feed.
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 2.5 Redesign Sidebar "Rincian Kontrak Kerja" & Checklist
    - Susun rincian paket, deskripsi scope, durasi, batasan revisi, detail rincian harga (rate, plat fee, total), serta status badge escrow.
    - Buat checklist deliverables interaktif sebagai penanda status milestone aktif (read-only).
    - _Requirements: 7.1, 7.2_

- [ ] 3. Quality Assurance & Build Checks
  - [ ] 3.1 Jalankan `npm run build` untuk memverifikasi kompilasi typescript/next.js.
  - [ ] 3.2 Lakukan peninjauan visual untuk memastikan warna cream dan aksen oranye tidak bocor.
  - [ ] 3.3 Pastikan formulir URL menolak tautan salah sesuai spesifikasi.
