"use client";

import { ChevronRight } from "lucide-react";
import { Transaction } from "@/types/umkm-dashboard.types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTypeLabel, getReferenceLabel } from "./finance.utils";
import { cn } from "@/lib/utils";

interface TransactionTableProps {
  transactions: Transaction[];
  onOpenDetails: (transaction: Transaction) => void;
  onOpenPayment: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onOpenDetails, onOpenPayment }: TransactionTableProps) {
  return (
    <div className="w-full overflow-x-auto border border-neutral-200/80 bg-white rounded-2xl shadow-3xs">
      <table className="w-full min-w-[768px] text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-200/60 bg-neutral-50/60 text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider">
            <th className="px-5 py-4">Tanggal</th>
            <th className="px-5 py-4">Deskripsi</th>
            <th className="px-5 py-4">Jenis Transaksi</th>
            <th className="px-5 py-4">Jenis Layanan</th>
            <th className="px-5 py-4 text-right">Jumlah</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-center">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 text-xs">
          {transactions.map((tx) => (
            <tr
              key={tx.id}
              onClick={() => onOpenDetails(tx)}
              className="hover:bg-orange-50/30 cursor-pointer transition-colors group"
            >
              <td className="px-5 py-4 whitespace-nowrap text-neutral-500 font-semibold">
                {formatDate(tx.createdAt)}
              </td>
              <td className="px-5 py-4 max-w-sm">
                <div className="font-bold text-ink-900 truncate group-hover:text-primary transition-colors duration-200">
                  {tx.description}
                </div>
                <div className="text-[9px] font-mono text-neutral-400 mt-0.5">#{tx.id}</div>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="font-bold text-neutral-600">{getTypeLabel(tx.type)}</span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <span className="font-bold text-neutral-600">{getReferenceLabel(tx.referenceType)}</span>
              </td>
              <td className="px-5 py-4 text-right whitespace-nowrap">
                <span className={cn(
                  "font-display font-black text-sm tracking-tight",
                  tx.type === "refund" ? "text-emerald-600" : "text-ink-900"
                )}>
                  {tx.type === "refund" ? "+" : ""}{formatCurrency(tx.amount)}
                </span>
              </td>
              <td className="px-5 py-4 whitespace-nowrap">
                <TransactionStatusBadge status={tx.status} />
              </td>
              <td className="px-5 py-4 text-center whitespace-nowrap">
                <div className="flex justify-center items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onOpenDetails(tx)}
                    className="inline-flex items-center gap-1 min-h-[30px] px-3 rounded-lg border border-neutral-200/60 bg-white text-neutral-600 text-[11px] font-bold hover:bg-neutral-50 hover:text-neutral-800 transition-all cursor-pointer shadow-3xs"
                  >
                    Detail
                    <ChevronRight size={12} className="text-neutral-400" />
                  </button>
                  {tx.status === "pending" && (
                    <button
                      onClick={() => onOpenPayment(tx)}
                      className="inline-flex items-center min-h-[30px] px-3 rounded-lg border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-[11px] font-[800] shadow-[0_6px_16px_rgba(234,88,12,.18)] hover:shadow-[0_10px_24px_rgba(234,88,12,.25)] hover:-translate-y-px transition-all cursor-pointer"
                    >
                      Bayar
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Table footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-neutral-100 bg-neutral-50/40">
        <span className="text-[11px] font-bold text-neutral-400">
          Menampilkan {transactions.length} transaksi
        </span>
        <span className="text-[11px] font-semibold text-neutral-400 hidden sm:inline">
          Klik baris untuk melihat rincian
        </span>
      </div>
    </div>
  );
}
