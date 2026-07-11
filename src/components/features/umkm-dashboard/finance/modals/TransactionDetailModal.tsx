"use client";

import { useState } from "react";
import { X, Copy, Check, Info, ReceiptText } from "lucide-react";
import { Transaction } from "@/types/umkm-dashboard.types";
import { TransactionStatusBadge } from "../TransactionStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getTypeLabel, getReferenceLabel } from "../finance.utils";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";
import { cn } from "@/lib/utils";

interface TransactionDetailModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-lg w-full p-0 overflow-hidden rounded-[22px]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[12px] grid place-items-center bg-neutral-50 border border-neutral-200/60 text-neutral-500">
              <ReceiptText size={16} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Detail Transaksi</span>
              <h3 className="font-display text-[.9rem] font-black text-ink-950 tracking-tight mt-0.5 leading-tight">
                Resi #{transaction.id.slice(-6).toUpperCase()}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg grid place-items-center text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-sm max-h-[70vh]">
          <ResponsiveModalDescription className="hidden" />

          {/* Amount & Status Block */}
          <div className="text-center py-5 bg-gradient-to-b from-orange-50/50 to-white rounded-2xl border border-orange-200/30 space-y-2.5">
            <span className="text-[10px] font-extrabold text-neutral-400 uppercase tracking-wider block">Total Nominal</span>
            <div className={cn(
              "font-display text-2xl sm:text-3xl font-black tracking-tight",
              transaction.type === "refund" ? "text-emerald-600" : "text-primary"
            )}>
              {transaction.type === "refund" ? "+" : ""}{formatCurrency(transaction.amount)}
            </div>
            <div className="flex justify-center mt-1">
              <TransactionStatusBadge status={transaction.status} />
            </div>
          </div>

          {/* Fields List */}
          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between items-start gap-4">
              <span className="text-neutral-400 font-semibold shrink-0">ID Transaksi</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-xs text-ink-800 font-bold truncate">{transaction.id}</span>
                <button
                  onClick={handleCopyId}
                  className="p-1 hover:bg-neutral-100 rounded-md text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer shrink-0"
                  title="Salin ID"
                >
                  {isCopied ? (
                    <Check size={13} className="text-emerald-500" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              </div>
            </div>

            {transaction.midtransOrderId && (
              <div className="flex justify-between items-center gap-4">
                <span className="text-neutral-400 font-semibold">Midtrans Order ID</span>
                <span className="font-mono text-xs text-ink-800 font-bold">{transaction.midtransOrderId}</span>
              </div>
            )}

            <div className="border-t border-dashed border-neutral-200/60" />

            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400 font-semibold">Tanggal Dibuat</span>
              <span className="text-ink-800 font-bold">{formatDate(transaction.createdAt)}</span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400 font-semibold">Jenis Transaksi</span>
              <span className="text-ink-800 font-bold">{getTypeLabel(transaction.type)}</span>
            </div>

            <div className="flex justify-between items-center gap-4">
              <span className="text-neutral-400 font-semibold">Kategori Fitur</span>
              <span className="text-ink-800 font-bold">{getReferenceLabel(transaction.referenceType)}</span>
            </div>

            <div className="border-t border-dashed border-neutral-200/60" />

            <div className="space-y-1.5">
              <span className="text-neutral-400 font-semibold block">Deskripsi Transaksi</span>
              <p className="text-ink-700 font-medium leading-relaxed bg-neutral-50 p-3.5 rounded-xl border border-neutral-200/60">
                {transaction.description}
              </p>
            </div>
          </div>

          {/* Escrow Rule Alert */}
          <div className="bg-blue-50/50 border border-blue-200/40 rounded-xl p-3.5 flex items-start gap-2.5">
            <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-neutral-500 leading-relaxed font-medium">
              Platform fee Marketiv dikenakan biaya admin <strong className="text-neutral-700">15%</strong> untuk transaksi Campaign Mode dan <strong className="text-neutral-700">10%</strong> untuk negosiasi Rate Card Mode.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <ResponsiveModalFooter className="px-5 sm:px-6 py-4 border-t border-neutral-100 flex justify-end">
          <button
            onClick={onClose}
            className="inline-flex items-center min-h-[36px] px-5 rounded-xl bg-ink-950 hover:bg-primary text-white text-[.82rem] font-[800] transition-all duration-200 shadow-md hover:shadow-[0_8px_20px_rgba(234,88,12,.22)] hover:-translate-y-px cursor-pointer"
          >
            Tutup
          </button>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
