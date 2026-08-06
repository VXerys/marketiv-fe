#!/usr/bin/env node
/**
 * Tambah platform Web localhost untuk E2E lokal Appwrite.
 *
 * Idempoten: bila hostname localhost sudah ada, script hanya mencetak status.
 * Default dry-run. Pakai --apply untuk menulis ke Appwrite live.
 */
import { aw } from "./client.mjs";

const HOSTNAME = "localhost";
const PLATFORM_ID = "marketiv_localhost";
const APPLY = process.argv.includes("--apply");

const existing = await aw("/project/platforms");
const found = existing.platforms.find(
  (p) => p.type === "web" && p.hostname === HOSTNAME
);

if (found) {
  console.log(`OK localhost platform already registered (${found.$id})`);
} else {
  if (!APPLY) {
    console.log(`DRY would register Web platform ${HOSTNAME} (${PLATFORM_ID})`);
    console.log("DRY rerun with --apply to write live config");
    process.exit(0);
  }

  const created = await aw("/project/platforms/web", {
    method: "POST",
    body: {
      platformId: PLATFORM_ID,
      name: "Marketiv Localhost",
      hostname: HOSTNAME,
    },
  });
  console.log(`OK localhost platform registered (${created.$id})`);
}
