"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  DashboardActionMenu,
  DashboardBadge,
  DashboardButton,
  DashboardCard,
  ResponsiveDataRow,
  type ActionMenuItem,
  type ResponsiveDataCell,
} from "@/components/features/dashboard/shared";
import { formatCurrency, formatCompactNumber, formatDate } from "@/lib/formatters";
import type { Campaign } from "@/types/umkm-dashboard.types";

interface CampaignTableProps {
  campaigns: Campaign[];
  submissionCounts: Record<string, { pending: number; valid: number; dispute: number }>;
  onDuplicate: (campaign: Campaign) => void;
  onCancel: (campaign: Campaign) => void;
  onExport: (campaign: Campaign) => void;
  onEdit: (campaign: Campaign) => void;
}

export function CampaignTable({
  campaigns,
  submissionCounts,
  onDuplicate,
  onCancel,
  onExport,
  onEdit,
}: CampaignTableProps) {
  const router = useRouter();

  function getActionItems(campaign: Campaign, detailUrl: string): ActionMenuItem[] {
    const isCancelDisabled = campaign.status === "completed" || campaign.status === "cancelled";
    const isEditVisible = campaign.status === "draft";

    return [
      {
        label: "Lihat Detail",
        onClick: () => router.push(detailUrl),
      },
      ...(isEditVisible
        ? [
            {
              label: "Edit Draft",
              onClick: () => onEdit(campaign),
            },
          ]
        : []),
      {
        label: "Duplikasi Campaign",
        onClick: () => onDuplicate(campaign),
      },
      {
        label: "Unduh Laporan",
        onClick: () => onExport(campaign),
      },
      ...(!isCancelDisabled
        ? [
            {
              label: "Batalkan Campaign",
              onClick: () => onCancel(campaign),
              tone: "danger" as const,
            },
          ]
        : []),
    ];
  }

  function renderThumbnail(campaign: Campaign) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-border-soft bg-neutral-100">
        {campaign.thumbnailUrl ? (
          <Image src={campaign.thumbnailUrl} alt={campaign.title} fill sizes="40px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[9px] font-bold text-neutral-400">N/A</div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {campaigns.map((campaign) => {
          const counts = submissionCounts[campaign.id] || { pending: 0, valid: 0, dispute: 0 };
          const detailUrl = `/dashboard/umkm/campaign/${campaign.id}`;
          const cells: ResponsiveDataCell[] = [
            { label: "Views", value: formatCompactNumber(campaign.totalViews), align: "right" },
            {
              label: "Budget",
              value: (
                <span>
                  {formatCurrency(campaign.usedBudget)}
                  <span className="block text-[11px] font-medium text-text-muted">
                    dari {formatCurrency(campaign.totalBudgetEscrow)}
                  </span>
                </span>
              ),
              align: "right",
            },
            { label: "Kuota Kreator", value: `${campaign.usedQuota} / ${campaign.creatorQuota}` },
            {
              label: "Submissions",
              value: (
                <span className="flex flex-wrap gap-1.5">
                  <DashboardBadge tone="amber" size="sm">
                    {counts.pending} P
                  </DashboardBadge>
                  <DashboardBadge tone="green" size="sm">
                    {counts.valid} V
                  </DashboardBadge>
                  {counts.dispute > 0 ? (
                    <DashboardBadge tone="red" size="sm">
                      {counts.dispute} D
                    </DashboardBadge>
                  ) : null}
                </span>
              ),
            },
            { label: "Dibuat", value: formatDate(campaign.createdAt) },
          ];

          return (
            <ResponsiveDataRow
              key={campaign.id}
              title={
                <div className="flex min-w-0 items-center gap-3">
                  {renderThumbnail(campaign)}
                  <div className="min-w-0">
                    <Link href={detailUrl} className="block truncate font-bold text-text-primary transition-colors hover:text-primary">
                      {campaign.title}
                    </Link>
                    <span className="mt-0.5 block truncate text-[10px] text-text-muted">ID: {campaign.id}</span>
                  </div>
                </div>
              }
              meta={
                <>
                  <DashboardBadge type="status" value={campaign.status} size="sm" />
                  <DashboardBadge type="category" value={campaign.niche} size="sm" />
                </>
              }
              cells={cells}
              actions={<DashboardActionMenu items={getActionItems(campaign, detailUrl)} />}
            />
          );
        })}
      </div>

      <DashboardCard variant="default" padding="none" className="hidden w-full overflow-hidden rounded-2xl md:block">
        <table className="w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="border-b border-border-soft bg-neutral-50/50 text-[10px] font-bold uppercase tracking-wider text-text-secondary sm:text-xs">
              <th className="w-[28%] px-6 py-4">Campaign</th>
              <th className="w-[10%] px-4 py-4">Status</th>
              <th className="w-[10%] px-4 py-4">Niche</th>
              <th className="w-[9%] px-4 py-4 text-right">Views</th>
              <th className="w-[16%] px-4 py-4 text-right">Budget (Terpakai/Total)</th>
              <th className="w-[9%] px-4 py-4 text-center">Kuota Kreator</th>
              <th className="w-[10%] px-4 py-4 text-center">Submissions</th>
              <th className="w-[8%] px-4 py-4">Dibuat</th>
              <th className="w-[10%] px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-soft">
            {campaigns.map((campaign) => {
              const counts = submissionCounts[campaign.id] || { pending: 0, valid: 0, dispute: 0 };
              const detailUrl = `/dashboard/umkm/campaign/${campaign.id}`;
              const actionItems = getActionItems(campaign, detailUrl);

              return (
                <tr key={campaign.id} className="text-xs text-text-primary transition-colors hover:bg-neutral-50/50">
                  <td className="px-6 py-4">
                    <div className="flex max-w-[280px] items-center gap-3">
                      {renderThumbnail(campaign)}
                      <div className="min-w-0">
                        <Link href={detailUrl} className="block truncate font-bold text-text-primary transition-colors hover:text-primary">
                          {campaign.title}
                        </Link>
                        <span className="mt-0.5 block truncate text-[10px] text-text-muted">ID: {campaign.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <DashboardBadge type="status" value={campaign.status} size="sm" />
                  </td>
                  <td className="px-4 py-4">
                    <DashboardBadge type="category" value={campaign.niche} size="sm" />
                  </td>
                  <td className="px-4 py-4 text-right font-extrabold text-text-secondary">
                    {formatCompactNumber(campaign.totalViews)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span className="block break-words font-bold text-text-primary">{formatCurrency(campaign.usedBudget)}</span>
                    <span className="mt-0.5 block break-words text-[10px] text-text-muted">
                      dari {formatCurrency(campaign.totalBudgetEscrow)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="font-bold text-text-primary">{campaign.usedQuota}</span>
                    <span className="text-text-muted"> / {campaign.creatorQuota}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center justify-center gap-1.5">
                      <DashboardBadge tone="amber" className="px-1.5 text-[9px] font-bold">
                        {counts.pending} P
                      </DashboardBadge>
                      <DashboardBadge tone="green" className="px-1.5 text-[9px] font-bold">
                        {counts.valid} V
                      </DashboardBadge>
                      {counts.dispute > 0 ? (
                        <DashboardBadge tone="red" className="px-1.5 text-[9px] font-bold">
                          {counts.dispute} D
                        </DashboardBadge>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-text-muted">{formatDate(campaign.createdAt)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <DashboardButton variant="secondary" size="sm" href={detailUrl} className="h-7 px-3 text-[10px]">
                        Buka
                      </DashboardButton>
                      <DashboardActionMenu items={actionItems} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </DashboardCard>
    </>
  );
}
