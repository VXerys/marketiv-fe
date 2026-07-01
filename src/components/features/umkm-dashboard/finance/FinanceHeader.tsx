"use client";

import Link from "next/link";
import { DashboardButton } from "../shared/DashboardButton";

interface FinanceHeaderProps {
  onTriggerExport: () => void;
}

export function FinanceHeader({ onTriggerExport }: FinanceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      {/* Page Title & Breadcrumbs */}
      <div className="space-y-1">
        <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-text-muted uppercase tracking-wider">
          <Link href="/dashboard/umkm" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-text-secondary">Keuangan & Escrow</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-none pt-0.5">
          Keuangan & Escrow
        </h1>
        <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
          Pantau pembayaran campaign, order Rate Card, dana escrow, refund, dan biaya platform Marketiv.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
        <Link href="/dashboard/umkm/campaign" passHref>
          <DashboardButton variant="soft" size="sm" className="hidden sm:inline-flex">
            Lihat Campaign Aktif
          </DashboardButton>
        </Link>
        <Link href="/dashboard/umkm/negosiasi" passHref>
          <DashboardButton variant="soft" size="sm">
            Lihat Negosiasi
          </DashboardButton>
        </Link>
        <DashboardButton variant="primary" size="sm" onClick={onTriggerExport} className="shadow-xs">
          <svg className="w-4.5 h-4.5 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Laporan
        </DashboardButton>
      </div>
    </div>
  );
}
