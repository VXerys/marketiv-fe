"use client";

import { useState } from "react";
import { DashboardCard, DashboardButton } from "../../shared";

interface DuplicateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalTitle: string;
  onConfirm: (newTitle: string, options: { copyBrief: boolean; copyBudget: boolean; copyAssets: boolean }) => void;
}

export function DuplicateCampaignModal({
  isOpen,
  onClose,
  originalTitle,
  onConfirm,
}: DuplicateCampaignModalProps) {
  const [newTitle, setNewTitle] = useState(`${originalTitle} (Salinan)`);
  const [options, setOptions] = useState({
    copyBrief: true,
    copyBudget: true,
    copyAssets: true,
  });

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!newTitle.trim()) return;
    onConfirm(newTitle, options);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs transition-opacity duration-300">
      <DashboardCard variant="default" className="max-w-md w-full p-6 shadow-md animate-in fade-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold text-text-primary mb-2">Duplikasi Campaign</h3>
        <p className="text-sm text-text-secondary mb-4 leading-relaxed">
          Salin campaign ini untuk membuat campaign baru dengan pengaturan yang sama secara instan.
        </p>

        {/* Input New Title */}
        <div className="mb-4">
          <label htmlFor="new-title" className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">
            Nama Campaign Baru
          </label>
          <input
            type="text"
            id="new-title"
            className="w-full px-3.5 py-2.5 bg-neutral-50 text-sm text-text-primary border border-border-strong rounded-xl focus:outline-none focus:border-primary transition-colors"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
        </div>

        {/* Configuration Checkboxes */}
        <div className="space-y-3 mb-6 bg-neutral-50 p-4 rounded-xl border border-border-soft">
          <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
            Pengaturan Duplikasi
          </span>
          
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary accent-primary cursor-pointer border"
              checked={options.copyBrief}
              onChange={(e) => setOptions({ ...options, copyBrief: e.target.checked })}
            />
            <span className="text-xs text-text-secondary font-medium">Salin detail brief deskripsi</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary accent-primary cursor-pointer border"
              checked={options.copyBudget}
              onChange={(e) => setOptions({ ...options, copyBudget: e.target.checked })}
            />
            <span className="text-xs text-text-secondary font-medium">Salin kuota & harga per 1000 views</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-border-strong text-primary focus:ring-primary accent-primary cursor-pointer border"
              checked={options.copyAssets}
              onChange={(e) => setOptions({ ...options, copyAssets: e.target.checked })}
            />
            <span className="text-xs text-text-secondary font-medium">Salin tautan aset eksternal</span>
          </label>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3">
          <DashboardButton variant="secondary" size="md" onClick={onClose} className="text-xs">
            Batal
          </DashboardButton>
          <DashboardButton variant="primary" size="md" disabled={!newTitle.trim()} onClick={handleConfirm} className="text-xs">
            Duplikasi
          </DashboardButton>
        </div>
      </DashboardCard>
    </div>
  );
}
