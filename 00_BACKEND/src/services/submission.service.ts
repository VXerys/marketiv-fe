import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type CreateSubmissionInput = {
  claimId: string;
  campaignId: string;
  platform: string;
  postUrl: string;
  caption?: string;
  views: number;
  engagement?: number;
};

export type Submission = {
  id: string;
  claimId: string;
  campaignId: string;
  creatorId: string;
  platform: string;
  postUrl: string;
  caption?: string;
  views: number;
  engagement?: number;
  fraudScore?: number;
  fraudStatus?: 'safe' | 'review' | 'rejected';
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
};

export class SubmissionServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'SubmissionServiceError';
    this.code = code;
    this.cause = cause;
  }
};

const mapSubmission = (document: Record<string, any>): Submission => ({
  id: document.$id,
  claimId: document.claimId,
  campaignId: document.campaignId,
  creatorId: document.creatorId,
  platform: document.platform,
  postUrl: document.postUrl,
  caption: document.caption || undefined,
  views: document.views,
  engagement: document.engagement ?? undefined,
  fraudScore: document.fraudScore ?? undefined,
  fraudStatus: document.fraudStatus || undefined,
  status: document.status,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): SubmissionServiceError => {
  if (err instanceof SubmissionServiceError) return err;
  if (err?.code === 401) return new SubmissionServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new SubmissionServiceError('forbidden', 'Akses ditolak.', err);
  if (err?.code === 404) return new SubmissionServiceError('not_found', 'Submission tidak ditemukan.', err);
  return new SubmissionServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const isValidTikTokUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' && /tiktok\.com$/i.test(parsed.hostname);
  } catch {
    return false;
  }
};

export const createSubmission = async (input: CreateSubmissionInput): Promise<Submission> => {
  if (!input?.claimId) throw new SubmissionServiceError('validation', 'Claim ID wajib diisi.');
  if (!input?.campaignId) throw new SubmissionServiceError('validation', 'Campaign ID wajib diisi.');
  if (input.platform !== 'tiktok') {
    throw new SubmissionServiceError('validation', 'MVP hanya mendukung platform TikTok.');
  }
  if (!input?.postUrl || !isValidTikTokUrl(input.postUrl)) {
    throw new SubmissionServiceError('validation', 'postUrl harus URL TikTok yang valid (https://*.tiktok.com).');
  }
  if (!Number.isInteger(input.views) || input.views < 0) {
    throw new SubmissionServiceError('validation', 'Views harus angka >= 0.');
  }

  try {
    const user = await account.get();
    const claim = await databases.getDocument(DATABASE_ID, COLLECTIONS.claims, input.claimId);

    if (claim.creatorId !== user.$id) {
      throw new SubmissionServiceError('forbidden', 'Kamu bukan pemilik claim ini.');
    }
    if (claim.campaignId !== input.campaignId) {
      throw new SubmissionServiceError('validation', 'Campaign tidak cocok dengan claim.');
    }

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.submissions,
      ID.unique(),
      {
        claimId: input.claimId,
        campaignId: input.campaignId,
        creatorId: user.$id,
        platform: input.platform,
        postUrl: input.postUrl,
        caption: input.caption?.trim() || '',
        views: input.views,
        engagement: input.engagement ?? 0,
        status: 'pending',
      },
      [
        Permission.read(Role.user(user.$id)),
        Permission.read(Role.user(claim.umkmId)),
        Permission.update(Role.user(claim.umkmId)),
      ]
    );

    return mapSubmission(document);
  } catch (err) {
    throw mapError(err, 'Gagal membuat submission.');
  }
};

export const getMySubmissions = async (): Promise<Submission[]> => {
  try {
    const user = await account.get();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.submissions, [
      Query.equal('creatorId', user.$id),
      Query.orderDesc('$createdAt'),
    ]);
    return response.documents.map(mapSubmission);
  } catch (err) {
    throw mapError(err, 'Gagal memuat submission.');
  }
};

const assertCampaignOwner = async (campaignId: string, userId: string): Promise<void> => {
  const campaign = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId);
  if (campaign.umkmId !== userId) {
    throw new SubmissionServiceError('forbidden', 'Hanya UMKM pemilik campaign yang dapat memproses submission.');
  }
};

export const approveSubmission = async (submissionId: string): Promise<Submission> => {
  if (!submissionId) throw new SubmissionServiceError('validation', 'Submission ID wajib diisi.');

  try {
    const user = await account.get();
    const existing = await databases.getDocument(DATABASE_ID, COLLECTIONS.submissions, submissionId);

    if (existing.status !== 'pending') {
      throw new SubmissionServiceError('validation', 'Hanya submission pending yang bisa diproses.');
    }

    await assertCampaignOwner(existing.campaignId, user.$id);

    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.submissions, submissionId, {
      status: 'approved',
    });

    return mapSubmission(updated);
  } catch (err) {
    throw mapError(err, 'Gagal menyetujui submission.');
  }
};

export const rejectSubmission = async (submissionId: string, reason?: string): Promise<Submission> => {
  if (!submissionId) throw new SubmissionServiceError('validation', 'Submission ID wajib diisi.');

  try {
    const user = await account.get();
    const existing = await databases.getDocument(DATABASE_ID, COLLECTIONS.submissions, submissionId);

    if (existing.status !== 'pending') {
      throw new SubmissionServiceError('validation', 'Hanya submission pending yang bisa diproses.');
    }

    await assertCampaignOwner(existing.campaignId, user.$id);

    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.submissions, submissionId, {
      status: 'rejected',
    });

    return mapSubmission(updated);
  } catch (err) {
    throw mapError(err, 'Gagal menolak submission.');
  }
};
