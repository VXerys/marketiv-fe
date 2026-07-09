import { Query } from 'appwrite';
import { account, COLLECTIONS, DATABASE_ID, FUNCTIONS, databases, functions } from '../lib/appwrite';
import { calculateTotalPayment } from './wallet.service';

export type PaymentPurpose = 'order' | 'topup' | 'campaign';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled';

export type CreatePaymentInput = {
  purpose: PaymentPurpose;
  amount: number;
  orderId?: string;
  campaignId?: string;
};

export type GetPaymentsOptions = {
  status?: PaymentStatus;
  purpose?: PaymentPurpose;
  limit?: number;
};

export type Payment = {
  id: string;
  userId: string;
  orderId?: string;
  campaignId?: string;
  amount: number;
  totalAmount: number;
  feeAmount: number;
  purpose: PaymentPurpose;
  gateway: 'midtrans';
  gatewayReference: string;
  snapToken?: string;
  redirectUrl?: string;
  status: PaymentStatus;
  paidAt?: string;
  createdAt?: string;
};

export type CreatePaymentResult = {
  paymentId: string;
  gateway: 'midtrans';
  snapToken?: string;
  redirectUrl?: string;
  status: PaymentStatus;
};

export class PaymentServiceError extends Error {
  code: string;
  cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = 'PaymentServiceError';
    this.code = code;
    this.cause = cause;
  }
}

const mapPayment = (document: Record<string, any>): Payment => ({
  id: document.$id,
  userId: document.user_id,
  orderId: document.order_id || undefined,
  campaignId: document.campaign_id || undefined,
  amount: document.amount,
  totalAmount: document.total_amount ?? document.amount,
  feeAmount: document.fee_amount ?? 0,
  purpose: document.purpose,
  gateway: document.gateway,
  gatewayReference: document.gateway_reference,
  snapToken: document.snap_token || undefined,
  redirectUrl: document.redirect_url || undefined,
  status: document.status,
  paidAt: document.paid_at || undefined,
  createdAt: document.$createdAt,
});

const parseFunctionResponse = <T>(responseBody: string): T => {
  if (!responseBody) {
    throw new PaymentServiceError('server', 'Response pembayaran kosong.');
  }

  try {
    return JSON.parse(responseBody) as T;
  } catch (err) {
    throw new PaymentServiceError('server', 'Response pembayaran tidak valid.', err);
  }
};

const validateAmount = (amount: number): void => {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new PaymentServiceError('validation', 'Jumlah pembayaran tidak valid.');
  }
};

const mapError = (err: any, fallbackMessage: string): PaymentServiceError => {
  if (err instanceof PaymentServiceError) {
    return err;
  }

  if (err?.code === 401) {
    return new PaymentServiceError('auth', 'Silakan login untuk melanjutkan pembayaran.', err);
  }

  if (err?.code === 403) {
    return new PaymentServiceError('forbidden', 'Kamu tidak memiliki akses ke pembayaran ini.', err);
  }

  if (err?.code === 404) {
    return new PaymentServiceError('not_found', 'Data pembayaran tidak ditemukan.', err);
  }

  return new PaymentServiceError(err?.type || 'unknown', fallbackMessage, err);
};

export const createPayment = async (input: CreatePaymentInput): Promise<CreatePaymentResult> => {
  validateAmount(input.amount);

  if (!['order', 'topup', 'campaign'].includes(input.purpose)) {
    throw new PaymentServiceError('validation', 'Tujuan pembayaran tidak valid.');
  }

  if (input.purpose === 'order' && !input.orderId) {
    throw new PaymentServiceError('validation', 'Order wajib diisi untuk pembayaran order.');
  }

  if (input.purpose === 'campaign' && !input.campaignId) {
    throw new PaymentServiceError('validation', 'Campaign wajib diisi untuk top-up campaign.');
  }

  if (input.purpose === 'topup' && input.orderId) {
    throw new PaymentServiceError('validation', 'Top up tidak boleh memakai order.');
  }

  // Fee 5% ditambahkan hanya untuk campaign top-up (buyer side)
  // Rate card order (purpose=order) tidak ditambahkan fee — fee dipotong saat release escrow
  const totalAmount = input.purpose === 'campaign'
    ? calculateTotalPayment(input.amount)
    : input.amount;

  const payload = {
    ...input,
    totalAmount,
  };

  try {
    const execution = await functions.createExecution(
      FUNCTIONS.createPayment,
      JSON.stringify(payload),
      false
    );

    if (execution.status === 'failed') {
      throw new PaymentServiceError('server', 'Gagal membuat pembayaran. Coba lagi.');
    }

    const result = parseFunctionResponse<CreatePaymentResult>(execution.responseBody);

    if (!result.paymentId || result.gateway !== 'midtrans' || !result.status) {
      throw new PaymentServiceError('server', 'Response pembayaran tidak lengkap.');
    }

    return result;
  } catch (err) {
    throw mapError(err, 'Gagal membuat pembayaran. Coba lagi.');
  }
};

export const getPayment = async (paymentId: string): Promise<Payment> => {
  if (!paymentId) {
    throw new PaymentServiceError('validation', 'Payment ID wajib diisi.');
  }

  try {
    const user = await account.get();
    const document = await databases.getDocument(DATABASE_ID, COLLECTIONS.payments, paymentId);

    if (document.user_id !== user.$id) {
      throw new PaymentServiceError('forbidden', 'Kamu tidak memiliki akses ke pembayaran ini.');
    }

    return mapPayment(document);
  } catch (err) {
    throw mapError(err, 'Gagal memuat pembayaran. Coba lagi.');
  }
};

export const getPayments = async (options: GetPaymentsOptions = {}): Promise<Payment[]> => {
  try {
    const user = await account.get();
    const queries = [
      Query.equal('user_id', user.$id),
      Query.orderDesc('$createdAt'),
      Query.limit(options.limit ?? 50),
    ];

    if (options.status) {
      queries.push(Query.equal('status', options.status));
    }

    if (options.purpose) {
      queries.push(Query.equal('purpose', options.purpose));
    }

    const response = await databases.listDocuments(DATABASE_ID, COLLECTIONS.payments, queries);
    return response.documents.map(mapPayment);
  } catch (err) {
    throw mapError(err, 'Gagal memuat daftar pembayaran. Coba lagi.');
  }
};

export const getPendingPayments = async (): Promise<Payment[]> => getPayments({ status: 'pending' });

export const getPaidPayments = async (): Promise<Payment[]> => getPayments({ status: 'paid' });
