/**
 * Buat bucket yang dideklarasikan `appwrite.config.json` tapi belum ada di live.
 *
 * HANYA membuat. Bucket yang sudah ada tidak pernah disentuh — pengetatan
 * permission-nya milik `harden-permissions.mjs`, dan `appwrite push buckets`
 * sengaja dihindari karena PUT-nya bersifat replace (lihat client.mjs).
 *
 * Latar: `user-files` dideklarasikan config dan dipakai frontend
 * (`src/lib/appwrite/config.ts:11`) tapi tidak pernah dibuat di live. Akibatnya
 * `DEFAULT_STORAGE_BUCKET_ID` di `validate-and-upload` diarahkan ke
 * `campaign-assets` — bucket `read("any")` dengan `fileSecurity=false`, sehingga
 * SETIAP berkas terunggah bisa diunduh publik dan seluruh Permission.read
 * per-berkas yang dipasang Function diabaikan server.
 *
 *   node appwrite/ops/ensure-buckets.mjs --dry
 *   node appwrite/ops/ensure-buckets.mjs
 */
import { aw, loadConfig } from "./client.mjs";

const DRY = process.argv.includes("--dry");
const config = loadConfig();

let created = 0;
let skipped = 0;

for (const b of config.buckets || []) {
  let exists = true;
  try {
    await aw(`/storage/buckets/${b.$id}`);
  } catch (e) {
    if (String(e.message).startsWith("404")) exists = false;
    else throw e;
  }

  if (exists) {
    console.log(`SKIP  ${b.$id.padEnd(18)} sudah ada`);
    skipped++;
    continue;
  }

  const body = {
    bucketId: b.$id,
    name: b.name || b.$id,
    permissions: b.$permissions || [],
    fileSecurity: Boolean(b.fileSecurity),
    enabled: b.enabled !== false,
    maximumFileSize: b.maximumFileSize,
    allowedFileExtensions: b.allowedFileExtensions || [],
    compression: b.compression || "none",
    encryption: b.encryption !== false,
    antivirus: b.antivirus !== false,
  };
  // Appwrite menolak field bernilai undefined pada create.
  for (const k of Object.keys(body)) if (body[k] === undefined) delete body[k];

  if (DRY) {
    console.log(`WOULD ${b.$id.padEnd(18)} create perms=${JSON.stringify(body.permissions)} fileSecurity=${body.fileSecurity}`);
    continue;
  }

  try {
    const r = await aw("/storage/buckets", { method: "POST", body });
    console.log(`OK    ${r.$id.padEnd(18)} dibuat — perms=${JSON.stringify(r.$permissions)} fileSecurity=${r.fileSecurity}`);
    created++;
  } catch (e) {
    console.log(`ERR   ${b.$id.padEnd(18)} ${e.message.slice(0, 300)}`);
  }
}

console.log(`\nRingkasan: ${created} dibuat, ${skipped} sudah ada${DRY ? " (dry-run, tidak ada yang ditulis)" : ""}.`);
