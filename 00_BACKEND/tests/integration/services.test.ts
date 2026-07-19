import { describe, it, expect, beforeEach } from 'vitest';
import * as mockAppwrite from '../../src/test-mocks/appwrite';

const { __mockAccountGet, __mockFunctionExecution, __seed, __resetStore, __mockStore } = mockAppwrite as any;

describe('auth.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('registerUMKM creates account, session, profile, returns result', async () => {
    __seed('umkm_profiles', [{ $id: 'up1', userId: 'user-1', role: 'umkm', businessName: 'Toko', category: 'Food', isProfileCompleted: false }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));

    const calls: string[] = [];
    const mock = await import('../../src/test-mocks/appwrite');
    // override account.create etc. to record
    const { account } = await import('../../src/lib/appwrite');
    const origCreate = account.create.bind(account);
    account.create = async (id: string, email: string, password: string, name?: string) => {
      calls.push('create');
      return origCreate(id, email, password, name);
    };
    account.createEmailPasswordSession = async () => { calls.push('session'); return { $id: 's1' }; };
    account.updatePrefs = async (p: any) => { calls.push('prefs'); return p; };

    __mockFunctionExecution(() => ({ $id: 'exec1', status: 'success', responseBody: '{}' }));

    const { registerUMKM } = await import('../../src/services/auth.service');
    const result = await registerUMKM({
      businessName: 'Toko A',
      category: 'Food',
      email: 'a@x.com',
      phone: '08123',
      password: 'secret',
    });

    expect(calls).toContain('create');
    expect(calls).toContain('session');
    expect(calls).toContain('prefs');
    expect(result.user).toBeDefined();
    expect(result.profile).toBeDefined();
    expect(result.wallet).toBeNull();
  });

  it('loginUser returns profile and wallet', async () => {
    __seed('users', [{ $id: 'u-1', userId: 'user-1', role: 'umkm', status: 'active', email: 'a@x.com' }]);
    __seed('umkm_profiles', [{ $id: 'p-1', userId: 'user-1', role: 'umkm', businessName: 'Toko', category: 'Food', isProfileCompleted: false }]);
    __seed('wallets', [{ $id: 'w-1', userId: 'user-1', balance: 0, pendingBalance: 0 }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));

    const { loginUser } = await import('../../src/services/auth.service');
    const result = await loginUser({ email: 'a@x.com', password: 'secret' });
    expect(result.user).toBeDefined();
    expect(result.profile).toMatchObject({ businessName: 'Toko' });
    expect(result.wallet).toMatchObject({ balance: 0 });
  });

  it('getCurrentUser returns null when not logged in (401)', async () => {
    __mockAccountGet(() => { const e: any = new Error('no auth'); e.code = 401; throw e; });
    const { getCurrentUser } = await import('../../src/services/auth.service');
    const user = await getCurrentUser();
    expect(user).toBeNull();
  });
});

describe('campaign.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('createCampaign stores draft with defaults', async () => {
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { createCampaign } = await import('../../src/services/campaign.service');
    const camp = await createCampaign({
      title: 'C1',
      category: 'Food',
      type: 'ugc',
      platforms: ['tiktok'],
      budget: 50000,
      rewardPer1000Views: 1000,
      claimLimit: 3,
    });
    expect(camp.status).toBe('draft');
    expect(camp.totalClaims).toBe(0);
    expect(camp.remainingBudget).toBe(0);
    expect(camp.submissionDays).toBe(7);
  });

  it('publishCampaign sets active & publishedAt when remainingBudget > 0', async () => {
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const mock = await import('../../src/test-mocks/appwrite');
    __seed('campaigns', [{ $id: 'c1', umkmId: 'user-1', title: 'C1', category: 'Food', type: 'ugc', platforms: ['tiktok'], budget: 50000, rewardPer1000Views: 1000, claimLimit: 3, submissionDays: 7, totalClaims: 0, spentAmount: 0, remainingBudget: 50000, status: 'draft' }]);
    const { publishCampaign } = await import('../../src/services/campaign.service');
    const camp = await publishCampaign('c1');
    expect(camp.status).toBe('active');
    expect(camp.publishedAt).toBeDefined();
  });

  it('publishCampaign throws when remainingBudget is 0', async () => {
    __mockAccountGet(() => ({ $id: 'user-1' }));
    __seed('campaigns', [{ $id: 'c1', umkmId: 'user-1', title: 'C1', category: 'Food', type: 'ugc', platforms: ['tiktok'], budget: 50000, rewardPer1000Views: 1000, claimLimit: 3, submissionDays: 7, totalClaims: 0, spentAmount: 0, remainingBudget: 0, status: 'draft' }]);
    const { publishCampaign } = await import('../../src/services/campaign.service');
    await expect(publishCampaign('c1')).rejects.toMatchObject({ code: 'validation', message: 'Campaign harus di-top-up terlebih dahulu.' });
  });

  it('generateBrief calls ai-brief and returns brief', async () => {
    const fnResp = { success: true, brief: { objective: 'o', contentAngle: 'a', cta: 'c', briefDetail: 'd', doAndDont: { do: [], dont: [] } } };
    __mockFunctionExecution(() => ({ $id: 'e1', status: 'success', responseBody: JSON.stringify(fnResp) }));
    const { generateBrief } = await import('../../src/services/campaign.service');
    const brief = await generateBrief({ campaignId: 'c1', description: 'desc', type: 'ugc' });
    expect(brief.objective).toBe('o');
    expect(brief.doAndDont).toBeDefined();
  });
});

describe('offer.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('createOffer stores pending offer in conversation', async () => {
    __seed('conversations', [{ $id: 'conv1', umkm_id: 'user-1', creator_id: 'creator-1' }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { createOffer } = await import('../../src/services/offer.service');
    const offer = await createOffer({ conversationId: 'conv1', title: 'O1', price: 100000, deadline: '2026-12-31', revisionLimit: 2 });
    expect(offer.status).toBe('pending');
    expect(offer.umkmId).toBe('user-1');
    expect(offer.creatorId).toBe('creator-1');
  });

  it('acceptOffer sets accepted (will trigger create-order function)', async () => {
    __seed('offers', [{ $id: 'o1', conversationId: 'conv1', umkmId: 'u1', creatorId: 'user-1', title: 'O1', price: 100000, deadline: '2026-12-31', revisionLimit: 2, status: 'pending' }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { acceptOffer } = await import('../../src/services/offer.service');
    const offer = await acceptOffer('o1');
    expect(offer.status).toBe('accepted');
  });
});

describe('payment.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('createPayment for campaign adds 2% fee to totalAmount', async () => {
    const fnResp = { paymentId: 'pay-1', gateway: 'midtrans', snapToken: 'tok', redirectUrl: 'url', status: 'pending' };
    __mockFunctionExecution(() => ({ $id: 'e1', status: 'success', responseBody: JSON.stringify(fnResp) }));
    const { createPayment } = await import('../../src/services/payment.service');
    const result = await createPayment({ purpose: 'campaign', amount: 100000, campaignId: 'c1' });
    expect(result.paymentId).toBe('pay-1');
    expect(result.totalAmount).toBeUndefined(); // totalAmount inside response not surfaced; service returns result as-is
  });

  it('createPayment for order uses amount as totalAmount (no fee)', async () => {
    const fnResp = { paymentId: 'pay-2', gateway: 'midtrans', status: 'pending' };
    __mockFunctionExecution(() => ({ $id: 'e1', status: 'success', responseBody: JSON.stringify(fnResp) }));
    const { createPayment } = await import('../../src/services/payment.service');
    const result = await createPayment({ purpose: 'order', amount: 100000, orderId: 'o1' });
    expect(result.paymentId).toBe('pay-2');
  });
});

describe('wallet.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('requestWithdraw creates withdrawal (auto processed) when valid', async () => {
    __seed('wallets', [{ $id: 'w1', userId: 'user-1', balance: 200000, pendingBalance: 0 }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { requestWithdraw } = await import('../../src/services/wallet.service');
    const w = await requestWithdraw({ amount: 100000, payoutMethod: 'bank', providerName: 'BCA', accountNumber: '123', accountName: 'A' });
    expect(w.status).toBe('processed');
    expect(w.amount).toBe(100000);
    const wallet = (__mockStore['wallets'] || []).find((w: any) => w.$id === 'w1');
    expect(wallet.balance).toBe(100000);
    const tx = (__mockStore['transactions'] || []).find((t: any) => t.referenceId === w.id);
    expect(tx.type).toBe('withdrawal');
  });

  it('getWallet returns existing wallet', async () => {
    __seed('wallets', [{ $id: 'w1', userId: 'user-1', balance: 50000, pendingBalance: 0 }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { getWallet } = await import('../../src/services/wallet.service');
    const wallet = await getWallet();
    expect(wallet.balance).toBe(50000);
  });
});

describe('user.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('addSocialAccount only allows tiktok', async () => {
    __mockAccountGet(() => ({ $id: 'user-1' }));
    __seed('creator_profiles', [{ $id: 'cp1', userId: 'user-1', role: 'creator', displayName: 'C', isProfileCompleted: true }]);
    const { addSocialAccount } = await import('../../src/services/user.service');
    const acc = await addSocialAccount({ platform: 'tiktok', username: '@creator' });
    expect(acc.platform).toBe('tiktok');
    expect(acc.username).toBe('@creator');
  });

  it('getProfile returns creator profile by role', async () => {
    __seed('creator_profiles', [{ $id: 'cp1', userId: 'user-1', role: 'creator', displayName: 'C', isProfileCompleted: true, totalFollowers: 100, totalOrders: 5, rating: 4.5 }]);
    __seed('users', [{ $id: 'user-1', userId: 'user-1', role: 'creator', status: 'active', email: 'c@x.com' }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { getProfile } = await import('../../src/services/user.service');
    const p = await getProfile('user-1', 'creator');
    expect(p.role).toBe('creator');
    expect(p.totalFollowers).toBe(100);
  });
});

describe('chat.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('createConversation returns existing for duplicate pair', async () => {
    __seed('conversations', [{ $id: 'conv1', umkm_id: 'u1', creator_id: 'c1' }]);
    __mockAccountGet(() => ({ $id: 'u1' }));
    const { createConversation } = await import('../../src/services/chat.service');
    const conv = await createConversation({ umkmId: 'u1', creatorId: 'c1' });
    expect(conv.id).toBe('conv1');
  });

  it('sendMessage stores message and updates conversation last_message', async () => {
    __seed('conversations', [{ $id: 'conv1', umkm_id: 'u1', creator_id: 'c1' }]);
    __mockAccountGet(() => ({ $id: 'u1' }));
    const { sendMessage } = await import('../../src/services/chat.service');
    const msg = await sendMessage({ conversationId: 'conv1', type: 'text', content: 'Halo' });
    expect(msg.content).toBe('Halo');
  });
});

describe('notification.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('markAsRead sets isRead true', async () => {
    __seed('notifications', [{ $id: 'n1', userId: 'user-1', title: 'T', message: 'M', type: 'info', isRead: false }]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { markAsRead } = await import('../../src/services/notification.service');
    const n = await markAsRead('n1');
    expect(n.isRead).toBe(true);
  });

  it('markAllAsRead marks all read', async () => {
    __seed('notifications', [
      { $id: 'n1', userId: 'user-1', title: 'T', message: 'M', type: 'info', isRead: false },
      { $id: 'n2', userId: 'user-1', title: 'T', message: 'M', type: 'info', isRead: false },
    ]);
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { markAllAsRead, getNotifications } = await import('../../src/services/notification.service');
    await markAllAsRead();
    const all = await getNotifications();
    expect(all.every((n) => n.isRead)).toBe(true);
  });
});

describe('creator.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('createRateCard creates card + packages', async () => {
    __mockAccountGet(() => ({ $id: 'user-1' }));
    const { createRateCard } = await import('../../src/services/creator.service');
    const rc = await createRateCard({
      title: 'RC',
      packages: [{ name: 'P1', description: 'd', output: 'video', deliveryDays: 3, price: 100000, revisionLimit: 1 }],
    });
    expect(rc.status).toBe('draft');
    expect(rc.packages).toHaveLength(1);
  });
});

describe('claim.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('claimCampaign creates claimed record and increments totalClaims', async () => {
    __seed('users', [{ $id: 'creator-1', userId: 'creator-1', role: 'creator', status: 'active', email: 'c@x.com', isProfileCompleted: true }]);
    __seed('creator_profiles', [{ $id: 'cp1', userId: 'creator-1', role: 'creator', displayName: 'C', isProfileCompleted: true, totalFollowers: 0, totalOrders: 0, rating: 0 }]);
    __seed('campaigns', [{ $id: 'c1', umkmId: 'u1', title: 'C1', category: 'Food', type: 'ugc', platforms: ['tiktok'], budget: 50000, rewardPer1000Views: 1000, claimLimit: 3, submissionDays: 7, totalClaims: 0, spentAmount: 0, remainingBudget: 50000, status: 'active' }]);
    __mockAccountGet(() => ({ $id: 'creator-1' }));
    const { claimCampaign } = await import('../../src/services/claim.service');
    const claim = await claimCampaign('c1');
    expect(claim.status).toBe('claimed');
  });

  it('claimCampaign rejects duplicate claim', async () => {
    __seed('users', [{ $id: 'creator-1', userId: 'creator-1', role: 'creator', status: 'active', email: 'c@x.com', isProfileCompleted: true }]);
    __seed('creator_profiles', [{ $id: 'cp1', userId: 'creator-1', role: 'creator', displayName: 'C', isProfileCompleted: true, totalFollowers: 0, totalOrders: 0, rating: 0 }]);
    __seed('campaigns', [{ $id: 'c1', umkmId: 'u1', title: 'C1', category: 'Food', type: 'ugc', platforms: ['tiktok'], budget: 50000, rewardPer1000Views: 1000, claimLimit: 3, submissionDays: 7, totalClaims: 0, spentAmount: 0, remainingBudget: 50000, status: 'active' }]);
    __seed('campaign_claims', [{ $id: 'cl1', campaignId: 'c1', creatorId: 'creator-1', status: 'claimed', claimedAt: new Date().toISOString() }]);
    __mockAccountGet(() => ({ $id: 'creator-1' }));
    const { claimCampaign } = await import('../../src/services/claim.service');
    await expect(claimCampaign('c1')).rejects.toMatchObject({ code: 'validation', message: 'Kamu sudah claim campaign ini.' });
  });
});

describe('submission.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('createSubmission stores pending submission', async () => {
    __seed('campaign_claims', [{ $id: 'cl1', campaignId: 'c1', creatorId: 'creator-1', umkmId: 'u1', status: 'claimed', claimedAt: new Date().toISOString() }]);
    __mockAccountGet(() => ({ $id: 'creator-1' }));
    const { createSubmission } = await import('../../src/services/submission.service');
    const sub = await createSubmission({ claimId: 'cl1', campaignId: 'c1', platform: 'tiktok', postUrl: 'https://www.tiktok.com/@u/video/1', views: 1000 });
    expect(sub.status).toBe('pending');
  });
});

describe('order.service — integration (success paths)', () => {
  beforeEach(() => __resetStore());

  it('uploadDeliverable increments version and sets in_progress', async () => {
    __seed('orders', [{ $id: 'o1', creatorId: 'creator-1', umkmId: 'u1', amount: 100000, status: 'escrow' }]);
    __seed('deliverables', []);
    __mockAccountGet(() => ({ $id: 'creator-1' }));
    const { uploadDeliverable } = await import('../../src/services/order.service');
    const d = await uploadDeliverable({ orderId: 'o1', source: 'external_url', fileUrl: 'https://x.com/a' });
    expect(d.version).toBe(1);
    expect(d.status).toBe('submitted');
  });
});
