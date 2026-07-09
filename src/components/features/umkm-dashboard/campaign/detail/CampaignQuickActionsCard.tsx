"use client";

import { DashboardButton } from "../../shared";

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
    <div className="panel bg-white border border-neutral-200/80 shadow-xs rounded-[28px] overflow-hidden transition-all duration-300">
      <div className="p-6 border-b border-border-soft flex items-center justify-between">
        <h3 className="text-xs font-black text-text-primary uppercase tracking-wider">
          Aksi Cepat Campaign
        </h3>
      </div>
      
      <div className="p-6 flex flex-col gap-4">
        {/* Button 1: Review Pending Submissions */}
        <DashboardButton
          variant="primary"
          size="lg"
          onClick={onReviewPending}
          className="w-full text-xs font-black uppercase tracking-wider h-11 justify-center gap-2.5 rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer"
          leftIcon={
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        >
          {hasPendingSubmissions ? "Review Submission Pending" : "Lihat Semua Submissions"}
        </DashboardButton>

        {/* Button 2: Copy Assets Tautan */}
        <DashboardButton
          variant="primary"
          size="lg"
          onClick={onCopyAsset}
          className="w-full text-xs font-black uppercase tracking-wider h-11 justify-center gap-2.5 rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer"
          leftIcon={
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          }
        >
          Salin Tautan Aset Media
        </DashboardButton>

        {/* Button 3: Download Laporan Kemajuan */}
        <DashboardButton
          variant="primary"
          size="lg"
          onClick={onExportReport}
          className="w-full text-xs font-black uppercase tracking-wider h-11 justify-center gap-2.5 rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer"
          leftIcon={
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          }
        >
          Unduh Laporan Kemajuan
        </DashboardButton>

        {/* Button 4: View Escrow Records */}
        <DashboardButton
          variant="primary"
          size="lg"
          onClick={onViewEscrow}
          className="w-full text-xs font-black uppercase tracking-wider h-11 justify-center gap-2.5 rounded-xl shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 cursor-pointer"
          leftIcon={
            <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          Lihat Rekam Transaksi Escrow
        </DashboardButton>
      </div>
    </div>
  );
}
