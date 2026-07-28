import { ID, Permission, Query, Role } from "appwrite";
import { databases } from "@/lib/appwrite/databases";
import { appwriteConfig } from "@/lib/appwrite/config";
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
 * - `revisions` beda: kedua pihak boleh update, karena menutup revisi tidak
 *   memindahkan uang.
 */

const DB = appwriteConfig.databaseId;
const ORDERS = "orders";
const OFFERS = "offers";
const DELIVERABLES = "deliverables";
const REVISIONS = "revisions";
const RATE_CARD_PACKAGES = "rate_card_packages";

/** Dipakai kalau order tidak punya offer maupun paket — sejajar order.service.ts:281. */
const DEFAULT_REVISION_LIMIT = 3;

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
    const participation = await loadOrderParticipation(payload.orderId, auth.userId);
    if (!participation) return fail("Pesanan tidak ditemukan.", "not_found", empty);

    if (participation.role !== "creator") {
      return fail("Hanya kreator pengerja yang dapat mengirim deliverable.", "forbidden", empty);
    }
    if (participation.status !== "in_progress" && participation.status !== "revision") {
      return fail(
        "Deliverable hanya bisa dikirim saat pesanan sedang dikerjakan atau direvisi.",
        "validation",
        empty
      );
    }

    const existing = await databases.listDocuments(DB, DELIVERABLES, [
      Query.equal("orderId", payload.orderId),
      Query.orderDesc("version"),
      Query.limit(1),
    ]);
    const currentVersion = num((existing.documents[0] as unknown as Doc)?.version);

    const created = await databases.createDocument(
      DB,
      DELIVERABLES,
      ID.unique(),
      {
        orderId: payload.orderId,
        source: payload.source,
        fileUrl: payload.fileUrl,
        // Hanya jalur storage yang punya baris `user_files` untuk ditautkan.
        fileId: payload.source === "storage" ? payload.fileId || null : null,
        notes: payload.notes || null,
        version: currentVersion + 1,
        status: "submitted",
        createdAt: new Date().toISOString(),
      },
      // Kedua pihak membaca; HANYA UMKM yang boleh update. Lihat catatan jalur
      // uang di header file ini.
      [
        Permission.read(Role.user(participation.umkmId)),
        Permission.read(Role.user(participation.creatorId)),
        Permission.update(Role.user(participation.umkmId)),
      ]
    );

    return ok(mapDeliverable(created as unknown as Doc));
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
 * Tiga tulisan sekaligus, dan urutannya disengaja: baris `revisions` dibuat
 * lebih dulu (itu buktinya), lalu deliverable ditandai `revision_requested`,
 * baru order pindah ke `revision`.
 *
 * Penandaan deliverable itu SEBELUMNYA TIDAK PERNAH TERJADI — mirror
 * `order.service.ts:325-360` hanya membuat baris revisi dan memindahkan status
 * order, sehingga deliverable yang ditolak tetap tampil `submitted` selamanya.
 * Dicatat sebagai §E-3 di handoff 2026-07-28.
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
    const participation = await loadOrderParticipation(payload.orderId, auth.userId);
    if (!participation) return fail("Pesanan tidak ditemukan.", "not_found", empty);

    if (participation.role !== "umkm") {
      return fail("Hanya UMKM pemilik pesanan yang dapat meminta revisi.", "forbidden", empty);
    }
    if (participation.status !== "in_progress" && participation.status !== "revision") {
      return fail("Pesanan tidak dalam status yang dapat direvisi.", "validation", empty);
    }

    const revisionLimit = await resolveRevisionLimit(participation.order);
    const used = await databases.listDocuments(DB, REVISIONS, [
      Query.equal("orderId", payload.orderId),
      Query.limit(1),
    ]);
    if (used.total >= revisionLimit) {
      return fail(
        `Batas revisi (${revisionLimit}) sudah tercapai. Setujui apa adanya atau buka sengketa.`,
        "validation",
        empty
      );
    }

    const created = await databases.createDocument(
      DB,
      REVISIONS,
      ID.unique(),
      {
        orderId: payload.orderId,
        requestedBy: auth.userId,
        message: payload.message,
        status: "open",
      },
      // Berbeda dari deliverables: kedua pihak boleh update, karena menutup
      // revisi tidak memindahkan uang.
      [
        Permission.read(Role.user(participation.umkmId)),
        Permission.read(Role.user(participation.creatorId)),
        Permission.update(Role.user(participation.umkmId)),
        Permission.update(Role.user(participation.creatorId)),
      ]
    );

    // Tandai deliverable terbaru sebagai ditolak, supaya kreator tahu versi mana
    // yang harus diperbaiki dan UI tidak lagi menawarkan tombol "Setujui".
    const latest = await databases.listDocuments(DB, DELIVERABLES, [
      Query.equal("orderId", payload.orderId),
      Query.orderDesc("version"),
      Query.limit(1),
    ]);
    const latestDoc = latest.documents[0] as unknown as Doc | undefined;
    if (latestDoc && str(latestDoc.status) === "submitted") {
      await databases.updateDocument(DB, DELIVERABLES, str(latestDoc.$id), {
        status: "revision_requested",
      });
    }

    await databases.updateDocument(DB, ORDERS, payload.orderId, { status: "revision" });

    return ok(mapRevision(created as unknown as Doc));
  } catch (err) {
    return failFromWriteError<Revision>(err, empty, "Alasan revisi tidak valid.");
  }
}

/**
 * Batas revisi diambil dari offer (Jalur B) atau paket rate card (Jalur A).
 * Keduanya tidak ada = pakai default, jangan menolak permintaan revisi hanya
 * karena tautannya hilang.
 */
async function resolveRevisionLimit(order: Doc): Promise<number> {
  try {
    if (str(order.offerId)) {
      const offer = (await databases.getDocument(
        DB,
        OFFERS,
        str(order.offerId)
      )) as unknown as Doc;
      return num(offer.revisionLimit) || DEFAULT_REVISION_LIMIT;
    }
    if (str(order.packageId)) {
      const pkg = (await databases.getDocument(
        DB,
        RATE_CARD_PACKAGES,
        str(order.packageId)
      )) as unknown as Doc;
      return num(pkg.revisionLimit) || DEFAULT_REVISION_LIMIT;
    }
  } catch {
    // Offer/paket terhapus atau tidak terbaca — jatuh ke default.
  }
  return DEFAULT_REVISION_LIMIT;
}
