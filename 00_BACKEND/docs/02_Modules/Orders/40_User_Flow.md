# Orders — User Flow

## Alur Order (Rate Card)

```text
Offer Accepted / Direct Order
↓
Order dibuat (pending_payment)
↓
UMKM bayar → Payment Success
↓
[Modal Sukses] "Pembayaran Berhasil!"
↓
Redirect ke Order Detail (/orders/{orderId})
↓
Escrow Hold → Order in_progress
↓
Creator upload Deliverable
  ├─ Internal (storage) — upload via File Manager, terikat kuota 100 MB
  └─ External URL — link Google Drive / Dropbox, bebas kuota
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
Creator upload file via File Manager
  atau input external URL
↓
Deliverable tersimpan (version: n+1)
↓
Status: submitted
↓
UMKM approve → approved
   atau request revision → revision_requested
```
