#!/usr/bin/env node
/**
 * Audit konfigurasi Google OAuth Appwrite untuk E2E lokal.
 *
 * Tidak membaca atau mencetak secret. Provider credentials di Appwrite bersifat
 * write-only; script ini hanya membuktikan status provider bila API key punya
 * scope project.oauth2.read, platform Web localhost, dan redirect awal ke Google.
 */
import { aw, ENDPOINT, PROJECT } from "./client.mjs";

const LOCALHOST = "localhost";
const SUCCESS_URL = "http://localhost:3000/auth/callback?role=creator";
const FAILURE_URL = "http://localhost:3000/login?error=oauth";
const CHECK_GOOGLE_PAGE = process.argv.includes("--check-google-page");
const APPWRITE_CALLBACK =
  `${ENDPOINT}/account/sessions/oauth2/callback/google/${PROJECT}`;

function ok(label, detail = "") {
  console.log(`OK   ${label}${detail ? `: ${detail}` : ""}`);
}

function warn(label, detail = "") {
  console.log(`WARN ${label}${detail ? `: ${detail}` : ""}`);
}

function fail(label, detail = "") {
  console.log(`FAIL ${label}${detail ? `: ${detail}` : ""}`);
}

async function auditPlatforms() {
  const res = await aw("/project/platforms");
  const webHosts = res.platforms
    .filter((p) => p.type === "web")
    .map((p) => p.hostname)
    .filter(Boolean);

  if (webHosts.includes(LOCALHOST)) {
    ok("Web platform localhost registered");
  } else {
    fail(
      "Web platform localhost missing",
      "run: node appwrite/ops/ensure-localhost-platform.mjs --apply"
    );
  }

  console.log(`INFO Web hosts: ${webHosts.join(", ") || "(none)"}`);
}

async function auditProvider() {
  try {
    const provider = await aw("/project/oauth2/google");
    if (provider.enabled) {
      ok("Google OAuth provider enabled");
    } else {
      fail("Google OAuth provider disabled");
    }

    // Appwrite intentionally returns empty credential fields for reads. Presence
    // cannot be proven here; enabling provider validates credentials server-side.
    console.log(`INFO Provider keys visible: ${Object.keys(provider).join(", ")}`);
  } catch (err) {
    const message = String(err?.message || err);
    if (message.includes("project.oauth2.read")) {
      warn(
        "Cannot inspect Google OAuth provider",
        "API key missing project.oauth2.read"
      );
      return;
    }
    throw err;
  }
}

async function auditOAuthRedirect() {
  const url = new URL(`${ENDPOINT}/account/sessions/oauth2/google`);
  url.searchParams.set("project", PROJECT);
  url.searchParams.set("success", SUCCESS_URL);
  url.searchParams.set("failure", FAILURE_URL);

  const response = await fetch(url, { redirect: "manual" });
  const location = response.headers.get("location") || "";
  const parsed = location ? new URL(location) : null;

  if (response.status >= 300 && response.status < 400 && parsed?.hostname === "accounts.google.com") {
    ok("Appwrite redirects OAuth start to Google");
  } else {
    fail("Appwrite OAuth start did not redirect to Google", `status ${response.status}`);
  }

  if (parsed?.searchParams.has("client_id")) {
    ok("Google redirect contains client_id");
  } else {
    fail("Google redirect missing client_id");
  }

  const redirectUri = parsed?.searchParams.get("redirect_uri");
  if (redirectUri === APPWRITE_CALLBACK) {
    ok("Google redirect_uri matches Appwrite callback");
  } else {
    fail("Google redirect_uri mismatch", redirectUri || "(missing)");
    console.log(`INFO Expected: ${APPWRITE_CALLBACK}`);
  }

  console.log("INFO Google Cloud Authorized redirect URI must be:");
  console.log(`INFO ${APPWRITE_CALLBACK}`);

  if (!CHECK_GOOGLE_PAGE || !location) return;

  const googleResponse = await fetch(location, { redirect: "manual" });
  const text = await googleResponse.text();
  if (text.includes("invalid_client")) {
    fail(
      "Google rejects current Appwrite OAuth client",
      "replace Client ID/Secret in Appwrite provider"
    );
  } else {
    ok("Google does not show invalid_client on initial auth page");
  }
}

await auditPlatforms();
await auditProvider();
await auditOAuthRedirect();
