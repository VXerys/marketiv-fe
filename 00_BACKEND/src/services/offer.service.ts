import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type CreateOfferInput = {
  conversationId: string;
  title: string;
  description?: string;
  price: number;
  deadline: string;
  revisionLimit: number;
};

export type Offer = {
  id: string;
  conversationId: string;
  umkmId: string;
  creatorId: string;
  title: string;
  description?: string;
  price: number;
  deadline: string;
  revisionLimit: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt?: string;
};

export class OfferServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'OfferServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapOffer = (document: Record<string, any>): Offer => ({
  id: document.$id,
  conversationId: document.conversationId,
  umkmId: document.umkmId,
  creatorId: document.creatorId,
  title: document.title,
  description: document.description || undefined,
  price: document.price,
  deadline: document.deadline,
  revisionLimit: document.revisionLimit,
  status: document.status,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): OfferServiceError => {
  if (err instanceof OfferServiceError) return err;
  if (err?.code === 401) return new OfferServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new OfferServiceError('forbidden', 'Akses ditolak.', err);
  if (err?.code === 404) return new OfferServiceError('not_found', 'Data tidak ditemukan.', err);
  return new OfferServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const getOfferOrThrow = async (offerId: string): Promise<Offer> => {
  const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.offers, offerId);
  return mapOffer(document);
};

export type GetOffersOptions = {
  status?: Offer['status'];
  conversationId?: string;
  limit?: number;
};

/** Offer milik user yang login — sebagai UMKM (pengirim) atau creator (penerima). */
export const getOffers = async (options: GetOffersOptions = {}): Promise<Offer[]> => {
  try {
    const user = await account.get();

    const queries = [
      Query.or([Query.equal('umkmId', user.$id), Query.equal('creatorId', user.$id)]),
      Query.orderDesc('$createdAt'),
      Query.limit(options.limit ?? 50),
    ];

    if (options.status) queries.push(Query.equal('status', options.status));
    if (options.conversationId) queries.push(Query.equal('conversationId', options.conversationId));

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.offers, queries);

    return response.documents.map(mapOffer);
  } catch (err) {
    throw mapError(err, 'Gagal memuat daftar offer.');
  }
};

/** Detail offer — hanya participant (UMKM pengirim atau creator penerima). */
export const getOfferById = async (offerId: string): Promise<Offer> => {
  if (!offerId) throw new OfferServiceError('validation', 'Offer ID wajib diisi.');

  try {
    const user = await account.get();
    const offer = await getOfferOrThrow(offerId);

    if (![offer.umkmId, offer.creatorId].includes(user.$id)) {
      throw new OfferServiceError('forbidden', 'Kamu tidak memiliki akses ke offer ini.');
    }

    return offer;
  } catch (err) {
    throw mapError(err, 'Gagal memuat offer.');
  }
};

export const createOffer = async (input: CreateOfferInput): Promise<Offer> => {
  if (!input?.conversationId) throw new OfferServiceError('validation', 'Conversation ID wajib diisi.');
  if (!input?.title?.trim()) throw new OfferServiceError('validation', 'Judul offer wajib diisi.');
  if (!Number.isInteger(input.price) || input.price <= 0) {
    throw new OfferServiceError('validation', 'Harga harus angka > 0.');
  }
  if (!input?.deadline) throw new OfferServiceError('validation', 'Deadline wajib diisi.');
  if (!Number.isInteger(input.revisionLimit) || input.revisionLimit < 0) {
    throw new OfferServiceError('validation', 'Revision limit tidak valid.');
  }

  try {
    const user = await account.get();
    const conversation = await databases.getDocument(DATABASE_ID, COLLECTIONS.conversations, input.conversationId);

    if (conversation.umkm_id !== user.$id) {
      throw new OfferServiceError('forbidden', 'Hanya UMKM yang dapat membuat offer.');
    }

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.offers,
      ID.unique(),
      {
        conversationId: input.conversationId,
        umkmId: conversation.umkm_id,
        creatorId: conversation.creator_id,
        title: input.title.trim(),
        description: input.description?.trim() || '',
        price: input.price,
        deadline: input.deadline,
        revisionLimit: input.revisionLimit,
        status: 'pending',
      },
      [
        Permission.read(Role.user(conversation.umkm_id)),
        Permission.read(Role.user(conversation.creator_id)),
        Permission.update(Role.user(conversation.creator_id)),
        Permission.delete(Role.user(conversation.umkm_id)),
      ]
    );

    return mapOffer(document);
  } catch (err) {
    throw mapError(err, 'Gagal membuat offer.');
  }
};

export const acceptOffer = async (offerId: string): Promise<Offer> => {
  if (!offerId) throw new OfferServiceError('validation', 'Offer ID wajib diisi.');

  try {
    const user = await account.get();
    const existing = await getOfferOrThrow(offerId);

    if (existing.creatorId !== user.$id) {
      throw new OfferServiceError('forbidden', 'Hanya creator yang dapat menerima offer.');
    }
    if (existing.status !== 'pending') {
      throw new OfferServiceError('validation', 'Offer hanya bisa diterima saat status pending.');
    }

    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.offers, offerId, {
      status: 'accepted',
    });

    return mapOffer(updated);
  } catch (err) {
    throw mapError(err, 'Gagal menerima offer.');
  }
};

export const rejectOffer = async (offerId: string): Promise<Offer> => {
  if (!offerId) throw new OfferServiceError('validation', 'Offer ID wajib diisi.');

  try {
    const user = await account.get();
    const existing = await getOfferOrThrow(offerId);

    if (existing.creatorId !== user.$id) {
      throw new OfferServiceError('forbidden', 'Hanya creator yang dapat menolak offer.');
    }
    if (existing.status !== 'pending') {
      throw new OfferServiceError('validation', 'Offer hanya bisa ditolak saat status pending.');
    }

    const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.offers, offerId, {
      status: 'rejected',
    });

    return mapOffer(updated);
  } catch (err) {
    throw mapError(err, 'Gagal menolak offer.');
  }
};

export const deleteOffer = async (offerId: string): Promise<void> => {
  if (!offerId) throw new OfferServiceError('validation', 'Offer ID wajib diisi.');

  try {
    const user = await account.get();
    const existing = await getOfferOrThrow(offerId);

    if (existing.umkmId !== user.$id) {
      throw new OfferServiceError('forbidden', 'Hanya UMKM pemilik offer yang dapat menghapus.');
    }
    if (existing.status !== 'pending') {
      throw new OfferServiceError('validation', 'Hanya offer pending yang bisa dihapus.');
    }

    await databases.deleteDocument(DATABASE_ID, COLLECTIONS.offers, offerId);
  } catch (err) {
    throw mapError(err, 'Gagal menghapus offer.');
  }
};
