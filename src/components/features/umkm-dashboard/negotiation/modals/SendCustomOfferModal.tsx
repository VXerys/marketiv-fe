"use client";

import { useState } from "react";

interface SendCustomOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (offer: { finalPrice: number; scope: string; deadline: string; revisionCount: number }) => void;
  creatorName: string;
}

export function SendCustomOfferModal({ isOpen, onClose, onConfirm, creatorName }: SendCustomOfferModalProps) {
  const [scope, setScope] = useState("1 Video Review Instagram Reels Collab Post + Raw Footage");
  const [price, setPrice] = useState(600000);
  const [deadline, setDeadline] = useState("2026-06-15");
  const [revisions, setRevisions] = useState(2);
  const [agreed, setAgreed] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) return;
    onConfirm({
      finalPrice: price,
      scope,
      deadline: new Date(deadline).toISOString(),
      revisionCount: revisions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-navy-main/40 backdrop-blur-xs" onClick={onClose} />
      
      {/* Container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-lg border border-neutral-200/50 overflow-hidden animate-in zoom-in-95 duration-200 select-none">
        
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-primary-50/20 to-white border-b border-border-subtle flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-text-primary uppercase tracking-wider">
              Kirim Custom Offer
            </h3>
            <p className="text-[10px] text-text-muted mt-0.5 font-semibold">
              Ajukan kontrak penawaran khusus ke {creatorName}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Scope input */}
          <div className="space-y-1.5">
            <label htmlFor="modal-scope" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Lingkup Pekerjaan (Scope) <span className="text-primary">*</span>
            </label>
            <textarea
              id="modal-scope"
              required
              rows={3}
              value={scope}
              onChange={(e) => setScope(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-50 border border-border-strong rounded-xl text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none leading-relaxed"
            />
          </div>

          {/* Pricing & Revisions grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="modal-price" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                Harga Penawaran <span className="text-primary">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-xs font-bold text-text-muted">Rp</span>
                <input
                  id="modal-price"
                  type="number"
                  required
                  min={10000}
                  value={price}
                  onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full pl-9 pr-3 py-2 bg-neutral-50 border border-border-strong rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="modal-revisions" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
                Batas Revisi
              </label>
              <input
                id="modal-revisions"
                type="number"
                min={0}
                value={revisions}
                onChange={(e) => setRevisions(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2 bg-neutral-50 border border-border-strong rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Deadline */}
          <div className="space-y-1.5">
            <label htmlFor="modal-deadline" className="block text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">
              Batas Waktu Deadline <span className="text-primary">*</span>
            </label>
            <input
              id="modal-deadline"
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3.5 py-2 bg-neutral-50 border border-border-strong rounded-xl text-xs font-bold text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            />
          </div>

          {/* Agreement Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer pt-2">
            <input
              type="checkbox"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary accent-primary cursor-pointer shrink-0"
            />
            <span className="text-[10px] text-text-secondary leading-relaxed font-semibold">
              Saya menyatakan bahwa rincian harga, deadline, dan lingkup deliverables di atas telah dinegosiasikan bersama dan disetujui secara informal dengan kreator.
            </span>
          </label>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3 border-t border-border-soft">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-text-secondary text-xs font-bold transition-all duration-200 cursor-pointer select-none text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!agreed}
              className="flex-1 py-2.5 rounded-xl bg-primary disabled:opacity-50 hover:bg-primary-600 text-white text-xs font-bold transition-all duration-200 cursor-pointer border border-primary disabled:border-neutral-200 hover:border-primary-600 shadow-xs text-center select-none"
            >
              Kirim Penawaran
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
