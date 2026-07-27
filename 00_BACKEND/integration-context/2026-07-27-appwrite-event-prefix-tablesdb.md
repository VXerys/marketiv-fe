# 🔧 Appwrite Function Events — Prefix TablesDB

**Status:** ✅ Resolved — 8 function events updated via API  
**Tanggal:** 2026-07-27  
**Penyebab:** Config pakai prefix `databases.*.collections.*.documents.*` (pre-TablesDB)  
**Dampak:** 8 event-driven function tidak pernah trigger — events `[]` di live Appwrite

---

## Ringkasan

```
Config file (.json / .cjs)      → pakai prefix LAMA
Live Appwrite (server 1.9.5)    → events tersimpan sebagai [] (kosong)
Akibat                          → 8 function gak pernah kepanggil
```

Frontend menemukan: semua field `events`, `execute`, `schedule` kosong di live Appwrite walau config file sudah diisi. Setelah investigasi, akar masalahnya ada di **prefix event function trigger**.

---

## Evolusi Prefix Event Appwrite

| Versi                          | Prefix                                  | Contoh                                                    |
| ------------------------------ | --------------------------------------- | --------------------------------------------------------- |
| Pre-1.9 (legacy)               | `databases.*.collections.*.documents.*` | `databases.${db}.collections.${table}.documents.*.create` |
| 1.9.x (TablesDB, transitional) | `databases.*.tables.*.rows.*`           | `databases.${db}.tables.${table}.rows.*.create`           |
| 1.9.0+ (TablesDB, primary)     | `tablesdb.*.tables.*.rows.*`            | `tablesdb.${db}.tables.${table}.rows.*.create`            |

Perubahan dari `collections` → `tables` dan `documents` → `rows`. Root prefix `databases` diganti `tablesdb`.

Server 1.9.x emit **kedua format** (lihat PR appwrite/appwrite#11404):

- `databases.{db}.tables.{table}.rows.{row}.create` — compatibility
- `tablesdb.{db}.tables.{table}.rows.{row}.create` — primary

---

## 8 Function yang Terkena

| Function                    | Table                | Event     |
| --------------------------- | -------------------- | --------- |
| `campaign-published`        | campaigns            | `.update` |
| `ai-fraud-precheck`         | campaign_submissions | `.create` |
| `create-order`              | offers               | `.update` |
| `calculate-campaign-reward` | campaign_submissions | `.update` |
| `campaign-claimed`          | campaign_claims      | `.create` |
| `create-escrow`             | payments             | `.update` |
| `release-escrow`            | deliverables         | `.update` |
| `send-chat-notification`    | messages             | `.create` |

---

## Kendala CLI

CLI `appwrite push` dan `appwrite functions update` (v22.0.0 dan v23.1.0) **menolak** `tablesdb.*` prefix:

```
✗ Error: Invalid `events` param: Event is not valid.
```

Penyebab: validasi events ada di CLI-side (hard-coded list). `tablesdb.*` belum masuk daftar valid, meski **server 1.9.5 sudah support sejak 1.9.0**.

Solusi: update events via `appwrite functions update` dengan prefix **`databases.*.tables.*.rows.*`** — format transitional yang diterima CLI dan server, dan fungsional identik karena server emit kedua format.

```
appwrite functions update \
  --function-id "campaign-published" \
  --events "databases.${DBID}.tables.campaigns.rows.*.update" \
  ...
```

---

## Resolusi

| Langkah           | Detail                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| 1. Edit generator | `appwrite/generate_appwrite_json.cjs` — 8 baris event prefix diganti                    |
| 2. Regenerate     | `node appwrite/generate_appwrite_json.cjs` → `appwrite.config.json` terbaru             |
| 3. Push ke live   | `appwrite functions update` × 8 function via CLI (format `databases.*.tables.*.rows.*`) |

Semua function sekarang punya events terisi dan bakal trigger saat row dibuat/diupdate.

### ✅ Verifikasi

Perintah berikut dijalankan dan output sesuai:

```fish
for fn in campaign-published ai-fraud-precheck create-order calculate-campaign-reward campaign-claimed create-escrow release-escrow send-chat-notification
    echo "--- $fn ---"
    appwrite functions get --function-id $fn 2>&1 | grep -A1 "events" | tail -1
end
```

Semua function menampilkan events dengan prefix `databases.6a4c8598001da3b0d7f0.tables.*.rows.*` — **tidak ada yang kosong**. Permasalahan selesai.

---

## Catatan

- Kalau CLI di masa depan sudah support `tablesdb.*`, tinggal regenerate + `appwrite push` — tidak perlu edit manual lagi.
- `create-user-profile` dan `create-user-wallet` pakai event `users.*.create` — prefix user tidak berubah, jadi tidak terdampak.
- `expire-stale-claims` pakai `schedule`, bukan events — juga tidak terdampak.

---

## File Terkait

- **Generator config:** `00_BACKEND/appwrite/generate_appwrite_json.cjs`
- **Config output:** `00_BACKEND/appwrite.config.json`
- **Dokumentasi events:** <https://appwrite.io/docs/apis/events>
- **PR TablesDB events:** <https://github.com/appwrite/appwrite/pull/11404>
