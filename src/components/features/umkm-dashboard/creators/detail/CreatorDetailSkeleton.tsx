"use client";

export function CreatorDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Hero Banner Skeleton */}
      <div className="rounded-3xl border border-neutral-200 bg-white overflow-hidden shadow-xs h-64 sm:h-76 flex flex-col justify-end p-6 space-y-4">
        <div className="h-full w-full bg-neutral-200 rounded-2xl" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="bg-white border border-neutral-200/50 rounded-2xl p-5 h-20" />
        ))}
      </div>

      {/* Grid Layout splits: Packages & Socials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-6 w-48 bg-neutral-200 rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white border border-neutral-200/50 rounded-2xl h-56" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-6 w-32 bg-neutral-200 rounded-md" />
          <div className="bg-white border border-neutral-200/50 rounded-2xl h-44" />
        </div>
      </div>
    </div>
  );
}
