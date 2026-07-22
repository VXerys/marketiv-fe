import { CreatorMetricSkeleton, CreatorListSkeleton, CreatorCardSkeleton } from "./CreatorSkeleton";

interface CreatorPageSkeletonProps {
  /** Tampilkan baris kartu metrik di atas konten. */
  showMetrics?: boolean;
  /** "list" untuk daftar baris, "grid" untuk kartu, "detail" untuk halaman detail. */
  variant?: "list" | "grid" | "detail";
}

/**
 * Skeleton generik untuk route segment Kreator (dipakai oleh loading.tsx).
 * Memakai primitive yang sudah ada di CreatorSkeleton.tsx.
 */
export function CreatorPageSkeleton({
  showMetrics = true,
  variant = "list",
}: CreatorPageSkeletonProps) {
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
      ) : variant === "grid" ? (
        <CreatorCardSkeleton count={6} />
      ) : (
        <CreatorListSkeleton count={4} />
      )}
    </div>
  );
}
