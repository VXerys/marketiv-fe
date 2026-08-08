# Skill: marketiv-appwrite-integration

Referensi lengkap untuk integrasi Appwrite di proyek Marketiv. Baca skill ini sebelum mengimplementasikan service, query, atau auth flow apapun.

---

## Konfigurasi Appwrite

```
Project ID : 69f9d45b00315cb0ec2f
Endpoint   : https://sgp.cloud.appwrite.io/v1
Database ID: 6a4c8598001da3b0d7f0  (prod_marketiv_db)
```

---

## COLLECTIONS Constants

Sumber: `00_BACKEND/src/lib/appwrite/collections.ts`

```typescript
// Import di service layer:
import { DATABASE_ID, COLLECTIONS, FUNCTIONS } from '../lib/appwrite';

// Nilai collections (jika env var tidak di-set):
COLLECTIONS.users                  = "users"
COLLECTIONS.umkmProfiles           = "umkm_profiles"
COLLECTIONS.creatorProfiles        = "creator_profiles"
COLLECTIONS.creatorSocialAccounts  = "creator_social_accounts"
COLLECTIONS.creatorPortfolios      = "creator_portfolios"
COLLECTIONS.userStorageUsage       = "user_storage_usage"
COLLECTIONS.userFiles              = "user_files"
COLLECTIONS.conversations          = "conversations"
COLLECTIONS.messages               = "messages"
COLLECTIONS.notifications          = "notifications"
COLLECTIONS.rateCards              = "rate_cards"
COLLECTIONS.rateCardPackages       = "rate_card_packages"
COLLECTIONS.offers                 = "offers"
COLLECTIONS.orders                 = "orders"
COLLECTIONS.deliverables           = "deliverables"
COLLECTIONS.revisions              = "revisions"
COLLECTIONS.wallets                = "wallets"
COLLECTIONS.payments               = "payments"
COLLECTIONS.transactions           = "transactions"
COLLECTIONS.escrows                = "escrows"
COLLECTIONS.withdrawals            = "withdrawals"
COLLECTIONS.campaigns              = "campaigns"
COLLECTIONS.campaignAssets         = "campaign_assets"
COLLECTIONS.campaignBriefs         = "campaign_briefs"
COLLECTIONS.claims                 = "campaign_claims"
COLLECTIONS.submissions            = "campaign_submissions"
COLLECTIONS.fraudChecks            = "fraud_checks"

// Function IDs:
FUNCTIONS.createUserProfile        = "create-user-profile"
FUNCTIONS.validateAndUpload        = "validate-and-upload"
FUNCTIONS.deleteFile               = "delete-file"
FUNCTIONS.createPayment            = "create-payment"
FUNCTIONS.calculateCampaignReward  = "calculate-campaign-reward"
FUNCTIONS.campaignClaimed          = "campaign-claimed"
FUNCTIONS.expireStaleClaims        = "expire-stale-claims"
FUNCTIONS.aiFraudPrecheck          = "ai-fraud-precheck"
```

---

## Pola ServiceResult<T> (Frontend)

Digunakan di `src/services/` untuk semua frontend service calls.

```typescript
// src/config/data-source.config.ts
export const DATA_SOURCE_CONFIG = {
  useMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false',
};

// Type hasil service:
type ServiceResult<T> = {
  success: boolean;
  data: T | null;
  error?: string;
};

// Contoh implementasi facade pattern:
export async function getCampaigns(): Promise<ServiceResult<Campaign[]>> {
  if (DATA_SOURCE_CONFIG.useMockData) {
    return { success: true, data: mockCampaigns };
  }
  return getAppwriteCampaigns();
}

// Implementasi Appwrite (di *-appwrite.service.ts):
async function getAppwriteCampaigns(): Promise<ServiceResult<Campaign[]>> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTIONS.campaigns,
      [Query.equal('status', 'active'), Query.orderDesc('$createdAt')]
    );
    return { success: true, data: response.documents.map(mapCampaign) };
  } catch (err) {
    return { success: false, data: null, error: (err as Error).message };
  }
}
```

---

## Pola Backend Service (00_BACKEND/src/services/)

Pattern standar yang HARUS diikuti saat implementasi service baru:

```typescript
import { ID, Permission, Query, Role } from 'appwrite';
import { account, databases, COLLECTIONS, DATABASE_ID } from '../lib/appwrite';

// 1. Custom error class
export class XServiceError extends Error {
  code: string;
  cause?: unknown;
  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'XServiceError';
    this.code = code;
    this.cause = cause;
  }
}

// 2. Error mapper
const mapError = (err: any, fallback: string): XServiceError => {
  if (err instanceof XServiceError) return err;
  if (err?.code === 401) return new XServiceError('auth', 'Silakan login.', err);
  if (err?.code === 403) return new XServiceError('forbidden', 'Akses ditolak.', err);
  if (err?.code === 404) return new XServiceError('not_found', 'Data tidak ditemukan.', err);
  return new XServiceError(err?.type || 'unknown', fallback, err);
};

// 3. Document mapper
const mapX = (doc: Record<string, any>): X => ({
  id: doc.$id,
  // ... field lainnya
  createdAt: doc.$createdAt,
  updatedAt: doc.$updatedAt,
});

// 4. Exported functions (bukan class methods)
export const createX = async (input: CreateXInput): Promise<X> => {
  try {
    const user = await account.get();
    const doc = await databases.createDocument(
      DATABASE_ID, COLLECTIONS.x, ID.unique(),
      { ...input, userId: user.$id },
      [Permission.read(Role.user(user.$id)), Permission.update(Role.user(user.$id))]
    );
    return mapX(doc);
  } catch (err) {
    throw mapError(err, 'Gagal membuat data.');
  }
};
```

---

## Query Patterns per Domain

### Ambil dokumen by userId (field)
```typescript
await databases.listDocuments(DATABASE_ID, COLLECTIONS.wallets, [
  Query.equal('userId', user.$id),
  Query.limit(1),
]);
```

### Filter + sort + limit
```typescript
await databases.listDocuments(DATABASE_ID, COLLECTIONS.campaigns, [
  Query.equal('status', 'active'),
  Query.equal('category', 'fashion'),
  Query.orderDesc('$createdAt'),
  Query.limit(50),
]);
```

### Cek dokumen sudah ada (uniqueness check)
```typescript
const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.claims, [
  Query.equal('creatorId', user.$id),
  Query.equal('campaignId', campaignId),
  Query.limit(1),
]);
if (existing.total > 0) throw new Error('Sudah pernah claim.');
```

### Update field tertentu
```typescript
await databases.updateDocument(DATABASE_ID, COLLECTIONS.campaigns, campaignId, {
  status: 'active',
  publishedAt: new Date().toISOString(),
});
```

### Increment counter (read → update)
```typescript
const doc = await databases.getDocument(DATABASE_ID, COLLECTIONS.campaigns, id);
await databases.updateDocument(DATABASE_ID, COLLECTIONS.campaigns, id, {
  totalClaims: (doc.totalClaims ?? 0) + 1,
});
```

---

## Auth Patterns

### Dapatkan current user
```typescript
import { account } from '../lib/appwrite';
const user = await account.get(); // throws 401 jika belum login
```

### Cek role user
```typescript
// Cek di collection users, field 'role'
const userDoc = await databases.listDocuments(DATABASE_ID, COLLECTIONS.users, [
  Query.equal('$id', user.$id), Query.limit(1),
]);
const role = userDoc.documents[0]?.role; // 'umkm' | 'creator'
```

### Permission saat createDocument
```typescript
import { Permission, Role } from 'appwrite';

// Hanya pemilik yang bisa baca/update/hapus:
[
  Permission.read(Role.user(userId)),
  Permission.update(Role.user(userId)),
  Permission.delete(Role.user(userId)),
]

// Siapa saja bisa baca (publik):
[
  Permission.read(Role.any()),
  Permission.update(Role.user(userId)),
]
```

---

## File & Storage

### Upload file (via Cloud Function validate-and-upload)
```typescript
import { functions, FUNCTIONS } from '../lib/appwrite';

const result = await functions.createExecution(
  FUNCTIONS.validateAndUpload,
  JSON.stringify({ fileId, bucketId, userId }),
);
```

### Realtime subscription (frontend)
```typescript
import { client } from '@/lib/appwrite/client';

const unsubscribe = client.subscribe(
  `databases.${DATABASE_ID}.collections.${COLLECTIONS.notifications}.documents`,
  (response) => {
    if (response.events.includes('databases.*.collections.*.documents.*.create')) {
      // handle new notification
    }
  }
);
// Cleanup: unsubscribe();
```

---

## Business Constants

```typescript
PLATFORM_FEE_RATE    = 0.05      // 5%
MINIMUM_WITHDRAW     = 50_000    // Rp 50.000
MINIMUM_CAMPAIGN_BUDGET = 50_000 // Rp 50.000
```

---

## Files Penting

| File | Fungsi |
|---|---|
| `00_BACKEND/src/lib/appwrite/client.ts` | Appwrite Client instance |
| `00_BACKEND/src/lib/appwrite/collections.ts` | COLLECTIONS + DATABASE_ID + FUNCTIONS |
| `00_BACKEND/src/lib/appwrite/index.ts` | Re-export semua: client, account, databases, functions |
| `src/config/data-source.config.ts` | useMockData flag |
| `src/services/umkm/umkm-appwrite.service.ts` | Frontend Appwrite stubs UMKM |
| `src/services/creator-dashboard.service.ts` | Frontend Appwrite stubs Kreator |
