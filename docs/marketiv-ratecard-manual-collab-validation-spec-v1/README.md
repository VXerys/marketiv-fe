# Marketiv Rate Card Manual Collab Validation — Spec v1

## Objective

Menutup P0 `Settlement Rate Card belum memverifikasi bukti Collab Post` dengan keputusan MVP:

**Admin Marketiv menjadi trusted manual validator untuk bukti Collab Post Rate Card.**

Ini bukan verifikasi otomatis dari Instagram/TikTok. Admin melakukan review manual, lalu backend menyimpan keputusan sebagai trusted server-side validation state. Escrow hanya boleh dirilis jika deliverable **approved oleh UMKM** DAN **valid oleh Admin Marketiv**.

Repository: `marketiv-id/marketiv-web`  
Branch: `staging`  
Observed remote HEAD saat spec dibuat: `4f94769da5d961464b003b957f477280d55cc995`.

Current local HEAD tetap menjadi source of truth saat Codex mulai.

## Current Risk

Current `src/services/shared/deliverable-appwrite.service.ts`:
- Creator submit deliverable sebagai row baru `version + 1`, status `submitted`.
- UMKM saat ini dapat update deliverable row.
- `approveDeliverableInAppwrite()` menulis `status: approved` langsung dari browser.
- Update tersebut dapat memicu `release-escrow`.

Current `release-escrow` memindahkan dana setelah deliverable approved dan order/escrow memenuhi state, tetapi belum memiliki trusted Collab validation gate.

Karena UMKM punya row update permission, **jangan taruh trusted validation status pada deliverable row lalu mempercayainya**. Gunakan server-controlled persistence terpisah.

## Target Flow

```text
Creator submit deliverable
        ↓
validation = pending (absence of final record is acceptable)
        ↓
Admin Marketiv manual review
        ↓
    valid / invalid
        ↓
UMKM sees validation state
        ↓
valid + UMKM approve
        ↓
release-escrow independently re-checks:
- exact deliverable is latest
- deliverable.status = approved
- trusted validation exists
- validation.status = valid
- validation matches exact deliverable/evidence
- order/escrow releasable
        ↓
wallet credit exactly once
```

The implementation MUST also work if UMKM approval happens before Admin validation. The second event must re-evaluate settlement; user should not need to click approve again.

## Hard Exclusion

Withdrawal is completely out of scope. Do not touch withdrawal UI, Functions, schema, callback, Midtrans Iris, tests, docs, or manual-withdrawal specs.

## Definition of Done

- trusted validation collection/state is server controlled;
- Admin queue + Admin review Function exist;
- only Admin can create final validation;
- validation tied to exact deliverable/version/evidence;
- latest-deliverable guard exists;
- release requires approved + valid;
- event ordering Admin-first and UMKM-first both work;
- invalid/unreviewed cannot release;
- duplicate events still produce one release;
- UMKM/Creator DTO exposes safe validation status;
- Admin/UMKM/Creator UI states truthful;
- tests cover negative, race, versioning, and idempotency;
- deployment handoff exact;
- withdrawal untouched.
