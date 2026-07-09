# 80_Deployment

Panduan deployment Marketiv. Struktur & env: [`40_Folder_Structure.md`](40_Folder_Structure.md).

## Target

- **Frontend** (Next.js) → **Vercel**.
- **Backend** (Database, Auth, Storage, Realtime, Functions) → **Appwrite Cloud**.
- **AI Layer** → OpenAI API dipanggil dari Appwrite Function (key OpenAI hanya di environment function).

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
NEXT_PUBLIC_STORAGE_BUCKET=
NEXT_PUBLIC_AI_FUNCTION_ID=
```

- Set semua `NEXT_PUBLIC_*` di Vercel Project Settings (Environment Variables).
- Hanya variabel ber-prefiks `NEXT_PUBLIC_` yang aman diekspos ke client. JANGAN menaruh API key server / OpenAI key di sini (lihat [`50_Security_Guidelines.md`](50_Security_Guidelines.md)).

## Deploy Frontend (Vercel)

- Build command: `next build` (output `.next/`).
- Push ke branch produksi → Vercel auto-build & deploy.

## Deploy Backend (Appwrite Cloud)

- Buat project, database (`NEXT_PUBLIC_DB_ID`), collections, storage bucket, dan Functions di Appwrite Cloud.
- Atur permission per collection sesuai [`50_Security_Guidelines.md`](50_Security_Guidelines.md).

## Deploy Appwrite Functions

- Functions: `create-wallet`, `create-order`, `process-payment`, `release-escrow`, `generate-brief`, `fraud-detection`, `send-notification`.
- Set API Key server (scope di [`50_Security_Guidelines.md`](50_Security_Guidelines.md)) dan secret OpenAI sebagai function environment variables — tidak pernah di frontend.
- Hubungkan function ke Appwrite Event yang relevan (mis. user registered → create-wallet, submission created → fraud-detection).
