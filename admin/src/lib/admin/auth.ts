import { account, databases, databaseId, COLLECTIONS } from "./appwrite";
import { Query } from "appwrite";

export interface AdminUserSession {
  userId: string;
  email: string;
  role: string;
  isAdmin: boolean;
  status: string;
}

export type AdminAuthFailureKind =
  | "unauthenticated"
  | "forbidden"
  | "suspended"
  | "error";

export class AdminAuthError extends Error {
  constructor(
    public readonly kind: AdminAuthFailureKind,
    message: string,
  ) {
    super(message);
    this.name = "AdminAuthError";
  }
}

type AdminAuthDependencies = {
  account: Pick<typeof account, "createEmailPasswordSession" | "get" | "deleteSession">;
  databases: Pick<typeof databases, "listDocuments"> & Partial<Pick<typeof databases, "getDocument">>;
};

function failureFrom(error: unknown): AdminAuthError {
  const code = (error as { code?: number })?.code;
  if (code === 401) return new AdminAuthError("unauthenticated", "Sesi Admin tidak ditemukan atau sudah berakhir.");
  return new AdminAuthError("error", "Gagal memverifikasi sesi Admin. Coba lagi.");
}

function signInFailureFrom(error: unknown): AdminAuthError {
  const code = (error as { code?: number })?.code;
  if (code === 401 || code === 403) {
    return new AdminAuthError("unauthenticated", "Email atau kata sandi salah, atau akun tidak dapat masuk.");
  }
  return new AdminAuthError("error", "Masuk Admin gagal. Coba lagi.");
}

/**
 * Checks Appwrite session and verifies Marketiv Admin role (role === "admin").
 * Note: Real security boundary is enforced server-side inside Appwrite Function.
 */
export async function resolveAdminSession(
  dependencies: AdminAuthDependencies = { account, databases },
): Promise<AdminUserSession> {
  try {
    const session = (await dependencies.account.get()) as {
      $id: string;
      email: string;
      status?: boolean;
      labels?: string[];
      prefs?: Record<string, unknown>;
    };
    if (!session || !session.$id) {
      throw new AdminAuthError("unauthenticated", "Sesi Admin tidak ditemukan atau sudah berakhir.");
    }

    if (session.status === false) {
      throw new AdminAuthError("suspended", "Akun Admin ini tidak aktif. Hubungi Marketiv untuk bantuan.");
    }

    let userDoc: Record<string, unknown> | undefined;
    try {
      const userRes = await dependencies.databases.listDocuments(databaseId, COLLECTIONS.users, [
        Query.equal("userId", session.$id),
        Query.limit(1),
      ]);
      userDoc = userRes.documents[0];
    } catch {
      if (typeof dependencies.databases.getDocument === "function") {
        try {
          userDoc = (await dependencies.databases.getDocument(
            databaseId,
            COLLECTIONS.users,
            session.$id,
          )) as Record<string, unknown>;
        } catch {
          // Allow fallback to Appwrite Auth session labels/prefs
        }
      }
    }

    const hasAdminLabel =
      Array.isArray(session.labels) &&
      session.labels.some((l) => typeof l === "string" && l.toLowerCase() === "admin");
    const hasAdminPref =
      typeof session.prefs?.role === "string" &&
      session.prefs.role.toLowerCase() === "admin";
    const dbRole = typeof userDoc?.role === "string" ? userDoc.role.toLowerCase() : undefined;

    const isAdmin = dbRole === "admin" || hasAdminLabel || hasAdminPref;
    if (!isAdmin) {
      throw new AdminAuthError("forbidden", "Akun ini tidak memiliki akses Admin Marketiv.");
    }

    const dbStatus = typeof userDoc?.status === "string" ? userDoc.status.toLowerCase() : undefined;
    if (dbStatus && dbStatus !== "active") {
      throw new AdminAuthError("suspended", "Akun Admin ini tidak aktif. Hubungi Marketiv untuk bantuan.");
    }

    return {
      userId: session.$id,
      email: session.email,
      role: "admin",
      isAdmin: true,
      status: dbStatus || "active",
    };
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    throw failureFrom(error);
  }
}

export const getCurrentAdminSession = resolveAdminSession;

/**
 * Creates an Appwrite email/password session, then validates its Marketiv
 * admin record. Any non-admin or inactive session created here is deleted.
 */
export async function signInAdminSession(
  email: string,
  password: string,
  dependencies: AdminAuthDependencies = { account, databases },
): Promise<AdminUserSession> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail || !password) {
    throw new AdminAuthError("error", "Email dan kata sandi wajib diisi.");
  }

  try {
    await dependencies.account.createEmailPasswordSession({
      email: normalizedEmail,
      password,
    });
  } catch (error) {
    throw signInFailureFrom(error);
  }

  try {
    return await resolveAdminSession(dependencies);
  } catch (error) {
    try {
      await dependencies.account.deleteSession("current");
    } catch {
      // Keep original authorization error. A future bootstrap remains fail-closed.
    }
    throw error;
  }
}

export async function logoutAdminSession(
  dependencies: Pick<AdminAuthDependencies, "account"> = { account },
): Promise<void> {
  try {
    await dependencies.account.deleteSession("current");
  } catch (error) {
    throw failureFrom(error);
  }
}
