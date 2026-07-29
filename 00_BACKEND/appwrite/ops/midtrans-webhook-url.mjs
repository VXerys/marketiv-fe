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

console.log(`\nFunction   : ${fn.$id} (${fn.name})`);
console.log(`Enabled    : ${fn.enabled}`);
console.log(`Execute    : ${JSON.stringify(fn.execute)}`);
console.log(`Deployment : ${fn.deployment || "(BELUM ADA — push & aktifkan dulu)"}`);

if (fn.enabled !== true) {
  console.log("\n⚠  Function nonaktif. Midtrans akan menerima error, bukan 200.");
}
if (!Array.isArray(fn.execute) || !fn.execute.includes("any")) {
  console.log(
    "\n⚠  execute bukan [\"any\"]. Midtrans memanggil tanpa sesi Appwrite, jadi\n" +
      "   panggilannya akan ditolak 401 sebelum sampai ke kode."
  );
}

// Appwrite memberi domain per-function saat rule domain dibuat. Kalau belum ada,
// endpoint eksekusi REST tetap bisa dipakai sebagai tujuan notifikasi.
let domains = [];
try {
  const rules = await aw(`/proxy/rules`, {
    queries: [{ method: "equal", attribute: "trigger", values: ["deployment"] }],
  });
  domains = (rules.rules || [])
    .filter((r) => r.deploymentResourceId === FUNCTION_ID || r.functionId === FUNCTION_ID)
    .map((r) => r.domain);
} catch {
  // Endpoint proxy tidak selalu terbuka untuk API key biasa — bukan kegagalan.
}

console.log("\n── Daftarkan salah satu URL berikut di Midtrans ──");
if (domains.length > 0) {
  for (const d of domains) console.log(`  https://${d}/`);
} else {
  console.log("  (domain function tidak terbaca lewat API — salin dari Appwrite Console:");
  console.log("   Functions → midtrans-webhook → Domains)");
}
console.log(`\n  Alternatif REST: ${ENDPOINT}/functions/${FUNCTION_ID}/executions`);
console.log(`  Header wajib  : X-Appwrite-Project: ${PROJECT}`);
console.log(
  "  (Midtrans tidak bisa mengirim header kustom, jadi jalur REST hanya untuk uji manual —\n" +
    "   untuk produksi pakai domain function.)"
);

console.log("\nDashboard Midtrans: Settings → Configuration → Payment Notification URL\n");
