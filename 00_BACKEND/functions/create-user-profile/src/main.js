import { Client, Databases, ID, Permission, Query, Role } from "node-appwrite";

const DEFAULT_STORAGE_QUOTA_BYTES = 104857600;

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv();
    const user = getEventUser(req);
    const userId = user.$id || user.id || user.userId;

    if (!userId) {
      return json(res, { error: "Missing user id in event payload" }, 400);
    }

    const role = getUserRole(user);
    if (!role || !["umkm", "creator", "admin"].includes(role)) {
      return json(res, { error: "Missing or invalid user role" }, 400);
    }

    const databases = createDatabasesClient(env);
    await ensureUserMirror(databases, env, user, userId, role);

    if (role === "umkm") {
      await ensureUmkmProfile(databases, env, user, userId);
    }

    if (role === "creator") {
      await ensureCreatorProfile(databases, env, user, userId);
    }

    await ensureStorageUsage(databases, env, userId);

    log(`Users profile provisioning completed for ${userId}`);
    return json(res, { status: "ok", userId, role });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

function getEnv() {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    usersCollectionId: process.env.USERS_COLLECTION_ID || process.env.NEXT_PUBLIC_USER_COLLECTION || "users",
    umkmProfilesCollectionId: process.env.UMKM_PROFILES_COLLECTION_ID || "umkm_profiles",
    creatorProfilesCollectionId: process.env.CREATOR_PROFILES_COLLECTION_ID || process.env.NEXT_PUBLIC_CREATOR_COLLECTION || "creator_profiles",
    storageUsageCollectionId: process.env.USER_STORAGE_USAGE_COLLECTION_ID || "user_storage_usage"
  };

  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  return env;
}

function createDatabasesClient(env) {
  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);

  return new Databases(client);
}

function getEventUser(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function getUserRole(user) {
  return user.role || user.prefs?.role || user.prefs?.userRole || user.labels?.find?.((label) => ["umkm", "creator", "admin"].includes(label));
}

async function ensureUserMirror(databases, env, user, userId, role) {
  const existing = await findByUserId(databases, env.databaseId, env.usersCollectionId, userId);
  if (existing) return existing;

  return databases.createDocument(
    env.databaseId,
    env.usersCollectionId,
    ID.unique(),
    {
      userId,
      role,
      status: "active",
      email: user.email || "",
      phone: user.phone || user.prefs?.phone || null,
      createdAt: new Date().toISOString()
    },
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId))]
  );
}

async function ensureUmkmProfile(databases, env, user, userId) {
  const existing = await findByUserId(databases, env.databaseId, env.umkmProfilesCollectionId, userId);
  if (existing) return existing;

  const prefs = user.prefs || {};
  return databases.createDocument(
    env.databaseId,
    env.umkmProfilesCollectionId,
    ID.unique(),
    {
      userId,
      businessName: prefs.businessName || prefs.business_name || "",
      category: prefs.category || prefs.businessCategory || prefs.business_category || "",
      city: prefs.city || null,
      description: prefs.description || null,
      address: prefs.address || null,
      tiktok: prefs.tiktok || null,
      logoUrl: prefs.logoUrl || prefs.logo_url || null,
      isProfileCompleted: false
    },
    publicOwnerPermissions(userId)
  );
}

async function ensureCreatorProfile(databases, env, user, userId) {
  const existing = await findByUserId(databases, env.databaseId, env.creatorProfilesCollectionId, userId);
  if (existing) return existing;

  const prefs = user.prefs || {};
  return databases.createDocument(
    env.databaseId,
    env.creatorProfilesCollectionId,
    ID.unique(),
    {
      userId,
      displayName: prefs.displayName || user.name || "",
      bio: prefs.bio || null,
      city: prefs.city || null,
      avatarUrl: prefs.avatarUrl || prefs.avatar_url || null,
      totalFollowers: 0,
      totalOrders: 0,
      rating: 0,
      isProfileCompleted: false
    },
    publicOwnerPermissions(userId)
  );
}

async function ensureStorageUsage(databases, env, userId) {
  const existing = await findByUserId(databases, env.databaseId, env.storageUsageCollectionId, userId);
  if (existing) return existing;

  return databases.createDocument(
    env.databaseId,
    env.storageUsageCollectionId,
    ID.unique(),
    {
      userId,
      usedBytes: 0,
      quotaBytes: DEFAULT_STORAGE_QUOTA_BYTES,
      fileCount: 0
    },
    [Permission.read(Role.user(userId))]
  );
}

async function findByUserId(databases, databaseId, collectionId, userId) {
  const result = await databases.listDocuments(databaseId, collectionId, [Query.equal("userId", userId), Query.limit(1)]);
  return result.documents[0] || null;
}

function publicOwnerPermissions(userId) {
  return [
    Permission.read(Role.any()),
    Permission.update(Role.user(userId)),
    Permission.delete(Role.user(userId))
  ];
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
