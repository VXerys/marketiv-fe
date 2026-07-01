"use client";

import { Transaction } from "@/types/umkm-dashboard.types";
import { DashboardCard } from "../shared/DashboardCard";
import { DashboardButton } from "../shared/DashboardButton";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTypeLabel, getReferenceLabel } from "./finance.utils";

interface TransactionCardProps {
  transaction: Transaction;
  onOpenDetails: (transaction: Transaction) => void;
  onOpenPayment: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onOpenDetails, onOpenPayment }: TransactionCardProps) {
  return (
    <DashboardCard variant="default" className="p-4 space-y-4">
      {/* Upper Info Row */}
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider block">
            {formatDate(transaction.createdAt)}
          </span>
          <h4 className="text-xs font-bold text-text-primary line-clamp-2">
            {transaction.description}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[9.5px] font-extrabold bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded text-text-muted">
              {getTypeLabel(transaction.type)}
            </span>
            <span className="text-[9.5px] font-extrabold bg-neutral-100 border border-neutral-200/50 px-2 py-0.5 rounded text-text-muted">
              {getReferenceLabel(transaction.referenceType)}
            </span>
          </div>
        </div>
        <TransactionStatusBadge status={transaction.status} className="shrink-0" />
      </div>

      <div className="h-px bg-neutral-200/50" />

      {/* Amount & Actions */}
      <div className="flex justify-between items-center gap-4">
        <div className="space-y-0.5">
          <span className="text-[8.5px] font-extrabold text-text-muted uppercase tracking-wider block">
            Nominal
          </span>
          <span className="text-sm font-extrabold text-text-primary">
            {formatCurrency(transaction.amount)}
          </span>
        </div>

        <div className="flex gap-2">
          <DashboardButton
            variant="soft"
            size="sm"
            onClick={() => onOpenDetails(transaction)}
          >
            Detail
          </DashboardButton>
          {transaction.status === "pending" && (
            <DashboardButton
              variant="primary"
              size="sm"
              onClick={() => onOpenPayment(transaction)}
            >
              Bayar
            </DashboardButton>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}
