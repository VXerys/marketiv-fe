# 60_Error_Handling

Konvensi penanganan error untuk frontend Marketiv. Service layer wajib: [`20_Coding_Standards.md`](20_Coding_Standards.md).

## Prinsip

- Validasi Zod dijalankan **sebelum** memanggil service/SDK (cegah error sejak input). Schema di `src/validations/`.
- Service layer **melempar error bertipe** (typed error), bukan mengembalikan `null` diam-diam.
- UI menangkap error dan menampilkan **pesan ramah pengguna**, bukan stack trace mentah.

## Pola Service

- Bungkus pemanggilan Appwrite SDK dengan `try/catch`.
- Map error Appwrite (mis. `AppwriteException.code`/`type`) ke error domain yang konsisten.
- Lempar ulang sebagai error bertipe agar caller bisa membedakan kasus (validasi, auth, not-found, server).

```javascript
// pola minimal di service
try {
  return await databases.getDocument(dbId, collectionId, id);
} catch (err) {
  throw new AppError({
    code: err.type ?? "unknown",
    message: "Gagal memuat data. Coba lagi.",
    cause: err,
  });
}
```

## Bentuk Error Standar

```json
{
  "code": "validation | auth | not_found | forbidden | server | unknown",
  "message": "Pesan ramah pengguna (Bahasa Indonesia)",
  "cause": "(opsional) error asli untuk logging"
}
```

## Bentuk Return Sukses

- Service mengembalikan data domain langsung (objek/array), bukan envelope.
- Fungsi AI mengembalikan payload sesuai kontrak modul (mis. fraud: `{ "score": 0.82, "status": "safe" }`).

## Penyajian di UI

- `validation` → tampilkan di field form terkait.
- `auth` → arahkan ke login.
- `forbidden`/`not_found` → empty/error state.
- `server`/`unknown` → toast/banner generik + opsi retry.
- Error tak tertangani ditangkap `ErrorBoundary` (`src/app/ErrorBoundary.jsx`).
