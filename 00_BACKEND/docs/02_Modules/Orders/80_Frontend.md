# Orders — Frontend

## Halaman UMKM

### My Orders

- Daftar order milik UMKM (buyer).
- Filter status: all, pending_payment, in_progress, completed.
- Detail order: info Creator, amount, status, timeline.

### Order Detail

- Status badge sesuai status order.
- **Saat `in_progress` (menunggu deliverable):**
  - Informasi Creator, paket, amount.
  - CTA pasif: "Menunggu deliverable dari Creator..."
  - Belum ada tombol aksi.
- **Saat `submitted` (deliverable sudah diupload):**
  - Deliverable viewer (preview file, notes, version).
  - Tombol Approve / Request Revision.
- **Riwayat revisi** (tampil jika ada).

## Halaman Creator

### My Orders

- Daftar order milik Creator (seller).
- Filter status: all, in_progress, revision, completed.

### Upload Deliverable

- Form upload file + notes.
- Menampilkan version number dan riwayat upload.

## Komponen

- `OrderCard` — ringkasan order dengan status badge.
- `DeliverablePreview` — preview file deliverable.
- `RevisionList` — riwayat revisi.
- `UploadForm` — form upload deliverable.
