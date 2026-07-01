"use client";

import { useEffect, useState } from "react";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { CampaignsHeader } from "./CampaignsHeader";
import { CampaignSummaryCards } from "./CampaignSummaryCards";
import { CampaignToolbar } from "./CampaignToolbar";
import { CampaignCard } from "./CampaignCard";
import { CampaignTable } from "./CampaignTable";
import { CampaignEmptyState } from "./CampaignEmptyState";
import { CampaignErrorState } from "./CampaignErrorState";
import { CampaignListSkeleton, CampaignSummaryCardsSkeleton } from "./CampaignListSkeleton";
import { filterCampaigns } from "@/lib/umkm-filters";
import { DashboardCard, DashboardButton } from "../shared";
import {
  getCampaigns,
  getDashboardSummary,
  getCampaignSubmissions,
  getUmkmProfile,
} from "@/services/umkm/umkm-dashboard.service";
import {
  Campaign,
  UmkmDashboardSummary,
  UmkmProfile,
} from "@/types/umkm-dashboard.types";

// Modals
import { CancelCampaignModal } from "./modals/CancelCampaignModal";
import { DuplicateCampaignModal } from "./modals/DuplicateCampaignModal";
import { ExportReportModal } from "./modals/ExportReportModal";

export function CampaignsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core Data
  const [profile, setProfile] = useState<UmkmProfile | null>(null);
  const [summary, setSummary] = useState<UmkmDashboardSummary | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<
    Record<string, { pending: number; valid: number; dispute: number }>
  >({});

  // Toolbar & filter states
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [sortBy, setSortBy] = useState("latest");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");

  // Modal states
  const [activeCancelCampaign, setActiveCancelCampaign] = useState<Campaign | null>(null);
  const [activeDuplicateCampaign, setActiveDuplicateCampaign] = useState<Campaign | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Toast / notification feedback simulator
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch profile & summary
      const [profileRes, summaryRes, campaignsRes] = await Promise.all([
        getUmkmProfile(),
        getDashboardSummary(),
        getCampaigns(),
      ]);

      if (profileRes.success && profileRes.data) {
        setProfile(profileRes.data);
      }
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }

      if (campaignsRes.success && campaignsRes.data) {
        setCampaigns(campaignsRes.data);

        // Fetch submissions for all campaigns to calculate counts
        const subCounts: typeof submissionCounts = {};
        await Promise.all(
          campaignsRes.data.map(async (c) => {
            const subRes = await getCampaignSubmissions(c.id);
            if (subRes.success && subRes.data) {
              const pending = subRes.data.filter((s) => s.validationStatus === "pending").length;
              const valid = subRes.data.filter((s) => s.validationStatus === "valid").length;
              const dispute = subRes.data.filter((s) => s.validationStatus === "dispute").length;
              subCounts[c.id] = { pending, valid, dispute };
            }
          })
        );
        setSubmissionCounts(subCounts);
      } else {
        setError(campaignsRes.error || "Gagal memuat campaign.");
      }
    } catch (err: any) {
      setError(err?.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClearFilters = () => {
    setSearch("");
    setSelectedStatus("all");
    setSelectedNiche("all");
    setSortBy("latest");
  };

  const hasActiveFilters = search !== "" || selectedStatus !== "all" || selectedNiche !== "all";

  // Filter and sort campaign list in memory
  const processedCampaigns = filterCampaigns(campaigns, {
    search,
    status: selectedStatus,
    niche: selectedNiche,
    sortBy,
  });

  // Modal actions
  const handleCancelConfirm = (reason: string) => {
    if (!activeCancelCampaign) return;
    // Simulate campaign cancellation locally
    setCampaigns(
      campaigns.map((c) =>
        c.id === activeCancelCampaign.id
          ? { ...c, status: "cancelled" as const }
          : c
      )
    );
    showToast(`Campaign "${activeCancelCampaign.title}" berhasil dibatalkan.`);
  };

  const handleDuplicateConfirm = (newTitle: string) => {
    if (!activeDuplicateCampaign) return;
    // Simulate dupliacte campaign creation
    const newCamp: Campaign = {
      ...activeDuplicateCampaign,
      id: `campaign_new_${Date.now()}`,
      title: newTitle,
      status: "draft" as const,
      usedQuota: 0,
      usedBudget: 0,
      totalViews: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCampaigns([newCamp, ...campaigns]);
    setSubmissionCounts({
      ...submissionCounts,
      [newCamp.id]: { pending: 0, valid: 0, dispute: 0 },
    });
    showToast(`Campaign baru "${newTitle}" berhasil dibuat sebagai Draft.`);
  };

  const businessName = profile?.businessName || "Dapur Sehat Sukabumi";

  return (
    <UmkmDashboardChrome businessName={businessName}>
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
        
        {/* Toast Notification Banner */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 bg-neutral-900 text-white text-xs font-bold py-3 px-5 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300 flex items-center gap-2">
            <svg className="w-4.5 h-4.5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Header */}
        <CampaignsHeader
          onCreateCampaignClick={() => showToast("Fitur Buat Campaign Baru diarahkan ke Wizard Pembuatan.")}
          onExportReportClick={() => setIsExportModalOpen(true)}
        />

        {/* Summary Cards */}
        {loading ? (
          <CampaignSummaryCardsSkeleton />
        ) : summary ? (
          <CampaignSummaryCards summary={summary} />
        ) : null}

        {/* Toolbar */}
        <CampaignToolbar
          search={search}
          onSearchChange={setSearch}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedNiche={selectedNiche}
          onNicheChange={setSelectedNiche}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onClearFilters={handleClearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* List Content */}
        {loading ? (
          <CampaignListSkeleton viewMode={viewMode} />
        ) : error ? (
          <CampaignErrorState onRetry={loadData} errorMsg={error} />
        ) : campaigns.length === 0 ? (
          <CampaignEmptyState onCreateClick={() => showToast("Buka wizard pembuatan campaign baru.")} />
        ) : processedCampaigns.length === 0 ? (
          <DashboardCard variant="default" className="p-8 text-center bg-white">
            <h4 className="text-base font-bold text-text-primary mb-1">Campaign tidak ditemukan</h4>
            <p className="text-xs text-text-muted mb-4">Coba ubah kata kunci pencarian atau bersihkan filter.</p>
            <DashboardButton variant="outline" size="sm" onClick={handleClearFilters}>
              Reset Filter
            </DashboardButton>
          </DashboardCard>
        ) : viewMode === "table" ? (
          <CampaignTable
            campaigns={processedCampaigns}
            submissionCounts={submissionCounts}
            onDuplicate={setActiveDuplicateCampaign}
            onCancel={setActiveCancelCampaign}
            onExport={() => setIsExportModalOpen(true)}
            onEdit={(camp) => showToast(`Melanjutkan edit Draft: ${camp.title}`)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedCampaigns.map((camp) => {
              const counts = submissionCounts[camp.id] || { pending: 0, valid: 0, dispute: 0 };
              return (
                <CampaignCard
                  key={camp.id}
                  campaign={camp}
                  pendingCount={counts.pending}
                  validCount={counts.valid}
                  disputeCount={counts.dispute}
                  onDuplicate={() => setActiveDuplicateCampaign(camp)}
                  onCancel={() => setActiveCancelCampaign(camp)}
                  onExport={() => setIsExportModalOpen(true)}
                  onEdit={() => showToast(`Melanjutkan edit Draft: ${camp.title}`)}
                />
              );
            })}
          </div>
        )}

        {/* Modals Mounting */}
        {activeCancelCampaign && (
          <CancelCampaignModal
            isOpen={!!activeCancelCampaign}
            onClose={() => setActiveCancelCampaign(null)}
            campaignTitle={activeCancelCampaign.title}
            onConfirm={handleCancelConfirm}
          />
        )}

        {activeDuplicateCampaign && (
          <DuplicateCampaignModal
            isOpen={!!activeDuplicateCampaign}
            onClose={() => setActiveDuplicateCampaign(null)}
            originalTitle={activeDuplicateCampaign.title}
            onConfirm={handleDuplicateConfirm}
          />
        )}

        {isExportModalOpen && (
          <ExportReportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}

      </div>
    </UmkmDashboardChrome>
  );
}
