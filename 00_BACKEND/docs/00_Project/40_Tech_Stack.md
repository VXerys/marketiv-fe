# Tech Stack

## Frontend

- **Next.js (App Router)** — Feature-Based Architecture (bukan page-based) agar scalable.

## Backend (BaaS)

- **Appwrite** menyediakan:
  - **Auth** — autentikasi & Google OAuth (khusus creator)
  - **Database** — koleksi data
  - **Storage** — file (avatar, logo, campaign assets, deliverables, dll.)
  - **Realtime** — update campaign/order/submission/notification
  - **Functions** — logika server-side berbasis event

## AI Layer

- **OpenAI API** diakses melalui **Appwrite Function wrapper** (AI Brief Generator, AI Fraud Detection, Landing Assistant).

## State Management

- **Zustand** — lihat alasan di [ADR-006](../04_Decisions/ADR-006.md).

## Validation

- **Zod** — skema validasi (auth, campaign, rate card, offer, withdraw).

## Testing

- **Vitest** (unit/integration) + **Playwright** (e2e).

## Deployment

- Frontend → **Vercel**
- Backend → **Appwrite Cloud**

## Referensi

- Alasan memilih Appwrite: [ADR-001](../04_Decisions/ADR-001.md)
- Aturan service layer: [ADR-002](../04_Decisions/ADR-002.md) dan [50_Project_Rules.md](50_Project_Rules.md)
