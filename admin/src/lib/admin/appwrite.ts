import { Client, Account, Databases, Functions } from "appwrite";

export class AdminAppwriteConfigurationError extends Error {
  constructor(message: string) {
    super(`Admin Appwrite configuration error: ${message}`);
    this.name = "AdminAppwriteConfigurationError";
  }
}

function requiredValue(name: string, valueRaw?: string): string {
  const value = valueRaw?.trim();
  if (!value) {
    throw new AdminAppwriteConfigurationError(
      `${name} is required. Set it in the Admin deployment environment.`,
    );
  }
  return value;
}

function requiredAppwriteEndpoint(): string {
  const value = requiredValue(
    "NEXT_PUBLIC_APPWRITE_ENDPOINT",
    process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  );

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("unsupported protocol");
    }
  } catch {
    throw new AdminAppwriteConfigurationError(
      "NEXT_PUBLIC_APPWRITE_ENDPOINT must be a valid http(s) URL.",
    );
  }

  return value;
}

function requiredAppwriteId(name: string, valueRaw?: string): string {
  const value = requiredValue(name, valueRaw);
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,35}$/.test(value)) {
    throw new AdminAppwriteConfigurationError(
      `${name} must be a valid Appwrite identifier.`,
    );
  }
  return value;
}

const endpoint = requiredAppwriteEndpoint();
const projectId = requiredAppwriteId(
  "NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
);
export const databaseId = requiredAppwriteId(
  "NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
);

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
  getAdminSubmissionQueue: "get-admin-submission-queue",
  getAdminDashboardSummary: "get-admin-dashboard-summary",
  reviewSubmission: "review-submission",
  submitCampaignProof: "submit-campaign-proof",
  calculateCampaignReward: "calculate-campaign-reward",
  maturePendingBalance: "mature-pending-balance",
} as const;
