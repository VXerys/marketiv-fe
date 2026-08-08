#!/usr/bin/env node
/**
 * Konfigurasi ulang provider Google OAuth Appwrite.
 *
 * Membutuhkan API key dengan scope project.oauth2.write. Credential Google
 * dibaca dari env dan tidak pernah dicetak.
 *
 *   GOOGLE_OAUTH_CLIENT_ID=... GOOGLE_OAUTH_CLIENT_SECRET=... \
 *     node appwrite/ops/configure-google-oauth.mjs --apply
 */
import { aw, ENDPOINT, PROJECT } from "./client.mjs";

const APPLY = process.argv.includes("--apply");
const DISABLE = process.argv.includes("--disable");
const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const PROMPT = (process.env.GOOGLE_OAUTH_PROMPT || "select_account")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const CALLBACK =
  `${ENDPOINT}/account/sessions/oauth2/callback/google/${PROJECT}`;

function requireCredentials() {
  if (DISABLE) return;
  const missing = [];
  if (!CLIENT_ID) missing.push("GOOGLE_OAUTH_CLIENT_ID");
  if (!CLIENT_SECRET) missing.push("GOOGLE_OAUTH_CLIENT_SECRET");
  if (missing.length > 0 && APPLY) {
    throw new Error(`Missing env: ${missing.join(", ")}`);
  }
  return missing;
}

function payload() {
  if (DISABLE) return { enabled: false };
  return {
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    enabled: true,
    prompt: PROMPT,
  };
}

console.log("INFO Google Cloud Authorized redirect URI must be:");
console.log(`INFO ${CALLBACK}`);

const missing = requireCredentials();

if (!APPLY) {
  if (missing?.length) {
    console.log(`DRY missing env for apply: ${missing.join(", ")}`);
  }
  console.log(
    `DRY would ${DISABLE ? "disable" : "enable/update"} Appwrite Google OAuth provider`
  );
  console.log("DRY rerun with --apply to write live config");
  process.exit(0);
}

try {
  const result = await aw("/project/oauth2/google", {
    method: "PATCH",
    body: payload(),
  });
  console.log(
    `OK Google OAuth provider ${result.enabled ? "enabled" : "disabled"}`
  );
} catch (err) {
  const message = String(err?.message || err);
  if (message.includes("project.oauth2.write")) {
    throw new Error(
      "API key missing project.oauth2.write. Create/use Appwrite API key with project OAuth2 write scope."
    );
  }
  throw err;
}
