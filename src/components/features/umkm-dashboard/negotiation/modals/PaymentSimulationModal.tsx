"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";
import { calculatePlatformFee, calculateTotalPayment } from "../negotiation.utils";

interface PaymentSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  finalPrice: number;
}

export function PaymentSimulationModal({
  isOpen,
  onClose,
  onConfirm,
  finalPrice,
}: PaymentSimulationModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>("va");

  if (!isOpen) return null;

  const platformFee = calculatePlatformFee(finalPrice);
  const totalPayment = calculateTotalPayment(finalPrice);


  const paymentMethods = [
    { id: "va", name: "Bank Transfer Virtual Account", desc: "BNI, Mandiri, BCA, BRI" },
    { id: "qris", name: "QRIS Cashback", desc: "Gopay, OVO, Dana, LinkAja, ShopeePay" },
    { id: "wallet", name: "Saldo Dompet Marketiv", desc: "Bayar instan via saldo platform" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-main/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-lg border border-neutral-200/50 space-y-6 animate-in scale-in duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border-soft pb-4">
          <div className="h-10 w-10 rounded-full bg-primary-50 text-primary border border-primary-100 flex items-center justify-center shadow-2xs shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-text-primary uppercase tracking-wider leading-none">
              Deposit Dana Escrow
            </h3>
            <span className="text-[10px] text-text-muted mt-1 block">
              Simulasi deposit dana untuk mengaktifkan order pengerjaan kreator.
            </span>
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="bg-neutral-50/70 p-4.5 rounded-2xl border border-border-soft/60 space-y-2.5 text-xs font-semibold text-text-secondary">
          <div className="flex items-center justify-between text-text-muted">
            <span>Harga Negosiasi Final</span>
            <span className="font-extrabold text-text-primary">{formatCurrency(finalPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-text-muted">
            <span>Biaya Rekening Escrow (10%)</span>
            <span className="font-extrabold text-text-primary">{formatCurrency(platformFee)}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-dashed border-border-soft text-text-primary">
            <span className="font-extrabold">Total Pembayaran Anda</span>
            <span className="text-sm sm:text-base font-extrabold text-primary">{formatCurrency(totalPayment)}</span>
          </div>
        </div>

        {/* Disclaimer alert */}
        <div className="rounded-xl bg-primary-50/15 border border-primary-100/35 p-3 flex gap-2 items-start text-[9px] text-text-muted leading-relaxed font-semibold">
          <span className="h-4.5 w-4.5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
            i
          </span>
          <span>
            <strong>Simulasi Demo:</strong> Integrasi gateway Midtrans Snap SDK dan Appwrite Webhook akan digunakan di tahap integrasi backend riil.
          </span>
        </div>

        {/* Methods */}
        <div className="space-y-3">
          <span className="block text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
            Pilih Metode Pembayaran
          </span>
          <div className="space-y-2">
            {paymentMethods.map((pm) => {
              const isSelected = selectedMethod === pm.id;
              return (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => setSelectedMethod(pm.id)}
                  className={`w-full text-left p-3 rounded-xl border flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? "bg-primary-50/40 border-primary shadow-2xs"
                      : "bg-white border-neutral-200/60 hover:bg-neutral-50"
                  }`}
                >
                  <div className="min-w-0">
                    <span className={`block text-xs font-bold ${isSelected ? "text-primary" : "text-text-primary"}`}>
                      {pm.name}
                    </span>
                    <span className="block text-[10px] text-text-muted truncate mt-0.5 font-semibold">
                      {pm.desc}
                    </span>
                  </div>
                  <span className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected ? "border-primary bg-primary text-white" : "border-neutral-300 bg-white"
                  }`}>
                    {isSelected && <span className="h-1.5 w-1.5 bg-white rounded-full" />}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full border-t border-border-soft/60 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-text-secondary text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer border border-primary hover:border-primary-600 shadow-xs text-center select-none"
          >
            Konfirmasi Deposit
          </button>
        </div>

      </div>
    </div>
  );
}
