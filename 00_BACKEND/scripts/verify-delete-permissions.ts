/**
 * verify-delete-permissions.ts
 *
 * Verifikasi bahwa dokumen existing sudah punya Permission.delete.
 * Cek 1 dokumen pertama dari tiap koleksi target.
 *
 * Penggunaan:
 *   APPWRITE_ENDPOINT=<endpoint> \
 *   APPWRITE_PROJECT_ID=<project-id> \
 *   APPWRITE_API_KEY=<api-key> \
 *   npx tsx scripts/verify-delete-permissions.ts
 *
 * Atau pakai .env (NEXT_PUBLIC_APPWRITE_*).
 */

import { Client, Databases, Query } from "node-appwrite";

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DB_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a4c8598001da3b0d7f0";

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("❌ Butuh APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
  process.exit(1);
}

const TARGETS = [
  { id: "campaigns",       label: "Campaigns" },
  { id: "rate_cards",      label: "Rate Cards" },
  { id: "offers",          label: "Offers" },
  { id: "campaign_assets", label: "Campaign Assets" },
];

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

async function main() {
  console.log("🔍 Verifikasi Permission.delete\n");

  let allPass = true;

  for (const t of TARGETS) {
    process.stdout.write(`  ${t.label} (${t.id})... `);

    try {
      const res = await databases.listDocuments(DB_ID, t.id, [Query.limit(1)]);

      if (res.documents.length === 0) {
        console.log("⚠️  kosong — tidak ada dokumen untuk dicek");
        continue;
      }

      const doc = res.documents[0];
      const perms: string[] = doc.$permissions || [];
      const hasDelete = perms.some((p: string) => p.startsWith('delete('));

      if (hasDelete) {
        console.log(`✅ ${doc.$id} → ${perms.filter(p => p.startsWith('delete(')).join(', ')}`);
      } else {
        console.log(`❌ ${doc.$id} → TIDAK ADA delete permission`);
        console.log(`    Permissions: ${JSON.stringify(perms)}`);
        allPass = false;
      }
    } catch (err) {
      console.log(`❌ Error: ${(err as Error).message}`);
      allPass = false;
    }
  }

  console.log(`\n── Hasil ──`);
  if (allPass) {
    console.log("✅ SEMUA koleksi dengan dokumen sudah punya Permission.delete");
  } else {
    console.log("❌ Ada koleksi yang belum punya Permission.delete — jalankan backfill");
  }
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
