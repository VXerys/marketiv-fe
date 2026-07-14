import { ID, Query } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, FUNCTIONS, databases, functions } from '../lib/appwrite';
import { getProfile } from './user.service';
import { getWallet } from './wallet.service';

export type UserRole = 'umkm' | 'creator' | 'admin';

export type RegisterUMKMInput = {
  businessName: string;
  category: string;
  email: string;
  phone: string;
  password: string;
};

export type RegisterCreatorInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
  role?: UserRole;
};

export type AuthResult = {
  user: Record<string, any>;
  profile: unknown;
  wallet: unknown | null;
};

export class AuthServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapError = (err: any, fallbackMessage: string): AuthServiceError => {
  if (err instanceof AuthServiceError) return err;

  if (err?.code === 401) {
    return new AuthServiceError('auth', 'Email atau password tidak sesuai.', err);
  }

  if (err?.code === 409) {
    return new AuthServiceError('conflict', 'Email sudah terdaftar.', err);
  }

  return new AuthServiceError(err?.type || 'unknown', fallbackMessage, err);
};

const requireText = (value: string | undefined, message: string): string => {
  const trimmed = value?.trim();
  if (!trimmed) throw new AuthServiceError('validation', message);
  return trimmed;
};

const getWalletSafe = async (): Promise<unknown | null> => {
  try {
    return await getWallet();
  } catch (err: any) {
    if (err?.code === 'not_found') return null;
    throw err;
  }
};

const buildAuthResult = async (role?: UserRole): Promise<AuthResult> => {
  const user = await account.get();
  const profile = await getProfile(user.$id, role);
  const wallet = await getWalletSafe();

  return { user, profile, wallet };
};

const provisionUserProfile = async (): Promise<void> => {
  const user = await account.get();
  const execution = await functions.createExecution(
    FUNCTIONS.createUserProfile,
    JSON.stringify(user),
    false
  );

  if (execution.status === 'failed') {
    throw new AuthServiceError('server', 'Gagal menyiapkan profil pengguna.');
  }
};

const ensureUserRole = async (userId: string, role: UserRole): Promise<void> => {
  const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.users, [
    Query.equal('userId', userId),
    Query.limit(1),
  ]);

  const mirror = response.documents[0];
  if (!mirror) return;

  if (mirror.role !== role) {
    throw new AuthServiceError('forbidden', 'Role akun tidak sesuai.');
  }

  if (mirror.status && mirror.status !== 'active') {
    throw new AuthServiceError('forbidden', 'Akun tidak aktif.');
  }
};

export const registerUMKM = async (data: RegisterUMKMInput): Promise<AuthResult> => {
  const businessName = requireText(data.businessName, 'Nama bisnis wajib diisi.');
  const category = requireText(data.category, 'Kategori bisnis wajib diisi.');
  const phone = requireText(data.phone, 'Nomor HP wajib diisi.');
  const email = requireText(data.email, 'Email wajib diisi.');
  const password = requireText(data.password, 'Password wajib diisi.');

  try {
    await account.create(ID.unique(), email, password, businessName);
    await account.createEmailPasswordSession(email, password);
    await account.updatePrefs({ role: 'umkm', businessName, category, phone });
    await provisionUserProfile();

    return buildAuthResult('umkm');
  } catch (err) {
    throw mapError(err, 'Gagal mendaftarkan akun UMKM. Coba lagi.');
  }
};

export const registerCreator = async (data: RegisterCreatorInput): Promise<AuthResult> => {
  const name = requireText(data.name, 'Nama creator wajib diisi.');
  const email = requireText(data.email, 'Email wajib diisi.');
  const password = requireText(data.password, 'Password wajib diisi.');

  try {
    await account.create(ID.unique(), email, password, name);
    await account.createEmailPasswordSession(email, password);
    await account.updatePrefs({ role: 'creator', displayName: name });
    await provisionUserProfile();

    return buildAuthResult('creator');
  } catch (err) {
    throw mapError(err, 'Gagal mendaftarkan akun Creator. Coba lagi.');
  }
};

export const registerUser = async (data: (RegisterUMKMInput | RegisterCreatorInput) & { role: UserRole }): Promise<AuthResult> => {
  if (data.role === 'umkm') return registerUMKM(data as RegisterUMKMInput);
  if (data.role === 'creator') return registerCreator(data as RegisterCreatorInput);
  throw new AuthServiceError('validation', 'Role registrasi tidak valid.');
};

export const loginUser = async (data: LoginInput): Promise<AuthResult> => {
  const email = requireText(data.email, 'Email wajib diisi.');
  const password = requireText(data.password, 'Password wajib diisi.');

  try {
    await account.createEmailPasswordSession(email, password);
    const user = await account.get();

    if (data.role) {
      await ensureUserRole(user.$id, data.role);
    }

    const profile = await getProfile(user.$id, data.role);
    const wallet = await getWalletSafe();

    return { user, profile, wallet };
  } catch (err) {
    throw mapError(err, 'Gagal login. Coba lagi.');
  }
};

export const logoutUser = async (): Promise<void> => {
  try {
    await account.deleteSession('current');
  } catch (err) {
    throw mapError(err, 'Gagal logout. Coba lagi.');
  }
};

export const getCurrentUser = async (): Promise<Record<string, any> | null> => {
  try {
    return await account.get();
  } catch (err: any) {
    if (err?.code === 401) return null;
    throw mapError(err, 'Gagal memuat user saat ini.');
  }
};

export const forgotPassword = async (email: string, redirectUrl = `${window.location.origin}/reset-password`): Promise<void> => {
  const normalizedEmail = requireText(email, 'Email wajib diisi.');

  try {
    await account.createRecovery(normalizedEmail, redirectUrl);
  } catch (err) {
    throw mapError(err, 'Gagal mengirim link reset password. Coba lagi.');
  }
};

export const resetPassword = async (userId: string, secret: string, password: string): Promise<void> => {
  const normalizedUserId = requireText(userId, 'User ID wajib diisi.');
  const normalizedSecret = requireText(secret, 'Secret reset password wajib diisi.');
  const normalizedPassword = requireText(password, 'Password baru wajib diisi.');

  try {
    await account.updateRecovery(normalizedUserId, normalizedSecret, normalizedPassword);
  } catch (err) {
    throw mapError(err, 'Gagal mereset password. Coba lagi.');
  }
};
