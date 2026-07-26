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
  it('accepts campaign purpose and credits wallet on paid', async () => {
    // mock Midtrans Snap call used by create-payment
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => ({ token: 'tok', redirect_url: 'url' }) });
    // 1. create-payment with purpose campaign (now allowed)
    process.env.PAYMENTS_COLLECTION_ID = 'payments';
    const cpMain = (await import('../../functions/create-payment/src/main.js')).default;
    const cpReq = makeReq({ bodyJson: { purpose: 'campaign', amount: 50000, campaignId: 'c1' } });
    const cpRes = makeRes();
    const cpResult = await cpMain({ req: cpReq, res: cpRes, log: () => {}, error: () => {} });
    expect(cpResult.body.paymentId).toBeDefined();

    // 2. seed the payment as paid, then create-escrow routes campaign -> completeTopup (credits wallet)
    seed('payments', [{ $id: cpResult.body.paymentId, user_id: 'u1', amount: 50000, purpose: 'campaign', gateway: 'midtrans', gateway_reference: `topup-${cpResult.body.paymentId}`, status: 'paid' }]);
    process.env.ESCROWS_COLLECTION_ID = 'escrows';
    process.env.ORDERS_COLLECTION_ID = 'orders';
    process.env.WALLETS_COLLECTION_ID = 'wallets';
    process.env.TRANSACTIONS_COLLECTION_ID = 'transactions';
    seed('wallets', [{ $id: 'w1', userId: 'u1', balance: 0, pendingBalance: 0 }]);
    const ceMain = (await import('../../functions/create-escrow/src/main.js')).default;
    const ceReq = makeReq({ bodyJson: { $id: cpResult.body.paymentId, status: 'paid', purpose: 'campaign', order_id: null, user_id: 'u1', amount: 50000 } });
    const ceRes = makeRes();
    await ceMain({ req: ceReq, res: ceRes, log: () => {}, error: () => {} });
    const wallet = (store['wallets'] || []).find((w) => w.$id === 'w1');
    expect(wallet.balance).toBe(50000);
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

