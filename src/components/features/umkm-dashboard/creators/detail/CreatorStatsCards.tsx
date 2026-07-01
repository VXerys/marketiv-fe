"use client";

interface CreatorStatsCardsProps {
  creatorId: string;
}

export function CreatorStatsCards({ creatorId }: CreatorStatsCardsProps) {
  // Vary statistics mockup based on id
  const idNum = parseInt(creatorId) || 1;
  const engagement = (4.5 + (idNum % 3) * 0.7).toFixed(1) + "%";
  const avgViews = (12 + (idNum % 4) * 4).toFixed(0) + ".5K";
  const completionRate = (95 + (idNum % 3) * 1.5).toFixed(1) + "%";

  const stats = [
    {
      label: "Engagement Rate",
      value: engagement,
      desc: "Rasio interaksi audiens aktif",
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Rata-rata Tayangan",
      value: avgViews,
      desc: "Views per postingan video",
      icon: (
        <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: "Tingkat Penyelesaian",
      value: completionRate,
      desc: "Tepat waktu sesuai kesepakatan",
      icon: (
        <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div key={idx} className="bg-white border border-border-soft rounded-2xl p-4 flex items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <span className="block text-[9px] font-extrabold text-text-secondary uppercase tracking-wider">
              {stat.label}
            </span>
            <span className="block text-base sm:text-lg font-extrabold text-text-primary tracking-tight">
              {stat.value}
            </span>
            <span className="block text-[9px] text-text-muted font-medium leading-none">
              {stat.desc}
            </span>
          </div>
          <div className="h-9 w-9 rounded-lg bg-neutral-50 border border-neutral-100 flex items-center justify-center shrink-0">
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
