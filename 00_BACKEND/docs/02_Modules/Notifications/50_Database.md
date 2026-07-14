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
| `isRead` | boolean | yes | default `false` |
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
Owner : read
System: write
```

## Lihat Juga

- [30_Business_Rules.md](30_Business_Rules.md) — trigger, kanal, status baca.
- [90_Events.md](90_Events.md) — event yang menulis ke collection ini.
