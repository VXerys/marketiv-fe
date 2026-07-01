"use client";

import { DashboardCard, DashboardButton } from "../../shared";

interface CampaignQuickActionsCardProps {
  onCopyAsset: () => void;
  onExportReport: () => void;
  onViewEscrow: () => void;
  onReviewPending: () => void;
  hasPendingSubmissions: boolean;
}

export function CampaignQuickActionsCard({
  onCopyAsset,
  onExportReport,
  onViewEscrow,
  onReviewPending,
  hasPendingSubmissions,
}: CampaignQuickActionsCardProps) {
  return (
    <DashboardCard variant="default">
      <div className="p-5 border-b border-border-soft">
        <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
          Aksi Cepat Campaign
        </h3>
      </div>
      <div className="p-5 space-y-3">
        {hasPendingSubmissions ? (
          <DashboardButton
            variant="soft"
            size="md"
            onClick={onReviewPending}
            className="w-full text-xs h-9 justify-start gap-2"
          >
            <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Review Submission Pending</span>
          </DashboardButton>
        ) : (
          <DashboardButton
            variant="outline"
            size="md"
            onClick={onReviewPending}
            className="w-full text-xs h-9 justify-start gap-2 text-text-secondary border-border-strong hover:bg-neutral-50"
          >
            <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Lihat Semua Submissions</span>
          </DashboardButton>
        )}

        <DashboardButton
          variant="outline"
          size="md"
          onClick={onCopyAsset}
          className="w-full text-xs h-9 justify-start gap-2 text-text-secondary border-border-strong hover:bg-neutral-50"
        >
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span>Salin Tautan Aset Media</span>
        </DashboardButton>

        <DashboardButton
          variant="outline"
          size="md"
          onClick={onExportReport}
          className="w-full text-xs h-9 justify-start gap-2 text-text-secondary border-border-strong hover:bg-neutral-50"
        >
          <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span>Unduh Laporan Kemajuan</span>
        </DashboardButton>

        <DashboardButton
          variant="ghost"
          size="md"
          onClick={onViewEscrow}
          className="w-full text-xs h-9 justify-start gap-2 text-text-muted hover:text-text-secondary"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Lihat Rekam Transaksi Escrow</span>
        </DashboardButton>
      </div>
    </DashboardCard>
  );
}
