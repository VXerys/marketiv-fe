import { Query } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type Notification = {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: string;
};

export class NotificationServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'NotificationServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapNotification = (document: Record<string, any>): Notification => ({
  id: document.$id,
  userId: document.userId,
  title: document.title,
  message: document.message,
  type: document.type,
  isRead: Boolean(document.isRead),
  createdAt: document.createdAt || document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): NotificationServiceError => {
  if (err instanceof NotificationServiceError) return err;
  if (err?.code === 401) return new NotificationServiceError('auth', 'Silakan login untuk melihat notifikasi.', err);
  if (err?.code === 403) return new NotificationServiceError('forbidden', 'Kamu tidak memiliki akses ke notifikasi ini.', err);
  return new NotificationServiceError(err?.type || 'unknown', fallbackMessage, err);
};

export const getNotifications = async (options: { limit?: number } = {}): Promise<Notification[]> => {
  try {
    const user = await account.get();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.notifications, [
      Query.equal('userId', user.$id),
      Query.orderDesc('createdAt'),
      Query.limit(options.limit ?? 50),
    ]);

    return response.documents.map(mapNotification);
  } catch (err) {
    throw mapError(err, 'Gagal memuat notifikasi. Coba lagi.');
  }
};

export const markAsRead = async (id: string): Promise<Notification> => {
  if (!id) throw new NotificationServiceError('validation', 'Notification ID wajib diisi.');

  try {
    const document = await databases.updateDocument(DATABASE_ID, COLLECTIONS.notifications, id, { isRead: true });
    return mapNotification(document);
  } catch (err) {
    throw mapError(err, 'Gagal menandai notifikasi. Coba lagi.');
  }
};

export const markAllAsRead = async (): Promise<void> => {
  const notifications = await getNotifications({ limit: 100 });
  await Promise.all(notifications.filter((notification) => !notification.isRead).map((notification) => markAsRead(notification.id)));
};
