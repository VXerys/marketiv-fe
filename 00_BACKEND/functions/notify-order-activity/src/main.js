import { createHash } from "node:crypto";
import { Client, Databases, Permission, Role } from "node-appwrite";

/**
 * notify-order-activity
 *
 * Notifikasi dua arah untuk tahap pengerjaan Rate Card Order:
 *   deliverables.rows.*.create → UMKM: "hasil kerja masuk, silakan review"
 *   revisions.rows.*.create    → Kreator: "UMKM minta revisi"
 *
 * MENGGANTIKAN `notify-client-review` yang disebut
 * docs/03_Workflows/30_RateCard_Order.md tapi tidak pernah dibuat.
 *
 * SATU FUNCTION, DUA EVENT — disengaja. Keduanya butuh join yang persis sama
 * (baris → `orders` → pihak lawan) dan menulis ke tabel yang sama dengan pola
 * dedup yang sama. Memecahnya jadi dua Function berarti dua deployment, dua
 * set env var, dan dua tempat yang harus diingat saat skema berubah — persis
 * beban yang ingin dikurangi.
 *
 * Pembeda payload-nya sederhana dan tidak ambigu: baris `deliverables` punya
 * `version`, baris `revisions` punya `requestedBy`. Header `x-appwrite-event`
 * sengaja tidak diandalkan — formatnya sudah pernah berubah antar versi
 * Appwrite (lihat insiden prefix `tables.` vs `collections.` 2026-07-27).
 */

export default async ({ req, res, log, error }) => {
  try {
    const env = getEnv(req);
    const row = parseBody(req);
    if (!row?.$id) return json(res, { error: "Missing row payload" }, 400);

    const orderId = str(row.orderId);
    if (!orderId) return json(res, { error: "Missing order id" }, 400);

    const databases = createDatabasesClient(env);
    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);

    const isDeliverable = row.version !== undefined && row.version !== null;
    const isRevision = !isDeliverable && !!str(row.requestedBy);

    if (!isDeliverable && !isRevision) {
      return json(res, { status: "ignored", reason: "unrecognised row shape" });
    }

    if (isDeliverable) {
      const umkmId = str(order.umkmId);
      if (!umkmId) return json(res, { status: "ignored", reason: "order has no umkm" });

      await notify(databases, env, {
        userId: umkmId,
        sourceId: row.$id,
        kind: "deliverable_submitted",
        title: "Hasil Kerja Masuk",
        message:
          `Kreator mengirim hasil kerja versi ${Number(row.version) || 1}. ` +
          "Buka ruang negosiasi untuk meninjau dan menyetujuinya.",
        type: "deliverable_submitted",
      }, log);

      log(`Notified UMKM ${umkmId} of deliverable ${row.$id}`);
      return json(res, { status: "ok", notified: umkmId });
    }

    const creatorId = str(order.creatorId);
    if (!creatorId) return json(res, { status: "ignored", reason: "order has no creator" });

    await notify(databases, env, {
      userId: creatorId,
      sourceId: row.$id,
      kind: "revision_requested",
      title: "UMKM Minta Revisi",
      // Pesan revisi ikut dikutip supaya kreator tahu apa yang harus diperbaiki
      // tanpa harus membuka aplikasi lebih dulu. Kolom `notifications.message`
      // dibatasi 1000 karakter, jadi kutipannya dipangkas.
      message: clamp(`"${str(row.message)}"`, 900),
      type: "revision_requested",
    }, log);

    log(`Notified creator ${creatorId} of revision ${row.$id}`);
    return json(res, { status: "ok", notified: creatorId });
  } catch (err) {
    error(err?.stack || err?.message || String(err));
    return json(res, { error: "Internal server error" }, 500);
  }
};

/**
 * Tulis satu baris notifikasi.
 *
 * Id dokumennya deterministik dari (sourceId, kind), jadi event yang terkirim
 * ulang tidak menghasilkan notifikasi ganda — 409 dari server justru hasil yang
 * benar.
 */
async function notify(databases, env, payload, log) {
  try {
    await databases.createDocument(
      env.databaseId,
      env.notificationsCollectionId,
      deterministicNotificationId(payload.sourceId, payload.kind),
      {
        userId: payload.userId,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      // `notifications` punya $permissions kosong + rowSecurity — tanpa
      // permission baris, notifikasi tidak akan pernah terbaca pemiliknya.
      [Permission.read(Role.user(payload.userId)), Permission.update(Role.user(payload.userId))]
    );
  } catch (err) {
    if (err?.code === 409) return;
    log(`Notifikasi ${payload.kind} gagal untuk ${payload.userId}: ${err?.message || String(err)}`);
  }
}

/** "ntf" + 29 hex = 32 karakter, valid sebagai document id Appwrite. */
function deterministicNotificationId(sourceId, kind) {
  const digest = createHash("sha256").update(`${sourceId}:${kind}`).digest("hex");
  return `ntf${digest.slice(0, 29)}`;
}

function getEnv(req) {
  const env = {
    appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
    appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
    appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID,
    ordersCollectionId: process.env.ORDERS_COLLECTION_ID || process.env.NEXT_PUBLIC_ORDER_COLLECTION || "orders",
    notificationsCollectionId: process.env.NOTIFICATIONS_COLLECTION_ID || "notifications",
  };
  const missing = Object.entries(env).filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  return env;
}

function createDatabasesClient(env) {
  const client = new Client()
    .setEndpoint(env.appwriteEndpoint)
    .setProject(env.appwriteProjectId)
    .setKey(env.appwriteApiKey);
  return new Databases(client);
}

function parseBody(req) {
  if (req.bodyJson && typeof req.bodyJson === "object") return req.bodyJson;
  const rawBody = req.bodyText || req.body || "{}";
  return typeof rawBody === "object" ? rawBody : JSON.parse(rawBody);
}

function str(value) {
  return typeof value === "string" ? value : "";
}

function clamp(value, max) {
  return value.length <= max ? value : `${value.slice(0, max)}…`;
}

function json(res, body, statusCode = 200) {
  return res.json(body, statusCode, { "content-type": "application/json" });
}
