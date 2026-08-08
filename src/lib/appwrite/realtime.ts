/**
 * Appwrite Realtime Helper
 *
 * FORBIDDEN: Do not subscribe to broad private collections.
 * FORBIDDEN: Do not rely on Realtime for authorization — always confirm
 *            final state with a trusted read when needed.
 */
export { client as realtimeClient } from "./client";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;

/**
 * Channel realtime untuk satu tabel.
 *
 * Mengembalikan DUA nama channel, dan itu disengaja.
 *
 * Server 1.9.x memakai penamaan TablesDB (`tables`/`rows`) — REST-nya sudah
 * pindah ke `/tablesdb/{db}/tables` sementara `/databases/{db}/tables` membalas
 * 404, dan seluruh `events` Function di appwrite.config.json memakai bentuk
 * `databases.<db>.tables.<t>.rows.*`. Sementara itu kelima pemanggil di repo ini
 * masih memakai bentuk lama `collections`/`documents`.
 *
 * Saya TIDAK berhasil membuktikan bentuk mana yang benar-benar mengirim event:
 * server menerima kedua nama saat subscribe dan meng-echo-nya kembali di balasan
 * `connected`, jadi balasan itu bukan bukti. Membuktikannya butuh satu tulisan
 * nyata ke database produksi.
 *
 * Karena itu dilanggan keduanya. Appwrite mengizinkan banyak channel dalam satu
 * langganan, channel yang salah hanya diam, dan dengan begitu chat tetap hidup
 * apa pun jawabannya. Setelah terbukti (lihat s8-realtime-verify), sisakan satu
 * saja — cukup ubah di fungsi ini, bukan di lima komponen.
 */
export function tableChannels(table: string): string[] {
  if (!DATABASE_ID) return [];
  return [
    `databases.${DATABASE_ID}.tables.${table}.rows`,
    `databases.${DATABASE_ID}.collections.${table}.documents`,
  ];
}
