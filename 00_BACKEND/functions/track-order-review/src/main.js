import { Client, Databases, Query } from "node-appwrite";

const trackOrderReview = async ({ req, res, log, error }) => {
  try {
    const env = {
      appwriteEndpoint: process.env.APPWRITE_FUNCTION_API_ENDPOINT || process.env.APPWRITE_ENDPOINT,
      appwriteProjectId: process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID,
      appwriteApiKey: req.headers["x-appwrite-key"] || process.env.APPWRITE_API_KEY,
      databaseId: process.env.APPWRITE_DATABASE_ID || process.env.NEXT_PUBLIC_DB_ID || "6a4c8598001da3b0d7f0",
      ordersCollectionId: "orders",
      deliverablesCollectionId: process.env.DELIVERABLES_COLLECTION_ID || "deliverables",
      offersCollectionId: "offers",
      packagesCollectionId: "rate_card_packages",
    };
    if (!env.appwriteApiKey) return res.json({ error: "Missing API Key" }, 500);

    const client = new Client().setEndpoint(env.appwriteEndpoint).setProject(env.appwriteProjectId).setKey(env.appwriteApiKey);
    const databases = new Databases(client);

    const deliverable = req.bodyJson || JSON.parse(req.bodyText || "{}");
    if (!deliverable.$id) return res.json({ error: "Missing payload" }, 400);

    const orderId = deliverable.orderId;
    if (!orderId) return res.json({ status: "ignored", reason: "no orderId" });

    const order = await databases.getDocument(env.databaseId, env.ordersCollectionId, orderId);
    if (!["in_progress", "revision"].includes(order.status)) {
      return res.json({ status: "ignored", reason: "order status not eligible" });
    }

    // This event is asynchronous while request-ratecard-revision is
    // synchronous. Re-read latest state so a late create event cannot
    // overwrite revision_requested or restart its review timer.
    const latest = await databases.listDocuments(env.databaseId, env.deliverablesCollectionId, [
      Query.equal("orderId", orderId),
      Query.orderDesc("version"),
      Query.limit(1),
    ]);
    if (latest.documents[0] && latest.documents[0].status !== "submitted") {
      return res.json({ status: "ignored", reason: "latest deliverable is not submitted" });
    }

    const version = deliverable.version || 1;
    const existingRevision = order.revision_count || 0;
    
    // Idempoten
    if (order.review_deadline_at && version <= existingRevision + 1) {
      if (order.revision_count !== undefined) {
         return res.json({ status: "ignored", reason: "idempotent guard" });
      }
    }

    const createdAt = new Date(deliverable.$createdAt || Date.now());
    const deadline = new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    
    let revLimit = order.revision_limit || 0;
    if (!order.revision_limit) {
       if (order.offerId) {
          try {
             const offer = await databases.getDocument(env.databaseId, env.offersCollectionId, order.offerId);
             revLimit = offer.revisionLimit || 0;
          } catch {}
       } else if (order.packageId) {
          try {
             const pkg = await databases.getDocument(env.databaseId, env.packagesCollectionId, order.packageId);
             revLimit = pkg.revisionLimit || 0;
          } catch {}
       }
    }
    
    const newRevCount = Math.max(existingRevision, version - 1);

    await databases.updateDocument(env.databaseId, env.ordersCollectionId, orderId, {
      status: order.status === "revision" ? "in_progress" : order.status,
      review_deadline_at: deadline,
      revision_count: newRevCount,
      revision_limit: revLimit,
      reminder_sent_at: null
    });
    
    log(`Order ${orderId} review deadline set to ${deadline}`);
    return res.json({ success: true, deadline });

  } catch (err) {
    error(err.message);
    return res.json({ error: err.message }, 500);
  }
};

export default trackOrderReview;
