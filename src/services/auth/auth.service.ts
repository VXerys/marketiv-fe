import { ID, AppwriteException, OAuthProvider } from "appwrite";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { AUTH_CONFIG } from "@/config/auth.config";
import { mockDelay } from "@/lib/mock-delay";
import { account } from "@/lib/appwrite/account";
import { executeFunction, FUNCTION_IDS } from "@/lib/appwrite/functions";
import { parseOrErrors } from "@/lib/validations/to-field-errors";
import {
  loginSchema,
  registerUmkmSchema,
  registerCreatorSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type LoginInput,
  type RegisterUmkmInput,
  type RegisterCreatorInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validations/auth.schema";
import {
  ok,
  fail,
  failValidation,
  mapWriteErrorCode,
  noData,
} from "@/services/shared/service-result";
import {
  getSession,
  getMockSessionUser,
  setMockRole,
  type SessionUser,
} from "./session.service";
import { clearOnboardingSkip } from "@/lib/onboarding-skip";
import type { ServiceResult, ServiceErrorCode, UserRole } from "@/types/domain";

/**
 * Auth facade — register, login, pemulihan password, OAuth.
 *
 * Pasangan session.service.ts, yang hanya menjawab "siapa yang login sekarang".
 * Arah import satu arah (auth → session), jadi tidak ada siklus lewat
 * service-result.ts:requireUserId yang mengimpor session.service.
 *
 * Komponen TIDAK boleh memanggil `account` langsung (R1).
 */

/** Prefs yang dibaca `create-user-profile` untuk membentuk baris users + profil. */
interface ProfilePrefs {
  role: UserRole;
  businessName?: string;
  category?: string;
  phone?: string;
  displayName?: string;
}

export interface RegisterOutcome {
  user: SessionUser;
  /**
   * false ⇒ akun Auth dan sesi SUDAH terbentuk, tapi baris `users`/profil belum.
   * Ini state normal hari ini: `create-user-profile` belum punya `execute` untuk
   * role `users` (handoff-auth-sprint6.md §A-1).
   */
  profileProvisioned: boolean;
  provisionErrorCode?: ServiceErrorCode;
}

/**
 * Pesan yang bisa dibaca manusia untuk kegagalan Appwrite Auth.
 *
 * Yang dispesialisasi HANYA teks. `code` selalu datang dari mapWriteErrorCode —
 * kontrak repo: UI bercabang di `code`, tidak pernah mem-parse `error`.
 */
function authMessage(err: unknown, fallback: string): string {
  const type = err instanceof AppwriteException ? err.type : "";
  switch (type) {
    case "user_already_exists":
    case "user_email_already_exists":
      return "Email ini sudah terdaftar. Silakan login atau gunakan email lain.";
    case "user_invalid_credentials":
      return "Email atau password salah.";
    case "user_blocked":
      return "Akun kamu ditangguhkan. Hubungi admin Marketiv.";
    case "user_password_mismatch":
      return "Konfirmasi password tidak sama.";
    case "password_recently_used":
    case "user_password_recently_used":
      return "Password ini pernah kamu pakai. Gunakan password lain.";
    case "user_invalid_token":
      return "Kode salah atau sudah kedaluwarsa. Minta kode baru.";
    case "general_rate_limit_exceeded":
      return "Terlalu banyak percobaan. Coba lagi beberapa menit lagi.";
    default:
      return fallback;
  }
}

const mockRoleFromEmail = (email: string): UserRole => {
  const e = email.toLowerCase();
  if (e.includes("creator") || e.includes("kreator")) return "creator";
  if (e.includes("admin")) return "admin";
  return "umkm";
};

// ---------------------------------------------------------------------------
// Provisioning profil
// ---------------------------------------------------------------------------

/**
 * Jalankan `create-user-profile` untuk akun yang sedang login.
 *
 * Tanpa argumen dengan sengaja: ia membaca `$id` dan `prefs` dari akun Auth
 * sendiri, sehingga satu implementasi melayani tiga pemanggil — akhir register,
 * tombol "coba lagi" di UI, dan self-heal saat login berikutnya.
 *
 * Function-nya idempoten (ensureUserMirror/ensureUmkmProfile/ensureCreatorProfile/
 * ensureStorageUsage semuanya cek-dulu-baru-tulis), jadi memanggilnya berkali-kali
 * aman.
 */
export async function provisionUserProfile(): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(200);
    return ok(null);
  }

  try {
    const authUser = await account.get();
    const prefs = authUser.prefs as Record<string, unknown> | undefined;
    // Bentuk payload meniru objek user event Appwrite, karena Function membaca
    // keduanya lewat jalur yang sama (`getEventUser`):
    //   - `role` di level atas DAN di prefs — `user.role || user.prefs?.role`
    //   - `email` → ditulis apa adanya ke kolom `users.email`
    //   - `name`  → fallback `displayName` creator_profiles saat prefs kosong
    // Tanpa email & name, kedua kolom itu tersimpan sebagai string kosong.
    await executeFunction(FUNCTION_IDS.createUserProfile, {
      $id: authUser.$id,
      role: prefs?.role,
      email: authUser.email,
      name: authUser.name,
      phone: authUser.phone,
      prefs,
    });
    return ok(null);
  } catch (err) {
    const code = mapWriteErrorCode(err);
    return fail(
      code === "auth" || code === "forbidden"
        ? "Profil belum bisa dibuat otomatis — izin Function create-user-profile belum aktif. Hubungi admin Marketiv."
        : "Gagal membuat profil pengguna. Coba lagi.",
      code,
      noData<null>()
    );
  }
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

/**
 * Urutan register (rencana Sprint 6 §A-2), dua fase:
 *
 *   fase 1 (harus sukses): account.create → createEmailPasswordSession → updatePrefs
 *   fase 2 (boleh gagal):  executeFunction(create-user-profile)
 *
 * prefs hanya bisa ditulis dengan sesi aktif, jadi urutan ini tidak bisa dibalik —
 * itulah sebabnya trigger event users.*.create tidak akan pernah menemukan role.
 *
 * Kegagalan fase 2 dikembalikan sebagai SUKSES dengan profileProvisioned:false,
 * bukan sebagai fail. Akun dan sesi sudah nyata ada; melaporkannya sebagai gagal
 * membuat user mencoba ulang dengan email yang sama lalu kena 409
 * user_already_exists — jalan buntu tanpa pemulihan.
 */
async function registerWithPrefs(
  email: string,
  password: string,
  name: string,
  prefs: ProfilePrefs
): Promise<ServiceResult<RegisterOutcome>> {
  try {
    await account.create({ userId: ID.unique(), email, password, name });
    await account.createEmailPasswordSession({ email, password });
    await account.updatePrefs({ prefs });
  } catch (err) {
    return fail(
      authMessage(err, "Gagal membuat akun. Coba lagi."),
      mapWriteErrorCode(err),
      noData<RegisterOutcome>()
    );
  }

  const provision = await provisionUserProfile();

  // Sesi sudah hidup, jadi getSession() adalah sumber kebenaran untuk identitas.
  // Kalau baris `users` belum ada (persis kasus A-1), susun SessionUser dari
  // prefs supaya UI tetap punya nama & role untuk ditampilkan.
  const session = await getSession();
  const user: SessionUser = session.success && session.data
    ? session.data
    : {
        userId: "",
        email,
        role: prefs.role,
        status: "active",
        name,
        // Akun yang baru dibuat belum pernah melewati onboarding, dan di cabang
        // ini baris profilnya bahkan belum terbentuk.
        isProfileCompleted: false,
      };

  return ok({
    user,
    profileProvisioned: provision.success,
    provisionErrorCode: provision.success ? undefined : provision.code,
  });
}

export async function registerUmkm(
  input: RegisterUmkmInput
): Promise<ServiceResult<RegisterOutcome>> {
  const parsed = parseOrErrors(registerUmkmSchema, input);
  if (!parsed.ok) {
    return failValidation(
      Object.values(parsed.errors)[0] ?? "Data pendaftaran belum lengkap.",
      noData<RegisterOutcome>()
    );
  }
  const { businessName, category, email, phone, password } = parsed.data;

  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    setMockRole("umkm");
    return ok({ user: getMockSessionUser("umkm"), profileProvisioned: true });
  }

  return registerWithPrefs(email, password, businessName, {
    role: "umkm",
    businessName,
    category,
    phone,
  });
}

export async function registerCreator(
  input: RegisterCreatorInput
): Promise<ServiceResult<RegisterOutcome>> {
  const parsed = parseOrErrors(registerCreatorSchema, input);
  if (!parsed.ok) {
    return failValidation(
      Object.values(parsed.errors)[0] ?? "Data pendaftaran belum lengkap.",
      noData<RegisterOutcome>()
    );
  }
  const { displayName, email, password } = parsed.data;

  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(500);
    setMockRole("creator");
    return ok({ user: getMockSessionUser("creator"), profileProvisioned: true });
  }

  return registerWithPrefs(email, password, displayName, {
    role: "creator",
    displayName,
  });
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Login email + password.
 *
 * Tidak butuh aksi tim backend — inilah bagian Sprint 6 yang sudah bisa dipakai
 * melawan project Appwrite live hari ini.
 */
export async function login(
  input: LoginInput
): Promise<ServiceResult<SessionUser>> {
  const parsed = parseOrErrors(loginSchema, input);
  if (!parsed.ok) {
    return failValidation(
      Object.values(parsed.errors)[0] ?? "Email dan password wajib diisi.",
      noData<SessionUser>()
    );
  }
  const { email, password } = parsed.data;

  // Melewati onboarding berlaku untuk satu sesi. Tab yang sama dipakai login
  // ulang harus menawarkan wizardnya lagi — profil yang belum lengkap membuat
  // kreator tidak pernah terlihat oleh UMKM.
  clearOnboardingSkip();

  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    const role = mockRoleFromEmail(email);
    setMockRole(role);
    return ok(getMockSessionUser(role));
  }

  try {
    await account.createEmailPasswordSession({ email, password });
  } catch (err) {
    return fail(
      authMessage(err, "Gagal masuk. Coba lagi."),
      mapWriteErrorCode(err),
      noData<SessionUser>()
    );
  }

  let session = await getSession();

  // Self-heal: akun ada tapi baris `users` belum terbentuk — sisa register yang
  // terputus di fase 2, atau akun yang dibuat lewat konsol. Function-nya
  // idempoten, jadi mencoba sekali di sini tidak pernah merugikan.
  if (!session.success && session.code === "not_found") {
    const provision = await provisionUserProfile();
    if (provision.success) session = await getSession();
  }

  if (!session.success || !session.data) {
    // Teruskan apa adanya — session.service sudah menulis pesan yang tepat.
    return fail(
      session.error ?? "Gagal memuat sesi. Coba lagi.",
      session.code ?? "unknown",
      noData<SessionUser>()
    );
  }

  if (session.data.status === "suspended") {
    // Sesi harus benar-benar diakhiri. Membiarkannya hidup berarti kartu
    // "Akun Ditangguhkan" di RoleGuard jadi satu-satunya penghalang ke dashboard.
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // Sesi gagal dihapus tidak boleh mengubah keputusan menolak login.
    }
    return fail(
      "Akun kamu ditangguhkan sehingga tidak bisa masuk. Hubungi admin Marketiv.",
      "forbidden",
      noData<SessionUser>()
    );
  }

  return ok(session.data);
}

// ---------------------------------------------------------------------------
// Pemulihan password
// ---------------------------------------------------------------------------

/**
 * Kirim email pemulihan.
 *
 * Appwrite menolak URL yang host-nya belum terdaftar sebagai platform Web di
 * project — belum dilakukan (handoff-auth-sprint6.md §A-4), jadi ini akan gagal
 * sampai tim backend mendaftarkannya.
 *
 * Catatan privasi: Appwrite sengaja tidak membedakan email terdaftar dan tidak,
 * jadi pemanggil HARUS menampilkan layar "cek email" pada setiap sukses.
 */
export async function requestPasswordRecovery(
  input: ForgotPasswordInput
): Promise<ServiceResult<null>> {
  const parsed = parseOrErrors(forgotPasswordSchema, input);
  if (!parsed.ok) {
    return failValidation(
      Object.values(parsed.errors)[0] ?? "Email wajib diisi.",
      noData<null>()
    );
  }

  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return ok(null);
  }

  try {
    await account.createRecovery({
      email: parsed.data.email,
      url: `${window.location.origin}${AUTH_CONFIG.recoveryPath}`,
    });
    return ok(null);
  } catch (err) {
    return fail(
      authMessage(
        err,
        "Email pemulihan belum bisa dikirim. Fitur ini belum aktif di project — hubungi admin Marketiv."
      ),
      mapWriteErrorCode(err),
      noData<null>()
    );
  }
}

/** Selesaikan pemulihan dengan userId & secret dari tautan email. */
export async function completePasswordRecovery(
  args: { userId: string; secret: string } & ResetPasswordInput
): Promise<ServiceResult<null>> {
  const parsed = parseOrErrors(resetPasswordSchema, {
    password: args.password,
    passwordConfirm: args.passwordConfirm,
  });
  if (!parsed.ok) {
    return failValidation(
      Object.values(parsed.errors)[0] ?? "Password baru belum valid.",
      noData<null>()
    );
  }

  if (!args.userId || !args.secret) {
    return failValidation(
      "Tautan pemulihan tidak lengkap. Minta tautan baru dari halaman lupa password.",
      noData<null>()
    );
  }

  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(400);
    return ok(null);
  }

  try {
    await account.updateRecovery({
      userId: args.userId,
      secret: args.secret,
      password: parsed.data.password,
    });
    return ok(null);
  } catch (err) {
    return fail(
      authMessage(err, "Gagal mengatur ulang password. Coba lagi."),
      mapWriteErrorCode(err),
      noData<null>()
    );
  }
}

// ---------------------------------------------------------------------------
// Verifikasi email lewat OTP (Email Token)
// ---------------------------------------------------------------------------
//
// Verifikasi native Appwrite (createVerification/updateVerification) hanya
// tautan — secret-nya token panjang, tak bisa diketik sebagai kode 6 digit.
// Satu-satunya jalur OTP email di Appwrite adalah Email Token: createEmailToken
// mengirim kode ke email, lalu createSession menukar kode itu jadi sesi DAN
// menandai email terverifikasi (memicu event emailVerification → Function
// user-email-verified mengisi users.email_verified_at).

/**
 * Kirim kode OTP verifikasi ke email akun.
 *
 * Dipakai setelah register berhasil dan dari tombol "kirim ulang" di
 * EmailVerificationPending. `userId` boleh diabaikan Appwrite bila email sudah
 * terpaut akun (kasus kita) — tetap dikirim demi kelengkapan payload.
 */
export async function requestEmailOtp(args: {
  userId: string;
  email: string;
}): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return ok(null);
  }

  try {
    await account.createEmailToken({ userId: args.userId, email: args.email });
    return ok(null);
  } catch (err) {
    return fail(
      authMessage(err, "Gagal mengirim kode verifikasi. Coba lagi."),
      mapWriteErrorCode(err),
      noData<null>()
    );
  }
}

/**
 * Tukar kode OTP jadi sesi terverifikasi.
 *
 * createSession diblokir Appwrite bila sesi lain masih aktif, jadi sesi login
 * password dari register dihapus lebih dulu. Bila kodenya salah/kedaluwarsa,
 * sesi login dipulihkan via password supaya user TIDAK ter-logout hanya karena
 * salah ketik OTP — itu sebabnya email+password ikut diminta di sini.
 */
export async function confirmEmailOtp(args: {
  userId: string;
  email: string;
  password: string;
  code: string;
}): Promise<ServiceResult<null>> {
  const code = args.code.trim();
  if (!args.userId || !code) {
    return failValidation("Masukkan kode 6 digit dari email kamu.", noData<null>());
  }

  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(300);
    return ok(null);
  }

  try {
    await account.deleteSession({ sessionId: "current" });
    await account.createSession({ userId: args.userId, secret: code });
    return ok(null);
  } catch (err) {
    // Pulihkan sesi login agar user tetap masuk meski OTP gagal.
    try {
      await account.createEmailPasswordSession({
        email: args.email,
        password: args.password,
      });
    } catch {
      // Sesi lama mungkin belum terhapus; abaikan — user tetap punya sesi.
    }
    return fail(
      authMessage(err, "Kode OTP salah atau kedaluwarsa. Minta kode baru."),
      mapWriteErrorCode(err),
      noData<null>()
    );
  }
}

// ---------------------------------------------------------------------------
// Google OAuth (di balik flag — provider belum dikonfigurasi, §A-3)
// ---------------------------------------------------------------------------

export function isGoogleOAuthEnabled(): boolean {
  return AUTH_CONFIG.googleOAuthEnabled;
}

/**
 * Mulai alur OAuth Google. Sinkron: memanggilnya meninggalkan halaman ini.
 *
 * `role` diteruskan via query string ke success URL supaya OAuthCallback tahu
 * apakah ini pendaftaran baru UMKM (→ form data tambahan) atau Kreator (→
 * langsung provision).
 *
 * Gagal tertutup — kalau flag mati, tidak melakukan apa pun.
 */
export function startGoogleOAuth(role?: string, next?: string): void {
  if (!AUTH_CONFIG.googleOAuthEnabled) {
    console.warn(
      "[auth] Google OAuth dimatikan (NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH). Provider belum dikonfigurasi di konsol Appwrite."
    );
    return;
  }
  if (typeof window === "undefined") return;

  const origin = window.location.origin;
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (role) params.set("role", role);
  const qs = params.toString();
  const success = `${origin}${AUTH_CONFIG.oauthSuccessPath}${qs ? `?${qs}` : ""}`;

  account.createOAuth2Session({
    provider: OAuthProvider.Google,
    success,
    failure: `${origin}${AUTH_CONFIG.oauthFailurePath}`,
  });
}

/**
 * Tulis prefs role+opsional data profil UMKM ke akun yang sedang login.
 * Dipakai setelah Google OAuth saat akun baru belum punya prefs role.
 */
export async function setOAuthAccountPrefs(
  role: "umkm" | "creator",
  extra?: { businessName?: string; category?: string; phone?: string; displayName?: string }
): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(200);
    return ok(null);
  }
  try {
    await account.updatePrefs({
      prefs: { role, ...(extra ?? {}) },
    });
    return ok(null);
  } catch (err) {
    return fail(
      "Gagal menyimpan role akun. Coba lagi.",
      mapWriteErrorCode(err),
      noData<null>()
    );
  }
}
