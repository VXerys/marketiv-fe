import { Skeleton } from "@/components/ui/skeleton";

export function CampaignDetailSkeleton() {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 animate-pulse">
      
      {/* Header Back Button */}
      <Skeleton className="h-4 w-36" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
          <Skeleton className="h-3 w-48" />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-32 rounded-full" />
        </div>
      </div>

      {/* Overview Cards (6 blocks) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white border border-border-soft rounded-2xl p-4 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-3.5 w-12" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <Skeleton className="h-6 w-20 mb-2" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Brief & Submissions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Brief Card */}
          <div className="bg-white border border-border-soft rounded-2xl p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>

          {/* Submissions Section */}
          <div className="bg-white border border-border-soft rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-7 w-48 rounded-full" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 items-center p-3 border border-border-soft rounded-xl">
                  <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Assets, Budget, Timeline */}
        <div className="space-y-6">
          {/* Asset Card */}
          <div className="bg-white border border-border-soft rounded-2xl p-5 space-y-4">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-8 w-full rounded-full" />
          </div>

          {/* Budget Card */}
          <div className="bg-white border border-border-soft rounded-2xl p-5 space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
        </div>

      </div>

    </div>
  );
}
