# 70_Testing_Strategy

Strategi testing Marketiv. Struktur folder: [`40_Folder_Structure.md`](40_Folder_Structure.md).

## Tooling

- **Vitest** — unit & integration test.
- **Playwright** — end-to-end (e2e) test.

## Struktur `tests/`

```text
tests/
├── unit/          # Fungsi murni: services, stores, validations (Zod), utils
├── integration/   # Service ↔ Appwrite SDK (mock/sandbox), interaksi store+service
└── e2e/           # Alur user end-to-end via Playwright
```

## Fokus Per Layer

- **Services** (unit/integration): mapping data, throw error bertipe (lihat [`60_Error_Handling.md`](60_Error_Handling.md)), penanganan kasus gagal Appwrite.
- **Stores** (unit): transisi state, aksi, selector.
- **Validations** (unit): schema Zod menerima input valid & menolak invalid.
- **Components/UI**: render dasar & interaksi penting (opsional MVP).

## Critical Flows (Wajib e2e)

- **Escrow**: offer accepted → create order → escrow held → deliverable approved → release escrow.
- **Fraud**: submission created → fraud check → update `fraudStatus` (safe/review/rejected).
- **Withdraw**: request withdraw (validasi balance & min withdraw) → pending → admin approve/reject/complete.

## Prinsip

- Logika bisnis sensitif (escrow, wallet, fraud, withdraw) hidup di Appwrite Function — uji lewat integration/e2e, bukan hanya unit frontend.
- Validasi input diuji di level unit (Zod) agar regresi cepat ketahuan.
