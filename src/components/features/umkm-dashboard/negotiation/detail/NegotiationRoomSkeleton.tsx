"use client";

export function NegotiationRoomSkeleton() {
  return (
    <div className="space-y-6 animate-pulse max-w-7xl mx-auto">
      {/* Back button skeleton */}
      <div className="h-4 w-28 bg-neutral-200 rounded-md" />

      {/* Header Skeleton */}
      <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 h-20 flex justify-between items-center">
        <div className="flex gap-4">
          <div className="h-10 w-10 bg-neutral-200 rounded-lg" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-neutral-200 rounded-md" />
            <div className="h-3 w-48 bg-neutral-200 rounded-md" />
          </div>
        </div>
        <div className="h-9 w-28 bg-neutral-200 rounded-lg" />
      </div>

      {/* Main Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left main: Chat area (span 2) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Warning Banner Skeleton */}
          <div className="h-12 bg-neutral-200 rounded-xl" />
          
          {/* Messages Timeline */}
          <div className="rounded-2xl border border-neutral-200/50 bg-white p-5 min-h-[400px] flex flex-col justify-end space-y-4">
            <div className="h-10 w-1/3 bg-neutral-200 rounded-xl align-self-start" />
            <div className="h-10 w-1/2 bg-neutral-200 rounded-xl self-end" />
            <div className="h-8 w-1/4 bg-neutral-200 rounded-md self-center" />
            <div className="h-32 w-full bg-neutral-200 rounded-xl" />
            <div className="h-10 w-1/3 bg-neutral-200 rounded-xl align-self-start" />
          </div>

          {/* Composer Skeleton */}
          <div className="h-12 bg-neutral-200 rounded-xl" />
        </div>

        {/* Right side: Sidebar (span 1) */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200/50 rounded-2xl h-48" />
          <div className="bg-white border border-neutral-200/50 rounded-2xl h-60" />
          <div className="bg-white border border-neutral-200/50 rounded-2xl h-36" />
        </div>
      </div>
    </div>
  );
}
