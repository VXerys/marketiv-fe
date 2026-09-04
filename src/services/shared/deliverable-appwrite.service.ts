import { Query } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
import { executeFunction, FUNCTION_IDS } from "@/lib/appwrite/functions";
import type { ServiceResult } from "@/types/domain";
import type {
  Deliverable,
  DeliverableStatus,
  DeliverableSource,
  Revision,
  RevisionStatus,
} from "@/types/umkm-dashboard.types";
import {
  uploadDeliverableSchema,
  requestRevisionSchema,
  type UploadDeliverableInput,
  type RequestRevisionInput,
} from "@/lib/validations/deliverable.schema";
import {
  type Doc,
  str,
  num,
  ok,
  fail,
  failValidation,
  failFromError,
  failFromWriteError,
  requireUserId,
} from "@/services/shared/service-result";

/**
 * Deliverable & revisi — dipakai dashboard UMKM maupun Kreator.
 *
 * Ditaruh di `shared/` karena aturan yang paling mudah salah di sini identik
 * untuk kedua peran: nomor versi, permission baris, dan siapa boleh apa.
 * Menyalinnya ke dua service domain akan mengulang kesalahan yang sama dua kali.
 *
 * Mirror 00_BACKEND/src/services/order.service.ts:195-360.
 *
 * ⚠️ INI JALUR UANG. Menandai deliverable `approved` MEMICU `release-escrow`
 * lewat event `deliverables.rows.*.update`, dan Function itu langsung
 * memindahkan dana escrow ke wallet kreator. Karena itu:
 *
 * - Baris deliverable dibuat dengan `update` HANYA untuk UMKM. Kreator tidak
 *   membutuhkannya (kirim ulang membuat baris baru `version + 1`), dan memberi
 *   hak itu sama dengan mengizinkannya menyetujui pekerjaannya sendiri lalu
 *   menarik dananya tanpa UMKM. Guard peran di fungsi-fungsi bawah TIDAK cukup
 *   sendirian — penyerang cukup memanggil `updateDocument` langsung.
 * - `revisions` dibuat oleh trusted Function dan dibaca kedua pihak. Tidak ada
 *   browser update permission; status lifecycle harus tetap server-owned.
 */

const DB = appwriteConfig.databaseId;
const ORDERS = "orders";
const DELIVERABLES = "deliverables";
const REVISIONS = "revisions";

const mapDeliverable = (d: Doc): Deliverable => ({
  id: str(d.$id),
  orderId: str(d.orderId),
  source: (str(d.source) || "external_url") as DeliverableSource,
  fileUrl: str(d.fileUrl),
  fileId: str(d.fileId) || undefined,
  notes: str(d.notes) || undefined,
  version: num(d.version),
  status: (str(d.status) || "submitted") as DeliverableStatus,
  createdAt: str(d.createdAt) || str(d.$createdAt),
});

const mapRevision = (d: Doc): Revision => ({
  id: str(d.$id),
  orderId: str(d.orderId),
  requestedBy: str(d.requestedBy),
  message: str(d.message),
  status: (str(d.status) || "open") as RevisionStatus,
  createdAt: str(d.$createdAt),
});

/** Peserta order + peran pemanggil, atau null bila bukan peserta. */
async function loadOrderParticipation(orderId: string, userId: string) {
  const order = (await databases.getDocument(DB, ORDERS, orderId)) as unknown as Doc;

  const umkmId = str(order.umkmId);
  const creatorId = str(order.creatorId);
  if (umkmId !== userId && creatorId !== userId) return null;

  return {
    order,
    umkmId,
    creatorId,
    status: str(order.status),
    role: umkmId === userId ? ("umkm" as const) : ("creator" as const),
  };
}

/** Riwayat deliverable satu order, versi menaik. */
export async function getDeliverablesInAppwrite(
  orderId: string
): Promise<ServiceResult<Deliverable[]>> {
  const auth = await requireUserId<Deliverable[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadOrderParticipation(orderId, auth.userId);
    if (!participation) return fail("Pesanan tidak ditemukan.", "not_found", []);

    const res = await databases.listDocuments(DB, DELIVERABLES, [
      Query.equal("orderId", orderId),
      Query.orderAsc("version"),
      Query.limit(50),
    ]);
    return ok(res.documents.map((d) => mapDeliverable(d as unknown as Doc)));
  } catch (err) {
    return failFromError<Deliverable[]>(err, []);
  }
}

/** Riwayat permintaan revisi satu order. */
export async function getRevisionsInAppwrite(
  orderId: string
): Promise<ServiceResult<Revision[]>> {
  const auth = await requireUserId<Revision[]>([]);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadOrderParticipation(orderId, auth.userId);
    if (!participation) return fail("Pesanan tidak ditemukan.", "not_found", []);

    const res = await databases.listDocuments(DB, REVISIONS, [
      Query.equal("orderId", orderId),
      Query.orderDesc("$createdAt"),
      Query.limit(50),
    ]);
    return ok(res.documents.map((d) => mapRevision(d as unknown as Doc)));
  } catch (err) {
    return failFromError<Revision[]>(err, []);
  }
}

/**
 * Kirim hasil kerja. KREATOR-ONLY.
 *
 * Setiap kiriman adalah BARIS BARU dengan `version + 1`. Memperbarui baris lama
 * akan menghapus jejak apa yang pernah ditolak UMKM, dan `revisionLimit` jadi
 * tidak bisa diaudit.
 */
export async function uploadDeliverableInAppwrite(
  input: UploadDeliverableInput
): Promise<ServiceResult<Deliverable>> {
  const empty = null as unknown as Deliverable;
  const auth = await requireUserId<Deliverable>(empty);
  if (!auth.ok) return auth.result;

  const parsed = uploadDeliverableSchema.safeParse(input);
  if (!parsed.success) {
    return failValidation<Deliverable>(
      parsed.error.issues[0]?.message ?? "Data deliverable tidak valid.",
      empty
    );
  }
  const payload = parsed.data;

  try {
    const created = await executeFunction<Deliverable>(
      FUNCTION_IDS.submitRatecardDeliverable,
      payload
    );
    return ok(created);
  } catch (err) {
    return failFromWriteError<Deliverable>(err, empty, "Data deliverable tidak valid.");
  }
}

/**
 * Setujui deliverable. UMKM-ONLY.
 *
 * ⚠️ INI YANG MENCAIRKAN DANA. Tulisan `status: "approved"` memicu
 * `release-escrow`, yang memindahkan escrow ke wallet kreator dikurangi fee 2%
 * (ADR-008) dan menandai order `completed`.
 *
 * Semuanya berjalan ASINKRON lewat event database. Pemanggil TIDAK boleh
 * menganggap ordernya langsung `completed` — poll DTO negosiasi.
 */
export async function approveDeliverableInAppwrite(
  orderId: string,
  deliverableId: string
): Promise<ServiceResult<null>> {
  const auth = await requireUserId<null>(null);
  if (!auth.ok) return auth.result;
  try {
    const participation = await loadOrderParticipation(orderId, auth.userId);
    if (!participation) return fail("Pesanan tidak ditemukan.", "not_found", null);

    if (participation.role !== "umkm") {
      return fail("Hanya UMKM pemilik pesanan yang dapat menyetujui deliverable.", "forbidden", null);
    }

    const deliverable = (await databases.getDocument(
      DB,
      DELIVERABLES,
      deliverableId
    )) as unknown as Doc;

    if (str(deliverable.orderId) !== orderId) {
      return fail("Deliverable tidak sesuai dengan pesanan.", "validation", null);
    }
    if (str(deliverable.status) === "approved") {
      return fail("Deliverable ini sudah disetujui.", "validation", null);
    }

    await databases.updateDocument(DB, DELIVERABLES, deliverableId, { status: "approved" });
    return ok(null);
  } catch (err) {
    return failFromWriteError<null>(err, null);
  }
}

/**
 * Minta revisi. UMKM-ONLY.
 *
 * Trusted Function command. Browser must not create a revision or update
 * deliverables/orders: it cannot assign Creator row permission and orders has
 * no browser update permission.
 */
export async function requestRevisionInAppwrite(
  input: RequestRevisionInput
): Promise<ServiceResult<Revision>> {
  const empty = null as unknown as Revision;
  const auth = await requireUserId<Revision>(empty);
  if (!auth.ok) return auth.result;

  const parsed = requestRevisionSchema.safeParse(input);
  if (!parsed.success) {
    return failValidation<Revision>(
      parsed.error.issues[0]?.message ?? "Alasan revisi tidak valid.",
      empty
    );
  }
  const payload = parsed.data;

  try {
    const created = await executeFunction<Revision>(
      FUNCTION_IDS.requestRatecardRevision,
      payload
    );
    return ok(created);
  } catch (err) {
    return failFromWriteError<Revision>(err, empty, "Alasan revisi tidak valid.");
  }
}
