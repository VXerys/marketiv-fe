import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCard } from "../shared/DashboardCard";

export function CampaignWizardSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-soft/60 pb-6 mb-6">
        <div className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-3.5 w-16 bg-neutral-200" />
            <span className="text-text-muted text-[10px]">&bull;</span>
            <Skeleton className="h-3.5 w-20 bg-neutral-200" />
            <span className="text-text-muted text-[10px]">&bull;</span>
            <Skeleton className="h-3.5 w-24 bg-neutral-200" />
          </div>
          <Skeleton className="h-7 w-56 bg-neutral-200 rounded-lg" />
          <Skeleton className="h-4.5 w-96 bg-neutral-200 rounded-md" />
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Skeleton className="h-9 w-20 bg-neutral-200 rounded-xl" />
          <Skeleton className="h-9 w-28 bg-neutral-200 rounded-xl" />
        </div>
      </div>

      {/* Stepper Skeleton */}
      <div className="hidden md:flex items-center justify-between bg-white/70 border border-neutral-200/50 p-4.5 rounded-2xl">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex-1 flex items-center gap-3 last:flex-initial">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full bg-neutral-200" />
              <Skeleton className="h-4 w-12 bg-neutral-200" />
            </div>
            {step < 5 && <Skeleton className="flex-1 h-0.5 bg-neutral-200 mx-4" />}
          </div>
        ))}
      </div>
      <div className="md:hidden bg-white/70 border border-neutral-200/50 p-4 rounded-xl flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 bg-neutral-200" />
          <Skeleton className="h-4 w-16 bg-neutral-200" />
        </div>
        <Skeleton className="h-2 w-full bg-neutral-200 rounded-full" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Form Section Card Skeleton (8 columns) */}
        <div className="lg:col-span-8">
          <DashboardCard className="bg-white/70 border border-neutral-200/50 p-6 sm:p-7.5 pt-8.5 space-y-6">
            <div className="border-b border-border-soft pb-4.5 space-y-2">
              <Skeleton className="h-5 w-48 bg-neutral-200" />
              <Skeleton className="h-4 w-80 bg-neutral-200" />
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-neutral-200" />
                <Skeleton className="h-10 w-full bg-neutral-200 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-36 bg-neutral-200" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} className="h-20 bg-neutral-200 rounded-xl" />
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40 bg-neutral-200" />
                <Skeleton className="h-10 w-full bg-neutral-200 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 bg-neutral-200" />
                <Skeleton className="h-28 w-full bg-neutral-200 rounded-xl" />
              </div>
            </div>
          </DashboardCard>

          <div className="flex justify-between items-center mt-6">
            <Skeleton className="h-10 w-24 bg-neutral-200 rounded-xl" />
            <Skeleton className="h-10 w-36 bg-neutral-200 rounded-xl" />
          </div>
        </div>

        {/* Right Side: Preview & Sidebar Skeleton (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Live Preview Card Skeleton */}
          <DashboardCard className="bg-white/70 border border-neutral-200/50 overflow-hidden flex flex-col h-full min-h-[300px]">
            <div className="h-28 w-full bg-neutral-200" />
            <div className="p-5 flex-1 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-44 bg-neutral-200" />
                <Skeleton className="h-4 w-full bg-neutral-200" />
                <Skeleton className="h-4 w-full bg-neutral-200" />
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-dashed border-border-soft pt-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-16 bg-neutral-200" />
                    <Skeleton className="h-4 w-20 bg-neutral-200" />
                  </div>
                ))}
              </div>
            </div>
          </DashboardCard>

          {/* Tips / Checklist Skeleton */}
          <DashboardCard className="bg-white/70 border border-neutral-200/50 p-5 space-y-4">
            <Skeleton className="h-4 w-32 bg-neutral-200" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-2.5 items-center">
                  <Skeleton className="h-4.5 w-4.5 rounded-full bg-neutral-200" />
                  <Skeleton className="h-4 w-36 bg-neutral-200" />
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}
