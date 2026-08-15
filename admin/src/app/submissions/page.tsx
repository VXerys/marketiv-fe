"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CampaignSubmissionDomain, SubmissionStatus } from "@/features/admin/submissions/types";
import { getCampaignSubmissions } from "@/features/admin/submissions/services/submission.service";
import { SubmissionTable } from "@/features/admin/submissions/components/SubmissionTable";
import { SubmissionCard } from "@/features/admin/submissions/components/SubmissionCard";
import { SubmissionReviewDialog } from "@/features/admin/submissions/components/SubmissionReviewDialog";
import { canLoadProtectedAdminData, useAdminAuth } from "@/components/admin/AdminAuthBoundary";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  RefreshCw,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

export default function AdminSubmissionsPage() {
  const { state } = useAdminAuth();
  const [allSubmissions, setAllSubmissions] = useState<CampaignSubmissionDomain[]>([]);
  const [activeTab, setActiveTab] = useState<SubmissionStatus | "all">("pending");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<CampaignSubmissionDomain | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!canLoadProtectedAdminData(state)) return;
    setIsLoading(true);
    try {
      const data = await getCampaignSubmissions("all");
      setAllSubmissions(data);
      setLoadError(null);
    } catch (err) {
      console.error("Gagal memuat submission:", err);
      setLoadError(err instanceof Error ? err.message : "Gagal memuat submission.");
    } finally {
      setIsLoading(false);
    }
  }, [state]);

  useEffect(() => {
    if (canLoadProtectedAdminData(state)) void Promise.resolve().then(loadData);
  }, [loadData, state]);

  const handleOpenReview = (submission: CampaignSubmissionDomain) => {
    setSelectedSubmission(submission);
    setIsModalOpen(true);
  };

  const handleReviewSuccess = (submissions: CampaignSubmissionDomain[]) => {
    setAllSubmissions(submissions);
    setLoadError(null);
  };

  const pendingCount = allSubmissions.filter((s) => s.status === "pending").length;
  const approvedCount = allSubmissions.filter((s) => s.status === "approved").length;
  const rejectedCount = allSubmissions.filter((s) => s.status === "rejected").length;

  // Filter submissions by tab and search query
  const filteredSubmissions = allSubmissions.filter((item) => {
    const matchesTab = activeTab === "all" || item.status === activeTab;
    if (!matchesTab) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.creator.name.toLowerCase().includes(q) ||
      item.creator.username.toLowerCase().includes(q) ||
      item.campaign.title.toLowerCase().includes(q) ||
      item.umkm.name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Dark Navy Modern Header with Ambient Glow */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c172b] via-[#111e38] to-[#182747] p-6 text-white shadow-xl shadow-slate-900/10 border border-slate-800">
        {/* Background Ambient Glow */}
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[#f97316]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/10 px-3 py-1 text-xs font-extrabold text-[#f97316] border border-orange-500/30 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Auditing Queue • Manual View Verification</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campaign Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed font-normal">
              Validasi postingan TikTok dari Content Creator secara manual untuk mengunci verified views dan pelepasan reward Pay-Per-View.
            </p>
          </div>

          <Button
            onClick={loadData}
            disabled={isLoading}
            className="h-11 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 gap-2 text-xs font-extrabold px-5 rounded-2xl shadow-sm self-start md:self-auto transition-all cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-orange-400 ${isLoading ? "animate-spin" : ""}`} />
            <span>Segarkan Data</span>
          </Button>
        </div>
      </div>

      {/* Segmented Control Bar: Filter Tabs & Interactive Search */}
      <Card className="p-4 bg-[#fffdf8] border-stone-200/90 shadow-xs rounded-2xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Segmented Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "pending"
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "bg-stone-100/80 text-stone-700 hover:bg-stone-200/70"
              }`}
            >
              <Clock className="h-3.5 w-3.5 text-orange-400" />
              <span>Menunggu Validasi</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${
                  activeTab === "pending"
                    ? "bg-[#f97316] text-white shadow-2xs"
                    : "bg-orange-100 text-[#c2410c]"
                }`}
              >
                {isLoading ? "—" : pendingCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("approved")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "approved"
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "bg-stone-100/80 text-stone-700 hover:bg-stone-200/70"
              }`}
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Disetujui</span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800">
                {isLoading ? "—" : approvedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("rejected")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "rejected"
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "bg-stone-100/80 text-stone-700 hover:bg-stone-200/70"
              }`}
            >
              <XCircle className="h-3.5 w-3.5 text-red-400" />
              <span>Ditolak</span>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-black text-red-800">
                {isLoading ? "—" : rejectedCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-[#0c172b] text-white shadow-md shadow-[#0c172b]/15"
                  : "bg-stone-100/80 text-stone-700 hover:bg-stone-200/70"
              }`}
            >
              <Filter className="h-3.5 w-3.5 text-stone-400" />
              <span>Semua Status</span>
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-black text-stone-700">
                {isLoading ? "—" : allSubmissions.length}
              </span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Cari Kreator / Campaign / UMKM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-9 text-xs font-semibold text-stone-800 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Submissions Content Table or Cards */}
      {isLoading ? (
        <Card className="flex h-72 flex-col items-center justify-center gap-3 text-stone-400 bg-[#fffdf8] border-stone-200/90 rounded-2xl shadow-xs">
          <Loader2 className="h-8 w-8 animate-spin text-[#f97316]" />
          <span className="text-xs font-bold text-stone-600">Memuat data submission...</span>
        </Card>
      ) : loadError ? (
        <Card className="flex h-72 flex-col items-center justify-center gap-3 text-red-700 bg-red-50 border-red-200 rounded-2xl shadow-xs">
          <XCircle className="h-10 w-10 text-red-400" />
          <p className="text-base font-extrabold">Submission gagal dimuat</p>
          <p className="text-xs text-red-600">{loadError}</p>
        </Card>
      ) : filteredSubmissions.length === 0 ? (
        <Card className="flex h-72 flex-col items-center justify-center gap-3 text-stone-400 bg-[#fffdf8] border-stone-200/90 rounded-2xl shadow-xs">
          <CheckCircle2 className="h-10 w-10 text-stone-300" />
          <p className="text-base font-extrabold text-stone-700">Tidak ada submission ditemukan</p>
          <p className="text-xs text-stone-500">
            Belum ada data submission pada kategori ini.
          </p>
        </Card>
      ) : (
        <>
          {/* Desktop & Tablet Table View */}
          <div className="hidden md:block">
            <SubmissionTable
              submissions={filteredSubmissions}
              onSelectSubmission={handleOpenReview}
            />
          </div>

          {/* Mobile Stacked Card View */}
          <div className="block md:hidden space-y-3">
            {filteredSubmissions.map((item) => (
              <SubmissionCard
                key={item.id}
                item={item}
                onSelectSubmission={handleOpenReview}
              />
            ))}
          </div>
        </>
      )}

      {/* Audit Review Modal */}
      <SubmissionReviewDialog
        submission={selectedSubmission}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
}
