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
  storageBucketId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID ?? "user-files",
  /** Project punya 7 bucket terpisah — lihat 00_BACKEND/appwrite.config.json */
  buckets: {
    avatars: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_AVATARS ?? "avatars",
    creatorBanners: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_CREATOR_BANNERS ?? "creator-banners",
    logos: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_LOGOS ?? "logos",
    portfolios: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_PORTFOLIOS ?? "portfolios",
    campaignAssets: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_CAMPAIGN_ASSETS ?? "campaign-assets",
    deliverables: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_DELIVERABLES ?? "deliverables",
    fraudEvidence: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_FRAUD_EVIDENCE ?? "fraud-evidence",
    userFiles: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID ?? "user-files",
  },
} as const;

export type AppwriteConfig = typeof appwriteConfig;
