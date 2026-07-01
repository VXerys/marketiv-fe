"use client";

import { useState } from "react";
import { DashboardCard, DashboardButton } from "../../shared";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportReportModal({ isOpen, onClose }: ExportReportModalProps) {
  const [reportType, setReportType] = useState("summary");
  const [formatType, setFormatType] = useState("csv");
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    setIsGenerating(true);
    // Simulate generation delay
    setTimeout(() => {
      setIsGenerating(false);
      onClose();
      // Trigger a direct dummy file download simulation
      const blob = new Blob(["id,judul,views,status\n1,Sambal Matah,184200,Aktif\n2,Nasi Sehat,88500,Aktif"], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Laporan_Kemajuan_${reportType}_Marketiv.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <DashboardCard variant="default" className="max-w-md w-full p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-text-primary mb-2">Export Laporan Kemajuan</h3>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          Pilih tipe data dan format laporan kemajuan P2MW 2025 yang ingin Anda ekspor dari sistem.
        </p>

        {/* Report Type Select */}
        <div className="mb-4">
          <label htmlFor="report-type" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Tipe Data Laporan
          </label>
          <select
            id="report-type"
            className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm text-text-primary border border-border-strong rounded-xl focus:outline-none focus:border-primary transition-colors cursor-pointer"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="summary">Ringkasan Campaign & Views (P2MW)</option>
            <option value="views">Performa Konten & Views Kreator</option>
            <option value="submissions">Bukti Tayang & URL Submissions</option>
            <option value="escrow">Catatan Mutasi Transaksi Escrow</option>
          </select>
        </div>

        {/* Format Options */}
        <div className="mb-6">
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
        <div className="flex items-center justify-end gap-3 border-t border-border-soft pt-4">
          <DashboardButton variant="secondary" size="md" onClick={onClose} disabled={isGenerating} className="text-xs">
            Batal
          </DashboardButton>
          <DashboardButton variant="primary" size="md" onClick={handleExport} disabled={isGenerating} className="text-xs">
            {isGenerating ? "Mengekspor..." : "Generate Laporan"}
          </DashboardButton>
        </div>
      </DashboardCard>
    </div>
  );
}
