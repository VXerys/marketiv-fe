import { CreatorCardSkeleton, CreatorListSkeleton, CreatorMetricSkeleton } from "./creator-skeletons";

export function CreatorPageSkeleton({
  showMetrics = true,
  variant = "list",
}: {
  showMetrics?: boolean;
  variant?: "list" | "grid" | "detail";
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8" aria-busy="true">
      <div className="mb-7 space-y-2">
        <div className="h-7 w-56 rounded-md bg-neutral-200 animate-pulse" />
        <div className="h-4 w-80 max-w-full rounded-md bg-neutral-200 animate-pulse" />
      </div>
      {showMetrics && <CreatorMetricSkeleton />}
      {variant === "detail" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[340px] rounded-3xl bg-neutral-200 animate-pulse" />
            <div className="h-64 rounded-[22px] bg-neutral-100 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-44 rounded-[22px] bg-neutral-100 animate-pulse" />
            <div className="h-44 rounded-[22px] bg-neutral-100 animate-pulse" />
          </div>
        </div>
      ) : variant === "grid" ? <CreatorCardSkeleton count={6} /> : <CreatorListSkeleton count={4} />}
    </div>
  );
}
