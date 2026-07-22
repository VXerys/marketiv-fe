import { Query } from "appwrite";
import { DATA_SOURCE_CONFIG } from "@/config/data-source.config";
import { mockDelay } from "@/lib/mock-delay";
import { account } from "@/lib/appwrite/account";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import type {
  ServiceResult,
  ServiceErrorCode,
  UserRole,
  UserStatus,
} from "@/types/domain";

/**
 * Session facade — satu-satunya jalur frontend untuk mengetahui siapa yang login.
 *
 * Pola sama dengan service lain: branch DATA_SOURCE_CONFIG.useMockData.
 * Komponen TIDAK boleh memanggil `account`/`databases` langsung (R1).
 */

export interface SessionUser {
  userId: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  /** Nama tampilan; dari users.name atau profil terkait. */
  name?: string;
  avatarUrl?: string;
}

/** Collection `users` — mirror Appwrite Auth, berisi role & status. */
const USERS_COLLECTION = "users";

/** Identitas sintetis untuk mode mock. Role ditentukan oleh RoleGuard terdekat. */
const MOCK_USERS: Record<UserRole, SessionUser> = {
  umkm: {
    userId: "umkm_001",
    email: "owner@dapur-sehat.id",
    role: "umkm",
    status: "active",
    name: "Dapur Sehat Sukabumi",
  },
  creator: {
    userId: "creator_002",
    email: "nadia.visuals@example.com",
    role: "creator",
    status: "active",
    name: "Nadia Visuals",
  },
  admin: {
    userId: "admin_001",
    email: "admin@marketiv.id",
    role: "admin",
    status: "active",
    name: "Admin Marketiv",
  },
};

export function getMockSessionUser(role: UserRole): SessionUser {
  return MOCK_USERS[role];
}

const mapErrorCode = (err: unknown): ServiceErrorCode => {
  const code = (err as { code?: number })?.code;
  if (code === 401) return "auth";
  if (code === 403) return "forbidden";
  if (code === 404) return "not_found";
  if (typeof code === "number" && code >= 500) return "server";
  return "unknown";
};

/**
 * Mengambil sesi aktif.
 *
 * Mock ON  → identitas sintetis UMKM (RoleGuard yang menentukan role efektif).
 * Mock OFF → account.get() lalu baca dokumen `users` untuk role & status.
 */
export async function getSession(): Promise<ServiceResult<SessionUser>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    await mockDelay(150);
    return { success: true, data: MOCK_USERS.umkm };
  }

  try {
    const authUser = await account.get();

    const userDocs = await databases.listDocuments(
      appwriteConfig.databaseId,
      USERS_COLLECTION,
      [Query.equal("$id", authUser.$id), Query.limit(1)]
    );

    const doc = userDocs.documents[0] as Record<string, unknown> | undefined;
    if (!doc) {
      return {
        success: false,
        data: null,
        error: "Profil pengguna belum tersedia. Hubungi admin.",
        code: "not_found",
      };
    }

    return {
      success: true,
      data: {
        userId: authUser.$id,
        email: authUser.email,
        role: doc.role as UserRole,
        status: doc.status as UserStatus,
        name: (doc.name as string) ?? authUser.name,
        avatarUrl: (doc.avatarUrl as string) ?? undefined,
      },
    };
  } catch (err) {
    const code = mapErrorCode(err);
    return {
      success: false,
      data: null,
      error:
        code === "auth"
          ? "Sesi tidak ditemukan. Silakan login."
          : "Gagal memuat sesi. Coba lagi.",
      code,
    };
  }
}

/** Mengakhiri sesi Appwrite. No-op di mode mock. */
export async function logout(): Promise<ServiceResult<null>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    return { success: true, data: null };
  }

  try {
    await account.deleteSession("current");
    return { success: true, data: null };
  } catch (err) {
    return {
      success: false,
      data: null,
      error: "Gagal keluar dari sesi.",
      code: mapErrorCode(err),
    };
  }
}
