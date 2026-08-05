"use client";

import { useState } from "react";
import type { Transaction } from "@/types/umkm-dashboard.types";
import { formatCurrency } from "@/lib/formatters";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/ui/responsive-modal";

/**
 * Aksi untuk pembayaran yang masih `pending`.
 *
 * MENGGANTIKAN PaymentSimulationModal, yang menampilkan daftar metode
 * pembayaran (BCA VA, QRIS, …) lalu `setTimeout` 1,5 detik dan menandai
 * transaksinya lunas di state lokal. Tidak ada uang yang berpindah, dan status
 * palsu itu hilang begitu halaman dimuat ulang.
 *
 * Yang benar hanya ada dua: lanjutkan ke Snap Midtrans lewat `redirect_url`
 * yang sudah dibuat `create-payment`, atau batalkan pembayarannya. Metode
 * pembayaran dipilih di halaman Midtrans, bukan di sini.
 */
interface PendingPaymentModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onCancelPayment: (paymentId: string) => Promise<void>;
}

export function PendingPaymentModal({
  transaction,
  isOpen,
  onClose,
  onCancelPayment,
}: PendingPaymentModalProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (cancelling) return;
    setCancelling(true);
    try {
      await onCancelPayment(transaction.id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full rounded-[24px] border border-neutral-200/50 p-6">
        <ResponsiveModalHeader className="sr-only">
          <ResponsiveModalTitle>Pembayaran Tertunda</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Lanjutkan atau batalkan pembayaran tertunda.
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <h3 className="text-base font-black text-[#182033]">Pembayaran Tertunda</h3>
            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
              {transaction.midtransOrderId ?? transaction.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-[10px] text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="rounded-[14px] bg-neutral-50 border border-neutral-200/50 p-4 mb-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">
              Nominal
            </span>
            <span className="text-lg font-black text-[#182033]">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        {transaction.redirectUrl ? (
          <a
            href={transaction.redirectUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 text-white font-extrabold text-xs rounded-full transition-all cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
            style={{
              background: "linear-gradient(180deg,#f97316,#ea580c)",
              boxShadow: "0 4px 14px rgba(249,115,22,.28)",
            }}
          >
            Lanjutkan Pembayaran di Midtrans
          </a>
        ) : (
          <p className="text-[11px] font-bold text-neutral-500 leading-relaxed bg-neutral-50 border border-neutral-200/50 rounded-[12px] p-3.5">
            Tautan pembayaran tidak tersedia — kemungkinan sudah kedaluwarsa. Batalkan pembayaran
            ini, lalu ulangi dari halaman pesanan.
          </p>
        )}

        <button
          type="button"
          onClick={handleCancel}
          disabled={cancelling}
          className="w-full mt-3 py-3 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-extrabold text-xs rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelling ? "Membatalkan…" : "Batalkan Pembayaran"}
        </button>

        <p className="text-[9px] text-neutral-400 font-bold mt-3 leading-relaxed text-center">
          Status pembayaran diperbarui otomatis oleh Midtrans setelah dana masuk. Muat ulang
          halaman beberapa saat setelah membayar.
        </p>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
