# Requirements — Campaign Submission Admin Authority UI

## 1. Introduction

Spesifikasi ini mendefinisikan UI/UX Campaign submission untuk tiga actor: Creator, UMKM, dan Admin Marketiv. Tahap implementasi sekarang hanya mencakup Creator + UMKM UI pada `marketiv-web`; Admin UI sudah memiliki concept reference pada repository terpisah dan backend wiring ditunda.

### Product invariant

```text
Creator = submitter
Admin Marketiv = validator / decision authority
UMKM = read-only campaign owner observer
Backend = financial authority
```

### Requirement language

- **SHALL** = mandatory.
- **SHALL NOT** = prohibited.
- **MAY** = optional when data is available.

---

## R-01 — Validation Authority Boundary

**User Story:** Sebagai pemilik produk, saya ingin authority submission tunggal dan eksplisit agar tidak ada dua pihak yang dapat mengambil keputusan finansial yang sama.

### Acceptance Criteria

1. WHEN a Campaign submission is `pending`, THE SYSTEM SHALL expose approve/reject/views-capture actions only in an Admin-authorized surface.
2. WHEN UMKM opens a Campaign detail, THE SYSTEM SHALL render submission data read-only.
3. THE UMKM UI SHALL NOT render `Approve`, `Reject`, `Setujui Pembayaran`, `Tolak Konten`, editable views, or equivalent mutation controls.
4. THE Creator UI SHALL NOT render any control that can set final views or final submission status.
5. THE frontend SHALL NOT directly mutate `campaign_submissions.status`, locked views fields, reward, transaction, or wallet values.

---

## R-02 — Creator Submission Entry Point

**User Story:** Sebagai Creator, saya ingin mengirim tautan postingan publik dengan langkah yang jelas agar pekerjaan saya masuk ke verifikasi Marketiv.

### Acceptance Criteria

1. WHEN a claim is still `claimed` and has no submission, THE SYSTEM SHALL show a primary CTA `Kirim Bukti Tayang`.
2. WHEN the CTA is activated, THE SYSTEM SHALL navigate/scroll to the submission form in the current active-work detail screen rather than creating a duplicate workflow.
3. THE form SHALL contain:
   - platform context;
   - public post URL input;
   - optional note for Marketiv/Admin;
   - inline helper explaining no final video upload is required.
4. THE submit CTA SHALL use wording `Kirim untuk Diverifikasi` or semantically equivalent wording that makes the next actor clear.
5. BEFORE invoking the existing submit service, THE SYSTEM SHALL show a confirmation step containing the submitted URL.
6. AFTER successful submission, THE SYSTEM SHALL show a success state stating that Marketiv/Admin will review the proof.

---

## R-03 — Platform Is Campaign-Owned

**User Story:** Sebagai Creator, saya ingin platform submit mengikuti campaign agar saya tidak dapat memilih platform yang tidak sesuai brief/job.

### Acceptance Criteria

1. WHEN a campaign platform is known, THE SYSTEM SHALL display it as read-only submission context.
2. THE Creator SHALL NOT be able to arbitrarily switch submission platform independently from the claimed campaign.
3. FOR the current MVP contract, THE SYSTEM SHALL support TikTok as the active Campaign platform.
4. THE component design SHALL remain data-driven so a future supported campaign platform can be rendered without redesigning the form.
5. IF the campaign platform cannot be resolved, THE SYSTEM SHALL disable submission and show an explicit configuration/error message rather than silently defaulting to another platform.

---

## R-04 — URL Validation

**User Story:** Sebagai Creator, saya ingin mendapat error sebelum mengirim link salah agar submission tidak gagal setelah confirmation.

### Acceptance Criteria

1. WHEN the URL is empty, THE SYSTEM SHALL prevent submission and show a field-level required error.
2. WHEN the URL protocol is not `https://` (or existing backend-compatible accepted protocol during transition), THE SYSTEM SHALL show a field-level validation error.
3. WHEN the URL hostname does not match the campaign platform, THE SYSTEM SHALL prevent submit.
4. THE client validation SHALL be treated as UX validation only; backend validation remains authoritative.
5. WHEN backend returns a typed validation/conflict error, THE SYSTEM SHALL surface a specific user-readable error without fabricating success.

---

## R-05 — Submission State Presentation on Creator Side

**User Story:** Sebagai Creator, saya ingin mengetahui apa yang sedang terjadi setelah submit tanpa mengira reward sudah cair.

### Acceptance Criteria

1. IF no submission exists, THE SYSTEM SHALL show `Belum Kirim` and submission CTA.
2. IF submission status is `pending`, THE SYSTEM SHALL show `Menunggu Validasi Marketiv` and hide the submission form.
3. IF submission status is `approved`, THE SYSTEM SHALL show `Disetujui` and verified data when available.
4. IF submission status is `rejected`, THE SYSTEM SHALL show `Ditolak` and rejection reason when available.
5. IF `fraudStatus = review`, THE SYSTEM MAY show a neutral warning such as `Perlu pemeriksaan lanjut`; it SHALL NOT claim the Creator is guilty of fraud.
6. IF `fraudStatus = rejected` while submission remains `pending`, THE SYSTEM SHALL keep submission lifecycle and fraud signal visually distinct.
7. THE SYSTEM SHALL NOT label an amount `Total Reward Cair` merely because submission is approved.

---

## R-06 — Creator Validation Timeline

### Acceptance Criteria

THE Creator detail SHALL render a progress model equivalent to:

1. `Campaign Diklaim`
2. `Bukti Tayang Dikirim`
3. `Verifikasi Marketiv`
4. `Hasil Validasi`

Additional rules:

- pending validation SHALL be visually distinguishable from completed validation;
- rejection SHALL use an error state without hiding previous completed steps;
- no timeline copy may state that UMKM is the final validator;
- no UI may claim automatic social-media API tracking unless that capability is actually enabled.

---

## R-07 — UMKM Submission List Is Read-Only

**User Story:** Sebagai UMKM, saya ingin melihat bukti tayang dan hasil validasi campaign saya tanpa dibebani proses audit operasional.

### Acceptance Criteria

1. WHEN UMKM opens Campaign detail, THE SYSTEM SHALL show the list of Creator submissions that belong to the campaign.
2. Each row/card SHALL expose:
   - Creator identity;
   - campaign platform;
   - public post link;
   - validation status;
   - verified views when available;
   - reward-related display only when authoritative;
   - `Lihat Detail` action.
3. Pending submission SHALL display `Belum diverifikasi` for views when final views are unavailable.
4. Pending reward SHALL display `—` / `Belum dihitung`, not `Rp0` as a final financial result.
5. THE row/card SHALL NOT have approve/reject/edit actions.

---

## R-08 — UMKM Submission Detail

### Acceptance Criteria

1. WHEN UMKM opens `Lihat Detail`, THE SYSTEM SHALL render a read-only detail modal/sheet.
2. The detail SHALL include Creator, platform, public URL, status, submitted time, validation data when available, and rejection note when available.
3. IF validation source/time exists, THE SYSTEM SHALL show it as Marketiv validation metadata.
4. THE detail SHALL NOT contain mutation controls.
5. The only default footer action SHALL be `Tutup` or navigation-equivalent read-only action.

---

## R-09 — UMKM Dashboard Language Must Reflect Observer Role

### Acceptance Criteria

1. `Perlu Diperiksa` SHALL be replaced with `Menunggu Validasi` or equivalent.
2. `Periksa Bukti Konten Baru` SHALL be replaced with `Lihat Bukti Konten` / `Lihat Status Validasi`.
3. `Petunjuk Cara Memeriksa Konten` SHALL be replaced with a short explanation of how Marketiv validation works.
4. Health/status cards SHALL say that pending evidence is being processed by Marketiv, not that UMKM needs to inspect it.
5. Performance UI SHALL NOT use `Data Otomatis` if the data is manually locked by an Admin.

---

## R-10 — Fraud Signal Separation

### Acceptance Criteria

1. THE SYSTEM SHALL model `submissionStatus` and `fraudStatus` as separate concepts.
2. THE UI SHALL NOT derive `approved/rejected` solely from `fraudStatus`.
3. `fraudStatus=safe` SHALL NOT automatically render submission as approved.
4. `fraudStatus=review` SHALL NOT be rendered as final rejection.
5. Admin UI MAY use fraud details as review evidence, but final submission status must come from the authoritative review result.

---

## R-11 — Views and Reward Truthfulness

### Acceptance Criteria

1. WHEN `views_final=true` and `views_count` exists, THE UI SHALL prefer locked `views_count` over legacy `views`.
2. WHEN final views do not exist, THE UI SHALL display an unavailable/pending state instead of fabricating a verified number.
3. Campaign Creator reward SHALL NOT be reduced by the platform fee in frontend calculations; Campaign fee is buyer-side according to ADR-008.
4. UI SHALL distinguish:
   - `Reward estimate` if computed locally for preview;
   - `Reward terhitung/tervalidasi` if derived from approved locked views;
   - `Dana cair/dibayarkan` only if an authoritative transaction/financial state proves it.
5. Approval UI must not optimistically display a final financial result before backend state refresh.

---

## R-12 — UI States and Resilience

### Acceptance Criteria

1. All changed surfaces SHALL have loading, empty, error, disabled, and success behavior where relevant.
2. Network failure SHALL NOT be rendered as an empty-data state.
3. Submission duplicate/conflict (`409`) SHALL show a specific message and prevent duplicate local success state.
4. Read-only UMKM detail SHALL remain usable even if optional validation metadata is absent.
5. UI SHALL tolerate legacy submissions that only have `views` and no locked-view metadata.

---

## R-13 — Responsive & Accessibility

### Acceptance Criteria

1. Changed UI SHALL be readable at 375px width without horizontal overflow.
2. Primary touch targets SHALL be at least 44px high where applicable.
3. Status meaning SHALL NOT rely on color alone; visible labels are required.
4. Modal/sheet focus behavior SHALL use existing accessible Marketiv primitives.
5. Links opening social posts SHALL include appropriate external-link semantics and safe `rel` attributes.
6. Form validation SHALL associate error/helper text with the relevant field.

---

## R-14 — Backend Plug-and-Play Boundary

### Acceptance Criteria

1. Existing Creator public service contract `submitProof(input)` SHALL be preserved during UI slicing unless a separately approved contract migration is required.
2. UI components SHALL consume typed view models/services, not Appwrite SDK calls directly.
3. UMKM submission UI SHALL only require read data; no hidden dependency on `reviewSubmission()` may remain.
4. Admin mutation semantics SHALL be documented as a future command contract without being implemented in this UI phase.
5. Optional future fields SHALL be introduced as optional read-only fields so UI slicing can ship before backend wiring.
6. No database schema migration, Function authorization change, wallet mutation, payment mutation, or payout change is part of this phase.

---

## R-15 — Documentation Consistency

### Acceptance Criteria

1. Canonical Campaign docs SHALL identify Admin Marketiv as submission validation authority.
2. Canonical docs SHALL identify UMKM as read-only submission observer.
3. Canonical fraud docs SHALL match actual advisory precheck behavior unless backend behavior is explicitly changed later.
4. `95_Views_Tracking.md` SHALL no longer say UMKM captures final views.
5. Old `96_Views_Sprint_Plan.md` SHALL be marked superseded by this spec instead of remaining an active contradictory plan.
6. A dedicated ADR SHALL record the reason and consequences of the authority migration.

---

## Out of Scope — UI Phase

- Changing `review-submission` authorization.
- Creating production Admin authentication.
- Adding Appwrite Admin permissions/schema changes.
- Implementing payout/release logic.
- Changing Midtrans flow.
- Adding TikTok/Instagram automatic views API.
- New dispute/appeal product flow.
- Rate Card flow changes.
- New database status values.
