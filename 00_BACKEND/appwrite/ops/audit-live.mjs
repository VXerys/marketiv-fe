/**
 * Audit read-only kondisi Appwrite live vs `appwrite.config.json`.
 *
 * Melengkapi `drift.mjs`, yang hanya membandingkan field runtime Function.
 * Script ini memeriksa hal yang luput dari sana dan pernah menggigit kami:
 *
 *   - bucket yang dideklarasikan config tapi TIDAK ADA di live (404 saat runtime)
 *   - tabel yang dideklarasikan config tapi tidak ada di live
 *   - Function tanpa deployment aktif (ada tapi tidak pernah bisa dieksekusi)
 *   - Function yang deployment aktifnya BUKAN `ready` terbaru — konfigurasinya
 *     benar sempurna tapi kodenya yang jalan sudah usang
 *   - permission & rowSecurity tabel/bucket yang berbeda dari config
 *
 * Tidak pernah menulis apa pun. Aman dijalankan kapan saja.
 *
 *   node appwrite/ops/audit-live.mjs
 */
import { aw, DB, loadConfig } from "./client.mjs";

const config = loadConfig();

const problems = [];
const note = (severity, area, message) => problems.push({ severity, area, message });

// Sebagian kecil Function memang auth-only dan tidak pernah menyentuh database.
// Memaksa APPWRITE_DATABASE_ID pada mereka hanya membuat audit "hijau" palsu.
const DB_ID_OPTIONAL_FUNCTIONS = new Set([
  "reset-password-with-otp",
]);

const listAll = async (pathname, key) => {
  const out = [];
  let offset = 0;
  for (;;) {
    const res = await aw(pathname, {
      queries: [
        { method: "limit", values: [100] },
        { method: "offset", values: [offset] },
      ],
    });
    const items = res[key] || [];
    out.push(...items);
    if (items.length === 0 || out.length >= (res.total ?? out.length)) break;
    offset += items.length;
  }
  return out;
};

// ── Buckets ────────────────────────────────────────────────────────────────
const liveBuckets = await listAll("/storage/buckets", "buckets");
const liveBucketById = new Map(liveBuckets.map((b) => [b.$id, b]));

console.log(`\n=== BUCKET  (config ${(config.buckets || []).length} · live ${liveBuckets.length}) ===`);
for (const b of config.buckets || []) {
  const live = liveBucketById.get(b.$id);
  if (!live) {
    console.log(`  MISSING  ${b.$id}`);
    note("blocker", "bucket", `Bucket "${b.$id}" ada di config tapi TIDAK ADA di live — setiap upload ke sana gagal 404.`);
    continue;
  }
  const permDiff =
    JSON.stringify([...(live.$permissions || [])].sort()) !==
    JSON.stringify([...(b.$permissions || [])].sort());
  const secDiff = Boolean(live.fileSecurity) !== Boolean(b.fileSecurity);
  console.log(
    `  ${permDiff || secDiff ? "DIFF   " : "ok     "} ${b.$id.padEnd(18)} fileSec=${live.fileSecurity}  ${JSON.stringify(live.$permissions)}`
  );
  if (permDiff)
    note("warn", "bucket", `Permission bucket "${b.$id}" beda dari config — live ${JSON.stringify(live.$permissions)}, config ${JSON.stringify(b.$permissions)}.`);
  if (secDiff)
    note("warn", "bucket", `fileSecurity bucket "${b.$id}" beda — live ${live.fileSecurity}, config ${b.fileSecurity}.`);
}
for (const b of liveBuckets) {
  if (!(config.buckets || []).some((x) => x.$id === b.$id))
    note("info", "bucket", `Bucket "${b.$id}" ada di live tapi tidak di config (yatim).`);
}

// ── Tabel ──────────────────────────────────────────────────────────────────
// Appwrite 1.9.x: TablesDB berada di /tablesdb/{db}/tables, BUKAN
// /databases/{db}/tables (yang 404 dengan halaman HTML, bukan JSON).
const liveTables = await listAll(`/tablesdb/${DB}/tables`, "tables");
const liveTableById = new Map(liveTables.map((t) => [t.$id, t]));
const configTables = config.tables || config.collections || [];

console.log(`\n=== TABEL  (config ${configTables.length} · live ${liveTables.length}) ===`);
for (const t of configTables) {
  const live = liveTableById.get(t.$id);
  if (!live) {
    console.log(`  MISSING  ${t.$id}`);
    note("blocker", "tabel", `Tabel "${t.$id}" ada di config tapi TIDAK ADA di live.`);
    continue;
  }
  const wantPerms = [...(t.$permissions || [])].sort();
  const livePerms = [...(live.$permissions || [])].sort();
  const permDiff = JSON.stringify(wantPerms) !== JSON.stringify(livePerms);
  const wantSec = Boolean(t.rowSecurity ?? t.documentSecurity);
  const liveSec = Boolean(live.rowSecurity ?? live.documentSecurity);
  const secDiff = wantSec !== liveSec;
  if (permDiff || secDiff) {
    console.log(`  DIFF     ${t.$id.padEnd(24)} live=${JSON.stringify(livePerms)} rowSec=${liveSec}`);
    console.log(`           ${"".padEnd(24)} cfg =${JSON.stringify(wantPerms)} rowSec=${wantSec}`);
    const leaks = livePerms.filter((p) => /^(read|update|delete)\("users"\)/.test(p) && !wantPerms.includes(p));
    note(
      leaks.length ? "blocker" : "warn",
      "tabel",
      `Tabel "${t.$id}" belum diketatkan${leaks.length ? ` — masih ada ${leaks.join(", ")} di level koleksi` : ""}.`
    );
  }
}

// ── Kolom tabel ────────────────────────────────────────────────────────────
// drift.mjs tidak menyentuh ini sama sekali. Kolom yang hilang di live adalah
// kegagalan senyap: setiap tulis ke kolom itu ditolak 400 "unknown attribute",
// dan gejalanya muncul jauh dari penyebabnya.
console.log("\n=== KOLOM ===");
let columnIssues = 0;
for (const t of configTables) {
  if (!liveTableById.has(t.$id)) continue;
  const wantCols = t.columns || t.attributes || [];
  if (wantCols.length === 0) continue;

  let liveCols;
  try {
    const res = await aw(`/tablesdb/${DB}/tables/${t.$id}/columns`, {
      queries: [{ method: "limit", values: [100] }],
    });
    liveCols = res.columns || res.attributes || [];
  } catch (err) {
    note("warn", "kolom", `Gagal membaca kolom "${t.$id}": ${String(err).slice(0, 120)}`);
    continue;
  }

  const liveByKey = new Map(liveCols.map((c) => [c.key, c]));
  for (const want of wantCols) {
    const live = liveByKey.get(want.key);
    if (!live) {
      console.log(`  MISSING  ${t.$id}.${want.key}  (${want.type}${want.format ? "/" + want.format : ""})`);
      note("blocker", "kolom", `Kolom "${t.$id}.${want.key}" ada di config tapi TIDAK ADA di live — setiap tulis ke kolom itu ditolak 400.`);
      columnIssues++;
      continue;
    }
    if (live.status && live.status !== "available") {
      console.log(`  ${String(live.status).toUpperCase().padEnd(8)} ${t.$id}.${want.key}`);
      note("blocker", "kolom", `Kolom "${t.$id}.${want.key}" berstatus "${live.status}" di live, belum "available".`);
      columnIssues++;
    }
  }
  for (const live of liveCols) {
    if (!wantCols.some((w) => w.key === live.key))
      note("info", "kolom", `Kolom "${t.$id}.${live.key}" ada di live tapi tidak di config (yatim).`);
  }
}
if (columnIssues === 0) console.log("  Semua kolom config ada di live dan available.");

// ── Functions ──────────────────────────────────────────────────────────────
const liveFns = await listAll("/functions", "functions");
const liveFnById = new Map(liveFns.map((f) => [f.$id, f]));
const configFns = config.functions || [];

console.log(`\n=== FUNCTION  (config ${configFns.length} · live ${liveFns.length}) ===`);
for (const f of configFns) {
  const live = liveFnById.get(f.$id);
  if (!live) {
    console.log(`  MISSING     ${f.$id}`);
    note("blocker", "function", `Function "${f.$id}" ada di config tapi belum pernah di-push ke live.`);
    continue;
  }
  const dep = live.deployment || live.deploymentId || "";
  if (!dep) {
    console.log(`  NO-DEPLOY   ${f.$id}`);
    note("blocker", "function", `Function "${f.$id}" ada di live tapi tanpa deployment aktif — tidak bisa dieksekusi.`);
  }

  // Punya deployment aktif TIDAK berarti deployment itu yang terbaru.
  //
  // `appwrite push functions` mengaktifkan deployment yang dibuatnya, tapi kalau
  // push berhenti di tengah — build nyangkut, CLI di-interrupt — deployment-nya
  // terlanjur `ready` sementara pointer aktif tidak pernah maju. Function tetap
  // hidup, tetap lolos seluruh pemeriksaan config di atas, dan tetap menjalankan
  // kode lama.
  //
  // Ketahuan 2026-07-29 pada `create-order`: aktif di deployment 2026-07-27
  // sementara ada 5 deployment `ready` dari 2026-07-29. Audit ini melaporkan
  // "0 blocker" saat itu justru karena hanya memeriksa `dep` ada atau tidak.
  if (dep) {
    try {
      const res = await aw(`/functions/${f.$id}/deployments`, {
        queries: [
          { method: "limit", values: [25] },
          { method: "orderDesc", values: ["$createdAt"] },
        ],
      });
      const deployments = res.deployments || [];
      const active = deployments.find((d) => d.$id === dep);
      const newestReady = deployments.find((d) => d.status === "ready");

      if (newestReady && newestReady.$id !== dep) {
        // `active` undefined artinya deployment aktifnya sudah di luar 25 terbaru
        // — tertinggal jauh, bukan sekadar selisih satu build.
        const activeLabel = active ? active.$createdAt.slice(0, 19) : `${dep} (di luar 25 terbaru)`;
        console.log(`  STALE-DEP   ${f.$id}`);
        note(
          "blocker",
          "function",
          `Function "${f.$id}" aktif di deployment ${activeLabel} padahal ada "ready" yang lebih baru ` +
            `(${newestReady.$createdAt.slice(0, 19)}) — yang jalan di live belum tentu kode yang ada di repo. ` +
            `Perbaiki: node appwrite/ops/activate-latest-deployment.mjs`
        );
      }

      // Build yang menggantung inilah yang menghentikan push di tengah dan
      // menyebabkan STALE-DEP di atas.
      //
      // Hanya dihitung yang LEBIH BARU dari deployment aktif. Appwrite Cloud
      // meninggalkan build tersangkut berhari-hari tanpa membersihkannya; project
      // ini punya 16 Function dengan sisa build dari 2026-07-26 s/d 07-28 yang
      // semuanya sudah tidak relevan. Build yang lebih tua dari deployment aktif
      // berarti push sesudahnya sudah berhasil — tidak ada yang perlu dikerjakan.
      // Tanpa filter ini peringatannya muncul di 16 dari 28 Function dan berhenti
      // dibaca orang.
      const STUCK_MINUTES = 15;
      const cutoff = Date.now() - STUCK_MINUTES * 60_000;
      const activeAt = active ? Date.parse(active.$createdAt) : 0;
      const stuck = deployments.filter(
        (d) =>
          ["building", "processing", "waiting"].includes(d.status) &&
          Date.parse(d.$createdAt) < cutoff &&
          Date.parse(d.$createdAt) > activeAt
      );
      if (stuck.length) {
        note(
          "warn",
          "function",
          `Function "${f.$id}" punya ${stuck.length} deployment tersangkut di status build >${STUCK_MINUTES} menit ` +
            `dan LEBIH BARU dari deployment aktif (terbaru ${stuck[0].$createdAt.slice(0, 19)}, status "${stuck[0].status}") — ` +
            `push terakhir untuk Function ini tidak tuntas.`
        );
      }
    } catch {
      note("warn", "function", `Gagal membaca daftar deployment "${f.$id}" — kesegaran deployment tidak terverifikasi.`);
    }
  }

  if (live.enabled === false) {
    console.log(`  DISABLED    ${f.$id}`);
    note("warn", "function", `Function "${f.$id}" dalam keadaan disabled.`);
  }

  // Function tanpa variabel sama sekali hampir pasti rusak: `getEnv()` di
  // seluruh Function fail-fast saat `databaseId` kosong, dan APPWRITE_DATABASE_ID
  // tidak punya nilai default di kode. Ketahuan 2026-07-29 pada dua Function baru
  // yang berhasil di-deploy tapi akan melempar di setiap eksekusi.
  try {
    const vars = await aw(`/functions/${f.$id}/variables`);
    const keys = (vars.variables || []).map((v) => v.key);
    if (keys.length === 0) {
      console.log(`  NO-VARS     ${f.$id}`);
      note("blocker", "function", `Function "${f.$id}" tidak punya variabel sama sekali — getEnv() akan melempar "Missing required environment variables: databaseId".`);
    } else if (!keys.includes("APPWRITE_DATABASE_ID") && !DB_ID_OPTIONAL_FUNCTIONS.has(f.$id)) {
      console.log(`  NO-DB-ID    ${f.$id}`);
      note("warn", "function", `Function "${f.$id}" tidak punya APPWRITE_DATABASE_ID — hanya aman bila NEXT_PUBLIC_DB_ID diset.`);
    }
  } catch {
    note("warn", "function", `Gagal membaca variabel "${f.$id}".`);
  }
}

// ── Ringkasan ──────────────────────────────────────────────────────────────
const order = { blocker: 0, warn: 1, info: 2 };
problems.sort((a, b) => order[a.severity] - order[b.severity]);

console.log("\n=== RINGKASAN ===");
if (problems.length === 0) {
  console.log("  Tidak ada selisih. Live sama dengan config.");
} else {
  const counts = problems.reduce((m, p) => ({ ...m, [p.severity]: (m[p.severity] || 0) + 1 }), {});
  console.log(`  ${counts.blocker || 0} blocker · ${counts.warn || 0} warning · ${counts.info || 0} info\n`);
  for (const p of problems) {
    const tag = p.severity === "blocker" ? "[BLOCKER]" : p.severity === "warn" ? "[WARN]   " : "[INFO]   ";
    console.log(`  ${tag} (${p.area}) ${p.message}`);
  }
}
console.log("");
