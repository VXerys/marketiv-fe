# Orders — Business Rules

## Status Order

`pending_payment | escrow | in_progress | revision | approved | completed | cancelled`

- `pending_payment` — order dibuat, menunggu pembayaran UMKM.
- `escrow` — pembayaran sukses, dana ditahan di escrow.
- `in_progress` — creator mengerjakan; mengunggah deliverable.
- `revision` — UMKM meminta revisi.
- `approved` — deliverable disetujui, escrow akan dirilis.
- `completed` — order selesai, dana cair ke wallet creator.
- `cancelled` — order dibatalkan.

## Deliverable

- Hasil kerja creator diunggah sebagai dokumen `deliverables` dengan **versi** (`version`) — tiap unggahan/reupload menambah versi.
- Satu order dapat memiliki banyak deliverable (versi berurutan).
- Deliverable bisa berasal dari dua sumber:
  - `storage`: file diupload via File Manager ke Appwrite Storage (terikat kuota user — lihat modul Users).
  - `external_url`: link eksternal (Google Drive, Dropbox, CDN) — tidak terikat kuota.
- External URL hanya menerima protokol `https`.
- `source = storage` wajib memiliki `fileId` yang valid dan milik creator seller.

## Revisi

- `revisions` mencatat permintaan revisi dengan `requestedBy`, `message`, dan `status`.
- Permintaan revisi mengubah status order menjadi `revision`; creator mengunggah deliverable versi berikutnya.
- Jumlah revisi dibatasi oleh `revisionLimit` dari offer/paket (lihat `../Offers/` / `../RateCards/`).

## Approve → Release Escrow

- Saat UMKM **approve** deliverable, escrow dirilis: saldo pindah ke wallet creator dan order menjadi `completed`.
- Escrow dikelola modul Payments; lihat `90_Events.md` dan `../Payments/`. Aggregate order: `../../04_Decisions/ADR-003.md`.
