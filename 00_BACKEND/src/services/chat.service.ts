import { Query } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, FUNCTIONS, databases, functions } from '../lib/appwrite';

export type MessageType = 'text' | 'offer' | 'system';

export type Conversation = {
  id: string;
  umkmId: string;
  creatorId: string;
  offerId?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  isArchived?: boolean;
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
  isArchived: document.is_archived ?? false,
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

const parseFunctionResponse = <T>(responseBody: string): T => {
  if (!responseBody) throw new ChatServiceError('server', 'Response function kosong.');
  try {
    return JSON.parse(responseBody) as T;
  } catch (err) {
    throw new ChatServiceError('server', 'Response function tidak valid.', err);
  }
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
    if (user.$id !== umkmId) {
      throw new ChatServiceError('forbidden', 'Kamu tidak dapat membuat percakapan untuk user lain.');
    }
    const execution = await functions.createExecution(
      FUNCTIONS.createConversation,
      JSON.stringify({ creatorId }),
      false
    );
    if (execution.status === 'failed') {
      throw new ChatServiceError('server', 'Gagal membuat percakapan. Coba lagi.');
    }
    const result = parseFunctionResponse<{ conversationId?: string; error?: string }>(execution.responseBody);
    if (!result.conversationId) {
      throw new ChatServiceError('server', result.error || 'Response percakapan tidak lengkap.');
    }
    return {
      id: result.conversationId,
      umkmId,
      creatorId,
      isArchived: false,
    };
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
    const execution = await functions.createExecution(
      FUNCTIONS.sendMessage,
      JSON.stringify({
        conversationId,
        content: data.content?.trim(),
      }),
      false
    );
    if (execution.status === 'failed') {
      throw new ChatServiceError('server', 'Gagal mengirim pesan. Coba lagi.');
    }
    const result = parseFunctionResponse<{
      id?: string;
      conversationId?: string;
      senderId?: string;
      type?: MessageType;
      content?: string;
      createdAt?: string;
      error?: string;
    }>(execution.responseBody);
    if (!result.id || !result.conversationId || !result.senderId || !result.type) {
      throw new ChatServiceError('server', result.error || 'Response pesan tidak lengkap.');
    }
    return {
      id: result.id,
      conversationId: result.conversationId,
      senderId: result.senderId,
      type: result.type,
      content: result.content,
      createdAt: result.createdAt,
    };
  } catch (err) {
    throw mapError(err, 'Gagal mengirim pesan. Coba lagi.');
  }
};

export const markConversationAsRead = async (conversationId: string): Promise<void> => {
  requireText(conversationId, 'Conversation ID wajib diisi.');

  try {
    const execution = await functions.createExecution(
      FUNCTIONS.markConversationRead,
      JSON.stringify({ conversationId }),
      false
    );
    if (execution.status === 'failed') {
      throw new ChatServiceError('server', 'Gagal menandai pesan telah dibaca.');
    }
    const result = parseFunctionResponse<{ ok?: boolean; error?: string }>(execution.responseBody);
    if (!result.ok) throw new ChatServiceError('server', result.error || 'Gagal menandai pesan telah dibaca.');
  } catch (err) {
    throw mapError(err, 'Gagal menandai pesan telah dibaca.');
  }
};

/**
 * Inbox percakapan milik user yang sedang login (UMKM maupun kreator).
 * Collection `conversations` memakai snake_case attribute.
 * @param includeArchived true untuk tampilkan semua (termasuk arsip), false (default) untuk filter aktif.
 */
export const getConversations = async (limit = 50, includeArchived = false): Promise<Conversation[]> => {
  try {
    const user = await account.get();

    const queries = [
      Query.or([Query.equal('umkm_id', user.$id), Query.equal('creator_id', user.$id)]),
      Query.orderDesc('last_message_at'),
      Query.limit(limit),
    ];

    if (!includeArchived) {
      queries.splice(1, 0, Query.equal('is_archived', false));
    }

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.conversations, queries);

    return response.documents.map(mapConversation);
  } catch (err) {
    throw mapError(err, 'Gagal memuat daftar percakapan.');
  }
};

export const getConversationById = async (conversationId: string): Promise<Conversation> => {
  requireText(conversationId, 'Conversation ID wajib diisi.');

  try {
    const user = await account.get();
    const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.conversations, conversationId);
    const conversation = mapConversation(document);
    ensureParticipant(conversation, user.$id);
    return conversation;
  } catch (err) {
    throw mapError(err, 'Gagal memuat percakapan.');
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

/** Arsipkan percakapan — sembunyikan dari inbox utama, pesan tetap ada. */
export const archiveConversation = async (conversationId: string): Promise<void> => {
  requireText(conversationId, 'Conversation ID wajib diisi.');

  try {
    const execution = await functions.createExecution(
      FUNCTIONS.patchConversationArchive,
      JSON.stringify({ conversationId, isArchived: true }),
      false
    );
    if (execution.status === 'failed') {
      throw new ChatServiceError('server', 'Gagal mengarsipkan percakapan.');
    }
    const result = parseFunctionResponse<{ ok?: boolean; error?: string }>(execution.responseBody);
    if (!result.ok) throw new ChatServiceError('server', result.error || 'Gagal mengarsipkan percakapan.');
  } catch (err) {
    throw mapError(err, 'Gagal mengarsipkan percakapan.');
  }
};

/** Kembalikan percakapan dari arsip ke inbox utama. */
export const unarchiveConversation = async (conversationId: string): Promise<void> => {
  requireText(conversationId, 'Conversation ID wajib diisi.');

  try {
    const execution = await functions.createExecution(
      FUNCTIONS.patchConversationArchive,
      JSON.stringify({ conversationId, isArchived: false }),
      false
    );
    if (execution.status === 'failed') {
      throw new ChatServiceError('server', 'Gagal mengembalikan percakapan dari arsip.');
    }
    const result = parseFunctionResponse<{ ok?: boolean; error?: string }>(execution.responseBody);
    if (!result.ok) throw new ChatServiceError('server', result.error || 'Gagal mengembalikan percakapan dari arsip.');
  } catch (err) {
    throw mapError(err, 'Gagal mengembalikan percakapan dari arsip.');
  }
};
