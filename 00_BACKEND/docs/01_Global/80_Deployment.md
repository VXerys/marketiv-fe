# 80_Deployment

Panduan deployment Marketiv. Struktur & env: [`40_Folder_Structure.md`](40_Folder_Structure.md).

## Target

- **Frontend** (React + Vite) → **Vercel**.
- **Backend** (Database, Auth, Storage, Realtime, Functions) → **Appwrite Cloud**.
- **AI Layer** → OpenAI API dipanggil dari Appwrite Function (key OpenAI hanya di environment function).

## Environment Variables (Frontend / Vercel)

```env
VITE_APPWRITE_ENDPOINT=
VITE_APPWRITE_PROJECT_ID=
VITE_DB_ID=
VITE_USER_COLLECTION=
VITE_CREATOR_COLLECTION=
VITE_CAMPAIGN_COLLECTION=
VITE_ORDER_COLLECTION=
VITE_WALLET_COLLECTION=
VITE_STORAGE_BUCKET=
VITE_AI_FUNCTION_ID=
```

- Set semua `VITE_*` di Vercel Project Settings (Environment Variables).
- Hanya variabel ber-prefiks `VITE_` yang aman diekspos ke client. JANGAN menaruh API key server / OpenAI key di sini (lihat [`50_Security_Guidelines.md`](50_Security_Guidelines.md)).

## Deploy Frontend (Vercel)

- Build command: `vite build` (output `dist/`).
- Push ke branch produksi → Vercel auto-build & deploy.

## Deploy Backend (Appwrite Cloud)

- Buat project, database (`VITE_DB_ID`), collections, storage bucket, dan Functions di Appwrite Cloud.
- Atur permission per collection sesuai [`50_Security_Guidelines.md`](50_Security_Guidelines.md).

## Deploy Appwrite Functions

- Functions: `create-wallet`, `create-order`, `process-payment`, `release-escrow`, `generate-brief`, `fraud-detection`, `send-notification`.
- Set API Key server (scope di [`50_Security_Guidelines.md`](50_Security_Guidelines.md)) dan secret OpenAI sebagai function environment variables — tidak pernah di frontend.
- Hubungkan function ke Appwrite Event yang relevan (mis. user registered → create-wallet, submission created → fraud-detection).
