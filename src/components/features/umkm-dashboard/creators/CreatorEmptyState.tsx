"use client";

interface CreatorEmptyStateProps {
  onReset: () => void;
}

export function CreatorEmptyState({ onReset }: CreatorEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-border-strong/60 bg-white/40 p-12 text-center max-w-xl mx-auto my-8 space-y-4 shadow-2xs">
      <div className="h-12 w-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-text-muted">
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-extrabold text-text-primary">Kreator Tidak Ditemukan</h3>
        <p className="text-xs text-text-secondary max-w-sm mx-auto font-medium">
          Tidak ada kreator yang cocok dengan kata kunci pencarian atau kategori filter Anda.
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-600 text-white text-xs font-bold transition-colors cursor-pointer select-none border border-primary hover:border-primary-600 shadow-xs"
      >
        Reset Filter & Pencarian
      </button>
    </div>
  );
}
