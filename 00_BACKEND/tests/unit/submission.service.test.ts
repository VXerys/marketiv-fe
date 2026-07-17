import { describe, it, expect, beforeEach } from 'vitest';
import * as mockAppwrite from '../../src/test-mocks/appwrite';

const { __resetStore } = mockAppwrite as any;

describe('submission.service — validation', () => {
  beforeEach(() => __resetStore());

  const valid = {
    claimId: 'claim-1',
    campaignId: 'camp-1',
    platform: 'tiktok',
    postUrl: 'https://www.tiktok.com/@u/video/1',
    views: 1000,
  };

  it('createSubmission throws when claimId empty', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, claimId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Claim ID wajib diisi.' });
  });

  it('createSubmission throws when campaignId empty', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, campaignId: '' }))
      .rejects.toMatchObject({ code: 'validation', message: 'Campaign ID wajib diisi.' });
  });

  it('createSubmission throws when platform not tiktok', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, platform: 'instagram' }))
      .rejects.toMatchObject({ code: 'validation', message: 'MVP hanya mendukung platform TikTok.' });
  });

  it('createSubmission throws when postUrl invalid', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, postUrl: 'https://facebook.com/x' }))
      .rejects.toMatchObject({ code: 'validation', message: 'postUrl harus URL TikTok yang valid (https://*.tiktok.com).' });
  });

  it('createSubmission throws when postUrl not https', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, postUrl: 'http://tiktok.com/x' }))
      .rejects.toMatchObject({ code: 'validation', message: 'postUrl harus URL TikTok yang valid (https://*.tiktok.com).' });
  });

  it('createSubmission throws when views < 0', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, views: -1 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Views harus angka >= 0.' });
  });

  it('createSubmission throws when views not integer', async () => {
    const { createSubmission } = await import('../../src/services/submission.service');
    await expect(createSubmission({ ...valid, views: 1.5 }))
      .rejects.toMatchObject({ code: 'validation', message: 'Views harus angka >= 0.' });
  });

  it('approveSubmission throws when submissionId empty', async () => {
    const { approveSubmission } = await import('../../src/services/submission.service');
    await expect(approveSubmission('')).rejects.toMatchObject({ code: 'validation', message: 'Submission ID wajib diisi.' });
  });

  it('rejectSubmission throws when submissionId empty', async () => {
    const { rejectSubmission } = await import('../../src/services/submission.service');
    await expect(rejectSubmission('')).rejects.toMatchObject({ code: 'validation', message: 'Submission ID wajib diisi.' });
  });
});
