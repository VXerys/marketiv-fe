# Notifications — Database

Modul Notifications memiliki collection `notifications`. Inilah satu-satunya lokasi skemanya.

## `notifications`

### Attributes

| Attribute | Type | Required | Catatan |
| --- | --- | --- | --- |
| `userId` | string | yes | Penerima notifikasi |
| `title` | string | yes | |
| `message` | string | yes | |
| `type` | string | yes | mis. `system`, jenis event terkait |
| `isRead` | boolean | no | default `false` |
| `createdAt` | datetime | — | |

### Index

```text
userId
isRead
createdAt DESC
```

(Index utama pada `userId` untuk mengambil notifikasi per pengguna.)

### Permission

```text
Owner : read, update `isRead`
System: write
```

**Tidak ada `delete` — disengaja.** Sembilan Function penulis notifikasi
(`create-order`, `create-escrow`, `release-escrow`, `notify-order-activity`,
`send-chat-notification`, `campaign-claimed`, `campaign-published`,
`calculate-campaign-reward`, `expire-stale-claims`; `mature-pending-balance` hanya legacy source yang retired)
seragam memasang `[Permission.read(owner), Permission.update(owner)]`. Pemilik
bisa menandai sudah dibaca, tidak bisa menghapus.

Konsekuensinya notifikasi jadi log yang hanya bertambah. Itu diterima untuk
sekarang karena sebagian besar isinya adalah jejak perpindahan uang (escrow
ditahan, dana cair, fee dipotong) yang berguna sebagai riwayat. UI kedua role
sudah menyesuaikan — tombol "Hapus" dan "Hapus Sudah Dibaca" dibuang saat
`/notifikasi` disambungkan ke collection ini.

Kalau nanti diputuskan pemilik boleh menghapus, perubahannya menyentuh
**kesepuluh Function di atas** (tambah `Permission.delete(owner)`), redeploy
semuanya, lalu kembalikan tombolnya di UI. Jangan menambahkannya di sebagian
Function saja — hasilnya notifikasi yang bisa dihapus atau tidak tergantung
siapa penulisnya, dan itu lebih membingungkan daripada tidak bisa sama sekali.

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — trigger, kanal, status baca.
- [90_Events.md](90_Events.md) — event yang menulis ke collection ini.
