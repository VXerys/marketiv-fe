# Orders — User Flow

## Alur Order (Rate Card)

```text
Offer Accepted / Direct Order
↓
Order dibuat (pending_payment)
↓
UMKM bayar → Payment Success
↓
Escrow Hold → Order in_progress
↓
Creator upload Deliverable
↓
UMKM Review
  ├─ Approve → Escrow Release → completed
  └─ Request Revision → Order revision
       ↓
       Creator upload Deliverable v2
       ↓
       Review lagi...
```

## Alur Deliverable

```text
Creator upload file + notes
↓
Deliverable tersimpan (version: n+1)
↓
Status: submitted
↓
UMKM approve → approved
   atau request revision → revision_requested
```
