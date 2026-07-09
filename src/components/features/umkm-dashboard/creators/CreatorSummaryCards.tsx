"use client";

import { formatCurrency } from "@/lib/formatters";

export function CreatorSummaryCards() {
  const stats = [
    {
      label: "Total Kreator Aktif",
      value: "142",
      suffix: "Kreator",
      icon: (
        <svg className="w-4 h-4 sm:w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      iconBg: "#fff7ed",
      iconBorder: "rgba(234,88,12,.18)",
    },
    {
      label: "Hubungan Negosiasi",
      value: "12",
      suffix: "Aktif",
      icon: (
        <svg className="w-4 h-4 sm:w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      iconBg: "#f0f6ff",
      iconBorder: "rgba(37,99,235,.18)",
    },
    {
      label: "Escrow Terkunci",
      value: formatCurrency(4500000),
      suffix: "",
      icon: (
        <svg className="w-4 h-4 sm:w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      iconBg: "#f1fbf5",
      iconBorder: "rgba(22,163,74,.18)",
    },
  ];

  return (
    /* Grid: 2 kolom di mobile (2x2), 3 kolom di desktop (1 baris seimbang) */
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="relative p-3.5 sm:p-4.5 rounded-2xl sm:rounded-[22px] border border-border bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group select-none flex flex-col justify-between"
          style={{
            background: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.03), transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)",
          }}
        >
          {/* Top Row: Icon Box */}
          <div className="flex items-center justify-between gap-2.5 mb-2.5 sm:mb-3.5">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] grid place-items-center border shadow-3xs transition-transform duration-300 group-hover:scale-105"
              style={{ background: stat.iconBg, borderColor: stat.iconBorder }}
            >
              {stat.icon}
            </div>
          </div>

          <div>
            {/* Label */}
            <span className="block text-[0.66rem] sm:text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase leading-none">
              {stat.label}
            </span>

            {/* Value & Suffix */}
            <div className="flex items-baseline gap-1 mt-1 sm:mt-1.5 leading-none">
              <span className="font-display text-[1.15rem] sm:text-[1.4rem] lg:text-[1.55rem] font-black text-neutral-900 tracking-tight leading-none break-all">
                {stat.value}
              </span>
              {stat.suffix && (
                <span className="text-[0.68rem] sm:text-[0.74rem] font-semibold text-neutral-400">
                  {stat.suffix}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
