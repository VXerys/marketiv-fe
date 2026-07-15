# 80_Deployment

Panduan deployment Marketiv. Struktur & env: [`40_Folder_Structure.md`](40_Folder_Structure.md).

## Target

- **Frontend** (Next.js) → **Vercel**.
- **Backend** (Database, Auth, Storage, Realtime, Functions) → **Appwrite Cloud**.
- **AI Layer** → Gemini API dipanggil dari Appwrite Function (key Gemini hanya di environment function).

## Environment Variables (Frontend / Vercel)

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_DB_ID=
NEXT_PUBLIC_USER_COLLECTION=
NEXT_PUBLIC_CREATOR_COLLECTION=
NEXT_PUBLIC_CAMPAIGN_COLLECTION=
NEXT_PUBLIC_ORDER_COLLECTION=
NEXT_PUBLIC_WALLET_COLLECTION=
NEXT_PUBLIC_PAYMENT_COLLECTION=
NEXT_PUBLIC_TRANSACTION_COLLECTION=
NEXT_PUBLIC_ESCROW_COLLECTION=
NEXT_PUBLIC_WITHDRAWAL_COLLECTION=
NEXT_PUBLIC_CREATE_PAYMENT_FUNCTION_ID=
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_AI_FUNCTION_ID=
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=
```

- Set semua `NEXT_PUBLIC_*` di Vercel Project Settings (Environment Variables).
- Hanya variabel ber-prefiks `NEXT_PUBLIC_` yang aman diekspos ke client. JANGAN menaruh API key server / Gemini key di sini (lihat [`50_Security_Guidelines.md`](50_Security_Guidelines.md)).

## Deploy Frontend (Vercel)

- Build command: `next build` (output `.next/`).
- Push ke branch produksi → Vercel auto-build & deploy.

## Deploy Backend (Appwrite Cloud)

- Buat project, database (`NEXT_PUBLIC_DB_ID`), collections, storage buckets, dan Functions di Appwrite Cloud.
- Atur permission per collection sesuai [`50_Security_Guidelines.md`](50_Security_Guidelines.md).

## Deploy Appwrite Functions

- Functions: `create-user-profile`, `create-user-wallet`, `validate-and-upload`, `delete-file`, `campaign-published`, `ai-brief`, `ai-fraud-precheck`, `create-order`, `calculate-campaign-reward`, `campaign-claimed`, `expire-stale-claims`, `create-payment`, `midtrans-webhook`, `create-escrow`, `release-escrow`, `send-chat-notification`.
- Set API Key server (scope di [`50_Security_Guidelines.md`](50_Security_Guidelines.md)), secret Gemini, dan Midtrans server key sebagai function environment variables — tidak pernah di frontend.
- Env Midtrans untuk function: `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_ENV` (`sandbox`/`production`).
- Env Appwrite untuk function webhook: `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID`, `PAYMENTS_COLLECTION_ID`.
- Hubungkan function ke Appwrite Event yang relevan (mis. user registered → create-user-wallet, submission created → ai-fraud-precheck).
