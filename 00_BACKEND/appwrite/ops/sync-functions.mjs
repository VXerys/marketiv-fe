/**
 * sync-functions.mjs — terapkan setelan Function dari appwrite.config.json ke live.
 *
 *   node appwrite/ops/sync-functions.mjs --dry     # lihat rencana, tidak menulis
 *   node appwrite/ops/sync-functions.mjs           # terapkan
 *   node appwrite/ops/sync-functions.mjs --only create-order,release-escrow
 *   node appwrite/ops/sync-functions.mjs --fields events
 *
 * BATAS WEWENANG (ditetapkan user 2026-07-27)
 * ───────────────────────────────────────────
 * Secara default script ini HANYA menyentuh setelan runtime: events, schedule,
 * execute, timeout, enabled, logging. Itu wewenang kita.
 *
 * Field milik tim backend — `scopes` (key/hak akses), `entrypoint`, `commands`,
 * `runtime`, `name` — TIDAK disentuh. Nilai live-nya dibawa ulang apa adanya.
 * Untuk memaksa, ada `--backend-fields`, tapi jangan dipakai tanpa persetujuan
 * tim backend.
 *
 * PENGGANTI `appwrite/sync-scopes.ts`, yang destruktif dan tidak boleh dipakai lagi.
 *
 * Kenapa yang lama merusak
 * ────────────────────────
 * `PUT /v1/functions/{id}` adalah replace, bukan patch. SDK node-appwrite
 * membuang field yang bernilai `undefined` dari payload, lalu server mengisi
 * setiap field yang absen dengan DEFAULT-nya. Jadi `functions.update(id, name,
 * undefined, undefined, undefined, ...)` tidak berarti "cuma ubah scopes" —
 * artinya "kosongkan events, kosongkan commands, kembalikan timeout ke 15".
 * Persis penyakit yang sama dengan `appwrite push functions` yang mengosongkan
 * scopes.
 *
 * Cara file ini menghindarinya
 * ────────────────────────────
 * 1. GET live dulu untuk tiap function.
 * 2. Field terpilih diambil dari config; SEMUA field lain dibawa ulang dari live.
 * 3. Payload dikirim lengkap. Tidak ada field absen, jadi tidak ada default
 *    tersembunyi yang bisa menendang masuk.
 */
import {
  aw,
  q,
  loadConfig,
  SAFE_FIELDS,
  BACKEND_FIELDS,
  MANAGED_FIELDS,
  PASSTHROUGH_FIELDS,
} from "./client.mjs";

const argv = process.argv.slice(2);
const DRY = argv.includes("--dry");
const INCLUDE_BACKEND = argv.includes("--backend-fields");

function valueOf(flag) {
  const i = argv.findIndex((a) => a === flag || a.startsWith(flag + "="));
  if (i === -1) return null;
  const raw = argv[i].includes("=") ? argv[i].split("=")[1] : argv[i + 1];
  return (raw || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const onlyList = valueOf("--only");
const only = onlyList?.length ? new Set(onlyList) : null;

const fieldsList = valueOf("--fields");
const selected = fieldsList?.length
  ? fieldsList
  : INCLUDE_BACKEND
    ? MANAGED_FIELDS
    : SAFE_FIELDS;

const bad = selected.filter((f) => !MANAGED_FIELDS.includes(f));
if (bad.length) {
  console.error(`Field tidak dikenal: ${bad.join(", ")}`);
  console.error(`Pilihan: ${MANAGED_FIELDS.join(", ")}`);
  process.exitCode = 1;
} else {
  await main();
}

async function main() {
  const cfg = loadConfig();
  const live = await aw("/functions", { queries: [q.limit(100)] });
  const byId = Object.fromEntries(live.functions.map((f) => [f.$id, f]));
  const norm = (v) => (Array.isArray(v) ? JSON.stringify([...v].sort()) : String(v ?? ""));

  console.log(DRY ? "MODE: --dry (tidak menulis)\n" : "MODE: TERAPKAN (menulis ke live)\n");
  console.log(`Field yang disentuh : ${selected.join(", ")}`);
  const untouched = MANAGED_FIELDS.filter((f) => !selected.includes(f));
  if (untouched.length) {
    console.log(`Dibiarkan apa adanya: ${untouched.join(", ")}`);
  }
  const backendTouched = selected.filter((f) => BACKEND_FIELDS.includes(f));
  if (backendTouched.length) {
    console.log(
      `\n⚠️  Menyentuh field wewenang tim backend: ${backendTouched.join(", ")}`
    );
  }
  console.log();

  let changed = 0;
  let same = 0;
  let notFound = 0;
  let failed = 0;

  for (const c of cfg.functions) {
    if (only && !only.has(c.$id)) continue;

    const l = byId[c.$id];
    if (!l) {
      console.log(`⚠️  ${c.$id} — belum ada di live, lewati (tim backend yang push)`);
      notFound++;
      continue;
    }

    const diffs = selected.filter((f) => norm(c[f]) !== norm(l[f]));
    if (!diffs.length) {
      same++;
      continue;
    }

    // Payload LENGKAP: field terpilih dari config, SISANYA dari live.
    const payload = {};
    for (const f of MANAGED_FIELDS) {
      payload[f] = selected.includes(f) ? (c[f] ?? l[f]) : l[f];
    }
    for (const f of PASSTHROUGH_FIELDS) {
      if (l[f] !== undefined && l[f] !== null) payload[f] = l[f];
    }
    payload.name ||= l.name || c.$id; // wajib ada di PUT

    console.log(`${DRY ? "🔎" : "✅"} ${c.$id}`);
    for (const f of diffs) {
      console.log(
        `     ${f}: ${norm(l[f]) || "(kosong)"} → ${norm(c[f]) || "(kosong)"}`
      );
    }

    if (!DRY) {
      try {
        await aw(`/functions/${c.$id}`, { method: "PUT", body: payload });
      } catch (err) {
        console.error(`   ❌ GAGAL: ${err.message}`);
        failed++;
        continue;
      }
    }
    changed++;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`${DRY ? "🔎 akan diubah " : "✅ diubah      "}: ${changed}`);
  console.log(`➖ sudah sesuai : ${same}`);
  console.log(`⚠️  belum di-push: ${notFound}`);
  if (failed) console.log(`❌ gagal        : ${failed}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(
    DRY ? "\nJalankan tanpa --dry untuk menerapkan." : "\nVerifikasi: npm run fn:drift"
  );

  process.exitCode = failed ? 1 : 0;
}
