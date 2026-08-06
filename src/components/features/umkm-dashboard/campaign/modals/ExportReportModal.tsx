"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/responsive-modal";
import { Download } from "lucide-react";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: Record<string, unknown>[];
  filename: string;
}

export function ExportReportModal({ isOpen, onClose, rows, filename }: ExportReportModalProps) {
  const [formatType, setFormatType] = useState<"csv" | "excel">("excel");
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
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
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
      <ResponsiveModalContent className="max-w-md w-full p-6 rounded-2xl border border-neutral-200/80 bg-white shadow-xl">
        <ResponsiveModalHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-600 border border-orange-200/80 flex items-center justify-center mx-auto shadow-2xs mb-3">
            <Download className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <ResponsiveModalTitle className="text-base sm:text-lg font-extrabold text-ink-950 text-center">
            Unduh Laporan Hasil Kampanye
          </ResponsiveModalTitle>
          <ResponsiveModalDescription className="text-xs text-text-muted leading-relaxed text-center mt-1">
            {rows.length > 0
              ? `${rows.length} baris data siap diunduh. Pilih jenis file yang Anda inginkan.`
              : "Belum ada data untuk diunduh."}
          </ResponsiveModalDescription>
        </ResponsiveModalHeader>

        {/* Format Options */}
        <div className="my-5">
          <span className="block text-xs font-extrabold text-text-primary mb-2.5 uppercase tracking-wide">
            Pilihan Jenis File
          </span>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2.5 p-3.5 border rounded-xl cursor-pointer select-none bg-neutral-50 hover:bg-neutral-100 transition-all border-neutral-200/80">
              <input
                type="radio"
                name="format"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                checked={formatType === "excel"}
                onChange={() => setFormatType("excel")}
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-ink-950">File Excel (.xlsx)</span>
                <span className="text-[10px] text-text-muted mt-0.5 inline-block">Mudah dibuka di komputer</span>
              </div>
            </label>

            <label className="flex items-center gap-2.5 p-3.5 border rounded-xl cursor-pointer select-none bg-neutral-50 hover:bg-neutral-100 transition-all border-neutral-200/80">
              <input
                type="radio"
                name="format"
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 accent-orange-600 cursor-pointer"
                checked={formatType === "csv"}
                onChange={() => setFormatType("csv")}
              />
              <div className="text-left">
                <span className="block text-xs font-bold text-ink-950">File CSV (.csv)</span>
                <span className="text-[10px] text-text-muted mt-0.5 inline-block">Format mentah ringan</span>
              </div>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2.5 w-full pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-neutral-200/80 bg-white text-ink-950 text-xs font-bold shadow-2xs hover:bg-neutral-50 active:scale-[.98] transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={isGenerating || rows.length === 0}
            className="flex-1 min-h-[44px] px-4 rounded-full border border-orange-900/20 bg-gradient-to-b from-[#fb7a18] to-primary-600 text-white text-xs font-extrabold shadow-[0_10px_28px_rgba(234,88,12,.28),inset_0_1px_0_rgba(255,255,255,.22)] hover:shadow-[0_14px_36px_rgba(234,88,12,.36)] hover:-translate-y-px active:scale-[.98] transition-all cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
          >
            {isGenerating ? "Mengunduh…" : "Unduh Sekarang"}
          </button>
        </div>
      </ResponsiveModalContent>
    </ResponsiveModal>
  );
}
