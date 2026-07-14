"use client";

import { useState, useRef, useEffect } from "react";
import { CampaignStatus } from "@/types/umkm-dashboard.types";

interface CampaignActionMenuProps {
  status: CampaignStatus;
  onViewDetail: () => void;
  onDuplicate: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onExport?: () => void;
}

export function CampaignActionMenu({
  status,
  onViewDetail,
  onDuplicate,
  onEdit,
  onCancel,
  onExport,
}: CampaignActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isCancelDisabled = status === "completed" || status === "cancelled";
  const isEditVisible = status === "draft";

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-neutral-400 hover:text-primary transition-colors w-8 h-8 rounded-full hover:bg-neutral-50 flex items-center justify-center border border-neutral-100 bg-white cursor-pointer"
        aria-label="Menu Aksi"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-1 w-48 rounded-xl shadow-md bg-white border border-border-soft focus:outline-none z-30 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="py-1">
            <button
              onClick={() => {
                onViewDetail();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-text-primary hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              Lihat Detail
            </button>
            {isEditVisible && onEdit && (
              <button
                onClick={() => {
                  onEdit();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-text-primary hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                Edit Draft
              </button>
            )}
            <button
              onClick={() => {
                onDuplicate();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-xs font-bold text-text-primary hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              Duplikasi Campaign
            </button>
            {onExport && (
              <button
                onClick={() => {
                  onExport();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-text-primary hover:bg-neutral-50 transition-colors flex items-center gap-2 cursor-pointer"
              >
                Unduh Laporan
              </button>
            )}
            {!isCancelDisabled && onCancel && (
              <button
                onClick={() => {
                  onCancel();
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-bold text-danger hover:bg-danger-soft/30 transition-colors flex items-center gap-2 cursor-pointer"
              >
                Batalkan Campaign
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
