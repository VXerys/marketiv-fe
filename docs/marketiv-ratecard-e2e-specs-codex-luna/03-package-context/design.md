# Spec 03 — Design: Package Provenance Without Breaking Conversation Identity

## Current Relevant Files

Entry:
- `src/components/features/umkm-dashboard/creators/detail/CreatorDetailPage.tsx`
- `src/components/features/umkm-dashboard/creators/detail/RateCardPackageCard.tsx`
- `src/components/features/umkm-dashboard/creators/modals/StartNegotiationModal.tsx`

Conversation:
- `src/services/umkm/umkm-dashboard.service.ts`
- `src/services/shared/conversation-appwrite.service.ts`

Offer:
- `src/components/features/umkm-dashboard/negotiation/modals/SendCustomOfferModal.tsx`
- offer validation schema
- `00_BACKEND/functions/create-offer/src/main.js`

Order:
- `00_BACKEND/functions/create-order/src/main.js`

Read DTO:
- `00_BACKEND/functions/get-umkm-negotiations/src/main.js`
- `00_BACKEND/functions/get-creator-negotiations/src/main.js`

Schema:
- offers / orders / rate_card_packages definitions in current Appwrite schema source.

## Key Design Decision

Do **not** store one mutable `selectedPackageId` as the identity of the conversation.

Why:
- one conversation is intentionally unique per UMKM–Kreator pair,
- the pair can negotiate multiple packages/offers over time.

Instead:

### Pre-offer navigation context
Route can carry:

`/dashboard/umkm/negosiasi/<conversationId>?packageId=<selectedPackageId>`

This is UI context only until an offer is created.

### Durable business provenance
When UMKM submits Custom Offer:
- send optional `packageId`,
- backend validates it,
- persist it on offer,
- preserve minimal immutable package snapshot,
- create-order copies provenance to order when accepted.

## Package View Model

Current package UI must expose stable package ID.

If the presentation `RateCardPackage` type currently drops source ID:
- add `id`/`packageId`,
- map it from Appwrite package document,
- do not infer ID from array index/name.

## Start Negotiation

`StartNegotiationModal`:
- receive `packageId`,
- create/reuse conversation as current,
- navigate with package query context.

No second conversation is created.

## Room Initialization

On UMKM room:
1. read `packageId` query param,
2. load/resolve package only if it belongs to current room creator and is eligible,
3. show `Paket Acuan`,
4. pass context to Custom Offer modal,
5. prefill fields.

If invalid/stale:
- ignore package context with actionable warning,
- room remains usable.

## Offer Contract

Extend `CreateOfferInput` with optional:

```ts
packageId?: string
```

Backend `create-offer` must:
1. derive creator from conversation,
2. fetch package by packageId,
3. verify creator ownership,
4. verify package status if required,
5. capture provenance snapshot,
6. create offer with final user-edited terms.

Never trust a `creatorId`/package pairing from client.

## Snapshot Design

Use smallest schema that satisfies historical audit.

Recommended:
- `packageId` optional
- `packageNameSnapshot` optional
- `packagePriceSnapshot` optional

If repository already has suitable fields, reuse them instead of adding duplicates.

Final contract still uses:
- offer.title/description,
- offer.price,
- offer.deadline,
- offer.revisionLimit.

## Order Creation

`create-order` copies:
- `packageId` if present,
- package snapshot fields if order needs direct historical rendering,
- `amount = offer.price`.

Do not recompute amount from current package.

## DTO

Both UMKM and Creator DTO should expose optional:

```ts
packageContext?: {
  id?: string
  name: string
  basePrice?: number
}
```

plus existing final negotiated terms.

Legacy data returns `undefined`.

## UI Copy

Example before offer:

**Paket Acuan**
TikTok Product Review — Rp500.000

`Kamu masih dapat menyesuaikan harga, lingkup kerja, deadline, dan revisi sebelum mengirim penawaran final.`

After accept:

**Kesepakatan Final**
Rp450.000 · 1 video · deadline 28 Agustus · 2 revisi

Optional secondary:
`Berawal dari paket TikTok Product Review (Rp500.000)`

## Non-goals

- Do not implement Direct Order in this spec.
- Do not create one conversation per package.
- Do not make current mutable package authoritative after offer accepted.
