interface CreatorSkeletonProps {
  className?: string;
}

export function CreatorMetricSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200/50 rounded-2xl p-5 animate-pulse flex flex-col justify-between h-28">
          <div className="flex justify-between items-start">
            <div className="h-3.5 bg-neutral-200 rounded-md w-24"></div>
            <div className="w-9 h-9 rounded-xl bg-neutral-200"></div>
          </div>
          <div className="space-y-2.5">
            <div className="h-7 bg-neutral-200 rounded-md w-36"></div>
            <div className="h-3.5 bg-neutral-200 rounded-md w-28"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CreatorCardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200/50 rounded-2xl p-5 animate-pulse space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-neutral-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-neutral-200 rounded-md w-3/4"></div>
              <div className="h-3 bg-neutral-200 rounded-md w-1/2"></div>
            </div>
          </div>
          <div className="h-16 bg-neutral-200 rounded-xl"></div>
          <div className="flex justify-between items-center pt-2">
            <div className="h-3.5 bg-neutral-200 rounded-md w-16"></div>
            <div className="h-3.5 bg-neutral-200 rounded-md w-24"></div>
          </div>
          <div className="h-10 bg-neutral-200 rounded-full w-full pt-2"></div>
        </div>
      ))}
    </div>
  );
}

export function CreatorListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200/50 rounded-2xl p-5 animate-pulse flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="w-14 h-14 rounded-xl bg-neutral-200 shrink-0"></div>
            <div className="space-y-2 flex-1 sm:flex-initial">
              <div className="h-4 bg-neutral-200 rounded-md w-44"></div>
              <div className="h-3 bg-neutral-200 rounded-md w-32"></div>
            </div>
          </div>
          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto gap-2">
            <div className="h-5 bg-neutral-200 rounded-full w-24"></div>
            <div className="h-4 bg-neutral-200 rounded-md w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
