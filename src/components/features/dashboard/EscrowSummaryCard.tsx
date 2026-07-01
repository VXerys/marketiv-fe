import { DashboardCard } from "./DashboardCard";
import type { EscrowBalance } from "@/types/umkmDashboard";

interface EscrowSummaryCardProps {
  escrow: EscrowBalance;
}

export function EscrowSummaryCard({ escrow }: EscrowSummaryCardProps) {
  return (
    <DashboardCard className="col-span-12 lg:col-span-5 glass-panel-dark text-white relative overflow-hidden shadow-[0_20px_50px_rgba(16,32,51,0.2)]">
      {/* Subtle watermark shield lock background */}
      <div className="absolute right-2 top-2 opacity-[0.03] text-white pointer-events-none transform translate-x-4 -translate-y-4 scale-125">
        <svg className="w-48 h-48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <div className="relative z-10 h-full flex flex-col justify-between">
        <div className="flex items-center justify-between mb-8">
          {/* Glassy badge */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
            <span>
              {/* Shield Check SVG */}
              <svg className="w-4 h-4 text-primary-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <h3 className="text-[10px] text-primary-200 uppercase tracking-widest font-extrabold">Escrow Balance</h3>
          </div>

          <span className="relative">
            {/* Glowing Spark/Star from example image 3 */}
            <svg className="w-5 h-5 text-primary-300 animate-[pulse_3s_infinite] filter drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
            </svg>
          </span>
        </div>

        <div className="my-auto py-2">
          <p className="text-white/60 text-xs font-bold uppercase tracking-wider mb-1">Total Saldo Aman</p>
          <p className="text-4xl lg:text-[44px] mb-4 font-extrabold tracking-tight leading-none drop-shadow-sm">
            Rp {escrow.totalAmount.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-white/70 leading-relaxed max-w-[90%] border-l-2 border-primary/50 pl-3">
            {escrow.infoText}
          </p>
        </div>

        <button className="mt-8 w-full bg-white/10 hover:bg-white/20 text-white font-bold text-sm py-3.5 rounded-xl transition-all border border-white/15 backdrop-blur-md shadow-lg flex items-center justify-center gap-2 group hover:shadow-xl">
          <span>Riwayat Transaksi</span>
          <span>
            {/* Simple Right Arrow SVG */}
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </button>
      </div>
    </DashboardCard>
  );
}
