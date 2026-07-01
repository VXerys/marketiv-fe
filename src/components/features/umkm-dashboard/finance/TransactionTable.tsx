"use client";

import { Transaction } from "@/types/umkm-dashboard.types";
import { DashboardButton } from "../shared/DashboardButton";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTypeLabel, getReferenceLabel } from "./finance.utils";

interface TransactionTableProps {
  transactions: Transaction[];
  onOpenDetails: (transaction: Transaction) => void;
  onOpenPayment: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onOpenDetails, onOpenPayment }: TransactionTableProps) {
  return (
    <div className="w-full border border-neutral-200/50 bg-white/70 rounded-2xl overflow-hidden backdrop-blur-md shadow-xs">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-200/50 bg-neutral-50/50 text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
            <th className="px-6 py-4.5">Tanggal</th>
            <th className="px-6 py-4.5">Deskripsi</th>
            <th className="px-6 py-4.5">Tipe</th>
            <th className="px-6 py-4.5">Fitur</th>
            <th className="px-6 py-4.5 text-right">Nominal</th>
            <th className="px-6 py-4.5">Status</th>
            <th className="px-6 py-4.5 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200/40 text-xs">
          {transactions.map((tx) => (
            <tr key={tx.id} className="hover:bg-neutral-50/25 transition-colors">
              <td className="px-6 py-4.5 whitespace-nowrap text-text-secondary font-semibold">
                {formatDate(tx.createdAt)}
              </td>
              <td className="px-6 py-4.5 max-w-sm">
                <div className="font-bold text-text-primary truncate">{tx.description}</div>
                <div className="text-[9.5px] font-mono text-text-muted mt-0.5">#{tx.id}</div>
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap">
                <span className="font-bold text-text-secondary">{getTypeLabel(tx.type)}</span>
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap">
                <span className="font-bold text-text-secondary">{getReferenceLabel(tx.referenceType)}</span>
              </td>
              <td className="px-6 py-4.5 text-right whitespace-nowrap font-black text-text-primary">
                {formatCurrency(tx.amount)}
              </td>
              <td className="px-6 py-4.5 whitespace-nowrap">
                <TransactionStatusBadge status={tx.status} />
              </td>
              <td className="px-6 py-4.5 text-center whitespace-nowrap">
                <div className="flex justify-center items-center gap-1.5">
                  <DashboardButton
                    variant="soft"
                    size="sm"
                    onClick={() => onOpenDetails(tx)}
                  >
                    Detail
                  </DashboardButton>
                  {tx.status === "pending" && (
                    <DashboardButton
                      variant="primary"
                      size="sm"
                      onClick={() => onOpenPayment(tx)}
                    >
                      Bayar
                    </DashboardButton>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
