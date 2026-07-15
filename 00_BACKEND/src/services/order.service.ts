import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type OrderStatus = 'pending_payment' | 'escrow' | 'in_progress' | 'revision' | 'approved' | 'completed' | 'cancelled';
export type DeliverableSource = 'storage' | 'external_url';
export type DeliverableStatus = 'submitted' | 'revision_requested' | 'approved';
export type RevisionStatus = 'open' | 'resolved';

export type Order = {
  id: string;
  offerId?: string;
  packageId?: string;
  creatorId: string;
  umkmId: string;
  amount: number;
  status: OrderStatus;
  createdAt?: string;
};

export type Deliverable = {
  id: string;
  orderId: string;
  source: DeliverableSource;
  fileUrl: string;
  fileId?: string;
  notes?: string;
  version: number;
  status: DeliverableStatus;
  createdAt?: string;
};

export type Revision = {
  id: string;
  orderId: string;
  requestedBy: string;
  message: string;
  status: RevisionStatus;
};

export type UploadDeliverableInput = {
  orderId: string;
  source: DeliverableSource;
  fileUrl: string;
  fileId?: string;
  notes?: string;
};

export type ApproveDeliverableInput = {
  orderId: string;
  deliverableId: string;
};

export type RequestRevisionInput = {
  orderId: string;
  message: string;
};

export class OrderServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'OrderServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapOrder = (document: Record<string, any>): Order => ({
  id: document.$id,
  offerId: document.offerId || undefined,
  packageId: document.packageId || undefined,
  creatorId: document.creatorId,
  umkmId: document.umkmId,
  amount: document.amount,
  status: document.status,
  createdAt: document.$createdAt,
});

const mapDeliverable = (document: Record<string, any>): Deliverable => ({
  id: document.$id,
  orderId: document.orderId,
  source: document.source,
  fileUrl: document.fileUrl,
  fileId: document.fileId || undefined,
  notes: document.notes || undefined,
  version: document.version,
  status: document.status,
  createdAt: document.$createdAt,
});

const mapRevision = (document: Record<string, any>): Revision => ({
  id: document.$id,
  orderId: document.orderId,
  requestedBy: document.requestedBy,
  message: document.message,
  status: document.status,
});

const mapError = (err: any, fallbackMessage: string): OrderServiceError => {
  if (err instanceof OrderServiceError) return err;

  if (err?.code === 401) {
    return new OrderServiceError('auth', 'Silakan login untuk melanjutkan.', err);
  }

  if (err?.code === 403) {
    return new OrderServiceError('forbidden', 'Kamu tidak memiliki akses.', err);
  }

  if (err?.code === 404) {
    return new OrderServiceError('not_found', 'Data tidak ditemukan.', err);
  }

  return new OrderServiceError(err?.type || 'unknown', fallbackMessage, err);
};

export const getOrders = async (params?: { status?: OrderStatus }): Promise<Order[]> => {
  try {
    const user = await account.get();
    const queries = [Query.orderDesc('$createdAt'), Query.limit(50)];

    if (params?.status) {
      queries.push(Query.equal('status', params.status));
    }

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.orders, queries);

    const orders = response.documents.filter((doc) => doc.umkmId === user.$id || doc.creatorId === user.$id);

    return orders.map(mapOrder);
  } catch (err) {
    throw mapError(err, 'Gagal memuat daftar order.');
  }
};

export const uploadDeliverable = async (input: UploadDeliverableInput): Promise<Deliverable> => {
  if (!input?.orderId) throw new OrderServiceError('validation', 'Order ID wajib diisi.');
  try {
    const user = await account.get();
    const order = await databases.getDocument(DATABASE_ID, COLLECTIONS.orders, input.orderId);

    if (order.creatorId !== user.$id) {
      throw new OrderServiceError('forbidden', 'Hanya creator pemilik order yang dapat mengunggah deliverable.');
    }

    if (input.source === 'storage') {
      if (!input.fileId) {
        throw new OrderServiceError('validation', 'fileId wajib diisi untuk source storage.');
      }

      const fileDoc = await databases.getDocument(DATABASE_ID, COLLECTIONS.userFiles, input.fileId);
      if (fileDoc.userId !== user.$id) {
        throw new OrderServiceError('forbidden', 'File harus milik kamu.');
      }
    }

    if (input.source === 'external_url' && !input.fileUrl.startsWith('https://')) {
      throw new OrderServiceError('validation', 'External URL harus menggunakan protokol HTTPS.');
    }

    const existingDeliverables = await databases.listDocuments(DATABASE_ID, COLLECTIONS.deliverables, [
      Query.equal('orderId', input.orderId),
      Query.orderDesc('version'),
      Query.limit(1),
    ]);

    const currentVersion = existingDeliverables.documents[0]?.version || 0;

    const deliverable = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.deliverables,
      ID.unique(),
      {
        orderId: input.orderId,
        source: input.source,
        fileUrl: input.fileUrl,
        fileId: input.fileId || null,
        notes: input.notes || null,
        version: currentVersion + 1,
        status: 'submitted',
      },
    );

    if (order.status !== 'in_progress') {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.orders, input.orderId, {
        status: 'in_progress',
      });
    }

    return mapDeliverable(deliverable);
  } catch (err) {
    throw mapError(err, 'Gagal mengunggah deliverable.');
  }
};

export const approveDeliverable = async (input: ApproveDeliverableInput): Promise<void> => {
  if (!input?.orderId) throw new OrderServiceError('validation', 'Order ID wajib diisi.');
  if (!input?.deliverableId) throw new OrderServiceError('validation', 'Deliverable ID wajib diisi.');
  try {
    const user = await account.get();
    const order = await databases.getDocument(DATABASE_ID, COLLECTIONS.orders, input.orderId);

    if (order.umkmId !== user.$id) {
      throw new OrderServiceError('forbidden', 'Hanya UMKM pemilik order yang dapat menyetujui deliverable.');
    }

    const deliverable = await databases.getDocument(DATABASE_ID, COLLECTIONS.deliverables, input.deliverableId);

    if (deliverable.orderId !== input.orderId) {
      throw new OrderServiceError('validation', 'Deliverable tidak sesuai dengan order.');
    }

    if (deliverable.status === 'approved') {
      throw new OrderServiceError('validation', 'Deliverable sudah disetujui.');
    }

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.deliverables, input.deliverableId, {
      status: 'approved',
    });
  } catch (err) {
    throw mapError(err, 'Gagal menyetujui deliverable.');
  }
};

export const requestRevision = async (input: RequestRevisionInput): Promise<Revision> => {
  if (!input?.orderId) throw new OrderServiceError('validation', 'Order ID wajib diisi.');
  try {
    const user = await account.get();
    const order = await databases.getDocument(DATABASE_ID, COLLECTIONS.orders, input.orderId);

    if (order.umkmId !== user.$id) {
      throw new OrderServiceError('forbidden', 'Hanya UMKM pemilik order yang dapat meminta revisi.');
    }

    if (order.status !== 'in_progress' && order.status !== 'revision') {
      throw new OrderServiceError('validation', 'Order tidak dalam status yang dapat direvisi.');
    }

    let revisionLimit = 3;

    if (order.offerId) {
      const offer = await databases.getDocument(DATABASE_ID, COLLECTIONS.offers, order.offerId);
      revisionLimit = offer.revisionLimit;
    } else if (order.packageId) {
      const pkg = await databases.getDocument(DATABASE_ID, COLLECTIONS.rateCardPackages, order.packageId);
      revisionLimit = pkg.revisionLimit;
    }

    const revisions = await databases.listDocuments(DATABASE_ID, COLLECTIONS.revisions, [
      Query.equal('orderId', input.orderId),
    ]);

    if (revisions.total >= revisionLimit) {
      throw new OrderServiceError('validation', `Batas revisi (${revisionLimit}) telah tercapai.`);
    }

    const revision = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.revisions,
      ID.unique(),
      {
        orderId: input.orderId,
        requestedBy: user.$id,
        message: input.message,
        status: 'open',
      },
    );

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.orders, input.orderId, {
      status: 'revision',
    });

    return mapRevision(revision);
  } catch (err) {
    throw mapError(err, 'Gagal meminta revisi.');
  }
};
