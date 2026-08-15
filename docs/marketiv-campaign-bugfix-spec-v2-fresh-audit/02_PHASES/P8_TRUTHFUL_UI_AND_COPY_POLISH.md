# P8 — Truthful Admin Metrics/Copy + Focused Campaign Polish

## Admin dashboard
Use secure P3 summary.

Remove or replace:
- fallback 15;
- sidebar default 12;
- `+12% vs Kemarin`;
- `99.8%`;
- `SLA < 2 Jam`;
- fixed metric progress widths that imply measured performance;
- “Diverifikasi Hari Ini” unless truly date-scoped.

Prefer fewer factual cards.

## Admin shell/header
- identity from real authorized session;
- environment label only from validated config;
- do not claim Appwrite “Online” without real health source;
- fixture operational notifications must not appear as live production events.

If real notification wiring is out of scope, show an honest empty/coming-soon state.

## Backend copy
Change stale reject fallback:
`ditolak oleh UMKM`
→ Marketiv/Admin-neutral wording.

Update stale reviewer comments in the same Function if they are now misleading.
Do not change review business logic.

## Campaign polish

### Creator
- claimed → pending → approved/rejected hierarchy;
- pending means Marketiv validation;
- no wording implying reward paid solely because approved;
- 375px no overflow.

### UMKM
- observer/read-only submission;
- no approve/reject/final-view input;
- clear loading/empty/error;
- `Menunggu Validasi Marketiv`.

### Admin
- explicit load/mutation error;
- no false success;
- responsive table/card/review dialog.

## Verify
Focused `rg`, responsive pass, relevant app gates.

STOP.
