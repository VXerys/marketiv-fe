# 20_Coding_Standards

Standar coding wajib untuk frontend Marketiv (Next.js). Struktur folder lengkap ada di [`40_Folder_Structure.md`](40_Folder_Structure.md).

## Arsitektur Modul (Feature-Based)

- Gunakan **Feature-Based Architecture**, bukan Page-Based — lebih scalable.
- Setiap business capability = satu modul di `src/modules/<feature>/`.
- Struktur internal modul: `components/`, `services/`, `hooks/`, `validators/`, `store.js`.
- Routing ada di `src/app/` (App Router); file `page.jsx` meng-import view dari modul. Modul tidak memegang routing.
- Jangan dokumentasikan / menaruh logika lintas-modul di dalam satu modul.

## Service Layer (WAJIB)

- Semua akses Appwrite **wajib** lewat service layer. Alur yang benar:

  ```text
  Route/Component → Service → Appwrite SDK
  ```

- DILARANG memanggil Appwrite SDK langsung dari komponen `page.jsx`/Component.
- Service berisi: pemanggilan SDK, mapping data, dan throw error bertipe (lihat [`60_Error_Handling.md`](60_Error_Handling.md)).
- Service global ada di `src/services/`; service spesifik fitur boleh di `src/modules/<feature>/services/`.

## State Management (Zustand)

- Gunakan **Zustand** (bukan Redux) — ringan, tanpa boilerplate.
- Store global di `src/stores/` (mis. `authStore.js`, `campaignStore.js`, `walletStore.js`, `notificationStore.js`).
- Store hanya memegang state + aksi; pemanggilan data tetap lewat service.

## Validasi (Zod)

- Semua input divalidasi dengan **Zod** sebelum dikirim ke service/SDK.
- Schema di `src/validations/` (mis. `authSchema.js`, `campaignSchema.js`, `withdrawSchema.js`).
- Validasi dijalankan di Page/form, bukan di dalam SDK.

## Hooks

- Custom hook di `src/hooks/` membungkus store + service untuk konsumsi komponen (mis. `useAuth`, `useCampaign`, `useWallet`, `useRealtime`, `useNotification`).

## Konvensi Penamaan (ringkas)

- Service: `camelCase` + sufiks `Service` → `campaignService.js`.
- Store: `camelCase` + sufiks `Store` → `walletStore.js`.
- Hook: prefiks `use` → `useWallet`.
- Schema: `camelCase` + sufiks `Schema` → `withdrawSchema.js`.
- Detail lengkap di [`30_Naming_Convention.md`](30_Naming_Convention.md).
