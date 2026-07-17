// Centralized mock for the `appwrite` npm package used by service tests.
// This module is aliased to `appwrite` in vitest.config.ts so that all
// service imports (`import { ID, Query, ... } from 'appwrite'`) resolve here
// instead of the real SDK.

export const ID = {
  unique: () => `mock-id-${Math.random().toString(36).slice(2, 10)}`,
  custom: (id: string) => id,
};

export const Query = {
  equal: (attr: string, value: any) => ({ method: 'equal', attr, value }),
  notEqual: (attr: string, value: any) => ({ method: 'notEqual', attr, value }),
  greaterThan: (attr: string, value: any) => ({ method: 'greaterThan', attr, value }),
  greaterThanEqual: (attr: string, value: any) => ({ method: 'greaterThanEqual', attr, value }),
  lessThan: (attr: string, value: any) => ({ method: 'lessThan', attr, value }),
  lessThanEqual: (attr: string, value: any) => ({ method: 'lessThanEqual', attr, value }),
  orderAsc: (attr: string) => ({ method: 'orderAsc', attr }),
  orderDesc: (attr: string) => ({ method: 'orderDesc', attr }),
  limit: (n: number) => ({ method: 'limit', value: n }),
  offset: (n: number) => ({ method: 'offset', value: n }),
};

export const Role = {
  any: () => ({ type: 'any' }),
  user: (id: string) => ({ type: 'user', id }),
  users: () => ({ type: 'users' }),
  guests: () => ({ type: 'guests' }),
};

export const Permission = {
  read: (role: any) => ({ action: 'read', role }),
  write: (role: any) => ({ action: 'write', role }),
  update: (role: any) => ({ action: 'update', role }),
  delete: (role: any) => ({ action: 'delete', role }),
};

// In-memory store for mock Appwrite data
const store: Record<string, any[]> = {};

export const __mockStore = store;

export const __resetStore = () => {
  for (const key of Object.keys(store)) delete store[key];
};

export const __seed = (collection: string, docs: any[]) => {
  store[collection] = docs;
};

// Apply Appwrite-style queries (subset) against in-memory docs.
const applyQueries = (docs: any[], queries: any[] = []): any[] => {
  let result = docs;
  for (const q of queries) {
    if (q?.method === 'equal') {
      // Appwrite `equal` with an array value means OR semantics.
      if (Array.isArray(q.value)) {
        result = result.filter((d) => q.value.includes(d[q.attr]));
      } else {
        result = result.filter((d) => d[q.attr] === q.value);
      }
    } else if (q?.method === 'greaterThanEqual') {
      result = result.filter((d) => Number(d[q.attr]) >= Number(q.value));
    } else if (q?.method === 'lessThanEqual') {
      result = result.filter((d) => Number(d[q.attr]) <= Number(q.value));
    } else if (q?.method === 'greaterThan') {
      result = result.filter((d) => Number(d[q.attr]) > Number(q.value));
    } else if (q?.method === 'lessThan') {
      result = result.filter((d) => Number(d[q.attr]) < Number(q.value));
    } else if (q?.method === 'orderAsc') {
      result = [...result].sort((a, b) => Number(a[q.attr]) - Number(b[q.attr]));
    } else if (q?.method === 'orderDesc') {
      result = [...result].sort((a, b) => Number(b[q.attr]) - Number(a[q.attr]));
    } else if (q?.method === 'limit') {
      result = result.slice(0, q.value);
    } else if (q?.method === 'offset') {
      result = result.slice(q.value);
    }
  }
  return result;
};

class MockAccount {
  async get() {
    return globalThis.__mockAccountGet ? globalThis.__mockAccountGet() : { $id: 'user-1' };
  }
  async create(userId: string, email: string, password: string, name?: string) {
    return { $id: userId || 'user-1', email, name };
  }
  async createEmailPasswordSession(email: string, password: string) {
    return { $id: 'session-1' };
  }
  async createOAuth2Session() {
    return { $id: 'oauth-session' };
  }
  async updatePrefs(prefs: Record<string, any>) {
    return prefs;
  }
  async deleteSession(sessionId: string) {
    return true;
  }
  async createRecovery(email: string, redirectUrl: string) {
    return { $id: 'recovery-1' };
  }
  async updateRecovery(userId: string, secret: string, password: string) {
    return { $id: userId };
  }
}

class MockDatabases {
  async listDocuments(databaseId: string, collectionId: string, queries: any[] = []): Promise<{ documents: any[]; total: number }> {
    const docs = applyQueries(store[collectionId] || [], queries);
    return { documents: docs, total: docs.length };
  }
  async createDocument(databaseId: string, collectionId: string, documentId: string, data: any, permissions?: any[]) {
    const doc = { $id: documentId, $createdAt: new Date().toISOString(), $updatedAt: new Date().toISOString(), ...data };
    if (!store[collectionId]) store[collectionId] = [];
    store[collectionId].push(doc);
    return doc;
  }
  async getDocument(databaseId: string, collectionId: string, documentId: string) {
    const docs = store[collectionId] || [];
    const doc = docs.find((d) => d.$id === documentId);
    if (!doc) {
      const err: any = new Error('Document not found');
      err.code = 404;
      throw err;
    }
    return doc;
  }
  async updateDocument(databaseId: string, collectionId: string, documentId: string, data: any) {
    const docs = store[collectionId] || [];
    const idx = docs.findIndex((d) => d.$id === documentId);
    if (idx === -1) {
      const err: any = new Error('Document not found');
      err.code = 404;
      throw err;
    }
    docs[idx] = { ...docs[idx], ...data, $updatedAt: new Date().toISOString() };
    return docs[idx];
  }
  async deleteDocument(databaseId: string, collectionId: string, documentId: string) {
    const docs = store[collectionId] || [];
    store[collectionId] = docs.filter((d) => d.$id !== documentId);
    return true;
  }
}

class MockFunctions {
  async createExecution(functionId: string, data: string, async: boolean) {
    return globalThis.__mockFunctionExecution
      ? globalThis.__mockFunctionExecution(functionId, data)
      : { $id: 'exec-1', status: 'success', responseBody: '{}' };
  }
}

class MockClient {
  setEndpoint(endpoint: string) {
    return this;
  }
  setProject(projectId: string) {
    return this;
  }
  setKey(key: string) {
    return this;
  }
}

export const Account = MockAccount;
export const Databases = MockDatabases;
export const Functions = MockFunctions;
export const Client = MockClient;

export const __mockAccountGet = (fn: () => any) => {
  globalThis.__mockAccountGet = fn;
};

export const __mockFunctionExecution = (fn: (functionId: string, data: string) => any) => {
  globalThis.__mockFunctionExecution = fn;
};
