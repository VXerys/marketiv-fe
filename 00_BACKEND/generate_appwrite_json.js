const fs = require('fs');

const databaseId = "6a3110bf000de5a04844";

const createStringAttr = (key, required = false, size = 255, def = null, array = false) => ({
    key, type: "string", status: "available", required, array, size, default: def
});
const createIntAttr = (key, required = false, def = null, array = false) => ({
    key, type: "integer", status: "available", required, array, default: def
});
const createFloatAttr = (key, required = false, def = null, array = false) => ({
    key, type: "double", status: "available", required, array, default: def
});
const createBoolAttr = (key, required = false, def = null, array = false) => ({
    key, type: "boolean", status: "available", required, array, default: def
});
const createDatetimeAttr = (key, required = false, array = false) => ({
    key, type: "datetime", status: "available", required, array
});

const createIndex = (key, type, attributes, orders = []) => {
    if (orders.length === 0) {
        orders = attributes.map(() => "ASC");
    }
    return { key, type, status: "available", attributes, orders };
};

const collections = [
    {
        $id: "profiles",
        name: "Profiles",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("user_id", true),
            createStringAttr("role", true, 50),
            createStringAttr("avatar_url", false, 2048),
            createStringAttr("phone", false, 50),
            createStringAttr("city", false, 100),
            createStringAttr("bio", false, 1000),
            createStringAttr("business_name", false, 255),
            createStringAttr("business_category", false, 100),
            createFloatAttr("rating", false, 0),
            createIntAttr("completed_jobs", false, 0),
            createStringAttr("status", false, 50)
        ],
        indexes: [
            createIndex("idx_user_id", "unique", ["user_id"]),
            createIndex("idx_role", "key", ["role"]),
            createIndex("idx_city", "key", ["city"]),
            createIndex("idx_business_category", "key", ["business_category"])
        ]
    },
    {
        $id: "social_accounts",
        name: "Social Accounts",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("user_id", true),
            createStringAttr("platform", true, 50),
            createStringAttr("username", true, 255),
            createIntAttr("followers", false, 0),
            createBoolAttr("verified", false, false),
            createFloatAttr("engagement_rate", false, 0.0)
        ],
        indexes: [
            createIndex("idx_user_id", "key", ["user_id"]),
            createIndex("idx_platform", "key", ["platform"])
        ]
    },
    {
        $id: "campaigns",
        name: "Campaigns",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("umkm_id", true),
            createStringAttr("title", true, 255),
            createStringAttr("type", true, 50),
            createStringAttr("category", true, 100),
            createStringAttr("thumbnail_url", false, 2048),
            createIntAttr("budget_total", true),
            createIntAttr("budget_used", false, 0),
            createIntAttr("cpm", true),
            createIntAttr("min_views", true),
            createIntAttr("max_views", true),
            createStringAttr("status", true, 50),
            createIntAttr("submission_count", false, 0),
            createIntAttr("approved_count", false, 0),
            createDatetimeAttr("created_at", false)
        ],
        indexes: [
            createIndex("idx_umkm_id", "key", ["umkm_id"]),
            createIndex("idx_status", "key", ["status"]),
            createIndex("idx_category", "key", ["category"])
        ]
    },
    {
        $id: "campaign_briefs",
        name: "Campaign Briefs",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("campaign_id", true),
            createStringAttr("brief_json", true, 10000),
            createBoolAttr("generated_by_ai", false, false)
        ],
        indexes: [
            createIndex("idx_campaign_id", "unique", ["campaign_id"])
        ]
    },
    {
        $id: "campaign_claims",
        name: "Campaign Claims",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("campaign_id", true),
            createStringAttr("creator_id", true),
            createStringAttr("claim_status", true, 50)
        ],
        indexes: [
            createIndex("idx_campaign_creator", "unique", ["campaign_id", "creator_id"]),
            createIndex("idx_campaign_id", "key", ["campaign_id"]),
            createIndex("idx_creator_id", "key", ["creator_id"])
        ]
    },
    {
        $id: "submissions",
        name: "Submissions",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("claim_id", true),
            createStringAttr("creator_id", true),
            createStringAttr("creator_name", true, 255),
            createStringAttr("platform", true, 50),
            createStringAttr("video_url", true, 2048),
            createStringAttr("caption", false, 1000),
            createIntAttr("current_views", false, 0),
            createStringAttr("analytics_file", false, 2048),
            createStringAttr("status", true, 50),
            createFloatAttr("fraud_score", false),
            createStringAttr("fraud_result", false, 50)
        ],
        indexes: [
            createIndex("idx_claim_id", "unique", ["claim_id"]),
            createIndex("idx_creator_id", "key", ["creator_id"]),
            createIndex("idx_status", "key", ["status"])
        ]
    },
    {
        $id: "rate_cards",
        name: "Rate Cards",
        $permissions: ["read(\"any\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("creator_id", true),
            createStringAttr("title", true, 255),
            createStringAttr("platform", true, 50),
            createStringAttr("content_type", true, 100),
            createIntAttr("price", true),
            createIntAttr("delivery_days", true),
            createIntAttr("revision_limit", true),
            createStringAttr("description", false, 2000),
            createBoolAttr("is_active", false, true)
        ],
        indexes: [
            createIndex("idx_creator_id", "key", ["creator_id"]),
            createIndex("idx_platform", "key", ["platform"]),
            createIndex("idx_is_active", "key", ["is_active"])
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
            createStringAttr("attachment_url", false, 2048)
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
            createStringAttr("conversation_id", true),
            createStringAttr("creator_id", true),
            createStringAttr("umkm_id", true),
            createStringAttr("offer_type", true, 50),
            createStringAttr("title", true, 255),
            createIntAttr("price", true),
            createDatetimeAttr("deadline", true),
            createIntAttr("revision_limit", true),
            createStringAttr("status", true, 50)
        ],
        indexes: [
            createIndex("idx_conversation_id", "key", ["conversation_id"]),
            createIndex("idx_creator_id", "key", ["creator_id"]),
            createIndex("idx_umkm_id", "key", ["umkm_id"]),
            createIndex("idx_status", "key", ["status"])
        ]
    },
    {
        $id: "orders",
        name: "Orders",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("offer_id", true),
            createStringAttr("creator_id", true),
            createStringAttr("umkm_id", true),
            createStringAttr("title", true, 255),
            createIntAttr("price", true),
            createDatetimeAttr("deadline", true),
            createIntAttr("revision_limit", true),
            createIntAttr("escrow_amount", true),
            createStringAttr("escrow_status", true, 50),
            createStringAttr("order_status", true, 50)
        ],
        indexes: [
            createIndex("idx_offer_id", "unique", ["offer_id"]),
            createIndex("idx_creator_id", "key", ["creator_id"]),
            createIndex("idx_umkm_id", "key", ["umkm_id"]),
            createIndex("idx_order_status", "key", ["order_status"])
        ]
    },
    {
        $id: "wallets",
        name: "Wallets",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("user_id", true),
            createIntAttr("available_balance", false, 0),
            createIntAttr("pending_balance", false, 0)
        ],
        indexes: [
            createIndex("idx_user_id", "unique", ["user_id"])
        ]
    },
    {
        $id: "wallet_transactions",
        name: "Wallet Transactions",
        $permissions: ["read(\"users\")", "create(\"users\")", "update(\"users\")"],
        documentSecurity: true,
        enabled: true,
        attributes: [
            createStringAttr("wallet_id", true),
            createStringAttr("type", true, 50),
            createIntAttr("amount", true),
            createStringAttr("reference_type", true, 50),
            createStringAttr("reference_id", true)
        ],
        indexes: [
            createIndex("idx_wallet_id", "key", ["wallet_id"]),
            createIndex("idx_type", "key", ["type"])
        ]
    }
];

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
        maximumFileSize: 20000000, // 20MB
        allowedFileExtensions: ["jpg", "jpeg", "png", "pdf", "docx"],
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
    }
];

const functions = [
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
        path: "functions/create-user-wallet"
    },
    {
        $id: "campaign-published",
        name: "Campaign Published",
        runtime: "node-18.0",
        execute: [],
        events: ["databases.marketiv_db.collections.campaigns.documents.*.update"],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "functions/campaign-published"
    },
    {
        $id: "ai-fraud-precheck",
        name: "AI Fraud Precheck",
        runtime: "node-18.0",
        execute: [],
        events: ["databases.marketiv_db.collections.submissions.documents.*.create"],
        schedule: "",
        timeout: 60,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "functions/ai-fraud-precheck"
    },
    {
        $id: "create-order",
        name: "Create Order",
        runtime: "node-18.0",
        execute: [],
        events: ["databases.marketiv_db.collections.offers.documents.*.update"],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "functions/create-order"
    },
    {
        $id: "create-escrow",
        name: "Create Escrow",
        runtime: "node-18.0",
        execute: [],
        events: [], // Assumed webhook or custom triggered
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "functions/create-escrow"
    },
    {
        $id: "release-escrow",
        name: "Release Escrow",
        runtime: "node-18.0",
        execute: [],
        events: ["databases.marketiv_db.collections.deliverables.documents.*.update"],
        schedule: "",
        timeout: 15,
        enabled: true,
        logging: true,
        entrypoint: "src/main.js",
        commands: "npm install",
        path: "functions/release-escrow"
    }
];

let existingProjectId = "69f9d45b00315cb0ec2f";
let existingProjectName = "Marketiv";

try {
    if (fs.existsSync('appwrite.json')) {
        const existingData = JSON.parse(fs.readFileSync('appwrite.json', 'utf8'));
        if (existingData.projectId) existingProjectId = existingData.projectId;
        if (existingData.projectName) existingProjectName = existingData.projectName;
    }
} catch (error) {
    console.log('Could not read existing appwrite.json, using default project details.');
}

const appwriteJson = {
    projectId: existingProjectId,
    projectName: existingProjectName,
    endpoint: "https://ap-southeast-1.cloud.appwrite.io/v1",
    databases: [
        {
            $id: databaseId,
            name: "Marketiv Database",
            collections: collections
        }
    ],
    storage: buckets,
    functions: functions
};

fs.writeFileSync('appwrite.json', JSON.stringify(appwriteJson, null, 2));
console.log('Successfully generated appwrite.json');
