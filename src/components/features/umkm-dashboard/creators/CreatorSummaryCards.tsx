"use client";

import { formatCurrency } from "@/lib/formatters";

export function CreatorSummaryCards() {
  const stats = [
    {
      label: "Total Kreator Aktif",
      value: "142",
      suffix: "Kreator",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      bg: "bg-primary-50/30 border-primary-100/30",
    },
    {
      label: "Hubungan Negosiasi",
      value: "12",
      suffix: "Aktif",
      icon: (
        <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      bg: "bg-info-soft/10 border-info-soft/30",
    },
    {
      label: "Escrow Terkunci",
      value: formatCurrency(4500000),
      suffix: "",
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      bg: "bg-success-soft/10 border-success-soft/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`p-4 rounded-2xl border bg-white/70 backdrop-blur-md shadow-xs flex items-center justify-between gap-4 transition-all duration-300 hover:scale-[1.01] ${stat.bg}`}
        >
          <div className="space-y-1">
            <span className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              {stat.label}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg sm:text-xl font-extrabold text-text-primary tracking-tight">
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-[10px] font-bold text-text-muted">
                  {stat.suffix}
                </span>
              )}
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-2xs border border-border-subtle shrink-0">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
