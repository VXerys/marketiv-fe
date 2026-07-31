"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { DashboardButton } from "../../shared";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "@/components/ui/responsive-modal";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Baris yang akan diekspor. Tiap objek = satu baris; key = nama kolom.
   * Dipasok pemanggil sehingga modal tidak perlu tahu struktur data.
   */
  rows: Record<string, unknown>[];
  /** Nama file tanpa ekstensi, mis. "Laporan_Campaign_Marketiv". */
  filename: string;
}

export function ExportReportModal({ isOpen, onClose, rows, filename }: ExportReportModalProps) {
  const [formatType, setFormatType] = useState<"csv" | "excel">("csv");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExport = () => {
    if (rows.length === 0) return;
    setIsGenerating(true);

    try {
      const ws = XLSX.utils.json_to_sheet(rows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data");

      if (formatType === "csv") {
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${filename}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        XLSX.writeFile(wb, `${filename}.xlsx`);
      }
    } finally {
      setIsGenerating(false);
      onClose();
    }
  };

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveModalContent className="max-w-md w-full p-6">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle className="text-lg font-bold text-text-primary">
            Export Laporan Kemajuan
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-sm text-text-secondary leading-relaxed">
            {rows.length > 0
              ? `${rows.length} baris data siap diekspor. Pilih format yang diinginkan.`
              : "Tidak ada data untuk diekspor."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Format Options */}
        <div className="mb-6 mt-4">
          <span className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">
            Format Dokumen
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer select-none bg-neutral-50 hover:bg-neutral-100 transition-colors border-border-soft">
              <input
                type="radio"
                name="format"
                className="h-4 w-4 text-primary focus:ring-primary accent-primary border"
                checked={formatType === "csv"}
                onChange={() => setFormatType("csv")}
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-text-primary leading-none">Format CSV</span>
                <span className="text-[10px] text-text-muted mt-0.5 inline-block">Untuk spreadsheet / raw data</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3 border rounded-xl cursor-pointer select-none bg-neutral-50 hover:bg-neutral-100 transition-colors border-border-soft">
              <input
                type="radio"
                name="format"
                className="h-4 w-4 text-primary focus:ring-primary accent-primary border"
                checked={formatType === "excel"}
                onChange={() => setFormatType("excel")}
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-text-primary leading-none">Format Excel (.xlsx)</span>
                <span className="text-[10px] text-text-muted mt-0.5 inline-block">Visualisasi spreadsheet rapi</span>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <ResponsiveModalFooter className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
          <DashboardButton variant="secondary" size="md" onClick={onClose} disabled={isGenerating} className="text-xs">
            Batal
          </DashboardButton>
          <DashboardButton
            variant="primary"
            size="md"
            onClick={handleExport}
            disabled={isGenerating || rows.length === 0}
            className="text-xs"
          >
            {isGenerating ? "Mengekspor..." : "Generate Laporan"}
          </DashboardButton>
        </ResponsiveModalFooter>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
