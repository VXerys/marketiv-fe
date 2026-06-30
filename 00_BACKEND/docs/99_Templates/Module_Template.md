# Template: Module Doc Set

Panduan struktur folder `02_Modules/<NamaModul>/`. Tidak semua file wajib — buat hanya yang relevan, tapi pertahankan penomoran & nama berikut.

## File & Isi

- `00_Index.md` — Ringkasan modul 2-3 baris + daftar dokumen (satu baris per file). Tautkan dengan path relatif.
- `10_Overview.md` — Peran modul, batasan tanggung jawab, ketergantungan ke modul lain.
- `20_Concepts.md` — Istilah & konsep domain inti modul (glosarium singkat).
- `30_Business_Rules.md` — Aturan bisnis bernomor, status/enum, validasi, invariant. (Lihat [Business_Rules_Template.md](Business_Rules_Template.md).)
- `40_User_Flow.md` — Alur pengguna khusus modul ini (bukan lintas-modul; alur lintas-modul ada di `03_Workflows/`).
- `50_Database.md` — Collection yang dimiliki modul. (Lihat [Database_Template.md](Database_Template.md).)
- `60_API.md` — Kontrak service method. (Lihat [API_Template.md](API_Template.md).)
- `70_Backend.md` — Appwrite Functions, logika server-side, integrasi eksternal.
- `80_Frontend.md` — Screen/route & komponen. (Lihat [Screen_Template.md](Screen_Template.md).)
- `90_Events.md` — Event yang diterbitkan/dikonsumsi modul + tautan ke modul terkait.
- `100_Testing.md` — Skenario uji, edge case, kriteria acceptance.

## Panduan

- Bahasa Indonesia, ringkas, bullet-heavy.
- Jangan duplikasi aturan lintas-modul — tautkan ke `../../03_Workflows/`.
- Tidak ada file kosong; hapus file yang tidak relevan daripada membiarkan kosong.
