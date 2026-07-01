"use client";

import { useState } from "react";
import { Transaction } from "@/types/umkm-dashboard.types";
import { DashboardCard } from "../../shared/DashboardCard";
import { DashboardButton } from "../../shared/DashboardButton";
import { TransactionStatusBadge } from "../TransactionStatusBadge";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { getStatusLabel, getTypeLabel, getReferenceLabel } from "../finance.utils";

interface TransactionDetailModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({ transaction, isOpen, onClose }: TransactionDetailModalProps) {
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(transaction.id);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg z-10 transition-all duration-300 transform scale-100">
        <DashboardCard variant="elevated" className="max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="px-5 py-4.5 border-b border-neutral-200/50 flex items-center justify-between bg-neutral-50/50">
            <div>
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Detail Transaksi</span>
              <h3 className="text-base font-extrabold text-text-primary tracking-tight mt-0.5">
                Resi #{transaction.id.slice(-6).toUpperCase()}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 text-sm">
            {/* Amount & Status Block */}
            <div className="text-center space-y-2 py-4 bg-brand-coral/5 rounded-2xl border border-brand-coral/10">
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">Total Nominal</span>
              <div className="text-2xl sm:text-3xl font-black text-primary tracking-tight">
                {formatCurrency(transaction.amount)}
              </div>
              <div className="flex justify-center mt-1">
                <TransactionStatusBadge status={transaction.status} />
              </div>
            </div>

            {/* Fields List */}
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <span className="text-text-muted font-medium shrink-0">ID Transaksi</span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-mono text-xs text-text-primary truncate">{transaction.id}</span>
                  <button
                    onClick={handleCopyId}
                    className="p-1 hover:bg-neutral-100 rounded text-text-secondary hover:text-text-primary transition-colors cursor-pointer shrink-0"
                    title="Salin ID"
                  >
                    {isCopied ? (
                      <svg className="w-3.5 h-3.5 text-success animate-scale" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {transaction.midtransOrderId && (
                <div className="flex justify-between items-center gap-4">
                  <span className="text-text-muted font-medium">Midtrans Order ID</span>
                  <span className="font-mono text-xs text-text-primary">{transaction.midtransOrderId}</span>
                </div>
              )}

              <div className="h-px bg-neutral-200/50" />

              <div className="flex justify-between items-center gap-4">
                <span className="text-text-muted font-medium">Tanggal Dibuat</span>
                <span className="text-text-primary font-semibold">{formatDate(transaction.createdAt)}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-text-muted font-medium">Jenis Transaksi</span>
                <span className="text-text-primary font-semibold">{getTypeLabel(transaction.type)}</span>
              </div>

              <div className="flex justify-between items-center gap-4">
                <span className="text-text-muted font-medium">Kategori Fitur</span>
                <span className="text-text-primary font-semibold">{getReferenceLabel(transaction.referenceType)}</span>
              </div>

              <div className="h-px bg-neutral-200/50" />

              <div className="space-y-1">
                <span className="text-text-muted font-medium block">Deskripsi Transaksi</span>
                <p className="text-text-primary font-medium leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200/30">
                  {transaction.description}
                </p>
              </div>
            </div>

            {/* Escrow Rule Alert */}
            <div className="bg-neutral-50/70 border border-neutral-200/40 rounded-xl p-3.5 flex items-start gap-3">
              <svg className="w-5 h-5 text-brand-navy/60 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-[11px] text-text-muted leading-relaxed">
                Platform fee Marketiv dikenakan biaya admin <strong className="text-text-secondary">15%</strong> untuk transaksi Campaign Mode dan <strong className="text-text-secondary">10%</strong> untuk negosiasi Rate Card Mode.
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4.5 border-t border-neutral-200/50 bg-neutral-50/50 flex justify-end">
            <DashboardButton variant="soft" onClick={onClose} size="sm">
              Tutup
            </DashboardButton>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
