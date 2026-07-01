"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/formatters";

interface StartNegotiationModalProps {
  isOpen: boolean;
  onClose: () => void;
  creatorName: string;
  packageName: string;
  packagePrice: string; // e.g. "Rp. 1.5 Jt" or similar string
}

export function StartNegotiationModal({
  isOpen,
  onClose,
  creatorName,
  packageName,
  packagePrice,
}: StartNegotiationModalProps) {
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [customPrice, setCustomPrice] = useState(1500000);
  const [targetViews, setTargetViews] = useState(50000);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const mockCampaigns = [
    { id: "c1", title: "Review Keripik Tempe Renyah Sunda (DRAFT)" },
    { id: "c2", title: "Video Promosi Sambal Pedas Sukabumi" },
    { id: "c3", title: "Launch Gamis Modern Lebaran 2026" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate sending offer and locking escrow mockup
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-navy-main/40 backdrop-blur-xs" onClick={onClose} />
        
        {/* Content */}
        <div className="relative w-full max-w-md bg-white rounded-3xl p-6 text-center space-y-4 shadow-lg border border-neutral-200/50 animate-in zoom-in-95 duration-200">
          <div className="h-14 w-14 rounded-full bg-success-soft text-success flex items-center justify-center mx-auto text-xl shadow-xs">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-sm sm:text-base font-extrabold text-text-primary">Tawaran Berhasil Dikirim!</h3>
            <p className="text-xs text-text-secondary leading-relaxed font-medium">
              Negosiasi untuk paket <strong className="text-text-primary">{packageName}</strong> telah dikirim ke <strong className="text-text-primary">{creatorName}</strong>. Halaman akan dialihkan ke ruang negosiasi chat.
            </p>
          </div>

          <div className="bg-neutral-50 border border-neutral-100 rounded-xl p-3.5 text-left text-[10px] space-y-1.5">
            <div className="flex justify-between font-semibold">
              <span className="text-text-muted">Nilai Penawaran:</span>
              <span className="text-text-primary font-bold">{formatCurrency(customPrice)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-text-muted">Target Views:</span>
              <span className="text-text-primary font-bold">{targetViews.toLocaleString("id-ID")} Views</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              // Redirect mockup link
              window.location.href = "/dashboard/umkm/negosiasi/rc-offer-simulated";
            }}
            className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs border border-primary hover:border-primary-600"
          >
            Masuk ke Ruang Negosiasi Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-main/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Content */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-lg border border-neutral-200/50 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-primary-50/30 to-white border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wider">
              Kirim Penawaran Kolaborasi
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-semibold">
              Negosiasi Rate Card Premium dengan {creatorName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text-primary transition-colors cursor-pointer select-none p-1 rounded-lg hover:bg-neutral-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Selected Package Badge */}
          <div className="rounded-xl bg-primary-50/20 border border-primary-100/30 p-3 flex justify-between items-center text-xs font-bold">
            <div className="space-y-0.5">
              <span className="text-[9px] text-primary uppercase block tracking-wider">Paket Terpilih</span>
              <span className="text-text-primary text-[11px]">{packageName}</span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-text-muted uppercase block tracking-wider">Harga Acuan</span>
              <span className="text-primary text-[11px] font-extrabold">{packagePrice}</span>
            </div>
          </div>

          {/* Campaign Selection */}
          <div className="space-y-1.5">
            <label htmlFor="select-campaign" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Pilih Campaign Draft <span className="text-primary">*</span>
            </label>
            <select
              id="select-campaign"
              required
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-3 py-2.5 bg-neutral-50 border border-border-strong rounded-xl text-xs font-semibold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer"
            >
              <option value="">-- Pilih draf brief / campaign --</option>
              {mockCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <p className="text-[9px] text-text-muted leading-tight font-medium">
              Pilih brief campaign yang telah Anda buat untuk digunakan dalam penawaran ini.
            </p>
          </div>

          {/* Pricing Custom Offer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="offer-price" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                Harga Penawaran (Rupiah) <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-text-muted">Rp</span>
                <input
                  id="offer-price"
                  type="number"
                  required
                  min={100000}
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-border-strong rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="offer-views" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                Target Tayangan (Views) <span className="text-primary">*</span>
              </label>
              <input
                id="offer-views"
                type="number"
                required
                min={1000}
                value={targetViews}
                onChange={(e) => setTargetViews(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-border-strong rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Requirements/Notes */}
          <div className="space-y-1.5">
            <label htmlFor="offer-notes" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Instruksi Tambahan & Catatan
            </label>
            <textarea
              id="offer-notes"
              rows={3}
              placeholder="Contoh: Kami ingin fokus review di fitur kemasan portabel kami. Gaya video natural santai..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-border-strong rounded-xl text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed"
            />
            <p className="text-[9px] text-text-muted leading-tight font-medium">
              Jelaskan ekspektasi khusus Anda mengenai penawaran di luar detail draf brief campaign.
            </p>
          </div>

          {/* Escrow Disclaimer Alert */}
          <div className="rounded-xl bg-amber-50/20 border border-neutral-200/50 p-3.5 relative overflow-hidden flex gap-3 items-start">
            <span className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 text-xs font-bold">
              !
            </span>
            <div className="min-w-0">
              <span className="block text-[10px] font-extrabold text-text-primary leading-tight">
                Ketentuan Dana Escrow Negosiasi
              </span>
              <span className="block text-[9px] text-text-muted mt-1 leading-relaxed font-semibold">
                Setelah kreator setuju, Anda wajib mendepositkan dana escrow sesuai harga deal sebelum pengerjaan dimulai. Dana aman di Marketiv dan dilepaskan setelah Collab Post URL dikirim.
              </span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-text-secondary text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 select-none text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 select-none border border-primary hover:border-primary-600 shadow-xs flex items-center justify-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Mengirim Tawaran...</span>
                </>
              ) : (
                <span>Kirim Tawaran Negosiasi</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
