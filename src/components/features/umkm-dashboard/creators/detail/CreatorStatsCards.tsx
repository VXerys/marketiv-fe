"use client";

interface CreatorStatsCardsProps {
  engagementRate: number;
  completedJobs: number;
}

export function CreatorStatsCards({ engagementRate, completedJobs }: CreatorStatsCardsProps) {
  const stats = [
    {
      label: "Engagement Rate",
      value: engagementRate > 0 ? `${engagementRate.toFixed(1)}%` : "—",
      desc: "Rasio interaksi audiens aktif",
      icon: (
        <svg className="w-4 h-4 sm:w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      iconBg: "#fff7ed",
      iconBorder: "rgba(234,88,12,.18)",
    },
    {
      label: "Pesanan Selesai",
      value: completedJobs > 0 ? String(completedJobs) : "—",
      desc: "Total proyek yang diselesaikan",
      icon: (
        <svg className="w-4 h-4 sm:w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: "#f1fbf5",
      iconBorder: "rgba(22,163,74,.18)",
    },
    {
      label: "Rata-rata Tayangan",
      value: "—",
      desc: "Data belum tersedia",
      icon: (
        <svg className="w-4 h-4 sm:w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      iconBg: "#f0f6ff",
      iconBorder: "rgba(37,99,235,.18)",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="relative p-3.5 sm:p-4.5 rounded-2xl sm:rounded-[22px] border border-border bg-gradient-to-b from-white to-neutral-50/50 shadow-3xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-primary-500/20 group select-none flex flex-col justify-between"
          style={{
            background: "radial-gradient(circle at 100% 0%, rgba(249,115,22,.03), transparent 10rem), linear-gradient(180deg, #ffffff, #fffdf9)",
          }}
        >
          <div className="flex items-center justify-between gap-2.5 mb-2.5 sm:mb-3.5">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] grid place-items-center border shadow-3xs transition-transform duration-300 group-hover:scale-105"
              style={{ background: stat.iconBg, borderColor: stat.iconBorder }}
            >
              {stat.icon}
            </div>
          </div>

          <div>
            <span className="block text-[0.66rem] sm:text-[0.74rem] font-extrabold text-neutral-500 tracking-wide uppercase leading-none">
              {stat.label}
            </span>
            <div className="font-display text-[1.2rem] sm:text-[1.4rem] lg:text-[1.55rem] font-black text-neutral-900 tracking-tight leading-none mt-1 sm:mt-1.5 break-all">
              {stat.value}
            </div>
            <span className="block text-[0.68rem] sm:text-[0.74rem] text-neutral-400 font-semibold mt-1 sm:mt-1.5 leading-tight">
              {stat.desc}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
