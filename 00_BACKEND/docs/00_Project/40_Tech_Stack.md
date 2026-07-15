# Tech Stack

## Frontend

- **Next.js (App Router)** — Feature-Based Architecture (bukan page-based) agar scalable.

## Backend (BaaS)

- **Appwrite** menyediakan:
  - **Auth** — autentikasi & Google OAuth
  - **Database** — koleksi data
  - **Storage** — file (avatar, logo, campaign assets, chat attachments, deliverables, dll.)
  - **Realtime** — update chat/campaign/order/submission/notification
  - **Functions** — logika server-side berbasis event

## Payment Gateway

- **Midtrans (Snap)** — pembayaran order rate card via Appwrite Function `create-payment` + webhook `midtrans-webhook`. Server key hanya di environment function (lihat [80_Deployment](../01_Global/80_Deployment.md)).

## AI Layer

- **Gemini API** diakses melalui **Appwrite Function wrapper** (AI Brief Generator, AI Fraud Detection, Landing Assistant). Model spesifik ditetapkan di modul [AI](../02_Modules/AI/00_Index.md).

## State Management

- **Zustand** — lihat alasan di [ADR-006](../04_Decisions/ADR-006.md).

## Validation

- **Zod** — skema validasi (auth, campaign, rate card, chat, offer, withdraw).

## Testing

- **Vitest** (unit/integration) + **Playwright** (e2e).

## Deployment

- Frontend → **Vercel**
- Backend → **Appwrite Cloud**

## Referensi

- Alasan memilih Appwrite: [ADR-001](../04_Decisions/ADR-001.md)
- Aturan service layer: [ADR-002](../04_Decisions/ADR-002.md) dan [50_Project_Rules.md](50_Project_Rules.md)
