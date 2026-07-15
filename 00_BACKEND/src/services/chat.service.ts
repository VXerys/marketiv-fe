import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export type MessageType = 'text' | 'offer' | 'system';

export type Conversation = {
  id: string;
  umkmId: string;
  creatorId: string;
  offerId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt?: string;
};

export type ChatMessage = {
  id: string;
  conversationId: string;
  senderId: string;
  type: MessageType;
  content?: string;
  offerId?: string;
  readAt?: string;
  createdAt?: string;
};

export type CreateConversationInput = {
  umkmId: string;
  creatorId: string;
};

export type SendMessageInput = {
  conversationId: string;
  type?: MessageType;
  content?: string;
  offerId?: string;
};

export class ChatServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'ChatServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapConversation = (document: Record<string, any>): Conversation => ({
  id: document.$id,
  umkmId: document.umkm_id,
  creatorId: document.creator_id,
  offerId: document.offer_id || undefined,
  lastMessage: document.last_message || undefined,
  lastMessageAt: document.last_message_at || undefined,
  createdAt: document.$createdAt,
});

const mapMessage = (document: Record<string, any>): ChatMessage => ({
  id: document.$id,
  conversationId: document.conversation_id,
  senderId: document.sender_id,
  type: document.message_type,
  content: document.content || undefined,
  offerId: document.offer_id || undefined,
  readAt: document.read_at || undefined,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): ChatServiceError => {
  if (err instanceof ChatServiceError) return err;
  if (err?.code === 401) return new ChatServiceError('auth', 'Silakan login untuk menggunakan chat.', err);
  if (err?.code === 403) return new ChatServiceError('forbidden', 'Kamu tidak memiliki akses ke chat ini.', err);
  if (err?.code === 404) return new ChatServiceError('not_found', 'Percakapan tidak ditemukan.', err);
  return new ChatServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const requireText = (value: string | undefined, message: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) throw new ChatServiceError('validation', message);
  return trimmed;
};

const ensureParticipant = (conversation: Conversation, userId: string): void => {
  if (![conversation.umkmId, conversation.creatorId].includes(userId)) {
    throw new ChatServiceError('forbidden', 'Kamu bukan participant percakapan ini.');
  }
};

const buildLastMessage = (input: SendMessageInput): string => {
  if (input.content?.trim()) return input.content.trim().slice(0, 1000);
  if (input.type === 'offer') return 'Offer dikirim';
  return 'Pesan baru';
};

export const createConversation = async (data: CreateConversationInput): Promise<Conversation> => {
  const umkmId = requireText(data.umkmId, 'UMKM ID wajib diisi.');
  const creatorId = requireText(data.creatorId, 'Creator ID wajib diisi.');

  try {
    const user = await account.get();
    if (![umkmId, creatorId].includes(user.$id)) {
      throw new ChatServiceError('forbidden', 'Kamu tidak dapat membuat percakapan untuk user lain.');
    }

    const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.conversations, [
      Query.equal('umkm_id', umkmId),
      Query.equal('creator_id', creatorId),
      Query.limit(1),
    ]);

    if (existing.documents[0]) return mapConversation(existing.documents[0]);

    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.conversations,
      ID.unique(),
      { umkm_id: umkmId, creator_id: creatorId },
      [Permission.read(Role.user(umkmId)), Permission.read(Role.user(creatorId)), Permission.update(Role.user(umkmId)), Permission.update(Role.user(creatorId))]
    );

    return mapConversation(document);
  } catch (err) {
    throw mapError(err, 'Gagal membuat percakapan. Coba lagi.');
  }
};

export const sendMessage = async (data: SendMessageInput): Promise<ChatMessage> => {
  const conversationId = requireText(data.conversationId, 'Conversation ID wajib diisi.');
  const type = data.type || 'text';

  if (type === 'text' && !data.content?.trim()) {
    throw new ChatServiceError('validation', 'Pesan tidak boleh kosong.');
  }

  try {
    const user = await account.get();
    const conversationDocument = await databases.getDocument(DATABASE_ID, COLLECTIONS.conversations, conversationId);
    const conversation = mapConversation(conversationDocument);
    ensureParticipant(conversation, user.$id);

    const payload: Record<string, any> = {
      conversation_id: conversationId,
      sender_id: user.$id,
      message_type: type,
    };

    if (data.content?.trim()) payload.content = data.content.trim();
    if (data.offerId) payload.offer_id = data.offerId;

    const message = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.messages,
      ID.unique(),
      payload,
      [Permission.read(Role.user(conversation.umkmId)), Permission.read(Role.user(conversation.creatorId))]
    );

    await databases.updateDocument(DATABASE_ID, COLLECTIONS.conversations, conversationId, {
      last_message: buildLastMessage(data),
      last_message_at: new Date().toISOString(),
    });

    return mapMessage(message);
  } catch (err) {
    throw mapError(err, 'Gagal mengirim pesan. Coba lagi.');
  }
};

export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  requireText(conversationId, 'Conversation ID wajib diisi.');

  try {
    const user = await account.get();

    const unreadMessages = await databases.listDocuments(DATABASE_ID, COLLECTIONS.messages, [
      Query.equal('conversation_id', conversationId),
      Query.notEqual('sender_id', user.$id),
      Query.isNull('read_at'),
      Query.limit(100),
    ]);

    const now = new Date().toISOString();

    for (const msg of unreadMessages.documents) {
      await databases.updateDocument(DATABASE_ID, COLLECTIONS.messages, msg.$id, {
        read_at: now,
      });
    }
  } catch (err) {
    throw mapError(err, 'Gagal menandai pesan telah dibaca.');
  }
};

export const getMessages = async (conversationId: string, limit = 50): Promise<ChatMessage[]> => {
  requireText(conversationId, 'Conversation ID wajib diisi.');

  try {
    const { Query } = await import('appwrite');
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.messages, [
      Query.equal('conversation_id', conversationId),
      Query.orderDesc('$createdAt'),
      Query.limit(limit),
    ]);

    return response.documents.map(mapMessage).reverse();
  } catch (err) {
    throw mapError(err, 'Gagal memuat pesan.');
  }
};
