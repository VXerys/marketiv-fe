/**
 * midtrans-webhook-url.mjs — cetak URL yang harus didaftarkan sebagai
 * "Payment Notification URL" di dashboard Midtrans.
 *
 * Kenapa ada skripnya: sepanjang integrasi, `create-payment` selalu berhasil
 * membuat transaksi Snap, jadi pembayaran terlihat sukses dari sisi pengguna.
 * Yang menentukan alurnya lanjut atau tidak adalah `midtrans-webhook` — dialah
 * yang menandai `payments.status = "paid"`, memicu `create-escrow`, mengisi
 * `campaigns.remainingBudget`, dan membuat campaign bisa diterbitkan. Kalau
 * URL-nya tidak terdaftar, seluruh rantai itu diam tanpa satu pun pesan error:
 * campaign mandek sebagai draft dengan pesan "Dana campaign belum masuk".
 *
 * Read-only — hanya memanggil GET.
 *
 * Pakai:
 *   node 00_BACKEND/appwrite/ops/midtrans-webhook-url.mjs
 */
import { aw, ENDPOINT, PROJECT } from "./client.mjs";

const FUNCTION_ID = "midtrans-webhook";

const fn = await aw(`/functions/${FUNCTION_ID}`);

// Server 1.9.x memakai `deploymentId`; nama lamanya `deployment`. Rantai
// fallback ini sama dengan check-deployments.mjs — membacanya dari satu field
// saja menghasilkan laporan "BELUM ADA" untuk Function yang sebenarnya aktif.
const activeDeployment = fn.deploymentId || fn.deployment || fn.latestDeploymentId;

console.log(`\nFunction   : ${fn.$id} (${fn.name})`);
console.log(`Enabled    : ${fn.enabled}`);
console.log(`Execute    : ${JSON.stringify(fn.execute)}`);
console.log(`Deployment : ${activeDeployment || "(BELUM ADA — push & aktifkan dulu)"}`);

if (fn.enabled !== true) {
  console.log("\n⚠  Function nonaktif. Midtrans akan menerima error, bukan 200.");
}
if (!Array.isArray(fn.execute) || !fn.execute.includes("any")) {
  console.log(
    "\n⚠  execute bukan [\"any\"]. Midtrans memanggil tanpa sesi Appwrite, jadi\n" +
      "   panggilannya akan ditolak 401 sebelum sampai ke kode."
  );
}

/**
 * Domain per-function tinggal di `/proxy/rules`.
 *
 * Sengaja TANPA query: `resourceId`/`trigger` bukan atribut yang bisa di-query
 * di schema rules (400 "Attribute not found in schema"), dan panggilan yang
 * gagal itu tertelan catch sehingga hasilnya terbaca "tidak ada domain" —
 * padahal domainnya ada. Difilter di sisi klien saja; jumlah rule-nya kecil.
 */
let domains = [];
let rulesReadable = true;
try {
  const rules = await aw(`/proxy/rules`);
  domains = (rules.rules || [])
    .filter((r) => r.deploymentResourceId === FUNCTION_ID)
    .map((r) => r.domain);
} catch (err) {
  rulesReadable = false;
  console.log(`\n⚠  /proxy/rules tidak terbaca: ${String(err.message).slice(0, 120)}`);
}

console.log("\n── Daftarkan salah satu URL berikut di Midtrans ──");
if (domains.length > 0) {
  for (const d of domains) console.log(`  https://${d}/`);
} else if (rulesReadable) {
  console.log("  (Function ini BELUM punya domain sama sekali.)");
  console.log("  Buat dulu di Appwrite Console → Functions → midtrans-webhook → Domains,");
  console.log("  lalu jalankan skrip ini lagi untuk menyalin URL-nya.");
} else {
  console.log("  (tidak terbaca — salin dari Appwrite Console:");
  console.log("   Functions → midtrans-webhook → Domains)");
}
console.log(`\n  Alternatif REST: ${ENDPOINT}/functions/${FUNCTION_ID}/executions`);
console.log(`  Header wajib  : X-Appwrite-Project: ${PROJECT}`);
console.log(
  "  (Midtrans tidak bisa mengirim header kustom, jadi jalur REST hanya untuk uji manual —\n" +
    "   untuk produksi pakai domain function.)"
);

console.log("\nDashboard Midtrans: Settings → Configuration → Payment Notification URL\n");
