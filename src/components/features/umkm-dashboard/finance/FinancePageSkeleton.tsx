"use client";

import { FinanceSummaryCardsSkeleton } from "./FinanceSummaryCardsSkeleton";
import { TransactionListSkeleton } from "./TransactionListSkeleton";

export function FinancePageSkeleton() {
  return (
    <div className="space-y-6 max-w-[1280px] mx-auto pb-20">
      {/* Header Skeleton */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2.5">
          <div className="h-3 w-28 bg-neutral-200 rounded animate-pulse" />
          <div className="h-7 w-52 bg-neutral-200 rounded animate-pulse" />
          <div className="h-4 w-80 max-w-full bg-neutral-200 rounded animate-pulse" />
        </div>
        <div className="flex items-center gap-2.5">
          <div className="h-[42px] w-28 bg-neutral-200 rounded-xl animate-pulse hidden sm:block" />
          <div className="h-[46px] w-36 bg-neutral-200 rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Summary Cards Shimmer */}
      <FinanceSummaryCardsSkeleton />

      {/* Escrow Card Skeleton */}
      <div className="border border-neutral-200/80 rounded-2xl sm:rounded-[22px] bg-white p-5 sm:p-6 space-y-6 animate-pulse">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-[14px] bg-neutral-100" />
          <div className="space-y-2 flex-1">
            <div className="h-4.5 w-52 bg-neutral-200 rounded" />
            <div className="h-3 w-80 max-w-full bg-neutral-100 rounded" />
          </div>
          <div className="h-7 w-28 bg-neutral-200 rounded-full" />
        </div>
        <div className="h-24 bg-neutral-50 border border-neutral-200/60 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-28 bg-neutral-50 rounded-2xl border border-neutral-200/60" />
          <div className="h-28 bg-neutral-50 rounded-2xl border border-neutral-200/60" />
        </div>
      </div>

      {/* Toolbar Skeleton */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-3xs space-y-4 animate-pulse">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="h-9 flex-1 bg-neutral-100 rounded-xl" />
          <div className="h-9 w-36 bg-neutral-100 rounded-xl" />
          <div className="h-9 w-32 bg-neutral-100 rounded-xl" />
          <div className="h-9 w-28 bg-neutral-100 rounded-xl" />
        </div>
        <div className="border-t border-neutral-100 pt-3 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-24 bg-neutral-100 rounded-full" />
          ))}
        </div>
      </div>

      {/* Table / List Shimmer */}
      <TransactionListSkeleton />
    </div>
  );
}
