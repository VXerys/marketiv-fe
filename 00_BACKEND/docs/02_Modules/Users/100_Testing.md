# Users — Testing

## Profil

- Profil UMKM terbuat dengan data pre-filled dari register.
- Profil Creator terbuat dengan data pre-filled dari register.
- `isProfileCompleted` berubah menjadi `true` setelah onboarding.

## Update Profil

- Update field profil → tersimpan dengan benar.
- Upload logo/avatar → file tersimpan di Storage.
- Hanya pemilik yang dapat mengedit profilnya.

## Social Accounts

- Creator menambah akun sosial → tersimpan.
- Creator menghapus akun sosial → terhapus.
- Creator dapat memiliki banyak akun (satu per platform).

## Discovery

- Pencarian Creator berdasarkan platform → hasil sesuai.
- Pencarian Creator berdasarkan kota → hasil sesuai.
- Creator dengan profil tidak lengkap tidak muncul di discovery (opsional).
- Data denormalisasi (`totalFollowers`, `totalOrders`, `rating`) akurat setelah event.
