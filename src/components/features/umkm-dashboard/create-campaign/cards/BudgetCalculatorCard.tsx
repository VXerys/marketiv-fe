import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { DashboardCard } from "@/components/features/umkm-dashboard/shared/DashboardCard";
import { DashboardBadge } from "@/components/features/umkm-dashboard/shared/DashboardBadge";
import { DashboardProgress } from "@/components/features/umkm-dashboard/shared/DashboardProgress";

interface BudgetCalculatorCardProps {
  pricePerThousandViews: number;
  totalBudgetEscrow: number;
  creatorQuota: number;
}

export function BudgetCalculatorCard({
  pricePerThousandViews,
  totalBudgetEscrow,
  creatorQuota,
}: BudgetCalculatorCardProps) {
  const platformFee = Math.round(totalBudgetEscrow * 0.15);
  const totalPayment = totalBudgetEscrow + platformFee;
  
  const estimatedViews = pricePerThousandViews > 0 
    ? Math.round((totalBudgetEscrow / pricePerThousandViews) * 1000) 
    : 0;

  const budgetPerCreator = creatorQuota > 0 
    ? Math.round(totalBudgetEscrow / creatorQuota) 
    : 0;

  const viewsPerCreator = creatorQuota > 0 
    ? Math.round(estimatedViews / creatorQuota) 
    : 0;

  const effectivenessPercent = Math.min(100, Math.max(25, (estimatedViews / 500000) * 100));

  return (
    <DashboardCard className="bg-neutral-50/45 border border-border-soft/60 p-5.5 space-y-4">
      <div className="flex items-center justify-between gap-4 border-b border-border-soft/50 pb-3">
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Kalkulasi Estimasi Anggaran
        </span>
        <DashboardBadge type="tone" tone="green" className="text-[9px] h-4.5 px-2">
          Simulasi Aktif
        </DashboardBadge>
      </div>

      {/* Numerical Metrics Summary Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            Estimasi Total Views
          </span>
          <span className="text-sm font-extrabold text-text-primary block">
            {formatCompactNumber(estimatedViews)} Views
          </span>
          <span className="text-[9px] text-text-muted block mt-0.5 leading-none font-semibold">
            {formatCompactNumber(viewsPerCreator)} views / kreator
          </span>
        </div>

        <div>
          <span className="block text-[9px] font-bold text-text-muted uppercase tracking-wider mb-0.5">
            Budget per Kreator
          </span>
          <span className="text-sm font-extrabold text-text-primary block truncate">
            {formatCurrency(budgetPerCreator)}
          </span>
          <span className="text-[9px] text-text-muted block mt-0.5 leading-none font-semibold">
            Dibagikan ke {creatorQuota} kreator
          </span>
        </div>
      </div>

      {/* Platform Fee Breakdown */}
      <div className="border-t border-border-soft/50 pt-3.5 space-y-2 text-xs font-semibold text-text-secondary">
        <div className="flex items-center justify-between gap-4 text-text-muted text-[11px]">
          <span>Anggaran Campaign (Escrow)</span>
          <span className="font-bold text-text-primary">{formatCurrency(totalBudgetEscrow)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-text-muted text-[11px]">
          <span>Biaya Platform (15%)</span>
          <span className="font-bold text-text-primary">{formatCurrency(platformFee)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-text-muted text-[11px] pt-1.5 border-t border-dashed border-border-soft/60">
          <span className="text-text-primary font-extrabold">Total Pembayaran</span>
          <span className="text-xs sm:text-sm font-extrabold text-primary">{formatCurrency(totalPayment)}</span>
        </div>
      </div>

      {/* Progress towards minimum views target visual indicator */}
      {totalBudgetEscrow > 0 && (
        <DashboardProgress
          label="Efektivitas Pemasaran"
          value={effectivenessPercent}
          max={100}
          valueLabel={effectivenessPercent > 70 ? "Tinggi" : "Cukup"}
          tone="orange"
          className="pt-2.5"
        />
      )}
    </DashboardCard>
  );
}
