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
// MASIH DIKECUALIKAN: `deliverables` dan `revisions`. Row perm-nya baru
// ditambahkan di order.service.ts dan belum ter-deploy; ketatkan menyusul.
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
