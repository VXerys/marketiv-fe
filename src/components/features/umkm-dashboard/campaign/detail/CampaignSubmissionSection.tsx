"use client";

import { useState } from "react";
import { CampaignSubmission, SubmissionStatus } from "@/types/umkm-dashboard.types";
import { CampaignSubmissionCard } from "./CampaignSubmissionCard";
import { DashboardCard, DashboardBadge } from "../../shared";

interface CampaignSubmissionSectionProps {
  submissions: CampaignSubmission[];
  onReviewClick: (sub: CampaignSubmission) => void;
  onViewDetailsClick: (sub: CampaignSubmission) => void;
}

export function CampaignSubmissionSection({
  submissions,
  onReviewClick,
  onViewDetailsClick,
}: CampaignSubmissionSectionProps) {
  const [filterTab, setFilterTab] = useState<"all" | SubmissionStatus>("all");

  const filteredSubmissions =
    filterTab === "all"
      ? submissions
      : submissions.filter((s) => s.validationStatus === filterTab);

  // Tabs layout configuration
  const tabs: { label: string; value: "all" | SubmissionStatus; count: number }[] = [
    { label: "Semua", value: "all", count: submissions.length },
    {
      label: "Pending",
      value: "pending",
      count: submissions.filter((s) => s.validationStatus === "pending").length,
    },
    {
      label: "Valid",
      value: "valid",
      count: submissions.filter((s) => s.validationStatus === "valid").length,
    },
    {
      label: "Fraud",
      value: "fraud",
      count: submissions.filter((s) => s.validationStatus === "fraud").length,
    },
    {
      label: "Sengketa (Dispute)",
      value: "dispute",
      count: submissions.filter((s) => s.validationStatus === "dispute").length,
    },
  ];

  return (
    <DashboardCard variant="default">
      <div className="p-6 border-b border-border-soft space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
              Review Bukti Tayang
            </h3>
            <p className="text-xs text-text-muted">
              Pantau URL konten kreator dan validasi hasil pekerjaan.
            </p>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary-soft/10 px-2.5 py-1 rounded-md shrink-0">
            {submissions.length} Submission
          </span>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 w-full">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterTab(tab.value)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === tab.value
                  ? "bg-primary text-white shadow-xs"
                  : "bg-neutral-50 text-text-secondary hover:bg-neutral-100 border border-border-soft/60"
              }`}
            >
              <span>{tab.label}</span>
              <DashboardBadge
                type="count"
                className={filterTab === tab.value ? "bg-white/20 text-white border-transparent" : "bg-neutral-200/80 text-text-secondary"}
              >
                {tab.count}
              </DashboardBadge>
            </button>
          ))}
        </div>
      </div>
      <div className="p-6">
        
        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="text-center py-10">
            <svg className="w-10 h-10 mx-auto text-neutral-300 mb-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h5 className="text-xs font-bold text-text-primary mb-0.5">Belum ada submission</h5>
            <p className="text-[10px] text-text-muted">Tidak ada bukti postingan yang berstatus ini.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredSubmissions.map((sub) => (
              <CampaignSubmissionCard
                key={sub.id}
                submission={sub}
                onReviewClick={() => onReviewClick(sub)}
                onViewDetails={() => onViewDetailsClick(sub)}
              />
            ))}
          </div>
        )}

        {/* Validation Guide Panel */}
        <div className="mt-6 pt-5 border-t border-border-soft">
          <span className="block text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2.5">
            Panduan Validasi Bukti Posting
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[10px] text-text-muted leading-tight">
            <div className="flex items-start gap-2 bg-neutral-50/50 p-3 rounded-xl border border-border-soft/60">
              <svg className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-bold text-text-secondary block mb-0.5">Tautan Publik</span>
                Pastikan tautan TikTok/Instagram bisa dibuka oleh publik.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-neutral-50/50 p-3 rounded-xl border border-border-soft/60">
              <svg className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-bold text-text-secondary block mb-0.5">Kesesuaian Data</span>
                Cocokkan views di konten dengan angka laporan platform.
              </div>
            </div>
            <div className="flex items-start gap-2 bg-neutral-50/50 p-3 rounded-xl border border-border-soft/60">
              <svg className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <span className="font-bold text-text-secondary block mb-0.5">Audit Anti-Fraud</span>
                Periksa pola likes, comments, dan views untuk indikasi bot.
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardCard>
  );
}
