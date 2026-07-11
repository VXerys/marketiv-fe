# Implementation Plan — Refactor UI Job Pool & Job Detail Kreator

## Overview

Rencana implementasi untuk memoles UI/UX direktori pencarian lowongan kerja kreator (Job Pool) dan halaman detail kampanye (Job Detail). Langkah pengerjaan dilakukan secara bertahap, mulai dari pembaruan tipe data kontrak agar sinkron dengan Appwrite DB, memperbarui mock data, menyusun komponen JobPoolView, menyusun komponen JobDetailView, dan memverifikasi integrasi data.

---

## Task List

- [ ] 1. Penyelarasan Tipe Data dan Mocks (Database Alignment)
  - _Requirements: 5.1, 5.2_
  
  - [ ] 1.1 Pembaruan Tipe Data `CreatorJob` di `src/types/creator-dashboard.ts`
    - Perbarui struktur field `CreatorJob` untuk memetakan database atribut `campaigns` & `campaign_briefs` (mis. `category`, `platforms`, `rewardPer1000Views`, `claimLimit`, `totalClaims`, `budget`, `asset_external_url`, dst).
    - _Requirements: 5.1_

  - [ ] 1.2 Pembaruan Mock Data di `src/mocks/creator-dashboard.mock.ts`
    - Sesuaikan struktur array `mockCreatorJobs` dengan field tipe data baru agar TypeScript compiler tidak error.
    - Pastikan nilai-nilai dummy merepresentasikan format data real (mis. mata uang Rupiah integer).
    - _Requirements: 5.1, 5.2_

- [ ] 2. Refactor UI/UX Halaman Job Pool (`src/components/features/creator-dashboard/JobPoolView.tsx`)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3.1, 3.2, 3.3_

  - [ ] 2.1 Implementasi `MetricTile` Baru
    - Ganti komponen metrik summary di atas halaman menggunakan design `MetricTile` premium (glassmorphism style, hover translate, highlight pada metrik CPM tertinggi).
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

  - [ ] 2.2 Refactor Desain Grid & Cards (`CampaignCard`)
    - Buat sub-komponen `CampaignCard` di dalam file atau import jika reusable.
    - Desain layout card dengan cover aspect ratio 4:3, overlay brand avatar dan brand name, platform badge "PPV".
    - Tambahkan badge absolute "Hampir Penuh" atau "Reward Tinggi" di atas cover.
    - Terapkan progress bar sisa kuota dengan warna gradien oranye-ungu.
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_

  - [ ] 2.3 Standarisasi Kontrol Toolbar
    - Ubah radius border kotak pencarian (`Search`), select kategori, select sorting, dan filter kuota menjadi `rounded-xl`.
    - Posisikan tombol Reset secara dinamis di sebelah kanan kontrol saat filter diubah dari default.
    - _Requirements: 3.1, 3.2, 3.3_

- [ ] 3. Refactor UI/UX Halaman Detail Job (`src/components/features/creator-dashboard/JobDetailView.tsx`)
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.2_

  - [ ] 3.1 Penataan Layout Grid Dua Kolom Premium
    - Atur pembungkus card informasi detail dengan style `bg-white/70 backdrop-blur-md border border-neutral-200/60 rounded-[22px] shadow-sm`.
    - Susun 5 metrics overview dalam baris horizontal yang clean dengan label uppercase.
    - _Requirements: 4.1, 4.2_

  - [ ] 3.2 Implementasi Panel Brief, Aset, dan Pembayaran
    - Tampilkan deskripsi produk, instruksi konten, target audiens, dan CTA dari data model yang baru.
    - Desain panel Do's & Don'ts dengan tata letak side-by-side (Do: soft green, Don't: soft red).
    - Desain panel kanan dengan cover sampul, link Drive/Dropbox tombol hijau tua, dan Aturan Pembayaran dengan soft indigo.
    - Desain tombol klaim utama dengan gradien ungu-oranye cerah.
    - _Requirements: 4.3, 4.4, 5.2_

  - [ ] 3.3 Penyesuaian Tombol Kembali & Modal Klaim
    - Tambahkan efek transisi translate-x kiri pada hover tombol `Kembali ke Job Pool`.
    - Poles checklist modal dan success modal agar sesuai dengan warna aksen brand.
    - _Requirements: 4.5_

- [ ] 4. Integrasi & Verifikasi Akhir
  - _Requirements: semua_

  - [ ] 4.1 Compile & Quality Assurance
    - Jalankan build compiler (`npm run build` atau check TypeScript via IDE) untuk memastikan tidak ada compilation error pada routing `/dashboard/kreator/job-pool` dan `/dashboard/kreator/job-pool/[id]`.
    - Verifikasi kepatuhan terhadap Compliance Checklist Marketiv (Zero chat pada area Campaign Mode).
    - _Requirements: semua_

---

## Quality Gates

- [ ] Seluruh acceptance criteria di requirements.md terpenuhi.
- [ ] TypeScript kompilasi 100% sukses tanpa warning atau error.
- [ ] UI layout responsif penuh dari layar 375px (mobile) hingga desktop.
- [ ] Simulasi lokal penambahan totalClaims berjalan mulus setelah mengklaim campaign.
- [ ] Zero chat/messaging elements diimplementasikan di seluruh area pengerjaan kampanye.

---

## Implementation Sequence

1. **Fase 1 (Types & Mocks)**: Update type definitions terlebih dahulu agar editor dapat mendeteksi properti baru, lalu update mock data agar sesuai dengan kontrak data database.
2. **Fase 2 (Job Pool List)**: Implementasi metrik summary, standarisasi input controls, dan refactor layout grid campaign card.
3. **Fase 3 (Job Detail View)**: Refactor detail layout, pembagian panel brief, side-by-side Do's & Don'ts, panel kanan, dan poles transition efek.
4. **Fase 4 (Verification)**: Jalankan testing workflow untuk memastikan integrasi data dan visual responsif berjalan dengan sempurna.
