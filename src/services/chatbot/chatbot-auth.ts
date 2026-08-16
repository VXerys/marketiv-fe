import { Account, Client, Databases, Query } from "appwrite";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { UserRole } from "@/types/domain";

const USERS_COLLECTION = "users";

export function readBearerToken(authorization: string | null): string | null {
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  return match?.[1] ?? null;
}

export async function authenticateChatRole(jwt: string): Promise<UserRole> {
  if (!appwriteConfig.endpoint || !appwriteConfig.projectId || !appwriteConfig.databaseId) {
    throw new Error("Konfigurasi Appwrite untuk autentikasi Tivvy belum lengkap.");
  }

  const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setJWT(jwt);
  const account = new Account(client);
  const databases = new Databases(client);
  const authUser = await account.get();
  const result = await databases.listDocuments({
    databaseId: appwriteConfig.databaseId,
    collectionId: USERS_COLLECTION,
    queries: [Query.equal("userId", authUser.$id), Query.limit(1)],
  });
  const role = result.documents[0]?.role;

  if (role !== "umkm" && role !== "creator" && role !== "admin") {
    throw new Error("Role akun Tivvy tidak valid.");
  }

  return role;
}
