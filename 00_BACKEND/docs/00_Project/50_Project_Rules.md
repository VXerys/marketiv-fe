# Aturan Kerja Proyek

Aturan ini disarikan dari AGENTS.md dan menjadi pedoman kerja semua kontributor (manusia & AI).

## Dokumentasi sebagai Sumber Kebenaran

- `docs/` adalah satu-satunya sumber kebenaran. Source code mengimplementasikan pengetahuan yang terdokumentasi.
- Baca dokumentasi relevan **sebelum** implementasi, modifikasi, atau keputusan arsitektur.
- Git menyimpan histori; dokumentasi menyimpan kebenaran terkini.
- **Golden rule**: jika sebuah implementasi tidak bisa dibenarkan oleh dokumentasi, implementasi itu tidak seharusnya ada.

## Satu Fakta Satu Lokasi

- Jangan duplikasi pengetahuan. Satu dokumen punya satu tanggung jawab.
- Pengetahuan spesifik modul hanya didokumentasikan di dalam modulnya.
- Workflow hanya menjelaskan interaksi antar modul, bukan menduplikasi isi modul.
- ADR menjelaskan WHY; dokumen implementasi menjelaskan HOW. Jangan dicampur.
- Rujuk dengan link relatif, jangan salin konten.

## Service Layer Wajib

- Seluruh akses Appwrite **wajib** lewat service layer.
- Lakukan: `Page → Service → Appwrite SDK`.
- Jangan: `Page → Appwrite SDK` (memanggil SDK langsung dari halaman).
- Detail keputusan: [ADR-002](../04_Decisions/ADR-002.md).

## Pemeliharaan

- Saat implementasi berubah: perbarui Modul terkait, perbarui Workflow bila proses bisnis berubah, perbarui ADR bila arsitektur berubah.
- Setiap folder diawali `00_Index.md` yang merangkum folder dan mengarahkan ke dokumen relevan.
- Dokumen harus atomic, fokus, kecil, mudah diindeks.

## Referensi

- Manual lengkap: `AGENTS.md` (root repo).
