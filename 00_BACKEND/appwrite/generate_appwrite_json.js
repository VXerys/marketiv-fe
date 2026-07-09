const fs = require('fs');
const path = require('path');

const appwriteJsonPath = path.join(__dirname, 'appwrite.json');

const databaseId = "6a4c8598001da3b0d7f0";
const databaseName = "prod_marketiv_db";

const createStringAttr = (key, required = false, size = 255, def = null, array = false) => ({
    key, type: "string", required, array, size, default: def
});
const createIntAttr = (key, required = false, def = null, array = false) => ({
    key, type: "integer", required, array, default: def
});
const createFloatAttr = (key, required = false, def = null, array = false) => ({
    key, type: "double", required, array, default: def
});
const createBoolAttr = (key, required = false, def = null, array = false) => ({
    key, type: "boolean", required, array, default: def
});
const createDatetimeAttr = (key, required = false, array = false) => ({
    key, type: "datetime", required, array, default: null
});
const createEnumAttr = (key, required = false, elements = [], def = null) => ({
    key, type: "string", required, array: false, elements, default: def
});

const createIndex = (key, type, attributes, orders = []) => {
    if (orders.length === 0) {
        orders = attributes.map(() => "ASC");
    }
    return { key, type, status: "available", attributes, orders };
};

const collections = [
    // ── Modul Users ──────────────────────────────────
    {
        $id: "users",
        name: "Users",
        $permissions: ["read(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createStringAttr("role", true, 50),
            createStringAttr("status", true, 50),
            createStringAttr("email", true),
            createStringAttr("phone", false, 50),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_userId", "unique", ["userId"]),
            createIndex("idx_email", "unique", ["email"]),
            createIndex("idx_role", "key", ["role"]),
            createIndex("idx_status", "key", ["status"])
        ]
    },
    {
        $id: "umkm_profiles",
        name: "UMKM Profiles",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createStringAttr("businessName", true, 255),
            createStringAttr("category", true, 100),
            createStringAttr("description", false, 2000),
            createStringAttr("city", false, 100),
            createStringAttr("address", false, 500),
            createStringAttr("tiktok", false, 255),
            createStringAttr("logoUrl", false, 2048),
            createBoolAttr("isProfileCompleted", false, false)
        ],
        indexes: [
            createIndex("idx_userId", "unique", ["userId"]),
            createIndex("idx_city", "key", ["city"]),
            createIndex("idx_category", "key", ["category"]),
            createIndex("idx_isProfileCompleted", "key", ["isProfileCompleted"])
        ]
    },
    {
        $id: "creator_profiles",
        name: "Creator Profiles",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createStringAttr("displayName", true, 255),
            createStringAttr("bio", false, 2000),
            createStringAttr("city", false, 100),
            createStringAttr("avatarUrl", false, 2048),
            createIntAttr("totalFollowers", false, 0),
            createIntAttr("totalOrders", false, 0),
            createFloatAttr("rating", false, 0),
            createBoolAttr("isProfileCompleted", false, false)
        ],
        indexes: [
            createIndex("idx_userId", "unique", ["userId"]),
            createIndex("idx_displayName", "key", ["displayName"]),
            createIndex("idx_city", "key", ["city"]),
            createIndex("idx_rating", "key", ["rating"]),
            createIndex("idx_totalFollowers", "key", ["totalFollowers"]),
            createIndex("idx_isProfileCompleted", "key", ["isProfileCompleted"])
        ]
    },
    {
        $id: "creator_social_accounts",
        name: "Creator Social Accounts",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("creatorId", true),
            createStringAttr("platform", true, 50),
            createStringAttr("username", true, 255),
            createIntAttr("followers", false, 0),
            createFloatAttr("engagementRate", false, 0)
        ],
        indexes: [
            createIndex("idx_creatorId", "key", ["creatorId"]),
            createIndex("idx_platform", "key", ["platform"]),
            createIndex("idx_followers", "key", ["followers"])
        ]
    },
    {
        $id: "creator_portfolios",
        name: "Creator Portfolios",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("creatorId", true),
            createStringAttr("title", true, 255),
            createStringAttr("description", false, 2000),
            createStringAttr("thumbnailUrl", false, 2048),
            createStringAttr("portfolioUrl", false, 2048)
        ],
        indexes: [
            createIndex("idx_creatorId", "key", ["creatorId"])
        ]
    },
    {
        $id: "user_storage_usage",
        name: "User Storage Usage",
        $permissions: ["read(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createIntAttr("usedBytes", false, 0),
            createIntAttr("quotaBytes", false, 104857600),
            createIntAttr("fileCount", false, 0)
        ],
        indexes: [
            createIndex("idx_userId", "unique", ["userId"])
        ]
    },
    {
        $id: "user_files",
        name: "User Files",
        $permissions: ["read(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createStringAttr("storageFileId", true),
            createStringAttr("bucketId", true),
            createStringAttr("fileName", true, 255),
            createStringAttr("mimeType", true, 100),
            createIntAttr("sizeBytes", true),
            createStringAttr("status", true, 50),
            createDatetimeAttr("createdAt", false),
            createDatetimeAttr("deletedAt", false)
        ],
        indexes: [
            createIndex("idx_userId_status", "key", ["userId", "status"]),
            createIndex("idx_storageFileId", "unique", ["storageFileId"]),
            createIndex("idx_status_createdAt", "key", ["status", "createdAt"], ["ASC", "DESC"])
        ]
    },
    {
        $id: "campaigns",
        name: "Campaigns",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("umkmId", true),
            createStringAttr("title", true, 255),
            createStringAttr("category", true, 100),
            createStringAttr("type", true, 50),
            createStringAttr("platforms", true, 255, null, true),
            createStringAttr("description", false, 2000),
            createIntAttr("budget", true),
            createIntAttr("rewardPer1000Views", true),
            createStringAttr("status", true, 50),
            createIntAttr("claimLimit", true),
            createIntAttr("submissionDays", true, 7),
            createIntAttr("totalClaims", true, 0),
            createIntAttr("spentAmount", true, 0),
            createIntAttr("remainingBudget", true, 0),
            createDatetimeAttr("publishedAt", false)
        ],
        indexes: [
            createIndex("idx_umkmId", "key", ["umkmId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_category", "key", ["category"]),
            createIndex("idx_publishedAt", "key", ["publishedAt"], ["DESC"]),
            createIndex("idx_remainingBudget", "key", ["remainingBudget"])
        ]
    },
    {
        $id: "campaign_assets",
        name: "Campaign Assets",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("campaignId", true),
            createStringAttr("source", true, 50),
            createStringAttr("type", true, 50),
            createStringAttr("fileUrl", true, 2048),
            createStringAttr("fileId", false),
            createStringAttr("fileName", false, 255)
        ],
        indexes: [
            createIndex("idx_campaignId", "key", ["campaignId"])
        ]
    },
    {
        $id: "fraud_checks",
        name: "Fraud Checks",
        $permissions: [],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("submissionId", true),
            createIntAttr("score", true),
            createStringAttr("result", true, 50),
            createStringAttr("reason", false, 2000)
        ],
        indexes: [
            createIndex("idx_submissionId", "key", ["submissionId"]),
            createIndex("idx_result", "key", ["result"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    },
    {
        $id: "campaign_briefs",
        name: "Campaign Briefs",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("campaignId", true),
            createStringAttr("objective", false, 2000),
            createStringAttr("contentAngle", false, 2000),
            createStringAttr("cta", false, 1000),
            createStringAttr("briefDetail", false, 10000),
            createStringAttr("doAndDont", false, 5000),
            createStringAttr("materialsJson", false, 5000),
            createBoolAttr("generatedByAi", true, false)
        ],
        indexes: [
            createIndex("idx_campaignId", "unique", ["campaignId"])
        ]
    },
    {
        $id: "campaign_claims",
        name: "Campaign Claims",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("campaignId", true),
            createStringAttr("creatorId", true),
            createStringAttr("status", true, 50),
            createDatetimeAttr("claimedAt", true)
        ],
        indexes: [
            createIndex("idx_campaignId", "key", ["campaignId"]),
            createIndex("idx_creatorId", "key", ["creatorId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_claimedAt", "key", ["claimedAt"], ["DESC"])
        ]
    },
    {
        $id: "campaign_submissions",
        name: "Campaign Submissions",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("claimId", true),
            createStringAttr("campaignId", true),
            createStringAttr("creatorId", true),
            createStringAttr("platform", true, 50),
            createStringAttr("postUrl", true, 2048),
            createStringAttr("caption", false, 1000),
            createIntAttr("views", true),
            createIntAttr("engagement", false),
            createIntAttr("fraudScore", false),
            createStringAttr("fraudStatus", false, 50),
            createStringAttr("status", true, 50)
        ],
        indexes: [
            createIndex("idx_claimId", "unique", ["claimId"]),
            createIndex("idx_campaignId", "key", ["campaignId"]),
            createIndex("idx_creatorId", "key", ["creatorId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_fraudStatus", "key", ["fraudStatus"])
        ]
    },
    {
        $id: "rate_cards",
        name: "Rate Cards",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("creatorId", true),
            createStringAttr("title", true, 255),
            createStringAttr("description", false, 2000),
            createStringAttr("status", true, 50),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_creatorId", "key", ["creatorId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    },
    {
        $id: "rate_card_packages",
        name: "Rate Card Packages",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("rateCardId", true),
            createStringAttr("name", true, 100),
            createStringAttr("description", true, 2000),
            createStringAttr("output", true, 2000),
            createIntAttr("deliveryDays", true),
            createIntAttr("price", true),
            createIntAttr("revisionLimit", true)
        ],
        indexes: [
            createIndex("idx_rateCardId", "key", ["rateCardId"]),
            createIndex("idx_price", "key", ["price"])
        ]
    },
    {
        $id: "conversations",
        name: "Conversations",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("umkm_id", true),
            createStringAttr("creator_id", true),
            createStringAttr("offer_id", false, 255),
            createStringAttr("last_message", false, 1000),
            createDatetimeAttr("last_message_at", false)
        ],
        indexes: [
            createIndex("idx_umkm_id", "key", ["umkm_id"]),
            createIndex("idx_creator_id", "key", ["creator_id"]),
            createIndex("idx_umkm_creator", "unique", ["umkm_id", "creator_id"]),
            createIndex("idx_offer_id", "key", ["offer_id"])
        ]
    },
    {
        $id: "messages",
        name: "Messages",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("conversation_id", true),
            createStringAttr("sender_id", true),
            createStringAttr("message_type", true, 50),
            createStringAttr("content", false, 2000),
            createStringAttr("offer_id", false, 255),
            createStringAttr("attachment_url", false, 2048),
            createStringAttr("attachment_name", false, 255),
            createIntAttr("attachment_size", false),
            createStringAttr("attachment_mime", false, 255)
        ],
        indexes: [
            createIndex("idx_conversation_id", "key", ["conversation_id"]),
            createIndex("idx_sender_id", "key", ["sender_id"])
        ]
    },
    {
        $id: "offers",
        name: "Offers",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("conversationId", true),
            createStringAttr("umkmId", true),
            createStringAttr("creatorId", true),
            createStringAttr("title", true, 255),
            createStringAttr("description", false, 2000),
            createIntAttr("price", true),
            createStringAttr("deadline", true, 255),
            createIntAttr("revisionLimit", true),
            createStringAttr("status", true, 50),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_conversationId", "key", ["conversationId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    },
    {
        $id: "orders",
        name: "Orders",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("offerId", false),
            createStringAttr("packageId", false),
            createStringAttr("creatorId", true),
            createStringAttr("umkmId", true),
            createIntAttr("amount", true),
            createStringAttr("status", true, 50),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_offerId", "unique", ["offerId"]),
            createIndex("idx_packageId", "key", ["packageId"]),
            createIndex("idx_creatorId", "key", ["creatorId"]),
            createIndex("idx_umkmId", "key", ["umkmId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    },
    {
        $id: "deliverables",
        name: "Deliverables",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("orderId", true),
            createStringAttr("source", true, 50),
            createStringAttr("fileUrl", true, 2048),
            createStringAttr("fileId", false),
            createStringAttr("notes", false, 2000),
            createIntAttr("version", true),
            createStringAttr("status", true, 50),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_orderId", "key", ["orderId"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    },
    {
        $id: "revisions",
        name: "Revisions",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("orderId", true),
            createStringAttr("requestedBy", true),
            createStringAttr("message", true, 2000),
            createStringAttr("status", true, 50)
        ],
        indexes: [
            createIndex("idx_orderId", "key", ["orderId"]),
            createIndex("idx_status", "key", ["status"])
        ]
    },
    {
        $id: "wallets",
        name: "Wallets",
        $permissions: ["read(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createIntAttr("balance", false, 0),
            createIntAttr("pendingBalance", false, 0)
        ],
        indexes: [
            createIndex("idx_userId", "unique", ["userId"])
        ]
    },
    {
        $id: "payments",
        name: "Payments",
        $permissions: ["read(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("user_id", true),
            createStringAttr("order_id", false),
            createStringAttr("campaign_id", false),
            createIntAttr("amount", true),
            createIntAttr("total_amount", true),
            createIntAttr("fee_amount", false, 0),
            createStringAttr("purpose", true, 50),
            createStringAttr("gateway", false, 50, "midtrans"),
            createStringAttr("gateway_reference", true, 255),
            createStringAttr("snap_token", false, 255),
            createStringAttr("redirect_url", false, 2048),
            createStringAttr("status", true, 50),
            createDatetimeAttr("paid_at", false)
        ],
        indexes: [
            createIndex("idx_gateway_reference", "unique", ["gateway_reference"]),
            createIndex("idx_order_id", "key", ["order_id"]),
            createIndex("idx_campaign_id", "key", ["campaign_id"]),
            createIndex("idx_user_id", "key", ["user_id"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_purpose", "key", ["purpose"])
        ]
    },
    {
        $id: "transactions",
        name: "Transactions",
        $permissions: ["read(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createIntAttr("amount", true),
            createStringAttr("type", true, 50),
            createStringAttr("referenceId", false),
            createStringAttr("referenceType", false, 50),
            createStringAttr("status", true, 50)
        ],
        indexes: [
            createIndex("idx_userId", "key", ["userId"]),
            createIndex("idx_referenceId", "key", ["referenceId"]),
            createIndex("idx_referenceType", "key", ["referenceType"]),
            createIndex("idx_status", "key", ["status"])
        ]
    },
    {
        $id: "escrows",
        name: "Escrows",
        $permissions: [],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("orderId", true),
            createIntAttr("amount", true),
            createStringAttr("status", true, 50)
        ],
        indexes: [
            createIndex("idx_orderId", "unique", ["orderId"]),
            createIndex("idx_status", "key", ["status"])
        ]
    },
    {
        $id: "withdrawals",
        name: "Withdrawals",
        $permissions: ["read(\"users\")", "create(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createIntAttr("amount", true),
            createStringAttr("payoutMethod", true, 50),
            createStringAttr("providerName", true, 100),
            createStringAttr("accountNumber", true, 100),
            createStringAttr("accountName", true, 255),
            createStringAttr("status", true, 50),
            createStringAttr("adminNote", false, 1000),
            createStringAttr("rejectionReason", false, 1000),
            createDatetimeAttr("processedAt", false),
            createStringAttr("processedBy", false),
            createStringAttr("transferProofUrl", false, 2048)
        ],
        indexes: [
            createIndex("idx_userId", "key", ["userId"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_payoutMethod", "key", ["payoutMethod"])
        ]
    },
    {
        $id: "notifications",
        name: "Notifications",
        $permissions: [],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createStringAttr("title", true, 255),
            createStringAttr("message", true, 1000),
            createStringAttr("type", true, 50),
            createBoolAttr("isRead", false, false),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_userId", "key", ["userId"]),
            createIndex("idx_isRead", "key", ["isRead"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    },
    // ── Modul AI ──────────────────────────────────────
    {
        $id: "ai_requests",
        name: "AI Requests",
        $permissions: [],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("userId", true),
            createEnumAttr("feature", true, ["brief", "fraud", "landing"]),
            createStringAttr("prompt", true, 10000),
            createStringAttr("response", false, 10000),
            createDatetimeAttr("createdAt", false)
        ],
        indexes: [
            createIndex("idx_userId", "key", ["userId"]),
            createIndex("idx_feature", "key", ["feature"]),
            createIndex("idx_createdAt", "key", ["createdAt"], ["DESC"])
        ]
    }
];

const tables = collections.map((collection) => {
    const { documentSecurity, attributes = [], indexes = [], ...table } = collection;

    return {
        ...table,
        databaseId,
        rowSecurity: documentSecurity,
        columns: attributes,
        indexes: indexes.map(({ attributes: indexAttributes, ...index }) => ({
            ...index,
            columns: indexAttributes
        }))
    };
});

const buckets = [
    {
        $id: "avatars",
        name: "Avatars",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 5000000,
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp"],
        compression: "gzip",
        encryption: false,
        antivirus: true
    },
    {
        $id: "logos",
        name: "Logos",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 5000000,
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "svg"],
        compression: "gzip",
        encryption: false,
        antivirus: true
    },
    {
        $id: "portfolios",
        name: "Portfolios",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 50000000,
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "pdf", "mp4"],
        compression: "gzip",
        encryption: false,
        antivirus: true
    },
    {
        $id: "campaign-assets",
        name: "Campaign Assets",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")", "delete(\"users\")"],
        fileSecurity: false,
        enabled: true,
        maximumFileSize: 100000000,
        allowedFileExtensions: [], // allow all
        compression: "gzip",
        encryption: false,
        antivirus: true
    },
    {
        $id: "deliverables",
        name: "Deliverables",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 500000000, // 500MB
        allowedFileExtensions: [],
        compression: "none",
        encryption: false,
        antivirus: true
    },
    {
        $id: "chat-files",
        name: "Chat Files",
        $permissions: ["read(\"users\")", "create(\"users\")"],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 10000000, // 10MB
        allowedFileExtensions: ["jpg", "jpeg", "png", "webp", "pdf", "doc", "docx"],
        compression: "gzip",
        encryption: false,
        antivirus: true
    },
    {
        $id: "fraud-evidence",
        name: "Fraud Evidence",
        $permissions: ["read(\"users\")"], // System writes, admin/user reads
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 5000000,
        allowedFileExtensions: ["jpg", "jpeg", "png", "pdf"],
        compression: "gzip",
        encryption: false,
        antivirus: true
    },
    {
        $id: "user-files",
        name: "User Files",
        $permissions: ["read(\"users\")", "create(\"users\")"],
        fileSecurity: true,
        enabled: true,
        maximumFileSize: 20971520, // 20 MB
        allowedFileExtensions: [
            "jpg", "jpeg", "png", "webp", "gif", "svg",
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "mp4", "mov", "avi"
        ],
        compression: "gzip",
        encryption: false,
        antivirus: true
    }
];

const functions = [
    {
        $id: "create-user-profile",
        name: "Create User Profile",
        runtime: "node-18.0",
        execute: ["users"],
        events: ["users.*.create"],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/create-user-profile"
    },
    {
        $id: "validate-and-upload",
        name: "Validate And Upload",
        runtime: "node-18.0",
        execute: ["users"],
        events: [],
        schedule: "",
        timeout: 30,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/validate-and-upload"
    },
    {
        $id: "delete-file",
        name: "Delete File",
        runtime: "node-18.0",
        execute: ["users"],
        events: [],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/delete-file"
    },
    {
        $id: "create-user-wallet",
        name: "Create User Wallet",
        runtime: "node-18.0",
        execute: [],
        events: ["users.*.create"],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/create-user-wallet"
    },
    {
        $id: "campaign-published",
        name: "Campaign Published",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.campaigns.documents.*.update`],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/campaign-published"
    },
    {
        $id: "ai-brief",
        name: "AI Brief Generator",
        runtime: "node-18.0",
        execute: ["users"],
        events: [],
        schedule: "",
        timeout: 30,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/ai-brief"
    },
    {
        $id: "ai-fraud-precheck",
        name: "AI Fraud Precheck",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.campaign_submissions.documents.*.create`],
        schedule: "",
        timeout: 60,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/ai-fraud-precheck"
    },
    {
        $id: "create-order",
        name: "Create Order",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.offers.documents.*.update`],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/create-order"
    },
    {
        $id: "calculate-campaign-reward",
        name: "Calculate Campaign Reward",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.campaign_submissions.documents.*.update`],
        schedule: "",
        timeout: 30,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/calculate-campaign-reward"
    },
    {
        $id: "campaign-claimed",
        name: "Campaign Claimed",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.campaign_claims.documents.*.create`],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/campaign-claimed"
    },
    {
        $id: "expire-stale-claims",
        name: "Expire Stale Claims",
        runtime: "node-18.0",
        execute: [],
        events: [],
        schedule: "0 */6 * * *",
        timeout: 60,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/expire-stale-claims"
    },
    {
        $id: "create-payment",
        name: "Create Payment",
        runtime: "node-18.0",
        execute: ["users"],
        events: [],
        schedule: "",
        timeout: 30,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/create-payment"
    },
    {
        $id: "midtrans-webhook",
        name: "Midtrans Webhook",
        runtime: "node-18.0",
        execute: ["any"],
        events: [],
        schedule: "",
        timeout: 30,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/midtrans-webhook"
    },
    {
        $id: "create-escrow",
        name: "Create Escrow",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.payments.documents.*.update`],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/create-escrow"
    },
    {
        $id: "release-escrow",
        name: "Release Escrow",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.deliverables.documents.*.update`],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/release-escrow"
    },
    {
        $id: "send-chat-notification",
        name: "Send Chat Notification",
        runtime: "node-18.0",
        execute: [],
        events: [`databases.${databaseId}.collections.messages.documents.*.create`],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/send-chat-notification"
    },
    {
        $id: "upload-chat-attachment",
        name: "Upload Chat Attachment",
        runtime: "node-18.0",
        execute: ["users"],
        events: [],
        schedule: "",
        timeout: 30,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "../functions/upload-chat-attachment"
    }
];

let existingProjectId = "69f9d45b00315cb0ec2f";
let existingProjectName = "Marketiv";

try {
    if (fs.existsSync(appwriteJsonPath)) {
        const existingData = JSON.parse(fs.readFileSync(appwriteJsonPath, 'utf8'));
        if (existingData.projectId) existingProjectId = existingData.projectId;
        if (existingData.projectName) existingProjectName = existingData.projectName;
    }
} catch (error) {
    console.log('Could not read existing appwrite.json, using default project details.');
}

const appwriteJson = {
    projectId: existingProjectId,
    projectName: existingProjectName,
    endpoint: "https://sgp.cloud.appwrite.io/v1",
    tablesDB: [
        {
            $id: databaseId,
            name: databaseName
        }
    ],
    tables,
    buckets,
    functions: functions.filter((fn) => fs.existsSync(path.join(__dirname, fn.path)))
};

fs.writeFileSync(appwriteJsonPath, JSON.stringify(appwriteJson, null, 2));
console.log(`Successfully generated ${appwriteJsonPath}`);
