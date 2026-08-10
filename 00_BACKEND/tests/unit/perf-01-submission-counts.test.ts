/**
 * UMKM-PERF-01 — getSubmissionCountsFromAppwrite
 *
 * Verifies:
 *  1. Returns correct pending/valid/dispute counts per campaign.
 *  2. Only ONE listDocuments call is made to the submissions collection
 *     (no N+1 per-campaign pattern).
 *  3. Returns empty map when campaignIds is empty (short-circuit, zero queries).
 *  4. Campaign IDs not present in submissions are absent from result.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─ Mock auth and databases BEFORE any module import ─────────────────────────

const mockListDocuments = vi.fn();

vi.mock('@/services/auth/session.service', () => ({
  getSession: vi.fn().mockResolvedValue({
    success: true,
    data: { userId: 'umkm-1', role: 'umkm', status: 'active', email: 'u@t.com', emailVerified: true },
  }),
}));

vi.mock('@/lib/appwrite/databases', () => ({
  databases: { listDocuments: mockListDocuments },
}));

// ─ tests ─────────────────────────────────────────────────────────────────────

describe('getSubmissionCountsFromAppwrite — UMKM-PERF-01', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns empty map when campaignIds is empty (no query issued)', async () => {
    const { getSubmissionCountsFromAppwrite } = await import('@/services/umkm/umkm-appwrite.service');
    const res = await getSubmissionCountsFromAppwrite([]);
    expect(res.success).toBe(true);
    expect(res.data).toEqual({});
    // Short-circuit: no listDocuments call at all
    expect(mockListDocuments).not.toHaveBeenCalled();
  });

  it('aggregates pending/valid/dispute counts correctly via ONE batch query', async () => {
    // s4 has fraudStatus=flagged → counts as valid AND dispute
    const submissions = [
      { $id: 's1', campaignId: 'camp-A', validationStatus: 'pending',  fraudStatus: 'safe' },
      { $id: 's2', campaignId: 'camp-A', validationStatus: 'pending',  fraudStatus: 'safe' },
      { $id: 's3', campaignId: 'camp-A', validationStatus: 'approved', fraudStatus: 'safe' },
      { $id: 's4', campaignId: 'camp-A', validationStatus: 'approved', fraudStatus: 'flagged' },
      { $id: 's5', campaignId: 'camp-B', validationStatus: 'pending',  fraudStatus: 'safe' },
      { $id: 's6', campaignId: 'camp-B', validationStatus: 'rejected', fraudStatus: 'safe' },
    ];
    mockListDocuments.mockResolvedValueOnce({ documents: submissions, total: submissions.length });

    const { getSubmissionCountsFromAppwrite } = await import('@/services/umkm/umkm-appwrite.service');
    const res = await getSubmissionCountsFromAppwrite(['camp-A', 'camp-B']);

    expect(res.success).toBe(true);
    // camp-A: 2 pending, 2 valid (s3+s4), 1 dispute (s4 fraudStatus=flagged)
    expect(res.data!['camp-A']).toEqual({ pending: 2, valid: 2, dispute: 1 });
    // camp-B: 1 pending, 0 valid (rejected not approved), 0 dispute
    expect(res.data!['camp-B']).toEqual({ pending: 1, valid: 0, dispute: 0 });

    // CRITICAL: exactly ONE listDocuments call — no N+1 pattern
    expect(mockListDocuments).toHaveBeenCalledTimes(1);
  });

  it('campaign with no submissions is absent from result map', async () => {
    mockListDocuments.mockResolvedValueOnce({
      documents: [
        { $id: 's1', campaignId: 'camp-A', validationStatus: 'pending', fraudStatus: 'safe' },
      ],
      total: 1,
    });

    const { getSubmissionCountsFromAppwrite } = await import('@/services/umkm/umkm-appwrite.service');
    const res = await getSubmissionCountsFromAppwrite(['camp-A', 'camp-UNKNOWN']);

    expect(res.success).toBe(true);
    expect(res.data!['camp-A']).toEqual({ pending: 1, valid: 0, dispute: 0 });
    // camp-UNKNOWN had no submissions → not present in result
    expect(res.data!['camp-UNKNOWN']).toBeUndefined();

    // Still only ONE query issued
    expect(mockListDocuments).toHaveBeenCalledTimes(1);
  });
});
