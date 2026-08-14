import { beforeEach, describe, expect, it } from 'vitest';

const store: Record<string, any[]> = {};

function seed(collection: string, docs: any[]) {
  store[collection] = docs;
}

function reset() {
  for (const key of Object.keys(store)) delete store[key];
}

class DatabasesMock {
  async listDocuments(_db: string, collection: string, queries: any[] = []) {
    let docs = [...(store[collection] || [])];
    for (const query of queries) {
      if (query?.method !== 'equal') continue;
      const values = Array.isArray(query.value) ? query.value : [query.value];
      docs = docs.filter((doc) => values.includes(doc[query.attr]));
    }
    return { documents: docs };
  }
}

const Query = {
  equal: (attr: string, value: any) => ({ method: 'equal', attr, value }),
  limit: (value: number) => ({ method: 'limit', value }),
};

describe('requireActiveRole helper', () => {
  beforeEach(() => {
    reset();
  });

  it('returns user doc for active UMKM', async () => {
    seed('users', [{ $id: 'u1', userId: 'umkm-1', role: 'umkm', status: 'active' }]);
    const { requireActiveRole } = await import('../../functions/_shared/require-active-role.js');

    const user = await requireActiveRole({
      databases: new DatabasesMock(),
      databaseId: 'db1',
      usersCollectionId: 'users',
      userId: 'umkm-1',
      role: 'umkm',
      Query,
      notFoundMessage: 'Profil Pengguna tidak ditemukan.',
      inactiveMessage: 'Akun Anda sedang tidak aktif.',
      wrongRoleMessage: 'Hanya UMKM yang dapat melakukan aksi ini.',
    });

    expect(user.userId).toBe('umkm-1');
  });

  it('throws 404 if profile missing', async () => {
    const { requireActiveRole } = await import('../../functions/_shared/require-active-role.js');

    await expect(requireActiveRole({
      databases: new DatabasesMock(),
      databaseId: 'db1',
      usersCollectionId: 'users',
      userId: 'umkm-1',
      role: 'umkm',
      Query,
      notFoundMessage: 'Profil Pengguna tidak ditemukan.',
      inactiveMessage: 'Akun Anda sedang tidak aktif.',
      wrongRoleMessage: 'Hanya UMKM yang dapat melakukan aksi ini.',
    })).rejects.toMatchObject({ statusCode: 404, message: 'Profil Pengguna tidak ditemukan.' });
  });

  it('throws 403 if account inactive', async () => {
    seed('users', [{ $id: 'u1', userId: 'umkm-1', role: 'umkm', status: 'suspended' }]);
    const { requireActiveRole } = await import('../../functions/_shared/require-active-role.js');

    await expect(requireActiveRole({
      databases: new DatabasesMock(),
      databaseId: 'db1',
      usersCollectionId: 'users',
      userId: 'umkm-1',
      role: 'umkm',
      Query,
      notFoundMessage: 'Profil Pengguna tidak ditemukan.',
      inactiveMessage: 'Akun Anda sedang tidak aktif.',
      wrongRoleMessage: 'Hanya UMKM yang dapat melakukan aksi ini.',
    })).rejects.toMatchObject({ statusCode: 403, message: 'Akun Anda sedang tidak aktif.' });
  });

  it('throws 403 if role mismatched', async () => {
    seed('users', [{ $id: 'u1', userId: 'creator-1', role: 'creator', status: 'active' }]);
    const { requireActiveRole } = await import('../../functions/_shared/require-active-role.js');

    await expect(requireActiveRole({
      databases: new DatabasesMock(),
      databaseId: 'db1',
      usersCollectionId: 'users',
      userId: 'creator-1',
      role: 'umkm',
      Query,
      notFoundMessage: 'Profil Pengguna tidak ditemukan.',
      inactiveMessage: 'Akun Anda sedang tidak aktif.',
      wrongRoleMessage: 'Hanya UMKM yang dapat melakukan aksi ini.',
    })).rejects.toMatchObject({ statusCode: 403, message: 'Hanya UMKM yang dapat melakukan aksi ini.' });
  });

  it('throws clear error if Query dependency missing', async () => {
    const { requireActiveRole } = await import('../../functions/_shared/require-active-role.js');

    await expect(requireActiveRole({
      databases: new DatabasesMock(),
      databaseId: 'db1',
      usersCollectionId: 'users',
      userId: 'umkm-1',
      role: 'umkm',
      notFoundMessage: 'Profil Pengguna tidak ditemukan.',
      inactiveMessage: 'Akun Anda sedang tidak aktif.',
      wrongRoleMessage: 'Hanya UMKM yang dapat melakukan aksi ini.',
    })).rejects.toThrow('requireActiveRole membutuhkan dependency Query dari caller.');
  });
});
