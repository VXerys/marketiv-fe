# Tests — Marketiv

Struktur test mengikuti [`docs/01_Global/70_Testing_Strategy.md`](../../docs/01_Global/70_Testing_Strategy.md).

## Menjalankan

```bash
npm install
npm test                 # semua unit + integration
npm run test:unit        # hanya unit
npm run test:integration # hanya integration (service + functions)
npx playwright test      # e2e (butuh env Appwrite + dev server)
```

## Struktur

```text
tests/
├── setup.ts              # mock global: package `appwrite` + env vars + window
├── unit/                # pure functions, validasi, mapping tiap service
│   ├── wallet.service.test.ts
│   ├── auth.service.test.ts
│   ├── campaign.service.test.ts
│   ├── submission.service.test.ts
│   └── services-validation.test.ts
├── integration/         # service → Appwrite SDK (mock in-memory) + Appwrite Functions
│   ├── services.test.ts
│   └── functions.test.ts
└── e2e/                # critical flows (Playwright) — scaffolding
    └── critical-flows.spec.ts
```

## Cara Kerja Mock

- `tests/setup.ts` mem-mock package `appwrite` dengan implementasi in-memory
  (`src/test-mocks/appwrite.ts`) yang menyimpan dokumen di `Map`.
- `src/lib/appwrite` mengimpor class dari `appwrite`, sehingga service otomatis
  menggunakan mock tanpa menyentuh Appwrite Cloud.
- Appwrite Functions diuji via dynamic `import('functions/<id>/src/main.js')`
  dengan `vi.mock('node-appwrite', ...)` (store in-memory yang sama).
- Setiap function dieksekusi dengan `main({ req, res, log, error })` di mana
  `req.bodyJson` adalah dokumen event Appwrite (mis. offer/campaign/payment).
- `globalThis.fetch` tidak di-mock karena function uang (Midtrans) hanya
  divalidasi lewat signature, bukan dipanggil (test webhook memakai payload statis).

## Catatan Mismatch yang Ditemukan & Sudah Diperbaiki

1. **`create-payment` vs service** (purpose `campaign`): function sekarang menerima
   `campaign` dan `create-escrow` mengkredit **wallet** (jalur `completeTopup`).
   Model dompet: top-up → saldo naik, beli order → saldo turun. Lihat
   `docs/02_Modules/Payments/100_Testing.md`.
2. **Rate card price filter**: `user.service.ts` `getCreatorIdsByRateCardPrice`
   sekarang memakai koleksi `rate_card_packages` (field `price`) dan memetakan
   `rateCardId` → `creatorId` lewat `rate_cards`.
3. **`order.service`** sekarang memvalidasi `orderId`/`deliverableId` kosong
   (throw `validation`) di `uploadDeliverable`, `approveDeliverable`, `requestRevision`.
