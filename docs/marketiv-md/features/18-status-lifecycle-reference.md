# 18 — Status Lifecycle Reference

Dokumen ini adalah sumber kebenaran untuk semua enum status Marketiv.
Jangan membuat status baru tanpa update dokumen ini, database schema, backend validation, dan frontend badge mapping.

## 1. Global Naming Rules

- Gunakan PascalCase tanpa spasi untuk enum internal jika memungkinkan.
- UI boleh menerjemahkan enum menjadi Bahasa Indonesia yang lebih natural.
- Database, backend, dan frontend harus memakai enum yang sama.
- Status transition harus dilakukan oleh owner yang benar.

## 2. Campaign Status

## 14. Campaign Status

### Allowed Values

- `Draft`
- `MenungguPembayaran`
- `Aktif`
- `Penuh`
- `Selesai`
- `Dibatalkan`
- `Dispute`
- `Expired`

### Transition Rules

- `Draft` may transition to `MenungguPembayaran` only through documented flow or backend/admin operation.
- `MenungguPembayaran` may transition to `Aktif` only through documented flow or backend/admin operation.
- `Aktif` may transition to `Penuh` only through documented flow or backend/admin operation.
- `Penuh` may transition to `Selesai` only through documented flow or backend/admin operation.
- `Selesai` may transition to `Dibatalkan` only through documented flow or backend/admin operation.
- `Dibatalkan` may transition to `Dispute` only through documented flow or backend/admin operation.
- `Dispute` may transition to `Expired` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Draft`: render with consistent badge label, color, and helper text in all screens.
- `MenungguPembayaran`: render with consistent badge label, color, and helper text in all screens.
- `Aktif`: render with consistent badge label, color, and helper text in all screens.
- `Penuh`: render with consistent badge label, color, and helper text in all screens.
- `Selesai`: render with consistent badge label, color, and helper text in all screens.
- `Dibatalkan`: render with consistent badge label, color, and helper text in all screens.
- `Dispute`: render with consistent badge label, color, and helper text in all screens.
- `Expired`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 55. Campaign Claim Status

### Allowed Values

- `Aktif`
- `Dibatalkan`
- `Selesai`
- `Dispute`

### Transition Rules

- `Aktif` may transition to `Dibatalkan` only through documented flow or backend/admin operation.
- `Dibatalkan` may transition to `Selesai` only through documented flow or backend/admin operation.
- `Selesai` may transition to `Dispute` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Aktif`: render with consistent badge label, color, and helper text in all screens.
- `Dibatalkan`: render with consistent badge label, color, and helper text in all screens.
- `Selesai`: render with consistent badge label, color, and helper text in all screens.
- `Dispute`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 84. Campaign Submission Status

### Allowed Values

- `NotSubmitted`
- `Pending`
- `Valid`
- `Rejected`
- `Fraud`
- `Dispute`
- `Paid`

### Transition Rules

- `NotSubmitted` may transition to `Pending` only through documented flow or backend/admin operation.
- `Pending` may transition to `Valid` only through documented flow or backend/admin operation.
- `Valid` may transition to `Rejected` only through documented flow or backend/admin operation.
- `Rejected` may transition to `Fraud` only through documented flow or backend/admin operation.
- `Fraud` may transition to `Dispute` only through documented flow or backend/admin operation.
- `Dispute` may transition to `Paid` only through documented flow or backend/admin operation.

### UI Badge Rules

- `NotSubmitted`: render with consistent badge label, color, and helper text in all screens.
- `Pending`: render with consistent badge label, color, and helper text in all screens.
- `Valid`: render with consistent badge label, color, and helper text in all screens.
- `Rejected`: render with consistent badge label, color, and helper text in all screens.
- `Fraud`: render with consistent badge label, color, and helper text in all screens.
- `Dispute`: render with consistent badge label, color, and helper text in all screens.
- `Paid`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 122. Rate Card Order Status

### Allowed Values

- `Negosiasi`
- `MenungguPembayaran`
- `Escrow`
- `DalamPengerjaan`
- `Revisi`
- `MenungguVerifikasi`
- `Selesai`
- `Dibatalkan`
- `Dispute`
- `Expired`

### Transition Rules

- `Negosiasi` may transition to `MenungguPembayaran` only through documented flow or backend/admin operation.
- `MenungguPembayaran` may transition to `Escrow` only through documented flow or backend/admin operation.
- `Escrow` may transition to `DalamPengerjaan` only through documented flow or backend/admin operation.
- `DalamPengerjaan` may transition to `Revisi` only through documented flow or backend/admin operation.
- `Revisi` may transition to `MenungguVerifikasi` only through documented flow or backend/admin operation.
- `MenungguVerifikasi` may transition to `Selesai` only through documented flow or backend/admin operation.
- `Selesai` may transition to `Dibatalkan` only through documented flow or backend/admin operation.
- `Dibatalkan` may transition to `Dispute` only through documented flow or backend/admin operation.
- `Dispute` may transition to `Expired` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Negosiasi`: render with consistent badge label, color, and helper text in all screens.
- `MenungguPembayaran`: render with consistent badge label, color, and helper text in all screens.
- `Escrow`: render with consistent badge label, color, and helper text in all screens.
- `DalamPengerjaan`: render with consistent badge label, color, and helper text in all screens.
- `Revisi`: render with consistent badge label, color, and helper text in all screens.
- `MenungguVerifikasi`: render with consistent badge label, color, and helper text in all screens.
- `Selesai`: render with consistent badge label, color, and helper text in all screens.
- `Dibatalkan`: render with consistent badge label, color, and helper text in all screens.
- `Dispute`: render with consistent badge label, color, and helper text in all screens.
- `Expired`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 169. Transaction Status

### Allowed Values

- `Pending`
- `Escrow`
- `Success`
- `Failed`
- `Expired`
- `Refunded`
- `Cancelled`

### Transition Rules

- `Pending` may transition to `Escrow` only through documented flow or backend/admin operation.
- `Escrow` may transition to `Success` only through documented flow or backend/admin operation.
- `Success` may transition to `Failed` only through documented flow or backend/admin operation.
- `Failed` may transition to `Expired` only through documented flow or backend/admin operation.
- `Expired` may transition to `Refunded` only through documented flow or backend/admin operation.
- `Refunded` may transition to `Cancelled` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Pending`: render with consistent badge label, color, and helper text in all screens.
- `Escrow`: render with consistent badge label, color, and helper text in all screens.
- `Success`: render with consistent badge label, color, and helper text in all screens.
- `Failed`: render with consistent badge label, color, and helper text in all screens.
- `Expired`: render with consistent badge label, color, and helper text in all screens.
- `Refunded`: render with consistent badge label, color, and helper text in all screens.
- `Cancelled`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 207. Withdrawal Status

### Allowed Values

- `Pending`
- `Processing`
- `Success`
- `Failed`
- `Rejected`
- `Cancelled`

### Transition Rules

- `Pending` may transition to `Processing` only through documented flow or backend/admin operation.
- `Processing` may transition to `Success` only through documented flow or backend/admin operation.
- `Success` may transition to `Failed` only through documented flow or backend/admin operation.
- `Failed` may transition to `Rejected` only through documented flow or backend/admin operation.
- `Rejected` may transition to `Cancelled` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Pending`: render with consistent badge label, color, and helper text in all screens.
- `Processing`: render with consistent badge label, color, and helper text in all screens.
- `Success`: render with consistent badge label, color, and helper text in all screens.
- `Failed`: render with consistent badge label, color, and helper text in all screens.
- `Rejected`: render with consistent badge label, color, and helper text in all screens.
- `Cancelled`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 242. Dispute Status

### Allowed Values

- `Open`
- `UnderReview`
- `NeedMoreEvidence`
- `ResolvedForUMKM`
- `ResolvedForKreator`
- `Refunded`
- `Rejected`
- `Closed`

### Transition Rules

- `Open` may transition to `UnderReview` only through documented flow or backend/admin operation.
- `UnderReview` may transition to `NeedMoreEvidence` only through documented flow or backend/admin operation.
- `NeedMoreEvidence` may transition to `ResolvedForUMKM` only through documented flow or backend/admin operation.
- `ResolvedForUMKM` may transition to `ResolvedForKreator` only through documented flow or backend/admin operation.
- `ResolvedForKreator` may transition to `Refunded` only through documented flow or backend/admin operation.
- `Refunded` may transition to `Rejected` only through documented flow or backend/admin operation.
- `Rejected` may transition to `Closed` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Open`: render with consistent badge label, color, and helper text in all screens.
- `UnderReview`: render with consistent badge label, color, and helper text in all screens.
- `NeedMoreEvidence`: render with consistent badge label, color, and helper text in all screens.
- `ResolvedForUMKM`: render with consistent badge label, color, and helper text in all screens.
- `ResolvedForKreator`: render with consistent badge label, color, and helper text in all screens.
- `Refunded`: render with consistent badge label, color, and helper text in all screens.
- `Rejected`: render with consistent badge label, color, and helper text in all screens.
- `Closed`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 283. Verification Status

### Allowed Values

- `Unverified`
- `PendingReview`
- `Verified`
- `Rejected`
- `Suspended`

### Transition Rules

- `Unverified` may transition to `PendingReview` only through documented flow or backend/admin operation.
- `PendingReview` may transition to `Verified` only through documented flow or backend/admin operation.
- `Verified` may transition to `Rejected` only through documented flow or backend/admin operation.
- `Rejected` may transition to `Suspended` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Unverified`: render with consistent badge label, color, and helper text in all screens.
- `PendingReview`: render with consistent badge label, color, and helper text in all screens.
- `Verified`: render with consistent badge label, color, and helper text in all screens.
- `Rejected`: render with consistent badge label, color, and helper text in all screens.
- `Suspended`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 315. Notification Status

### Allowed Values

- `Unread`
- `Read`
- `Archived`

### Transition Rules

- `Unread` may transition to `Read` only through documented flow or backend/admin operation.
- `Read` may transition to `Archived` only through documented flow or backend/admin operation.

### UI Badge Rules

- `Unread`: render with consistent badge label, color, and helper text in all screens.
- `Read`: render with consistent badge label, color, and helper text in all screens.
- `Archived`: render with consistent badge label, color, and helper text in all screens.

### Backend Rules

- Reject unknown status.
- Reject invalid transition.
- Create audit log for sensitive transition.
- Create notification when user-facing transition happens.

## 11. Forbidden Status Practices

- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
- Do not use lowercase random status in one module and PascalCase in another.
- Do not store translated labels as enum values.
- Do not infer payment success from frontend callback alone.
- Do not skip intermediate financial statuses.
- Do not mark submission Paid before transaction is recorded.
- Do not close dispute without resolution note.
