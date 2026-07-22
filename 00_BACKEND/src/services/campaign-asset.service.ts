import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

/**
 * Asset campaign — hanya URL eksternal (Google Drive / CDN publik).
 * Tidak ada upload internal; lihat docs/02_Modules/Campaigns/50_Database.md.
 */

export type CampaignAssetSource = 'external_url';
export type CampaignAssetType = 'image' | 'video' | 'document' | 'link';

export type CampaignAsset = {
  id: string;
  campaignId: string;
  source: CampaignAssetSource;
  type: CampaignAssetType;
  fileUrl: string;
  fileName?: string;
  createdAt?: string;
};

export type AddCampaignAssetInput = {
  campaignId: string;
  type: CampaignAssetType;
  fileUrl: string;
  fileName?: string;
};

export class CampaignAssetServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'CampaignAssetServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const ASSET_TYPES: CampaignAssetType[] = ['image', 'video', 'document', 'link'];

const mapAsset = (document: Record<string, any>): CampaignAsset => ({
  id: document.$id,
  campaignId: document.campaignId,
  source: document.source,
  type: document.type,
  fileUrl: document.fileUrl,
  fileName: document.fileName || undefined,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): CampaignAssetServiceError => {
  if (err instanceof CampaignAssetServiceError) return err;
  if (err?.code === 401) return new CampaignAssetServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new CampaignAssetServiceError('forbidden', 'Akses ditolak.', err);
  if (err?.code === 404) return new CampaignAssetServiceError('not_found', 'Asset tidak ditemukan.', err);
  return new CampaignAssetServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const isValidHttpsUrl = (url: string): boolean => {
  try {
    return new URL(url).protocol === 'https:';
  } catch {
    return false;
  }
};

const assertCampaignOwner = async (campaignId: string, userId: string): Promise<void> => {
  const campaign = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId);
  if (campaign.umkmId !== userId) {
    throw new CampaignAssetServiceError('forbidden', 'Hanya UMKM pemilik campaign yang dapat mengelola asset.');
  }
};

export const addCampaignAsset = async (input: AddCampaignAssetInput): Promise<CampaignAsset> => {
  if (!input?.campaignId) throw new CampaignAssetServiceError('validation', 'Campaign ID wajib diisi.');
  if (!ASSET_TYPES.includes(input.type)) {
    throw new CampaignAssetServiceError('validation', 'Tipe asset tidak valid.');
  }
  if (!isValidHttpsUrl(input.fileUrl || '')) {
    throw new CampaignAssetServiceError('validation', 'URL asset wajib diawali https://.');
  }

  try {
    const user = await account.get();
    await assertCampaignOwner(input.campaignId, user.$id);

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.campaignAssets,
      ID.unique(),
      {
        campaignId: input.campaignId,
        source: 'external_url',
        type: input.type,
        fileUrl: input.fileUrl.trim(),
        fileName: input.fileName?.trim() || '',
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    return mapAsset(document);
  } catch (err) {
    throw mapError(err, 'Gagal menambahkan asset campaign.');
  }
};

/** Asset satu campaign — public read (kreator perlu melihatnya di Job Pool). */
export const listCampaignAssets = async (campaignId: string): Promise<CampaignAsset[]> => {
  if (!campaignId) throw new CampaignAssetServiceError('validation', 'Campaign ID wajib diisi.');

  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.campaignAssets, [
      Query.equal('campaignId', campaignId),
      Query.orderAsc('$createdAt'),
      Query.limit(50),
    ]);

    return response.documents.map(mapAsset);
  } catch (err) {
    throw mapError(err, 'Gagal memuat asset campaign.');
  }
};

export const removeCampaignAsset = async (assetId: string): Promise<void> => {
  if (!assetId) throw new CampaignAssetServiceError('validation', 'Asset ID wajib diisi.');

  try {
    const user = await account.get();
    const existing = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaignAssets, assetId);
    await assertCampaignOwner(existing.campaignId, user.$id);

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.campaignAssets, assetId);
  } catch (err) {
    throw mapError(err, 'Gagal menghapus asset campaign.');
  }
};
