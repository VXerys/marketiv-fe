# Campaigns — Frontend

## UMKM

### Create / Manage Campaign

Existing create/edit/fund/publish UX remains unchanged by ADR-010.

### Campaign Detail — Submission Monitoring

UMKM submission section is read-only:

- list Creator submissions;
- open public post URL;
- see `Menunggu Validasi / Disetujui / Ditolak`;
- see validated views/reward information when authoritative;
- open read-only detail.

UMKM must not have:

- approve/reject controls;
- views input;
- payout approval CTA;
- copy implying UMKM is responsible for validation.

Preferred labels:

- `Menunggu Validasi`
- `Lihat Bukti Konten`
- `Lihat Detail`
- `Diproses Marketiv`

## Creator

### Job Pool / Claims

Creator claims Campaign according to existing eligibility rules.

### Active Work Detail / Submit Proof

Before submit:

- Campaign platform shown read-only;
- public post URL input;
- optional note to Marketiv;
- helper: final video file is not uploaded to Marketiv;
- CTA `Kirim untuk Diverifikasi`.

After submit:

- pending → `Menunggu Validasi Marketiv`;
- approved → final validated data;
- rejected → reason when available;
- fraud signal remains separate from final status;
- reward is not called `cair` unless finance state proves payout.

## Admin

Admin dashboard is an operational control plane:

- pending-first review queue;
- search/filter;
- Creator + Campaign + UMKM context;
- post URL;
- fraud/risk evidence;
- verified views input;
- approve/reject confirmation.

Production wiring depends on backend Admin authorization and is not part of the current UI slicing change.

## Responsive/State Requirements

All changed surfaces support loading/error/empty/disabled/success states and are readable at 375px.
