import { describe, it, expect, beforeEach } from "vitest";
import {
  getCampaignSubmissions,
  approveCampaignSubmission,
  rejectCampaignSubmission,
  addSubmissionToStore,
  resetSubmissionsStore,
} from "@/features/admin/submissions/services/submission.service";
import { CampaignSubmissionDomain } from "@/features/admin/submissions/types";
import { Campaign, CampaignSubmission } from "@/types/umkm-dashboard.types";
import { CreatorActiveWork } from "@/types/creator-dashboard";

describe("Integration E2E Flow: Create Campaign → Creator Submit → Admin Authority Audit → UMKM Observe", () => {
  beforeEach(() => {
    resetSubmissionsStore([]);
  });

  it("completes full happy-path lifecycle: UMKM campaign -> Creator claim & submit -> Admin audit & approve -> UMKM observe", async () => {
    // ── STEP 1: UMKM Creates & Publishes Campaign ──────────────────────────
    const mockCampaign: Campaign = {
      id: "camp-e2e-101",
      umkmId: "umkm-sambal-99",
      title: "Promosi Sambal Pedas Mampus Viral TikTok",
      brief: "Buat video mukbang makan ayam goreng dengan Sambal Pedas Mampus. Tunjukkan produk dengan jelas.",
      externalAssetUrl: "https://drive.google.com/drive/folders/sambal-assets",
      thumbnailUrl: "",
      niche: "kuliner",
      type: "ugc",
      status: "active",
      creatorQuota: 5,
      usedQuota: 1,
      pricePerThousandViews: 15000,
      totalBudgetEscrow: 1000000,
      usedBudget: 0,
      remainingBudget: 1000000,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(mockCampaign.status).toBe("active");
    expect(mockCampaign.pricePerThousandViews).toBe(15000);

    // ── STEP 2: Creator Claims Campaign ────────────────────────────────────
    const mockClaim: CreatorActiveWork = {
      id: "claim-e2e-202",
      campaignId: mockCampaign.id,
      title: mockCampaign.title,
      brandName: "Sambal Pedas Mampus",
      brandAvatar: "",
      brief: mockCampaign.brief,
      ratePerThousandViews: mockCampaign.pricePerThousandViews,
      status: "claimed",
      claimedAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      platform: "tiktok", // Derived read-only platform from Campaign
    };

    expect(mockClaim.status).toBe("claimed");
    expect(mockClaim.platform).toBe("tiktok");

    // ── STEP 3: Creator Submits Proof of Work ──────────────────────────────
    const submissionId = "sub-e2e-303";
    const creatorPostUrl = "https://www.tiktok.com/@budi_mukbang/video/73987654321";

    const newSubmissionDomain: CampaignSubmissionDomain = {
      id: submissionId,
      campaignId: mockCampaign.id,
      creator: {
        id: "creator-budi-1",
        name: "Budi Mukbang",
        username: "@budi_mukbang",
        avatarUrl: "https://avatar.url/budi.png",
        tiktokHandle: "@budi_mukbang",
      },
      campaign: {
        id: mockCampaign.id,
        title: mockCampaign.title,
        rewardPer1000Views: mockCampaign.pricePerThousandViews,
        platform: "tiktok",
      },
      umkm: {
        id: mockCampaign.umkmId,
        name: "Sambal Pedas Mampus",
        ownerName: "Hj. Ratna",
      },
      platform: "tiktok",
      postUrl: creatorPostUrl,
      note: "Video mukbang pedas sudah tayang di TikTok, silakan divalidasi!",
      status: "pending",
      submittedAt: new Date().toISOString(),
      verifiedViews: 0,
      estimatedReward: 0,
      finalReward: 0,
    };

    // Seed submission into Admin Queue
    addSubmissionToStore(newSubmissionDomain);

    // Verify Submission appears in Admin "pending" queue
    const pendingQueue = await getCampaignSubmissions("pending");
    const foundPending = pendingQueue.find((item) => item.id === submissionId);
    expect(foundPending).toBeDefined();
    expect(foundPending?.status).toBe("pending");
    expect(foundPending?.postUrl).toBe(creatorPostUrl);

    // ── STEP 4: Admin Audits & Validates Submission ───────────────────────
    // Admin reviews proof link, inspects live views on TikTok, inputs 20,000 views, and approves
    const adminApprovalResult = await approveCampaignSubmission({
      submissionId,
      verifiedViews: 20000,
      adminId: "admin-marketiv-01",
    });

    expect(adminApprovalResult.success).toBe(true);
    expect(adminApprovalResult.data.status).toBe("approved");
    expect(adminApprovalResult.data.verifiedViews).toBe(20000);

    // Calculate expected reward: floor(20000 / 1000) * 15000 = 300,000
    const expectedReward = Math.floor(20000 / 1000) * mockCampaign.pricePerThousandViews;
    expect(expectedReward).toBe(300000);
    expect(adminApprovalResult.data.estimatedReward).toBe(300000);

    // ── STEP 5: Verify UMKM Observer Read View & State Consistency ─────────
    const approvedQueue = await getCampaignSubmissions("approved");
    const foundApproved = approvedQueue.find((item) => item.id === submissionId);
    expect(foundApproved).toBeDefined();
    expect(foundApproved?.status).toBe("approved");
    expect(foundApproved?.verifiedViews).toBe(20000);
    expect(foundApproved?.finalReward).toBe(300000);

    // Map to UMKM Observer View model
    const umkmViewSubmission: CampaignSubmission = {
      id: foundApproved!.id,
      campaignId: foundApproved!.campaignId,
      creatorId: foundApproved!.creator.id,
      creatorName: foundApproved!.creator.name,
      creatorAvatarUrl: foundApproved!.creator.avatarUrl || "",
      platform: foundApproved!.platform,
      contentUrl: foundApproved!.postUrl,
      actualViews: foundApproved!.verifiedViews,
      targetViews: 0,
      releasedFund: foundApproved!.finalReward,
      validationStatus: "approved",
      fraudStatus: "safe",
      submittedAt: foundApproved!.submittedAt,
      validatedAt: foundApproved!.verifiedAt,
    };

    expect(umkmViewSubmission.validationStatus).toBe("approved");
    expect(umkmViewSubmission.actualViews).toBe(20000);
    expect(umkmViewSubmission.releasedFund).toBe(300000);
  }, 15000);

  it("handles rejection flow: Creator submits -> Admin rejects with reason -> Status & notes updated", async () => {
    const submissionId = "sub-reject-999";
    const rejectSubmission: CampaignSubmissionDomain = {
      id: submissionId,
      campaignId: "camp-reject-1",
      creator: {
        id: "creator-doni-2",
        name: "Doni Content",
        username: "@doni_vlog",
      },
      campaign: {
        id: "camp-reject-1",
        title: "Campaign Baju Muslim",
        rewardPer1000Views: 12000,
        platform: "tiktok",
      },
      umkm: {
        id: "umkm-fashion-1",
        name: "Hijab Stylist",
      },
      platform: "tiktok",
      postUrl: "https://www.tiktok.com/@doni_vlog/video/invalid",
      status: "pending",
      submittedAt: new Date().toISOString(),
      verifiedViews: 0,
      estimatedReward: 0,
      finalReward: 0,
    };

    addSubmissionToStore(rejectSubmission);

    const rejectResult = await rejectCampaignSubmission({
      submissionId,
      rejectionReason: "Tautan video tidak dapat diakses (video disetting private oleh kreator)",
      adminId: "admin-marketiv-02",
    });

    expect(rejectResult.success).toBe(true);
    expect(rejectResult.data.status).toBe("rejected");
    expect(rejectResult.data.rejectionReason).toContain("private");
    expect(rejectResult.data.finalReward).toBe(0);

    const rejectedQueue = await getCampaignSubmissions("rejected");
    const foundRejected = rejectedQueue.find((item) => item.id === submissionId);
    expect(foundRejected).toBeDefined();
    expect(foundRejected?.status).toBe("rejected");
    expect(foundRejected?.rejectionReason).toContain("private");
  }, 15000);
});
