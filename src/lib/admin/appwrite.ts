import { Client, Account, Databases, Functions } from "appwrite";

const endpoint =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || "https://api.marketiv.id/v1";
const projectId =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || "69f9d45b00315cb0ec2f";
export const databaseId =
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || "6a4c8598001da3b0d7f0";

export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);

export const COLLECTIONS = {
  submissions: "campaign_submissions",
  campaigns: "campaigns",
  users: "users",
  claims: "campaign_claims",
  wallets: "wallets",
  transactions: "transactions",
  umkmProfiles: "umkm_profiles",
  creatorProfiles: "creator_profiles",
} as const;

export const FUNCTION_IDS = {
  reviewSubmission: "review-submission",
  submitCampaignProof: "submit-campaign-proof",
  calculateCampaignReward: "calculate-campaign-reward",
  maturePendingBalance: "mature-pending-balance",
} as const;
