# UMKM Dedicated Rate Card Review Design

## Goal

Give UMKM an order-centric workspace for reviewing Rate Card deliverables without using Negotiation Room as the approval surface.

## Architecture

`get-umkm-ratecard-reviews` is the authoritative read boundary. It derives caller identity from Appwrite execution headers, queries `orders` by `umkmId`, optionally narrows by `orderId`, and returns 404 for missing or foreign detail requests. It batch-loads offers, conversations, creator profiles, package data, escrows, deliverables, validations, and revisions; joins happen in memory, with no per-order database requests. Campaign collections are never queried.

Frontend adds list and detail routes under `/dashboard/umkm/review-rate-card`. Both consume the Function DTO through a dedicated service. Existing `approveDeliverable(...)` and `requestRevision(...)` mutations remain unchanged. Successful mutations refetch detail from the read Function.

Negotiation Room retains chat and compact deliverable context, but links to dedicated detail instead of rendering independent approval controls.

## Review Semantics

- Submitted plus pending validation: “Menunggu Validasi Marketiv”; no approval.
- Submitted plus valid validation: “Validasi Marketiv Selesai” and “Siap Ditinjau”; approval and revision use latest deliverable only.
- Submitted plus invalid validation: “Bukti Belum Lolos Validasi Marketiv”; notes visible; no approval; revision follows existing backend eligibility.
- `revision_requested`: “Menunggu Creator Mengirim Versi Perbaikan”; no action on old version.
- `completed`: read-only final result, validation, amount, released escrow, and history.

## UI

Existing Marketiv dashboard chrome, typography, spacing, and navy/orange palette stay intact. List uses status filters and prioritizes actionable reviews. Detail uses clear summary, latest deliverable, validation, and read-only version history. Loading skeleton, empty, error, retry, disabled mutation state, focus-visible controls, and responsive one/two-column layouts are required.

## Security Invariants

- Caller and ownership stay server-authoritative.
- Foreign order detail returns 404.
- Only highest deliverable version can drive actions.
- Latest deliverable needs valid Marketiv validation before approval.
- Revision limit, settlement, escrow release, and financial state remain backend-authoritative.
- No Campaign data or mutation is introduced.

## Tests

Function tests cover multiple orders in one conversation, completed history retention, foreign ownership, batch query behavior, highest-version validation, and Campaign exclusion by collection boundary. Frontend tests cover state semantics, history action gating, mutation refetch, navigation, compact Negotiation CTA, and loading/error/empty states.
