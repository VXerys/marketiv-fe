"use client";

import { DashboardCard } from "../shared/DashboardCard";
import { FinanceSummaryCardsSkeleton } from "./FinanceSummaryCardsSkeleton";
import { TransactionListSkeleton } from "./TransactionListSkeleton";

export function FinancePageSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2.5">
          {/* Breadcrumbs */}
          <div className="h-3.5 w-32 bg-neutral-200 rounded animate-pulse" />
          {/* Title */}
          <div className="h-6.5 w-48 bg-neutral-200 rounded animate-pulse" />
          {/* Subtitle */}
          <div className="h-4 w-96 max-w-full bg-neutral-200 rounded animate-pulse" />
        </div>
        {/* Export CTA Button */}
        <div className="h-10 w-36 bg-neutral-200 rounded-xl shrink-0 animate-pulse" />
      </div>

      {/* Summary Cards Shimmer */}
      <FinanceSummaryCardsSkeleton />

      {/* Escrow Visualization Card Skeleton */}
      <DashboardCard variant="default" className="p-5 sm:p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-4.5 w-44 bg-neutral-200 rounded animate-pulse" />
            <div className="h-3 w-80 max-w-full bg-neutral-200 rounded animate-pulse" />
          </div>
          <div className="h-8 w-24 bg-neutral-200 rounded-full animate-pulse" />
        </div>

        <div className="h-20 bg-neutral-50 border border-neutral-200/40 rounded-xl animate-pulse" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-16 bg-neutral-100/50 rounded-xl animate-pulse" />
          <div className="h-16 bg-neutral-100/50 rounded-xl animate-pulse" />
        </div>
      </DashboardCard>

      {/* Toolbar / Search Skeleton */}
      <div className="space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="h-10 flex-1 bg-neutral-200 rounded-xl animate-pulse" />
          <div className="h-10 w-40 bg-neutral-200 rounded-xl animate-pulse" />
          <div className="h-10 w-32 bg-neutral-200 rounded-xl animate-pulse" />
        </div>
        <div className="h-8 w-60 bg-neutral-200 rounded-full animate-pulse" />
      </div>

      {/* Table / List Shimmer */}
      <TransactionListSkeleton />
    </div>
  );
}
