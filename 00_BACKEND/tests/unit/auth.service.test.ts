import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as mockAppwrite from '../../src/test-mocks/appwrite';

const { __mockAccountGet, __resetStore } = mockAppwrite as any;

describe('auth.service — validation & error mapping', () => {
  beforeEach(() => {
    __resetStore();
  });

  it('registerUMKM accepts account data without business profile fields', async () => {
    const { registerUMKM } = await import('../../src/services/auth.service.ts');
    const result = await registerUMKM({ email: 'e@x.com', phone: '1', password: 'p' });
    expect(result.user).toBeDefined();
  });

  it('registerUMKM throws validation when phone empty', async () => {
    const { registerUMKM } = await import('../../src/services/auth.service.ts');
    await expect(registerUMKM({ email: 'e@x.com', phone: '', password: 'p' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Nomor HP wajib diisi.' });
  });

  it('registerUMKM throws validation when email empty', async () => {
    const { registerUMKM } = await import('../../src/services/auth.service.ts');
    await expect(registerUMKM({ email: '', phone: '1', password: 'p' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Email wajib diisi.' });
  });

  it('registerUMKM throws validation when password empty', async () => {
    const { registerUMKM } = await import('../../src/services/auth.service.ts');
    await expect(registerUMKM({ email: 'e@x.com', phone: '1', password: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Password wajib diisi.' });
  });

  it('registerCreator throws validation when name empty', async () => {
    const { registerCreator } = await import('../../src/services/auth.service.ts');
    await expect(registerCreator({ name: '', email: 'e@x.com', password: 'p' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Nama creator wajib diisi.' });
  });

  it('loginUser throws validation when email empty', async () => {
    const { loginUser } = await import('../../src/services/auth.service.ts');
    await expect(loginUser({ email: '', password: 'p' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Email wajib diisi.' });
  });

  it('loginUser throws validation when password empty', async () => {
    const { loginUser } = await import('../../src/services/auth.service.ts');
    await expect(loginUser({ email: 'e@x.com', password: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Password wajib diisi.' });
  });

  it('forgotPassword throws validation when email empty', async () => {
    const { forgotPassword } = await import('../../src/services/auth.service.ts');
    await expect(forgotPassword('')).rejects.toMatchObject({ code: 'validation', message: 'Email wajib diisi.' });
  });

  it('resetPassword throws validation when userId empty', async () => {
    const { resetPassword } = await import('../../src/services/auth.service.ts');
    await expect(resetPassword('', 's', 'p')).rejects.toMatchObject({ code: 'validation', message: 'User ID wajib diisi.' });
  });

  it('resetPassword throws validation when secret empty', async () => {
    const { resetPassword } = await import('../../src/services/auth.service.ts');
    await expect(resetPassword('u', '', 'p')).rejects.toMatchObject({ code: 'validation', message: 'Secret reset password wajib diisi.' });
  });

  it('resetPassword throws validation when password empty', async () => {
    const { resetPassword } = await import('../../src/services/auth.service.ts');
    await expect(resetPassword('u', 's', '')).rejects.toMatchObject({ code: 'validation', message: 'Password baru wajib diisi.' });
  });

  it('mapError maps 409 to conflict', async () => {
    const { registerUMKM } = await import('../../src/services/auth.service.ts');
    const err: any = new Error('conflict');
    err.code = 409;
    __mockAccountGet(() => { throw err; });
    await expect(registerUMKM({ email: 'e@x.com', phone: '1', password: 'p' }))
      .rejects.toMatchObject({ code: 'conflict', message: 'Email sudah terdaftar.' });
  });

  it('mapError maps 401 to auth', async () => {
    const { loginUser } = await import('../../src/services/auth.service.ts');
    const err: any = new Error('unauth');
    err.code = 401;
    __mockAccountGet(() => { throw err; });
    await expect(loginUser({ email: 'e@x.com', password: 'p' }))
      .rejects.toMatchObject({ code: 'auth', message: 'Email atau password tidak sesuai.' });
  });

  it('registerUser throws when role invalid', async () => {
    const { registerUser } = await import('../../src/services/auth.service.ts');
    await expect(registerUser({ role: 'admin' as any, email: 'e@x.com', phone: '1', password: 'p' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Role registrasi tidak valid.' });
  });
});
