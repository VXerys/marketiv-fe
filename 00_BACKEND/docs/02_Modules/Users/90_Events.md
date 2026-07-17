# Users — Events

## Event yang Diterbitkan

| Event | Trigger | Efek |
| --- | --- | --- |
| `profile.updated` | Profil diperbarui | Sinkronisasi data denormalisasi |

## Event yang Dikonsumsi

| Event | Sumber | Aksi |
| --- | --- | --- |
| `users.create` | Authentication | Buat profil user (self), inisialisasi storage usage |
| `orders.status` `completed` | Orders | Update `totalOrders` & `rating` pada `creator_profiles` |
| `campaign_submissions.status` `approved` | Campaigns | Update `totalOrders` pada `creator_profiles` |

## Lihat Juga

- Event `users.create` dan efek lanjutannya → `../Authentication/90_Events.md`.
- Pembuatan wallet → `../Payments/90_Events.md`.
- Welcome notification → `../Notifications/90_Events.md`.
