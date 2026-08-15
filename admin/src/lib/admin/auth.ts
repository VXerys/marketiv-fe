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
  account: Pick<typeof account, "get" | "deleteSession">;
  databases: Pick<typeof databases, "listDocuments">;
};

function failureFrom(error: unknown): AdminAuthError {
  const code = (error as { code?: number })?.code;
  if (code === 401) return new AdminAuthError("unauthenticated", "Sesi Admin tidak ditemukan atau sudah berakhir.");
  return new AdminAuthError("error", "Gagal memverifikasi sesi Admin. Coba lagi.");
}

/**
 * Checks Appwrite session and verifies Marketiv Admin role (role === "admin").
 * Note: Real security boundary is enforced server-side inside Appwrite Function.
 */
export async function resolveAdminSession(
  dependencies: AdminAuthDependencies = { account, databases },
): Promise<AdminUserSession> {
  try {
    const session = await dependencies.account.get();
    if (!session || !session.$id) {
      throw new AdminAuthError("unauthenticated", "Sesi Admin tidak ditemukan atau sudah berakhir.");
    }

    const userRes = await dependencies.databases.listDocuments(databaseId, COLLECTIONS.users, [
      Query.equal("userId", session.$id),
      Query.limit(1),
    ]);

    const userDoc = userRes.documents[0];
    if (!userDoc) {
      throw new AdminAuthError("error", "Profil pengguna Marketiv untuk sesi Admin tidak ditemukan.");
    }

    const role = userDoc.role;
    if (role !== "admin") {
      throw new AdminAuthError("forbidden", "Akun ini tidak memiliki akses Admin Marketiv.");
    }

    const status = userDoc.status || "inactive";
    if (status !== "active") {
      throw new AdminAuthError("suspended", "Akun Admin ini tidak aktif. Hubungi Marketiv untuk bantuan.");
    }

    return {
      userId: session.$id,
      email: session.email,
      role,
      isAdmin: true,
      status,
    };
  } catch (error) {
    if (error instanceof AdminAuthError) throw error;
    throw failureFrom(error);
  }
}

export const getCurrentAdminSession = resolveAdminSession;

export async function logoutAdminSession(
  dependencies: Pick<AdminAuthDependencies, "account"> = { account },
): Promise<void> {
  try {
    await dependencies.account.deleteSession("current");
  } catch (error) {
    throw failureFrom(error);
  }
}
