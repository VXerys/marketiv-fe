"use client";

import { useState } from "react";
import { DashboardButton } from "../../shared/DashboardButton";
import {
  EXPORT_FORMAT_OPTIONS,
  EXPORT_TYPE_OPTIONS,
} from "../finance.constants";
import { Transaction } from "@/types/umkm-dashboard.types";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface ExportFinanceReportModalProps {
  transactions: Transaction[];
  isOpen: boolean;
  onClose: () => void;
  onExportSuccess: (filename: string) => void;
}

const REPORT_HEADERS = [
  "ID Transaksi",
  "Tanggal",
  "Deskripsi",
  "Tipe Transaksi",
  "Kategori Fitur",
  "Nominal (IDR)",
  "Status",
  "Midtrans Order ID",
];

function getDateRangeStart(dateRange: string): Date | null {
  const now = new Date();

  if (dateRange === "this_month") {
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  if (dateRange === "last_30_days") {
    const start = new Date(now);
    start.setDate(start.getDate() - 30);
    return start;
  }

  if (dateRange === "last_3_months") {
    const start = new Date(now);
    start.setMonth(start.getMonth() - 3);
    return start;
  }

  return null;
}

function escapeCsvCell(value: string | number): string {
  const stringValue = String(value);
  return /[",\n\r]/.test(stringValue)
    ? `"${stringValue.replace(/"/g, '""')}"`
    : stringValue;
}

export function ExportFinanceReportModal({
  transactions,
  isOpen,
  onClose,
  onExportSuccess,
}: ExportFinanceReportModalProps) {
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("csv");
  const [dateRange, setDateRange] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      let filtered = [...transactions];
      if (selectedType === "campaign") {
        filtered = filtered.filter((tx) => tx.referenceType === "campaign");
      } else if (selectedType === "rate_card") {
        filtered = filtered.filter((tx) => tx.referenceType === "rate_card");
      } else if (selectedType === "refund") {
        filtered = filtered.filter((tx) => tx.type === "refund");
      }

      const rangeStart = getDateRangeStart(dateRange);
      if (rangeStart) {
        filtered = filtered.filter((tx) => {
          const transactionDate = new Date(tx.createdAt);
          return !Number.isNaN(transactionDate.getTime()) && transactionDate >= rangeStart;
        });
      }

      const rows = filtered.map((tx) => [
        tx.id,
        tx.createdAt,
        tx.description,
        tx.type,
        tx.referenceType,
        tx.amount,
        tx.status,
        tx.midtransOrderId || "-",
      ]);

      const filename = `marketiv_keuangan_umkm_${selectedType}_${new Date()
        .toISOString()
        .slice(0, 10)}.${selectedFormat}`;

      let blob: Blob;
      if (selectedFormat === "xlsx") {
        const XLSX = await import("xlsx");
        const worksheet = XLSX.utils.aoa_to_sheet([REPORT_HEADERS, ...rows]);
        worksheet["!cols"] = REPORT_HEADERS.map((header) => ({ wch: Math.max(header.length + 2, 16) }));

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Keuangan");
        const workbookBytes = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        blob = new Blob([workbookBytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
      } else {
        const csvContent = [
          REPORT_HEADERS.map(escapeCsvCell).join(","),
          ...rows.map((row) => row.map(escapeCsvCell).join(",")),
        ].join("\r\n");
        blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      }

      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onExportSuccess(filename);
    } catch {
      setExportError("Laporan gagal dibuat. Coba lagi.");
    } finally {
      setIsExporting(false);
    }
  };

  const dateRangeOptions = [
    { value: "all", label: "Semua Riwayat Transaksi" },
    { value: "this_month", label: "Bulan Ini" },
    { value: "last_30_days", label: "30 Hari Terakhir" },
    { value: "last_3_months", label: "3 Bulan Terakhir" },
  ];

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-0 overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4.5 border-b border-neutral-200/50 flex items-center justify-between bg-neutral-50/50">
          <div>
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider">Ekspor Data Laporan</span>
            <h3 className="text-sm font-extrabold text-text-primary tracking-tight mt-0.5">
              Konfigurasi Laporan Keuangan
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          <ResponsiveModalDescription className="hidden" />
          {exportError && (
            <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-red-700 font-semibold">
              {exportError}
            </p>
          )}
          
          {/* Type Option */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
              Cakupan Data Laporan
            </label>
            <div className="space-y-1.5">
              {EXPORT_TYPE_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                    selectedType === opt.value
                      ? "bg-brand-coral/5 border-primary/30 text-text-primary"
                      : "bg-white border-neutral-200/60 hover:bg-neutral-50 text-text-secondary"
                  }`}
                >
                  <input
                    type="radio"
                    name="export_type"
                    value={opt.value}
                    checked={selectedType === opt.value}
                    disabled={isExporting}
                    onChange={() => setSelectedType(opt.value)}
                    className="accent-primary"
                  />
                  <span className="font-bold">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
              Rentang Waktu
            </label>
            <select
              value={dateRange}
              disabled={isExporting}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-text-primary font-semibold focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
            >
              {dateRangeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format Option */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
              Format File Output
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {EXPORT_FORMAT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setSelectedFormat(opt.value)}
                  className={`p-3.5 rounded-xl border text-center font-extrabold flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    selectedFormat === opt.value
                      ? "bg-brand-coral/5 border-primary/30 text-primary"
                      : "bg-white border-neutral-200/60 hover:bg-neutral-50 text-text-secondary"
                  }`}
                >
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <ResponsiveModalFooter className="px-5 py-4 border-t border-neutral-200/50 bg-neutral-50/50 flex justify-end gap-3">
          <DashboardButton variant="soft" onClick={onClose} disabled={isExporting} size="sm">
            Batal
          </DashboardButton>
          <DashboardButton
            variant="primary"
            onClick={handleExport}
            disabled={isExporting}
            size="sm"
          >
            {isExporting ? (
              <span className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Mengekspor...
              </span>
            ) : "Unduh Laporan"}
          </DashboardButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
