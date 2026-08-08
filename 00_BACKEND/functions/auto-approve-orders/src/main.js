import { createHash } from "node:crypto";
import { Client, Databases, Query, ID, Permission, Role } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const env = {
      appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
      appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
      databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID || "6a4c8598001da3b0d7f0",
      ordersCollectionId: "orders",
      deliverablesCollectionId: "deliverables",
      notificationsCollectionId: "notifications",
    };
    if (!env.appwriteApiKey) return res.json({ error: "Missing API Key" }, 500);

    const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
    const databases = new Databases(client);

    const now = new Date();

    // 1. Check auto-approve
    const deliveries = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [
       Query.equal("status", ["submitted", "delivered"]),
       Query.limit(100)
    ]);
    
    let approvedCount = 0;
    for (const dev of deliveries.documents) {
       const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, dev.orderId);
       if (!["in_progress", "revision"].includes(order.status)) continue;
       if (!order.review_deadline_at) continue;
       
       const deadline = new Date(order.review_deadline_at);
       if (now >= deadline) {
           await databases.updateDocument(env.databaseId, env.deliverablesCollectionId, dev.$id, {
               status: "approved"
           });
           await databases.updateDocument(env.databaseId, env.ordersCollectionId, order.$id, {
               auto_approved: true
           });
           
           try {
             const digest = createHash("sha256").update(`${order.$id}:auto_approved`).digest("hex");
             await databases.createDocument(env.databaseId, env.notificationsCollectionId, `ntf${digest.slice(0, 29)}`, {
                userId: order.umkmId,
                title: "Pesanan Otomatis Disetujui",
                message: "Tenggat waktu review telah lewat. Pesanan disetujui otomatis.",
                type: "system",
                isRead: false,
                createdAt: new Date().toISOString()
             }, [Permission.read(Role.user(order.umkmId)), Permission.update(Role.user(order.umkmId))]);
           } catch(e) {}
           approvedCount++;
       }
    }

    // 2. Check Reminder H-1
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const orders = await databases.listDocuments(env.databaseId, env.ordersCollectionId, [
       Query.equal("status", ["in_progress", "revision"]),
       Query.isNotNull("review_deadline_at"),
       Query.isNull("reminder_sent_at"),
       Query.lessThanEqual("review_deadline_at", tomorrow.toISOString()),
       Query.limit(100)
    ]);
    
    let reminderCount = 0;
    for (const order of orders.documents) {
       await databases.updateDocument(env.databaseId, env.ordersCollectionId, order.$id, {
          reminder_sent_at: now.toISOString()
       });
       try {
         const digest = createHash("sha256").update(`${order.$id}:reminder_h1`).digest("hex");
         await databases.createDocument(env.databaseId, env.notificationsCollectionId, `ntf${digest.slice(0, 29)}`, {
            userId: order.umkmId,
            title: "Tenggat Review H-1",
            message: "Tenggat waktu review hasil pesanan tersisa kurang dari 24 jam.",
            type: "system",
            isRead: false,
            createdAt: new Date().toISOString()
         }, [Permission.read(Role.user(order.umkmId)), Permission.update(Role.user(order.umkmId))]);
       } catch(e) {}
       reminderCount++;
    }

    log(`Auto-approved: ${approvedCount}, Reminders sent: ${reminderCount}`);
    return res.json({ success: true, approvedCount, reminderCount });

  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};
