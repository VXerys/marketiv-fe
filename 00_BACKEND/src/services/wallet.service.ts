import { ID, Permission, Query, Role } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, databases } from '../lib/appwrite';

export const MINIMUM_WITHDRAW = 50000;
export const MINIMUM_CAMPAIGN_BUDGET = 50000;
export const PLATFORM_FEE_RATE = 0.05;
export const WITHDRAW_PAYOUT_METHODS = ['bank', 'ewallet'] as const;

export type WithdrawPayoutMethod = (typeof WITHDRAW_PAYOUT_METHODS)[number];
export type WithdrawalStatus = 'processed';
export type TransactionType = 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'release' | 'fee';

export type Wallet = {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  createdAt?: string;
  updatedAt?: string;
};

export type RequestWithdrawInput = {
  amount: number;
  payoutMethod: WithdrawPayoutMethod;
  providerName: string;
  accountNumber: string;
  accountName: string;
};

export type Withdrawal = RequestWithdrawInput & {
  id: string;
  userId: string;
  status: WithdrawalStatus;
  processedAt?: string;
  createdAt?: string;
};

export type WalletTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  referenceId?: string;
  referenceType?: string;
  status: string;
  createdAt?: string;
};

export type GetTransactionsOptions = {
  type?: TransactionType;
  limit?: number;
};

export type GetWithdrawalsOptions = {
  limit?: number;
};

export class WalletServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'WalletServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapWallet = (document: Record<string, any>): Wallet => ({
  id: document.$id,
  userId: document.userId,
  balance: document.balance ?? 0,
  pendingBalance: document.pendingBalance ?? 0,
  createdAt: document.$createdAt,
  updatedAt: document.$updatedAt,
});

const mapWithdrawal = (document: Record<string, any>): Withdrawal => ({
  id: document.$id,
  userId: document.userId,
  amount: document.amount,
  payoutMethod: document.payoutMethod,
  providerName: document.providerName,
  accountNumber: document.accountNumber,
  accountName: document.accountName,
  status: document.status,
  processedAt: document.processedAt || undefined,
  createdAt: document.$createdAt,
});

const mapTransaction = (document: Record<string, any>): WalletTransaction => ({
  id: document.$id,
  userId: document.userId,
  amount: document.amount,
  type: document.type,
  referenceId: document.referenceId || undefined,
  referenceType: document.referenceType || undefined,
  status: document.status,
  createdAt: document.$createdAt,
});

const mapError = (err: any, fallbackMessage: string): WalletServiceError => {
  if (err instanceof WalletServiceError) {
    return err;
  }

  if (err?.code === 401) {
    return new WalletServiceError('auth', 'Silakan login untuk mengakses wallet.', err);
  }

  if (err?.code === 403) {
    return new WalletServiceError('forbidden', 'Kamu tidak memiliki akses ke wallet ini.', err);
  }

  if (err?.code === 404) {
    return new WalletServiceError('not_found', 'Data wallet tidak ditemukan.', err);
  }

  return new WalletServiceError(err?.type || 'unknown', fallbackMessage, err);
};

export const calculatePlatformFee = (nominal: number): number =>
  Math.floor(nominal * PLATFORM_FEE_RATE);

export const calculateTotalPayment = (nominal: number): number =>
  nominal + calculatePlatformFee(nominal);

export const calculateCreatorPayout = (nominal: number): number =>
  nominal - calculatePlatformFee(nominal);

const validateWithdrawAmount = (amount: number): void => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new WalletServiceError('validation', 'Jumlah penarikan tidak valid');
  }

  if (amount < MINIMUM_WITHDRAW) {
    throw new WalletServiceError('validation', 'Minimum penarikan Rp50.000');
  }
};

const validatePayoutDestination = (data: RequestWithdrawInput): void => {
  if (!WITHDRAW_PAYOUT_METHODS.includes(data.payoutMethod)) {
    throw new WalletServiceError('validation', 'Metode penarikan tidak valid');
  }

  if (!data.providerName?.trim() || !data.accountNumber?.trim() || !data.accountName?.trim()) {
    throw new WalletServiceError('validation', 'Lengkapi data penarikan');
  }
};

export const getWallet = async (): Promise<Wallet> => {
  try {
    const user = await account.get();
    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.wallets, [
      Query.equal('userId', user.$id),
      Query.limit(1),
    ]);

    const wallet = response.documents[0];

    if (!wallet) {
      throw new WalletServiceError('not_found', 'Data wallet tidak ditemukan.');
    }

    return mapWallet(wallet);
  } catch (err) {
    throw mapError(err, 'Gagal memuat wallet. Coba lagi.');
  }
};

export const getTransactions = async (options: GetTransactionsOptions = {}): Promise<WalletTransaction[]> => {
  try {
    const user = await account.get();
    const queries = [
      Query.equal('userId', user.$id),
      Query.orderDesc('$createdAt'),
      Query.limit(options.limit ?? 50),
    ];

    if (options.type) {
      queries.push(Query.equal('type', options.type));
    }

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.transactions, queries);

    return response.documents.map(mapTransaction);
  } catch (err) {
    throw mapError(err, 'Gagal memuat riwayat transaksi. Coba lagi.');
  }
};

export const getWithdrawals = async (options: GetWithdrawalsOptions = {}): Promise<Withdrawal[]> => {
  try {
    const user = await account.get();
    const queries = [
      Query.equal('userId', user.$id),
      Query.orderDesc('$createdAt'),
      Query.limit(options.limit ?? 50),
    ];

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.withdrawals, queries);
    return response.documents.map(mapWithdrawal);
  } catch (err) {
    throw mapError(err, 'Gagal memuat riwayat withdrawal. Coba lagi.');
  }
};

export const requestWithdraw = async (data: RequestWithdrawInput): Promise<Withdrawal> => {
  const { amount, payoutMethod, providerName, accountNumber, accountName } = data;

  validateWithdrawAmount(amount);
  validatePayoutDestination(data);

  try {
    const user = await account.get();
    const wallet = await getWallet();

    if (wallet.balance < amount) {
      throw new WalletServiceError('validation', 'Saldo tidak mencukupi');
    }

    const now = new Date().toISOString();

    const withdrawal = await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.withdrawals,
      ID.unique(),
      {
        userId: user.$id,
        amount,
        payoutMethod,
        providerName: providerName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        status: 'processed',
        processedAt: now,
      },
      [Permission.read(Role.user(user.$id))]
    );

    await databases.updateDocument(
      DATABASE_ID,
      COLLECTIONS.wallets,
      wallet.id,
      { balance: wallet.balance - amount }
    );

    await databases.createDocument(
      DATABASE_ID,
      COLLECTIONS.transactions,
      ID.unique(),
      {
        userId: user.$id,
        amount: -amount,
        type: 'withdrawal',
        referenceId: withdrawal.$id,
        referenceType: 'withdrawal',
        status: 'completed',
      },
      [Permission.read(Role.user(user.$id))]
    );

    return mapWithdrawal(withdrawal);
  } catch (err) {
    throw mapError(err, 'Gagal mengajukan withdrawal. Coba lagi.');
  }
};

export const getBalance = async (): Promise<number> => {
  const wallet = await getWallet();
  return wallet.balance;
};

export const getPendingBalance = async (): Promise<number> => {
  const wallet = await getWallet();
  return wallet.pendingBalance;
};
