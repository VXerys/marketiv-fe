/**
 * Buat kolom yang dideklarasikan `appwrite.config.json` tapi hilang di live.
 *
 * HANYA membuat yang hilang. Kolom yang sudah ada tidak pernah diubah atau
 * dihapus — perubahan tipe/ukuran harus lewat migrasi yang disengaja, bukan
 * lewat script yang jalan otomatis.
 *
 * Kenapa ada: `appwrite push tables` menghapus-lalu-membuat-ulang kolom saat
 * definisinya berubah. Pada 2026-07-27 push berhenti di tengah pada
 * `creator_profiles.niche` (`Missing required parameter: "size"`), kolomnya
 * sudah telanjur dihapus, dan tidak ada yang membuatnya kembali. Sejak itu
 * setiap tulis ke `niche` ditolak 400 tanpa ada yang tahu sebabnya.
 *
 *   node appwrite/ops/ensure-columns.mjs --dry
 *   node appwrite/ops/ensure-columns.mjs
 */
import { aw, DB, loadConfig } from "./client.mjs";

const DRY = process.argv.includes("--dry");
const config = loadConfig();
const base = (t) => `/tablesdb/${DB}/tables/${t}/columns`;

/** Petakan definisi kolom config → endpoint + body Appwrite. */
function planColumn(col) {
  const common = { key: col.key, required: Boolean(col.required), array: Boolean(col.array) };
  const def = col.default ?? null;
  // Appwrite menolak `default` pada kolom required.
  const withDefault = col.required ? common : { ...common, default: def };

  if (col.format === "enum")
    return { path: "/enum", body: { ...withDefault, elements: col.elements } };
  if (col.format === "email") return { path: "/email", body: withDefault };
  if (col.format === "url") return { path: "/url", body: withDefault };

  switch (col.type) {
    case "string":
      return { path: "/string", body: { ...withDefault, size: col.size ?? 255, encrypt: Boolean(col.encrypt) } };
    case "integer":
      return { path: "/integer", body: { ...withDefault, min: col.min, max: col.max } };
    case "double":
      return { path: "/float", body: { ...withDefault, min: col.min, max: col.max } };
    case "boolean":
      return { path: "/boolean", body: withDefault };
    case "datetime":
      return { path: "/datetime", body: withDefault };
    default:
      return null;
  }
}

let created = 0;
let missing = 0;
let unsupported = 0;

for (const t of config.tables || config.collections || []) {
  const wantCols = t.columns || t.attributes || [];
  if (wantCols.length === 0) continue;

  let liveKeys;
  try {
    const res = await aw(base(t.$id), { queries: [{ method: "limit", values: [100] }] });
    liveKeys = new Set((res.columns || res.attributes || []).map((c) => c.key));
  } catch (e) {
    console.log(`ERR   ${t.$id.padEnd(24)} gagal membaca kolom: ${e.message.slice(0, 120)}`);
    continue;
  }

  for (const col of wantCols) {
    if (liveKeys.has(col.key)) continue;
    missing++;

    const plan = planColumn(col);
    if (!plan) {
      console.log(`SKIP  ${t.$id}.${col.key} — tipe "${col.type}"/"${col.format}" belum didukung script ini, buat manual`);
      unsupported++;
      continue;
    }

    if (DRY) {
      console.log(`WOULD ${t.$id}.${col.key}  POST ${plan.path}  ${JSON.stringify(plan.body)}`);
      continue;
    }

    try {
      const r = await aw(base(t.$id) + plan.path, { method: "POST", body: plan.body });
      console.log(`OK    ${t.$id}.${col.key} dibuat (status=${r.status || "?"})`);
      created++;
    } catch (e) {
      console.log(`ERR   ${t.$id}.${col.key} ${e.message.slice(0, 250)}`);
    }
  }
}

if (missing === 0) console.log("Semua kolom config sudah ada di live.");
console.log(
  `\nRingkasan: ${missing} hilang, ${created} dibuat, ${unsupported} perlu manual${DRY ? " (dry-run, tidak ada yang ditulis)" : ""}.`
);
if (!DRY && created > 0)
  console.log("Kolom baru butuh beberapa detik sampai status 'available'. Verifikasi: node appwrite/ops/audit-live.mjs");
