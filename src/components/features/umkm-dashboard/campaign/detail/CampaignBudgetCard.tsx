import { Campaign } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import { calculatePlatformFee, calculateTotalPayment } from "@/types/domain";
import { DashboardProgress } from "../../shared";

interface CampaignBudgetCardProps {
  campaign: Campaign;
}

export function CampaignBudgetCard({ campaign }: CampaignBudgetCardProps) {
  const platformFee = calculatePlatformFee(campaign.totalBudgetEscrow);
  const totalPayment = calculateTotalPayment(campaign.totalBudgetEscrow);

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 sm:p-6 shadow-2xs space-y-5">
      <div className="border-b border-neutral-200/50 pb-3">
        <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wide">
          Rincian Anggaran Kampanye
        </h3>
      </div>
      
      {/* Progress bars */}
      <div className="space-y-4">
        <DashboardProgress
          value={campaign.usedBudget}
          max={campaign.totalBudgetEscrow}
          label="Penggunaan Dana Kampanye"
          valueLabel={`${formatCurrency(campaign.usedBudget)} / ${formatCurrency(campaign.totalBudgetEscrow)}`}
        />
        <DashboardProgress
          value={campaign.usedQuota}
          max={campaign.creatorQuota}
          label="Jumlah Kreator Bergabung"
          valueLabel={`${campaign.usedQuota} / ${campaign.creatorQuota} Kreator`}
        />
      </div>

      {/* Financial Details Ledger */}
      <div className="space-y-2.5 pt-3 border-t border-neutral-200/50 text-xs">
        <div className="flex justify-between items-center text-text-secondary font-medium">
          <span>Dana Kampanye</span>
          <span className="font-bold text-text-primary">{formatCurrency(campaign.totalBudgetEscrow)}</span>
        </div>
        <div className="flex justify-between items-center text-text-secondary font-medium">
          <span>Biaya Layanan Marketiv (2%)</span>
          <span className="font-bold text-text-primary">{formatCurrency(platformFee)}</span>
        </div>
        <div className="flex justify-between items-center text-text-secondary font-medium pt-2.5 border-t border-dashed border-neutral-200">
          <span className="font-bold text-text-primary">Total Pembayaran</span>
          <span className="font-extrabold text-orange-600 font-display text-sm">{formatCurrency(totalPayment)}</span>
        </div>
      </div>

      {/* Escrow note */}
      <div className="bg-neutral-50 border border-neutral-200/60 rounded-xl p-3.5 text-xs text-text-muted leading-relaxed space-y-1">
        <span className="font-bold text-text-primary block">Cara Kerja Pembayaran Kampanye</span>
        <span>Dana disetorkan di awal dan disimpan aman oleh sistem Marketiv. Dana baru dibayarkan kepada kreator setelah video selesai dibuat, diunggah ke sosial media, dan tayangannya diverifikasi.</span>
      </div>
    </div>
  );
}
