import { DashboardCard } from "@/components/features/umkm-dashboard/shared/DashboardCard";

export function EscrowSimulationCard() {
  const steps = [
    {
      num: "01",
      title: "Deposit Escrow",
      desc: "UMKM mendepositkan anggaran total kampanye ke rekening escrow bersama sebelum kampanye aktif.",
    },
    {
      num: "02",
      title: "Kreator Posting",
      desc: "Kreator mengklaim pekerjaan, memproduksi konten, lalu mempublikasikan bukti posting berupa URL publik.",
    },
    {
      num: "03",
      title: "Pelepasan Dana",
      desc: "Sistem mengaudit data views tayangan kreator, dan merilis dana secara proporsional kepada kreator.",
    },
  ];

  return (
    <DashboardCard className="bg-neutral-50/45 border border-border-soft/60 p-5.5 space-y-4">
      <div className="flex items-center gap-2 border-b border-border-soft/50 pb-3">
        <svg className="w-4 h-4 text-primary shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
        <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
          Sistem Keamanan Rekening Escrow
        </span>
      </div>

      <div className="space-y-4.5 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-neutral-200/80">
        {steps.map((s) => (
          <div key={s.num} className="flex gap-3 relative z-10">
            <span className="h-6 w-6 rounded-full bg-primary-50 text-primary border border-primary-100 flex items-center justify-center text-[9px] font-extrabold shrink-0 shadow-2xs">
              {s.num}
            </span>
            <div className="min-w-0 pt-0.5">
              <span className="block text-xs font-bold text-text-primary mb-0.5 leading-none">
                {s.title}
              </span>
              <p className="text-[10px] text-text-muted leading-relaxed">
                {s.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-primary-50/40 text-primary border border-primary-100/40 rounded-xl p-3.5 text-[10px] leading-relaxed">
        <span className="font-extrabold block mb-0.5">💡 Jaminan Perlindungan UMKM</span>
        Jika kampanye dibatalkan sebelum masa kuota diklaim, sisa dana yang tertahan di rekening escrow dijamin 100% aman dan akan segera dikembalikan ke saldo dompet Anda.
      </div>
    </DashboardCard>
  );
}

