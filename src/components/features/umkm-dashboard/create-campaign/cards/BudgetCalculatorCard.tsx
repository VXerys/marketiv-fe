"use client";

import { formatCurrency, formatCompactNumber } from "@/lib/formatters";
import { calculatePlatformFee, calculateTotalPayment } from "@/types/domain";

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
  const isDataFilled =
    pricePerThousandViews > 0 && totalBudgetEscrow > 0 && creatorQuota > 0;

  const platformFee = calculatePlatformFee(totalBudgetEscrow);
  const totalPayment = calculateTotalPayment(totalBudgetEscrow);

  const estimatedViews =
    pricePerThousandViews > 0
      ? Math.round((totalBudgetEscrow / pricePerThousandViews) * 1000)
      : 0;

  const budgetPerCreator =
    creatorQuota > 0 ? Math.round(totalBudgetEscrow / creatorQuota) : 0;

  return (
    <div className="rounded-2xl border border-neutral-200/80 bg-white p-4.5 sm:p-5 space-y-4 shadow-2xs">
      <div className="border-b border-neutral-200/50 pb-3">
        <h3 className="text-sm font-bold text-text-primary">
          Perkiraan Kampanye
        </h3>
        <p className="text-[11px] text-text-muted mt-0.5">
          Hasil berikut merupakan perkiraan dan dapat berubah sesuai jumlah tayangan yang diperoleh kreator.
        </p>
      </div>

      {!isDataFilled ? (
        <div className="py-6 text-center text-text-muted space-y-1">
          <span className="text-xs font-semibold block">
            Isi anggaran dan bayaran kreator untuk melihat perkiraan hasil kampanye.
          </span>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ── Perkiraan Hasil (Highlight Block) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50/70 p-3.5 rounded-xl border border-neutral-200/60">
            <div>
              <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Perkiraan Total Tayangan
              </span>
              <span className="text-sm font-extrabold text-orange-600 block mt-0.5">
                ± {formatCompactNumber(estimatedViews)} tayangan
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Jumlah Kreator
              </span>
              <span className="text-sm font-extrabold text-text-primary block mt-0.5">
                Maksimal {creatorQuota} kreator
              </span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-text-muted uppercase tracking-wider">
                Perkiraan Dana / Kreator
              </span>
              <span className="text-sm font-extrabold text-text-primary block mt-0.5">
                ± {formatCurrency(budgetPerCreator)}*
              </span>
            </div>
          </div>
          <p className="text-[10px] text-text-muted italic">
            *Pembayaran aktual mengikuti tayangan valid masing-masing kreator.
          </p>

          <hr className="border-neutral-200/60" />

          {/* ── Rincian Pembayaran (Financial Breakdown Block) ── */}
          <div className="space-y-2 text-xs">
            <span className="text-[11px] font-bold text-text-primary uppercase tracking-wide block mb-1">
              Rincian Pembayaran
            </span>
            <div className="flex items-center justify-between gap-4 text-text-secondary">
              <span>Dana kampanye</span>
              <span className="font-bold text-text-primary">{formatCurrency(totalBudgetEscrow)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-text-secondary">
              <span>Biaya layanan Marketiv (2%)</span>
              <span className="font-bold text-text-primary">{formatCurrency(platformFee)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm font-extrabold text-text-primary pt-2 border-t border-dashed border-neutral-200">
              <span>Total yang perlu dibayar</span>
              <span className="text-orange-600">{formatCurrency(totalPayment)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
