/**
 * Migrasi variabel Function — perbaikan hasil audit 2026-07-29.
 *
 * Ini script MIGRASI sekali jalan, bukan reconciler. Variabel Function saat ini
 * TIDAK terlacak di repo sama sekali (`appwrite.config.json` tidak punya blok
 * `variables`), jadi nilainya hanya hidup di konsol dan bisa berubah tanpa jejak.
 * Itulah yang membuat `DEFAULT_STORAGE_BUCKET_ID` diam-diam menunjuk bucket yang
 * salah selama berminggu-minggu. Melacaknya secara utuh adalah pekerjaan
 * tersendiri — dicatat sebagai celah yang diketahui di docs.
 *
 * Variabel `secret: true` tidak pernah disentuh script ini: Appwrite tidak
 * mengembalikan nilainya lewat API, jadi menulis ulang berarti menghapusnya.
 *
 *   node appwrite/ops/fix-function-vars.mjs --dry
 *   node appwrite/ops/fix-function-vars.mjs
 */
import { aw } from "./client.mjs";

const DRY = process.argv.includes("--dry");

/** Variabel yang nilainya harus diubah. */
const SET = [
  {
    fn: "validate-and-upload",
    key: "DEFAULT_STORAGE_BUCKET_ID",
    value: "user-files",
    why:
      "Live menunjuk `campaign-assets` — bucket read(\"any\") dengan fileSecurity=false, " +
      "sehingga SETIAP berkas terunggah bisa diunduh publik tanpa login dan seluruh " +
      "Permission.read per-berkas yang dipasang Function diabaikan server. " +
      "`user-files` adalah bucket yang dideklarasikan config dan diharapkan frontend " +
      "(src/lib/appwrite/config.ts:11), dan di situlah kuota per-pengguna ditegakkan.",
  },
];

/** Variabel yang harus dihapus. */
const DELETE = [
  {
    fn: "ai-brief",
    key: "APPWRITE_FUNCTION_API_KEY",
    why:
      "API key 265 karakter tersimpan dengan secret=false — terbaca siapa pun yang punya " +
      "akses baca konsol/API. Sekaligus TIDAK berfungsi: prefix APPWRITE_ reserved, nilai " +
      "injeksi Appwrite selalu menang. Kodenya sudah pakai header x-appwrite-key sejak " +
      "commit 1f6e3ec, jadi menghapusnya tidak mengubah perilaku apa pun. " +
      "PENTING: setelah dihapus, cabut key ini di konsol Appwrite — ia sudah pernah terekspos.",
  },
  // 14 variabel berikut dibuat manual dengan nilai kosong dan berprefix reserved
  // APPWRITE_FUNCTION_*. Appwrite meng-inject nama-nama ini saat runtime dan
  // injeksinya menang, jadi keberadaannya tidak merusak apa pun — tapi ia jebakan:
  // siapa pun yang melihatnya kosong akan tergoda "memperbaikinya".
  ...[
    "get-creator-directory",
    "get-umkm-dashboard-summary",
    "get-umkm-finance-summary",
    "get-umkm-profile",
    "get-creator-dashboard-summary",
    "get-creator-negotiations",
    "get-creator-profile",
  ].flatMap((fn) =>
    ["APPWRITE_FUNCTION_API_ENDPOINT", "APPWRITE_FUNCTION_PROJECT_ID"].map((key) => ({
      fn,
      key,
      why: "Nama reserved, dibuat manual bernilai kosong; Appwrite meng-inject-nya saat runtime.",
    }))
  ),
];

const varsOf = async (fn) => (await aw(`/functions/${fn}/variables`)).variables || [];

let changed = 0;

console.log("=== SET ===");
for (const item of SET) {
  const existing = (await varsOf(item.fn)).find((v) => v.key === item.key);

  if (existing && existing.value === item.value) {
    console.log(`SKIP  ${item.fn}.${item.key} sudah "${item.value}"`);
    continue;
  }
  if (existing?.secret) {
    console.log(`SKIP  ${item.fn}.${item.key} bertanda secret — nilainya tidak terbaca, ubah manual di konsol`);
    continue;
  }

  const from = existing ? `"${existing.value}"` : "<belum ada>";
  if (DRY) {
    console.log(`WOULD ${item.fn}.${item.key}  ${from} -> "${item.value}"`);
    console.log(`      alasan: ${item.why}`);
    continue;
  }

  try {
    if (existing) {
      await aw(`/functions/${item.fn}/variables/${existing.$id}`, {
        method: "PUT",
        body: { key: item.key, value: item.value, secret: false },
      });
    } else {
      await aw(`/functions/${item.fn}/variables`, {
        method: "POST",
        body: { key: item.key, value: item.value, secret: false },
      });
    }
    console.log(`OK    ${item.fn}.${item.key} ${from} -> "${item.value}"`);
    changed++;
  } catch (e) {
    console.log(`ERR   ${item.fn}.${item.key} ${e.message.slice(0, 250)}`);
  }
}

console.log("\n=== DELETE ===");
for (const item of DELETE) {
  const existing = (await varsOf(item.fn)).find((v) => v.key === item.key);
  if (!existing) {
    console.log(`SKIP  ${item.fn}.${item.key} sudah tidak ada`);
    continue;
  }
  if (DRY) {
    console.log(`WOULD ${item.fn}.${item.key} dihapus (secret=${existing.secret}, len=${(existing.value || "").length})`);
    continue;
  }
  try {
    await aw(`/functions/${item.fn}/variables/${existing.$id}`, { method: "DELETE" });
    console.log(`OK    ${item.fn}.${item.key} dihapus`);
    changed++;
  } catch (e) {
    console.log(`ERR   ${item.fn}.${item.key} ${e.message.slice(0, 250)}`);
  }
}

console.log(`\nRingkasan: ${changed} perubahan${DRY ? " (dry-run, tidak ada yang ditulis)" : ""}.`);
if (!DRY && changed > 0)
  console.log("Variabel berlaku pada eksekusi berikutnya — tidak perlu redeploy.");
