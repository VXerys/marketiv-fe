/**
 * Inspeksi baris `conversations` di live — mencari sebab "Gagal menyimpan data"
 * saat UMKM menekan "Masuk ke Ruang Negosiasi".
 *
 * `conversations` adalah kombinasi yang tidak memaafkan:
 *
 *   - permission level tabel HANYA `create("users")` — tidak ada `read`, jadi
 *     seluruh akses baca bergantung pada permission per-baris; dan
 *   - unique index `idx_umkm_creator` (umkm_id + creator_id) — satu pasangan
 *     UMKM–kreator hanya boleh punya satu baris, selamanya.
 *
 * Kalau permission sebuah baris tidak menyebut UMKM-nya, baris itu tidak
 * terlihat oleh klien SEKALIGUS memblokir pembuatan baris baru lewat unique
 * index. Pasangan itu terkunci permanen, dan yang muncul di layar cuma
 * "Gagal menyimpan data. Coba lagi.".
 *
 * Skrip ini memakai API key admin, jadi ia melihat baris yang klien tidak bisa
 * lihat. Mode baku TIDAK PERNAH menulis.
 *
 *   node appwrite/ops/inspect-conversations.mjs          # laporan saja
 *   node appwrite/ops/inspect-conversations.mjs --fix    # tulis ulang permission yang rusak
 */
import { aw, DB } from "./client.mjs";

const FIX = process.argv.includes("--fix");
const TABLE = "conversations";

/** Bentuk user ID Appwrite. Cermin APPWRITE_USER_ID di conversation-appwrite.service.ts. */
const USER_ID = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,35}$/;

/** Cermin participantPermissions() di conversation-appwrite.service.ts. */
const expectedPermissions = (umkmId, creatorId) => [
  `read("user:${umkmId}")`,
  `read("user:${creatorId}")`,
  `update("user:${umkmId}")`,
  `update("user:${creatorId}")`,
];

async function listAllRows() {
  const out = [];
  let offset = 0;
  for (;;) {
    const res = await aw(`/tablesdb/${DB}/tables/${TABLE}/rows`, {
      queries: [
        { method: "limit", values: [100] },
        { method: "offset", values: [offset] },
      ],
    });
    const items = res.rows || res.documents || [];
    out.push(...items);
    if (items.length === 0 || out.length >= (res.total ?? out.length)) break;
    offset += items.length;
  }
  return out;
}

const rows = await listAllRows();
console.log(`\n=== CONVERSATIONS (live ${rows.length} baris) ===\n`);

const brokenPerms = [];
const badIds = [];

for (const row of rows) {
  const umkmId = String(row.umkm_id ?? "");
  const creatorId = String(row.creator_id ?? "");
  const perms = row.$permissions || [];

  const idProblems = [];
  if (!USER_ID.test(umkmId)) idProblems.push(`umkm_id "${umkmId}" bukan user ID Appwrite yang sah`);
  if (!USER_ID.test(creatorId))
    idProblems.push(`creator_id "${creatorId}" bukan user ID Appwrite yang sah`);

  // Yang diperiksa keanggotaan, bukan kesamaan urutan: baris boleh saja punya
  // permission tambahan (mis. delete admin) tanpa dianggap rusak.
  const missing = expectedPermissions(umkmId, creatorId).filter((p) => !perms.includes(p));

  const status = idProblems.length ? "BAD-ID " : missing.length ? "BROKEN " : "ok     ";
  console.log(`  ${status} ${row.$id}`);
  console.log(`          umkm_id=${umkmId}  creator_id=${creatorId}  dibuat=${row.$createdAt}`);
  console.log(`          perms=${JSON.stringify(perms)}`);
  for (const p of idProblems) console.log(`          ⚠ ${p}`);
  if (missing.length) console.log(`          ⚠ permission hilang: ${JSON.stringify(missing)}`);

  if (idProblems.length) badIds.push({ row, idProblems });
  else if (missing.length) brokenPerms.push({ row, umkmId, creatorId, missing });
}

console.log(`\n=== RINGKASAN ===`);
console.log(`  ${rows.length} baris · ${brokenPerms.length} permission rusak · ${badIds.length} ID tidak sah`);

if (badIds.length) {
  console.log(
    `\n  ID tidak sah TIDAK bisa diperbaiki skrip ini — permission Appwrite tidak bisa\n` +
      `  menunjuk user yang formatnya salah. Perbaiki dulu creator_profiles.userId /\n` +
      `  umkm_profiles.userId yang bersangkutan, atau hapus baris percakapan uji cobanya.`
  );
}

if (!brokenPerms.length) {
  console.log(`\n  Tidak ada permission baris yang perlu diperbaiki.\n`);
} else if (!FIX) {
  console.log(`\n  Jalankan ulang dengan --fix untuk menulis ulang ${brokenPerms.length} baris di atas.\n`);
} else {
  console.log(`\n=== FIX ===`);
  for (const { row, umkmId, creatorId } of brokenPerms) {
    // PATCH row: kirim `permissions` saja, `data` dibiarkan supaya isi barisnya
    // tidak tersentuh. Berbeda dengan PUT /tables/{id} yang bersifat replace.
    try {
      const r = await aw(`/tablesdb/${DB}/tables/${TABLE}/rows/${row.$id}`, {
        method: "PATCH",
        body: { permissions: expectedPermissions(umkmId, creatorId) },
      });
      console.log(`  OK   ${row.$id} perms=${JSON.stringify(r.$permissions)}`);
    } catch (e) {
      console.log(`  ERR  ${row.$id} ${String(e.message).slice(0, 300)}`);
    }
  }
  console.log();
}
