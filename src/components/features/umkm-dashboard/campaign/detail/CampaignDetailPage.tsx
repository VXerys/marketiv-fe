"use client";

import { useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
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
} from "@/services/umkm/umkm-dashboard.service";
import {
  Campaign,
  CampaignSubmission,
  SubmissionStatus,
  UmkmProfile,
} from "@/types/umkm-dashboard.types";

// Modals
import { CancelCampaignModal } from "../modals/CancelCampaignModal";
import { ExportReportModal } from "../modals/ExportReportModal";
import { ReviewSubmissionModal } from "../modals/ReviewSubmissionModal";
import { SubmissionDetailModal } from "../modals/SubmissionDetailModal";

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

  // Local feedback notification simulation
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
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
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [campaignId]);

  // Handle audit status updates locally
  const handleReviewConfirm = (status: SubmissionStatus, notes: string) => {
    if (!activeReviewSubmission || !campaign) return;

    // Estimate released funds locally if approved (e.g. rate per 1000 views)
    let releasedFund = 0;
    if (status === "valid") {
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
      .filter((s) => s.validationStatus === "valid")
      .reduce((sum, s) => sum + s.releasedFund, 0);

    setCampaign({
      ...campaign,
      totalViews,
      usedBudget,
    });

    const statusLabel =
      status === "valid" ? "Disetujui" : status === "fraud" ? "Ditandai Fraud" : "Disengketakan";
    showToast(`Ulasan oleh "${activeReviewSubmission.creatorName}" berhasil ${statusLabel}.`);
  };

  const handleCancelConfirm = () => {
    if (!campaign) return;
    setCampaign({
      ...campaign,
      status: "cancelled",
    });
    showToast(`Campaign "${campaign.title}" berhasil dibatalkan.`);
  };

  if (loading) {
    return (
      <UmkmDashboardChrome businessName="Memuat...">
        <CampaignDetailSkeleton />
      </UmkmDashboardChrome>
    );
  }

  if (error || !campaign) {
    return (
      <UmkmDashboardChrome businessName="Tidak Ditemukan">
        <CampaignNotFoundState />
      </UmkmDashboardChrome>
    );
  }

  const businessName = profile?.businessName || "Dapur Sehat Sukabumi";
  const pendingSubmissionsCount = submissions.filter((s) => s.validationStatus === "pending").length;

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 pb-32 overflow-y-auto relative">
        
        {/* Toast Toast simulation */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

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

        {/* Core details layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="campaign-detail-workspace">
          
          {/* Left panel: workspace & submissions */}
          <div className="lg:col-span-8 space-y-6">
            <CampaignWorkspaceCard campaign={campaign} submissions={submissions} />
            <div id="review-submissions-section">
              <CampaignSubmissionSection
                submissions={submissions}
                onReviewClick={setActiveReviewSubmission}
                onViewDetailsClick={setActiveDetailSubmission}
              />
            </div>
          </div>

          {/* Right panel: assets, budget, history */}
          <div className="lg:col-span-4 space-y-6">
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
            <CampaignHealthChecklistCard
              campaign={campaign}
              pendingCount={pendingSubmissionsCount}
            />
            <div className="mb-24">
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

      </div>
    </UmkmDashboardChrome>
  );
}
