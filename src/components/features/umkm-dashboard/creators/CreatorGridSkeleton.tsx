"use client";

export function CreatorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 animate-pulse">
      {Array.from({ length: 8 }).map((_, idx) => (
        <div key={idx} className="rounded-2xl border border-neutral-200/50 bg-white overflow-hidden flex flex-col min-h-[300px]">
          {/* Cover image placeholder */}
          <div className="h-40 w-full bg-neutral-200" />
          
          {/* Card Body */}
          <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              {/* Name */}
              <div className="h-4 w-3/4 bg-neutral-200 rounded-md" />
              {/* Description */}
              <div className="space-y-1.5">
                <div className="h-3 w-full bg-neutral-200 rounded-md" />
                <div className="h-3 w-5/6 bg-neutral-200 rounded-md" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 border-y border-neutral-100 py-3">
              <div className="space-y-1">
                <div className="h-2 w-10 bg-neutral-200 rounded-md" />
                <div className="h-3 w-12 bg-neutral-200 rounded-md" />
              </div>
              <div className="space-y-1">
                <div className="h-2 w-10 bg-neutral-200 rounded-md" />
                <div className="h-3 w-16 bg-neutral-200 rounded-md" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              <div className="space-y-1">
                <div className="h-2 w-12 bg-neutral-200 rounded-md" />
                <div className="h-3.5 w-16 bg-neutral-200 rounded-md" />
              </div>
              <div className="h-7 w-16 bg-neutral-200 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
