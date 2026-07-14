"use client";

export function NegotiationListSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-neutral-200 rounded-md" />
          <div className="h-3.5 w-80 bg-neutral-200 rounded-md" />
        </div>
        <div className="h-10 w-36 bg-neutral-200 rounded-xl" />
      </div>

      {/* Summary Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-neutral-200/50 rounded-2xl p-4 h-20 space-y-2">
            <div className="h-2 w-16 bg-neutral-200 rounded-md" />
            <div className="h-4 w-12 bg-neutral-200 rounded-md" />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-10 flex-1 bg-neutral-200 rounded-xl" />
          <div className="h-10 w-44 bg-neutral-200 rounded-xl" />
        </div>
        <div className="h-8 w-60 bg-neutral-200 rounded-full" />
      </div>

      {/* List Grid Skeleton */}
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-neutral-200/50 bg-white p-5 h-28 flex flex-col justify-between"
          >
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-neutral-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-neutral-200 rounded-md" />
                <div className="h-3 w-1/2 bg-neutral-200 rounded-md" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
