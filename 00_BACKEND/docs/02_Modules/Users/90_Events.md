# Users — Events

## Event yang Diterbitkan

| Event | Trigger | Efek |
| --- | --- | --- |
| `users.create` | User baru terdaftar | Buat wallet (Payments), kirim welcome notification (Notifications) |
| `profile.updated` | Profil diperbarui | Sinkronisasi data denormalisasi |

## Event yang Dikonsumsi

| Event | Sumber | Aksi |
| --- | --- | --- |
| `orders.status` `completed` | Orders | Update `totalOrders` & `rating` pada `creator_profiles` |
| `campaign_submissions.status` `approved` | Campaigns | Update `totalOrders` pada `creator_profiles` |

## Lihat Juga

- Pembuatan wallet → `../Payments/90_Events.md`.
- Welcome notification → `../Notifications/90_Events.md`.
