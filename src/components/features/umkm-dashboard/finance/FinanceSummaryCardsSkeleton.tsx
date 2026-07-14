"use client";

export function FinanceSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="p-3.5 sm:p-4.5 border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-white animate-pulse"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-[14px] bg-neutral-100 mb-3" />
          <div className="h-3 w-24 bg-neutral-200 rounded mb-2.5" />
          <div className="h-6 w-32 bg-neutral-200 rounded mb-2" />
          <div className="h-3 w-28 bg-neutral-100 rounded" />
        </div>
      ))}
    </div>
  );
}
