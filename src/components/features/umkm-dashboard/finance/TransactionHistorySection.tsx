"use client";

import { Transaction } from "@/types/umkm-dashboard.types";
import { TransactionTable } from "./TransactionTable";
import { TransactionCard } from "./TransactionCard";
import { FinanceEmptyState } from "./FinanceEmptyState";

interface TransactionHistorySectionProps {
  transactions: Transaction[];
  onOpenDetails: (transaction: Transaction) => void;
  onOpenPayment: (transaction: Transaction) => void;
  isFiltered?: boolean;
  onResetFilters?: () => void;
}

export function TransactionHistorySection({
  transactions,
  onOpenDetails,
  onOpenPayment,
  isFiltered = false,
  onResetFilters,
}: TransactionHistorySectionProps) {
  if (transactions.length === 0) {
    return <FinanceEmptyState isFiltered={isFiltered} onResetFilters={onResetFilters} />;
  }

  return (
    <div className="space-y-4">
      {/* Desktop/Tablet view */}
      <div className="hidden md:block">
        <TransactionTable
          transactions={transactions}
          onOpenDetails={onOpenDetails}
          onOpenPayment={onOpenPayment}
        />
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3.5">
        {transactions.map((tx) => (
          <TransactionCard
            key={tx.id}
            transaction={tx}
            onOpenDetails={onOpenDetails}
            onOpenPayment={onOpenPayment}
          />
        ))}
      </div>
    </div>
  );
}
