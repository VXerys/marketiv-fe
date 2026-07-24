/**
 * sync-scopes.ts
 *
 * Sinkronisasi Appwrite Function Scopes dari function-scopes.json.
 *
 * Penggunaan:
 *   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
 *   APPWRITE_PROJECT_ID=<project-id> \
 *   APPWRITE_API_KEY=<api-key-dengan-scope-functions.read+functions.write> \
 *   npx tsx appwrite/sync-scopes.ts
 *
 * Prasyarat:
 *   - API key dengan scopes: `functions.read`, `functions.write`
 *   - node-appwrite terinstall di 00_BACKEND/
 *   - function-scopes.json berisi mapping nama function → scopes
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { Client, Functions } from "node-appwrite";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Konfigurasi ─────────────────────────────────────────────

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

const SCOPES_PATH = resolve(__dirname, "function-scopes.json");

// ─── Validasi env ────────────────────────────────────────────

function fail(msg: string): never {
  console.error(`❌ ${msg}`);
  process.exit(1);
}

if (!ENDPOINT) fail("APPWRITE_ENDPOINT tidak diset");
if (!PROJECT_ID) fail("APPWRITE_PROJECT_ID tidak diset");
if (!API_KEY) fail("APPWRITE_API_KEY tidak diset (butuh scopes: functions.read, functions.write)");

if (!existsSync(SCOPES_PATH)) {
  fail(`File tidak ditemukan: ${SCOPES_PATH}`);
}

// ─── Load mapping scopes ─────────────────────────────────────

const scopesMap: Record<string, string[]> = JSON.parse(
  readFileSync(SCOPES_PATH, "utf-8")
);

const functionIds = Object.keys(scopesMap);
console.log(`📖 Loaded ${functionIds.length} function scope definitions\n`);

// ─── Init Appwrite admin client ─────────────────────────────

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const functions = new Functions(client);

// ─── Sync ────────────────────────────────────────────────────

async function main() {
  // 1. Ambil semua function dari Appwrite
  // Paginasi tidak perlu — total function < 50 dan SDK v14+ tidak support
  // query format `limit()`/`offset()` di endpoint ini.
  const res = await functions.list();
  const allRemote: { $id: string; name: string; scopes: string[] }[] =
    (res.functions as any[]).map((fn) => ({
      $id: fn.$id,
      name: fn.name,
      scopes: fn.scopes ?? [],
    }));

  console.log(`🔍 ${allRemote.length} function ditemukan di Appwrite\n`);

  // 2. Cocokkan setiap entry di JSON dengan remote
  let updated = 0;
  let skipped = 0;
  let notFound = 0;

  for (const [fnName, desiredScopes] of Object.entries(scopesMap)) {
    const remote = allRemote.find((r) => r.$id === fnName);

    if (!remote) {
      console.warn(`⚠️  ${fnName} — tidak ditemukan di Appwrite (lewati)`);
      notFound++;
      continue;
    }

    const oldScopes = [...remote.scopes].sort();
    const newScopes = [...desiredScopes].sort();

    const isSame =
      oldScopes.length === newScopes.length &&
      oldScopes.every((s, i) => s === newScopes[i]);

    if (isSame) {
      console.log(`➖ ${fnName} — scopes sudah sesuai (${oldScopes.join(", ") || "kosong"})`);
      skipped++;
      continue;
    }

    try {
      await functions.update(
        remote.$id, // functionId
        fnName,     // name (wajib, kirim ulang nama yang sudah ada)
        undefined,  // runtime — biarkan tidak berubah
        undefined,  // execute
        undefined,  // events
        undefined,  // schedule
        undefined,  // timeout
        undefined,  // enabled
        undefined,  // logging
        undefined,  // entrypoint
        undefined,  // commands
        desiredScopes, // scopes — ini yang mau diubah
      );

      console.log(`✅ ${fnName}`);
      console.log(`   Lama: ${oldScopes.join(", ") || "(kosong)"}`);
      console.log(`   Baru: ${newScopes.join(", ")}`);
      updated++;
    } catch (err: any) {
      console.error(`❌ ${fnName} — GAGAL: ${err.message || String(err)}`);
    }
  }

  // ─── Ringkasan ──────────────────────────────────────────────

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ ${updated} function di-update`);
  console.log(`➖ ${skipped} function sudah sesuai`);
  console.log(`⚠️  ${notFound} function tidak ditemukan`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  if (notFound > 0) {
    console.warn("⚠️  Function yang tidak ditemukan:");
    for (const [name] of Object.entries(scopesMap)) {
      if (!allRemote.find((r) => r.$id === name)) {
        console.warn(`   - ${name}`);
      }
    }
    console.warn("Pastikan function sudah di-push ke Appwrite sebelum sync scopes.\n");
  }

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
