# Orders — Concepts

## Istilah

- **Order** — aggregate utama alur Rate Card; merekam transaksi antara UMKM dan Creator.
- **Deliverable** — hasil kerja Creator yang diunggah ke order (berversi).
- **Revision** — permintaan revisi dari UMKM atas deliverable.
- **Escrow** — dana yang ditahan hingga deliverable disetujui (dikelola modul Payments).

## Status Order

`pending_payment → escrow → in_progress → revision → approved → completed | cancelled`

## Konsep

- Order tercipta dari custom offer (accepted) atau direct order dari paket rate card.
- Satu order memiliki banyak deliverable (versi berurutan).
- Jumlah revisi dibatasi oleh `revisionLimit` dari offer/paket.
- Approval deliverable memicu release escrow ke wallet Creator.
