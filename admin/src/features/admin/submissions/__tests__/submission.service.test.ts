import { describe, it, expect, beforeEach } from "vitest";
import {
  getCampaignSubmissions,
  approveCampaignSubmission,
  rejectCampaignSubmission,
  addSubmissionToStore,
  resetSubmissionsStore,
} from "@/features/admin/submissions/services/submission.service";
import { CampaignSubmissionDomain } from "@/features/admin/submissions/types";

describe("Admin Submissions Service: Approval & Rejection Flow", () => {
  beforeEach(() => {
    resetSubmissionsStore([]);
  });

  it("completes full happy-path lifecycle: Claim & Submit -> Admin Audit & Approve -> Verify State", async () => {
    const submissionId = "sub-e2e-303";
    const creatorPostUrl = "https://www.tiktok.com/@budi_mukbang/video/73987654321";

    const newSubmissionDomain: CampaignSubmissionDomain = {
      id: submissionId,
      campaignId: "camp-e2e-101",
      creator: {
        id: "creator-budi-1",
        name: "Budi Mukbang",
        username: "@budi_mukbang",
        avatarUrl: "https://avatar.url/budi.png",
        tiktokHandle: "@budi_mukbang",
      },
      campaign: {
        id: "camp-e2e-101",
        title: "Promosi Sambal Pedas Mampus",
        rewardPer1000Views: 15000,
        platform: "tiktok",
      },
      umkm: {
        id: "umkm-sambal-99",
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
    const expectedReward = Math.floor(20000 / 1000) * 15000;
    expect(expectedReward).toBe(300000);
    expect(adminApprovalResult.data.estimatedReward).toBe(300000);

    // Verify Approved Queue
    const approvedQueue = await getCampaignSubmissions("approved");
    const foundApproved = approvedQueue.find((item) => item.id === submissionId);
    expect(foundApproved).toBeDefined();
    expect(foundApproved?.status).toBe("approved");
    expect(foundApproved?.verifiedViews).toBe(20000);
    expect(foundApproved?.finalReward).toBe(300000);
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
