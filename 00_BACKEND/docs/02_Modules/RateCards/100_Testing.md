# Rate Cards — Testing

## Create Rate Card

- Creator membuat rate card → status `draft`.
- Menambah paket → paket tersimpan dengan benar.
- Field wajib paket kosong → error validasi.

## Publish

- Publish rate card → status `published`, muncul di profil Creator.
- Publish tanpa paket → error (minimal 1 paket).
- Rate card draft tidak tampil di discovery.

## Discovery

- UMKM mencari Creator → hasil sesuai filter.
- Creator dengan rate card published muncul di pencarian.
- Creator tanpa rate card published tidak muncul.

## Akses

- Creator A tidak bisa mengedit rate card Creator B.
- UMKM hanya bisa membaca (read-only).
