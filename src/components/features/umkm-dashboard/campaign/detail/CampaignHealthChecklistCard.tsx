"use client";

import { Campaign } from "@/types/umkm-dashboard.types";
import { DashboardCard } from "../../shared";

interface CampaignHealthChecklistCardProps {
  campaign: Campaign;
  pendingCount: number;
}

export function CampaignHealthChecklistCard({
  campaign,
  pendingCount,
}: CampaignHealthChecklistCardProps) {
  const isBriefValid = campaign.brief.length > 20;
  const isAssetValid = campaign.externalAssetUrl.startsWith("http");
  const isBudgetSecured = campaign.totalBudgetEscrow > 0;
  const isQuotaAvailable = campaign.usedQuota < campaign.creatorQuota;

  const checklistItems = [
    {
      label: "Brief & Deskripsi Lengkap",
      status: isBriefValid ? "success" : "warning",
      desc: isBriefValid ? "Deskripsi brief terisi dengan baik." : "Deskripsi brief terlalu pendek.",
    },
    {
      label: "Link Aset Media Tersedia",
      status: isAssetValid ? "success" : "error",
      desc: isAssetValid ? "Aset eksternal tersambung valid." : "Aset eksternal kosong/tidak valid.",
    },
    {
      label: "Jaminan Dana Escrow Aman",
      status: isBudgetSecured ? "success" : "error",
      desc: isBudgetSecured ? "Dana terkunci 100% di sistem." : "Dana belum didepositkan.",
    },
    {
      label: "Kuota Kreator Tersedia",
      status: isQuotaAvailable ? "success" : "info",
      desc: isQuotaAvailable
        ? `${campaign.creatorQuota - campaign.usedQuota} slot terbuka di Job Pool.`
        : "Seluruh kuota konten terisi penuh.",
    },
    {
      label: "Audit Bukti Tayang (Submissions)",
      status: pendingCount > 0 ? "warning" : "success",
      desc: pendingCount > 0
        ? `Ada ${pendingCount} submission menunggu validasi Anda.`
        : "Semua submission selesai ditinjau.",
    },
  ];

  const statusIcons = {
    success: (
      <div className="h-5 w-5 rounded-full bg-success-soft text-success flex items-center justify-center shrink-0 border border-success-soft">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ),
    warning: (
      <div className="h-5 w-5 rounded-full bg-warning-soft text-warning flex items-center justify-center shrink-0 border border-warning-soft">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    info: (
      <div className="h-5 w-5 rounded-full bg-info-soft text-info flex items-center justify-center shrink-0 border border-info-soft">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
    error: (
      <div className="h-5 w-5 rounded-full bg-danger-soft text-danger flex items-center justify-center shrink-0 border border-danger-soft">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
    ),
  };

  return (
    <DashboardCard variant="default">
      <div className="p-5 border-b border-border-soft">
        <h3 className="text-xs font-extrabold text-text-primary uppercase tracking-wider">
          Campaign Health Checklist
        </h3>
      </div>
      <div className="p-5 space-y-4">
        {checklistItems.map((item, i) => (
          <div key={i} className="flex gap-3 items-start min-w-0">
            {statusIcons[item.status as keyof typeof statusIcons]}
            <div className="min-w-0 pt-0.5">
              <span className="block text-xs font-bold text-text-primary truncate">
                {item.label}
              </span>
              <span className="block text-[10px] text-text-muted mt-0.5 leading-relaxed truncate">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
