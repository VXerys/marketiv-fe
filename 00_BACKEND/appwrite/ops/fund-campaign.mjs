/**
 * fund-campaign.mjs — Jalur funding dev-only via `create-escrow` Function.
 *
 * MENGAPA lewat create-escrow, bukan hand-roll credit:
 *   `create-escrow` sudah melakukan increment atomik pada `campaigns.remainingBudget`
 *   + membuat baris ledger deterministik `pending → credit → completed`. Jalur ini
 *   identik dengan yang dipakai Midtrans webhook — sehingga semua guard, ledger,
 *   dan event yang sama juga ter-trigger, dan halaman Keuangan UMKM membaca tabel
 *   `payments` (bukan `transactions`) yang memang disentuh jalur ini.
 *
 * CARA KERJA:
 *   1. Buat baris `payments` (purpose:"campaign", gateway:"manual-dev", status:"pending").
 *   2. PATCH status → "paid": ini yang memicu `create-escrow`.
 *   3. Poll `campaigns.remainingBudget` hingga berubah; cetak hasilnya.
 *
 * GUARD BERURUTAN:
 *   - Campaign ada dan status === "draft" (belum dibayar).
 *   - `remainingBudget > 0` → tolak (dobel-funding aditif tapi tidak diinginkan).
 *   - Sudah ada baris payments `pending`/`paid` → tolak (pakai yang sudah ada).
 *   - Id baris `payments` deterministik "manualfund" + sha256(campaignId) → re-run
 *     yang membuat 409 dari Appwrite ditangkap dan dianggap "sudah ada, skip".
 *
 * SIGNATURE:
 *   node appwrite/ops/fund-campaign.mjs --campaign <id> [--amount <rupiah>]
 *                                        [--dry] [--yes] [--force]
 *
 *   --campaign   Id campaign (wajib)
 *   --amount     Budget override dalam rupiah (default: ambil dari campaigns.budget)
 *   --dry        Tampilkan rencana tanpa menulis apa pun; juga berguna sebagai
 *                inspektor read-only
 *   --yes        Langsung jalankan tanpa konfirmasi interaktif
 *   --force      Izinkan funding saat campaign bukan draft (debug saja)
 */
import { createHash } from "node:crypto";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { aw, DB, q } from "./client.mjs";

// ── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
};

const campaignId = opt("--campaign");
const amountOverride = opt("--amount") ? Number(opt("--amount")) : undefined;
const DRY = flag("--dry");
const YES = flag("--yes");
const FORCE = flag("--force");

if (!campaignId) {
  console.error("ERR  --campaign <id> wajib diisi.");
  process.exit(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const WOULD = DRY ? "WOULD" : "OK   ";
const C = (table) => `/tablesdb/${DB}/tables/${table}/rows`;

function detPaymentId(cid) {
  const digest = createHash("sha256").update(cid).digest("hex");
  return "manualfund" + digest.slice(0, 22);
}

function fmt(n) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

async function poll(campaignId, prevBudget, maxMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await new Promise((r) => setTimeout(r, 2500));
    try {
      const res = await aw(C("campaigns"), { queries: [q.equal("$id", campaignId), q.limit(1)] });
      const doc = (res.rows || res.documents)?.[0];
      if (!doc) break;
      const rb = Number(doc.remainingBudget ?? 0);
      if (rb > prevBudget) {
        console.log(`\nVerifikasi: remainingBudget ${fmt(prevBudget)} → ${fmt(rb)}  ✓`);
        return true;
      }
    } catch (err) {
      console.warn("  (poll gagal, coba lagi):", err.message);
    }
  }
  return false;
}

// ── Main ─────────────────────────────────────────────────────────────────────

console.log("\n=== FUND-CAMPAIGN (dev-only) ===\n");

// 1. Baca campaign
let campaign;
try {
  const res = await aw(C("campaigns"), { queries: [q.equal("$id", campaignId), q.limit(1)] });
  campaign = (res.rows || res.documents)?.[0];
} catch (err) {
  console.error("ERR  Gagal membaca campaign:", err.message);
  process.exit(1);
}

if (!campaign) {
  console.error(`ERR  Campaign "${campaignId}" tidak ditemukan.`);
  process.exit(1);
}

const status = campaign.status ?? "";
const remainingBudget = Number(campaign.remainingBudget ?? 0);
const budget = amountOverride ?? Number(campaign.budget ?? 0);
const umkmId = campaign.umkm_id ?? campaign.umkmId ?? "";

console.log(`  Campaign : ${campaign.title}`);
console.log(`  Status   : ${status}`);
console.log(`  Budget   : ${fmt(budget)}`);
console.log(`  Remaining: ${fmt(remainingBudget)}`);
console.log(`  UMKM     : ${umkmId}`);

// Guard status
if (!FORCE && status !== "draft") {
  console.error(`\nERR  Campaign bukan draft (status="${status}"). Gunakan --force untuk melewati guard ini.`);
  process.exit(1);
}

// Guard dobel-funding
if (remainingBudget > 0) {
  console.error(`\nERR  remainingBudget sudah ${fmt(remainingBudget)}. Campaign sudah punya dana.`);
  console.error("     Gunakan inspect-campaign.mjs untuk memeriksa kondisi terkini.");
  process.exit(1);
}

// 2. Periksa payments yang sudah ada
const paymentId = detPaymentId(campaignId);
let existingPayment;
try {
  const res = await aw(C("payments"), { queries: [q.equal("$id", paymentId), q.limit(1)] });
  existingPayment = (res.rows || res.documents)?.[0];
} catch {
  existingPayment = null;
}

if (existingPayment) {
  const ps = existingPayment.status ?? "";
  if (ps === "paid") {
    console.log(`\nINFO Baris payments "${paymentId}" sudah "paid". Polling remainingBudget...`);
    if (!DRY) {
      const ok = await poll(campaignId, 0);
      if (!ok) {
        console.error("ERR  remainingBudget tidak berubah setelah 20 detik. Periksa log Function create-escrow.");
        process.exit(1);
      }
    }
    process.exit(0);
  }
  if (ps === "pending") {
    console.log(`\nINFO Baris payments "${paymentId}" sudah "pending" — lanjutkan ke PATCH "paid".`);
    // Langsung ke PATCH di bawah
  }
}

if (!existingPayment) {
  // 3a. Buat baris payments baru
  console.log(`\n  Payment ID: ${paymentId} (deterministik)`);
  console.log(`  Amount   : ${fmt(budget)}`);
  console.log(`  Gateway  : manual-dev`);

  if (DRY) {
    console.log(`\n${WOULD} Buat baris payments → PATCH "paid" → poll campaigns.remainingBudget`);
    console.log("\nRingkasan: --dry, tidak ada yang ditulis.");
    process.exit(0);
  }

  if (!YES) {
    const rl = readline.createInterface({ input, output });
    const ans = await rl.question(`\nLanjutkan? Fund ${fmt(budget)} ke campaign "${campaign.title}"? [y/N] `);
    rl.close();
    if (ans.trim().toLowerCase() !== "y") {
      console.log("Dibatalkan.");
      process.exit(0);
    }
  }

  const perms = umkmId
    ? [`read("user:${umkmId}")`, `update("user:${umkmId}")`, `delete("user:${umkmId}")`]
    : [];

  try {
    await aw(C("payments"), {
      method: "POST",
      body: {
        $id: paymentId,
        $permissions: perms,
        userId: umkmId,
        amount: budget,
        fee_amount: 0,
        purpose: "campaign",
        reference_id: campaignId,
        gateway: "manual-dev",
        status: "pending",
      },
    });
    console.log(`OK   Baris payments "${paymentId}" dibuat (pending).`);
  } catch (err) {
    // 409 = deterministik id sudah ada (race / re-run) → baca ulang dan lanjut
    if (err.message?.includes("409")) {
      console.log(`INFO 409 pada create — baris sudah ada, lanjut ke PATCH.`);
    } else {
      console.error("ERR  Gagal membuat baris payments:", err.message);
      process.exit(1);
    }
  }
}

// 3b. PATCH payments → "paid" (ini yang memicu create-escrow)
try {
  await aw(`/tablesdb/${DB}/tables/payments/rows/${paymentId}`, {
    method: "PATCH",
    body: { status: "paid" },
  });
  console.log(`OK   Payment "${paymentId}" → "paid". Menunggu create-escrow...`);
} catch (err) {
  console.error("ERR  Gagal PATCH payments ke paid:", err.message);
  process.exit(1);
}

// 4. Poll sampai remainingBudget naik
const ok = await poll(campaignId, 0);
if (!ok) {
  console.error(
    "\nERR  remainingBudget tidak berubah setelah 20 detik.\n" +
    "     Periksa log Function create-escrow di Appwrite Console → Functions → Executions."
  );
  process.exit(1);
}

console.log("\nRingkasan: Campaign siap diterbitkan (status masih draft — terbitkan dari UI).");
