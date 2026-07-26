/**
 * backfill-delete-permissions.ts
 *
 * Backfill `Permission.delete(Role.user(ownerId))` ke dokumen existing
 * yang belum punya hak hapus.
 *
 * Koleksi target: campaigns, rate_cards, offers, campaign_assets
 *
 * Penggunaan:
 *   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1 \
 *   APPWRITE_PROJECT_ID=<project-id> \
 *   APPWRITE_API_KEY=<api-key-dengan-scope-documents.read+documents.write> \
 *   npx tsx scripts/backfill-delete-permissions.ts
 *
 * Prasyarat:
 *   - node-appwrite terinstall
 *   - API key dengan scopes: `documents.read`, `documents.write`
 */

import { Client, Databases, Permission, Role, Query } from "node-appwrite";

const ENDPOINT = process.env.APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!ENDPOINT || !PROJECT_ID || !API_KEY) {
  console.error("❌ Butuh APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
  process.exit(1);
}

const DB_ID = process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID || "6a4c8598001da3b0d7f0";

interface Target {
  collectionId: string;
  ownerField: string | null;
  label: string;
}

const TARGETS: Target[] = [
  { collectionId: "campaigns",        ownerField: "umkmId",    label: "Campaigns" },
  { collectionId: "rate_cards",       ownerField: "creatorId", label: "Rate Cards" },
  { collectionId: "offers",           ownerField: "umkmId",    label: "Offers" },
  { collectionId: "campaign_assets",  ownerField: null,        label: "Campaign Assets" },
];

const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

const databases = new Databases(client);

/**
 * Cek apakah `$permissions` sudah mengandung Permission.delete untuk userId.
 */
function hasDeletePermission(perms: string[], userId: string): boolean {
  const target = `delete("user:${userId}")`;
  return perms.some((p) => p === target);
}

/**
 * Backfill dokumen di satu koleksi.
 */
async function backfillCollection(target: Target): Promise<{ updated: number; skipped: number; error: number }> {
  let updated = 0;
  let skipped = 0;
  let error = 0;
  let offset = 0;
  const LIMIT = 100;

  console.log(`\n── ${target.label} (${target.collectionId}) ──`);

  while (true) {
    let docs: any[];
    try {
      const res = await databases.listDocuments(DB_ID, target.collectionId, [
        Query.limit(LIMIT),
        Query.offset(offset),
      ]);
      docs = res.documents;
    } catch (err) {
      console.error(`  ✗ Gagal list ${target.collectionId} offset=${offset}:`, (err as Error).message);
      error++;
      break;
    }

    if (docs.length === 0) break;

    for (const doc of docs) {
      const ownerId = target.ownerField ? doc[target.ownerField] : null;

      // Untuk campaign_assets, ownerId dari campaign lookup
      let uid = ownerId;
      if (target.collectionId === "campaign_assets" && doc.campaignId) {
        try {
          const campaign = await databases.getDocument(DB_ID, "campaigns", doc.campaignId);
          uid = campaign.umkmId;
        } catch {
          console.warn(`  ⚠ campaign_assets ${doc.$id}: campaign ${doc.campaignId} tak ditemukan, lewati`);
          skipped++;
          continue;
        }
      }

      if (!uid) {
        skipped++;
        continue;
      }

      const existingPerms: string[] = doc.$permissions || [];
      if (hasDeletePermission(existingPerms, uid)) {
        skipped++;
        continue;
      }

      const newPerms = [
        ...existingPerms,
        `delete("user:${uid}")`,
      ];

      try {
        await databases.updateDocument(DB_ID, target.collectionId, doc.$id, {}, newPerms);
        updated++;
        if (updated % 20 === 0) process.stdout.write(".");  // progress dot
      } catch (err) {
        console.error(`\n  ✗ Gagal update ${target.collectionId}/${doc.$id}:`, (err as Error).message);
        error++;
      }
    }

    offset += LIMIT;
  }

  console.log(`\n  ✓ ${updated} updated, ${skipped} skipped, ${error} error`);
  return { updated, skipped, error };
}

async function main() {
  console.log("🔧 Backfill Permission.delete — mulai\n");
  console.log(`Endpoint: ${ENDPOINT}`);
  console.log(`Project:  ${PROJECT_ID}`);
  console.log(`Database: ${DB_ID}\n`);

  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalError = 0;

  for (const target of TARGETS) {
    const result = await backfillCollection(target);
    totalUpdated += result.updated;
    totalSkipped += result.skipped;
    totalError += result.error;
  }

  console.log(`\n── Selesai ──`);
  console.log(`Total: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalError} error`);

  if (totalError > 0) process.exit(1);
}

main().catch((err) => {
  console.error("❌ Fatal:", err);
  process.exit(1);
});
