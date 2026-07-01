---
trigger: manual
---

# 🧠 MARKETIV: CORE PRODUCT KNOWLEDGE

## 1. VISION & MISSION
Marketiv adalah platform marketplace hybrid yang menjembatani UMKM (terutama di kota tier-2 seperti Sukabumi) dengan Kreator Mikro. Tujuannya adalah mendemokratisasi pemasaran digital yang adil tanpa risiko "boncos" (kerugian finansial di awal) bagi UMKM, dan memberikan lapangan kerja yang adil bagi kreator.

## 2. THE DUAL-ECOSYSTEM (STRICT SEPARATION)
Marketiv memiliki dua ruang pengguna yang terisolasi secara UI dan UX:
- **Ruang UMKM (`/dashboard/umkm/*`):** UI dirancang super simpel karena literasi digital UMKM daerah masih rendah. Fokus pada dashboard metrik pengeluaran dan pembuatan order.
- **Ruang Kreator (`/dashboard/kreator/*`):** UI lebih interaktif untuk melihat daftar pekerjaan, portofolio, dan metrik penghasilan.
*Aturan Sistem:* Komponen/State UMKM tidak boleh bocor atau dipakai di halaman Kreator, dan sebaliknya.

## 3. CORE FEATURES (THE TWO MODES)

### A. Campaign Mode (Viral / Performance-Based)
Ini adalah layanan pemasaran pay-per-view.
- **Logika Bisnis:** UMKM membuat brief (dibantu AI) & upload raw asset -> Kreator klaim job -> Kreator mengedit video -> **KREATOR POSTING DI AKUN SOSMED MEREKA SENDIRI**.
- **RESTRICTION MUTLAK:** Dilarang keras ada fitur Chat/Komunikasi antara UMKM and Kreator di mode ini. Ini untuk memotong birokrasi dan drama revisi.
- **Pembayaran:** Berdasarkan jumlah views yang dicapai (Sistem mendeteksi fraud views).

### B. Rate Card Mode (Consultative / Influencer)
Ini adalah layanan premium berbayar tetap (fixed price).
- **Logika Bisnis:** UMKM melihat katalog kreator -> UMKM Inisiasi Chat -> Negosiasi Harga & Deliverables -> Deal via Escrow -> Kreator eksekusi konten.
- **RESTRICTION MUTLAK:** Wajib ada ruang Chat Negosiasi.
- **Syarat Wajib Tambahan:** Saat konten diposting, sistem mewajibkan penggunaan fitur "Collab Post" (Instagram/TikTok) agar UMKM juga mendapatkan direct traffic dari audiens Kreator.

## 4. TECH STACK & ARCHITECTURE ALIGNMENT
- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5.
- **Backend (Headless):** Appwrite (Auth, Database, Storage, Functions, Realtime) terintegrasi via Server/Client SDK.
- **State:** Zustand (khusus untuk client-side UI state, bukan untuk data dari database).

## 5. P2MW COMPLIANCE (BUSINESS GOALS)
Setiap fitur yang dibangun harus membantu pencapaian Laporan P2MW 2025:
- **Prioritas Kecepatan:** Fokus rilis MVP secepat mungkin.
- **Data Ekspor:** Harus selalu menyiapkan *hook* atau titik di mana admin bisa mengekstrak data seperti *User Retention Rate*, total GMV, dan Total Views untuk dimasukkan ke laporan kemajuan.