import { Skeleton } from "@/components/ui/skeleton";

interface UmkmPageSkeletonProps {
  /** Tampilkan baris kartu metrik di atas konten. */
  showMetrics?: boolean;
  /** "list" untuk halaman daftar, "detail" untuk halaman detail 2 kolom. */
  variant?: "list" | "detail";
}

/**
 * Skeleton generik untuk route segment UMKM (dipakai oleh loading.tsx).
 * Bentuknya meniru kerangka halaman: header → metrik → konten.
 */
export function UmkmPageSkeleton({
  showMetrics = true,
  variant = "list",
}: UmkmPageSkeletonProps) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" aria-busy="true">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>

      {showMetrics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      )}

      {variant === "detail" ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-52 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-40 rounded-3xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-12 rounded-2xl" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      )}
    </div>
  );
}
