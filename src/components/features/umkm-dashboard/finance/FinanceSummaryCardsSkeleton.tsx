"use client";

export function FinanceSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
      {Array.from({ length: 6 }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white/75 border border-neutral-200/50 rounded-2xl overflow-hidden shadow-xs animate-pulse"
        >
          {/* Accent bar shimmer */}
          <div className="h-0.5 w-full bg-neutral-200" />

          <div className="p-4 sm:p-5 flex flex-col gap-3.5">
            {/* Icon + Label row */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="h-2.5 w-28 bg-neutral-200 rounded" />
                <div className="h-2 w-36 bg-neutral-200 rounded hidden sm:block" />
              </div>
              <div className="w-9 h-9 rounded-xl bg-neutral-200 shrink-0" />
            </div>

            {/* Value shimmer */}
            <div className="space-y-1">
              <div className="h-6 w-24 bg-neutral-200 rounded" />
              <div className="h-2 w-32 bg-neutral-200 rounded hidden sm:block" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
