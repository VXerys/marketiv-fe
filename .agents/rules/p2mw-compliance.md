---
trigger: always_on
description: Standard operating rules for tracking, logging, and reporting business compliance metrics (GMV, User Retention, Total Views) for P2MW 2025 program.
---

# 📊 STRICT RULES — P2MW COMPLIANCE & REPORTING STANDARDS

Dokumen ini mengatur **bagaimana data transaksi, performa, dan log aktivitas wajib direkam** guna mendukung otomatisasi Laporan Kemajuan P2MW 2025 (Program Pembinaan Mahasiswa Wirausaha).

---

## 1. TARGET BUSINESS METRICS

Setiap mutasi data yang berkaitan dengan dana, postingan, atau pendaftaran user harus mencatat metadata lengkap agar data berikut dapat dihitung secara akurat:

| Metrik P2MW | Definisi & Target Formulasi | Sumber Data Core |
|---|---|---|
| **Gross Merchandise Value (GMV)** | Total transaksi ter-escrow yang berhasil diselesaikan oleh Kreator (Rate Card) + total budget payout yang berhasil dirilis (Campaign). | `Transactions` & `Orders` |
| **Total Views** | Akumulasi jumlah views dari video proof-of-work (Campaign Mode) yang lolos validasi audit admin. | `Submissions` (actual views) |
| **User Retention Rate** | Rasio UMKM daerah/Kreator aktif yang kembali membuat/mengklaim job di platform dalam interval mingguan/bulanan. | `Audit Logs` (actions: `campaign_create`, `job_claim`) |
| **Escrow Velocity** | Rata-rata waktu transit dana dari status deposit (UMKM) ke status release (Kreator) atau status dispute resolved. | `Transactions` (timestamps) |

---

## 2. AUDIT LOGGING REQUIREMENTS

Setiap aksi sensitif berikut **WAJIB** melahirkan entry baru di collection `Audit Logs` secara otomatis di tingkat backend (Server Actions / Appwrite Functions):

- **User Actions:** `login`, `register`, `profile_update`, `rate_card_update`.
- **Campaign Actions:** `campaign_create`, `job_claim`, `proof_submit`.
- **Financial Actions:** `escrow_deposit`, `escrow_release`, `withdrawal_request`, `withdrawal_approve`.
- **Validation/Dispute Actions:** `submission_validate`, `dispute_resolve`.

### Payload Audit Log Schema:
```typescript
interface AuditLog {
  $id?: string;
  actorId: string;       // User ID yang melakukan aksi
  actorRole: string;     // UMKM / Kreator / Admin
  action: string;        // Nama event/aksi
  targetEntity: string;  // Nama collection target (misal: campaigns)
  targetId: string;      // Document ID yang diubah
  result: "success" | "failure";
  metadata: string;      // Stringified JSON detail parameter pendukung (views, amount, error message)
  timestamp: string;     // ISO timestamp lengkap
}
```

---

## 3. REPORT EXPORTS POLICY (/admin/reports)

Halaman `/admin/reports` wajib menyajikan interface visual untuk memicu data export:

- **Format:** Output ekspor harus berupa file terstruktur (.csv atau mockup excel yang terunduh langsung).
- **Security Guard:** Hanya role `Admin` yang boleh mengakses route export.
- **Sanitasi Data:** Ekspor data P2MW tidak boleh menampilkan informasi rahasia seperti hash user, password, atau endpoint API keys.
- **Mock Fallback:** Pada fase UI Slicing, tombol export wajib mengunduh mockup file CSV statis yang mensimulasikan format laporan kemajuan nyata agar QA/User dapat menguji download workflow.
