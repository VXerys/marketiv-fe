# Campaigns — Concepts

## Terms

- **Campaign** — proyek promosi UMKM berbasis Pay-Per-View.
- **PPV/CPM** — reward Creator dihitung per 1.000 validated views menurut rate Campaign.
- **Claim** — reservation/assignment satu Creator terhadap Campaign yang tersedia.
- **Submission** — bukti tayang berupa public social post URL yang terhubung 1:1 dengan claim.
- **Validation** — pemeriksaan authoritative oleh Admin Marketiv yang menghasilkan final submission decision dan locked views.
- **Fraud Precheck** — pemeriksaan risiko otomatis yang menghasilkan `fraudScore/fraudStatus`; terpisah dari final submission status.
- **Locked Views** — jumlah views final yang dicatat saat validation dan dipakai backend sebagai dasar reward.
- **Reward** — kompensasi Creator berdasarkan validated views dan rate Campaign, dibatasi remaining budget.

## Campaign Types

- **UGC** — Creator membuat konten baru menggunakan aset digital UMKM.
- **Clipping** — Creator memotong/repurpose long-form content menjadi short-form content.

MVP Campaign tetap berbasis aset digital; tidak ada shipping sampel fisik.

## Authority Model

```text
Creator: submit proof
Admin: validate + lock views + approve/reject
UMKM: observe owned Campaign submissions
Backend: calculate financial result
```

## Status

### Campaign

`draft → active → paused → completed`

### Claim

`claimed → submitted → approved | rejected`

atau `claimed → expired` jika melewati deadline.

### Submission

`pending → approved | rejected`

### Fraud

`safe | review | rejected`

`fraudStatus` bukan alias `submission.status` dan tidak boleh digunakan sebagai satu-satunya final financial decision.
