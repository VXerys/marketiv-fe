import { Query } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import type { ServiceResult } from "@/types/domain";
import {
  type Doc,
  str,
  ok,
  fail,
  failFromError,
  failFromWriteError,
  requireUserId,
} from "@/services/shared/service-result";

/**
 * Arsip percakapan — dipakai dashboard UMKM maupun Kreator.
 *
 * Ditaruh di `shared/` karena logikanya identik untuk kedua role: `conversations`
 * di-scope per pasangan peserta, bukan per peran. Menyalinnya ke dua service
 * domain akan mengulang bug yang sama dua kali.
 *
 * Mirror 00_BACKEND/src/services/chat.service.ts (archive/unarchiveConversation).
 *
 * ⚠️ CATATAN ARSITEKTUR — kenapa ada `conversationPairKey`:
 * Daftar negosiasi di kedua dashboard di-key oleh **orderId**, bukan
 * conversationId (UMKM membaca `orders` langsung; Kreator lewat Function DTO
 * `get-creator-negotiations`). Tidak ada satu pun Function backend yang
 * memfilter `is_archived` — sudah dicek, kata itu tidak muncul sama sekali di
 * `00_BACKEND/functions/`. Jadi filter arsip HARUS dilakukan di klien.
 *
 * Jembatannya adalah constraint unik `umkm_id + creator_id` di `conversations`
 * (docs/02_Modules/Chat/50_Database.md): satu percakapan per pasangan. Dengan
 * itu satu query percakapan cukup untuk memberi status arsip ke seluruh baris
 * negosiasi — tanpa join 3 lompatan order → offer → conversation per baris.
 */

const DB = appwriteConfig.databaseId;
const CONVERSATIONS = "conversations";

/** `conversations` & `messages` snake_case — beda dari collection lain. */
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

/** Kunci gabung daftar negosiasi ↔ percakapan. Satu percakapan per pasangan. */
export const conversationPairKey = (umkmId: string, creatorId: string): string =>
  `${umkmId}:${creatorId}`;

/**
 * Percakapan milik sesi aktif, apa pun perannya.
 *
 * Dua query lalu digabung, bukan `Query.or` — `conversations` punya
 * `read("users")` di level collection yang, karena permission Appwrite bersifat
 * union (bukan irisan), membuat query tanpa filter peserta mengembalikan
 * percakapan orang lain. Menyaring eksplisit di sini adalah pertahanannya.
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
    const doc = (await databases.getDocument(
      DB,
      CONVERSATIONS,
      conversationId
    )) as unknown as Doc;

    const isParticipant =
      str(doc.umkm_id) === auth.userId || str(doc.creator_id) === auth.userId;
    if (!isParticipant) {
      return fail("Percakapan tidak ditemukan.", "not_found", null);
    }

    await databases.updateDocument(DB, CONVERSATIONS, conversationId, {
      is_archived: archived,
    });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}
