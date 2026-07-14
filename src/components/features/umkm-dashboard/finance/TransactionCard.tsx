"use client";

import { ChevronRight } from "lucide-react";
import { Transaction } from "@/types/umkm-dashboard.types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTypeLabel, getReferenceLabel } from "./finance.utils";
import { cn } from "@/lib/utils";

interface TransactionCardProps {
  transaction: Transaction;
  onOpenDetails: (transaction: Transaction) => void;
  onOpenPayment: (transaction: Transaction) => void;
}

export function TransactionCard({ transaction, onOpenDetails, onOpenPayment }: TransactionCardProps) {
  return (
    <div
      onClick={() => onOpenDetails(transaction)}
      className="group rounded-2xl border border-neutral-200/80 bg-gradient-to-b from-white to-neutral-50/30 shadow-3xs p-4 space-y-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
    >
      {/* Upper Info Row */}
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1.5 min-w-0 flex-1">
          <span className="text-[.68rem] font-extrabold text-neutral-400 uppercase tracking-wider block">
            {formatDate(transaction.createdAt)}
          </span>
          <h4 className="text-[.84rem] font-bold text-ink-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-200">
            {transaction.description}
          </h4>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[9.5px] font-extrabold bg-neutral-50 border border-neutral-200/60 px-2 py-[3px] rounded-full text-neutral-500">
              {getTypeLabel(transaction.type)}
            </span>
            <span className="text-[9.5px] font-extrabold bg-neutral-50 border border-neutral-200/60 px-2 py-[3px] rounded-full text-neutral-500">
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
          <span className="text-[.66rem] font-extrabold text-neutral-400 uppercase tracking-wider block">
            Nominal
          </span>
          <span className={cn(
            "font-display text-[1rem] font-black tracking-tight",
            transaction.type === "refund" ? "text-emerald-600" : "text-ink-900"
          )}>
            {transaction.type === "refund" ? "+" : ""}{formatCurrency(transaction.amount)}
          </span>
        </div>

        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => onOpenDetails(transaction)}
            className="inline-flex items-center gap-1 min-h-[32px] px-3 rounded-xl border border-neutral-200/60 bg-white text-neutral-600 text-[11px] font-bold hover:bg-neutral-50 hover:text-neutral-800 transition-all cursor-pointer shadow-3xs"
          >
            Detail
            <ChevronRight size={12} className="text-neutral-400" />
          </button>
          {transaction.status === "pending" && (
            <button
              onClick={() => onOpenPayment(transaction)}
              className="inline-flex items-center min-h-[32px] px-3.5 rounded-xl border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-[11px] font-[800] shadow-[0_6px_16px_rgba(234,88,12,.18)] hover:shadow-[0_10px_24px_rgba(234,88,12,.25)] hover:-translate-y-px transition-all cursor-pointer"
            >
              Bayar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
