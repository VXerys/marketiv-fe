import { describe, it, expect, beforeEach } from 'vitest';
import * as mockAppwrite from '../../src/test-mocks/appwrite';

const { __resetStore } = mockAppwrite as any;

describe('offer.service — validation', () => {
  beforeEach(() => __resetStore());

  const valid = {
    conversationId: 'conv-1',
    title: 'Offer A',
    price: 100000,
    deadline: '2026-12-31',
    revisionLimit: 2,
  };

  it('createOffer throws when conversationId empty', async () => {
    const { createOffer } = await import('../../src/services/offer.service');
    await expect(createOffer({ ...valid, conversationId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Conversation ID wajib diisi.' });
  });

  it('createOffer throws when title empty', async () => {
    const { createOffer } = await import('../../src/services/offer.service');
    await expect(createOffer({ ...valid, title: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Judul offer wajib diisi.' });
  });

  it('createOffer throws when price <= 0', async () => {
    const { createOffer } = await import('../../src/services/offer.service');
    await expect(createOffer({ ...valid, price: 0 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Harga harus angka > 0.' });
  });

  it('createOffer throws when deadline empty', async () => {
    const { createOffer } = await import('../../src/services/offer.service');
    await expect(createOffer({ ...valid, deadline: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Deadline wajib diisi.' });
  });

  it('createOffer throws when revisionLimit < 0', async () => {
    const { createOffer } = await import('../../src/services/offer.service');
    await expect(createOffer({ ...valid, revisionLimit: -1 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Revision limit tidak valid.' });
  });

  it('acceptOffer throws when offerId empty', async () => {
    const { acceptOffer } = await import('../../src/services/offer.service');
    await expect(acceptOffer('')).rejects.toMatchObject({ code: 'validation', message: 'Offer ID wajib diisi.' });
  });

  it('rejectOffer throws when offerId empty', async () => {
    const { rejectOffer } = await import('../../src/services/offer.service');
    await expect(rejectOffer('')).rejects.toMatchObject({ code: 'validation', message: 'Offer ID wajib diisi.' });
  });
});

describe('order.service — validation', () => {
  beforeEach(() => __resetStore());

  it('approveDeliverable throws when orderId empty', async () => {
    const { approveDeliverable } = await import('../../src/services/order.service');
    await expect(approveDeliverable({ orderId: '', deliverableId: 'd1' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Order ID wajib diisi.' });
  });

  it('approveDeliverable throws when deliverableId empty', async () => {
    const { approveDeliverable } = await import('../../src/services/order.service');
    await expect(approveDeliverable({ orderId: 'o1', deliverableId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Deliverable ID wajib diisi.' });
  });

  it('requestRevision throws when orderId empty', async () => {
    const { requestRevision } = await import('../../src/services/order.service');
    await expect(requestRevision({ orderId: '', message: 'fix' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Order ID wajib diisi.' });
  });

  it('uploadDeliverable throws when orderId empty', async () => {
    const { uploadDeliverable } = await import('../../src/services/order.service');
    await expect(uploadDeliverable({ orderId: '', source: 'external_url', fileUrl: 'https://x.com/a' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Order ID wajib diisi.' });
  });

  it('uploadDeliverable throws when source storage without fileId', async () => {
    const mock = await import('../../src/test-mocks/appwrite');
    (mock as any).__seed('orders', [{ $id: 'o1', creatorId: 'user-1', status: 'in_progress' }]);
    (mock as any).__mockAccountGet(() => ({ $id: 'user-1' }));
    const { uploadDeliverable } = await import('../../src/services/order.service');
    await expect(uploadDeliverable({ orderId: 'o1', source: 'storage', fileUrl: 'x' }))
      .rejects.toMatchObject({ code: 'validation', message: 'fileId wajib diisi untuk source storage.' });
  });

  it('uploadDeliverable throws when external_url not https', async () => {
    const mock = await import('../../src/test-mocks/appwrite');
    (mock as any).__seed('orders', [{ $id: 'o1', creatorId: 'user-1', status: 'in_progress' }]);
    (mock as any).__mockAccountGet(() => ({ $id: 'user-1' }));
    const { uploadDeliverable } = await import('../../src/services/order.service');
    await expect(uploadDeliverable({ orderId: 'o1', source: 'external_url', fileUrl: 'http://x.com/a' }))
      .rejects.toMatchObject({ code: 'validation', message: 'External URL harus menggunakan protokol HTTPS.' });
  });
});

describe('chat.service — validation', () => {
  beforeEach(() => __resetStore());

  it('createConversation throws when umkmId empty', async () => {
    const { createConversation } = await import('../../src/services/chat.service');
    await expect(createConversation({ umkmId: '', creatorId: 'c1' }))
      .rejects.toMatchObject({ code: 'validation' });
  });

  it('createConversation throws when creatorId empty', async () => {
    const { createConversation } = await import('../../src/services/chat.service');
    await expect(createConversation({ umkmId: 'u1', creatorId: '' }))
      .rejects.toMatchObject({ code: 'validation' });
  });

  it('sendMessage throws when conversationId empty', async () => {
    const { sendMessage } = await import('../../src/services/chat.service');
    await expect(sendMessage({ conversationId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Conversation ID wajib diisi.' });
  });

  it('sendMessage throws when text content empty', async () => {
    const { sendMessage } = await import('../../src/services/chat.service');
    await expect(sendMessage({ conversationId: 'c1', type: 'text', content: '   ' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Pesan tidak boleh kosong.' });
  });
});

describe('creator.service — validation', () => {
  beforeEach(() => __resetStore());

  const validPackage = {
    name: 'Pkg',
    description: 'desc',
    output: 'video',
    deliveryDays: 3,
    price: 100000,
    revisionLimit: 1,
  };

  it('createRateCard throws when title empty', async () => {
    const { createRateCard } = await import('../../src/services/creator.service');
    await expect(createRateCard({ title: '', packages: [validPackage] }))
      .rejects.toMatchObject({ code: 'validation', message: 'Judul rate card wajib diisi.' });
  });

  it('createRateCard throws when packages empty', async () => {
    const { createRateCard } = await import('../../src/services/creator.service');
    await expect(createRateCard({ title: 'RC', packages: [] }))
      .rejects.toMatchObject({ code: 'validation', message: 'Minimal satu paket wajib ditambahkan.' });
  });

  it('createRateCard throws when package name empty', async () => {
    const { createRateCard } = await import('../../src/services/creator.service');
    await expect(createRateCard({ title: 'RC', packages: [{ ...validPackage, name: '' }] }))
      .rejects.toMatchObject({ code: 'validation', message: 'Paket #1: nama wajib diisi.' });
  });

  it('createRateCard throws when package price <= 0', async () => {
    const { createRateCard } = await import('../../src/services/creator.service');
    await expect(createRateCard({ title: 'RC', packages: [{ ...validPackage, price: 0 }] }))
      .rejects.toMatchObject({ code: 'validation', message: 'Paket #1: price harus angka > 0.' });
  });

  it('updateRateCard throws when rateCardId empty', async () => {
    const { updateRateCard } = await import('../../src/services/creator.service');
    await expect(updateRateCard({ rateCardId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Rate card ID wajib diisi.' });
  });

  it('getRateCards throws when creatorId empty', async () => {
    const { getRateCards } = await import('../../src/services/creator.service');
    await expect(getRateCards({ creatorId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Creator ID wajib diisi.' });
  });
});

describe('user.service — validation', () => {
  beforeEach(() => __resetStore());

  it('getProfile throws when userId empty', async () => {
    const { getProfile } = await import('../../src/services/user.service');
    await expect(getProfile('')).rejects.toMatchObject({ code: 'validation', message: 'User ID wajib diisi.' });
  });

  it('addSocialAccount throws when platform not tiktok', async () => {
    const { addSocialAccount } = await import('../../src/services/user.service');
    await expect(addSocialAccount({ platform: 'instagram' as any, username: 'u' }))
      .rejects.toMatchObject({ code: 'validation', message: 'MVP hanya mendukung akun TikTok.' });
  });

  it('addSocialAccount throws when username empty', async () => {
    const { addSocialAccount } = await import('../../src/services/user.service');
    await expect(addSocialAccount({ platform: 'tiktok', username: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Username akun sosial wajib diisi.' });
  });

  it('removeSocialAccount throws when id empty', async () => {
    const { removeSocialAccount } = await import('../../src/services/user.service');
    await expect(removeSocialAccount('')).rejects.toMatchObject({ code: 'validation', message: 'ID akun sosial wajib diisi.' });
  });

  it('deleteFile throws when fileId empty', async () => {
    const { deleteFile } = await import('../../src/services/user.service');
    await expect(deleteFile('')).rejects.toMatchObject({ code: 'validation', message: 'File ID wajib diisi.' });
  });
});

describe('notification.service — validation', () => {
  beforeEach(() => __resetStore());

  it('markAsRead throws when id empty', async () => {
    const { markAsRead } = await import('../../src/services/notification.service');
    await expect(markAsRead('')).rejects.toMatchObject({ code: 'validation', message: 'Notification ID wajib diisi.' });
  });
});

describe('payment.service — validation', () => {
  beforeEach(() => __resetStore());

  it('createPayment throws when amount <= 0', async () => {
    const { createPayment } = await import('../../src/services/payment.service');
    await expect(createPayment({ purpose: 'order', amount: 0, orderId: 'o1' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Jumlah pembayaran tidak valid.' });
  });

  it('createPayment throws when purpose invalid', async () => {
    const { createPayment } = await import('../../src/services/payment.service');
    await expect(createPayment({ purpose: 'bad' as any, amount: 1000 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Tujuan pembayaran tidak valid.' });
  });

  it('createPayment throws when order purpose without orderId', async () => {
    const { createPayment } = await import('../../src/services/payment.service');
    await expect(createPayment({ purpose: 'order', amount: 1000 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Order wajib diisi untuk pembayaran order.' });
  });

  it('createPayment throws when campaign purpose without campaignId', async () => {
    const { createPayment } = await import('../../src/services/payment.service');
    await expect(createPayment({ purpose: 'campaign', amount: 1000 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Campaign wajib diisi untuk top-up campaign.' });
  });

  it('createPayment throws when topup purpose with orderId', async () => {
    const { createPayment } = await import('../../src/services/payment.service');
    await expect(createPayment({ purpose: 'topup', amount: 1000, orderId: 'o1' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Top up tidak boleh memakai order.' });
  });

  it('getPayment throws when paymentId empty', async () => {
    const { getPayment } = await import('../../src/services/payment.service');
    await expect(getPayment('')).rejects.toMatchObject({ code: 'validation', message: 'Payment ID wajib diisi.' });
  });
});

describe('wallet.service — validation', () => {
  beforeEach(() => __resetStore());

  it('requestWithdraw throws when amount < 50000', async () => {
    const { requestWithdraw } = await import('../../src/services/wallet.service');
    await expect(requestWithdraw({ amount: 1000, payoutMethod: 'bank', providerName: 'B', accountNumber: '1', accountName: 'A' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Minimum penarikan Rp50.000' });
  });

  it('requestWithdraw throws when payout method invalid', async () => {
    const { requestWithdraw } = await import('../../src/services/wallet.service');
    await expect(requestWithdraw({ amount: 100000, payoutMethod: 'paypal' as any, providerName: 'B', accountNumber: '1', accountName: 'A' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Metode penarikan tidak valid' });
  });

  it('requestWithdraw throws when payout data incomplete', async () => {
    const { requestWithdraw } = await import('../../src/services/wallet.service');
    await expect(requestWithdraw({ amount: 100000, payoutMethod: 'bank', providerName: '', accountNumber: '', accountName: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Lengkapi data penarikan' });
  });

  it('getWallet throws not_found when wallet missing', async () => {
    const { getWallet } = await import('../../src/services/wallet.service');
    const mock = await import('../../src/test-mocks/appwrite');
    (mock as any).__mockAccountGet(() => ({ $id: 'u1' }));
    await expect(getWallet()).rejects.toMatchObject({ code: 'not_found' });
  });
});
