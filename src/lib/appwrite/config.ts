/**
 * Appwrite Public Configuration
 *
 * Contains only NEXT_PUBLIC_ environment variables safe for browser exposure.
 * Do NOT add API keys, server SDK credentials, or webhook secrets here.
 */
export const appwriteConfig = {
  endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "",
  projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "",
  databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID ?? "",
  storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID ?? "",
} as const;

export type AppwriteConfig = typeof appwriteConfig;
