import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type RateCardPackageInput = {
  name: string;
  description: string;
  output: string;
  deliveryDays: number;
  price: number;
  revisionLimit: number;
};

export type CreateRateCardInput = {
  title: string;
  description?: string;
  packages: RateCardPackageInput[];
};

export type UpdateRateCardInput = {
  rateCardId: string;
  title?: string;
  description?: string;
  status?: 'draft' | 'published';
  packages?: RateCardPackageInput[];
};

export type RateCardPackage = RateCardPackageInput & {
  id: string;
};

export type RateCard = {
  id: string;
  creatorId: string;
  title: string;
  description?: string;
  status: 'draft' | 'published';
  packages: RateCardPackage[];
  createdAt?: string;
};

export class CreatorServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'CreatorServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapRateCard = (document: Record<string, any>): RateCard => ({
  id: document.$id,
  creatorId: document.creatorId,
  title: document.title,
  description: document.description || undefined,
  status: document.status,
  packages: [],
  createdAt: document.$createdAt,
});

const mapPackage = (document: Record<string, any>): RateCardPackage => ({
  id: document.$id,
  name: document.name,
  description: document.description,
  output: document.output,
  deliveryDays: document.deliveryDays,
  price: document.price,
  revisionLimit: document.revisionLimit,
});

const mapError = (err: any, fallbackMessage: string): CreatorServiceError => {
  if (err instanceof CreatorServiceError) return err;
  if (err?.code === 401) return new CreatorServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new CreatorServiceError('forbidden', 'Akses ditolak.', err);
  if (err?.code === 404) return new CreatorServiceError('not_found', 'Rate card tidak ditemukan.', err);
  return new CreatorServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const validatePackage = (pkg: RateCardPackageInput, index: number): void => {
  if (!pkg?.name?.trim()) throw new CreatorServiceError('validation', `Paket #${index + 1}: nama wajib diisi.`);
  if (!pkg?.description?.trim()) throw new CreatorServiceError('validation', `Paket #${index + 1}: deskripsi wajib diisi.`);
  if (!pkg?.output?.trim()) throw new CreatorServiceError('validation', `Paket #${index + 1}: output wajib diisi.`);
  if (!Number.isInteger(pkg.deliveryDays) || pkg.deliveryDays <= 0) {
    throw new CreatorServiceError('validation', `Paket #${index + 1}: deliveryDays harus angka > 0.`);
  }
  if (!Number.isInteger(pkg.price) || pkg.price <= 0) {
    throw new CreatorServiceError('validation', `Paket #${index + 1}: price harus angka > 0.`);
  }
  if (!Number.isInteger(pkg.revisionLimit) || pkg.revisionLimit < 0) {
    throw new CreatorServiceError('validation', `Paket #${index + 1}: revisionLimit tidak valid.`);
  }
};

export const createRateCard = async (input: CreateRateCardInput): Promise<RateCard> => {
  if (!input?.title?.trim()) throw new CreatorServiceError('validation', 'Judul rate card wajib diisi.');
  if (!Array.isArray(input.packages) || input.packages.length === 0) {
    throw new CreatorServiceError('validation', 'Minimal satu paket wajib ditambahkan.');
  }
  input.packages.forEach(validatePackage);

  try {
    const user = await account.get();

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.rateCards,
      ID.unique(),
      {
        creatorId: user.$id,
        title: input.title.trim(),
        description: input.description?.trim() || '',
        status: 'draft',
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(user.$id)),
        Permission.delete(Role.user(user.$id)),
      ]
    );

    const packages = await Promise.all(
      input.packages.map((pkg) =>
        databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.rateCardPackages,
          ID.unique(),
          {
            rateCardId: document.$id,
            name: pkg.name.trim(),
            description: pkg.description.trim(),
            output: pkg.output.trim(),
            deliveryDays: pkg.deliveryDays,
            price: pkg.price,
            revisionLimit: pkg.revisionLimit,
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(user.$id)),
            Permission.delete(Role.user(user.$id)),
          ]
        )
      )
    );

    const rateCard = mapRateCard(document);
    rateCard.packages = packages.map(mapPackage);
    return rateCard;
  } catch (err) {
    throw mapError(err, 'Gagal membuat rate card.');
  }
};

export const updateRateCard = async (input: UpdateRateCardInput): Promise<RateCard> => {
  if (!input?.rateCardId) throw new CreatorServiceError('validation', 'Rate card ID wajib diisi.');
  if (input.title !== undefined && !input.title.trim()) {
    throw new CreatorServiceError('validation', 'Judul tidak boleh kosong.');
  }
  if (input.packages) {
    if (input.packages.length === 0) throw new CreatorServiceError('validation', 'Minimal satu paket wajib ditambahkan.');
    input.packages.forEach(validatePackage);
  }

  try {
    const user = await account.get();
    const existing = await databases.getDocument(DATABASE_ID, COLLECTIONS.rateCards, input.rateCardId);

    if (existing.creatorId !== user.$id) {
      throw new CreatorServiceError('forbidden', 'Kamu bukan pemilik rate card ini.');
    }

    const payload: Record<string, any> = {};
    if (input.title !== undefined) payload.title = input.title.trim();
    if (input.description !== undefined) payload.description = input.description.trim();
    if (input.status !== undefined) payload.status = input.status;

    const updated = await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.rateCards,
      input.rateCardId,
      payload
    );

    if (input.packages) {
      const oldPackages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.rateCardPackages, [
        Query.equal('rateCardId', input.rateCardId),
      ]);
      await Promise.all(
        oldPackages.documents.map((doc) =>
          databases.deleteDocument(DATABASE_ID, COLLECTIONS.rateCardPackages, doc.$id)
        )
      );
      await Promise.all(
        input.packages.map((pkg) =>
          databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.rateCardPackages,
            ID.unique(),
            {
              rateCardId: input.rateCardId,
              name: pkg.name.trim(),
              description: pkg.description.trim(),
              output: pkg.output.trim(),
              deliveryDays: pkg.deliveryDays,
              price: pkg.price,
              revisionLimit: pkg.revisionLimit,
            },
            [
              Permission.read(Role.any()),
              Permission.update(Role.user(user.$id)),
              Permission.delete(Role.user(user.$id)),
            ]
          )
        )
      );
    }

    const packages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.rateCardPackages, [
      Query.equal('rateCardId', input.rateCardId),
    ]);

    const rateCard = mapRateCard(updated);
    rateCard.packages = packages.documents.map(mapPackage);
    return rateCard;
  } catch (err) {
    throw mapError(err, 'Gagal memperbarui rate card.');
  }
};

export const getRateCards = async ({ creatorId }: { creatorId: string }): Promise<RateCard[]> => {
  if (!creatorId) throw new CreatorServiceError('validation', 'Creator ID wajib diisi.');

  try {
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.rateCards, [
      Query.equal('creatorId', creatorId),
      Query.equal('status', 'published'),
      Query.orderDesc('$createdAt'),
    ]);

    const rateCards = await Promise.all(
      response.documents.map(async (doc) => {
        const packages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.rateCardPackages, [
          Query.equal('rateCardId', doc.$id),
        ]);
        const rateCard = mapRateCard(doc);
        rateCard.packages = packages.documents.map(mapPackage);
        return rateCard;
      })
    );

    return rateCards;
  } catch (err) {
    throw mapError(err, 'Gagal memuat rate card.');
  }
};
