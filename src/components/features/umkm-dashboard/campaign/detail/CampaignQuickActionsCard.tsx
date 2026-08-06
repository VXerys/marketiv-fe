"use client";

import { DashboardButton } from "../../shared";
import { CheckSquare, Copy, Download, ShieldCheck } from "lucide-react";

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
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-4">
      <div className="border-b border-neutral-200/50 pb-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wide">
          Pilihan Aksi Cepat
        </h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {/* Button 1: Review Pending Submissions (Primary Action) */}
        <DashboardButton
          variant="primary"
          size="md"
          onClick={onReviewPending}
          className="w-full h-11 justify-center gap-2 text-xs font-extrabold rounded-full"
          leftIcon={<CheckSquare className="w-4 h-4 text-white shrink-0" />}
        >
          {hasPendingSubmissions ? "Periksa Bukti Konten Baru" : "Lihat Semua Bukti Konten"}
        </DashboardButton>

        {/* Button 2: Copy Assets Tautan */}
        <DashboardButton
          variant="secondary"
          size="md"
          onClick={onCopyAsset}
          className="w-full h-11 justify-center gap-2 text-xs font-bold rounded-full"
          leftIcon={<Copy className="w-4 h-4 shrink-0" />}
        >
          Salin Tautan Folder Foto & Video
        </DashboardButton>

        {/* Button 3: Download Laporan Kemajuan */}
        <DashboardButton
          variant="secondary"
          size="md"
          onClick={onExportReport}
          className="w-full h-11 justify-center gap-2 text-xs font-bold rounded-full"
          leftIcon={<Download className="w-4 h-4 shrink-0" />}
        >
          Unduh Laporan Hasil Kampanye
        </DashboardButton>

        {/* Button 4: View Escrow Records */}
        <DashboardButton
          variant="secondary"
          size="md"
          onClick={onViewEscrow}
          className="w-full h-11 justify-center gap-2 text-xs font-bold rounded-full"
          leftIcon={<ShieldCheck className="w-4 h-4 shrink-0" />}
        >
          Lihat Riwayat Transaksi
        </DashboardButton>
      </div>
    </div>
  );
}
