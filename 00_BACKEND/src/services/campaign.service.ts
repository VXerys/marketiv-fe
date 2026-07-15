import { ID, Permission, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases, functions, FUNCTIONS } from '../lib/appwrite';
import { MINIMUM_CAMPAIGN_BUDGET } from './wallet.service';

export type CampaignType = 'ugc' | 'clipping';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export type CreateCampaignInput = {
  title: string;
  category: string;
  type: CampaignType;
  platforms: string[];
  budget: number;
  rewardPer1000Views: number;
  claimLimit: number;
  submissionDays?: number;
};

export type Campaign = {
  id: string;
  umkmId: string;
  title: string;
  category: string;
  type: CampaignType;
  platforms: string[];
  budget: number;
  rewardPer1000Views: number;
  claimLimit: number;
  submissionDays: number;
  totalClaims: number;
  spentAmount: number;
  remainingBudget: number;
  status: CampaignStatus;
  publishedAt?: string;
  createdAt?: string;
};

export class CampaignServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'CampaignServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapCampaign = (document: Record<string, any>): Campaign => ({
  id: document.$id,
  umkmId: document.umkmId,
  title: document.title,
  category: document.category,
  type: document.type,
  platforms: document.platforms,
  budget: document.budget,
  rewardPer1000Views: document.rewardPer1000Views,
  claimLimit: document.claimLimit,
  submissionDays: document.submissionDays ?? 7,
  totalClaims: document.totalClaims ?? 0,
  spentAmount: document.spentAmount ?? 0,
  remainingBudget: document.remainingBudget ?? document.budget,
  status: document.status,
  publishedAt: document.publishedAt || undefined,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): CampaignServiceError => {
  if (err instanceof CampaignServiceError) return err;
  if (err?.code === 401) return new CampaignServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new CampaignServiceError('forbidden', 'Akses ditolak.', err);
  return new CampaignServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const validateCampaignInput = (input: CreateCampaignInput): void => {
  if (!input.title?.trim()) throw new CampaignServiceError('validation', 'Judul wajib diisi.');
  if (!input.category?.trim()) throw new CampaignServiceError('validation', 'Kategori wajib diisi.');

  if (!['ugc', 'clipping'].includes(input.type)) {
    throw new CampaignServiceError('validation', 'Tipe campaign tidak valid.');
  }

  if (!input.platforms?.length || input.platforms.some((p) => p !== 'tiktok')) {
    throw new CampaignServiceError('validation', 'MVP hanya mendukung platform TikTok.');
  }

  if (!Number.isInteger(input.budget) || input.budget < MINIMUM_CAMPAIGN_BUDGET) {
    throw new CampaignServiceError('validation', `Minimum budget Rp${MINIMUM_CAMPAIGN_BUDGET.toLocaleString('id-ID')}.`);
  }

  if (!Number.isInteger(input.rewardPer1000Views) || input.rewardPer1000Views <= 0) {
    throw new CampaignServiceError('validation', 'CPM (rewardPer1000Views) wajib diisi dan > 0.');
  }

  if (!Number.isInteger(input.claimLimit) || input.claimLimit <= 0) {
    throw new CampaignServiceError('validation', 'Claim limit wajib diisi dan > 0.');
  }

  if (input.submissionDays !== undefined && (!Number.isInteger(input.submissionDays) || input.submissionDays < 1)) {
    throw new CampaignServiceError('validation', 'Batas waktu submit minimal 1 hari.');
  }

};

export const createCampaign = async (input: CreateCampaignInput): Promise<Campaign> => {
  validateCampaignInput(input);

  const { account } = await import('../lib/appwrite');

  try {
    const user = await account.get();

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.campaigns,
      ID.unique(),
      {
        umkmId: user.$id,
        title: input.title.trim(),
        category: input.category.trim(),
        type: input.type,
        platforms: input.platforms,
        budget: input.budget,
        rewardPer1000Views: input.rewardPer1000Views,
        claimLimit: input.claimLimit,
        submissionDays: input.submissionDays ?? 7,
        totalClaims: 0,
        spentAmount: 0,
        remainingBudget: 0,
        status: 'draft',
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    return mapCampaign(document);
  } catch (err) {
    throw mapError(err, 'Gagal membuat campaign.');
  }
};

export type GenerateBriefInput = {
  campaignId: string;
  description: string;
  type: CampaignType;
  materials?: string[];
  productName?: string;
  targetMarket?: string;
  goal?: string;
};

export type CampaignBrief = {
  objective: string;
  contentAngle: string;
  cta: string;
  briefDetail: string;
  doAndDont: { do: string[]; dont: string[] };
};

export const generateBrief = async (input: GenerateBriefInput): Promise<CampaignBrief> => {
  if (!input?.campaignId) throw new CampaignServiceError('validation', 'Campaign ID wajib diisi.');
  if (!input?.description?.trim()) throw new CampaignServiceError('validation', 'Deskripsi wajib diisi.');
  if (!['ugc', 'clipping'].includes(input.type)) {
    throw new CampaignServiceError('validation', 'Tipe campaign tidak valid.');
  }

  try {
    const user = await account.get();
    const payload = {
      ...input,
      userId: user.$id,
    };

    const execution = await functions.createExecution(
      FUNCTIONS.aiBrief,
      JSON.stringify(payload),
      false
    );

    if (execution.status === 'failed') {
      throw new CampaignServiceError('server', 'Gagal menghasilkan brief via AI.');
    }

    if (!execution.responseBody) {
      throw new CampaignServiceError('server', 'Response AI kosong.');
    }

    let result: { success: boolean; brief?: CampaignBrief; error?: string };
    try {
      result = JSON.parse(execution.responseBody);
    } catch (err) {
      throw new CampaignServiceError('server', 'Response AI tidak valid.', err);
    }

    if (!result.success || !result.brief) {
      throw new CampaignServiceError('server', result.error || 'Gagal menghasilkan brief.');
    }

    return result.brief;
  } catch (err) {
    throw mapError(err, 'Gagal menghasilkan brief.');
  }
};

export const publishCampaign = async (campaignId: string): Promise<Campaign> => {
  if (!campaignId) throw new CampaignServiceError('validation', 'Campaign ID wajib diisi.');

  const { account } = await import('../lib/appwrite');

  try {
    const user = await account.get();
    const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId);

    if (document.umkmId !== user.$id) {
      throw new CampaignServiceError('forbidden', 'Kamu bukan pemilik campaign ini.');
    }

    if (document.status !== 'draft') {
      throw new CampaignServiceError('validation', 'Hanya campaign draft yang bisa dipublish.');
    }

    if (document.remainingBudget <= 0) {
      throw new CampaignServiceError('validation', 'Campaign harus di-top-up terlebih dahulu.');
    }

    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId, {
      status: 'active',
      publishedAt: new Date().toISOString(),
    });

    return mapCampaign(updated);
  } catch (err) {
    throw mapError(err, 'Gagal publish campaign.');
  }
};

export const getCampaigns = async (filters?: {
  status?: CampaignStatus;
  category?: string;
  limit?: number;
}): Promise<Campaign[]> => {
  const { Query } = await import('appwrite');

  try {
    const queries = [Query.orderDesc('$createdAt'), Query.limit(filters?.limit ?? 50)];

    if (filters?.status) queries.push(Query.equal('status', filters.status));
    if (filters?.category) queries.push(Query.equal('category', filters.category));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.campaigns, queries);
    return response.documents.map(mapCampaign);
  } catch (err) {
    throw mapError(err, 'Gagal memuat daftar campaign.');
  }
};

export const getCampaignById = async (campaignId: string): Promise<Campaign> => {
  if (!campaignId) throw new CampaignServiceError('validation', 'Campaign ID wajib diisi.');

  try {
    const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId);
    return mapCampaign(document);
  } catch (err) {
    throw mapError(err, 'Gagal memuat campaign.');
  }
};
