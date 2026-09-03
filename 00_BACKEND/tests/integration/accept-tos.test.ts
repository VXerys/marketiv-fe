import { beforeEach, describe, expect, it, vi } from 'vitest';

const store: Record<string, any[]> = {};
const updateCalls: Array<{ collection: string; docId: string; data: any }> = [];

const seed = (collection: string, docs: any[]) => { store[collection] = docs; };

class Databases {
  async listDocuments(_db: string, collection: string, queries: any[] = []) {
    let documents = [...(store[collection] || [])];
    const userIdQuery = queries.find((query) => query?.attribute === 'userId');
    if (userIdQuery) documents = documents.filter((doc) => doc.userId === userIdQuery.value);
    return { documents };
  }

  async updateDocument(_db: string, collection: string, docId: string, data: any) {
    const documents = store[collection] || [];
    const index = documents.findIndex((doc) => doc.$id === docId);
    if (index === -1) throw new Error('not found');
    documents[index] = { ...documents[index], ...data };
    updateCalls.push({ collection, docId, data });
    return documents[index];
  }
}

class Client {
  setEndpoint() { return this; }
  setProject() { return this; }
  setKey() { return this; }
}

const Query = {
  equal: (attribute: string, value: string) => ({ attribute, value }),
  limit: () => ({}),
};

vi.mock('node-appwrite', () => ({ Client, Databases, Query }));

const makeReq = (bodyJson: any) => ({
  method: 'POST',
  headers: { 'x-appwrite-user-id': 'c1' },
  bodyJson,
});

const makeRes = () => {
  const calls: any[] = [];
  return {
    calls,
    json: (body: any, status = 200) => {
      calls.push({ body, status });
      return { body, status };
    },
  };
};

const invoke = async (body: any) => {
  const main = (await import('../../functions/accept-tos/src/main.js')).default;
  const res = makeRes();
  await main({ req: makeReq(body), res, log: () => {}, error: () => {} });
  return res.calls[0];
};

beforeEach(() => {
  for (const collection of Object.keys(store)) delete store[collection];
  updateCalls.length = 0;
  process.env.APPWRITE_FUNCTION_API_ENDPOINT = 'https://mock.appwrite.io/v1';
  process.env.APPWRITE_FUNCTION_PROJECT_ID = 'mock-project';
  process.env.APPWRITE_API_KEY = 'mock-key';
  process.env.APPWRITE_DATABASE_ID = 'db';
  process.env.USERS_COLLECTION_ID = 'users';
  process.env.CURRENT_TOS_VERSION = 'v3.1';
});

describe('accept-tos function', () => {
  it('returns unaccepted status without mutating user', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1' }]);

    const response = await invoke({ action: 'status' });

    expect(response).toMatchObject({ status: 200, body: {
      currentVersion: 'v3.1', acceptedVersion: null, acceptedAt: null, needsConsent: true,
    }});
    expect(updateCalls).toHaveLength(0);
  });

  it('returns current consent status without mutating user', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.1', tos_accepted_at: '2026-08-01T00:00:00.000Z' }]);

    const response = await invoke({ action: 'status' });

    expect(response).toMatchObject({ status: 200, body: {
      currentVersion: 'v3.1', acceptedVersion: 'v3.1', acceptedAt: '2026-08-01T00:00:00.000Z', needsConsent: false,
    }});
    expect(updateCalls).toHaveLength(0);
  });

  it('returns outdated consent status without mutating user', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.0', tos_accepted_at: '2026-08-01T00:00:00.000Z' }]);

    const response = await invoke({ action: 'status' });

    expect(response).toMatchObject({ status: 200, body: {
      currentVersion: 'v3.1', acceptedVersion: 'v3.0', acceptedAt: '2026-08-01T00:00:00.000Z', needsConsent: true,
    }});
    expect(updateCalls).toHaveLength(0);
  });

  it('requires consent when matching version has no acceptance timestamp', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.1' }]);

    const response = await invoke({ action: 'status' });

    expect(response).toMatchObject({ status: 200, body: {
      currentVersion: 'v3.1', acceptedVersion: 'v3.1', acceptedAt: null, needsConsent: true,
    }});
    expect(updateCalls).toHaveLength(0);
  });

  it('accepts current version through legacy payload', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1' }]);

    const response = await invoke({ tos_version: 'v3.1' });

    expect(response).toMatchObject({ status: 200, body: { success: true, alreadyAccepted: false, tos_version: 'v3.1' } });
    expect(updateCalls).toHaveLength(1);
  });

  it('accepts current version through explicit accept action', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1' }]);

    const response = await invoke({ action: 'accept', tos_version: 'v3.1' });

    expect(response).toMatchObject({ status: 200, body: { success: true, alreadyAccepted: false, tos_version: 'v3.1' } });
    expect(updateCalls).toHaveLength(1);
  });

  it('does not update same-version acceptance', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.1', tos_accepted_at: '2026-08-01T00:00:00.000Z' }]);

    const response = await invoke({ action: 'accept', tos_version: 'v3.1' });

    expect(response).toMatchObject({ status: 200, body: { success: true, alreadyAccepted: true, tos_version: 'v3.1' } });
    expect(updateCalls).toHaveLength(0);
  });

  it('backfills missing timestamp for same-version acceptance', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.1' }]);

    const response = await invoke({ action: 'accept', tos_version: 'v3.1' });

    expect(response).toMatchObject({ status: 200, body: { success: true, alreadyAccepted: false, tos_version: 'v3.1' } });
    expect(updateCalls).toHaveLength(1);
    expect(updateCalls[0]).toMatchObject({ collection: 'users', docId: 'u-c1', data: { tos_accepted_at: expect.any(String) } });
    expect(updateCalls[0].data).not.toHaveProperty('tos_version');
  });

  it('rejects stale version without updating user', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1', tos_version: 'v3.0' }]);

    const response = await invoke({ action: 'accept', tos_version: 'v3.0' });

    expect(response).toMatchObject({ status: 400, body: { error: 'Versi T&C tidak sesuai dengan versi aktif.' } });
    expect(updateCalls).toHaveLength(0);
  });

  it('rejects unknown action without updating user', async () => {
    seed('users', [{ $id: 'u-c1', userId: 'c1' }]);

    const response = await invoke({ action: 'revoke' });

    expect(response).toMatchObject({ status: 400, body: { error: 'Action tidak didukung.' } });
    expect(updateCalls).toHaveLength(0);
  });
});
