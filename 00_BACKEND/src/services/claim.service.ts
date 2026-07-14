import { ID, Permission, Query, Role } from 'appwrite';
import { COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type ClaimStatus = 'claimed' | 'submitted' | 'approved' | 'rejected' | 'expired';

export type Claim = {
  id: string;
  campaignId: string;
  creatorId: string;
  status: ClaimStatus;
  claimedAt: string;
  createdAt?: string;
};

export class ClaimServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'ClaimServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapClaim = (document: Record<string, any>): Claim => ({
  id: document.$id,
  campaignId: document.campaignId,
  creatorId: document.creatorId,
  status: document.status,
  claimedAt: document.claimedAt,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): ClaimServiceError => {
  if (err instanceof ClaimServiceError) return err;
  if (err?.code === 401) return new ClaimServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new ClaimServiceError('forbidden', 'Akses ditolak.', err);
  return new ClaimServiceError(err?.type || 'unknown', fallbackMessage, err);
};

export const claimCampaign = async (campaignId: string): Promise<Claim> => {
  if (!campaignId) throw new ClaimServiceError('validation', 'Campaign ID wajib diisi.');

  const { account } = await import('../lib/appwrite');

  try {
    const user = await account.get();
    const creatorId = user.$id;

    // 1. Validasi campaign exists dan active
    const campaignDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId);
    const campaign = campaignDoc as Record<string, any>;

    if (campaign.status !== 'active') {
      throw new ClaimServiceError('validation', 'Campaign tidak aktif.');
    }

    // 2. Validasi profil lengkap (cek field isProfileCompleted di user)
    const userDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.users, creatorId);
    if (!userDoc.isProfileCompleted) {
      throw new ClaimServiceError('validation', 'Lengkapi profil dulu sebelum claim.');
    }

    // 3. Bersihkan expired claims sebelum cek limit
    const submissionDays = campaign.submissionDays ?? 7;
    const expiredSince = new Date(Date.now() - submissionDays * 24 * 60 * 60 * 1000).toISOString();

    const staleClaims = await databases.listDocuments(DATABASE_ID, COLLECTIONS.claims, [
      Query.equal('campaignId', campaignId),
      Query.equal('status', 'claimed'),
      Query.lessThan('claimedAt', expiredSince),
      Query.limit(100),
    ]);

    for (const stale of staleClaims.documents) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.claims, stale.$id, {
        status: 'expired',
      });
      campaign.totalClaims--;
    }

    if (staleClaims.documents.length > 0) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId, {
        totalClaims: campaign.totalClaims,
      });
    }

    // 4. Validasi claim limit (setelah expired claims dibersihkan)
    if (campaign.totalClaims >= campaign.claimLimit) {
      throw new ClaimServiceError('validation', 'Claim limit campaign sudah penuh.');
    }

    // 5. Validasi unik (sudah claim sebelumnya?)
    const existingClaims = await databases.listDocuments(DATABASE_ID, COLLECTIONS.claims, [
      Query.equal('campaignId', campaignId),
      Query.equal('creatorId', creatorId),
      Query.limit(1),
    ]);

    if (existingClaims.documents.length > 0) {
      throw new ClaimServiceError('validation', 'Kamu sudah claim campaign ini.');
    }

    // 6. Buat claim
    const claimDoc = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.claims,
      ID.unique(),
      {
        campaignId,
        creatorId,
        status: 'claimed',
        claimedAt: new Date().toISOString(),
      },
      [
        Permission.read(Role.user(creatorId)),
        Permission.update(Role.user(creatorId)),
      ]
    );

    // 7. Increment totalClaims denormalisasi
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.campaigns,
      campaignId,
      { totalClaims: campaign.totalClaims + 1 }
    );

    return mapClaim(claimDoc);
  } catch (err) {
    throw mapError(err, 'Gagal claim campaign.');
  }
};
