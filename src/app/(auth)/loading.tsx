import { Skeleton } from "@/components/ui/skeleton";

/** Skeleton berbentuk kartu auth — bukan spinner generik (DoD Studio System). */
export default function AuthLoading() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-3xs sm:p-8">
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-[44px] w-full rounded-xl" />
        <Skeleton className="h-[44px] w-full rounded-xl" />
        <Skeleton className="h-[44px] w-full rounded-xl" />
      </div>
    </div>
  );
}
