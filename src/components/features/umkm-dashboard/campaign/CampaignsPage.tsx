"use client";

import { useCallback, useEffect, useState } from "react";
import { useStickyToolbar } from "@/hooks/useStickyToolbar";
import { UmkmDashboardChrome } from "@/components/features/dashboard/UmkmDashboardChrome";
import { UmkmPageWrapper } from "../shared/UmkmPageWrapper";
import { CampaignsHeader } from "./CampaignsHeader";
import { CampaignSummaryCards } from "./CampaignSummaryCards";
import { CampaignToolbar } from "./CampaignToolbar";
import { CampaignCard } from "./CampaignCard";
import { CampaignTable } from "./CampaignTable";
import { CampaignEmptyState } from "./CampaignEmptyState";
import { CampaignErrorState } from "./CampaignErrorState";
import { CampaignListSkeleton, CampaignSummaryCardsSkeleton } from "./CampaignListSkeleton";
import { filterCampaigns } from "@/lib/umkm-filters";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getCampaigns,
  getDashboardSummary,
  getCampaignSubmissions,
  getUmkmProfile,
  updateCampaignStatus,
  duplicateCampaign,
  deleteCampaignDraft,
  publishCampaign,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

import { toast } from "sonner";

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
  const { toolbarRef, isSticky: isToolbarSticky } = useStickyToolbar();

  // Modal states
  const [activeCancelCampaign, setActiveCancelCampaign] = useState<Campaign | null>(null);
  const [activeDeleteCampaign, setActiveDeleteCampaign] = useState<Campaign | null>(null);
  const [activeDuplicateCampaign, setActiveDuplicateCampaign] = useState<Campaign | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);



  // Toast / notification feedback simulator via Sonner
  const showToast = (msg: string) => {
    toast.success(msg);
  };

  const loadData = useCallback(async () => {
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
        const subCounts: Record<string, { pending: number; valid: number; dispute: number }> = {};
        await Promise.all(
          campaignsRes.data.map(async (c) => {
            const subRes = await getCampaignSubmissions(c.id);
            if (subRes.success && subRes.data) {
              const pending = subRes.data.filter((s) => s.validationStatus === "pending").length;
              const valid = subRes.data.filter((s) => s.validationStatus === "approved").length;
              const dispute = subRes.data.filter((s) => s.fraudStatus !== "safe").length;
              subCounts[c.id] = { pending, valid, dispute };
            }
          })
        );
        setSubmissionCounts(subCounts);
      } else {
        setError(campaignsRes.error || "Gagal memuat campaign.");
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan koneksi.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Count per status tab
  const statusCounts: Record<string, number> = {
    all: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    paused: campaigns.filter((c) => c.status === "paused").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
  };

  // Modal actions
  const handleCancelConfirm = async () => {
    if (!activeCancelCampaign) return;
    const target = activeCancelCampaign;
    const res = await updateCampaignStatus(target.id, "paused");
    if (res.success && res.data) {
      setCampaigns((prev) => prev.map((c) => (c.id === target.id ? res.data! : c)));
      showToast(`Campaign "${target.title}" berhasil dijeda.`);
    } else {
      toast.error(res.error ?? "Gagal menjeda campaign.");
    }
  };

  /**
   * Hapus draft. Baris dibuang dari state lokal, bukan loadData() penuh —
   * memuat ulang seluruh halaman berikut hitungan submission tiap campaign
   * (satu request per campaign) hanya untuk menghilangkan satu kartu itu boros.
   * Lempar ulang saat gagal supaya ConfirmDialog tetap terbuka.
   */
  const handleDeleteConfirm = async () => {
    if (!activeDeleteCampaign) return;
    const target = activeDeleteCampaign;
    const res = await deleteCampaignDraft(target.id);
    if (!res.success) {
      toast.error(res.error ?? "Gagal menghapus draft.");
      throw new Error(res.error ?? "Gagal menghapus draft.");
    }
    setCampaigns((prev) => prev.filter((c) => c.id !== target.id));
    setSubmissionCounts((prev) => {
      const next = { ...prev };
      delete next[target.id];
      return next;
    });
    showToast(`Draft "${target.title}" berhasil dihapus.`);
  };

  /**
   * Terbitkan draft yang dananya sudah masuk. Tidak pakai modal konfirmasi:
   * aksinya tidak merusak, dan service menolak sendiri bila `remainingBudget`
   * masih 0 — pesan penolakannya yang menjelaskan kenapa.
   */
  const handlePublish = async (target: Campaign) => {
    const res = await publishCampaign(target.id);
    if (!res.success || !res.data) {
      toast.error(res.error ?? "Gagal menerbitkan campaign.");
      return;
    }
    setCampaigns((prev) => prev.map((c) => (c.id === target.id ? res.data! : c)));
    showToast(`Campaign "${target.title}" kini tayang di Job Pool.`);
  };

  const handleDuplicateConfirm = async (
    newTitle: string,
    options: { copyBrief: boolean; copyBudget: boolean; copyAssets: boolean }
  ) => {
    if (!activeDuplicateCampaign) return;
    const res = await duplicateCampaign(activeDuplicateCampaign.id, newTitle, options);
    if (res.success && res.data) {
      const newCamp = res.data.campaign;
      setCampaigns((prev) => [newCamp, ...prev]);
      setSubmissionCounts((prev) => ({
        ...prev,
        [newCamp.id]: { pending: 0, valid: 0, dispute: 0 },
      }));
      if (res.data.warnings.length > 0) {
        res.data.warnings.forEach((w) => toast.warning(w));
      } else {
        showToast(`Campaign baru "${newTitle}" berhasil dibuat sebagai Draft.`);
      }
    } else {
      toast.error(res.error ?? "Gagal menduplikasi campaign.");
    }
  };

  const businessName = profile?.businessName || "Dapur Sehat Sukabumi";

  return (
    <UmkmDashboardChrome businessName={businessName}>
      {/* UmkmPageWrapper: responsive padding, 26px gap, 1440px max-width for campaign list */}
      <UmkmPageWrapper maxWidth={1440}>
        {/* Header */}
        <CampaignsHeader
          onCreateCampaignClick={() => {}}
          onExportReportClick={() => setIsExportModalOpen(true)}
        />

        {/* Summary Cards */}
        {loading ? (
          <CampaignSummaryCardsSkeleton />
        ) : summary ? (
          <CampaignSummaryCards summary={summary} />
        ) : null}

        {/* Toolbar — sticky direct grid child */}
        <div ref={toolbarRef} style={{ position: "sticky", top: 0, zIndex: 30 }}>
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
            statusCounts={statusCounts}
            isSticky={isToolbarSticky}
          />
        </div>

        {/* List Content */}
        {loading ? (
          <CampaignListSkeleton viewMode={viewMode} />
        ) : error ? (
          <CampaignErrorState onRetry={loadData} errorMsg={error} />
        ) : campaigns.length === 0 ? (
          <CampaignEmptyState onCreateClick={() => showToast("Buka wizard pembuatan campaign baru.")} />
        ) : processedCampaigns.length === 0 ? (
          <Card className="border border-border shadow-[var(--shadow-1)] bg-[var(--paper-2)] rounded-[var(--radius-3)]">
            <CardContent className="p-8 text-center">
              <h4 className="text-base font-bold text-ink-900 mb-1">Campaign tidak ditemukan</h4>
              <p className="text-xs text-ink-500 mb-4">Coba ubah kata kunci pencarian atau bersihkan filter.</p>
              <Button variant="outline" size="sm" onClick={handleClearFilters}>
                Reset Filter
              </Button>
            </CardContent>
          </Card>
        ) : viewMode === "table" ? (
          <CampaignTable
            campaigns={processedCampaigns}
            submissionCounts={submissionCounts}
            onDuplicate={setActiveDuplicateCampaign}
            onCancel={setActiveCancelCampaign}
            onDelete={setActiveDeleteCampaign}
            onPublish={handlePublish}
            onExport={() => setIsExportModalOpen(true)}
            onEdit={(camp) => showToast(`Melanjutkan edit Draft: ${camp.title}`)}
          />
        ) : (
          <div className="responsive-card-grid-2">
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
                  onDelete={() => setActiveDeleteCampaign(camp)}
                  onPublish={() => handlePublish(camp)}
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

        {activeDeleteCampaign && (
          <ConfirmDialog
            open={!!activeDeleteCampaign}
            onClose={() => setActiveDeleteCampaign(null)}
            title="Hapus Draft Campaign?"
            description={
              <>
                Draft{" "}
                <span className="font-semibold text-text-primary">
                  &quot;{activeDeleteCampaign.title}&quot;
                </span>{" "}
                akan dihapus permanen beserta brief dan aset yang menempel padanya.
              </>
            }
            note="Draft belum pernah tayang, jadi tidak ada klaim kreator atau dana escrow yang terpengaruh. Campaign yang sudah tayang tidak bisa dihapus — gunakan Jeda Campaign."
            acknowledgement="Saya mengerti draft ini tidak bisa dikembalikan."
            confirmLabel="Hapus Draft"
            onConfirm={handleDeleteConfirm}
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

      </UmkmPageWrapper>
    </UmkmDashboardChrome>
  );
}
