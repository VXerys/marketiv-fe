import { ID, Permission, Query, Role } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { ServiceResult } from "@/types/domain";
import type { ChatMessage } from "@/types/umkm-dashboard.types";
import {
  type Doc,
  str,
  num,
  ok,
  fail,
  failFromError,
  failFromWriteError,
  requireUserId,
} from "@/services/shared/service-result";

/**
 * Percakapan & pesan — dipakai dashboard UMKM maupun Kreator.
 *
 * Ditaruh di `shared/` karena logikanya identik untuk kedua role: `conversations`
 * di-scope per pasangan peserta, bukan per peran. Menyalinnya ke dua service
 * domain akan mengulang bug yang sama dua kali.
 *
 * Mirror 00_BACKEND/src/services/chat.service.ts.
 *
 * ⚠️ SNAKE_CASE. `conversations` dan `messages` adalah satu-satunya collection
 * di seluruh skema yang memakai snake_case (`umkm_id`, `creator_id`,
 * `last_message`, `conversation_id`, `sender_id`, `message_type`, `read_at`).
 * Jangan menyalin pola camelCase dari service lain ke sini.
 *
 * ⚠️ PERMISSION. Sejak pengetatan gelombang 2, `conversations` dan `messages`
 * hanya punya `create("users")` di level koleksi — tanpa `read`. Artinya setiap
 * baris WAJIB memasang permission untuk kedua pihak saat dibuat; kalau tidak,
 * lawan bicara tidak akan pernah bisa membacanya dan tidak ada pesan error yang
 * menjelaskan kenapa.
 */

const DB = appwriteConfig.databaseId;
const CONVERSATIONS = "conversations";
const MESSAGES = "messages";
const OFFERS = "offers";

/** Batas kolom `messages.content` di appwrite.config.json. */
const MAX_MESSAGE_LENGTH = 2000;
/** Batas kolom `conversations.last_message`. Lebih kecil dari content. */
const MAX_LAST_MESSAGE_LENGTH = 1000;

export type ConversationFlag = {
  id: string;
  umkmId: string;
  creatorId: string;
  isArchived: boolean;
};

const mapConversation = (d: Doc): ConversationFlag => ({
  id: str(d.$id),
  umkmId: str(d.umkm_id),
  creatorId: str(d.creator_id),
  isArchived: Boolean(d.is_archived),
});

/**
 * Kunci gabung daftar negosiasi ↔ percakapan. Satu percakapan per pasangan
 * (unique index `idx_umkm_creator`).
 *
 * Sejak DTO negosiasi di-key oleh conversationId dan membawa `isArchived`
 * sendiri, helper ini tidak lagi dibutuhkan untuk menggabungkan status arsip.
 * Dipertahankan karena masih berguna untuk deduplikasi sisi klien.
 */
export const conversationPairKey = (umkmId: string, creatorId: string): string =>
  `${umkmId}:${creatorId}`;

/** Permission baris: kedua peserta membaca dan memperbarui. */
const participantPermissions = (umkmId: string, creatorId: string) => [
  Permission.read(Role.user(umkmId)),
  Permission.read(Role.user(creatorId)),
  Permission.update(Role.user(umkmId)),
  Permission.update(Role.user(creatorId)),
];

/**
 * Percakapan milik sesi aktif, apa pun perannya.
 *
 * Dua query lalu digabung, bukan `Query.or`: seseorang bisa berperan UMKM di
 * satu percakapan dan kreator di percakapan lain, dan `conversations` tidak
 * punya index gabungan untuk itu.
 */
export async function getMyConversationsFromAppwrite(): Promise<
  ServiceResult<ConversationFlag[]>
> {
  const auth = await requireUserId<ConversationFlag[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const [asUmkm, asCreator] = await Promise.all([
      databases.listDocuments(DB, CONVERSATIONS, [
        Query.equal("umkm_id", auth.userId),
        Query.limit(100),
      ]),
      databases.listDocuments(DB, CONVERSATIONS, [
        Query.equal("creator_id", auth.userId),
        Query.limit(100),
      ]),
    ]);

    const byId = new Map<string, ConversationFlag>();
    for (const doc of [...asUmkm.documents, ...asCreator.documents]) {
      const mapped = mapConversation(doc as unknown as Doc);
      byId.set(mapped.id, mapped);
    }
    return ok([...byId.values()]);
  } catch (err) {
    return failFromError<ConversationFlag[]>(err, []);
  }
}

/**
 * Mulai (atau lanjutkan) percakapan dengan seorang kreator. UMKM-only —
 * pemanggilnya selalu menjadi `umkm_id`.
 *
 * Percakapan yang sudah ada dikembalikan apa adanya, bukan dianggap error.
 * `conversations` punya unique index `umkm_id + creator_id`, jadi ada DUA jalur
 * yang harus menghasilkan hal yang sama: pemeriksaan di awal (jalur normal) dan
 * penangkapan 409 (dua tab menekan "Chat" bersamaan). Tanpa yang kedua, balapan
 * itu tampil sebagai "Gagal menyimpan data" padahal percakapannya ada.
 */
export async function createConversationInAppwrite(
  creatorId: string
): Promise<ServiceResult<string>> {
  const auth = await requireUserId<string>("");
  if (!auth.ok) return auth.result;
  if (!creatorId) return fail("Kreator tidak valid.", "validation", "");
  if (creatorId === auth.userId) {
    return fail("Tidak bisa memulai percakapan dengan diri sendiri.", "validation", "");
  }

  try {
    const existing = await findConversationByPair(auth.userId, creatorId);
    if (existing) return ok(existing);

    const created = await databases.createDocument(
      DB,
      CONVERSATIONS,
      ID.unique(),
      {
        umkm_id: auth.userId,
        creator_id: creatorId,
        last_message: "",
        last_message_at: new Date().toISOString(),
        is_archived: false,
      },
      participantPermissions(auth.userId, creatorId)
    );
    return ok(str(created.$id));
  } catch (err) {
    // 409 = unique index menolak duplikat. Percakapannya ada, ambil saja.
    if ((err as { code?: number })?.code === 409) {
      const raced = await findConversationByPair(auth.userId, creatorId).catch(() => null);
      if (raced) return ok(raced);
    }
    return failFromWriteError<string>(err, "");
  }
}

async function findConversationByPair(
  umkmId: string,
  creatorId: string
): Promise<string | null> {
  const res = await databases.listDocuments(DB, CONVERSATIONS, [
    Query.equal("umkm_id", umkmId),
    Query.equal("creator_id", creatorId),
    Query.limit(1),
  ]);
  return res.documents[0] ? str(res.documents[0].$id) : null;
}

/** Peserta percakapan + peran pemanggil, atau null bila bukan peserta. */
async function loadParticipation(conversationId: string, userId: string) {
  const doc = (await databases.getDocument(
    DB,
    CONVERSATIONS,
    conversationId
  )) as unknown as Doc;

  const umkmId = str(doc.umkm_id);
  const creatorId = str(doc.creator_id);
  if (umkmId !== userId && creatorId !== userId) return null;

  return {
    umkmId,
    creatorId,
    role: umkmId === userId ? ("umkm" as const) : ("creator" as const),
  };
}

/**
 * Kirim pesan teks.
 *
 * `conversations.last_message` sengaja diperbarui SETELAH pesannya tersimpan.
 * Urutan sebaliknya bisa meninggalkan ringkasan percakapan yang menjanjikan
 * pesan yang tidak pernah ada.
 */
export async function sendMessageInAppwrite(
  conversationId: string,
  content: string
): Promise<ServiceResult<ChatMessage>> {
  const empty = null as unknown as ChatMessage;
  const auth = await requireUserId<ChatMessage>(empty);
  if (!auth.ok) return auth.result;

  const text = content.trim();
  if (!text) return fail("Pesan tidak boleh kosong.", "validation", empty);
  if (text.length > MAX_MESSAGE_LENGTH) {
    return fail(`Pesan maksimal ${MAX_MESSAGE_LENGTH} karakter.`, "validation", empty);
  }

  try {
    const participation = await loadParticipation(conversationId, auth.userId);
    if (!participation) return fail("Percakapan tidak ditemukan.", "not_found", empty);

    const created = await databases.createDocument(
      DB,
      MESSAGES,
      ID.unique(),
      {
        conversation_id: conversationId,
        sender_id: auth.userId,
        message_type: "text",
        content: text,
        offer_id: null,
        read_at: null,
      },
      participantPermissions(participation.umkmId, participation.creatorId)
    );

    await databases.updateDocument(DB, CONVERSATIONS, conversationId, {
      last_message: text.slice(0, MAX_LAST_MESSAGE_LENGTH),
      last_message_at: new Date().toISOString(),
    });

    return ok({
      id: str(created.$id),
      conversationId,
      senderId: auth.userId,
      senderRole: participation.role,
      type: "text",
      content: text,
      isRead: true,
      createdAt: str(created.$createdAt),
    });
  } catch (err) {
    return failFromWriteError<ChatMessage>(err, empty);
  }
}

/**
 * Catat satu pesan bertipe `offer` di dalam percakapan, lalu perbarui
 * ringkasannya. Dipakai `createOfferInAppwrite` setelah baris `offers` dibuat.
 *
 * Diekspor dari sini, bukan disalin ke service UMKM, supaya aturan snake_case
 * dan permission baris hanya ditulis di satu tempat.
 */
export async function appendOfferMessageInAppwrite(
  conversationId: string,
  offerId: string,
  summary: string
): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadParticipation(conversationId, auth.userId);
    if (!participation) return fail("Percakapan tidak ditemukan.", "not_found", null);

    await databases.createDocument(
      DB,
      MESSAGES,
      ID.unique(),
      {
        conversation_id: conversationId,
        sender_id: auth.userId,
        message_type: "offer",
        content: summary.slice(0, MAX_MESSAGE_LENGTH),
        offer_id: offerId,
        read_at: null,
      },
      participantPermissions(participation.umkmId, participation.creatorId)
    );

    await databases.updateDocument(DB, CONVERSATIONS, conversationId, {
      last_message: summary.slice(0, MAX_LAST_MESSAGE_LENGTH),
      last_message_at: new Date().toISOString(),
      offer_id: offerId,
    });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}

/**
 * Riwayat pesan satu percakapan.
 *
 * MENGGANTIKAN `getMessagesByOrderIdFromAppwrite`, yang mengirim `orderId` ke
 * `Query.equal("conversation_id", …)` — kunci yang tidak akan pernah cocok,
 * sehingga chat UMKM selalu kosong.
 *
 * `senderRole` diturunkan dari peserta percakapan, bukan dari perbandingan
 * dengan sesi. Versi lama menandai setiap pesan lawan bicara sebagai "creator",
 * yang salah begitu pembacanya sendiri adalah kreator.
 *
 * Rincian offer di-join di sini: `messages` hanya menyimpan `offer_id`, jadi
 * tanpa join ini kartu offer di chat tidak punya harga maupun deadline untuk
 * ditampilkan. Satu query untuk seluruh percakapan, bukan satu per pesan.
 */
export async function getMessagesByConversationIdInAppwrite(
  conversationId: string
): Promise<ServiceResult<ChatMessage[]>> {
  const auth = await requireUserId<ChatMessage[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadParticipation(conversationId, auth.userId);
    if (!participation) return fail("Percakapan tidak ditemukan.", "not_found", []);

    const [messagesRes, offersRes] = await Promise.all([
      databases.listDocuments(DB, MESSAGES, [
        Query.equal("conversation_id", conversationId),
        Query.orderAsc("$createdAt"),
        Query.limit(200),
      ]),
      databases.listDocuments(DB, OFFERS, [
        Query.equal("conversationId", conversationId),
        Query.limit(100),
      ]),
    ]);

    const offerById = new Map<string, Doc>(
      offersRes.documents.map((o) => [str((o as unknown as Doc).$id), o as unknown as Doc])
    );

    const data: ChatMessage[] = messagesRes.documents.map((m) => {
      const md = m as unknown as Doc;
      const senderId = str(md.sender_id);
      const type = str(md.message_type) || "text";
      const offer = str(md.offer_id) ? offerById.get(str(md.offer_id)) : undefined;

      return {
        id: str(md.$id),
        conversationId,
        senderId,
        senderRole:
          type === "system"
            ? "system"
            : senderId === participation.umkmId
              ? "umkm"
              : "creator",
        type: type as ChatMessage["type"],
        content: str(md.content),
        offerData: offer
          ? {
              offerId: str(offer.$id),
              finalPrice: num(offer.price),
              scope: str(offer.description),
              deadline: str(offer.deadline),
              revisionCount: num(offer.revisionLimit),
            }
          : undefined,
        isRead: str(md.read_at) !== "",
        createdAt: str(md.$createdAt),
      };
    });
    return ok(data);
  } catch (err) {
    return failFromError<ChatMessage[]>(err, []);
  }
}

/**
 * Tandai pesan lawan bicara sebagai sudah dibaca.
 *
 * `messages.read_at` selalu ditulis `null` saat kirim dan TIDAK PERNAH diisi
 * oleh siapa pun — sementara `get-umkm-negotiations` dan
 * `get-creator-negotiations` menghitung `unreadCount` justru dari kolom itu.
 * Akibatnya badge belum-dibaca naik monoton dan tidak pernah turun walau
 * percakapannya sudah dibuka berkali-kali. Index `idx_read_at` sudah ada sejak
 * awal; yang hilang hanya penulisnya.
 *
 * Hanya pesan LAWAN BICARA yang ditandai — pesan sendiri tidak pernah dihitung
 * unread oleh kedua Function, jadi menandainya hanya menambah tulisan sia-sia.
 *
 * Kegagalan sebagian tidak dinaikkan sebagai error: badge yang telat turun jauh
 * lebih ringan daripada ruang chat yang menolak terbuka. Pemanggil boleh
 * mengabaikan hasilnya.
 */
export async function markConversationReadInAppwrite(
  conversationId: string
): Promise<ServiceResult<number>> {
  const auth = await requireUserId<number>(0);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadParticipation(conversationId, auth.userId);
    if (!participation) return fail("Percakapan tidak ditemukan.", "not_found", 0);

    const unread = await databases.listDocuments(DB, MESSAGES, [
      Query.equal("conversation_id", conversationId),
      Query.notEqual("sender_id", auth.userId),
      Query.isNull("read_at"),
      Query.limit(200),
    ]);
    if (unread.documents.length === 0) return ok(0);

    const readAt = new Date().toISOString();
    const results = await Promise.allSettled(
      unread.documents.map((m) =>
        databases.updateDocument(DB, MESSAGES, str((m as unknown as Doc).$id), {
          read_at: readAt,
        })
      )
    );
    return ok(results.filter((r) => r.status === "fulfilled").length);
  } catch (err) {
    return failFromError<number>(err, 0);
  }
}

/**
 * Arsipkan / batal arsip. BUKAN hapus — pesan di dalamnya tetap utuh sebagai
 * riwayat negosiasi; yang berubah hanya visibilitas di inbox.
 */
export async function setConversationArchivedInAppwrite(
  conversationId: string,
  archived: boolean
): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadParticipation(conversationId, auth.userId);
    if (!participation) return fail("Percakapan tidak ditemukan.", "not_found", null);

    await databases.updateDocument(DB, CONVERSATIONS, conversationId, {
      is_archived: archived,
    });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}
