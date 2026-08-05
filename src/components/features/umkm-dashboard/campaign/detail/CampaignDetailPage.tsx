"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  reviewSubmission,
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
  const router = useRouter();
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

  /**
   * Setujui / tolak submission.
   *
   * Reward TIDAK dihitung di sini. Sebelumnya nilainya dikarang di klien —
   * termasuk fallback `|| 15000` views yang membuat angka rupiah muncul dari
   * ketiadaan. Yang menghitung adalah `calculate-campaign-reward`, yang menyala
   * pada update `campaign_submissions` dan menulis `spentAmount` /
   * `remainingBudget` campaign sendiri.
   *
   * Karena Function itu berjalan asinkron, angka campaign dibaca ulang dari
   * server alih-alih ditebak lokal — dengan jeda singkat supaya Function sempat
   * selesai. Kalau belum sempat, angkanya menyusul di refresh berikutnya.
   */
  const handleReviewConfirm = async (status: SubmissionStatus, views: number, notes?: string) => {
    if (!activeReviewSubmission || !campaign) return;
    if (status === "pending") return;

    const target = activeReviewSubmission;
    const res = await reviewSubmission({
      submissionId: target.id,
      status,
      views,
      notes,
    });

    if (!res.success) {
      toast.error(res.error ?? "Gagal menyimpan hasil review.");
      throw new Error(res.error ?? "Gagal menyimpan hasil review.");
    }

    setSubmissions((prev) =>
      prev.map((sub) =>
        sub.id === target.id
          ? {
              ...sub,
              validationStatus: status,
              actualViews: status === "approved" ? views : sub.actualViews,
            }
          : sub
      )
    );

    const statusLabel = status === "approved" ? "disetujui" : "ditolak";
    showToast(`Submission dari "${target.creatorName}" berhasil ${statusLabel}.`);

    // Beri ruang untuk calculate-campaign-reward sebelum membaca angka baru.
    setTimeout(() => {
      loadData();
    }, 2500);
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

  /**
   * CTA utama campaign paused → aktifkan kembali (bukan edit).
   * Guard status ada di backend — kalau sudah aktif, server menolak.
   */
  const handleResumeFromPause = async () => {
    if (!campaign) return;
    const res = await updateCampaignStatus(campaign.id, "active");
    if (res.success && res.data) {
      setCampaign(res.data);
      showToast(`Campaign "${campaign.title}" berhasil diaktifkan kembali.`);
    } else {
      toast.error(res.error ?? "Gagal mengaktifkan campaign.");
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
          onEditClick={
            campaign.status === "paused"
              ? handleResumeFromPause
              : () => router.push(`/dashboard/umkm/campaign/${campaign.id}/edit`)
          }
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
            filename={`Laporan_${campaign?.title?.replace(/\s+/g, "_") ?? "Campaign"}_Marketiv`}
            rows={submissions.map((s) => ({
              "ID Submission": s.id,
              "Kreator": s.creatorName,
              "Platform": s.platform,
              "URL Konten": s.contentUrl,
              "Views": s.actualViews,
              "Status": s.validationStatus,
              "Fraud Status": s.fraudStatus,
              "Dana Dicairkan (Rp)": s.releasedFund,
              "Dikirim": s.submittedAt,
              "Divalidasi": s.validatedAt ?? "-",
            }))}
          />
        )}

        {activeReviewSubmission && (
          <ReviewSubmissionModal
            isOpen={!!activeReviewSubmission}
            onClose={() => setActiveReviewSubmission(null)}
            submission={activeReviewSubmission}
            ratePerThousandViews={campaign?.pricePerThousandViews ?? 0}
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
