/**
 * Sinkronkan `functions/<id>/.env` ke variabel Function di Appwrite.
 *
 * Padanan Node dari `scripts/sync-env-all-functions.sh`, tanpa dua dependensi
 * yang membuat versi shell-nya gagal di mesin ini:
 *   - `jq`            tidak terpasang → pencocokan variabel lama selalu gagal,
 *                     jadi skrip mencoba CREATE semuanya dan kena 409.
 *   - CLI `appwrite`  tidak ada di PATH MINGW64 (hanya lewat `npx`).
 *
 * Script ini memakai `client.mjs` yang sudah dipakai seluruh ops lain, jadi
 * kredensialnya satu sumber dan tidak ada dependensi tambahan.
 *
 *   node appwrite/ops/sync-function-vars.mjs --dry
 *   node appwrite/ops/sync-function-vars.mjs
 *   node appwrite/ops/sync-function-vars.mjs --only validate-and-upload
 *
 * Variabel yang ada di live tapi TIDAK ada di `.env` dibiarkan — script ini
 * tidak pernah menghapus. Penghapusan yang disengaja lewat `fix-function-vars.mjs`.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, join } from "node:path";
import { aw } from "./client.mjs";

const DRY = process.argv.includes("--dry");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx !== -1 ? process.argv[onlyIdx + 1] : null;

const FUNCTIONS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), "../../functions");

/** Nama yang nilainya disembunyikan Appwrite setelah ditulis. */
const isSecret = (key) => /KEY|SECRET|PASSWORD|TOKEN|SIGNATURE/i.test(key);

/**
 * Prefix APPWRITE_ direservasi Appwrite dan nilainya di-inject saat runtime.
 * Menyetelnya sendiri tidak berpengaruh, tapi menyesatkan pembaca berikutnya.
 * APPWRITE_API_KEY dikecualikan: itu nama non-reserved yang dipakai kode sebagai
 * fallback lokal.
 */
const isReserved = (key) => key.startsWith("APPWRITE_FUNCTION_");

function parseEnv(text) {
  const out = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (!key) continue;
    out.push({ key, value });
  }
  return out;
}

let created = 0;
let updated = 0;
let unchanged = 0;
let skippedReserved = 0;
const failures = [];
const noEnv = [];

const fns = readdirSync(FUNCTIONS_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .filter((n) => !ONLY || n === ONLY)
  .sort();

for (const fn of fns) {
  const envPath = join(FUNCTIONS_DIR, fn, ".env");
  if (!existsSync(envPath)) {
    noEnv.push(fn);
    continue;
  }

  let live;
  try {
    live = (await aw(`/functions/${fn}/variables`)).variables || [];
  } catch (e) {
    console.log(`[GAGAL] ${fn} — tidak bisa membaca variabel: ${e.message.slice(0, 160)}`);
    failures.push(fn);
    continue;
  }

  const liveByKey = new Map(live.map((v) => [v.key, v]));
  const entries = parseEnv(readFileSync(envPath, "utf8"));
  const actions = [];

  for (const { key, value } of entries) {
    if (isReserved(key)) {
      skippedReserved++;
      continue;
    }

    const secret = isSecret(key);
    const existing = liveByKey.get(key);

    if (!existing) {
      actions.push({ kind: "NEW", key, value, secret });
      continue;
    }
    // Nilai variabel secret tidak pernah dikembalikan API, jadi tidak bisa
    // dibandingkan — selalu tulis ulang supaya .env tetap jadi sumber kebenaran.
    if (secret || existing.value !== value) {
      actions.push({ kind: "UPD", key, value, secret, id: existing.$id });
    } else {
      unchanged++;
    }
  }

  if (actions.length === 0) {
    console.log(`ok    ${fn.padEnd(30)} ${entries.length} variabel, semua sudah sesuai`);
    continue;
  }

  console.log(`${DRY ? "WOULD" : "SYNC "} ${fn.padEnd(30)} ${actions.map((a) => `${a.kind} ${a.key}`).join(", ")}`);
  if (DRY) continue;

  for (const a of actions) {
    try {
      if (a.kind === "NEW") {
        await aw(`/functions/${fn}/variables`, {
          method: "POST",
          body: { key: a.key, value: a.value, secret: a.secret },
        });
        created++;
      } else {
        await aw(`/functions/${fn}/variables/${a.id}`, {
          method: "PUT",
          body: { key: a.key, value: a.value, secret: a.secret },
        });
        updated++;
      }
    } catch (e) {
      console.log(`      [FAIL] ${a.key}: ${e.message.slice(0, 160)}`);
      if (!failures.includes(fn)) failures.push(fn);
    }
  }
}

console.log("\n=== RINGKASAN ===");
console.log(`  dibuat        : ${created}`);
console.log(`  diperbarui    : ${updated}`);
console.log(`  sudah sesuai  : ${unchanged}`);
console.log(`  reserved dilewati : ${skippedReserved}`);
if (noEnv.length) console.log(`  tanpa .env    : ${noEnv.length} (${noEnv.join(", ")})`);
if (failures.length) console.log(`  GAGAL         : ${failures.length} (${failures.join(", ")})`);
if (DRY) console.log("\n  dry-run — tidak ada yang ditulis.");
else console.log("\n  Verifikasi: node appwrite/ops/audit-live.mjs");
