// Unit/integration tests for Appwrite Functions.
// Each function `export default async ({ req, res, log, error }) => ...`
// and imports from `node-appwrite`. We mock `node-appwrite` with an
// in-memory datastore and mock `globalThis.fetch` for external APIs
// (Midtrans / Gemini).

import { describe, it, expect, beforeEach, vi } from 'vitest';

// ---- in-memory datastore shared by the node-appwrite mock ----
const store: Record<string, any[]> = {};
const seed = (collection: string, docs: any[]) => { store[collection] = docs; };
const reset = () => { for (const k of Object.keys(store)) delete store[k]; };

const ID = {
  unique: () => `id-${Math.random().toString(36).slice(2, 10)}`,
  custom: (id: string) => id,
};
const Query = {
  equal: (a: string, v: any) => ({ method: 'equal', attr: a, value: v }),
  limit: (n: number) => ({ method: 'limit', value: n }),
  offset: (n: number) => ({ method: 'offset', value: n }),
  orderDesc: (a: string) => ({ method: 'orderDesc', attr: a }),
};
const Role = { user: (id: string) => ({ type: 'user', id }), any: () => ({ type: 'any' }) };
const Permission = {
  read: (r: any) => ({ action: 'read', role: r }),
  write: (r: any) => ({ action: 'write', role: r }),
  update: (r: any) => ({ action: 'update', role: r }),
  delete: (r: any) => ({ action: 'delete', role: r }),
};

class Databases {
  async listDocuments(_db: string, collection: string, _q: any[] = []) {
    return { documents: store[collection] || [], total: (store[collection] || []).length };
  }
  async createDocument(_db: string, collection: string, docId: string, data: any, _p?: any[]) {
    const existing = (store[collection] || []).find((d) => d.$id === docId);
    if (existing) {
      const e: any = new Error('document already exists');
      e.code = 409;
      throw e;
    }
    const doc = { $id: docId, $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString(), ...data };
    if (!store[collection]) store[collection] = [];
    store[collection].push(doc);
    return doc;
  }
  async getDocument(_db: string, collection: string, docId: string) {
    const docs = store[collection] || [];
    const doc = docs.find((d) => d.$id === docId);
    if (!doc) { const e: any = new Error('not found'); e.code = 404; throw e; }
    return doc;
  }
  async updateDocument(_db: string, collection: string, docId: string, data: any) {
    const docs = store[collection] || [];
    const idx = docs.findIndex((d) => d.$id === docId);
    if (idx === -1) { const e: any = new Error('not found'); e.code = 404; throw e; }
    docs[idx] = { ...docs[idx], ...data, $updatedAt: new Date().toISOString() };
    return docs[idx];
  }
  async deleteDocument(_db: string, collection: string, docId: string) {
    store[collection] = (store[collection] || []).filter((d) => d.$id !== docId);
    return true;
  }
}
class Client { setEndpoint() { return this; } setProject() { return this; } setKey() { return this; } }
class Storage { async createFile() { return { $id: 'file-1' }; } async deleteFile() { return true; } }
class Functions { async createExecution() { return { $id: 'e1', status: 'success', responseBody: '{}' }; } }
class Messaging { async createPush() { return { $id: 'm1' }; } }

vi.mock('node-appwrite', () => ({
  Client, Databases, ID, Query, Role, Permission, Storage, Functions, Messaging,
}));

// helper to build a fake req/res
const makeReq = (over: any = {}) => ({
  method: 'POST',
  headers: { 'x-appwrite-user-id': 'user-1' },
  bodyJson: {},
  bodyText: '{}',
  ...over,
});
const makeRes = () => {
  const calls: any[] = [];
  return {
    calls,
    json: (body: any, status = 200) => { calls.push({ body, status }); return { body, status }; },
    empty: () => { calls.push({ empty: true }); return {}; },
  };
};

beforeEach(() => {
  reset();
  vi.restoreAllMocks();
  // Base Appwrite env required by every function's getEnv()
  process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'https://mock.appwrite.io/v1';
  process.env.APPWRITE_FUNCTION_PROJECT_ID = 'mock-project';
  process.env.APPWRITE_API_KEY = 'mock-key';
  process.env.APPWRITE_DATABASE_ID = 'db';
  process.env.MIDTRANS_SERVER_KEY = 'server_key';
  process.env.MIDTRANS_ENV = 'sandbox';
});

describe('create-order function', () => {
  it('creates order with status pending_payment on offer accepted', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.OFFERS_COLLECTION_ID = 'offers';
    const main = (await import('../../functions/create-order/src/main.js')).default;
    // Appwrite event payload: the offer document with $id, status, and oldStatus
    const req = makeReq({ bodyJson: { $id: 'o1', status: 'accepted', oldStatus: 'pending', creatorId: 'c1', umkmId: 'u1', price: 100000, deadline: '2026-12-31', revisionLimit: 2 } });
    const res = makeRes();
    const result = await main({ req, res, log: () => {}, error: () => {} });
    expect(result.body.orderId).toBeDefined();
    const order = (store['orders'] || []).find((o) => o.$id === result.body.orderId);
    expect(order.status).toBe('pending_payment');
    expect(order.amount).toBe(100000);
  });

  it('ignores non pending->accepted transitions', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    const main = (await import('../../functions/create-order/src/main.js')).default;
    const req = makeReq({ bodyJson: { $id: 'o1', status: 'pending', oldStatus: 'pending' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    expect(res.calls[0].body.status).toBe('ignored');
  });
});

describe('create-user-wallet function', () => {
  it('creates wallet with zero balances', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.USERS_COLLECTION_ID = 'users';
    seed('users', [{ $id: 'u1', userId: 'user-1', role: 'umkm', email: 'a@x.com' }]);
    const main = (await import('../../functions/create-user-wallet/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-1' }, bodyJson: { userId: 'user-1' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const wallets = store['wallets'] || [];
    expect(wallets).toHaveLength(1);
    expect(wallets[0].balance).toBe(0);
    expect(wallets[0].pendingBalance).toBe(0);
  });
});

describe('midtrans-webhook function', () => {
  it('marks payment paid when signature valid', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    process.env.MIDTRANS_SERVER_KEY = 'server_key';
    const gross = 100000;
    const orderId = 'order-abc';
    const statusCode = '200';
    const crypto = await import('node:crypto');
    const signatureKey = crypto.createHash('sha512')
      .update(`${orderId}${statusCode}${gross}${process.env.MIDTRANS_SERVER_KEY}`).digest('hex');
    seed('payments', [{ $id: 'p1', user_id: 'user-1', order_id: 'abc', amount: gross, gateway: 'midtrans', gateway_reference: orderId, status: 'pending' }]);
    const main = (await import('../../functions/midtrans-webhook/src/main.js')).default;
    const req = makeReq({ bodyJson: { order_id: orderId, status_code: statusCode, gross_amount: gross, signature_key: signatureKey, transaction_status: 'settlement' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const payment = (store['payments'] || []).find((p) => p.$id === 'p1');
    expect(payment.status).toBe('paid');
  });

  it('rejects invalid signature', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    process.env.MIDTRANS_SERVER_KEY = 'server_key';
    seed('payments', [{ $id: 'p1', user_id: 'user-1', order_id: 'abc', amount: 100000, gateway: 'midtrans', gateway_reference: 'order-abc', status: 'pending' }]);
    const main = (await import('../../functions/midtrans-webhook/src/main.js')).default;
    const req = makeReq({ bodyJson: { order_id: 'order-abc', status_code: '200', gross_amount: 100000, signature_key: 'wrong', transaction_status: 'settlement' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    expect(res.calls[0].status).toBe(401);
  });
});

describe('create-escrow function', () => {
  it('creates held escrow and sets order in_progress on payment paid', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    seed('orders', [{ $id: 'o1', umkmId: 'u1', creatorId: 'c1', amount: 100000, status: 'pending_payment' }]);
    seed('wallets', [{ $id: 'w1', userId: 'u1', balance: 0, pendingBalance: 0 }]);
    const main = (await import('../../functions/create-escrow/src/main.js')).default;
    // payment document delivered via event payload
    const req = makeReq({ bodyJson: { $id: 'p1', status: 'paid', purpose: 'order', order_id: 'o1', user_id: 'u1', amount: 100000 } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const escrow = (store['escrows'] || [])[0];
    expect(escrow).toBeDefined();
    expect(escrow.status).toBe('held');
    const order = (store['orders'] || []).find((o) => o.$id === 'o1');
    expect(order.status).toBe('in_progress');
  });
});

describe('release-escrow function', () => {
  it('releases escrow and credits creator wallet', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    seed('escrows', [{ $id: 'e1', orderId: 'o1', amount: 100000, status: 'held' }]);
    seed('orders', [{ $id: 'o1', umkmId: 'u1', creatorId: 'c1', amount: 100000, status: 'in_progress' }]);
    seed('wallets', [{ $id: 'w1', userId: 'c1', balance: 0, pendingBalance: 0 }]);
    const main = (await import('../../functions/release-escrow/src/main.js')).default;
    // deliverable document delivered via event payload
    const req = makeReq({ bodyJson: { $id: 'd1', status: 'approved', orderId: 'o1' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const escrow = (store['escrows'] || []).find((e) => e.$id === 'e1');
    expect(escrow.status).toBe('released');
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    expect(wallet.balance).toBe(100000);
  });
});

describe('calculate-campaign-reward function', () => {
  it('credits creator pending balance and updates campaign budget', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    seed('campaigns', [{ $id: 'c1', umkmId: 'u1', rewardPer1000Views: 1000, remainingBudget: 50000, spentAmount: 0 }]);
    seed('wallets', [{ $id: 'w1', userId: 'c1', balance: 0, pendingBalance: 0 }]);
    const main = (await import('../../functions/calculate-campaign-reward/src/main.js')).default;
    // submission document delivered via event payload
    const req = makeReq({ bodyJson: { $id: 's1', status: 'approved', campaignId: 'c1', creatorId: 'c1', views: 10000 } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    // reward = views/1000 * rewardPer1000Views = 10 * 1000 = 10000
    expect(wallet.pendingBalance).toBe(10000);
    const campaign = (store['campaigns'] || []).find((c) => c.$id === 'c1');
    expect(campaign.spentAmount).toBe(10000);
    expect(campaign.remainingBudget).toBe(40000);
  });
});

describe('create-payment + create-escrow (campaign topup flow)', () => {
  it('accepts campaign purpose and credits remainingBudget on paid', async () => {
    // mock Midtrans Snap + TablesDB fetch (create-payment + create-escrow completeTopup)
    const mockFetch = (url: string, init: any) => {
      const snap = url.match(/\/snap\/v1\/transactions$/);
      if (snap) return { ok: true, json: async () => ({ token: 'tok', redirect_url: 'url' }) };
      const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
      if (m) {
        const [, table, rowId, column, op] = m;
        const doc = (store[table] || []).find((d: any) => d.$id === rowId);
        if (doc) {
          const body = JSON.parse(init.body);
          const value = Number(body.value);
          if (op === 'increment') {
            doc[column] = Number(doc[column] || 0) + value;
          } else {
            doc[column] = Number(doc[column] || 0) - value;
          }
        }
        return { ok: true, status: 200, text: async () => '{}' };
      }
      return { ok: true, status: 200, text: async () => '{}' };
    };
    (globalThis as any).fetch = mockFetch;
    // 1. create-payment with purpose campaign (now allowed)
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    // Seed campaign for validation (draft status, matching budget)
    seed('campaigns', [{ $id: 'c1', umkmId: 'user-1', budget: 50000, status: 'draft', remainingBudget: 0, spentAmount: 0 }]);
    const cpMain = (await import('../../functions/create-payment/src/main.js')).default;
    const cpReq = makeReq({ bodyJson: { purpose: 'campaign', amount: 50000, campaignId: 'c1' } });
    const cpRes = makeRes();
    const cpResult = await cpMain({ req: cpReq, res: cpRes, log: () => {}, error: () => {} });
    expect(cpResult.body.paymentId).toBeDefined();

    // 2. seed the payment as paid, then create-escrow routes campaign -> completeTopup (credits remainingBudget)
    seed('payments', [{ $id: cpResult.body.paymentId, user_id: 'user-1', amount: 50000, purpose: 'campaign', gateway: 'midtrans', gateway_reference: `cmp-${cpResult.body.paymentId}`, status: 'paid' }]);
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    // UMKM wallet must NOT be credited by campaign top-up (T-19)
    seed('wallets', [{ $id: 'w1', userId: 'user-1', balance: 0, pendingBalance: 0 }]);
    const ceMain = (await import('../../functions/create-escrow/src/main.js')).default;
    const ceReq = makeReq({ bodyJson: { $id: cpResult.body.paymentId, status: 'paid', purpose: 'campaign', order_id: null, user_id: 'u1', amount: 50000, campaign_id: 'c1' } });
    const ceRes = makeRes();
    await ceMain({ req: ceReq, res: ceRes, log: () => {}, error: () => {} });
    const campaign = (store['campaigns'] || []).find((c) => c.$id === 'c1');
    expect(campaign.remainingBudget).toBe(50000);
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    expect(wallet.balance).toBe(0); // UMKM wallet untouched by campaign payment
  });
});

describe('create-payment topup rejection (T-19)', () => {
  it('rejects purpose topup with 400', async () => {
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    const cpMain = (await import('../../functions/create-payment/src/main.js')).default;
    const cpReq = makeReq({ bodyJson: { purpose: 'topup', amount: 50000 } });
    const cpRes = makeRes();
    const cpResult = await cpMain({ req: cpReq, res: cpRes, log: () => {}, error: () => {} });
    expect(cpResult.status).toBe(400);
    expect(cpResult.body.error).toBe('Invalid payment purpose');
    expect((store['payments'] || [])).toHaveLength(0);
  });
});

describe('user.service searchCreators price filter (rate_card_packages)', () => {
  it('filters creators by package price range', async () => {
    const mockAppwrite = await import('../../src/test-mocks/appwrite');
    const mk = mockAppwrite as any;
    mk.__mockAccountGet(() => ({ $id: 'user-1' }));
    mk.__seed('rate_card_packages', [
      { $id: 'pkg1', rateCardId: 'rc1', name: 'P1', description: 'd', output: 'video', deliveryDays: 3, price: 50000, revisionLimit: 1 },
      { $id: 'pkg2', rateCardId: 'rc2', name: 'P2', description: 'd', output: 'video', deliveryDays: 3, price: 200000, revisionLimit: 1 },
    ]);
    mk.__seed('rate_cards', [
      { $id: 'rc1', creatorId: 'creator-1', title: 'RC1', status: 'published' },
      { $id: 'rc2', creatorId: 'creator-2', title: 'RC2', status: 'published' },
    ]);
    mk.__seed('creator_profiles', [
      { $id: 'cp1', userId: 'creator-1', role: 'creator', displayName: 'C1', isProfileCompleted: true, totalFollowers: 0, totalOrders: 0, rating: 0 },
      { $id: 'cp2', userId: 'creator-2', role: 'creator', displayName: 'C2', isProfileCompleted: true, totalFollowers: 0, totalOrders: 0, rating: 0 },
    ]);
    const { searchCreators } = await import('../../src/services/user.service');
    const creators = await searchCreators({ minPrice: 100000, maxPrice: 250000 });
    const ids = creators.map((c) => c.userId);
    expect(ids).toContain('creator-2');
    expect(ids).not.toContain('creator-1');
  });
});

describe('campaign-claimed function', () => {
  it('notifies UMKM owner when claim verified (within limit)', async () => {
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.CLAIMS_COLLECTION_ID = 'campaign_claims';
    process.env.CREATOR_PROFILES_COLLECTION_ID = 'creator_profiles';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    seed('campaigns', [{ $id: 'c1', umkmId: 'u1', title: 'C1', claimLimit: 5, totalClaims: 1 }]);
    seed('creator_profiles', [{ $id: 'cp1', userId: 'c1', displayName: 'Creator' }]);
    const main = (await import('../../functions/campaign-claimed/src/main.js')).default;
    // claim document delivered via event payload
    const req = makeReq({ bodyJson: { $id: 'cl1', campaignId: 'c1', creatorId: 'c1', status: 'claimed' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const notes = store['notifications'] || [];
    expect(notes).toHaveLength(1);
    expect(notes[0].userId).toBe('u1');
    expect(notes[0].message).toContain('Creator');
  });

  it('corrects claim limit when exceeded', async () => {
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.CLAIMS_COLLECTION_ID = 'campaign_claims';
    process.env.CREATOR_PROFILES_COLLECTION_ID = 'creator_profiles';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    seed('campaigns', [{ $id: 'c1', umkmId: 'u1', title: 'C1', claimLimit: 3, totalClaims: 5 }]);
    seed('creator_profiles', [{ $id: 'cp1', userId: 'c1', displayName: 'Creator' }]);
    const main = (await import('../../functions/campaign-claimed/src/main.js')).default;
    const req = makeReq({ bodyJson: { $id: 'cl1', campaignId: 'c1', creatorId: 'c1', status: 'claimed' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const campaign = (store['campaigns'] || []).find((c) => c.$id === 'c1');
    expect(campaign.totalClaims).toBe(4);
  });
});

describe('expire-stale-claims function', () => {
  it('expires claims past submissionDays and decrements totalClaims', async () => {
    process.env.CLAIMS_COLLECTION_ID = 'campaign_claims';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.CREATOR_PROFILES_COLLECTION_ID = 'creator_profiles';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    // claim made 30 days ago; submissionDays 7 -> expired
    const old = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    seed('campaigns', [{ $id: 'c1', umkmId: 'u1', title: 'C1', submissionDays: 7, totalClaims: 2 }]);
    seed('campaign_claims', [{ $id: 'cl1', campaignId: 'c1', creatorId: 'c1', status: 'claimed', claimedAt: old }]);
    seed('creator_profiles', [{ $id: 'cp1', userId: 'c1', displayName: 'Creator' }]);
    const main = (await import('../../functions/expire-stale-claims/src/main.js')).default;
    const req = makeReq({ bodyJson: {} });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });
    const claim = (store['campaign_claims'] || []).find((c) => c.$id === 'cl1');
    expect(claim.status).toBe('expired');
    const campaign = (store['campaigns'] || []).find((c) => c.$id === 'c1');
    expect(campaign.totalClaims).toBe(1);
    const notes = store['notifications'] || [];
    expect(notes.some((n) => n.userId === 'c1')).toBe(true);
  });
});

describe('calculate-campaign-reward function (FIX A: idempotency)', () => {
  it('is idempotent when called twice with the same approved submission', async () => {
    // Mock TablesDB fetch for atomic increment/decrement
    const mockTablesDb = (url: string, init: any) => {
      const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
      if (m) {
        const [, table, rowId, column, op] = m;
        const doc = (store[table] || []).find((d: any) => d.$id === rowId);
        if (doc) {
          const body = JSON.parse(init.body);
          const value = Number(body.value);
          if (op === 'increment') {
            doc[column] = Number(doc[column] || 0) + value;
          } else {
            const next = Number(doc[column] || 0) - value;
            if (typeof body.min === 'number' && next < body.min) {
              return { ok: false, status: 409, text: async () => 'min exceeded' };
            }
            doc[column] = next;
          }
        }
        return { ok: true, status: 200, text: async () => '{}' };
      }
      return { ok: true, status: 200, text: async () => '{}' };
    };

    (globalThis as any).fetch = mockTablesDb;

    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    seed('campaigns', [{ $id: 'c1', umkmId: 'u1', rewardPer1000Views: 1000, remainingBudget: 50000, spentAmount: 0 }]);
    seed('wallets', [{ $id: 'w1', userId: 'c1', balance: 0, pendingBalance: 0 }]);
    const main = (await import('../../functions/calculate-campaign-reward/src/main.js')).default;
    const req = makeReq({ bodyJson: { $id: 's1', status: 'approved', campaignId: 'c1', creatorId: 'c1', views: 10000 } });

    // First call
    const res1 = makeRes();
    await main({ req, res: res1, log: () => {}, error: () => {} });
    expect(res1.calls[0].body.success).toBe(true);

    // Second call with same submission - should be idempotent (return empty)
    const res2 = makeRes();
    await main({ req, res: res2, log: () => {}, error: () => {} });
    expect(res2.calls[0].empty).toBe(true);

    // Assertions: only one credit, one ledger, one budget deduction
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    expect(wallet.pendingBalance).toBe(10000); // only once
    const txs = (store['transactions'] || []).filter((t) => t.referenceId === 's1' && t.type === 'release');
    expect(txs).toHaveLength(1); // one ledger row
    const campaign = (store['campaigns'] || []).find((c) => c.$id === 'c1');
    expect(campaign.remainingBudget).toBe(40000); // deducted once
    expect(campaign.spentAmount).toBe(10000);
  });
});

describe('request-withdrawal function (FIX B: atomic debit, 4-state flow)', () => {
  // Router fetch: TablesDB atomic ops update the in-memory store; Iris payouts
  // can be forced to succeed or fail per test.
  const mockFetch = (iris?: (url: string, init: any) => any) => (url: string, init: any) => {
    const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
    if (m) {
      const [, table, rowId, column, op] = m;
      const doc = (store[table] || []).find((d: any) => d.$id === rowId);
      if (doc) {
        const body = JSON.parse(init.body);
        const value = Number(body.value);
        if (op === 'increment') {
          doc[column] = Number(doc[column] || 0) + value;
        } else {
          const next = Number(doc[column] || 0) - value;
          if (typeof body.min === 'number' && next < body.min) {
            return { ok: false, status: 409, text: async () => 'min exceeded' };
          }
          doc[column] = next;
        }
      }
      return { ok: true, status: 200, text: async () => '{}' };
    }
    if (url.includes('/iris/payouts')) {
      return iris ? iris(url, init) : { ok: true, status: 201, json: async () => ({ payouts: [{ reference_no: 'REF-1', status: 'queued' }] }) };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  const envWithdrawal = () => {
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.WITHDRAWALS_COLLECTION_ID = 'withdrawals';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.USERS_COLLECTION_ID = 'users';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    process.env.MINIMUM_WITHDRAW = '50000';
    process.env.CURRENT_TOS_VERSION = 'v3.1';
    process.env.KYC_THRESHOLD = '5000000';
    process.env.WITHDRAW_PER_DAY_LIMIT = '3';
    process.env.WITHDRAW_COOLING_DAYS = '3';
    process.env.MIDTRANS_IRIS_SERVER_KEY = 'iris_key';
  };

  const seedCreator = (uid: string, balance: number, over: any = {}) => {
    seed('users', [{ $id: `u-${uid}`, userId: uid, role: 'creator', tos_version: 'v3.1', tos_accepted_at: new Date().toISOString(), email_verified_at: new Date().toISOString(), kyc_status: 'verified', ...over }]);
    seed('wallets', [{ $id: `w-${uid}`, userId: uid, balance }]);
  };

  const payload = (requestKey: string, over: any = {}) => ({
    amount: 50000, payoutMethod: 'bank', providerName: 'BCA',
    accountNumber: '1234567890', accountName: 'Panji', requestKey,
    ...over,
  });

  // ===== T-14 / T-15 gates =====
  it('rejects withdrawal when creator has not accepted TOS v3.1', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seed('users', [{ $id: 'uX', userId: 'user-X', role: 'creator', tos_version: 'v3.0' }]);
    seed('wallets', [{ $id: 'wX', userId: 'user-X', balance: 100000 }]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-X' }, bodyJson: payload('req-key-tos') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(403);
    expect(res.calls[0].body.error).toBe('Setujui T&C terbaru terlebih dahulu.');
    expect((store['withdrawals'] || [])).toHaveLength(0); // no audit row
  });

  it('rejects first withdrawal when email not verified', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seed('users', [{ $id: 'uY', userId: 'user-Y', role: 'creator', tos_version: 'v3.1', tos_accepted_at: new Date().toISOString(), email_verified_at: null }]);
    seed('wallets', [{ $id: 'wY', userId: 'user-Y', balance: 100000 }]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-Y' }, bodyJson: payload('req-key-email') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(403);
    expect(res.calls[0].body.error).toBe('Verifikasi email sebelum penarikan pertama.');
    expect((store['withdrawals'] || [])).toHaveLength(0);
  });

  // ===== 4-state flow: requested -> processing =====
  it('allows withdrawal when TOS + email verified, moves to processing with iris reference', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seedCreator('user-Z', 100000);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-Z' }, bodyJson: payload('req-key-pass') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(200);
    expect(res.calls[0].body.status).toBe('processing');
    expect(res.calls[0].body.irisReference).toBe('REF-1');
    expect((store['withdrawals'] || [])).toHaveLength(1);
    expect((store['withdrawals'] || [])[0].status).toBe('processing');
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w-user-Z');
    expect(wallet.balance).toBe(50000); // 100000 - 50000 atomic debit
  });

  it('rejects withdrawal when balance is zero and leaves no withdrawals row', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seedCreator('user-1', 0);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-1' }, bodyJson: payload('req-key-001') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(409);
    expect(res.calls[0].body.error).toBe('Saldo tidak mencukupi');
    expect((store['withdrawals'] || [])).toHaveLength(0);
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w-user-1');
    expect(wallet.balance).toBe(0);
  });

  it('allows only the first of two identical withdrawals (same amount, same requestKey)', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seedCreator('user-1', 50000);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const body = payload('req-key-001');

    // First withdrawal
    const res1 = makeRes();
    await main({ req: makeReq({ headers: { 'x-appwrite-user-id': 'user-1' }, bodyJson: body }), res: res1, log: () => {}, error: () => {} });
    expect(res1.calls[0].body.status).toBe('processing');

    // Second withdrawal with same requestKey (duplicate guard)
    const res2 = makeRes();
    await main({ req: makeReq({ headers: { 'x-appwrite-user-id': 'user-1' }, bodyJson: body }), res: res2, log: () => {}, error: () => {} });
    expect(res2.calls[0].status).toBe(409);

    // Balance should be 0 after first, second rejected
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w-user-1');
    expect(wallet.balance).toBe(0);
  });

  // ===== UMKM source validation =====
  it('rejects UMKM withdrawal without a valid source origin', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seed('users', [{ $id: 'uM', userId: 'user-M', role: 'umkm', tos_version: 'v3.1', tos_accepted_at: new Date().toISOString(), email_verified_at: new Date().toISOString(), kyc_status: 'verified' }]);
    seed('wallets', [{ $id: 'wM', userId: 'user-M', balance: 100000 }]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-M' }, bodyJson: payload('req-key-umkm-x', { sourceOrigin: 'creator' }) });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(403);
    expect((store['withdrawals'] || [])).toHaveLength(0);
  });

  it('rejects UMKM withdrawal when no refund/budget source exists in ledger', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seed('users', [{ $id: 'uM2', userId: 'user-M2', role: 'umkm', tos_version: 'v3.1', tos_accepted_at: new Date().toISOString(), email_verified_at: new Date().toISOString(), kyc_status: 'verified' }]);
    seed('wallets', [{ $id: 'wM2', userId: 'user-M2', balance: 100000 }]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-M2' }, bodyJson: payload('req-key-umkm-n', { sourceOrigin: 'umkm_refund' }) });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(403);
    expect((store['withdrawals'] || [])).toHaveLength(0);
  });

  it('allows UMKM withdrawal backed by a refund ledger entry', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seed('users', [{ $id: 'uM3', userId: 'user-M3', role: 'umkm', tos_version: 'v3.1', tos_accepted_at: new Date().toISOString(), email_verified_at: new Date().toISOString(), kyc_status: 'verified' }]);
    seed('wallets', [{ $id: 'wM3', userId: 'user-M3', balance: 100000 }]);
    seed('transactions', [{ $id: 'tx-refund-1', userId: 'user-M3', type: 'refund', amount: 60000, status: 'completed' }]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-M3' }, bodyJson: payload('req-key-umkm-y', { sourceOrigin: 'umkm_refund' }) });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(200);
    expect(res.calls[0].body.status).toBe('processing');
    const wd = (store['withdrawals'] || [])[0];
    expect(wd.source_origin).toBe('umkm_refund');
    expect(wd.requester_role).toBe('umkm');
  });

  // ===== KYC (Pasal 11.8) =====
  it('requires KYC verified for amount at or above threshold and marks pending_wa', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seedCreator('user-K', 10000000, { kyc_status: 'none' });

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-K' }, bodyJson: payload('req-key-kyc', { amount: 6000000 }) });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(403);
    expect(res.calls[0].body.error).toBe('Verifikasi KYC dulu melalui WhatsApp admin.');
    expect((store['withdrawals'] || [])).toHaveLength(0);
    const user = (store['users'] || []).find((u) => u.userId === 'user-K');
    expect(user.kyc_status).toBe('pending_wa');
  });

  // ===== Rate limit + cooling (T-18, Pasal 11) =====
  it('enforces 3 withdrawals/day rate limit', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seedCreator('user-R', 500000);
    seed('withdrawals', [
      { $id: 'wd-a', userId: 'user-R', amount: 50000, status: 'succeeded', accountNumber: '1234567890', providerName: 'BCA', $createdAt: new Date().toISOString() },
      { $id: 'wd-b', userId: 'user-R', amount: 50000, status: 'succeeded', accountNumber: '1234567890', providerName: 'BCA', $createdAt: new Date().toISOString() },
      { $id: 'wd-c', userId: 'user-R', amount: 50000, status: 'succeeded', accountNumber: '1234567890', providerName: 'BCA', $createdAt: new Date().toISOString() },
    ]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-R' }, bodyJson: payload('req-key-rate') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(429);
    expect(res.calls[0].body.error).toBe('Batas penarikan harian tercapai (3/hari).');
    expect((store['withdrawals'] || [])).toHaveLength(3); // no 4th row
  });

  it('enforces 3-day cooling when account number changed recently', async () => {
    (globalThis as any).fetch = mockFetch();
    envWithdrawal();
    seedCreator('user-C', 500000);
    // recent withdrawal on a DIFFERENT account -> cooling block
    seed('withdrawals', [
      { $id: 'wd-old', userId: 'user-C', amount: 50000, status: 'succeeded', accountNumber: '9999999999', providerName: 'BNI', $createdAt: new Date().toISOString() },
    ]);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-C' }, bodyJson: payload('req-key-cool') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(429);
    expect(res.calls[0].body.error).toBe('Akun penarikan baru perlu pending 3 hari.');
  });

  // ===== Iris failure -> failed + reversal (idempotent) =====
  it('credits balance back and marks reversed when Iris payout fails', async () => {
    const irisFail = () => ({ ok: false, status: 400, json: async () => ({ error_messages: ['invalid beneficiary account'] }) });
    (globalThis as any).fetch = mockFetch(irisFail);
    envWithdrawal();
    seedCreator('user-F', 100000);

    const main = (await import('../../functions/request-withdrawal/src/main.js')).default;
    const req = makeReq({ headers: { 'x-appwrite-user-id': 'user-F' }, bodyJson: payload('req-key-fail') });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('failed');
    expect(res.calls[0].body.failureReason).toBeDefined();
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w-user-F');
    expect(wallet.balance).toBe(100000); // debited then credited back
    const wd = (store['withdrawals'] || []).find((d) => d.$id === res.calls[0].body.withdrawalId);
    expect(wd.status).toBe('reversed');
    const reversals = (store['transactions'] || []).filter((t) => t.type === 'withdrawal_reversal');
    expect(reversals).toHaveLength(1);
  });
});

describe('Phase 2: T-01 Fee from env + snapshot', () => {
  // Helper to mock TablesDB fetch for atomic increment
  const mockTablesDb = (url: string, init: any) => {
    const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
    if (m) {
      const [, table, rowId, column, op] = m;
      const doc = (store[table] || []).find((d: any) => d.$id === rowId);
      if (doc) {
        const body = JSON.parse(init.body);
        const value = Number(body.value);
        if (op === 'increment') {
          doc[column] = Number(doc[column] || 0) + value;
        } else {
          const next = Number(doc[column] || 0) - value;
          if (typeof body.min === 'number' && next < body.min) {
            return { ok: false, status: 409, text: async () => 'min exceeded' };
          }
          doc[column] = next;
        }
      }
      return { ok: true, status: 200, text: async () => '{}' };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  it('create-payment uses FEE_RATE env (0.05) for campaign', async () => {
    process.env.FEE_RATE = '0.05';
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    seed('campaigns', [{ $id: 'c1', umkmId: 'user-1', budget: 100000, status: 'draft', remainingBudget: 0, spentAmount: 0 }]);
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => ({ token: 'tok', redirect_url: 'url' }) });

    const cpMain = (await import('../../functions/create-payment/src/main.js')).default;
    const cpReq = makeReq({ bodyJson: { purpose: 'campaign', amount: 100000, campaignId: 'c1' } });
    const cpRes = makeRes();
    const cpResult = await cpMain({ req: cpReq, res: cpRes, log: () => {}, error: () => {} });

    expect(cpResult.body.paymentId).toBeDefined();
    const payment = (store['payments'] || []).find((p) => p.$id === cpResult.body.paymentId);
    // fee = floor(100000 * 0.05) = 5000
    expect(payment.fee_amount).toBe(5000);
    expect(payment.total_amount).toBe(105000);
  });

  it('release-escrow uses escrow.fee_rate snapshot (0.02) even when env FEE_RATE=0.05', async () => {
    process.env.FEE_RATE = '0.05';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    (globalThis as any).fetch = mockTablesDb;

    // Escrow created when fee_rate was 0.02 (snapshot)
    seed('escrows', [{ $id: 'e1', orderId: 'o1', amount: 100000, status: 'held', fee_rate: 0.02 }]);
    seed('orders', [{ $id: 'o1', umkmId: 'u1', creatorId: 'c1', amount: 100000, status: 'in_progress' }]);
    seed('wallets', [{ $id: 'w1', userId: 'c1', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/release-escrow/src/main.js')).default;
    const req = makeReq({ bodyJson: { $id: 'd1', status: 'approved', orderId: 'o1' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    const escrow = (store['escrows'] || []).find((e) => e.$id === 'e1');
    expect(escrow.status).toBe('released');

    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    // fee = floor(100000 * 0.02) = 2000, creator gets 98000
    expect(wallet.balance).toBe(98000);
  });

  it('release-escrow falls back to 0.02 when escrow has no fee_rate', async () => {
    process.env.FEE_RATE = '0.05';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    (globalThis as any).fetch = mockTablesDb;

    // Old escrow without fee_rate column
    seed('escrows', [{ $id: 'e2', orderId: 'o2', amount: 100000, status: 'held' }]);
    seed('orders', [{ $id: 'o2', umkmId: 'u1', creatorId: 'c1', amount: 100000, status: 'in_progress' }]);
    seed('wallets', [{ $id: 'w2', userId: 'c1', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/release-escrow/src/main.js')).default;
    const req = makeReq({ bodyJson: { $id: 'd2', status: 'approved', orderId: 'o2' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w2');
    // fallback 0.02 → fee = 2000, creator gets 98000
    expect(wallet.balance).toBe(98000);
  });
});

describe('fee-rate-flip function (T-01)', () => {
  const mockTablesDb = (url: string, init: any) => {
    const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
    if (m) {
      const [, table, rowId, column, op] = m;
      const doc = (store[table] || []).find((d: any) => d.$id === rowId);
      if (doc) {
        const body = JSON.parse(init.body);
        const value = Number(body.value);
        if (op === 'increment') {
          doc[column] = Number(doc[column] || 0) + value;
        } else {
          const next = Number(doc[column] || 0) - value;
          if (typeof body.min === 'number' && next < body.min) {
            return { ok: false, status: 409, text: async () => 'min exceeded' };
          }
          doc[column] = next;
        }
      }
      return { ok: true, status: 200, text: async () => '{}' };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  it('does not reach threshold with 999 completed transactions', async () => {
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    process.env.FEE_RATE = '0.02';
    // Seed 999 completed transactions
    const txs = Array.from({ length: 999 }, (_, i) => ({
      $id: `tx${i}`,
      userId: 'user-1',
      amount: 1000,
      type: 'payment',
      referenceId: `ref${i}`,
      referenceType: 'order',
      status: 'completed'
    }));
    seed('transactions', txs);
    (globalThis as any).fetch = mockTablesDb;

    const main = (await import('../../functions/fee-rate-flip/src/main.js')).default;
    const req = makeReq({ bodyJson: {} });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.thresholdReached).toBe(false);
    expect(res.calls[0].body.count).toBe(999);
    expect(res.calls[0].body.rate).toBe(0.02);
    expect((store['notifications'] || [])).toHaveLength(0);
  });

  it('reaches threshold with 1000 completed transactions and logs alert', async () => {
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    process.env.FEE_RATE = '0.02';
    process.env.ADMIN_NOTIFY_USER_ID = 'admin-1';
    // Seed 1000 completed transactions
    const txs = Array.from({ length: 1000 }, (_, i) => ({
      $id: `tx${i}`,
      userId: 'user-1',
      amount: 1000,
      type: 'payment',
      referenceId: `ref${i}`,
      referenceType: 'order',
      status: 'completed'
    }));
    seed('transactions', txs);
    (globalThis as any).fetch = mockTablesDb;

    const main = (await import('../../functions/fee-rate-flip/src/main.js')).default;
    const req = makeReq({ bodyJson: {} });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.thresholdReached).toBe(true);
    expect(res.calls[0].body.count).toBe(1000);
    // Notification created for admin
    const notifications = (store['notifications'] || []);
    expect(notifications.some((n) => n.userId === 'admin-1' && n.type === 'system')).toBe(true);
  });
});

describe('refund-escrow function (T-02)', () => {
  const mockTablesDb = (url: string, init: any) => {
    const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
    if (m) {
      const [, table, rowId, column, op] = m;
      const doc = (store[table] || []).find((d: any) => d.$id === rowId);
      if (doc) {
        const body = JSON.parse(init.body);
        const value = Number(body.value);
        if (op === 'increment') {
          doc[column] = Number(doc[column] || 0) + value;
        } else {
          const next = Number(doc[column] || 0) - value;
          if (typeof body.min === 'number' && next < body.min) {
            return { ok: false, status: 409, text: async () => 'min exceeded' };
          }
          doc[column] = next;
        }
      }
      return { ok: true, status: 200, text: async () => '{}' };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  it('refunds held escrow to UMKM wallet and creates refund ledger', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    (globalThis as any).fetch = mockTablesDb;

    seed('escrows', [{ $id: 'e1', orderId: 'o1', amount: 100000, status: 'held' }]);
    seed('orders', [{ $id: 'o1', umkmId: 'u1', creatorId: 'c1', amount: 100000, status: 'in_progress' }]);
    seed('wallets', [{ $id: 'w1', userId: 'u1', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/refund-escrow/src/main.js')).default;
    const req = makeReq({ bodyJson: { escrowId: 'e1' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    const escrow = (store['escrows'] || []).find((e) => e.$id === 'e1');
    expect(escrow.status).toBe('refunded');
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    expect(wallet.balance).toBe(100000);
    const refundTx = (store['transactions'] || []).filter((t) => t.type === 'refund' && t.referenceId === 'e1');
    expect(refundTx).toHaveLength(1);
    expect(refundTx[0].amount).toBe(100000);
    expect(refundTx[0].status).toBe('completed');
  });

  it('is idempotent - second call with same escrowId does not double credit', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    (globalThis as any).fetch = mockTablesDb;

    seed('escrows', [{ $id: 'e2', orderId: 'o2', amount: 50000, status: 'held' }]);
    seed('orders', [{ $id: 'o2', umkmId: 'u2', creatorId: 'c2', amount: 50000, status: 'in_progress' }]);
    seed('wallets', [{ $id: 'w2', userId: 'u2', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/refund-escrow/src/main.js')).default;

    // First call
    const res1 = makeRes();
    await main({ req: makeReq({ bodyJson: { escrowId: 'e2' } }), res: res1, log: () => {}, error: () => {} });
    expect(res1.calls[0].body.status).toBe('ok');

    // Second call
    const res2 = makeRes();
    await main({ req: makeReq({ bodyJson: { escrowId: 'e2' } }), res: res2, log: () => {}, error: () => {} });
    expect(res2.calls[0].body.status).toBe('ignored');

    // Assertions
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w2');
    expect(wallet.balance).toBe(50000); // only once
    const refundTx = (store['transactions'] || []).filter((t) => t.type === 'refund' && t.referenceId === 'e2');
    expect(refundTx).toHaveLength(1); // one ledger row
  });

  it('ignores released escrow (creator funds not pulled back)', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    (globalThis as any).fetch = mockTablesDb;

    seed('escrows', [{ $id: 'e3', orderId: 'o3', amount: 100000, status: 'released' }]);
    seed('orders', [{ $id: 'o3', umkmId: 'u3', creatorId: 'c3', amount: 100000, status: 'completed' }]);
    seed('wallets', [{ $id: 'w3', userId: 'u3', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/refund-escrow/src/main.js')).default;
    const req = makeReq({ bodyJson: { escrowId: 'e3' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ignored');
    const escrow = (store['escrows'] || []).find((e) => e.$id === 'e3');
    expect(escrow.status).toBe('released'); // unchanged
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w3');
    expect(wallet.balance).toBe(0); // no credit to UMKM
  });
});

describe('refund-order function (T-02)', () => {
  const mockTablesDb = (url: string, init: any) => {
    const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
    if (m) {
      const [, table, rowId, column, op] = m;
      const doc = (store[table] || []).find((d: any) => d.$id === rowId);
      if (doc) {
        const body = JSON.parse(init.body);
        const value = Number(body.value);
        if (op === 'increment') {
          doc[column] = Number(doc[column] || 0) + value;
        } else {
          const next = Number(doc[column] || 0) - value;
          if (typeof body.min === 'number' && next < body.min) {
            return { ok: false, status: 409, text: async () => 'min exceeded' };
          }
          doc[column] = next;
        }
      }
      return { ok: true, status: 200, text: async () => '{}' };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  it('refunds order cancelled: escrow held -> UMKM wallet + refund ledger', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    (globalThis as any).fetch = mockTablesDb;

    seed('escrows', [{ $id: 'e4', orderId: 'o4', amount: 100000, status: 'held' }]);
    seed('orders', [{ $id: 'o4', umkmId: 'u4', creatorId: 'c4', amount: 100000, status: 'cancelled' }]);
    seed('wallets', [{ $id: 'w4', userId: 'u4', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/refund-order/src/main.js')).default;
    const req = makeReq({ bodyJson: { orderId: 'o4' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    const escrow = (store['escrows'] || []).find((e) => e.$id === 'e4');
    expect(escrow.status).toBe('refunded');
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w4');
    expect(wallet.balance).toBe(100000);
    const refundTx = (store['transactions'] || []).filter((t) => t.type === 'refund' && t.referenceId === 'e4' && t.referenceType === 'escrow');
    expect(refundTx).toHaveLength(1);
  });

  it('campaign completed with remainingBudget: credits UMKM wallet and zeros budget', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.CAMPAIGNS_COLLECTION_ID = 'campaigns';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    (globalThis as any).fetch = mockTablesDb;

    seed('campaigns', [{ $id: 'c5', umkmId: 'u5', remainingBudget: 20000, status: 'completed' }]);
    seed('wallets', [{ $id: 'w5', userId: 'u5', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/refund-order/src/main.js')).default;
    const req = makeReq({ bodyJson: { campaignId: 'c5' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    const campaign = (store['campaigns'] || []).find((c) => c.$id === 'c5');
    expect(campaign.remainingBudget).toBe(0);
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w5');
    expect(wallet.balance).toBe(20000);
    const refundTx = (store['transactions'] || []).filter((t) => t.type === 'refund' && t.referenceId === 'c5' && t.referenceType === 'campaign');
    expect(refundTx).toHaveLength(1);
  });

  it('fee not returned: wallet increases exactly escrow.amount (not amount+fee)', async () => {
    process.env.APPWRITE_DATABASE_ID = 'db';
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
    (globalThis as any).fetch = mockTablesDb;

    seed('escrows', [{ $id: 'e6', orderId: 'o6', amount: 100000, status: 'held' }]);
    seed('orders', [{ $id: 'o6', umkmId: 'u6', creatorId: 'c6', amount: 100000, status: 'cancelled' }]);
    seed('wallets', [{ $id: 'w6', userId: 'u6', balance: 0, pendingBalance: 0 }]);

    const main = (await import('../../functions/refund-order/src/main.js')).default;
    const req = makeReq({ bodyJson: { orderId: 'o6' } });
    const res = makeRes();
    await main({ req, res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w6');
    // Fee tidak dikembalikan — kredit = persis escrow.amount
    expect(wallet.balance).toBe(100000);
    expect(wallet.balance).not.toBe(102000); // bukan amount + 2% fee
  });
});

describe('withdrawal-callback function (4-state close, Iris webhook)', () => {
  const mockTablesDb = (url: string, init: any) => {
    const m = url.match(/\/tablesdb\/[^/]+\/tables\/([^/]+)\/rows\/([^/]+)\/([^/]+)\/(increment|decrement)$/);
    if (m) {
      const [, table, rowId, column, op] = m;
      const doc = (store[table] || []).find((d: any) => d.$id === rowId);
      if (doc) {
        const body = JSON.parse(init.body);
        const value = Number(body.value);
        if (op === 'increment') {
          doc[column] = Number(doc[column] || 0) + value;
        } else {
          const next = Number(doc[column] || 0) - value;
          if (typeof body.min === 'number' && next < body.min) {
            return { ok: false, status: 409, text: async () => 'min exceeded' };
          }
          doc[column] = next;
        }
      }
      return { ok: true, status: 200, text: async () => '{}' };
    }
    return { ok: true, status: 200, text: async () => '{}' };
  };

  const envCallback = () => {
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.WITHDRAWALS_COLLECTION_ID = 'withdrawals';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
  };

  it('moves processing -> succeeded when Iris reports completed', async () => {
    (globalThis as any).fetch = mockTablesDb;
    envCallback();
    seed('withdrawals', [{ $id: 'wd1', userId: 'u1', amount: 50000, status: 'processing', iris_reference: 'REF-1' }]);
    seed('wallets', [{ $id: 'w1', userId: 'u1', balance: 0 }]);

    const main = (await import('../../functions/withdrawal-callback/src/main.js')).default;
    const res = makeRes();
    await main({ req: makeReq({ bodyJson: { reference_no: 'REF-1', status: 'completed' } }), res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    expect(res.calls[0].body.withdrawalStatus).toBe('succeeded');
    const wd = (store['withdrawals'] || []).find((d) => d.$id === 'wd1');
    expect(wd.status).toBe('succeeded');
    expect(wd.processedAt).toBeDefined();
    expect(wd.reversed_at).toBeUndefined();
    // no reversal on success
    expect((store['transactions'] || []).filter((t) => t.type === 'withdrawal_reversal')).toHaveLength(0);
  });

  it('moves processing -> failed and credits balance back when Iris reports failed', async () => {
    (globalThis as any).fetch = mockTablesDb;
    envCallback();
    seed('withdrawals', [{ $id: 'wd2', userId: 'u2', amount: 50000, status: 'processing', iris_reference: 'REF-2' }]);
    seed('wallets', [{ $id: 'w2', userId: 'u2', balance: 0 }]);

    const main = (await import('../../functions/withdrawal-callback/src/main.js')).default;
    const res = makeRes();
    await main({ req: makeReq({ bodyJson: { reference_no: 'REF-2', status: 'failed', status_message: 'account not found' } }), res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.withdrawalStatus).toBe('failed');
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w2');
    expect(wallet.balance).toBe(50000); // credited back
    const wd = (store['withdrawals'] || []).find((d) => d.$id === 'wd2');
    expect(wd.status).toBe('reversed');
    expect(wd.failure_reason).toBe('account not found');
    const reversals = (store['transactions'] || []).filter((t) => t.type === 'withdrawal_reversal');
    expect(reversals).toHaveLength(1);
  });

  it('is idempotent: duplicate failed callback does not double credit', async () => {
    (globalThis as any).fetch = mockTablesDb;
    envCallback();
    seed('withdrawals', [{ $id: 'wd3', userId: 'u3', amount: 50000, status: 'processing', iris_reference: 'REF-3' }]);
    seed('wallets', [{ $id: 'w3', userId: 'u3', balance: 0 }]);

    const main = (await import('../../functions/withdrawal-callback/src/main.js')).default;
    const body = { reference_no: 'REF-3', status: 'failed' };

    const res1 = makeRes();
    await main({ req: makeReq({ bodyJson: body }), res: res1, log: () => {}, error: () => {} });
    expect(res1.calls[0].body.withdrawalStatus).toBe('failed');

    // second delivery: withdrawal already terminal (reversed) -> no-op
    const res2 = makeRes();
    await main({ req: makeReq({ bodyJson: body }), res: res2, log: () => {}, error: () => {} });
    expect(res2.calls[0].body.withdrawalStatus).toBe('reversed');

    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w3');
    expect(wallet.balance).toBe(50000); // credited exactly once
    expect((store['transactions'] || []).filter((t) => t.type === 'withdrawal_reversal')).toHaveLength(1);
  });

  it('ignores terminal succeeded withdrawal when late failed callback arrives', async () => {
    (globalThis as any).fetch = mockTablesDb;
    envCallback();
    seed('withdrawals', [{ $id: 'wd4', userId: 'u4', amount: 50000, status: 'succeeded', iris_reference: 'REF-4' }]);
    seed('wallets', [{ $id: 'w4', userId: 'u4', balance: 0 }]);

    const main = (await import('../../functions/withdrawal-callback/src/main.js')).default;
    const res = makeRes();
    await main({ req: makeReq({ bodyJson: { reference_no: 'REF-4', status: 'failed' } }), res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.withdrawalStatus).toBe('succeeded'); // unchanged, no reversal
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w4');
    expect(wallet.balance).toBe(0);
    expect((store['transactions'] || []).filter((t) => t.type === 'withdrawal_reversal')).toHaveLength(0);
  });

  it('returns 404 when iris reference unknown', async () => {
    (globalThis as any).fetch = mockTablesDb;
    envCallback();

    const main = (await import('../../functions/withdrawal-callback/src/main.js')).default;
    const res = makeRes();
    await main({ req: makeReq({ bodyJson: { reference_no: 'REF-UNKNOWN', status: 'completed' } }), res, log: () => {}, error: () => {} });

    expect(res.calls[0].status).toBe(404);
  });
});

describe('verify-kyc function (Pasal 11.8)', () => {
  const envKyc = () => {
    process.env.USERS_COLLECTION_ID = 'users';
    process.env.NOTIFICATIONS_COLLECTION_ID = 'notifications';
  };

  it('marks user kyc_status verified and notifies', async () => {
    envKyc();
    seed('users', [{ $id: 'u1', userId: 'user-KYC-1', role: 'creator', kyc_status: 'pending_wa' }]);

    const main = (await import('../../functions/verify-kyc/src/main.js')).default;
    const res = makeRes();
    await main({ req: makeReq({ bodyJson: { userId: 'user-KYC-1' } }), res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    expect(res.calls[0].body.kyc_status).toBe('verified');
    const user = (store['users'] || []).find((u) => u.$id === 'u1');
    expect(user.kyc_status).toBe('verified');
    expect(user.kyc_verified_at).toBeDefined();
    expect((store['notifications'] || []).some((n) => n.title.includes('KYC'))).toBe(true);
  });

  it('is idempotent when already verified (no duplicate notification)', async () => {
    envKyc();
    seed('users', [{ $id: 'u2', userId: 'user-KYC-2', role: 'creator', kyc_status: 'verified', kyc_verified_at: new Date().toISOString() }]);

    const main = (await import('../../functions/verify-kyc/src/main.js')).default;
    const res = makeRes();
    await main({ req: makeReq({ bodyJson: { userId: 'user-KYC-2' } }), res, log: () => {}, error: () => {} });

    expect(res.calls[0].body.status).toBe('ok');
    expect((store['notifications'] || [])).toHaveLength(0); // no new notification
    const user = (store['users'] || []).find((u) => u.$id === 'u2');
    expect(user.kyc_status).toBe('verified');
  });
});

