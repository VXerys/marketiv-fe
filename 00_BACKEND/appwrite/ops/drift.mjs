/**
 * drift.mjs — bandingkan appwrite.config.json dengan Function di Appwrite live.
 * READ-ONLY. Tidak pernah menulis apa pun.
 *
 *   node appwrite/ops/drift.mjs
 *
 * Laporan dipisah dua blok sesuai wewenang:
 *   A. Bisa kita perbaiki  → `npm run fn:sync`
 *   B. Wewenang tim backend → serahkan, jangan dikerjakan sendiri
 *
 * Riwayat kenapa file ini ada:
 *   v1 membandingkan scopes di balik `if (c.scopes && ...)`. Karena generator
 *   belum pernah menulis key `scopes` ke config, cabang itu selalu dilewati dan
 *   `NO DRIFT` jadi lampu hijau palsu — 8 Function kehilangan scopes tanpa
 *   ketahuan. v2 membandingkan SEMUA field tanpa syarat, justru supaya
 *   kesalahan sejenis tidak bisa sembunyi lagi.
 */
import { aw, q, loadConfig, SAFE_FIELDS, BACKEND_FIELDS } from "./client.mjs";

const cfg = loadConfig();
const live = await aw("/functions", { queries: [q.limit(100)] });
const byId = Object.fromEntries(live.functions.map((f) => [f.$id, f]));

const norm = (v) => (Array.isArray(v) ? JSON.stringify([...v].sort()) : String(v ?? ""));

const safe = [];
const backend = [];
const missing = [];
const orphan = [];

for (const c of cfg.functions) {
  const l = byId[c.$id];
  if (!l) {
    missing.push(c.$id);
    continue;
  }
  for (const f of [...SAFE_FIELDS, ...BACKEND_FIELDS]) {
    const want = norm(c[f]);
    const got = norm(l[f]);
    if (want === got) continue;
    (SAFE_FIELDS.includes(f) ? safe : backend).push([c.$id, f, want, got]);
  }
}

const cfgIds = new Set(cfg.functions.map((f) => f.$id));
for (const l of live.functions) if (!cfgIds.has(l.$id)) orphan.push(l.$id);

function report(title, rows, hint) {
  if (!rows.length) return;
  console.log(`\n${title}`);
  console.log("─".repeat(title.length));
  const w = Math.max(...rows.map((r) => r[0].length));
  for (const [id, f, want, got] of rows) {
    console.log(`  ${id.padEnd(w)} | ${f.padEnd(10)} | live=${got || "(kosong)"}`);
    console.log(`  ${" ".repeat(w)} | ${" ".repeat(10)} | want=${want || "(kosong)"}`);
  }
  console.log(`\n  → ${hint}`);
}

report(
  `A. BISA KITA PERBAIKI (${safe.length} field)`,
  safe,
  "npm run fn:sync:dry lalu npm run fn:sync"
);

report(
  `B. WEWENANG TIM BACKEND (${backend.length} field)`,
  backend,
  "Serahkan ke tim backend — ini ranah push/deploy dan key Function."
);

if (missing.length) {
  console.log("\nBELUM DI-PUSH (ada di config, tidak ada di live):");
  for (const id of missing) console.log(`  - ${id}`);
  console.log("\n  → Tim backend yang push.");
}

if (orphan.length) {
  console.log("\nYATIM (ada di live, tidak ada di config):");
  for (const id of orphan) console.log(`  - ${id}`);
}

if (!safe.length && !backend.length && !missing.length && !orphan.length) {
  console.log("NO DRIFT");
}

console.log(
  `\nRingkasan: ${safe.length} field bisa kita perbaiki, ${backend.length} field ranah tim backend, ` +
    `${missing.length} belum di-push, ${orphan.length} yatim ` +
    `(${cfg.functions.length} di config, ${live.functions.length} di live)`
);

// Pakai exitCode, bukan process.exit(). process.exit() saat masih ada handle
// async yang menutup memicu assertion libuv di Windows:
//   Assertion failed: !(handle->flags & UV_HANDLE_CLOSING), src\win\async.c:94
process.exitCode = safe.length ? 1 : 0;
