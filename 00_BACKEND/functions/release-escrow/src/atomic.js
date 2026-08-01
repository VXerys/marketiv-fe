/**
 * atomic.js — increment/decrement kolom numerik tanpa baca-ubah-tulis.
 *
 * MENGAPA ADA: seluruh jalur uang di Function ini melakukan
 * `getDocument` → hitung → `updateDocument`. Appwrite tidak punya
 * compare-and-set, jadi dua eksekusi yang tumpang tindih sama-sama membaca
 * angka lama lalu menuliskan hasilnya masing-masing — yang terakhir menang dan
 * satu mutasi hilang. Untuk `campaigns.remainingBudget` itu berarti campaign
 * membayar melebihi dananya; untuk `wallets.balance` berarti kreator dibayar
 * kurang atau lebih. Event database bisa terkirim ulang, jadi ini bukan kasus
 * teoretis.
 *
 * MENGAPA fetch MENTAH, bukan SDK: Function di repo ini memakai
 * `node-appwrite@^14.1.0`, yang belum punya metode increment/decrement. Menaikkan
 * major SDK di empat Function jalur uang menambah risiko yang tidak sebanding —
 * endpoint-nya sendiri sudah tersedia di server (1.9.x). Alasannya sama dengan
 * `appwrite/ops/client.mjs` yang juga menolak SDK.
 *
 * Endpoint memakai penamaan TablesDB; itu bentuk kanon di server ini
 * (`/databases/{db}/tables` membalas 404, lihat catatan client.mjs).
 *
 * ⚠️ SALINAN. Berkas ini identik di calculate-campaign-reward, create-escrow,
 * dan release-escrow. Deploy root Appwrite adalah `functions/<id>/`, jadi modul
 * di luar folder itu TIDAK ikut ter-bundle — direktori bersama akan menghasilkan
 * Function yang lolos build lalu gagal saat runtime. Ubah satu, ubah ketiganya.
 *
 * `max`/`min` ditegakkan SERVER: melewatinya menghasilkan error, bukan nilai
 * yang dipotong diam-diam. Itulah yang membuat batas kuota dan lantai nol
 * benar-benar berarti.
 */

/** Bangun konfigurasi HTTP dari env Function yang sudah ada. */
function endpointFor(env, tableId, rowId, column, op) {
  const base = env.appwriteEndpoint.replace(/\/$/, "");
  return `${base}/tablesdb/${env.databaseId}/tables/${tableId}/rows/${rowId}/${column}/${op}`;
}

async function call(env, tableId, rowId, column, op, body) {
  const res = await fetch(endpointFor(env, tableId, rowId, column, op), {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      "X-Appwrite-Project": env.appwriteProjectId,
      "X-Appwrite-Key": env.appwriteApiKey
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${op} ${tableId}.${column} gagal: ${res.status} ${text.slice(0, 300)}`);
  }
  return text ? JSON.parse(text) : null;
}

/**
 * Tambah `value` ke satu kolom. `max` opsional — server menolak bila hasilnya
 * melewatinya.
 */
export async function incrementColumn(env, tableId, rowId, column, value, max) {
  const body = { value };
  if (typeof max === "number") body.max = max;
  return call(env, tableId, rowId, column, "increment", body);
}

/**
 * Kurangi `value` dari satu kolom. `min` default 0 — saldo dan sisa budget tidak
 * boleh negatif, dan menegakkannya di server jauh lebih kuat daripada
 * `Math.max(0, …)` yang dihitung dari bacaan yang mungkin sudah basi.
 */
export async function decrementColumn(env, tableId, rowId, column, value, min = 0) {
  return call(env, tableId, rowId, column, "decrement", { value, min });
}
