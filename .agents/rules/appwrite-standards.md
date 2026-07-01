---
trigger: always_on
description: Strict security boundary, role-based access control, and database access rules for Appwrite integration in Marketiv.
---

# 🚨 STRICT RULES — APPWRITE BACKEND & DATA BOUNDARY 🚨

Dokumen ini mengatur **standar keamanan, boundary, dan interaksi database Appwrite** yang **WAJIB** dipatuhi oleh AI Agent saat menulis kode integrasi backend di proyek Marketiv.

---

## 1. AUTHENTICATION & ACCESS CONTROL (RBAC)

- **Identity Source of Truth:** Appwrite Auth mengelola identitas user. Informasi sensitif seperti password hash **dilarang keras** disimpan di dalam collection database biasa.
- **Session Verification:** Session user wajib divalidasi di sisi server (Server Components/Server Actions) sebelum mengizinkan data access atau mutasi data.
- **Role Isolation:** Role user (`UMKM`, `Kreator`, `Admin`) ditentukan oleh field profile yang divalidasi oleh sistem. Pendaftaran akun baru secara default tidak boleh memberikan hak akses Admin.

---

## 2. DATABASE COLLECTION SCHEMAS & GUIDELINES

Semua query dan manipulasi data wajib menggunakan nama collection dan fields yang terdaftar secara resmi di `docs/marketiv-md/database/02-collections-schema.md`.

### Bidang & Collection Utama yang Wajib Dipatuhi:

| Nama Collection | Deskripsi | Jenis Operasi dari Frontend |
|---|---|---|
| **Profiles** | Profil user (UMKM/Kreator), metadata, role | Read (semua), Write (pemilik saja) |
| **Campaigns** | Brief, kuota, budget, dan status campaign | Read (semua), Write (UMKM pembuat saja) |
| **Claims** | Pencatatan job campaign yang diklaim oleh kreator | Read (semua), Write (Kreator via Function) |
| **Submissions** | Bukti posting (link sosial media) dan data views | Read (semua), Write (Kreator via Function) |
| **Orders** | Transaksi negosiasi Rate Card Mode | Read (partisipan), Write (UMKM/Kreator via Escrow) |
| **Messages** | Pesan chat negosiasi Rate Card | Read (partisipan), Write (partisipan) |
| **Transactions** | Log pembayaran, deposit, refund, escrow | Read (pemilik), **NO DIRECT WRITE** (System Only) |
| **Disputes** | Pencatatan sengketa transaksi Rate Card | Read (partisipan), Write (UMKM/Kreator via Function) |
| **Audit Logs** | Rekam jejak operasi sensitif keuangan/admin | **READ-ONLY** (System Only) |

- **DILARANG KERAS** membuat database query atau mutasi ad hoc ke collection yang tidak didokumentasikan.
- Semua status wajib menggunakan nilai enum resmi.

---

## 3. STORAGE & MEDIA BOUNDARIES

- **Allowed Files:** Appwrite Storage hanya digunakan untuk profile picture, logo bisnis UMKM, dan screenshot visual pendukung.
- **Direct Upload Limit:** Batas upload file langsung ke Appwrite Storage adalah **100MB**.
- **Video Asset Rules:** Video mentah (*raw asset*) ukuran besar **dilarang keras** diupload langsung ke Appwrite Storage. UMKM wajib menyertakan link eksternal (Google Drive/Dropbox/OneDrive).
- **Proof of Work Rules:** Bukti posting dari Kreator dikirimkan berupa URL tayang sosial media (TikTok/Instagram), bukan video utuh.

---

## 4. SERVER SDK VS CLIENT SDK BOUNDARY

- **Client SDK (Browser):** Hanya boleh digunakan untuk operasi pembacaan data yang aman (*authenticated reads*) dan update profil user bersangkutan yang bersifat non-sensitif.
- **Server SDK (elevated API keys):** Hanya boleh berjalan di lingkungan server aman (Next.js Server Actions, Route Handlers, atau Appwrite Functions).
- **API Keys Exposure:** **DILARANG KERAS** memasukkan Appwrite API key dengan izin menulis luas ke dalam client-side bundle.

---

## 5. STRICT PRODUCT LOGIC BOUNDARIES

- **Campaign Mode is Zero Chat:** Jangan pernah membuat tombol chat, WhatsApp redirection, room negosiasi, atau input text message di dalam view/flow Campaign Mode.
- **Financial State Protection:** Frontend **tidak boleh** memutasi saldo (`wallet balance`), status pembayaran (`payment status`), status escrow, kuota klaim campaign, atau status validasi secara langsung.
- **Trusted Mutators:** Semua mutasi sensitif di atas harus dipicu melalui trusted backend execution (Appwrite Functions atau secure Server Actions).

---

## 6. LINT & REVIEW CHECKLIST FOR INTEGRATION

Setiap kode integrasi backend harus lulus pengecekan berikut:
- [ ] Apakah API key aman dan tidak bocor ke client?
- [ ] Apakah session divalidasi sebelum request dijalankan?
- [ ] Apakah nama collection dan field sesuai dengan schema resmi?
- [ ] Apakah Campaign Mode bebas dari modul komunikasi/chat?
- [ ] Apakah saldo dompet dan status escrow aman dari manipulasi langsung client?
- [ ] Apakah upload file besar sudah diarahkan ke URL eksternal?
