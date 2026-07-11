"use client";

import Link from "next/link";
import { ChevronRight, Save } from "lucide-react";

interface CampaignWizardHeaderProps {
  onSaveDraft: () => void;
  onCancel: () => void;
}

export function CampaignWizardHeader({ onSaveDraft, onCancel }: CampaignWizardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 mb-6"
      style={{ borderBottom: "1px solid rgba(17,24,39,.08)" }}
    >
      {/* Left: breadcrumb + title */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 text-[.7rem] text-ink-400 font-[700] uppercase tracking-[.08em] mb-2.5">
          <Link href="/dashboard/umkm" className="hover:text-primary transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={10} className="text-ink-300 shrink-0" />
          <Link href="/dashboard/umkm/campaign" className="hover:text-primary transition-colors">
            Campaign Saya
          </Link>
          <ChevronRight size={10} className="text-ink-300 shrink-0" />
          <span className="text-ink-700 font-[800]">Buat Campaign</span>
        </div>

        {/* Section label */}
        <div className="inline-flex items-center gap-2 text-orange-600 text-[.72rem] font-[900] tracking-[.12em] uppercase mb-1.5">
          <span className="block w-[16px] h-0.5 rounded-full bg-orange-500 shrink-0" />
          Wizard Campaign
        </div>

        {/* Title */}
        <h2 className="font-display text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-[-0.065em] text-ink-950 m-0 mb-1.5 leading-none">
          Buat Campaign Baru
        </h2>
        <p className="text-ink-500 text-[.85rem] m-0 max-w-xl leading-relaxed">
          Buat campaign berbasis views, atur brief, aset, budget, dan kuota kreator dalam satu alur.
        </p>
      </div>

      {/* Right: action buttons */}
      <div className="flex items-center gap-2.5 shrink-0 self-start md:self-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center min-h-[38px] px-4 rounded-xl border border-neutral-200/80 bg-white text-ink-700 text-[.82rem] font-[700] shadow-3xs hover:bg-neutral-50 hover:-translate-y-px transition-all duration-150 cursor-pointer"
        >
          Kembali
        </button>
        <button
          type="button"
          onClick={onSaveDraft}
          className="inline-flex items-center gap-1.5 min-h-[38px] px-4 rounded-xl border border-orange-200/80 bg-orange-50 text-orange-700 text-[.82rem] font-[800] hover:bg-orange-100 hover:-translate-y-px transition-all duration-150 cursor-pointer"
        >
          <Save size={13} />
          Simpan Draft
        </button>
      </div>
    </div>
  );
}
