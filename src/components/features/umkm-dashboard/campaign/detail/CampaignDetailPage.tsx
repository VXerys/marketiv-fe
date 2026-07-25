"use client";

import { useCallback, useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "../../shared/UmkmPageWrapper";
import { CampaignDetailHeader } from "./CampaignDetailHeader";
import { CampaignOverviewCards } from "./CampaignOverviewCards";
import { CampaignWorkspaceCard } from "./CampaignWorkspaceCard";
import { CampaignQuickActionsCard } from "./CampaignQuickActionsCard";
import { CampaignHealthChecklistCard } from "./CampaignHealthChecklistCard";
import { CampaignBudgetCard } from "./CampaignBudgetCard";
import { CampaignSubmissionSection } from "./CampaignSubmissionSection";
import { CampaignActivityTimeline } from "./CampaignActivityTimeline";
import { CampaignDetailSkeleton } from "./CampaignDetailSkeleton";
import { CampaignNotFoundState } from "./CampaignNotFoundState";
import {
  getCampaignById,
  getCampaignSubmissions,
  getUmkmProfile,
  updateCampaignStatus,
} from "@/services/umkm/umkm-dashboard.service";
import {
  Campaign,
  UmkmProfile,
  CampaignSubmission,
  SubmissionStatus,
} from "@/types/umkm-dashboard.types";

// Modals
import { CancelCampaignModal } from "../modals/CancelCampaignModal";
import { ExportReportModal } from "../modals/ExportReportModal";
import { ReviewSubmissionModal } from "../modals/ReviewSubmissionModal";
import { SubmissionDetailModal } from "../modals/SubmissionDetailModal";

import { toast } from "sonner";

interface CampaignDetailPageProps {
  campaignId: string;
}

export function CampaignDetailPage({ campaignId }: CampaignDetailPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data
  const [profile, setProfile] = useState<UmkmProfile | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);

  // Modals visibility states
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activeReviewSubmission, setActiveReviewSubmission] = useState<CampaignSubmission | null>(null);
  const [activeDetailSubmission, setActiveDetailSubmission] = useState<CampaignSubmission | null>(null);

  // Local feedback notification simulation via Sonner
  const showToast = (msg: string) => {
    toast.success(msg);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, campaignRes, submissionsRes] = await Promise.all([
        getUmkmProfile(),
        getCampaignById(campaignId),
        getCampaignSubmissions(campaignId),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }

      if (campaignRes.success && campaignRes.data) {
        setCampaign(campaignRes.data);
      } else {
        setError(campaignRes.error || "Campaign tidak ditemukan.");
      }

      if (submissionsRes.success && submissionsRes.data) {
        setSubmissions(submissionsRes.data);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle audit status updates locally
  const handleReviewConfirm = (status: SubmissionStatus, notes: string) => {
    if (!activeReviewSubmission || !campaign) return;

    // Estimate released funds locally if approved (e.g. rate per 1000 views)
    let releasedFund = 0;
    if (status === "approved") {
      releasedFund = Math.round(
        (activeReviewSubmission.actualViews || 15000) *
          (campaign.pricePerThousandViews / 1000)
      );
    }

    // Update submissions list locally
    const updatedSubmissions = submissions.map((sub) =>
      sub.id === activeReviewSubmission.id
        ? {
            ...sub,
            validationStatus: status,
            releasedFund,
            validatedAt: new Date().toISOString(),
          }
        : sub
    );
    setSubmissions(updatedSubmissions);

    // Recompute total views & budget used for the campaign
    const totalViews = updatedSubmissions.reduce((sum, s) => sum + s.actualViews, 0);
    const usedBudget = updatedSubmissions
      .filter((s) => s.validationStatus === "approved")
      .reduce((sum, s) => sum + s.releasedFund, 0);

    setCampaign({
      ...campaign,
      totalViews,
      usedBudget,
    });

    const statusLabel = status === "approved" ? "Disetujui" : "Ditolak";
    showToast(`Ulasan oleh "${activeReviewSubmission.creatorName}" berhasil ${statusLabel}. Catatan: ${notes || "-"}`);
  };

  const handleCancelConfirm = async () => {
    if (!campaign) return;
    const target = campaign;
    const res = await updateCampaignStatus(target.id, "paused");
    if (res.success && res.data) {
      setCampaign(res.data);
      showToast(`Campaign "${target.title}" berhasil dijeda.`);
    } else {
      toast.error(res.error ?? "Gagal menjeda campaign.");
    }
  };

  if (loading) {
    return (
      <UmkmDashboardChrome businessName={profile?.businessName ?? ""}>
        <CampaignDetailSkeleton />
      </UmkmDashboardChrome>
    );
  }

  if (error || !campaign) {
    return (
      <UmkmDashboardChrome businessName={profile?.businessName ?? ""}>
        <CampaignNotFoundState />
      </UmkmDashboardChrome>
    );
  }

  const businessName = profile?.businessName ?? "";
  const pendingSubmissionsCount = submissions.filter((s) => s.validationStatus === "pending").length;

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <UmkmPageWrapper maxWidth={1440}>
        
        {/* Detail Header */}
        <CampaignDetailHeader
          campaign={campaign}
          onCancelClick={() => setIsCancelModalOpen(true)}
          onExportClick={() => setIsExportModalOpen(true)}
          onEditClick={() => showToast(`Buka wizard edit campaign: ${campaign.title}`)}
        />

        {/* Overview cards */}
        <CampaignOverviewCards
          campaign={campaign}
          pendingSubmissionsCount={pendingSubmissionsCount}
        />

        {/* Core details layout stacked and grouped */}
        <div className="space-y-6" id="campaign-detail-workspace">
          
          {/* Workspace Card (Full Width) */}
          <CampaignWorkspaceCard campaign={campaign} submissions={submissions} />
          
          {/* Submissions Section (Full Width) */}
          <div id="review-submissions-section">
            <CampaignSubmissionSection
              submissions={submissions}
              onReviewClick={setActiveReviewSubmission}
              onViewDetailsClick={setActiveDetailSubmission}
            />
          </div>

          {/* Secondary Grid (Balanced Columns) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Budget & Quick Actions */}
            <div className="space-y-6">
              <CampaignBudgetCard campaign={campaign} />
              <CampaignQuickActionsCard
                onCopyAsset={() => {
                  navigator.clipboard.writeText(campaign.externalAssetUrl);
                  showToast("Tautan folder aset berhasil disalin.");
                }}
                onExportReport={() => setIsExportModalOpen(true)}
                onViewEscrow={() => showToast("Membuka rekam transaksi escrow...")}
                onReviewPending={() => {
                  const element = document.getElementById("review-submissions-section");
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                hasPendingSubmissions={pendingSubmissionsCount > 0}
              />
            </div>

            {/* Right Column: Health Checklist & Activity Timeline */}
            <div className="space-y-6">
              <CampaignHealthChecklistCard
                campaign={campaign}
                pendingCount={pendingSubmissionsCount}
              />
              <CampaignActivityTimeline campaign={campaign} />
            </div>
          </div>

        </div>

        {/* Modals Mounting */}
        {isCancelModalOpen && (
          <CancelCampaignModal
            isOpen={isCancelModalOpen}
            onClose={() => setIsCancelModalOpen(false)}
            campaignTitle={campaign.title}
            onConfirm={handleCancelConfirm}
          />
        )}

        {isExportModalOpen && (
          <ExportReportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}

        {activeReviewSubmission && (
          <ReviewSubmissionModal
            isOpen={!!activeReviewSubmission}
            onClose={() => setActiveReviewSubmission(null)}
            submission={activeReviewSubmission}
            onConfirm={handleReviewConfirm}
          />
        )}

        {activeDetailSubmission && (
          <SubmissionDetailModal
            isOpen={!!activeDetailSubmission}
            onClose={() => setActiveDetailSubmission(null)}
            submission={activeDetailSubmission}
          />
        )}

      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
