import { Account, Client, Users } from "node-appwrite";

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 256;

export default async ({ req, res, error }) => {
  try {
    const env = getEnv(req);
    const payload = getPayload(req);
    const userId = String(payload.userId || "").trim();
    const otpCode = String(payload.otpCode || "").trim();
    const password = String(payload.password || "");

    const validationError = validateInput({ userId, otpCode, password });
    if (validationError) {
      return json(res, { success: false, error: validationError }, 400);
    }

    const account = createPublicAccountClient(env);
    const users = createUsersClient(env);

    let session = null;
    try {
      session = await account.createSession(userId, otpCode);
    } catch {
      return json(res, { success: false, error: "Kode OTP salah atau kedaluwarsa. Minta kode baru." }, 401);
    }

    try {
      await users.updatePassword(userId, password);
    } finally {
      if (session?.$id) {
        try {
          await users.deleteSession(userId, session.$id);
        } catch {
          // Session hanya dipakai untuk membuktikan OTP. Gagal hapus tidak boleh
          // menggagalkan reset password yang sudah terverifikasi.
        }
      }
    }

    return json(res, { success: true });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { success: false, error: "Gagal mengatur ulang password. Coba lagi." }, 500);
  }
};

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createAdminClient(env) {
  return new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
}

function createPublicAccountClient(env) {
  const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId);
  return new Account(client);
}

function createUsersClient(env) {
  return new Users(createAdminClient(env));
}

function getPayload(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function validateInput({ userId, otpCode, password }) {
  if (!userId) return "User ID wajib diisi.";
  if (!/^\d{6}$/.test(otpCode)) return "Masukkan kode OTP 6 digit.";
  if (!password) return "Password baru wajib diisi.";
  if (password.length < PASSWORD_MIN) return `Password minimal ${PASSWORD_MIN} karakter.`;
  if (password.length > PASSWORD_MAX) return `Password maksimal ${PASSWORD_MAX} karakter.`;
  return "";
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
