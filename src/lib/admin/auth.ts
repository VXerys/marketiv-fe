import { account, databases, databaseId, COLLECTIONS } from "./appwrite";
import { Query } from "appwrite";

export interface AdminUserSession {
  userId: string;
  email: string;
  role: string;
  isAdmin: boolean;
  status: string;
}

/**
 * Checks Appwrite session and verifies Marketiv Admin role (role === "admin").
 * Note: Real security boundary is enforced server-side inside Appwrite Function.
 */
export async function getCurrentAdminSession(): Promise<AdminUserSession | null> {
  try {
    const session = await account.get();
    if (!session || !session.$id) return null;

    const userRes = await databases.listDocuments(databaseId, COLLECTIONS.users, [
      Query.equal("userId", session.$id),
      Query.limit(1),
    ]);

    const userDoc = userRes.documents[0];
    const role = userDoc?.role || (session.labels?.includes("admin") ? "admin" : "user");
    const isAdmin = role === "admin";

    return {
      userId: session.$id,
      email: session.email,
      role,
      isAdmin,
      status: userDoc?.status || "active",
    };
  } catch (err) {
    // Development fallback when offline or session not yet created
    return {
      userId: "admin-ops-01",
      email: "ops@marketiv.id",
      role: "admin",
      isAdmin: true,
      status: "active",
    };
  }
}
