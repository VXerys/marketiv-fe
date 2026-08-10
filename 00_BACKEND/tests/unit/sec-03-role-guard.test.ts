import { describe, it, expect, beforeEach, vi } from 'vitest';

const store: Record<string, any[]> = {};
const seed = (collection: string, docs: any[]) => { store[collection] = docs; };
const reset = () => {
  for (const k of Object.keys(store)) delete store[k];
};

const Query = {
  equal: (a: string, v: any) => ({ method: 'equal', attr: a, value: v }),
  limit: (n: number) => ({ method: 'limit', value: n }),
};
const Role = { user: (id: string) => ({ type: 'user', id }), any: () => ({ type: 'any' }) };
const Permission = {
  read: (r: any) => ({ action: 'read', role: r }),
  update: (r: any) => ({ action: 'update', role: r }),
  delete: (r: any) => ({ action: 'delete', role: r }),
};

class Databases {
  async listDocuments(_db: string, collection: string, q: any[] = []) {
    let docs = [...(store[collection] || [])];
    for (const query of q) {
      if (query?.method === 'equal') {
        docs = docs.filter((doc) => {
          const values = Array.isArray(query.value) ? query.value : [query.value];
          return values.includes(doc[query.attr]);
        });
      }
    }
    const limit = q.find((query) => query?.method === 'limit')?.value;
    if (typeof limit === 'number') docs = docs.slice(0, limit);
    return { documents: docs, total: docs.length };
  }

  async getDocument(_db: string, collection: string, id: string) {
    const doc = (store[collection] || []).find((d) => d.$id === id);
    if (!doc) {
      const err: any = new Error('Document not found');
      err.code = 404;
      throw err;
    }
    return doc;
  }

  async createDocument(_db: string, collection: string, docId: string, data: any) {
    const newDoc = { $id: docId === 'id-unique' ? `id-${Math.random().toString(36).slice(2, 6)}` : docId, ...data };
    store[collection] = store[collection] || [];
    store[collection].push(newDoc);
    return newDoc;
  }

  async updateDocument(_db: string, collection: string, id: string, data: any) {
    const doc = await this.getDocument(_db, collection, id);
    Object.assign(doc, data);
    return doc;
  }
}

vi.mock('node-appwrite', () => ({
  Client: class {
    setEndpoint() { return this; }
    setProject() { return this; }
    setKey() { return this; }
  },
  Databases,
  ID: { unique: () => 'id-unique' },
  Query,
  Role,
  Permission,
}));

function makeReq(headers: Record<string, string>, body: any = {}) {
  return {
    headers: { 'x-appwrite-user-id': 'umkm-1', ...headers },
    bodyJson: body,
    bodyText: JSON.stringify(body),
    method: 'POST',
  };
}

function makeRes() {
  const calls: any[] = [];
  return {
    calls,
    json: (body: any, status = 200) => {
      calls.push({ body, status });
      return { body, status };
    },
  };
}

describe('UMKM-SEC-03: Backend role enforcement', () => {
  beforeEach(() => {
    reset();
    process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'http://localhost';
    process.env.APPWRITE_FUNCTION_PROJECT_ID = 'p1';
    process.env.APPWRITE_API_KEY = 'k1';
    process.env.APPWRITE_DATABASE_ID = 'db1';
    process.env.USERS_COLLECTION_ID = 'users';
    process.env.CONVERSATIONS_COLLECTION_ID = 'conversations';
    process.env.OFFERS_COLLECTION_ID = 'offers';
    process.env.MESSAGES_COLLECTION_ID = 'messages';
  });

  describe('create-conversation role enforcement', () => {
    it('rejects with 403 if requester role is creator', async () => {
      seed('users', [
        { $id: 'u1', userId: 'creator-1', role: 'creator', status: 'active' },
      ]);
      const main = (await import('../../functions/create-conversation/src/main.js')).default;
      const req = makeReq({ 'x-appwrite-user-id': 'creator-1' }, { creatorId: 'creator-2' });
      const res = makeRes();
      await main({ req, res, log: () => {}, error: () => {} });

      expect(res.calls[0].status).toBe(403);
      expect(res.calls[0].body.error).toContain('Hanya UMKM');
    });

    it('rejects with 403 if requester status is suspended', async () => {
      seed('users', [
        { $id: 'u1', userId: 'umkm-1', role: 'umkm', status: 'suspended' },
      ]);
      const main = (await import('../../functions/create-conversation/src/main.js')).default;
      const req = makeReq({ 'x-appwrite-user-id': 'umkm-1' }, { creatorId: 'creator-1' });
      const res = makeRes();
      await main({ req, res, log: () => {}, error: () => {} });

      expect(res.calls[0].status).toBe(403);
      expect(res.calls[0].body.error).toContain('sedang tidak aktif');
    });

    it('allows active UMKM to create conversation', async () => {
      seed('users', [
        { $id: 'u1', userId: 'umkm-1', role: 'umkm', status: 'active' },
      ]);
      const main = (await import('../../functions/create-conversation/src/main.js')).default;
      const req = makeReq({ 'x-appwrite-user-id': 'umkm-1' }, { creatorId: 'creator-1' });
      const res = makeRes();
      await main({ req, res, log: () => {}, error: () => {} });

      expect(res.calls[0].status).toBe(200);
      expect(res.calls[0].body.conversationId).toBeDefined();
    });
  });

  describe('create-offer role enforcement', () => {
    it('rejects with 403 if requester role is creator', async () => {
      seed('users', [
        { $id: 'u1', userId: 'creator-1', role: 'creator', status: 'active' },
      ]);
      seed('conversations', [
        { $id: 'conv-1', umkm_id: 'creator-1', creator_id: 'creator-2' },
      ]);
      const main = (await import('../../functions/create-offer/src/main.js')).default;
      const req = makeReq(
        { 'x-appwrite-user-id': 'creator-1' },
        { conversationId: 'conv-1', title: 'Offer 1', price: 100000, deadline: '2028-12-31', revisionLimit: 1 }
      );
      const res = makeRes();
      await main({ req, res, log: () => {}, error: () => {} });

      expect(res.calls[0].status).toBe(403);
      expect(res.calls[0].body.error).toContain('Hanya UMKM');
    });

    it('rejects with 403 if UMKM status is suspended', async () => {
      seed('users', [
        { $id: 'u1', userId: 'umkm-1', role: 'umkm', status: 'suspended' },
      ]);
      seed('conversations', [
        { $id: 'conv-1', umkm_id: 'umkm-1', creator_id: 'creator-1' },
      ]);
      const main = (await import('../../functions/create-offer/src/main.js')).default;
      const req = makeReq(
        { 'x-appwrite-user-id': 'umkm-1' },
        { conversationId: 'conv-1', title: 'Offer 1', price: 100000, deadline: '2028-12-31', revisionLimit: 1 }
      );
      const res = makeRes();
      await main({ req, res, log: () => {}, error: () => {} });

      expect(res.calls[0].status).toBe(403);
      expect(res.calls[0].body.error).toContain('sedang tidak aktif');
    });

    it('allows active UMKM owner to create offer', async () => {
      seed('users', [
        { $id: 'u1', userId: 'umkm-1', role: 'umkm', status: 'active' },
      ]);
      seed('conversations', [
        { $id: 'conv-1', umkm_id: 'umkm-1', creator_id: 'creator-1' },
      ]);
      const main = (await import('../../functions/create-offer/src/main.js')).default;
      const req = makeReq(
        { 'x-appwrite-user-id': 'umkm-1' },
        { conversationId: 'conv-1', title: 'Offer 1', price: 100000, deadline: '2028-12-31', revisionLimit: 1 }
      );
      const res = makeRes();
      await main({ req, res, log: () => {}, error: () => {} });

      expect(res.calls[0].status).toBe(200);
      expect(res.calls[0].body.offerId).toBeDefined();
    });
  });
});
