/**
 * client.mjs — HTTP client mentah untuk Appwrite Admin API.
 *
 * Sengaja TIDAK memakai `node-appwrite`. SDK memakai parameter posisional
 * (18 argumen untuk `functions.update`) dan meng-skip field yang `undefined`
 * dari payload — sementara endpoint-nya PUT (replace). Kombinasi itu membuat
 * "argumen yang tidak diisi" berarti "reset ke default", bukan "biarkan".
 * Itulah yang menghapus `events` di 8 Function pada 2026-07-27.
 *
 * Dengan fetch mentah, payload yang dikirim terlihat apa adanya di kode.
 *
 * Kredensial diambil berurutan:
 *   1. env APPWRITE_ENDPOINT / APPWRITE_PROJECT_ID / APPWRITE_API_KEY
 *   2. ~/.appwrite/prefs.json — profil yang ditunjuk field `current`
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT = process.env.APPWRITE_PROJECT_ID || "69f9d45b00315cb0ec2f";
export const DB = process.env.APPWRITE_DATABASE_ID || "6a4c8598001da3b0d7f0";

function resolveCreds() {
  let endpoint = process.env.APPWRITE_ENDPOINT;
  let key = process.env.APPWRITE_API_KEY;

  if (!key) {
    const p = path.join(os.homedir(), ".appwrite", "prefs.json");
    if (!fs.existsSync(p)) {
      throw new Error(
        `APPWRITE_API_KEY tidak diset dan ${p} tidak ada.\n` +
          `Login dulu: npx appwrite client --key "<API_KEY>"`
      );
    }
    const prefs = JSON.parse(fs.readFileSync(p, "utf8"));
    const profileId = prefs.current;
    const profile = profileId && prefs[profileId];
    if (!profile?.key) {
      throw new Error(
        `Profil "current" (${profileId}) di prefs.json tidak punya field "key".\n` +
          `Set ulang: npx appwrite client --key "<API_KEY>"`
      );
    }
    key = profile.key;
    endpoint ||= profile.endpoint;
  }

  endpoint ||= "https://sgp.cloud.appwrite.io/v1";
  return { endpoint, key };
}

const { endpoint: ENDPOINT, key: KEY } = resolveCreds();
export { ENDPOINT, PROJECT };

export async function aw(pathname, { method = "GET", body, queries } = {}) {
  let url = ENDPOINT + pathname;
  if (queries?.length) {
    const qs = queries
      .map((q) => "queries[]=" + encodeURIComponent(JSON.stringify(q)))
      .join("&");
    url += (url.includes("?") ? "&" : "?") + qs;
  }
  const res = await fetch(url, {
    method,
    headers: {
      "X-Appwrite-Project": PROJECT,
      "X-Appwrite-Key": KEY,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  if (!res.ok) throw new Error(`${res.status} ${method} ${pathname} :: ${text}`);
  return json;
}

export const q = {
  limit: (n) => ({ method: "limit", values: [n] }),
  equal: (a, v) => ({ method: "equal", attribute: a, values: [].concat(v) }),
  orderDesc: (a) => ({ method: "orderDesc", attribute: a, values: [] }),
};

/**
 * Setelan runtime Function — wewenang kita.
 * Berlaku langsung tanpa deploy ulang.
 */
export const SAFE_FIELDS = [
  "events",
  "schedule",
  "execute",
  "timeout",
  "enabled",
  "logging",
];

/**
 * Wewenang TIM BACKEND — jangan diubah dari sini.
 *
 * `scopes` = hak akses/key Function. `entrypoint`, `commands`, `runtime` adalah
 * setelan build yang baru berlaku saat deploy berikutnya. `name` kosmetik tapi
 * ikut dititipkan ke tim backend supaya batasnya satu garis, bukan dua.
 *
 * Ditetapkan user 2026-07-27: kita boleh edit kode Function dan rules
 * collection, tapi push/redeploy dan penambahan key bukan porsi kita.
 */
export const BACKEND_FIELDS = ["scopes", "entrypoint", "commands", "runtime", "name"];

/** Semua field yang dibandingkan drift. */
export const MANAGED_FIELDS = [...SAFE_FIELDS, ...BACKEND_FIELDS];

/**
 * Field yang TIDAK ada di appwrite.config.json. Nilainya harus dibawa ulang
 * dari live saat PUT, kalau tidak Appwrite akan me-reset-nya ke default.
 */
export const PASSTHROUGH_FIELDS = [
  "specification",
  "installationId",
  "providerRepositoryId",
  "providerBranch",
  "providerSilentMode",
  "providerRootDirectory",
];

export function loadConfig() {
  const p = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "..",
    "..",
    "appwrite.config.json"
  );
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
