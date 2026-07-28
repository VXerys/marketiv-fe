// Fase 5 (M-3) — cabut read("users") level koleksi pada tabel yang membocorkan
// baris antar-user.
//
// HANYA tabel yang penulisnya SUDAH memasang permission per-baris.
//
// Gelombang 1 (sudah diterapkan): wallets, payments, users, withdrawals,
// user_files, user_storage_usage.
//
// Gelombang 2 (ditambahkan setelah jalur create-nya diperbaiki): orders,
// messages, conversations, offers. Keempatnya kini memasang row perm saat
// create, dan live masih 0 baris — jadi tidak ada pemilik yang bisa terkunci
// dari datanya sendiri.
//
// Gelombang 3 (2026-07-28, prasyarat Sprint 4 Alur B): deliverables, revisions.
// Row perm keduanya sudah dipasang order.service.ts dan sudah ter-deploy lewat
// push tim backend 2026-07-27 — pengecualian gelombang 2 tidak berlaku lagi.
//
// Gelombang 4 (2026-07-28): bucket `user-files`. Bukan tabel — endpoint dan
// bentuk payloadnya berbeda, jadi ditangani blok BUCKET_TARGETS terpisah di
// bawah.
//
// Jalankan dengan --dry untuk melihat rencana tanpa menulis.
import { aw, DB } from "./client.mjs";

const DRY = process.argv.includes("--dry");

const TARGETS = [
  {
    id: "wallets",
    permissions: [],
    rowSecurity: true, // saat ini false → row perm diabaikan server
    why: 'saldo semua user terbaca; rowSecurity=false membuat Permission.read per-baris diabaikan',
  },
  {
    id: "payments",
    permissions: [],
    rowSecurity: true,
    why: "snap_token, redirect_url, nominal semua user terbaca",
  },
  {
    id: "users",
    permissions: [],
    rowSecurity: true,
    why: "email & telepon semua user terbaca",
  },
  {
    id: "withdrawals",
    permissions: ['create("users")'],
    rowSecurity: true,
    why: "rekening & nominal penarikan semua user terbaca",
  },
  {
    id: "user_files",
    permissions: [],
    rowSecurity: true,
    why: "daftar berkas semua user terbaca",
  },
  {
    id: "user_storage_usage",
    permissions: [],
    rowSecurity: true,
    why: "kuota & pemakaian semua user terbaca",
  },

  // ── Gelombang 2 ────────────────────────────────────────────────────────
  {
    id: "conversations",
    permissions: ['create("users")'],
    rowSecurity: true,
    why: "daftar lawan bicara semua user terbaca; row perm dipasang chat.service.ts:123",
  },
  {
    id: "messages",
    permissions: ['create("users")'],
    rowSecurity: true,
    why: "SELURUH isi chat semua user terbaca; row perm dipasang chat.service.ts:160",
  },
  {
    id: "offers",
    permissions: ['create("users")'],
    rowSecurity: true,
    why: "nilai & isi penawaran semua user terbaca; row perm dipasang offer.service.ts:147",
  },
  {
    id: "orders",
    // Tidak ada create("users"): baris orders hanya dibuat Function create-order,
    // tidak pernah dari browser.
    permissions: [],
    rowSecurity: true,
    why: "nominal & pihak order semua user terbaca; row perm dipasang create-order:32",
  },

  // ── Gelombang 3 ────────────────────────────────────────────────────────
  {
    id: "deliverables",
    permissions: ['create("users")'],
    rowSecurity: true,
    why:
      'update("users") level koleksi = SIAPA PUN yang login bisa menyetujui deliverable siapa pun, ' +
      "dan update itulah yang memicu release-escrow mencairkan dana; row perm dipasang order.service.ts:240",
  },
  {
    id: "revisions",
    permissions: ['create("users")'],
    rowSecurity: true,
    why: "isi & riwayat revisi semua order terbaca dan bisa diubah siapa pun; row perm dipasang order.service.ts:337",
  },
];

/**
 * Bucket storage. Dipisah dari TARGETS karena endpointnya `/storage/buckets/{id}`
 * dan payload PUT-nya butuh `fileSecurity` + `enabled`, bukan `rowSecurity`.
 */
const BUCKET_TARGETS = [
  {
    id: "user-files",
    permissions: ['create("users")'],
    fileSecurity: true,
    why:
      'read("users") level bucket = SIAPA PUN yang login bisa mengunduh berkas siapa pun, ' +
      "termasuk deliverable order orang lain; permission per-berkas dipasang validate-and-upload:44",
  },
];

for (const t of TARGETS) {
  const live = await aw(`/tablesdb/${DB}/tables/${t.id}`);
  const before = `perms=${JSON.stringify(live.$permissions)} rowSecurity=${live.rowSecurity}`;
  const after = `perms=${JSON.stringify(t.permissions)} rowSecurity=${t.rowSecurity}`;

  if (
    JSON.stringify(live.$permissions) === JSON.stringify(t.permissions) &&
    live.rowSecurity === t.rowSecurity
  ) {
    console.log(`SKIP ${t.id.padEnd(20)} sudah sesuai`);
    continue;
  }

  if (DRY) {
    console.log(`WOULD ${t.id.padEnd(20)} ${before}  ->  ${after}\n      alasan: ${t.why}`);
    continue;
  }

  try {
    const r = await aw(`/tablesdb/${DB}/tables/${t.id}`, {
      method: "PUT",
      body: {
        name: live.name,
        permissions: t.permissions,
        rowSecurity: t.rowSecurity,
        enabled: live.enabled,
      },
    });
    console.log(
      `OK   ${t.id.padEnd(20)} perms=${JSON.stringify(r.$permissions)} rowSecurity=${r.rowSecurity}`
    );
  } catch (e) {
    console.log(`ERR  ${t.id.padEnd(20)} ${e.message.slice(0, 300)}`);
  }
}

for (const t of BUCKET_TARGETS) {
  const live = await aw(`/storage/buckets/${t.id}`);
  const before = `perms=${JSON.stringify(live.$permissions)} fileSecurity=${live.fileSecurity}`;
  const after = `perms=${JSON.stringify(t.permissions)} fileSecurity=${t.fileSecurity}`;

  if (
    JSON.stringify(live.$permissions) === JSON.stringify(t.permissions) &&
    live.fileSecurity === t.fileSecurity
  ) {
    console.log(`SKIP bucket:${t.id.padEnd(13)} sudah sesuai`);
    continue;
  }

  if (DRY) {
    console.log(`WOULD bucket:${t.id.padEnd(13)} ${before}  ->  ${after}
      alasan: ${t.why}`);
    continue;
  }

  try {
    // PUT bersifat replace — field yang tidak dikirim akan di-reset ke default.
    // Karena itu seluruh setelan bucket dibawa ulang dari live apa adanya,
    // kecuali dua yang memang sedang diubah. Pelajaran yang sama dengan
    // insiden `appwrite push functions` 2026-07-27.
    const r = await aw(`/storage/buckets/${t.id}`, {
      method: "PUT",
      body: {
        name: live.name,
        permissions: t.permissions,
        fileSecurity: t.fileSecurity,
        enabled: live.enabled,
        maximumFileSize: live.maximumFileSize,
        allowedFileExtensions: live.allowedFileExtensions,
        compression: live.compression,
        encryption: live.encryption,
        antivirus: live.antivirus,
      },
    });
    console.log(
      `OK   bucket:${t.id.padEnd(13)} perms=${JSON.stringify(r.$permissions)} fileSecurity=${r.fileSecurity}`
    );
  } catch (e) {
    console.log(`ERR  bucket:${t.id.padEnd(13)} ${e.message.slice(0, 300)}`);
  }
}
