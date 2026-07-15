# Notifications — Testing

## Service Layer (`notification.service.ts`)

### Get Notifications (`getNotifications`)

- User login → list `notifications` `userId === user.$id`, urut `Query.orderDesc('createdAt')`, limit default 50.
- Filter `limit` opsional.

### Mark As Read (`markAsRead`)

- `id` valid → `isRead` di-set `true` via `databases.updateDocument`.
- `id` kosong → throw `NotificationServiceError('validation', 'Notification ID wajib diisi.')`.

### Mark All As Read (`markAllAsRead`)

- Ambil notifikasi user (limit 100), filter yang `!isRead`, panggil `markAsRead` untuk masing-masing.
- Hasil: semua notifikasi user terbaca.

### Unread Count

- Dihitung dari list notifikasi dengan `isRead === false`.

## Pembuatan Notifikasi (Appwrite Functions)

- Setiap event domain yang terdaftar (messages.create, campaign.claimed, dll.) menghasilkan notifikasi via function.
- Notifikasi memiliki `userId` yang benar (penerima tepat).
- Notifikasi untuk user yang tidak ada → error (atau diabaikan) di level function.

## Status Baca

- Notifikasi baru memiliki `isRead = false` (default mapping `Boolean(document.isRead)`).
- `markAsRead()` → `isRead = true`.
- `markAllAsRead()` → semua notifikasi user terbaca.
- Unread count akurat.

## Pengiriman

- In-App notification muncul di notification center (collection `notifications`).
- Email notification terkirim ke alamat email penerima (via Appwrite Messaging di function level).
