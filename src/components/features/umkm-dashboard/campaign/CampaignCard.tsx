"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Campaign } from "@/types/umkm-dashboard.types";
import { formatCompactNumber } from "@/lib/formatters";
import {
  DashboardCard,
  DashboardBadge,
  DashboardProgress,
  DashboardActionMenu,
  DashboardButton,
  ActionMenuItem
} from "../shared";

interface CampaignCardProps {
  campaign: Campaign;
  pendingCount?: number;
  validCount?: number;
  disputeCount?: number;
  onDuplicate: () => void;
  onCancel: () => void;
  onExport: () => void;
  onEdit: () => void;
}

export function CampaignCard({
  campaign,
  pendingCount = 0,
  validCount = 0,
  disputeCount = 0,
  onDuplicate,
  onCancel,
  onExport,
  onEdit,
}: CampaignCardProps) {
  const router = useRouter();
  const budgetProgress = (campaign.usedBudget / campaign.totalBudgetEscrow) * 100;
  const quotaProgress = (campaign.usedQuota / campaign.creatorQuota) * 100;

  // CTA label based on status
  const getCtaLabel = () => {
    switch (campaign.status) {
      case "draft":
        return "Lanjutkan Draft";
      case "active":
        return "Lihat Detail";
      case "full":
        return "Review Submission";
      case "completed":
        return "Lihat Laporan";
      case "cancelled":
        return "Lihat Riwayat";
      default:
        return "Lihat Detail";
    }
  };

  const detailUrl = `/dashboard/umkm/campaign/${campaign.id}`;

  const isCancelDisabled = campaign.status === "completed" || campaign.status === "cancelled";
  const isEditVisible = campaign.status === "draft";

  const actionItems: ActionMenuItem[] = [
    {
      label: "Lihat Detail",
      onClick: () => router.push(detailUrl),
    },
    ...(isEditVisible ? [{
      label: "Edit Draft",
      onClick: onEdit,
    }] : []),
    {
      label: "Duplikasi Campaign",
      onClick: onDuplicate,
    },
    {
      label: "Unduh Laporan",
      onClick: onExport,
    },
    ...(!isCancelDisabled ? [{
      label: "Batalkan Campaign",
      onClick: onCancel,
      danger: true,
    }] : []),
  ];

  return (
    <DashboardCard variant="default" interactive className="flex flex-col h-full p-4 relative overflow-visible group">
      
      {/* Action Menu (Rendered outside overflow-hidden thumbnail container to prevent clipping) */}
      <div className="absolute top-6 right-6 z-50">
        <DashboardActionMenu items={actionItems} />
      </div>

      {/* Thumbnail area */}
      <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-4 shrink-0 bg-neutral-100 border border-border-soft">
        {campaign.thumbnailUrl ? (
          <Image
            src={campaign.thumbnailUrl}
            alt={campaign.title}
            fill
            className="object-cover group-hover:scale-102 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-50 text-neutral-400 text-[10px] font-bold">
            No Thumbnail
          </div>
        )}
        
        {/* Niche/Category Badge */}
        <div className="absolute top-2.5 left-3">
          <DashboardBadge type="category" value={campaign.niche} />
        </div>
      </div>

      {/* Body Info */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 mb-2 min-w-0">
          <h4
            onClick={() => router.push(detailUrl)}
            className="font-bold text-text-primary text-sm sm:text-base leading-snug group-hover:text-primary transition-colors line-clamp-1 flex-1 cursor-pointer min-w-0 truncate"
          >
            {campaign.title}
          </h4>
          <DashboardBadge type="status" value={campaign.status} className="shrink-0" />
        </div>

        <p className="text-xs text-text-muted line-clamp-2 mb-4 min-w-0 flex-1">
          {campaign.brief}
        </p>

        {/* Campaign Metrics Section */}
        <div className="space-y-3 mb-4 bg-neutral-50/50 p-3 rounded-xl border border-border-soft text-[11px] font-medium text-text-secondary">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="border-r border-border-soft min-w-0">
              <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate">Views</span>
              <span className="font-extrabold text-text-primary block truncate">{formatCompactNumber(campaign.totalViews)}</span>
            </div>
            <div className="border-r border-border-soft min-w-0">
              <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate">Rate/1K</span>
              <span className="font-extrabold text-text-primary block truncate">{formatCompactNumber(campaign.pricePerThousandViews)}</span>
            </div>
            <div className="min-w-0">
              <span className="block text-[9px] text-text-muted uppercase tracking-wider mb-0.5 truncate">Escrow</span>
              <span className="font-extrabold text-text-primary block truncate">{formatCompactNumber(campaign.totalBudgetEscrow)}</span>
            </div>
          </div>
        </div>

        {/* Progress indicators */}
        <div className="space-y-3 mb-4 shrink-0">
          <DashboardProgress
            value={campaign.usedBudget}
            max={campaign.totalBudgetEscrow}
            label="Budget Terpakai"
            valueLabel={`${formatCompactNumber(campaign.usedBudget)} / ${formatCompactNumber(campaign.totalBudgetEscrow)}`}
          />
          <DashboardProgress
            value={campaign.usedQuota}
            max={campaign.creatorQuota}
            label="Kuota Kreator"
            valueLabel={`${campaign.usedQuota} / ${campaign.creatorQuota} Klaim`}
          />
        </div>

        {/* Submissions summary */}
        <div className="flex flex-wrap gap-2 text-[10px] text-text-secondary border-t border-border-soft pt-3 mb-4 shrink-0 justify-between items-center min-w-0">
          <span className="font-bold uppercase tracking-wider text-[9px] text-text-muted truncate">Submissions</span>
          <div className="flex gap-1.5 shrink-0">
            <DashboardBadge tone="amber" className="h-4.5 px-2 text-[9px] font-bold">
              {pendingCount} Pending
            </DashboardBadge>
            <DashboardBadge tone="green" className="h-4.5 px-2 text-[9px] font-bold">
              {validCount} Valid
            </DashboardBadge>
            {disputeCount > 0 && (
              <DashboardBadge tone="red" className="h-4.5 px-2 text-[9px] font-bold">
                {disputeCount} Sengketa
              </DashboardBadge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2 shrink-0">
          <DashboardButton
            variant={campaign.status === "draft" ? "secondary" : "primary"}
            size="sm"
            href={detailUrl}
            className="w-full text-xs h-9"
          >
            {getCtaLabel()}
          </DashboardButton>
        </div>
      </div>
    </DashboardCard>
  );
}
