"use client";

import { DashboardMetricCard } from "../shared/DashboardMetricCard";
import { NegotiationOrder } from "@/types/umkm-dashboard.types";

interface NegotiationSummaryCardsProps {
  negotiations: NegotiationOrder[];
}

export function NegotiationSummaryCards({ negotiations }: NegotiationSummaryCardsProps) {
  // Compute counts
  const activeCount = negotiations.filter((n) => n.status === "negotiation").length;
  const waitingPaymentCount = negotiations.filter((n) => n.status === "waiting_payment").length;
  
  // Escrow includes active escrow projects (escrow, revision, waiting_verification)
  const escrowCount = negotiations.filter((n) => 
    ["escrow", "revision", "waiting_verification"].includes(n.status)
  ).length;

  const completedCount = negotiations.filter((n) => n.status === "completed").length;
  const disputeCount = negotiations.filter((n) => n.status === "dispute").length;

  // Escrow value locked sum
  const escrowLockedValue = negotiations
    .filter((n) => ["escrow", "revision", "waiting_verification"].includes(n.status))
    .reduce((sum, n) => sum + n.finalPrice, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 mb-6">
      <DashboardMetricCard
        label="Negosiasi Aktif"
        value={activeCount}
        helperText="Perlu tanggapan"
        variant="elevated"
        icon={
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        }
      />
      <DashboardMetricCard
        label="Menunggu Bayar"
        value={waitingPaymentCount}
        helperText="Tawaran disetujui"
        variant="elevated"
        icon={
          <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        }
      />
      <DashboardMetricCard
        label="Dalam Escrow"
        value={escrowLockedValue}
        helperText={`${escrowCount} Proyek Aktif`}
        isFullCurrency
        variant="elevated"
        icon={
          <svg className="w-5 h-5 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />
      <DashboardMetricCard
        label="Selesai"
        value={completedCount}
        helperText="Kerja sama sukses"
        variant="elevated"
        icon={
          <svg className="w-5 h-5 text-info" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />
      <DashboardMetricCard
        label="Dispute"
        value={disputeCount}
        helperText="Sengketa aktif"
        variant="elevated"
        icon={
          <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
    </div>
  );
}
