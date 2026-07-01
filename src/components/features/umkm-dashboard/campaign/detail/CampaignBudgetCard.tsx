import { Campaign } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import { DashboardCard, DashboardProgress } from "../../shared";

interface CampaignBudgetCardProps {
  campaign: Campaign;
}

export function CampaignBudgetCard({ campaign }: CampaignBudgetCardProps) {
  const budgetProgress = (campaign.usedBudget / campaign.totalBudgetEscrow) * 100;
  const quotaProgress = (campaign.usedQuota / campaign.creatorQuota) * 100;

  // Platform fee estimation (e.g. 15%)
  const platformFee = Math.round(campaign.totalBudgetEscrow * 0.15);
  const totalPayment = campaign.totalBudgetEscrow + platformFee;

  return (
    <DashboardCard variant="default">
      <div className="p-6 border-b border-border-soft">
        <h3 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
          Alokasi Budget & Escrow
        </h3>
      </div>
      <div className="p-6 space-y-5">
        
        {/* Progress bars */}
        <div className="space-y-4">
          <DashboardProgress
            value={campaign.usedBudget}
            max={campaign.totalBudgetEscrow}
            label="Penggunaan Budget Campaign"
            valueLabel={`${formatCurrency(campaign.usedBudget)} / ${formatCurrency(campaign.totalBudgetEscrow)}`}
          />
          <DashboardProgress
            value={campaign.usedQuota}
            max={campaign.creatorQuota}
            label="Klaim Kuota Kreator"
            valueLabel={`${campaign.usedQuota} / ${campaign.creatorQuota} Slot Terpakai`}
          />
        </div>

        {/* Financial Details Ledger */}
        <div className="space-y-2.5 pt-3 border-t border-border-soft text-xs">
          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>Budget Escrow Inti</span>
            <span className="font-bold text-text-primary">{formatCurrency(campaign.totalBudgetEscrow)}</span>
          </div>
          <div className="flex justify-between items-center text-text-secondary font-medium">
            <span>Biaya Layanan Platform (15%)</span>
            <span className="font-bold text-text-primary">{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex justify-between items-center text-text-secondary font-medium pt-2.5 border-t border-dashed border-border-soft">
            <span className="font-bold text-text-primary">Total Pembayaran Awal</span>
            <span className="font-extrabold text-primary text-sm">{formatCurrency(totalPayment)}</span>
          </div>
        </div>

        {/* Escrow note */}
        <div className="bg-neutral-50 border border-border-soft rounded-xl p-3.5 text-[10px] text-text-muted leading-relaxed">
          <span className="font-bold text-text-secondary block mb-1">Cara Kerja Pembayaran Escrow</span>
          Dana didepositkan di awal dan dikunci dalam sistem Escrow. Setiap ulasan video yang disubmit kreator dan disetujui, akan mencairkan dana dari sisa budget escrow ke saldo dompet kreator secara otomatis berdasarkan per 1000 views.
        </div>

      </div>
    </DashboardCard>
  );
}
