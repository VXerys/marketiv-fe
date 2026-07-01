"use client";

import { useState } from "react";
import { Transaction } from "@/types/umkm-dashboard.types";
import { DashboardCard } from "../../shared/DashboardCard";
import { DashboardButton } from "../../shared/DashboardButton";
import { formatCurrency } from "@/lib/formatters";

interface PaymentSimulationModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: (transactionId: string) => void;
}

type PaymentMethod = "bca_va" | "mandiri_va" | "bni_va" | "qris" | "gopay";

export function PaymentSimulationModal({
  transaction,
  isOpen,
  onClose,
  onPaymentSuccess,
}: PaymentSimulationModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bca_va");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulate API processing delay
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess(transaction.id);
    }, 1500);
  };

  const paymentMethods = [
    { id: "bca_va", name: "BCA Virtual Account", group: "Virtual Account" },
    { id: "mandiri_va", name: "Mandiri Bill Payment", group: "Virtual Account" },
    { id: "bni_va", name: "BNI Virtual Account", group: "Virtual Account" },
    { id: "qris", name: "QRIS (GoPay, OVO, ShopeePay, Dana)", group: "Instant Payment" },
    { id: "gopay", name: "GoPay E-Wallet", group: "E-Wallet" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-950/45 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative w-full max-w-md z-10 transition-all duration-300 transform scale-100">
        <DashboardCard variant="elevated" className="overflow-hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-neutral-200/50 flex items-center justify-between bg-neutral-50/50">
            <div>
              <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Simulasi Pembayaran Midtrans</span>
              <h3 className="text-sm font-extrabold text-text-primary tracking-tight mt-0.5">
                Gateway Sandbox Marketiv
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
              aria-label="Tutup"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Sandbox Banner */}
          <div className="bg-amber-50 border-b border-amber-200/50 px-5 py-3 flex gap-3 text-xs text-amber-800">
            <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="leading-relaxed">
              <strong>Mode Demo Teraktifkan:</strong> Halaman ini mensimulasikan sistem escrow dan checkout payment gateway. Tidak ada dana nyata yang ditarik.
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            {/* Invoice Details */}
            <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200/40">
              <div className="flex justify-between items-center text-xs text-text-muted font-medium">
                <span>ID Transaksi</span>
                <span className="font-mono">{transaction.id}</span>
              </div>
              <div className="text-xs text-text-primary font-semibold line-clamp-2">
                {transaction.description}
              </div>
              <div className="h-px bg-neutral-200/50 my-1" />
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-text-secondary font-bold">Total Pembayaran</span>
                <span className="text-base font-extrabold text-primary">{formatCurrency(transaction.amount)}</span>
              </div>
            </div>

            {/* Methods Options */}
            <div className="space-y-2.5">
              <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                Pilih Metode Pembayaran
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedMethod === method.id
                        ? "bg-brand-coral/5 border-primary/40 text-text-primary shadow-xs"
                        : "bg-white border-neutral-200/60 hover:bg-neutral-50 text-text-secondary"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      disabled={isProcessing}
                      onChange={() => setSelectedMethod(method.id as PaymentMethod)}
                      className="accent-primary w-4 h-4"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate">{method.name}</div>
                      <div className="text-[9px] text-text-muted mt-0.5">{method.group}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4.5 border-t border-neutral-200/50 bg-neutral-50/50 flex items-center justify-between gap-4">
            <DashboardButton variant="soft" onClick={onClose} disabled={isProcessing} size="sm">
              Batal
            </DashboardButton>
            <DashboardButton
              variant="primary"
              onClick={handleSimulatePayment}
              disabled={isProcessing}
              size="sm"
              className="px-6"
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : "Bayar Sekarang"}
            </DashboardButton>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
