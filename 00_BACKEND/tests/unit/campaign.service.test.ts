import { describe, it, expect, beforeEach } from 'vitest';
import * as mockAppwrite from '../../src/test-mocks/appwrite';

const { __resetStore } = mockAppwrite as any;

const validCampaign = {
  title: 'Campaign A',
  category: 'Food',
  type: 'ugc' as const,
  platforms: ['tiktok'],
  budget: 50000,
  rewardPer1000Views: 1000,
  claimLimit: 5,
};

describe('campaign.service — validation', () => {
  beforeEach(() => __resetStore());

  it('createCampaign throws when title empty', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, title: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Judul wajib diisi.' });
  });

  it('createCampaign throws when category empty', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, category: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Kategori wajib diisi.' });
  });

  it('createCampaign throws when type invalid', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, type: 'invalid' as any }))
      .rejects.toMatchObject({ code: 'validation', message: 'Tipe campaign tidak valid.' });
  });

  it('createCampaign throws when platforms not tiktok only', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, platforms: ['instagram'] }))
      .rejects.toMatchObject({ code: 'validation', message: 'MVP hanya mendukung platform TikTok.' });
  });

  it('createCampaign throws when platforms empty', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, platforms: [] }))
      .rejects.toMatchObject({ code: 'validation', message: 'MVP hanya mendukung platform TikTok.' });
  });

  it('createCampaign throws when budget < 50000', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, budget: 49999 }))
      .rejects.toMatchObject({ code: 'validation' });
  });

  it('createCampaign throws when rewardPer1000Views <= 0', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, rewardPer1000Views: 0 }))
      .rejects.toMatchObject({ code: 'validation' });
  });

  it('createCampaign throws when claimLimit <= 0', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, claimLimit: 0 }))
      .rejects.toMatchObject({ code: 'validation' });
  });

  it('createCampaign throws when submissionDays < 1', async () => {
    const { createCampaign } = await import('../../src/services/campaign.service');
    await expect(createCampaign({ ...validCampaign, submissionDays: 0 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Batas waktu submit minimal 1 hari.' });
  });

  it('generateBrief throws when campaignId empty', async () => {
    const { generateBrief } = await import('../../src/services/campaign.service');
    await expect(generateBrief({ campaignId: '', description: 'd', type: 'ugc' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Campaign ID wajib diisi.' });
  });

  it('generateBrief throws when description empty', async () => {
    const { generateBrief } = await import('../../src/services/campaign.service');
    await expect(generateBrief({ campaignId: 'c1', description: '', type: 'ugc' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Deskripsi wajib diisi.' });
  });

  it('generateBrief throws when type invalid', async () => {
    const { generateBrief } = await import('../../src/services/campaign.service');
    await expect(generateBrief({ campaignId: 'c1', description: 'd', type: 'bad' as any }))
      .rejects.toMatchObject({ code: 'validation', message: 'Tipe campaign tidak valid.' });
  });

  it('publishCampaign throws when campaignId empty', async () => {
    const { publishCampaign } = await import('../../src/services/campaign.service');
    await expect(publishCampaign('')).rejects.toMatchObject({ code: 'validation', message: 'Campaign ID wajib diisi.' });
  });

  it('getCampaignById throws when campaignId empty', async () => {
    const { getCampaignById } = await import('../../src/services/campaign.service');
    await expect(getCampaignById('')).rejects.toMatchObject({ code: 'validation', message: 'Campaign ID wajib diisi.' });
  });
});
