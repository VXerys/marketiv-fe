/**
 * sync-scopes.ts — DIPENSIUNKAN 2026-07-27. JANGAN DIPAKAI.
 *
 * Script ini DESTRUKTIF. Menjalankannya pada 2026-07-27 mengosongkan `events`
 * di 8 Function (campaign-published, ai-fraud-precheck, create-order,
 * calculate-campaign-reward, campaign-claimed, create-escrow, release-escrow,
 * send-chat-notification) — mematikan seluruh Alur A yang event-driven.
 *
 * Sebabnya
 * ────────
 * `PUT /v1/functions/{id}` adalah REPLACE, bukan PATCH. SDK node-appwrite
 * membuang argumen `undefined` dari payload, lalu Appwrite mengisi tiap field
 * yang absen dengan DEFAULT-nya. Jadi baris ini:
 *
 *     functions.update(id, name, undefined, undefined, undefined, ..., scopes)
 *
 * tidak berarti "ubah scopes saja". Artinya: "kosongkan events, kosongkan
 * schedule, kosongkan entrypoint & commands, timeout balik ke 15, spesifikasi
 * balik ke default — lalu set scopes".
 *
 * Ironisnya ini penyakit yang sama persis dengan bug yang hendak diperbaikinya:
 * `appwrite push functions` mengosongkan scopes karena alasan replace-semantics
 * yang identik.
 *
 * Penggantinya
 * ────────────
 *     node appwrite/ops/sync-functions.mjs --dry
 *     node appwrite/ops/sync-functions.mjs
 *
 * Pengganti itu GET dulu, menggabungkan config di atas kondisi live, dan
 * mengirim payload LENGKAP — tidak ada field absen, jadi tidak ada default
 * tersembunyi yang bisa menendang masuk.
 *
 * Verifikasi selalu dengan:
 *     node appwrite/ops/drift.mjs
 */

console.error(`
╔══════════════════════════════════════════════════════════════════════╗
║  sync-scopes.ts DIPENSIUNKAN — script ini merusak data.              ║
╚══════════════════════════════════════════════════════════════════════╝

Ia memakai PUT /functions/{id} lewat SDK dengan argumen posisional undefined.
PUT itu REPLACE: setiap field yang tidak dikirim di-reset ke default. Pada
2026-07-27 ini mengosongkan "events" di 8 Function dan mematikan Alur A.

Pakai ini:

  node appwrite/ops/sync-functions.mjs --dry     # lihat rencana
  node appwrite/ops/sync-functions.mjs           # terapkan
  node appwrite/ops/drift.mjs                    # verifikasi

Alasan lengkap ada di komentar kepala file ini.
`);

process.exit(1);
